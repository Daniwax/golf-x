import React, { useState, useEffect, useCallback } from 'react';
import { dataService } from '../../services/data/DataService';
import { getCurrentUserId } from '../../lib/friends';
import { ScoringEngine, type ScoringMethod, type Scorecard as EngineScorecard, type LeaderboardResult } from '../../features/normal-game/engines/ScoringEngine';

// Define scoring methods to test
const SCORING_METHODS = {
  stroke_play: {
    name: 'Stroke Play',
    description: 'Traditional - Lowest total score wins'
  },
  stableford: {
    name: 'Stableford',
    description: 'Points based - Par=2, Birdie=3, Eagle=4'
  },
  match_play: {
    name: 'Match Play',
    description: 'Hole by hole - Most holes won'
  },
  skins: {
    name: 'Skins',
    description: 'Win hole outright for points'
  }
};

// Types
interface CompletedGame {
  id: string;
  name: string;
  date: string;
  courseId: number;
  totalStrokes: number;
  participants: number;
}

interface Scorecard {
  gameId: string;
  userId: string;
  playerName: string;
  holes: HoleScore[];
  totalStrokes: number;
  totalPutts: number;
}

interface HoleScore {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number;
  strokeIndex: number;
  playerMatchPar?: number; // Player's personal par based on handicap
}

// LeaderboardEntry interface - commented out as it's not currently used
// interface LeaderboardEntry {
//   position: number;
//   playerId: string;
//   playerName: string;
//   score: number | string; // Could be strokes, points, or match play result
//   details?: Record<string, unknown>; // Method-specific details
// }

const ScoringEngineTest: React.FC = () => {
  // State
  const [, setCurrentUserId] = useState<string | null>(null);
  const [completedGames, setCompletedGames] = useState<CompletedGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedScoringMethod, setSelectedScoringMethod] = useState<string>('stroke_play');
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load initial data
  useEffect(() => {
    loadUserAndGames();
  }, []);

  // Load scorecards when game is selected
  useEffect(() => {
    if (selectedGameId) {
      loadScorecards(selectedGameId);
    }
  }, [selectedGameId]);

  // Define calculateLeaderboard before useEffect that uses it
  const calculateLeaderboard = useCallback(() => {
    if (scorecards.length === 0) {
      setLeaderboard(null);
      return;
    }

    console.log(`Calculating leaderboard for ${selectedScoringMethod} with ${scorecards.length} scorecards`);
    
    // Check if any scorecard has player match par (indicating handicap game)
    const hasHandicap = scorecards.some(card => 
      card.holes.some(h => h.playerMatchPar && h.playerMatchPar !== h.par)
    );
    
    // Convert scorecards to ScoringEngine format
    const engineScorecards: EngineScorecard[] = scorecards.map(card => {
      // Update holes to use player match par when available
      const adjustedHoles = card.holes.map(hole => ({
        ...hole,
        // If handicap game, replace standard par with player match par
        par: hasHandicap && hole.playerMatchPar ? hole.playerMatchPar : hole.par
      }));
      
      return {
        gameId: card.gameId,
        userId: card.userId,
        playerName: card.playerName,
        holes: adjustedHoles,
        totalStrokes: card.totalStrokes,
        totalPutts: card.totalPutts,
        courseHandicap: 0, // Not needed as we're using player match par directly
        playingHandicap: 0  // Not needed as we're using player match par directly
      };
    });
    
    // Calculate leaderboard using ScoringEngine
    // When using player match par, handicap is already built into the par values
    const leaderboardResult = ScoringEngine.calculateLeaderboard(
      engineScorecards,
      selectedScoringMethod as ScoringMethod,
      false // Handicap is handled via player match par
    );
    
    setLeaderboard(leaderboardResult);
  }, [scorecards, selectedScoringMethod]);

  // Recalculate leaderboard when scoring method or scorecards change
  useEffect(() => {
    if (scorecards.length > 0) {
      calculateLeaderboard();
    }
  }, [selectedScoringMethod, scorecards, calculateLeaderboard]);

  const loadUserAndGames = async () => {
    setLoading(true);
    try {
      // Get current user
      const userId = await getCurrentUserId();
      if (userId) {
        setCurrentUserId(userId);
        
        // Load completed games
        const games = await dataService.games.getUserCompletedGames(userId);
        
        // Format for display
        const formattedGames: CompletedGame[] = games.map(g => ({
          id: g.id,
          name: g.name || `Game ${g.id.slice(0, 8)}`,
          date: g.date,
          courseId: g.courseId,
          totalStrokes: g.totalStrokes || 0,
          participants: 1 // Will be updated when we load full game
        }));
        
        setCompletedGames(formattedGames);
        
        // Auto-select first game if available
        if (formattedGames.length > 0) {
          setSelectedGameId(formattedGames[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const loadScorecards = async (gameId: string) => {
    setLoading(true);
    setError('');
    try {
      // Load game participants using the service method
      const participants = await dataService.games.getGameParticipants(gameId);
      
      // Load hole scores for the game
      const holeScores = await dataService.games.getGameHoleScores(gameId);
      
      // Load course holes for stroke index
      const gameDetails = await dataService.games.getGameById(gameId);
      if (!gameDetails || !gameDetails.game) {
        throw new Error('Game not found');
      }
      const holes = await dataService.courses.getCourseHoles(gameDetails.game.course_id);
      
      // Build scorecards for each participant
      const cards: Scorecard[] = [];
      
      for (const participant of participants) {
        const playerScores = holeScores.filter(hs => hs.user_id === participant.user_id);
        
        const holeData: HoleScore[] = playerScores.map(score => {
          const hole = holes.find(h => h.hole_number === score.hole_number);
          return {
            holeNumber: score.hole_number,
            par: score.hole_par,
            strokes: score.strokes || 0,
            putts: score.putts || 0,
            strokeIndex: hole?.handicap_index || 0,
            playerMatchPar: score.player_match_par // Get player's personal par if handicap was applied
          };
        }).sort((a, b) => a.holeNumber - b.holeNumber);
        
        cards.push({
          gameId,
          userId: participant.user_id,
          playerName: participant.profiles?.full_name || participant.profiles?.email || 'Player',
          holes: holeData,
          totalStrokes: participant.total_strokes || 0,
          totalPutts: participant.total_putts || 0
        });
      }
      
      setScorecards(cards);
      
      // Update participant count
      setCompletedGames(prev => prev.map(g => 
        g.id === gameId ? { ...g, participants: cards.length } : g
      ));
    } catch (err) {
      console.error('Error loading scorecards:', err);
      setError('Failed to load scorecards');
      setScorecards([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#e0e0e0', minHeight: '100vh' }}>
      <h1 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '24px' }}>Scoring Engine Test</h1>
      
      {/* Controls Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {/* Game Selector */}
        <div style={{ flex: '1', border: '1px solid #444', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 15px 0', fontSize: '16px' }}>Select Game</h3>
          
          <select 
            value={selectedGameId || ''} 
            onChange={(e) => setSelectedGameId(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              backgroundColor: '#fff', 
              color: '#000', 
              border: '1px solid #555',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {completedGames.length === 0 ? (
              <option value="">No completed games found</option>
            ) : (
              completedGames.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name} - {game.date} ({game.totalStrokes} strokes, {game.participants} players)
                </option>
              ))
            )}
          </select>
          
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
            {completedGames.length} completed games available
          </div>
        </div>
        
        {/* Scoring Method Selector */}
        <div style={{ flex: '1', border: '1px solid #444', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 15px 0', fontSize: '16px' }}>Scoring Method</h3>
          
          <select 
            value={selectedScoringMethod} 
            onChange={(e) => setSelectedScoringMethod(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              backgroundColor: '#fff', 
              color: '#000', 
              border: '1px solid #555',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {Object.entries(SCORING_METHODS).map(([key, method]) => (
              <option key={key} value={key}>
                {method.name}
              </option>
            ))}
          </select>
          
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
            {SCORING_METHODS[selectedScoringMethod as keyof typeof SCORING_METHODS]?.description}
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: '#3a1a1a', 
          border: '1px solid #ff6b6b',
          borderRadius: '4px',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}
      
      {/* Scoring Rules Summary */}
      {selectedScoringMethod && (
        <div style={{ 
          marginBottom: '20px', 
          border: '1px solid #444', 
          padding: '15px', 
          backgroundColor: '#2a2a2a', 
          borderRadius: '4px' 
        }}>
          <h3 style={{ color: '#4a9eff', margin: '0 0 10px 0', fontSize: '14px' }}>
            {SCORING_METHODS[selectedScoringMethod as keyof typeof SCORING_METHODS]?.name} Rules Applied
          </h3>
          <div style={{ fontSize: '13px', color: '#e0e0e0', lineHeight: '1.6' }}>
            {selectedScoringMethod === 'stroke_play' && (
              <>
                <strong>How it works:</strong> Count every stroke taken. Lowest total score wins.
                <br />
                <strong>Scoring:</strong> Total strokes for all holes played. 
                <br />
                <strong>Display:</strong> Shows strokes and score relative to par (e.g., -2, E, +5).
                <br />
                <strong>Tiebreaker:</strong> Back 9 score (lowest wins).
              </>
            )}
            {selectedScoringMethod === 'stableford' && (
              <>
                <strong>How it works:</strong> Earn points based on your score per hole. Highest points wins.
                <br />
                <strong>Points System:</strong> 
                <span style={{ color: '#4af' }}> Eagle: 4pts</span>,
                <span style={{ color: '#4f4' }}> Birdie: 3pts</span>,
                <span style={{ color: '#fff' }}> Par: 2pts</span>,
                <span style={{ color: '#fa4' }}> Bogey: 1pt</span>,
                <span style={{ color: '#f44' }}> Double+: 0pts</span>
                <br />
                <strong>Strategy:</strong> Rewards aggressive play - no penalty for high scores.
                <br />
                <strong>Best for:</strong> High handicappers and windy conditions.
              </>
            )}
            {selectedScoringMethod === 'match_play' && (
              <>
                <strong>How it works:</strong> Win, lose, or tie each hole individually. Most holes won wins the match.
                <br />
                <strong>Scoring:</strong> {scorecards.length === 2 
                  ? "Head-to-head - track holes won/lost. Match can end early if mathematically decided."
                  : "Round-robin format - each player faces all others, 2pts for win, 1pt for tie."}
                <br />
                <strong>Display:</strong> {scorecards.length === 2 
                  ? "Shows match status (e.g., '2 up', 'All Square', 'Won 3&2')."
                  : "Shows total points and W-L-T record."}
                <br />
                <strong>Note:</strong> Total strokes don't matter - only individual hole results.
              </>
            )}
            {selectedScoringMethod === 'skins' && (
              <>
                <strong>How it works:</strong> Win a hole outright to claim the "skin". Ties carry over to next hole.
                <br />
                <strong>Scoring:</strong> Each hole starts worth 1 skin. If tied, value carries to next hole.
                <br />
                <strong>Carryovers:</strong> Multiple tied holes create high-value opportunities.
                <br />
                <strong>Example:</strong> If holes 1-3 are tied, hole 4 is worth 4 skins to the winner.
                <br />
                <strong>Strategy:</strong> One great hole can win multiple skins. Creates drama!
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Scorecards Display */}
      {scorecards.length > 0 && (
        <div style={{ marginBottom: '30px', border: '1px solid #444', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 15px 0', fontSize: '16px' }}>
            Scorecards ({scorecards.length} players)
            {scorecards.some(card => card.holes.some(h => h.playerMatchPar && h.playerMatchPar !== h.par)) && (
              <span style={{ 
                marginLeft: '15px', 
                padding: '3px 8px', 
                backgroundColor: '#2a4a5a', 
                color: '#4a9eff', 
                fontSize: '12px', 
                borderRadius: '3px'
              }}>
                HANDICAP APPLIED - Using Player Match Par
              </span>
            )}
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#333' }}>
                  <th style={{ border: '1px solid #555', padding: '8px', color: '#fff', textAlign: 'left' }}>Player</th>
                  {[...Array(18)].map((_, i) => (
                    <th key={i} style={{ border: '1px solid #555', padding: '5px', color: '#fff', textAlign: 'center', minWidth: '30px' }}>
                      {i + 1}
                    </th>
                  ))}
                  <th style={{ border: '1px solid #555', padding: '8px', color: '#fff', textAlign: 'center' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {scorecards.map((card, playerIdx) => (
                  <React.Fragment key={card.userId}>
                    {/* Par Row (only show once) */}
                    {playerIdx === 0 && (
                      <tr style={{ backgroundColor: '#1a1a1a' }}>
                        <td style={{ border: '1px solid #555', padding: '8px', color: '#999', fontSize: '12px' }}>Course Par</td>
                        {[...Array(18)].map((_, i) => {
                          const hole = card.holes[i];
                          return (
                            <td key={i} style={{ border: '1px solid #555', padding: '5px', color: '#999', textAlign: 'center', fontSize: '12px' }}>
                              {hole?.par || '-'}
                            </td>
                          );
                        })}
                        <td style={{ border: '1px solid #555', padding: '8px', color: '#999', textAlign: 'center', fontSize: '12px' }}>
                          {card.holes.reduce((sum, h) => sum + h.par, 0)}
                        </td>
                      </tr>
                    )}
                    
                    {/* Player Match Par Row (show for ALL players if ANY player has handicap) */}
                    {scorecards.some(sc => sc.holes.some(h => h.playerMatchPar && h.playerMatchPar !== h.par)) && (
                      <tr style={{ backgroundColor: '#2a3a4a' }}>
                        <td style={{ border: '1px solid #555', padding: '6px', color: '#4a9eff', fontSize: '11px' }}>
                          {card.playerName} Par
                        </td>
                        {[...Array(18)].map((_, i) => {
                          const hole = card.holes[i];
                          const pmp = hole?.playerMatchPar;
                          const hasHandicap = pmp && pmp !== hole?.par;
                          return (
                            <td key={i} style={{ 
                              border: '1px solid #555', 
                              padding: '5px', 
                              color: hasHandicap ? '#4a9eff' : '#666', 
                              textAlign: 'center', 
                              fontSize: '11px',
                              fontWeight: hasHandicap ? 'bold' : 'normal'
                            }}>
                              {pmp || hole?.par || '-'}
                            </td>
                          );
                        })}
                        <td style={{ 
                          border: '1px solid #555', 
                          padding: '6px', 
                          color: '#4a9eff', 
                          textAlign: 'center', 
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {card.holes.reduce((sum, h) => sum + (h.playerMatchPar || h.par), 0)}
                        </td>
                      </tr>
                    )}
                    
                    {/* Player Score Row */}
                    <tr style={{ backgroundColor: playerIdx % 2 === 0 ? '#222' : '#1a1a1a' }}>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0' }}>
                        {card.playerName}
                      </td>
                      {[...Array(18)].map((_, i) => {
                        const hole = card.holes[i];
                        // Use player match par if available, otherwise use standard par
                        const effectivePar = hole?.playerMatchPar || hole?.par || 0;
                        const scoreDiff = hole ? hole.strokes - effectivePar : 0;
                        let bgColor = 'transparent';
                        if (hole) {
                          if (scoreDiff <= -2) bgColor = '#2a5a2a'; // Eagle or better (relative to player's par)
                          else if (scoreDiff === -1) bgColor = '#2a4a5a'; // Birdie (relative to player's par)
                          else if (scoreDiff === 0) bgColor = 'transparent'; // Par (relative to player's par)
                          else if (scoreDiff === 1) bgColor = '#5a3a3a'; // Bogey (relative to player's par)
                          else if (scoreDiff >= 2) bgColor = '#6a3a3a'; // Double or worse (relative to player's par)
                        }
                        
                        return (
                          <td key={i} style={{ 
                            border: '1px solid #555', 
                            padding: '5px', 
                            color: '#e0e0e0', 
                            textAlign: 'center',
                            backgroundColor: bgColor,
                            fontSize: '13px'
                          }}>
                            {hole?.strokes || '-'}
                          </td>
                        );
                      })}
                      <td style={{ 
                        border: '1px solid #555', 
                        padding: '8px', 
                        color: '#fff', 
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        {card.totalStrokes}
                      </td>
                    </tr>
                    
                    {/* Score vs Personal Par Row */}
                    <tr style={{ backgroundColor: '#1a3a1a', borderTop: '2px solid #4f4' }}>
                      <td style={{ border: '1px solid #555', padding: '6px', color: '#7f7', fontSize: '12px' }}>
                        vs Personal Par
                      </td>
                      {[...Array(18)].map((_, i) => {
                        const hole = card.holes[i];
                        if (!hole) return <td key={i} style={{ border: '1px solid #555', padding: '5px', textAlign: 'center', fontSize: '11px' }}>-</td>;
                        
                        const personalPar = hole.playerMatchPar || hole.par;
                        const diff = hole.strokes - personalPar;
                        const displayDiff = diff === 0 ? 'E' : (diff > 0 ? `+${diff}` : diff.toString());
                        
                        return (
                          <td key={i} style={{ 
                            border: '1px solid #555', 
                            padding: '5px', 
                            textAlign: 'center', 
                            fontSize: '11px',
                            color: diff < 0 ? '#4f4' : diff > 0 ? '#f88' : '#7f7',
                            fontWeight: diff !== 0 ? 'bold' : 'normal'
                          }}>
                            {displayDiff}
                          </td>
                        );
                      })}
                      <td style={{ 
                        border: '1px solid #555', 
                        padding: '6px', 
                        color: '#7f7', 
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {(() => {
                          const personalPar = card.holes.reduce((sum, h) => sum + (h.playerMatchPar || h.par), 0);
                          const diff = card.totalStrokes - personalPar;
                          return `(${card.totalStrokes} - ${personalPar}) = ${diff > 0 ? '+' : ''}${diff}`;
                        })()}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Leaderboard Display */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <div style={{ border: '1px solid #444', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 15px 0', fontSize: '16px' }}>
            Leaderboard - {leaderboard.metadata.scoringName}
            <span style={{ 
              marginLeft: '15px', 
              padding: '3px 8px', 
              backgroundColor: leaderboard.metadata.sortDirection === 'asc' ? '#3a2a2a' : '#2a3a2a', 
              color: leaderboard.metadata.sortDirection === 'asc' ? '#f88' : '#8f8', 
              fontSize: '12px', 
              borderRadius: '3px'
            }}>
              {leaderboard.metadata.sortDirection === 'asc' ? '↓ Lower is Better' : '↑ Higher is Better'}
            </span>
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#333' }}>
                <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center', width: '60px' }}>Pos</th>
                <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'left' }}>Player</th>
                <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center', width: '120px' }}>
                  {selectedScoringMethod === 'stroke_play' ? 'Score' :
                   selectedScoringMethod === 'stableford' ? 'Points' :
                   selectedScoringMethod === 'match_play' ? 'Points' :
                   selectedScoringMethod === 'skins' ? 'Skins' : 'Score'}
                </th>
                <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center', width: '100px' }}>
                  Strokes
                </th>
                <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center', width: '80px' }}>
                  vs Par
                </th>
                <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'left' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.entries.map((entry, idx) => {
                // Get the scorecard for this player to access stroke data
                const scorecard = scorecards.find(s => s.userId === entry.playerId);
                const personalPar = scorecard ? scorecard.holes.reduce((sum, h) => sum + (h.playerMatchPar || h.par), 0) : 0;
                const scoreDiff = scorecard ? scorecard.totalStrokes - personalPar : 0;
                const scoreVsPar = scoreDiff === 0 ? 'E' : scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`;
                
                return (
                  <tr key={entry.playerId} style={{ backgroundColor: idx % 2 === 0 ? '#222' : '#1a1a1a' }}>
                    <td style={{ 
                      border: '1px solid #555', 
                      padding: '10px', 
                      color: entry.position <= 3 ? '#ffd700' : '#e0e0e0',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {entry.position}
                    </td>
                    <td style={{ border: '1px solid #555', padding: '10px', color: '#e0e0e0', fontSize: '14px' }}>
                      {entry.playerName}
                    </td>
                    <td style={{ 
                      border: '1px solid #555', 
                      padding: '10px', 
                      color: '#fff', 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '24px'
                    }}>
                      {entry.score}
                    </td>
                    <td style={{ 
                      border: '1px solid #555', 
                      padding: '10px', 
                      textAlign: 'center',
                      fontSize: '16px',
                      color: '#e0e0e0'
                    }}>
                      {scorecard?.totalStrokes || entry.details?.grossScore || '-'}
                    </td>
                    <td style={{ 
                      border: '1px solid #555', 
                      padding: '10px', 
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: scoreVsPar === 'E' ? '#fff' : 
                             scoreVsPar.startsWith('+') ? '#f88' : '#8f8'
                    }}>
                      {scoreVsPar}
                    </td>
                    <td style={{ 
                      border: '1px solid #555', 
                      padding: '10px', 
                      color: '#999', 
                      fontSize: '12px'
                    }}>
                      {selectedScoringMethod === 'stroke_play' && entry.details && (
                        <div>
                          <div>{entry.details.holesPlayed} holes played</div>
                          <div style={{ color: '#7f7', marginTop: '4px' }}>
                            Personal Par: {personalPar}
                          </div>
                          {entry.details.netScore !== entry.details.grossScore && (
                            <div style={{ color: '#4a9eff', marginTop: '4px' }}>
                              Net Score: {entry.details.netScore}
                            </div>
                          )}
                        </div>
                      )}
                    {selectedScoringMethod === 'stableford' && entry.details && (
                      <div>
                        {entry.details.holesPlayed} holes played
                        <div style={{ marginTop: '4px' }}>
                          Gross: {entry.details.grossScore}
                        </div>
                      </div>
                    )}
                    {selectedScoringMethod === 'match_play' && entry.details && (
                      <div>
                        {entry.details.record ? (
                          <>
                            Record: {entry.details.record}
                            <div style={{ marginTop: '4px', color: '#4a9eff' }}>
                              Status: {entry.details.matchStatus || 'In Progress'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div>W:{entry.details.holesWon} L:{entry.details.holesLost} T:{entry.details.holesTied}</div>
                            <div style={{ marginTop: '4px', color: '#4a9eff' }}>
                              {entry.details.matchStatus}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {selectedScoringMethod === 'skins' && entry.details && (
                      <div>
                        {entry.details.holesWon?.length > 0 ? (
                          <>
                            Won holes: {entry.details.holesWon.join(', ')}
                            {entry.details.skinValues && entry.details.skinValues.some(sv => sv.value > 1) && (
                              <div style={{ marginTop: '4px', color: '#ffd700' }}>
                                Carryovers: {entry.details.skinValues
                                  .filter(sv => sv.value > 1)
                                  .map(sv => `#${sv.hole}(${sv.value})`)
                                  .join(', ')}
                              </div>
                            )}
                          </>
                        ) : (
                          'No holes won'
                        )}
                      </div>
                    )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
            <details style={{ color: '#e0e0e0' }}>
              <summary style={{ cursor: 'pointer', color: '#4a9eff', fontWeight: 'bold', marginBottom: '10px' }}>
                📖 {leaderboard.metadata.scoringName} Rules & Strategy
              </summary>
              <div style={{ 
                marginTop: '10px', 
                fontSize: '13px', 
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {leaderboard.metadata.scoringDetails}
              </div>
            </details>
            <div style={{ fontSize: '12px', color: '#4a9eff', marginTop: '10px' }}>
              <strong>Scoring Engine Active:</strong> Full implementation with tiebreaker logic included.
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ color: '#fff', fontSize: '18px' }}>Loading...</div>
        </div>
      )}
    </div>
  );
};

export default ScoringEngineTest;
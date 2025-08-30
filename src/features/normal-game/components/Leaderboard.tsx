import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonIcon,
  IonBadge,
  IonSpinner
} from '@ionic/react';
import { 
  trophyOutline
} from 'ionicons/icons';
import type { Game, GameParticipant, GameHoleScore } from '../types';
import { supabase } from '../../../lib/supabase';
import { ScoringEngine, type ScoringMethod, type Scorecard as EngineScorecard, type LeaderboardResult } from '../engines/ScoringEngine';

interface LeaderboardProps {
  participants: GameParticipant[];
  scores: GameHoleScore[];
  game: Game;
  currentHole: number;
}

interface HoleInfo {
  hole_number: number;
  par: number;
  handicap_index: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  participants,
  scores,
  game,
  currentHole
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [holes, setHoles] = useState<HoleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHoleDataAndCalculateLeaderboard();
  }, [participants, scores, game]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHoleDataAndCalculateLeaderboard = async () => {
    try {
      setLoading(true);
      
      if (!supabase || !game) return;
      
      // Get hole data
      const { data: holeData } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', game.course_id)
        .order('hole_number');
        
      if (holeData) {
        // Filter holes based on game.num_holes if specified
        console.log('[Leaderboard] Loading holes:', {
          gameNumHoles: game.num_holes,
          totalHolesFromDB: holeData.length,
          holesBeforeFilter: holeData.map(h => h.hole_number)
        });
        
        const holesToUse = game.num_holes && game.num_holes < 18 
          ? holeData.slice(0, game.num_holes)
          : holeData;
        
        console.log('[Leaderboard] Holes after filter:', {
          holesToUseCount: holesToUse.length,
          holesAfterFilter: holesToUse.map(h => h.hole_number)
        });
        
        setHoles(holesToUse);
        
        // Check if any scorecard has player match par (indicating handicap game)
        const hasHandicap = scores.some(s => s.player_match_par && s.player_match_par !== s.hole_par);
        
        // Convert data to scoring engine format
        const scorecards = participants.map(participant => {
          const participantScores = scores.filter(s => s.user_id === participant.user_id);
          
          return {
            gameId: game.id,
            userId: participant.user_id,
            playerName: participant.profiles?.full_name || 'Unknown',
            holes: holesToUse.map(hole => {
              const holeScore = participantScores.find(s => s.hole_number === hole.hole_number);
              // If handicap game, use player match par as the par for this player
              const playerPar = hasHandicap && holeScore?.player_match_par ? 
                holeScore.player_match_par : hole.par;
              
              // For match play and skins, we need all holes even if not played yet
              // For stroke play and stableford, only count played holes
              const includeUnplayedHoles = game.scoring_method === 'match_play' || game.scoring_method === 'skins';
              
              if (!includeUnplayedHoles) {
                // Only include holes that have been played (strokes > 0)
                if (!holeScore || !holeScore.strokes || holeScore.strokes === 0) {
                  return null;
                }
              }
              
              return {
                holeNumber: hole.hole_number,
                par: playerPar, // Use adjusted par if handicap game
                strokes: holeScore?.strokes || 0, // Use 0 for unplayed holes in match play
                putts: holeScore?.putts || 0,
                strokeIndex: hole.handicap_index
              };
            }).filter(h => h !== null),
            totalStrokes: participantScores.reduce((sum, s) => sum + (s.strokes || 0), 0),
            totalPutts: participantScores.reduce((sum, s) => sum + (s.putts || 0), 0),
            courseHandicap: participant.course_handicap,
            playingHandicap: participant.playing_handicap
          };
        });

        // Calculate leaderboard using scoring engine
        const scoringMethod = game.scoring_method as ScoringMethod || 'stroke_play';
        // When using player match par, handicap is already built into the par values
        const leaderboardResult = ScoringEngine.calculateLeaderboard(scorecards, scoringMethod, false);
        
        setLeaderboard(leaderboardResult);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoringMethodDisplay = (method: string): string => {
    switch (method) {
      case 'stroke_play': return 'Score';
      case 'stableford': return 'Points';
      case 'match_play': return 'Points';
      case 'skins': return 'Skins';
      default: return 'Score';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (!leaderboard || leaderboard.entries.length === 0) {
    return (
      <IonCard>
        <IonCardContent>
          <IonNote>No leaderboard data available</IonNote>
        </IonCardContent>
      </IonCard>
    );
  }

  const tableStyles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '12px'
    },
    th: {
      padding: '8px 4px',
      textAlign: 'center' as const,
      fontWeight: '600',
      borderBottom: '2px solid var(--ion-color-light)',
      backgroundColor: 'var(--ion-color-light-tint)',
      fontSize: '11px'
    },
    td: {
      padding: '8px 4px',
      textAlign: 'center' as const,
      borderBottom: '1px solid var(--ion-color-light-shade)',
      fontSize: '12px'
    },
    positionCell: {
      fontWeight: '700',
      width: '40px',
      fontSize: '14px'
    },
    playerCell: {
      textAlign: 'left' as const,
      fontWeight: '600',
      minWidth: '80px'
    },
    scoreCell: {
      fontWeight: '700',
      fontSize: '16px',
      width: '60px'
    }
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <IonCard style={{ margin: '0', borderRadius: '0' }}>
        <IonCardHeader style={{ padding: '16px' }}>
          <IonCardTitle style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={trophyOutline} style={{ fontSize: '20px' }} />
            Leaderboard
            <IonBadge color="primary" style={{ fontSize: '10px', marginLeft: 'auto' }}>
              {leaderboard.metadata.sortDirection === 'asc' ? '↓ Lower is Better' : '↑ Higher is Better'}
            </IonBadge>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: '0', overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ ...tableStyles.th, ...tableStyles.positionCell }}>Pos</th>
                <th style={{ ...tableStyles.th, ...tableStyles.playerCell }}>Player</th>
                <th style={{ ...tableStyles.th, ...tableStyles.scoreCell }}>
                  {getScoringMethodDisplay(game.scoring_method || 'stroke_play')}
                </th>
                <th style={{ ...tableStyles.th, width: '50px' }}>Strokes</th>
                <th style={{ ...tableStyles.th, width: '50px' }}>vs Par</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.entries.map((entry, idx) => {
                // Get scorecard for additional data
                const participant = participants.find(p => p.user_id === entry.playerId);
                const participantScores = scores.filter(s => s.user_id === entry.playerId);
                const totalStrokes = participantScores.reduce((sum, s) => sum + (s.strokes || 0), 0);
                const holesPlayed = participantScores.filter(s => s.strokes && s.strokes > 0).length;
                
                // Calculate personal par (using player_match_par if available)
                // Only count holes that have been played
                const playedScores = participantScores.filter(s => s.strokes && s.strokes > 0);
                const personalPar = playedScores.reduce((sum, s) => {
                  // Use player_match_par if available, otherwise use hole_par
                  const par = s.player_match_par || s.hole_par || 0;
                  return sum + par;
                }, 0);
                
                // Only calculate vs par for played holes
                const playedStrokes = playedScores.reduce((sum, s) => sum + (s.strokes || 0), 0);
                const scoreDiff = playedStrokes - personalPar;
                const scoreVsPar = holesPlayed === 0 ? '-' :
                                  scoreDiff === 0 ? 'E' : 
                                  scoreDiff > 0 ? `+${scoreDiff}` : 
                                  `${scoreDiff}`;
                
                // Get display score based on scoring method
                let displayScore;
                if (game.scoring_method === 'stroke_play') {
                  // For stroke play, show the score vs par
                  displayScore = entry.details?.scoreVsPar || scoreVsPar;
                } else if (game.scoring_method === 'stableford') {
                  // For stableford, show total points
                  displayScore = entry.details?.totalPoints || entry.score;
                } else if (game.scoring_method === 'match_play') {
                  // For match play, show total points
                  displayScore = entry.details?.totalPoints || entry.score;
                } else if (game.scoring_method === 'skins') {
                  // For skins, show skins won
                  displayScore = entry.details?.skinsWon || entry.score;
                } else {
                  displayScore = entry.score;
                }

                return (
                  <tr key={entry.playerId} style={{ 
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--ion-color-light-tint)'
                  }}>
                    {/* Position */}
                    <td style={{ 
                      ...tableStyles.td, 
                      ...tableStyles.positionCell,
                      color: entry.position <= 3 ? 'var(--ion-color-warning)' : 'var(--ion-color-dark)'
                    }}>
                      {entry.position}
                    </td>
                    
                    {/* Player with details underneath */}
                    <td style={{ ...tableStyles.td, ...tableStyles.playerCell }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>
                          {entry.playerName}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--ion-color-medium)', marginTop: '2px' }}>
                          {game.scoring_method === 'stroke_play' && (
                            <>{holesPlayed} holes • PMP Par: {personalPar || entry.details?.totalPar}</>
                          )}
                          {game.scoring_method === 'stableford' && (
                            <>{entry.details?.holesPlayed || holesPlayed} holes • Gross: {entry.details?.grossScore || totalStrokes}</>
                          )}
                          {game.scoring_method === 'match_play' && entry.details && (
                            <>
                              {entry.details.matchStatus || 
                               `W:${entry.details.holesWon || 0} L:${entry.details.holesLost || 0} T:${entry.details.holesTied || 0}`}
                            </>
                          )}
                          {game.scoring_method === 'skins' && entry.details && (
                            <>
                              {entry.details.holesWon && entry.details.holesWon.length > 0 ? 
                                `Won holes: ${entry.details.holesWon.join(', ')}` : 
                                'No holes won yet'
                              }
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Score */}
                    <td style={{ ...tableStyles.td, ...tableStyles.scoreCell }}>
                      {displayScore}
                    </td>
                    
                    {/* Strokes */}
                    <td style={{ ...tableStyles.td, fontSize: '14px', fontWeight: '600' }}>
                      {totalStrokes || entry.details?.grossScore || '-'}
                    </td>
                    
                    {/* vs Par */}
                    <td style={{ 
                      ...tableStyles.td, 
                      fontSize: '13px', 
                      fontWeight: '700',
                      color: scoreVsPar === 'E' ? 'var(--ion-color-dark)' : 
                             scoreVsPar.startsWith('+') ? 'var(--ion-color-danger)' : 
                             scoreVsPar === '-' ? 'var(--ion-color-medium)' : 'var(--ion-color-success)'
                    }}>
                      {scoreVsPar}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Details Section */}
          <div style={{ padding: '16px', backgroundColor: 'var(--ion-color-light)', borderTop: '1px solid var(--ion-color-light-shade)' }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                Game Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontSize: '11px' }}>
                {leaderboard.entries.map((entry) => {
                  const participant = participants.find(p => p.user_id === entry.playerId);
                  const participantScores = scores.filter(s => s.user_id === entry.playerId);
                  
                  return (
                    <div key={entry.playerId} style={{ 
                      padding: '8px', 
                      backgroundColor: 'white', 
                      borderRadius: '4px',
                      border: '1px solid var(--ion-color-light-shade)'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}>
                        {entry.playerName}
                      </div>
                      
                      {/* Scoring method specific details */}
                      {game.scoring_method === 'stroke_play' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          <div>Holes: {entry.details.holesPlayed}</div>
                          <div>Net: {entry.details.netScore}</div>
                        </div>
                      )}
                      
                      {game.scoring_method === 'stableford' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          <div>Holes: {entry.details.holesPlayed}</div>
                          <div>Gross: {entry.details.grossScore}</div>
                        </div>
                      )}
                      
                      {game.scoring_method === 'match_play' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          {entry.details.record ? (
                            <div>Record: {entry.details.record}</div>
                          ) : (
                            <div>W:{entry.details.holesWon} L:{entry.details.holesLost} T:{entry.details.holesTied}</div>
                          )}
                        </div>
                      )}
                      
                      {game.scoring_method === 'skins' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          {entry.details.holesWon?.length > 0 ? (
                            <div>Won: {entry.details.holesWon.join(', ')}</div>
                          ) : (
                            <div>No holes won</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default Leaderboard;
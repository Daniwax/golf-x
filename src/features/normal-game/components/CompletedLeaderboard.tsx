import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonNote,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { 
  trophyOutline,
  flagOutline,
  starOutline
} from 'ionicons/icons';
import { ScoringEngine, type ScoringMethod, type LeaderboardResult } from '../engines/ScoringEngine';

interface CompletedLeaderboardProps {
  participants: Array<{
    user_id: string;
    game_id?: string;
    user_profile?: {
      id: string;
      full_name: string;
    };
    profiles?: {
      full_name: string;
    };
    course_handicap?: number;
    playing_handicap?: number;
    handicap_index?: number;
  }>;
  scores: Array<{
    user_id: string;
    hole_number: number;
    strokes: number;
    player_match_par?: number;
    hole_par?: number;
    putts?: number;
  }>;
  holes: Array<{
    hole_number: number;
    par: number;
    handicap: number;
    handicap_index?: number;
  }>;
  gameFormat: string;
}

const CompletedLeaderboard: React.FC<CompletedLeaderboardProps> = ({
  participants,
  scores,
  holes,
  gameFormat
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateLeaderboard();
  }, [participants, scores, holes, gameFormat]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateLeaderboard = () => {
    try {
      setLoading(true);
      
      if (!participants || participants.length === 0 || !holes || holes.length === 0) {
        setLeaderboard(null);
        return;
      }
      
      // Check if any scorecard has player match par (indicating handicap game)
      const hasHandicap = scores.some(s => s.player_match_par && s.player_match_par !== s.hole_par);
      
      // Convert data to scoring engine format
      const scorecards = participants.map(participant => {
        const participantScores = scores.filter(s => s.user_id === participant.user_id);
        
        return {
          gameId: participant.game_id || '',
          userId: participant.user_id,
          playerName: participant.profiles?.full_name || 'Unknown',
          holes: holes.map(hole => {
            const holeScore = participantScores.find(s => s.hole_number === hole.hole_number);
            // If handicap game, use player match par as the par for this player
            const playerPar = hasHandicap && holeScore?.player_match_par ? 
              holeScore.player_match_par : hole.par;
            
            // For match play and skins, we need all holes even if not played yet
            // For stroke play and stableford, only count played holes
            const includeUnplayedHoles = gameFormat === 'match_play' || gameFormat === 'skins';
            
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
      const scoringMethod = (gameFormat as ScoringMethod) || 'stroke_play';
      const includeHandicap = participants.some((p) => (p as { handicap_index?: number }).handicap_index && (p as { handicap_index?: number }).handicap_index! > 0);
      
      console.log(`🏆 CompletedLeaderboard calling ScoringEngine:`, {
        gameFormat,
        scoringMethod,
        includeHandicap,
        numPlayers: scorecards.length,
        engineScorecards: scorecards.map(scorecard => ({
          gameId: scorecard.gameId,
          userId: scorecard.userId,
          playerName: scorecard.playerName,
          totalStrokes: scorecard.totalStrokes,
          totalPutts: scorecard.totalPutts,
          courseHandicap: scorecard.courseHandicap,
          playingHandicap: scorecard.playingHandicap,
          holesCount: scorecard.holes.length,
          firstFewHoles: scorecard.holes.slice(0, 3).map(h => ({
            holeNumber: h.holeNumber,
            par: h.par,
            strokes: h.strokes,
            putts: h.putts,
            strokeIndex: h.strokeIndex
          }))
        }))
      });
      
      // When using player match par, handicap is already built into the par values
      const leaderboardResult = ScoringEngine.calculateLeaderboard(scorecards, scoringMethod, includeHandicap);
      
      console.log(`🏆 CompletedLeaderboard engine results:`, {
        totalEntries: leaderboardResult?.entries?.length || 0,
        allEntries: leaderboardResult?.entries?.map(entry => ({
          position: entry.position,
          playerId: entry.playerId,
          playerName: entry.playerName,
          score: entry.score,
          details: entry.details
        })) || [],
        scoringMetadata: leaderboardResult?.metadata || {}
      });
      
      setLeaderboard(leaderboardResult);
    } catch (error) {
      console.error('Error calculating leaderboard:', error);
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
      borderBottom: '2px solid #d4c4a0',
      backgroundColor: '#2a5434',
      color: '#f8f6f0',
      fontSize: '11px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase' as const
    },
    td: {
      padding: '8px 4px',
      textAlign: 'center' as const,
      borderBottom: '1px solid #e8e6e0',
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
      {/* Header - Matching Official Scorecard Style */}
      <div style={{
        background: 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
        padding: '20px 16px',
        borderRadius: '12px 12px 0 0',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Decorative pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.02) 10px,
            rgba(255, 255, 255, 0.02) 20px
          )`,
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <IonIcon 
              icon={trophyOutline} 
              style={{ 
                fontSize: '24px', 
                color: 'var(--champ-gold)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }} 
            />
            <h2 className="champ-font-display" style={{
              fontSize: '20px',
              color: 'var(--champ-cream)',
              margin: 0,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Final Leaderboard
            </h2>
            <IonIcon 
              icon={trophyOutline} 
              style={{ 
                fontSize: '24px', 
                color: 'var(--champ-gold)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }} 
            />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <IonIcon icon={flagOutline} style={{ fontSize: '16px', color: 'var(--champ-gold)' }} />
              <span className="champ-font-sans" style={{
                color: 'var(--champ-cream)',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {leaderboard.entries.length} Players
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              borderRadius: '20px',
              border: '1px solid var(--champ-gold)',
              backdropFilter: 'blur(10px)'
            }}>
              <IonIcon icon={starOutline} style={{ fontSize: '16px', color: 'var(--champ-gold)' }} />
              <span className="champ-font-sans" style={{
                color: 'var(--champ-cream)',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {leaderboard.metadata.sortDirection === 'asc' ? 'Lower is Better' : 'Higher is Better'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Content */}
      <IonCard style={{ 
        margin: '0', 
        borderRadius: '0 0 12px 12px',
        borderTop: 'none',
        marginTop: '-1px'
      }}>
        <IonCardContent style={{ padding: '0', overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ ...tableStyles.th, ...tableStyles.positionCell }}>Pos</th>
                <th style={{ ...tableStyles.th, ...tableStyles.playerCell }}>Player</th>
                <th style={{ ...tableStyles.th, ...tableStyles.scoreCell }}>
                  {getScoringMethodDisplay(gameFormat || 'stroke_play')}
                </th>
                <th style={{ ...tableStyles.th, width: '50px' }}>Strokes</th>
                <th style={{ ...tableStyles.th, width: '50px' }}>vs Par</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.entries.map((entry, idx) => {
                // Get scorecard for additional data
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
                let displayScore: React.ReactNode;
                if (gameFormat === 'stroke_play') {
                  // For stroke play, show the score vs par
                  const scoreVsParValue = (entry.details as any)?.scoreVsPar;
                  displayScore = (scoreVsParValue !== undefined && scoreVsParValue !== null) ? scoreVsParValue : scoreVsPar;
                } else if (gameFormat === 'stableford') {
                  // For stableford, show total points
                  const totalPointsValue = (entry.details as any)?.totalPoints;
                  displayScore = (totalPointsValue !== undefined && totalPointsValue !== null) ? totalPointsValue : entry.score;
                } else if (gameFormat === 'match_play') {
                  // For match play, show total points
                  const totalPointsValue = (entry.details as any)?.totalPoints;
                  displayScore = (totalPointsValue !== undefined && totalPointsValue !== null) ? totalPointsValue : entry.score;
                } else if (gameFormat === 'skins') {
                  // For skins, show skins won
                  const skinsWonValue = (entry.details as any)?.skinsWon;
                  displayScore = (skinsWonValue !== undefined && skinsWonValue !== null) ? skinsWonValue : entry.score;
                } else {
                  displayScore = entry.score;
                }
                
                // Ensure displayScore is renderable
                if (typeof displayScore === 'object' && displayScore !== null && !React.isValidElement(displayScore)) {
                  displayScore = String(displayScore);
                }

                return (
                  <tr key={entry.playerId} style={{ 
                    backgroundColor: idx % 2 === 0 ? 'transparent' : '#f8f6f0'
                  }}>
                    {/* Position */}
                    <td style={{ 
                      ...tableStyles.td, 
                      ...tableStyles.positionCell,
                      color: entry.position === 1 ? '#ffd700' : 
                             entry.position === 2 ? '#c0c0c0' : 
                             entry.position === 3 ? '#cd7f32' : '#2a5434',
                      textShadow: entry.position <= 3 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                    }}>
                      {entry.position}
                    </td>
                    
                    {/* Player with details underneath */}
                    <td style={{ ...tableStyles.td, ...tableStyles.playerCell }}>
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '13px',
                          color: '#2a5434'
                        }}>
                          {entry.playerName}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--ion-color-medium)', marginTop: '2px' }}>
                          {gameFormat === 'stroke_play' && (
                            <>{holesPlayed} holes • PMP Par: {personalPar || entry.details?.totalPar}</>
                          )}
                          {gameFormat === 'stableford' && (
                            <>{entry.details?.holesPlayed || holesPlayed} holes • Gross: {entry.details?.grossScore || totalStrokes}</>
                          )}
                          {gameFormat === 'match_play' && entry.details && (
                            <>
                              {entry.details.matchStatus || 
                               `W:${entry.details.holesWon || 0} L:${entry.details.holesLost || 0} T:${entry.details.holesTied || 0}`}
                            </>
                          )}
                          {gameFormat === 'skins' && entry.details && (
                            <>
                              {entry.details.holesWon && Array.isArray(entry.details.holesWon) && entry.details.holesWon.length > 0 ? 
                                `Won holes: ${(entry.details.holesWon as number[]).join(', ')}` : 
                                'No holes won'
                              }
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Score */}
                    <td style={{ 
                      ...tableStyles.td, 
                      ...tableStyles.scoreCell,
                      color: '#2a5434',
                      fontWeight: '800'
                    }}>
                      {displayScore}
                    </td>
                    
                    {/* Strokes */}
                    <td style={{ 
                      ...tableStyles.td, 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: '#8b7355'
                    }}>
                      {totalStrokes || (entry.details?.grossScore as number) || '-'}
                    </td>
                    
                    {/* vs Par */}
                    <td style={{ 
                      ...tableStyles.td, 
                      fontSize: '13px', 
                      fontWeight: '700',
                      color: scoreVsPar === 'E' ? '#2a5434' : 
                             scoreVsPar.startsWith('+') ? '#dc3545' : 
                             scoreVsPar === '-' ? '#8b7355' : '#28a745'
                    }}>
                      {scoreVsPar}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Details Section */}
          <div style={{ padding: '16px', backgroundColor: '#f8f6f0', borderTop: '2px solid #d4c4a0' }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#2a5434',
                fontFamily: 'serif',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Game Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontSize: '11px' }}>
                {leaderboard.entries.map((entry) => {
                  return (
                    <div key={entry.playerId} style={{ 
                      padding: '8px', 
                      backgroundColor: 'white', 
                      borderRadius: '4px',
                      border: '1px solid #d4c4a0'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '12px', 
                        marginBottom: '4px',
                        color: '#2a5434'
                      }}>
                        {entry.playerName}
                      </div>
                      
                      {/* Scoring method specific details */}
                      {gameFormat === 'stroke_play' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          <div>Holes: {entry.details.holesPlayed as number}</div>
                          <div>Net: {entry.details.netScore as number}</div>
                        </div>
                      )}
                      
                      {gameFormat === 'stableford' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          <div>Holes: {entry.details.holesPlayed as number}</div>
                          <div>Gross: {entry.details.grossScore as number}</div>
                        </div>
                      )}
                      
                      {gameFormat === 'match_play' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          {entry.details.record ? (
                            <div>Record: {entry.details.record as string}</div>
                          ) : (
                            <div>W:{entry.details.holesWon as number} L:{entry.details.holesLost as number} T:{entry.details.holesTied as number}</div>
                          )}
                        </div>
                      )}
                      
                      {gameFormat === 'skins' && entry.details && (
                        <div style={{ color: 'var(--ion-color-medium)' }}>
                          {Array.isArray(entry.details.holesWon) && entry.details.holesWon.length > 0 ? (
                            <div>Won: {(entry.details.holesWon as number[]).join(', ')}</div>
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

export default CompletedLeaderboard;
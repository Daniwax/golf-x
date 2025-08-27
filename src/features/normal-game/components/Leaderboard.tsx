import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonAvatar,
  IonList,
  IonChip,
  IonBadge
} from '@ionic/react';
import { 
  trophyOutline, 
  flagOutline,
  arrowUpOutline,
  arrowDownOutline
} from 'ionicons/icons';
import type { GameParticipant, GameHoleScore } from '../types';
import { supabase } from '../../../lib/supabase';
import { 
  calculateTotalPersonalPar
} from '../utils/handicapCalculations';
import {
  calculateSuccessProbability,
  calculateStrokesRemaining,
  calculatePerformanceRatio,
  getProbabilityColor,
  getPerformanceMessage
} from '../utils/probabilityCalculations';

interface LeaderboardProps {
  participants: GameParticipant[];
  scores: GameHoleScore[];
  format: 'match_play' | 'stroke_play';
  currentHole: number;
  gameId?: string; // Optional gameId to load hole data
}

interface PlayerStanding {
  participant: GameParticipant;
  grossScore: number;
  netScore: number;
  holesPlayed: number;
  toPar: number;
  position: number;
  tied: boolean;
  lastHoleScore?: number;
  lastHolePar?: number;
  matchPlayStatus?: string; // e.g., "2 UP", "1 DOWN", "AS"
}

interface HoleInfo {
  hole_number: number;
  par: number;
  handicap_index: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  participants,
  scores,
  format,
  currentHole,
  gameId
}) => {
  const [viewMode, setViewMode] = useState<'gross' | 'net'>(format === 'match_play' ? 'net' : 'gross');
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [holes, setHoles] = useState<HoleInfo[]>([]);
  const [parTotal, setParTotal] = useState(72); // Default par

  useEffect(() => {
    calculateStandings();
  }, [participants, scores, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    if (gameId) {
      loadHoleData();
    }
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHoleData = async () => {
    try {
      if (!supabase || !gameId) return;
      
      // Get course info from game
      const { data: game } = await supabase
        .from('games')
        .select('course_id')
        .eq('id', gameId)
        .single();
        
      if (!game) return;
      
      // Get hole data
      const { data: holeData } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', game.course_id)
        .order('hole_number');
        
      if (holeData) {
        setHoles(holeData);
        const total = holeData.reduce((sum, h) => sum + h.par, 0);
        setParTotal(total);
      }
    } catch (error) {
      console.error('Error loading hole data:', error);
    }
  };

  const calculateStandings = () => {
    const playerStandings: PlayerStanding[] = participants.map(participant => {
      // Calculate gross score
      const playerScores = scores.filter(s => s.user_id === participant.user_id && s.strokes);
      const grossScore = playerScores.reduce((sum, s) => sum + (s.strokes || 0), 0);
      const holesPlayed = playerScores.length;
      
      // Calculate net score (gross - strokes received)
      const netScore = playerScores.reduce((sum, s) => {
        const strokes = s.strokes || 0;
        const handicapStrokes = s.hole_handicap_strokes || 0;
        return sum + strokes - handicapStrokes;
      }, 0);
      
      // Calculate to par
      const parTotal = playerScores.reduce((sum, s) => sum + s.hole_par, 0);
      const toPar = grossScore - parTotal;
      
      // Get last hole score if available
      const lastHoleScores = playerScores.filter(s => s.hole_number === currentHole - 1);
      const lastHoleScore = lastHoleScores.length > 0 ? lastHoleScores[0].strokes : undefined;
      const lastHolePar = lastHoleScores.length > 0 ? lastHoleScores[0].hole_par : undefined;
      
      return {
        participant,
        grossScore,
        netScore,
        holesPlayed,
        toPar,
        position: 0,
        tied: false,
        lastHoleScore,
        lastHolePar
      };
    });

    // Sort by score (lower is better)
    const sortedStandings = [...playerStandings].sort((a, b) => {
      const scoreA = viewMode === 'gross' ? a.grossScore : a.netScore;
      const scoreB = viewMode === 'gross' ? b.grossScore : b.netScore;
      
      // If no scores yet, sort by handicap
      if (scoreA === 0 && scoreB === 0) {
        return a.participant.playing_handicap - b.participant.playing_handicap;
      }
      
      return scoreA - scoreB;
    });

    // Calculate positions and ties
    sortedStandings.forEach((standing, index) => {
      if (index === 0) {
        standing.position = 1;
      } else {
        const prevScore = viewMode === 'gross' 
          ? sortedStandings[index - 1].grossScore 
          : sortedStandings[index - 1].netScore;
        const currentScore = viewMode === 'gross' 
          ? standing.grossScore 
          : standing.netScore;
        
        if (currentScore === prevScore) {
          standing.position = sortedStandings[index - 1].position;
          standing.tied = true;
          sortedStandings[index - 1].tied = true;
        } else {
          standing.position = index + 1;
        }
      }
    });

    // Calculate match play status if applicable
    if (format === 'match_play' && sortedStandings.length > 1) {
      const lowestHandicap = Math.min(...participants.map(p => p.match_handicap));
      const basePlayer = sortedStandings.find(s => s.participant.match_handicap === lowestHandicap);
      
      if (basePlayer) {
        sortedStandings.forEach(standing => {
          if (standing.participant.id === basePlayer.participant.id) {
            // This is the base player
            const diff = standing.netScore - sortedStandings[0].netScore;
            if (diff === 0 && standing.position === 1) {
              standing.matchPlayStatus = 'Leading';
            } else if (diff === 0) {
              standing.matchPlayStatus = 'AS';
            } else if (diff > 0) {
              standing.matchPlayStatus = `${diff} DOWN`;
            } else {
              standing.matchPlayStatus = `${Math.abs(diff)} UP`;
            }
          } else {
            // Compare to base player
            const diff = standing.netScore - basePlayer.netScore;
            if (diff === 0) {
              standing.matchPlayStatus = 'AS';
            } else if (diff > 0) {
              standing.matchPlayStatus = `${diff} DOWN`;
            } else {
              standing.matchPlayStatus = `${Math.abs(diff)} UP`;
            }
          }
        });
      }
    }

    setStandings(sortedStandings);
  };

  const getPositionColor = (position: number): string => {
    if (position === 1) return 'warning';
    if (position === 2) return 'medium';
    if (position === 3) return 'medium';
    return 'light';
  };

  // Removed unused function - getTrendIcon

  const getScoreDisplay = (standing: PlayerStanding): string => {
    const score = viewMode === 'gross' ? standing.grossScore : standing.netScore;
    if (score === 0) return '-';
    if (standing.toPar === 0) return 'E';
    if (standing.toPar > 0) return `+${standing.toPar}`;
    return standing.toPar.toString();
  };

  return (
    <div style={{ padding: '0' }}>
      {/* View Mode Selector - Only for Stroke Play */}
      {format === 'stroke_play' && (
        <div style={{ padding: '16px 16px 0' }}>
          <IonSegment value={viewMode} onIonChange={e => setViewMode(e.detail.value as 'gross' | 'net')}>
            <IonSegmentButton value="gross">
              <IonLabel>Gross</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="net">
              <IonLabel>Net</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
      )}

      {/* Match Play Standings Card - Show first if match play */}
      {format === 'match_play' && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '18px' }}>
              Match Play Standings
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0' }}>
            <IonList>
              {(() => {
                // Calculate and sort handicap standings
                const handicapStandings = standings
                  .filter(standing => standing.holesPlayed > 0)
                  .map(standing => {
                    const playerIndex = participants.findIndex(p => p.id === standing.participant.id);
                    const playerName = standing.participant.profiles?.full_name || `Player ${playerIndex + 1}`;
                    
                    // Calculate net performance
                    const playerScores = scores.filter(s => s.user_id === standing.participant.user_id && s.strokes);
                    const holesWithHandicap = playerScores.filter(s => (s.hole_handicap_strokes || 0) > 0).length;
                    const expectedScore = playerScores.reduce((sum, s) => sum + s.hole_par + (s.hole_handicap_strokes || 0), 0);
                    const actualScore = standing.grossScore;
                    const netPerformance = actualScore - expectedScore;
                    
                    return {
                      participantId: standing.participant.id,
                      playerName,
                      holesWithHandicap,
                      netPerformance,
                      tied: false,
                      position: 0
                    };
                  })
                  .sort((a, b) => a.netPerformance - b.netPerformance);
                
                // Assign positions and check for ties
                handicapStandings.forEach((standing, index) => {
                  if (index === 0) {
                    standing.position = 1;
                  } else {
                    const prevPerformance = handicapStandings[index - 1].netPerformance;
                    if (standing.netPerformance === prevPerformance) {
                      standing.position = handicapStandings[index - 1].position;
                      standing.tied = true;
                      handicapStandings[index - 1].tied = true;
                    } else {
                      standing.position = index + 1;
                    }
                  }
                });
                
                return handicapStandings.map((standing) => {
                  const isLeader = standing.position === 1;
                  const positionColor = standing.position === 1 ? 'primary' : 
                                       standing.position === 2 ? 'medium' : 
                                       standing.position === 3 ? 'medium' : 'light';
                  
                  return (
                    <IonItem key={standing.participantId}>
                      <IonAvatar slot="start" style={{ 
                        width: '36px', 
                        height: '36px',
                        backgroundColor: `var(--ion-color-${positionColor})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isLeader ? (
                          <IonIcon 
                            icon={trophyOutline} 
                            style={{ fontSize: '20px', color: 'white' }}
                          />
                        ) : (
                          <span style={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            {standing.position}
                          </span>
                        )}
                      </IonAvatar>

                      <IonLabel>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Player info - flexible width */}
                          <div style={{ flex: '1', minWidth: '0' }}>
                            <h2 style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>
                              {standing.playerName}
                              {standing.tied && <span style={{ fontSize: '12px', marginLeft: '4px' }}>T</span>}
                            </h2>
                            <p style={{ margin: '4px 0 0 0' }}>
                              <IonNote style={{ fontSize: '12px' }}>
                                {standing.holesWithHandicap} stroke{standing.holesWithHandicap !== 1 ? 's' : ''} received
                              </IonNote>
                            </p>
                          </div>

                          {/* Right side elements with fixed widths */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Score display - fixed width */}
                            <div style={{ width: '50px', textAlign: 'center' }}>
                              <div style={{ 
                                fontSize: '20px', 
                                fontWeight: 'bold',
                                color: standing.netPerformance === 0 ? 'var(--ion-color-dark)' :
                                       standing.netPerformance < 0 ? 'var(--ion-color-success)' :
                                       'var(--ion-color-danger)'
                              }}>
                                {standing.netPerformance === 0 ? 'E' :
                                 standing.netPerformance > 0 ? `+${standing.netPerformance}` :
                                 standing.netPerformance.toString()}
                              </div>
                              <IonNote style={{ fontSize: '10px', display: 'block' }}>
                                Strokes
                              </IonNote>
                            </div>

                            {/* Performance status - fixed width */}
                            <div style={{ width: '70px', textAlign: 'center' }}>
                              {(() => {
                                // Calculate performance status
                                const isUnder = standing.netPerformance < 0;
                                const isOver = standing.netPerformance > 0;
                                const value = Math.abs(standing.netPerformance);
                                
                                return (
                                  <IonChip 
                                    color={
                                      isUnder ? 'success' :
                                      isOver ? 'danger' :
                                      'medium'
                                    }
                                    style={{ 
                                      height: '24px', 
                                      fontSize: '11px',
                                      padding: '0 8px',
                                      minWidth: '60px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    {isUnder && (
                                      <>
                                        <IonIcon icon={arrowDownOutline} style={{ fontSize: '14px' }} />
                                        <span>{value}</span>
                                      </>
                                    )}
                                    {isOver && (
                                      <>
                                        <IonIcon icon={arrowUpOutline} style={{ fontSize: '14px' }} />
                                        <span>{value}</span>
                                      </>
                                    )}
                                    {!isUnder && !isOver && <span>PAR</span>}
                                  </IonChip>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </IonLabel>
                    </IonItem>
                  );
                });
              })()}
            </IonList>
          </IonCardContent>
        </IonCard>
      )}

      {/* Stroke Play Leaderboard */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle style={{ fontSize: '18px' }}>
            Stroke Play Standings
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: '0' }}>
          <IonList>
            {standings.map((standing) => {
              const isLeader = standing.position === 1;
              const playerIndex = participants.findIndex(p => p.id === standing.participant.id);
              const playerName = standing.participant.profiles?.full_name || `Player ${playerIndex + 1}`;
              
              return (
                <IonItem key={standing.participant.id}>
                  <IonAvatar slot="start" style={{ 
                    width: '36px', 
                    height: '36px',
                    backgroundColor: `var(--ion-color-${getPositionColor(standing.position)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isLeader ? (
                      <IonIcon 
                        icon={trophyOutline} 
                        style={{ fontSize: '20px', color: 'white' }}
                      />
                    ) : (
                      <span style={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {standing.position}
                      </span>
                    )}
                  </IonAvatar>

                  <IonLabel>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {/* Player info - flexible width */}
                      <div style={{ flex: '1', minWidth: '0' }}>
                        <h2 style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>
                          {playerName}
                          {standing.tied && <span style={{ fontSize: '12px', marginLeft: '4px' }}>T</span>}
                        </h2>
                        <p style={{ margin: '4px 0 0 0' }}>
                          <IonNote style={{ fontSize: '12px' }}>
                            Holes: {standing.holesPlayed}/18
                            {standing.participant.playing_handicap > 0 && (
                              <span> • HC: {standing.participant.playing_handicap}</span>
                            )}
                          </IonNote>
                        </p>
                      </div>

                      {/* Right side elements with fixed widths */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Score display - fixed width */}
                        <div style={{ width: '50px', textAlign: 'center' }}>
                          <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold',
                            color: standing.toPar === 0 ? 'var(--ion-color-dark)' :
                                   standing.toPar < 0 ? 'var(--ion-color-primary)' : 
                                   'var(--ion-color-danger)'
                          }}>
                            {getScoreDisplay(standing)}
                          </div>
                          {standing.grossScore > 0 && (
                            <IonNote style={{ fontSize: '10px', display: 'block' }}>
                              {viewMode === 'gross' ? standing.grossScore : standing.netScore}
                            </IonNote>
                          )}
                        </div>

                        {/* Match play status - fixed width */}
                        {format === 'match_play' && (
                          <div style={{ width: '70px', textAlign: 'center' }}>
                            {standing.matchPlayStatus && (
                              <IonChip 
                                color={
                                  standing.matchPlayStatus.includes('UP') ? 'success' :
                                  standing.matchPlayStatus.includes('DOWN') ? 'danger' :
                                  standing.matchPlayStatus === 'AS' ? 'medium' : 'primary'
                                }
                                style={{ 
                                  height: '24px', 
                                  fontSize: '11px',
                                  padding: '0 8px',
                                  minWidth: '60px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}
                              >
                                {standing.matchPlayStatus.includes('UP') && (
                                  <IonIcon icon={arrowUpOutline} style={{ fontSize: '14px' }} />
                                )}
                                {standing.matchPlayStatus.includes('DOWN') && (
                                  <IonIcon icon={arrowDownOutline} style={{ fontSize: '14px' }} />
                                )}
                                {standing.matchPlayStatus.includes('UP') || standing.matchPlayStatus.includes('DOWN') ? (
                                  <span>{standing.matchPlayStatus.match(/\d+/)?.[0]}</span>
                                ) : (
                                  <span>{standing.matchPlayStatus}</span>
                                )}
                              </IonChip>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </IonLabel>
                </IonItem>
              );
            })}
          </IonList>
        </IonCardContent>
      </IonCard>

      {/* Handicap Standings Card - Only for Stroke Play */}
      {format === 'stroke_play' && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '18px' }}>
              Handicap Standings
              <IonNote style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
                (Performance vs Personal Par)
              </IonNote>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0' }}>
            <IonList>
              {(() => {
                // Calculate and sort handicap standings
                const handicapStandings = standings
                  .filter(standing => standing.holesPlayed > 0)
                  .map(standing => {
                    const playerIndex = participants.findIndex(p => p.id === standing.participant.id);
                    const playerName = standing.participant.profiles?.full_name || `Player ${playerIndex + 1}`;
                    
                    // Calculate net performance
                    const playerScores = scores.filter(s => s.user_id === standing.participant.user_id && s.strokes);
                    const holesWithHandicap = playerScores.filter(s => (s.hole_handicap_strokes || 0) > 0).length;
                    const expectedScore = playerScores.reduce((sum, s) => sum + s.hole_par + (s.hole_handicap_strokes || 0), 0);
                    const actualScore = standing.grossScore;
                    const netPerformance = actualScore - expectedScore;
                    
                    return {
                      participantId: standing.participant.id,
                      playerName,
                      holesWithHandicap,
                      netPerformance,
                      tied: false,
                      position: 0
                    };
                  })
                  .sort((a, b) => a.netPerformance - b.netPerformance);
                
                // Assign positions and check for ties
                handicapStandings.forEach((standing, index) => {
                  if (index === 0) {
                    standing.position = 1;
                  } else {
                    const prevPerformance = handicapStandings[index - 1].netPerformance;
                    if (standing.netPerformance === prevPerformance) {
                      standing.position = handicapStandings[index - 1].position;
                      standing.tied = true;
                      handicapStandings[index - 1].tied = true;
                    } else {
                      standing.position = index + 1;
                    }
                  }
                });
                
                return handicapStandings.map((standing) => {
                  const isLeader = standing.position === 1;
                  const positionColor = standing.position === 1 ? 'primary' : 
                                       standing.position === 2 ? 'medium' : 
                                       standing.position === 3 ? 'medium' : 'light';
                  
                  return (
                    <IonItem key={standing.participantId}>
                      <IonAvatar slot="start" style={{ 
                        width: '36px', 
                        height: '36px',
                        backgroundColor: `var(--ion-color-${positionColor})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isLeader ? (
                          <IonIcon 
                            icon={trophyOutline} 
                            style={{ fontSize: '20px', color: 'white' }}
                          />
                        ) : (
                          <span style={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            {standing.position}
                          </span>
                        )}
                      </IonAvatar>

                      <IonLabel>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Player info - flexible width */}
                          <div style={{ flex: '1', minWidth: '0' }}>
                            <h2 style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>
                              {standing.playerName}
                              {standing.tied && <span style={{ fontSize: '12px', marginLeft: '4px' }}>T</span>}
                            </h2>
                            <p style={{ margin: '4px 0 0 0' }}>
                              <IonNote style={{ fontSize: '12px' }}>
                                {standing.holesWithHandicap} stroke{standing.holesWithHandicap !== 1 ? 's' : ''} received
                              </IonNote>
                            </p>
                          </div>

                          {/* Right side elements with fixed widths */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Score display - fixed width */}
                            <div style={{ width: '50px', textAlign: 'center' }}>
                              <div style={{ 
                                fontSize: '20px', 
                                fontWeight: 'bold',
                                color: standing.netPerformance === 0 ? 'var(--ion-color-dark)' :
                                       standing.netPerformance < 0 ? 'var(--ion-color-success)' :
                                       'var(--ion-color-danger)'
                              }}>
                                {standing.netPerformance === 0 ? 'E' :
                                 standing.netPerformance > 0 ? `+${standing.netPerformance}` :
                                 standing.netPerformance.toString()}
                              </div>
                              <IonNote style={{ fontSize: '10px', display: 'block' }}>
                                Strokes
                              </IonNote>
                            </div>

                            {/* Performance status - fixed width */}
                            <div style={{ width: '70px', textAlign: 'center' }}>
                              {(() => {
                                // Calculate performance status
                                const isUnder = standing.netPerformance < 0;
                                const isOver = standing.netPerformance > 0;
                                const value = Math.abs(standing.netPerformance);
                                
                                return (
                                  <IonChip 
                                    color={
                                      isUnder ? 'success' :
                                      isOver ? 'danger' :
                                      'medium'
                                    }
                                    style={{ 
                                      height: '24px', 
                                      fontSize: '11px',
                                      padding: '0 8px',
                                      minWidth: '60px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    {isUnder && (
                                      <>
                                        <IonIcon icon={arrowDownOutline} style={{ fontSize: '14px' }} />
                                        <span>{value}</span>
                                      </>
                                    )}
                                    {isOver && (
                                      <>
                                        <IonIcon icon={arrowUpOutline} style={{ fontSize: '14px' }} />
                                        <span>{value}</span>
                                      </>
                                    )}
                                    {!isUnder && !isOver && <span>PAR</span>}
                                  </IonChip>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </IonLabel>
                    </IonItem>
                  );
                });
              })()}
            </IonList>
          </IonCardContent>
        </IonCard>
      )}

      {/* Info Card */}
      <IonCard>
        <IonCardContent>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <IonIcon icon={flagOutline} style={{ fontSize: '24px', color: 'var(--ion-color-primary)' }} />
              <IonNote style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                Hole {currentHole}/18
              </IonNote>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ion-color-dark)' }}>
                {participants.length}
              </div>
              <IonNote style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                Players
              </IonNote>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                {Math.round((standings[0]?.holesPlayed || 0) / 18 * 100)}%
              </div>
              <IonNote style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                Complete
              </IonNote>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
      
      {/* Handicap Stroke Course Par Card - Only show if we have hole data */}
      {holes.length > 0 && (
        <IonCard style={{ 
          marginTop: '16px',
          margin: '16px 0 0 0',
          borderRadius: '0',
          boxShadow: 'none',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)'
        }}>
          <IonCardHeader style={{ 
            backgroundColor: 'var(--ion-color-primary-tint)',
            padding: '12px 16px'
          }}>
            <IonCardTitle style={{ fontSize: '16px', color: 'var(--ion-color-primary-contrast)' }}>
              Handicap Stroke Course Par
            </IonCardTitle>
            <IonNote style={{ fontSize: '11px', color: 'var(--ion-color-primary-contrast)' }}>
              Personal par based on full playing handicap
            </IonNote>
          </IonCardHeader>
          <IonCardContent style={{ padding: '12px 16px' }}>
            {(() => {
              // Calculate performance data for all players
              const playerPerformances = participants.map((participant, idx) => {
                // Use playing_handicap (full handicap) NOT match_handicap (reduced for match play)
                const playingHandicap = participant.playing_handicap || 0;
                const totalPersonalPar = calculateTotalPersonalPar(holes, playingHandicap);
                
                // Calculate current total strokes for this player
                const currentStrokes = scores
                  .filter(s => s.user_id === participant.user_id && s.strokes)
                  .reduce((sum, s) => sum + (s.strokes || 0), 0);
                
                const holesPlayed = scores
                  .filter(s => s.user_id === participant.user_id && s.strokes)
                  .length;
                
                const strokesLeft = calculateStrokesRemaining(currentStrokes, totalPersonalPar);
                const probability = calculateSuccessProbability(
                  currentStrokes, 
                  holesPlayed, 
                  totalPersonalPar, 
                  playingHandicap
                );
                const performanceRatio = calculatePerformanceRatio(
                  currentStrokes, 
                  holesPlayed, 
                  totalPersonalPar
                );
                
                return {
                  participant,
                  idx,
                  playingHandicap,
                  totalPersonalPar,
                  currentStrokes,
                  holesPlayed,
                  strokesLeft,
                  probability,
                  performanceRatio
                };
              }).sort((a, b) => a.performanceRatio - b.performanceRatio); // Best ratio first
              
              return (
                <>
                  {playerPerformances.map(perf => {
                    const message = getPerformanceMessage(perf.probability, perf.strokesLeft);
                    
                    return (
                      <div key={perf.participant.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderTop: perf === playerPerformances[0] ? 'none' : '1px solid var(--ion-color-light-shade)'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>
                            {perf.participant.profiles?.full_name || `Player ${perf.idx + 1}`}
                          </div>
                          <IonNote style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>
                            {message} • HC Par: {perf.totalPersonalPar}
                          </IonNote>
                          {perf.holesPlayed >= 3 && (
                            <div style={{ 
                              marginTop: '4px',
                              padding: '3px 8px',
                              backgroundColor: perf.performanceRatio < 0.95 
                                ? 'rgba(var(--ion-color-success-rgb), 0.08)'
                                : perf.performanceRatio < 1.05 
                                ? 'rgba(var(--ion-color-medium-rgb), 0.08)'
                                : 'rgba(var(--ion-color-warning-rgb), 0.08)',
                              borderRadius: '6px',
                              display: 'inline-block',
                              border: `1px solid ${
                                perf.performanceRatio < 0.95 
                                  ? 'rgba(var(--ion-color-success-rgb), 0.2)'
                                  : perf.performanceRatio < 1.05
                                  ? 'rgba(var(--ion-color-medium-rgb), 0.2)'
                                  : 'rgba(var(--ion-color-warning-rgb), 0.2)'
                              }`
                            }}>
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: '600',
                                color: perf.performanceRatio < 0.95 
                                  ? 'var(--ion-color-success-shade)'
                                  : perf.performanceRatio < 1.05
                                  ? 'var(--ion-color-medium-shade)'
                                  : 'var(--ion-color-warning-shade)'
                              }}>
                                {perf.performanceRatio < 0.95 
                                  ? `📈 ${Math.round((0.95 - perf.performanceRatio) * 100)}% HC improvement pace`
                                  : perf.performanceRatio < 1.05
                                  ? '➡️ Maintaining handicap'
                                  : `📉 ${Math.round((perf.performanceRatio - 1.05) * 100)}% above HC pace`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'flex-end',
                          gap: '4px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ 
                                fontSize: '16px', 
                                fontWeight: '700',
                                color: perf.strokesLeft >= 0 ? 'var(--ion-color-success)' : 'var(--ion-color-danger)'
                              }}>
                                {perf.strokesLeft >= 0 ? perf.strokesLeft : Math.abs(perf.strokesLeft)}
                              </div>
                              <IonNote style={{ fontSize: '9px' }}>
                                {perf.strokesLeft >= 0 ? 'left' : 'over'}
                              </IonNote>
                            </div>
                            <IonBadge 
                              color={getProbabilityColor(perf.probability)}
                              style={{ 
                                minWidth: '45px', 
                                fontSize: '12px', 
                                fontWeight: '600'
                              }}
                            >
                              {perf.probability}%
                            </IonBadge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Quick Reference */}
                  <div style={{ 
                    marginTop: '16px', 
                    paddingTop: '12px', 
                    borderTop: '1px solid var(--ion-color-light-shade)' 
                  }}>
                    <IonNote style={{ fontSize: '10px', display: 'block', marginBottom: '8px' }}>
                      Strokes are distributed on hardest holes first (by Stroke Index)
                    </IonNote>
                  </div>
                </>
              );
            })()}
          </IonCardContent>
        </IonCard>
      )}
    </div>
  );
};

export default Leaderboard;
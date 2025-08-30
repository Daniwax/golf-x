import React, { useState, useEffect } from 'react';
import {
  IonNote,
  IonSpinner,
  IonButton,
  IonIcon
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';
import { supabase } from '../../../lib/supabase';
import type { GameParticipant, GameHoleScore } from '../types';
import { 
  calculatePersonalPars, 
  calculateTotalPersonalPar,
  getPersonalParColor,
  type HoleInfo as HoleInfoType
} from '../utils/handicapCalculations';

interface ScorecardProps {
  gameId: string;
  participants: GameParticipant[];
  scores: GameHoleScore[];
  currentHole: number;
  onRefresh?: () => void;
  onEditHole?: (holeNumber: number) => void;
}

interface HoleInfo extends HoleInfoType {
  yards?: number;
}

const Scorecard: React.FC<ScorecardProps> = ({
  gameId,
  participants,
  scores,
  currentHole,
  onRefresh,
  onEditHole
}) => {
  const [holes, setHoles] = useState<HoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    loadHoleData();
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHoleData = async () => {
    try {
      if (!supabase) return;
      
      // Get course info from game
      const { data: game } = await supabase
        .from('games')
        .select('course_id')
        .eq('id', gameId)
        .single();
        
      if (!game) return;
      
      // Get course name
      const { data: course } = await supabase
        .from('golf_courses')
        .select('name')
        .eq('id', game.course_id)
        .single();
        
      if (course) {
        setCourseName(course.name);
      }
      
      // Get hole data
      const { data: holeData } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', game.course_id)
        .order('hole_number');
        
      if (holeData) {
        setHoles(holeData);
      }
    } catch (error) {
      console.error('Error loading hole data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScore = (userId: string, holeNumber: number): number | null => {
    const score = scores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.strokes || null;
  };

  const getHandicapStrokes = (userId: string, holeNumber: number): number => {
    const score = scores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.hole_handicap_strokes || 0;
  };

  const getScoreDisplay = (userId: string, holeNumber: number): React.ReactNode => {
    const strokes = getScore(userId, holeNumber);
    if (strokes === null) return '-';
    
    const handicapStrokes = getHandicapStrokes(userId, holeNumber);
    
    return (
      <span>
        {strokes}
        {handicapStrokes > 0 && (
          <sup style={{ 
            fontSize: '6px', 
            fontWeight: '300',
            color: 'var(--ion-color-medium-shade)',
            marginLeft: '0.5px',
            opacity: 0.7
          }}>
            +{handicapStrokes}
          </sup>
        )}
      </span>
    );
  };

  const getScoreColor = (strokes: number | null, par: number): string => {
    if (strokes === null) return 'var(--ion-color-medium)';
    const diff = strokes - par;
    if (diff <= -2) return 'var(--ion-color-warning)'; // Eagle or better
    if (diff === -1) return 'var(--ion-color-primary)'; // Birdie
    if (diff === 0) return 'var(--ion-color-dark)'; // Par
    if (diff === 1) return 'var(--ion-color-danger)'; // Bogey
    if (diff === 2) return 'var(--ion-color-danger-shade)'; // Double bogey
    return 'var(--ion-color-danger-tint)'; // Triple or worse
  };

  const calculateTotal = (userId: string, startHole: number, endHole: number): number => {
    let total = 0;
    for (let i = startHole; i <= endHole; i++) {
      const score = getScore(userId, i);
      if (score !== null) total += score;
    }
    return total || 0;
  };

  const calculateParTotal = (startHole: number, endHole: number): number => {
    return holes
      .filter(h => h.hole_number >= startHole && h.hole_number <= endHole)
      .reduce((sum, h) => sum + h.par, 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  const frontNineHoles = holes.filter(h => h.hole_number <= 9);
  const backNineHoles = holes.filter(h => h.hole_number > 9);

  return (
    <div style={{ padding: '0' }}>
      {/* Course Name Header */}
      <div style={{ 
        padding: '12px 16px',
        backgroundColor: 'var(--ion-color-light)',
        borderBottom: '1px solid var(--ion-color-light-shade)'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{courseName}</h3>
        {onRefresh && (
          <IonButton 
            fill="clear" 
            size="small"
            onClick={onRefresh}
            style={{ float: 'right', marginTop: '-28px' }}
          >
            <IonIcon icon={refreshOutline} slot="icon-only" />
          </IonButton>
        )}
      </div>

      {/* Front Nine */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '12px',
          minWidth: '600px'
        }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--ion-color-light-tint)' }}>
              <th style={{ 
                padding: '8px', 
                textAlign: 'left',
                position: 'sticky',
                left: 0,
                backgroundColor: 'var(--ion-color-light-tint)',
                zIndex: 1,
                borderRight: '1px solid var(--ion-color-light-shade)'
              }}>
                Front 9
              </th>
              {frontNineHoles.map(hole => (
                <th 
                  key={hole.hole_number}
                  style={{ 
                    padding: '8px 4px', 
                    textAlign: 'center',
                    backgroundColor: hole.hole_number === currentHole 
                      ? 'var(--ion-color-primary-tint)' 
                      : 'var(--ion-color-light-tint)',
                    cursor: onEditHole ? 'pointer' : 'default'
                  }}
                  onClick={() => onEditHole?.(hole.hole_number)}
                >
                  <div style={{ fontWeight: 'bold' }}>{hole.hole_number}</div>
                </th>
              ))}
              <th style={{ 
                padding: '8px', 
                textAlign: 'center',
                backgroundColor: 'var(--ion-color-medium-tint)',
                fontWeight: 'bold'
              }}>
                OUT
              </th>
            </tr>
            <tr style={{ backgroundColor: 'var(--ion-color-light)' }}>
              <td style={{ 
                padding: '6px 8px',
                position: 'sticky',
                left: 0,
                backgroundColor: 'var(--ion-color-light)',
                zIndex: 1,
                borderRight: '1px solid var(--ion-color-light-shade)'
              }}>
                <IonNote>Par</IonNote>
              </td>
              {frontNineHoles.map(hole => (
                <td key={hole.hole_number} style={{ padding: '6px 4px', textAlign: 'center' }}>
                  <IonNote>{hole.par}</IonNote>
                </td>
              ))}
              <td style={{ 
                padding: '6px', 
                textAlign: 'center',
                backgroundColor: 'var(--ion-color-light-shade)',
                fontWeight: '600'
              }}>
                {calculateParTotal(1, 9)}
              </td>
            </tr>
            <tr style={{ backgroundColor: 'var(--ion-color-light)' }}>
              <td style={{ 
                padding: '6px 8px',
                position: 'sticky',
                left: 0,
                backgroundColor: 'var(--ion-color-light)',
                zIndex: 1,
                borderRight: '1px solid var(--ion-color-light-shade)'
              }}>
                <IonNote style={{ fontSize: '10px' }}>SI</IonNote>
              </td>
              {frontNineHoles.map(hole => (
                <td key={hole.hole_number} style={{ padding: '6px 4px', textAlign: 'center' }}>
                  <IonNote style={{ fontSize: '10px' }}>{hole.handicap_index}</IonNote>
                </td>
              ))}
              <td style={{ backgroundColor: 'var(--ion-color-light-shade)' }}></td>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, idx) => {
              // Get user profile for display name
              const frontTotal = calculateTotal(participant.user_id, 1, 9);
              const frontPar = calculateParTotal(1, 9);
              const frontDiff = frontTotal - frontPar;
              
              return (
                <tr key={participant.id} style={{ 
                  borderTop: '1px solid var(--ion-color-light-shade)',
                  backgroundColor: idx % 2 === 0 ? 'white' : 'var(--ion-color-light-tint)'
                }}>
                  <td style={{ 
                    padding: '10px 8px',
                    fontWeight: '600',
                    fontSize: '13px',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: idx % 2 === 0 ? 'white' : 'var(--ion-color-light-tint)',
                    zIndex: 1,
                    borderRight: '1px solid var(--ion-color-light-shade)'
                  }}>
                    Player {idx + 1}
                  </td>
                  {frontNineHoles.map(hole => {
                    const strokes = getScore(participant.user_id, hole.hole_number);
                    return (
                      <td 
                        key={hole.hole_number}
                        style={{ 
                          padding: '10px 4px', 
                          textAlign: 'center',
                          fontWeight: strokes ? '600' : 'normal',
                          fontSize: '14px',
                          color: getScoreColor(strokes, hole.par),
                          backgroundColor: hole.hole_number === currentHole 
                            ? 'var(--ion-color-primary-tint)' 
                            : 'transparent'
                        }}
                      >
                        {getScoreDisplay(participant.user_id, hole.hole_number, hole.par)}
                      </td>
                    );
                  })}
                  <td style={{ 
                    padding: '10px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    backgroundColor: 'var(--ion-color-light-shade)',
                    color: frontDiff === 0 
                      ? 'var(--ion-color-dark)'
                      : frontDiff < 0 
                      ? 'var(--ion-color-primary)'
                      : 'var(--ion-color-danger)'
                  }}>
                    {frontTotal || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Back Nine */}
      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '12px',
          minWidth: '600px'
        }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--ion-color-light-tint)' }}>
              <th style={{ 
                padding: '8px', 
                textAlign: 'left',
                position: 'sticky',
                left: 0,
                backgroundColor: 'var(--ion-color-light-tint)',
                zIndex: 1,
                borderRight: '1px solid var(--ion-color-light-shade)'
              }}>
                Back 9
              </th>
              {backNineHoles.map(hole => (
                <th 
                  key={hole.hole_number}
                  style={{ 
                    padding: '8px 4px', 
                    textAlign: 'center',
                    backgroundColor: hole.hole_number === currentHole 
                      ? 'var(--ion-color-primary-tint)' 
                      : 'var(--ion-color-light-tint)',
                    cursor: onEditHole ? 'pointer' : 'default'
                  }}
                  onClick={() => onEditHole?.(hole.hole_number)}
                >
                  <div style={{ fontWeight: 'bold' }}>{hole.hole_number}</div>
                </th>
              ))}
              <th style={{ 
                padding: '8px', 
                textAlign: 'center',
                backgroundColor: 'var(--ion-color-medium-tint)',
                fontWeight: 'bold'
              }}>
                IN
              </th>
              <th style={{ 
                padding: '8px', 
                textAlign: 'center',
                backgroundColor: 'var(--ion-color-dark)',
                color: 'white',
                fontWeight: 'bold'
              }}>
                TOT
              </th>
            </tr>
            <tr style={{ backgroundColor: 'var(--ion-color-light)' }}>
              <td style={{ 
                padding: '6px 8px',
                position: 'sticky',
                left: 0,
                backgroundColor: 'var(--ion-color-light)',
                zIndex: 1,
                borderRight: '1px solid var(--ion-color-light-shade)'
              }}>
                <IonNote>Par</IonNote>
              </td>
              {backNineHoles.map(hole => (
                <td key={hole.hole_number} style={{ padding: '6px 4px', textAlign: 'center' }}>
                  <IonNote>{hole.par}</IonNote>
                </td>
              ))}
              <td style={{ 
                padding: '6px', 
                textAlign: 'center',
                backgroundColor: 'var(--ion-color-light-shade)',
                fontWeight: '600'
              }}>
                {calculateParTotal(10, 18)}
              </td>
              <td style={{ 
                padding: '6px', 
                textAlign: 'center',
                backgroundColor: 'var(--ion-color-medium)',
                color: 'white',
                fontWeight: '600'
              }}>
                {calculateParTotal(1, 18)}
              </td>
            </tr>
            <tr style={{ backgroundColor: 'var(--ion-color-light)' }}>
              <td style={{ 
                padding: '6px 8px',
                position: 'sticky',
                left: 0,
                backgroundColor: 'var(--ion-color-light)',
                zIndex: 1,
                borderRight: '1px solid var(--ion-color-light-shade)'
              }}>
                <IonNote style={{ fontSize: '10px' }}>SI</IonNote>
              </td>
              {backNineHoles.map(hole => (
                <td key={hole.hole_number} style={{ padding: '6px 4px', textAlign: 'center' }}>
                  <IonNote style={{ fontSize: '10px' }}>{hole.handicap_index}</IonNote>
                </td>
              ))}
              <td style={{ backgroundColor: 'var(--ion-color-light-shade)' }}></td>
              <td style={{ backgroundColor: 'var(--ion-color-medium)' }}></td>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, idx) => {
              const backTotal = calculateTotal(participant.user_id, 10, 18);
              const totalScore = calculateTotal(participant.user_id, 1, 18);
              const backPar = calculateParTotal(10, 18);
              const backDiff = backTotal - backPar;
              
              return (
                <tr key={participant.id} style={{ 
                  borderTop: '1px solid var(--ion-color-light-shade)',
                  backgroundColor: idx % 2 === 0 ? 'white' : 'var(--ion-color-light-tint)'
                }}>
                  <td style={{ 
                    padding: '10px 8px',
                    fontWeight: '600',
                    fontSize: '13px',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: idx % 2 === 0 ? 'white' : 'var(--ion-color-light-tint)',
                    zIndex: 1,
                    borderRight: '1px solid var(--ion-color-light-shade)'
                  }}>
                    Player {idx + 1}
                  </td>
                  {backNineHoles.map(hole => {
                    const strokes = getScore(participant.user_id, hole.hole_number);
                    return (
                      <td 
                        key={hole.hole_number}
                        style={{ 
                          padding: '10px 4px', 
                          textAlign: 'center',
                          fontWeight: strokes ? '600' : 'normal',
                          fontSize: '14px',
                          color: getScoreColor(strokes, hole.par),
                          backgroundColor: hole.hole_number === currentHole 
                            ? 'var(--ion-color-primary-tint)' 
                            : 'transparent'
                        }}
                      >
                        {getScoreDisplay(participant.user_id, hole.hole_number, hole.par)}
                      </td>
                    );
                  })}
                  <td style={{ 
                    padding: '10px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    backgroundColor: 'var(--ion-color-light-shade)',
                    color: backDiff === 0 
                      ? 'var(--ion-color-dark)'
                      : backDiff < 0 
                      ? 'var(--ion-color-primary)'
                      : 'var(--ion-color-danger)'
                  }}>
                    {backTotal || '-'}
                  </td>
                  <td style={{ 
                    padding: '10px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    backgroundColor: 'var(--ion-color-medium)',
                    color: 'white'
                  }}>
                    {totalScore || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ 
        padding: '12px 16px',
        backgroundColor: 'var(--ion-color-light)',
        marginTop: '16px',
        fontSize: '11px'
      }}>
        <IonNote>
          <span style={{ marginRight: '12px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px',
              backgroundColor: 'var(--ion-color-warning)',
              marginRight: '4px'
            }}></span>
            Eagle
          </span>
          <span style={{ marginRight: '12px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px',
              backgroundColor: 'var(--ion-color-primary)',
              marginRight: '4px'
            }}></span>
            Birdie
          </span>
          <span style={{ marginRight: '12px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px',
              backgroundColor: 'var(--ion-color-dark)',
              marginRight: '4px'
            }}></span>
            Par
          </span>
          <span style={{ marginRight: '12px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px',
              backgroundColor: 'var(--ion-color-danger)',
              marginRight: '4px'
            }}></span>
            Bogey+
          </span>
        </IonNote>
      </div>

      {/* Handicapped Course Par Section */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          padding: '12px 16px',
          backgroundColor: 'var(--ion-color-primary-tint)',
          borderBottom: '1px solid var(--ion-color-primary-shade)'
        }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--ion-color-primary-contrast)' }}>
            Handicapped Course Par
          </h4>
          <IonNote style={{ fontSize: '11px', color: 'var(--ion-color-primary-contrast)' }}>
            Personal par for each player based on their full playing handicap
          </IonNote>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '12px',
            minWidth: '800px'
          }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--ion-color-light-tint)' }}>
                <th style={{ 
                  padding: '8px', 
                  textAlign: 'left',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--ion-color-light-tint)',
                  zIndex: 1,
                  borderRight: '1px solid var(--ion-color-light-shade)',
                  width: '120px'
                }}>
                  Player
                </th>
                <th style={{ 
                  padding: '8px', 
                  textAlign: 'center',
                  width: '60px'
                }}>
                  Playing HC
                </th>
                {holes.map(hole => (
                  <th 
                    key={hole.hole_number}
                    style={{ 
                      padding: '6px 2px', 
                      textAlign: 'center',
                      width: '30px'
                    }}
                  >
                    {hole.hole_number}
                  </th>
                ))}
                <th style={{ 
                  padding: '8px', 
                  textAlign: 'center',
                  backgroundColor: 'var(--ion-color-medium-tint)',
                  fontWeight: 'bold',
                  width: '50px'
                }}>
                  Total
                </th>
              </tr>
              <tr style={{ backgroundColor: 'var(--ion-color-light)' }}>
                <td style={{ 
                  padding: '6px 8px',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--ion-color-light)',
                  zIndex: 1,
                  borderRight: '1px solid var(--ion-color-light-shade)'
                }}>
                  <IonNote>Course Par</IonNote>
                </td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <IonNote>-</IonNote>
                </td>
                {holes.map(hole => (
                  <td key={hole.hole_number} style={{ padding: '4px 2px', textAlign: 'center' }}>
                    <IonNote>{hole.par}</IonNote>
                  </td>
                ))}
                <td style={{ 
                  padding: '6px', 
                  textAlign: 'center',
                  backgroundColor: 'var(--ion-color-light-shade)',
                  fontWeight: '600'
                }}>
                  {calculateParTotal(1, 18)}
                </td>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, idx) => {
                // Calculate strokes allocation for this player
                // Use playing_handicap (full handicap) NOT match_handicap (reduced for match play)
                const playingHandicap = participant.playing_handicap || 0;
                
                // Use utility functions for calculations
                const personalPars = calculatePersonalPars(holes, playingHandicap);
                const totalPersonalPar = calculateTotalPersonalPar(holes, playingHandicap);
                
                return (
                  <tr key={participant.id} style={{ 
                    borderTop: '1px solid var(--ion-color-light-shade)',
                    backgroundColor: idx % 2 === 0 ? 'white' : 'var(--ion-color-light-tint)'
                  }}>
                    <td style={{ 
                      padding: '8px',
                      fontWeight: '600',
                      fontSize: '12px',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: idx % 2 === 0 ? 'white' : 'var(--ion-color-light-tint)',
                      zIndex: 1,
                      borderRight: '1px solid var(--ion-color-light-shade)'
                    }}>
                      {participant.profiles?.full_name || `Player ${idx + 1}`}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      {playingHandicap}
                    </td>
                    {personalPars.map(pp => {
                      const colorMode = getPersonalParColor(pp.strokesReceived);
                      return (
                        <td 
                          key={pp.holeNumber}
                          style={{ 
                            padding: '4px 2px', 
                            textAlign: 'center',
                            fontWeight: pp.strokesReceived > 0 ? '600' : 'normal',
                            fontSize: '12px',
                            backgroundColor: colorMode === 'warning' ? 'var(--ion-color-warning-tint)' : 
                                           colorMode === 'primary' ? 'var(--ion-color-primary-tint)' : 
                                           'transparent'
                          }}
                        >
                          {pp.personalPar}
                        </td>
                      );
                    })}
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      backgroundColor: 'var(--ion-color-primary-tint)'
                    }}>
                      {totalPersonalPar}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Legend for Handicapped Par */}
        <div style={{ 
          padding: '8px 16px',
          backgroundColor: 'var(--ion-color-light)',
          fontSize: '10px'
        }}>
          <IonNote>
            <span style={{ marginRight: '12px' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '10px', 
                height: '10px',
                backgroundColor: 'var(--ion-color-primary-tint)',
                border: '1px solid var(--ion-color-primary-shade)',
                marginRight: '4px'
              }}></span>
              +1 stroke
            </span>
            <span style={{ marginRight: '12px' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '10px', 
                height: '10px',
                backgroundColor: 'var(--ion-color-warning-tint)',
                border: '1px solid var(--ion-color-warning-shade)',
                marginRight: '4px'
              }}></span>
              +2 strokes
            </span>
          </IonNote>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;
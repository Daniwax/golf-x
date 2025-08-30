import React from 'react';
import {
  IonIcon,
  IonRippleEffect
} from '@ionic/react';
import { 
  flagOutline, 
  trophyOutline, 
  golfOutline,
  medalOutline,
  starOutline
} from 'ionicons/icons';
import '../../../styles/championship.css';

interface Participant {
  id?: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
  handicap_index?: number;
  course_handicap?: number;
  playing_handicap?: number;
  match_handicap?: number;
}

interface Score {
  user_id: string;
  hole_number: number;
  strokes: number | null;
  hole_handicap_strokes?: number;
}

interface Hole {
  hole_number: number;
  par: number;
  handicap_index?: number;
}

interface ScorecardDisplayProps {
  participants: Participant[];
  scores: Score[];
  holes: Hole[];
  courseName: string;
  coursePar: number;
  currentHole?: number;
  onEditHole?: (holeNumber: number) => void;
  isReadOnly?: boolean;
}

const ScorecardDisplay: React.FC<ScorecardDisplayProps> = ({
  participants,
  scores,
  holes,
  coursePar,
  currentHole = 0,
  onEditHole,
  isReadOnly = false
}) => {
  // Ensure we have valid arrays
  const safeParticipants = Array.isArray(participants) ? participants : [];
  const safeHoles = Array.isArray(holes) ? holes : [];
  const safeScores = Array.isArray(scores) ? scores : [];
  
  // Helper functions
  const getScore = (userId: string, holeNumber: number): number | null => {
    const score = safeScores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.strokes || null;
  };

  const getHandicapStrokes = (userId: string, holeNumber: number): number => {
    const score = safeScores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.hole_handicap_strokes || 0;
  };

  const calculateHandicapStrokes = (userId: string, holeNumber: number): number => {
    // First check if we have saved score data
    const savedStrokes = getHandicapStrokes(userId, holeNumber);
    if (savedStrokes > 0) {
      return savedStrokes;
    }
    
    // Calculate from participant's match handicap and hole handicap index
    const participant = safeParticipants.find(p => p.user_id === userId);
    const hole = safeHoles.find(h => h.hole_number === holeNumber);
    
    if (!participant || !hole) {
      return 0;
    }
    
    const matchHandicap = participant.match_handicap || 0;
    const holeHandicapIndex = hole.handicap_index || holeNumber; // fallback to hole number
    
    if (matchHandicap <= 0) return 0;
    
    // Calculate strokes using the same logic as ScorecardMobile
    const fullRounds = Math.floor(matchHandicap / 18);
    const remainingStrokes = matchHandicap % 18;
    
    let calculatedStrokes = 0;
    if (holeHandicapIndex <= remainingStrokes) {
      calculatedStrokes = fullRounds + 1;
    } else {
      calculatedStrokes = fullRounds;
    }
    
    return calculatedStrokes;
  };

  // Professional golf score styling with circles and squares
  const getScoreStyle = (strokes: number | null, par: number, handicapStrokes: number = 0) => {
    if (strokes === null) {
      return {
        color: 'rgba(150, 150, 150, 1)',
        fontWeight: '400',
        display: 'inline-block'
      };
    }
    
    // Calculate player's personal par (course par + handicap strokes)
    const personalPar = par + handicapStrokes;
    const diffFromPar = strokes - personalPar;
    
    if (diffFromPar <= -2) {
      // Eagle or better - Red with double circle
      return {
        color: 'white',
        fontWeight: '700',
        backgroundColor: 'rgba(220, 20, 60, 1)',
        borderRadius: '50%',
        border: '2px solid rgba(220, 20, 60, 1)',
        boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(220, 20, 60, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        position: 'relative'
      };
    }
    if (diffFromPar === -1) {
      // Birdie - Orange-red with single circle
      return {
        color: 'white',
        fontWeight: '600',
        backgroundColor: 'rgba(255, 69, 0, 1)',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px'
      };
    }
    if (diffFromPar === 0) {
      // Par - Dark gray/black, no shape
      return {
        color: 'rgba(30, 30, 30, 1)',
        fontWeight: '500',
        display: 'inline-block'
      };
    }
    if (diffFromPar === 1) {
      // Bogey - Royal blue with square
      return {
        color: 'white',
        fontWeight: '500',
        backgroundColor: 'rgba(65, 105, 225, 1)',
        borderRadius: '2px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px'
      };
    }
    // Double bogey or worse - Midnight blue with double square
    return {
      color: 'white',
      fontWeight: '600',
      backgroundColor: 'rgba(25, 25, 112, 1)',
      borderRadius: '2px',
      border: '2px solid rgba(25, 25, 112, 1)',
      boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(25, 25, 112, 1)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px'
    };
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
    return safeHoles
      .filter(h => h.hole_number >= startHole && h.hole_number <= endHole)
      .reduce((sum, h) => sum + h.par, 0);
  };

  // Get abbreviated player names for mobile elegance
  const getAbbreviatedName = (fullName: string | undefined, index: number): string => {
    if (!fullName) return `Player ${index + 1}`;
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].substring(0, 10);
    return `${names[0].charAt(0)}. ${names[names.length - 1].substring(0, 8)}`;
  };

  // Calculate to par display
  const getToPar = (total: number, par: number): string => {
    if (!total) return '-';
    const diff = total - par;
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };
  
  // Get to par color styling with new color scheme
  const getToParColor = (toPar: string): string => {
    if (toPar === 'E') return 'rgba(30, 30, 30, 1)';
    if (toPar.startsWith('+')) return 'rgba(65, 105, 225, 1)';
    if (toPar.startsWith('-')) return 'rgba(255, 69, 0, 1)';
    return 'rgba(150, 150, 150, 1)';
  };

  // Separate front and back nine holes
  const frontNineHoles = safeHoles.filter(h => h.hole_number <= 9);
  const backNineHoles = safeHoles.filter(h => h.hole_number > 9);

  // Calculate totals
  const playerTotals = safeParticipants.map(p => ({
    participant: p,
    front: calculateTotal(p.user_id, 1, 9),
    back: calculateTotal(p.user_id, 10, 18),
    total: calculateTotal(p.user_id, 1, 18)
  }));

  const parFront = calculateParTotal(1, 9);
  const parBack = calculateParTotal(10, 18);
  const parTotal = coursePar || calculateParTotal(1, 18);

  return (
    <div className="scorecard-elite">
      {/* Championship Header */}
      <div className="scorecard-elite-header" style={{
        background: 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
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
              icon={golfOutline} 
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
              Official Scorecard
            </h2>
            <IonIcon 
              icon={golfOutline} 
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
                Par {parTotal}
              </span>
            </div>
            
            {!isReadOnly && (
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
                  Hole {currentHole}/18
                </span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Scorecard Tables */}
      <div style={{ padding: '12px', background: 'var(--champ-cream)' }}>
        {/* Front Nine */}
        <div style={{
          marginBottom: '16px',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(90deg, var(--champ-green-soft) 0%, transparent 100%)',
            borderBottom: '2px solid var(--champ-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IonIcon icon={flagOutline} style={{ fontSize: '16px', color: 'var(--champ-gold)' }} />
            <h3 className="champ-font-impact" style={{
              fontSize: '14px',
              color: 'var(--champ-green-dark)',
              margin: 0,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Front Nine
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: safeParticipants.length > 3 ? '500px' : 'auto', padding: '12px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `48px 28px repeat(${safeParticipants.length}, 1fr)`,
                gap: '4px',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--champ-gold-light)'
              }}>
                <div className="champ-font-impact" style={{ 
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  Hole
                </div>
                <div className="champ-font-impact" style={{ 
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  Par
                </div>
                {safeParticipants.map((p, idx) => (
                  <div key={p.id || p.user_id} style={{ textAlign: 'center' }}>
                    <div className="champ-font-sans" style={{ 
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'var(--champ-green-dark)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {getAbbreviatedName(p.profiles?.full_name, idx)}
                    </div>
                  </div>
                ))}
              </div>

              {frontNineHoles.map((hole) => {
                const isCurrentHole = hole.hole_number === currentHole && !isReadOnly;
                return (
                  <div 
                    key={hole.hole_number}
                    onClick={() => !isReadOnly && onEditHole?.(hole.hole_number)}
                    className="ion-activatable"
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `48px 28px repeat(${safeParticipants.length}, 1fr)`,
                      gap: '4px',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                      alignItems: 'center',
                      cursor: isReadOnly ? 'default' : 'pointer',
                      position: 'relative',
                      backgroundColor: isCurrentHole ? 'var(--champ-gold-soft)' : 'transparent',
                      borderRadius: isCurrentHole ? '8px' : '0',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {!isReadOnly && <IonRippleEffect />}
                    <div className="champ-font-impact" style={{ 
                      fontSize: '14px',
                      color: 'var(--champ-green-dark)',
                      fontWeight: '500',
                      paddingLeft: isCurrentHole ? '8px' : '0'
                    }}>
                      {hole.hole_number}
                    </div>
                    <div className="champ-font-sans" style={{ 
                      fontSize: '12px',
                      color: 'var(--champ-gray)',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      {hole.par}
                    </div>
                    {safeParticipants.map(p => {
                      const score = getScore(p.user_id, hole.hole_number);
                      const handicapStrokes = calculateHandicapStrokes(p.user_id, hole.hole_number);
                      const style = getScoreStyle(score, hole.par, handicapStrokes);
                      return (
                        <div 
                          key={p.user_id} 
                          style={{ 
                            textAlign: 'center',
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <span style={style}>
                            {score || '-'}
                            {score && handicapStrokes > 0 && (
                              <sup style={{
                                fontSize: '8px',
                                marginLeft: '1px',
                                verticalAlign: 'super',
                                color: (score - hole.par - handicapStrokes === 0 || 
                                       score - hole.par - handicapStrokes <= -3 || 
                                       score - hole.par - handicapStrokes >= 3) ? 'black' : 'white',
                                fontWeight: 'bold'
                              }}>
                                +{handicapStrokes}
                              </sup>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {/* OUT Total */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `48px 28px repeat(${safeParticipants.length}, 1fr)`,
                gap: '4px',
                padding: '10px 0',
                marginTop: '8px',
                backgroundColor: 'var(--champ-green-soft)',
                borderRadius: '6px'
              }}>
                <div className="champ-font-impact" style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  letterSpacing: '1px',
                  paddingLeft: '8px'
                }}>
                  OUT
                </div>
                <div className="champ-font-sans" style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {parFront}
                </div>
                {safeParticipants.map(p => (
                  <div key={p.user_id} className="champ-font-impact" style={{ 
                    textAlign: 'center',
                    fontSize: '16px',
                    color: 'var(--champ-green-dark)'
                  }}>
                    {calculateTotal(p.user_id, 1, 9) || '-'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back Nine - Only show if there are back nine holes */}
        {backNineHoles.length > 0 && (
        <div style={{
          marginBottom: '16px',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(90deg, var(--champ-green-soft) 0%, transparent 100%)',
            borderBottom: '2px solid var(--champ-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IonIcon icon={flagOutline} style={{ fontSize: '16px', color: 'var(--champ-gold)' }} />
            <h3 className="champ-font-impact" style={{
              fontSize: '14px',
              color: 'var(--champ-green-dark)',
              margin: 0,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Back Nine
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: safeParticipants.length > 3 ? '500px' : 'auto', padding: '12px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `48px 28px repeat(${safeParticipants.length}, 1fr)`,
                gap: '4px',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--champ-gold-light)'
              }}>
                <div className="champ-font-impact" style={{ 
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  Hole
                </div>
                <div className="champ-font-impact" style={{ 
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  Par
                </div>
                {safeParticipants.map((p, idx) => (
                  <div key={p.id || p.user_id} style={{ textAlign: 'center' }}>
                    <div className="champ-font-sans" style={{ 
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'var(--champ-green-dark)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {getAbbreviatedName(p.profiles?.full_name, idx)}
                    </div>
                  </div>
                ))}
              </div>

              {backNineHoles.map((hole) => {
                const isCurrentHole = hole.hole_number === currentHole && !isReadOnly;
                return (
                  <div 
                    key={hole.hole_number}
                    onClick={() => !isReadOnly && onEditHole?.(hole.hole_number)}
                    className="ion-activatable"
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `48px 28px repeat(${safeParticipants.length}, 1fr)`,
                      gap: '4px',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                      alignItems: 'center',
                      cursor: isReadOnly ? 'default' : 'pointer',
                      position: 'relative',
                      backgroundColor: isCurrentHole ? 'var(--champ-gold-soft)' : 'transparent',
                      borderRadius: isCurrentHole ? '8px' : '0',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {!isReadOnly && <IonRippleEffect />}
                    <div className="champ-font-impact" style={{ 
                      fontSize: '14px',
                      color: 'var(--champ-green-dark)',
                      fontWeight: '500',
                      paddingLeft: isCurrentHole ? '8px' : '0'
                    }}>
                      {hole.hole_number}
                    </div>
                    <div className="champ-font-sans" style={{ 
                      fontSize: '12px',
                      color: 'var(--champ-gray)',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      {hole.par}
                    </div>
                    {safeParticipants.map(p => {
                      const score = getScore(p.user_id, hole.hole_number);
                      const handicapStrokes = calculateHandicapStrokes(p.user_id, hole.hole_number);
                      const style = getScoreStyle(score, hole.par, handicapStrokes);
                      return (
                        <div 
                          key={p.user_id} 
                          style={{ 
                            textAlign: 'center',
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <span style={style}>
                            {score || '-'}
                            {score && handicapStrokes > 0 && (
                              <sup style={{
                                fontSize: '8px',
                                marginLeft: '1px',
                                verticalAlign: 'super',
                                color: (score - hole.par - handicapStrokes === 0 || 
                                       score - hole.par - handicapStrokes <= -3 || 
                                       score - hole.par - handicapStrokes >= 3) ? 'black' : 'white',
                                fontWeight: 'bold'
                              }}>
                                +{handicapStrokes}
                              </sup>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {/* IN Total */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `48px 28px repeat(${safeParticipants.length}, 1fr)`,
                gap: '4px',
                padding: '10px 0',
                marginTop: '8px',
                backgroundColor: 'var(--champ-green-soft)',
                borderRadius: '6px'
              }}>
                <div className="champ-font-impact" style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  letterSpacing: '1px',
                  paddingLeft: '8px'
                }}>
                  IN
                </div>
                <div className="champ-font-sans" style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {parBack}
                </div>
                {safeParticipants.map(p => (
                  <div key={p.user_id} className="champ-font-impact" style={{ 
                    textAlign: 'center',
                    fontSize: '16px',
                    color: 'var(--champ-green-dark)'
                  }}>
                    {calculateTotal(p.user_id, 10, 18) || '-'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Grand Total - Only show in live game, not in completed view */}
        {!isReadOnly && (
        <div style={{
          background: 'linear-gradient(135deg, var(--champ-gold-soft) 0%, white 100%)',
          borderRadius: '12px',
          padding: '16px',
          border: '2px solid var(--champ-gold)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <IonIcon icon={trophyOutline} style={{ fontSize: '20px', color: 'var(--champ-gold)' }} />
            <h3 className="champ-font-impact" style={{
              fontSize: '16px',
              color: 'var(--champ-green-dark)',
              margin: 0,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Final Scores
            </h3>
            <IonIcon icon={trophyOutline} style={{ fontSize: '20px', color: 'var(--champ-gold)' }} />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `120px repeat(${safeParticipants.length}, 1fr)`,
            gap: '12px',
            alignItems: 'center'
          }}>
            <div className="champ-font-impact" style={{
              fontSize: '14px',
              color: 'var(--champ-green-dark)',
              letterSpacing: '1px'
            }}>
              COURSE PAR
            </div>
            {safeParticipants.map(() => (
              <div key={Math.random()} className="champ-font-sans" style={{ 
                textAlign: 'center',
                fontSize: '16px',
                color: 'var(--champ-green-dark)',
                fontWeight: '600'
              }}>
                {parTotal}
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '2px solid var(--champ-gold-light)'
          }}>
            {playerTotals.map((pt, idx) => {
              const toPar = getToPar(pt.total, parTotal);
              const isLeading = pt.total && pt.total === Math.min(...playerTotals.filter(p => p.total > 0).map(p => p.total));
              
              return (
                <div key={pt.participant.id || pt.participant.user_id} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: idx < playerTotals.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {isLeading && pt.total > 0 && (
                      <IonIcon 
                        icon={medalOutline}
                        style={{
                          fontSize: '18px',
                          color: 'var(--champ-gold)'
                        }}
                      />
                    )}
                    <div className="champ-font-sans" style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--champ-green-dark)'
                    }}>
                      {pt.participant.profiles?.full_name || `Player ${idx + 1}`}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px'
                  }}>
                    <span className="champ-font-sans" style={{
                      fontSize: '12px',
                      color: 'var(--champ-gray)'
                    }}>
                      {pt.front || '-'} / {pt.back || '-'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div className="champ-font-impact" style={{
                      fontSize: '24px',
                      color: 'var(--champ-green-dark)',
                      lineHeight: '1'
                    }}>
                      {pt.total || '-'}
                    </div>
                    <div className="champ-font-sans" style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: getToParColor(toPar),
                      padding: '2px 8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '12px'
                    }}>
                      {toPar}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Legend */}
        <div style={{ 
          marginTop: '20px',
          padding: '12px',
          background: 'var(--champ-pearl)',
          borderRadius: '8px',
          border: '1px solid var(--champ-gold-light)'
        }}>
          <div className="champ-font-impact" style={{
            fontSize: '10px',
            color: 'var(--champ-gray)',
            letterSpacing: '1px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            Scoring Legend
          </div>
          <div style={{ 
            display: 'flex',
            gap: '16px',
            fontSize: '10px',
            fontFamily: 'Montserrat, sans-serif',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-flex',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgba(220, 20, 60, 1)',
                border: '2px solid rgba(220, 20, 60, 1)',
                boxShadow: '0 0 0 1px white, 0 0 0 2.5px rgba(220, 20, 60, 1)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold'
              }}>2</span>
              <span style={{ color: 'var(--champ-gray)' }}>Eagle</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-flex',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 69, 0, 1)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold'
              }}>3</span>
              <span style={{ color: 'var(--champ-gray)' }}>Birdie</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-block',
                color: 'rgba(30, 30, 30, 1)',
                fontWeight: '500',
                fontSize: '12px'
              }}>4</span>
              <span style={{ color: 'var(--champ-gray)' }}>Par</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-flex',
                width: '18px',
                height: '18px',
                borderRadius: '2px',
                backgroundColor: 'rgba(65, 105, 225, 1)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold'
              }}>5</span>
              <span style={{ color: 'var(--champ-gray)' }}>Bogey</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-flex',
                width: '20px',
                height: '20px',
                borderRadius: '2px',
                backgroundColor: 'rgba(25, 25, 112, 1)',
                border: '2px solid rgba(25, 25, 112, 1)',
                boxShadow: '0 0 0 1px white, 0 0 0 2.5px rgba(25, 25, 112, 1)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold'
              }}>6</span>
              <span style={{ color: 'var(--champ-gray)' }}>Double+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorecardDisplay;
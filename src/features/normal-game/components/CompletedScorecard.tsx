import React from 'react';
import {
  IonIcon
} from '@ionic/react';
import { flagOutline } from 'ionicons/icons';
import '../../../styles/championship.css';

interface Participant {
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface Score {
  user_id: string;
  hole_number: number;
  strokes: number | null;
}

interface Hole {
  hole_number: number;
  par: number;
}

interface CompletedScorecardProps {
  participants: Participant[];
  scores: Score[];
  holes: Hole[];
  coursePar: number;
}

const CompletedScorecard: React.FC<CompletedScorecardProps> = ({
  participants,
  scores,
  holes,
  coursePar
}) => {
  // Helper function to get score for a player on a hole
  const getScore = (userId: string, holeNumber: number) => {
    const score = scores.find(
      s => s.user_id === userId && s.hole_number === holeNumber
    );
    return score?.strokes || null;
  };

  // Helper function to get score style based on performance
  const getScoreStyle = (strokes: number | null, par: number) => {
    if (strokes === null) return { color: 'var(--champ-gray-light)', fontWeight: '400' };
    
    const diff = strokes - par;
    
    if (diff <= -2) {
      // Eagle or better
      return {
        color: 'var(--champ-eagle)',
        fontWeight: '700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: '50%',
        display: 'inline-block',
        width: '24px',
        height: '24px',
        lineHeight: '24px'
      };
    }
    if (diff === -1) {
      // Birdie
      return {
        color: 'var(--champ-birdie)',
        fontWeight: '600'
      };
    }
    if (diff === 0) {
      // Par
      return {
        color: 'var(--champ-green-dark)',
        fontWeight: '500'
      };
    }
    if (diff === 1) {
      // Bogey
      return {
        color: 'var(--champ-bogey)',
        fontWeight: '500'
      };
    }
    // Double bogey or worse
    return {
      color: 'var(--champ-double)',
      fontWeight: '600'
    };
  };

  // Calculate totals for each player
  const calculateTotals = (userId: string) => {
    let frontNine = 0;
    let backNine = 0;
    let total = 0;
    
    for (let i = 1; i <= 18; i++) {
      const score = getScore(userId, i);
      if (score !== null) {
        total += score;
        if (i <= 9) {
          frontNine += score;
        } else {
          backNine += score;
        }
      }
    }
    
    return {
      frontNine: frontNine || '-',
      backNine: backNine || '-',
      total: total || '-',
      toPar: total ? (total - coursePar > 0 ? `+${total - coursePar}` : total - coursePar === 0 ? 'E' : `${total - coursePar}`) : '-'
    };
  };

  // Get abbreviated player names for mobile
  const getAbbreviatedName = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].substring(0, 8);
    return `${names[0].charAt(0)}. ${names[names.length - 1].substring(0, 6)}`;
  };

  // Mobile view - Championship scorecard
  return (
    <div className="scorecard-elite" style={{ marginTop: '20px' }}>
      {/* Scorecard Header */}
      <div className="scorecard-elite-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <IonIcon icon={flagOutline} style={{ fontSize: '20px', color: 'var(--champ-gold)' }} />
          <h3 className="champ-font-display" style={{
            fontSize: '16px',
            color: 'var(--champ-cream)',
            margin: 0,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            Official Scorecard
          </h3>
          <IonIcon icon={flagOutline} style={{ fontSize: '20px', color: 'var(--champ-gold)' }} />
        </div>
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: participants.length > 3 ? '500px' : 'auto', padding: '12px' }}>
          {/* Player Names Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `48px 24px repeat(${participants.length}, 1fr)`,
            gap: '4px',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '2px solid var(--champ-gold)'
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
              textTransform: 'uppercase'
            }}>
              Par
            </div>
            {participants.map(p => (
              <div key={p.user_id} style={{ textAlign: 'center' }}>
                <div className="champ-font-sans" style={{ 
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--champ-green-dark)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {getAbbreviatedName(p.profiles.full_name)}
                </div>
              </div>
            ))}
          </div>

          {/* Front Nine */}
          <div style={{ marginBottom: '8px' }}>
            {holes.slice(0, 9).map((hole) => (
              <div 
                key={hole.hole_number}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `48px 24px repeat(${participants.length}, 1fr)`,
                  gap: '4px',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  alignItems: 'center'
                }}
              >
                <div className="champ-font-impact" style={{ 
                  fontSize: '14px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '400'
                }}>
                  {hole.hole_number}
                </div>
                <div className="champ-font-sans" style={{ 
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  fontWeight: '500'
                }}>
                  {hole.par}
                </div>
                {participants.map(p => {
                  const score = getScore(p.user_id, hole.hole_number);
                  const style = getScoreStyle(score, hole.par);
                  return (
                    <div 
                      key={p.user_id} 
                      style={{ 
                        textAlign: 'center',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '13px'
                      }}
                    >
                      <span style={style}>
                        {score || '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* OUT Total */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `48px 24px repeat(${participants.length}, 1fr)`,
              gap: '4px',
              padding: '8px 0',
              marginTop: '4px',
              backgroundColor: 'var(--champ-green-soft)',
              borderRadius: '4px'
            }}>
              <div className="champ-font-impact" style={{
                fontSize: '12px',
                color: 'var(--champ-green-dark)',
                letterSpacing: '1px'
              }}>
                OUT
              </div>
              <div className="champ-font-sans" style={{
                fontSize: '11px',
                color: 'var(--champ-green-dark)',
                fontWeight: '600'
              }}>
                {holes.slice(0, 9).reduce((sum, h) => sum + h.par, 0)}
              </div>
              {participants.map(p => (
                <div key={p.user_id} className="champ-font-impact" style={{ 
                  textAlign: 'center',
                  fontSize: '16px',
                  color: 'var(--champ-green-dark)'
                }}>
                  {calculateTotals(p.user_id).frontNine}
                </div>
              ))}
            </div>
          </div>

          {/* Back Nine */}
          <div style={{ marginBottom: '8px' }}>
            {holes.slice(9, 18).map((hole) => (
              <div 
                key={hole.hole_number}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `48px 24px repeat(${participants.length}, 1fr)`,
                  gap: '4px',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  alignItems: 'center'
                }}
              >
                <div className="champ-font-impact" style={{ 
                  fontSize: '14px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '400'
                }}>
                  {hole.hole_number}
                </div>
                <div className="champ-font-sans" style={{ 
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  fontWeight: '500'
                }}>
                  {hole.par}
                </div>
                {participants.map(p => {
                  const score = getScore(p.user_id, hole.hole_number);
                  const style = getScoreStyle(score, hole.par);
                  return (
                    <div 
                      key={p.user_id} 
                      style={{ 
                        textAlign: 'center',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '13px'
                      }}
                    >
                      <span style={style}>
                        {score || '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* IN Total */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `48px 24px repeat(${participants.length}, 1fr)`,
              gap: '4px',
              padding: '8px 0',
              marginTop: '4px',
              backgroundColor: 'var(--champ-green-soft)',
              borderRadius: '4px'
            }}>
              <div className="champ-font-impact" style={{
                fontSize: '12px',
                color: 'var(--champ-green-dark)',
                letterSpacing: '1px'
              }}>
                IN
              </div>
              <div className="champ-font-sans" style={{
                fontSize: '11px',
                color: 'var(--champ-green-dark)',
                fontWeight: '600'
              }}>
                {holes.slice(9, 18).reduce((sum, h) => sum + h.par, 0)}
              </div>
              {participants.map(p => (
                <div key={p.user_id} className="champ-font-impact" style={{ 
                  textAlign: 'center',
                  fontSize: '16px',
                  color: 'var(--champ-green-dark)'
                }}>
                  {calculateTotals(p.user_id).backNine}
                </div>
              ))}
            </div>
          </div>

          {/* Total Score */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `48px 24px repeat(${participants.length}, 1fr)`,
            gap: '4px',
            padding: '12px 0',
            background: 'linear-gradient(90deg, var(--champ-gold-soft) 0%, transparent 100%)',
            borderRadius: '6px',
            border: '2px solid var(--champ-gold)',
            marginTop: '12px'
          }}>
            <div className="champ-font-impact" style={{
              fontSize: '14px',
              color: 'var(--champ-green-dark)',
              letterSpacing: '2px'
            }}>
              TOTAL
            </div>
            <div className="champ-font-sans" style={{
              fontSize: '12px',
              color: 'var(--champ-green-dark)',
              fontWeight: '700'
            }}>
              {coursePar}
            </div>
            {participants.map(p => {
              const totals = calculateTotals(p.user_id);
              return (
                <div key={p.user_id} style={{ textAlign: 'center' }}>
                  <div className="champ-font-impact" style={{ 
                    fontSize: '20px',
                    color: 'var(--champ-green-dark)',
                    lineHeight: '1'
                  }}>
                    {totals.total}
                  </div>
                  <div className="champ-font-sans" style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: totals.toPar === 'E' ? 'var(--champ-par)' :
                           totals.toPar?.startsWith('+') ? 'var(--champ-bogey)' :
                           'var(--champ-birdie)',
                    marginTop: '2px'
                  }}>
                    {totals.toPar}
                  </div>
                </div>
              );
            })}
          </div>

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
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid var(--champ-eagle)'
                }}></span>
                <span style={{ color: 'var(--champ-gray)' }}>Eagle</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'var(--champ-birdie)'
                }}></span>
                <span style={{ color: 'var(--champ-gray)' }}>Birdie</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'var(--champ-green-dark)'
                }}></span>
                <span style={{ color: 'var(--champ-gray)' }}>Par</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'var(--champ-bogey)'
                }}></span>
                <span style={{ color: 'var(--champ-gray)' }}>Bogey</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'var(--champ-double)'
                }}></span>
                <span style={{ color: 'var(--champ-gray)' }}>Double+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedScorecard;
import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonNote
} from '@ionic/react';

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

  // Helper function to get score color
  const getScoreColor = (strokes: number | null, par: number) => {
    if (strokes === null) return 'var(--ion-color-medium)';
    if (strokes === par - 2) return 'var(--ion-color-warning)'; // Eagle
    if (strokes === par - 1) return 'var(--ion-color-primary)'; // Birdie
    if (strokes === par) return 'var(--ion-text-color)'; // Par
    if (strokes === par + 1) return 'var(--ion-color-danger-shade)'; // Bogey
    if (strokes > par + 1) return 'var(--ion-color-danger)'; // Double bogey+
    return 'var(--ion-text-color)';
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
      total: total || '-'
    };
  };

  // Mobile view - simplified scorecard
  return (
    <IonCard>
      <IonCardContent style={{ padding: '8px' }}>
        {/* Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '60px repeat(' + participants.length + ', 1fr)',
          gap: '4px',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <div>Hole</div>
          {participants.map(p => (
            <div key={p.user_id} style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.profiles.full_name.split(' ')[0]}
            </div>
          ))}
        </div>

        {/* Front Nine */}
        <div style={{ fontSize: '11px' }}>
          {holes.slice(0, 9).map((hole) => (
            <div 
              key={hole.hole_number}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '60px repeat(' + participants.length + ', 1fr)',
                gap: '4px',
                padding: '4px 0',
                borderBottom: '1px solid var(--ion-color-light)'
              }}
            >
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>{hole.hole_number}</span>
                <IonNote style={{ fontSize: '10px' }}>({hole.par})</IonNote>
              </div>
              {participants.map(p => {
                const score = getScore(p.user_id, hole.hole_number);
                return (
                  <div 
                    key={p.user_id} 
                    style={{ 
                      textAlign: 'center',
                      fontWeight: '600',
                      color: getScoreColor(score, hole.par)
                    }}
                  >
                    {score || '-'}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* OUT Total */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px repeat(' + participants.length + ', 1fr)',
            gap: '4px',
            padding: '4px 0',
            borderBottom: '2px solid var(--ion-color-medium)',
            fontWeight: '700',
            backgroundColor: 'var(--ion-color-light)'
          }}>
            <div>OUT</div>
            {participants.map(p => (
              <div key={p.user_id} style={{ textAlign: 'center' }}>
                {calculateTotals(p.user_id).frontNine}
              </div>
            ))}
          </div>
        </div>

        {/* Back Nine */}
        <div style={{ fontSize: '11px', marginTop: '8px' }}>
          {holes.slice(9, 18).map((hole) => (
            <div 
              key={hole.hole_number}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '60px repeat(' + participants.length + ', 1fr)',
                gap: '4px',
                padding: '4px 0',
                borderBottom: '1px solid var(--ion-color-light)'
              }}
            >
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>{hole.hole_number}</span>
                <IonNote style={{ fontSize: '10px' }}>({hole.par})</IonNote>
              </div>
              {participants.map(p => {
                const score = getScore(p.user_id, hole.hole_number);
                return (
                  <div 
                    key={p.user_id} 
                    style={{ 
                      textAlign: 'center',
                      fontWeight: '600',
                      color: getScoreColor(score, hole.par)
                    }}
                  >
                    {score || '-'}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* IN Total */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px repeat(' + participants.length + ', 1fr)',
            gap: '4px',
            padding: '4px 0',
            borderBottom: '2px solid var(--ion-color-medium)',
            fontWeight: '700',
            backgroundColor: 'var(--ion-color-light)'
          }}>
            <div>IN</div>
            {participants.map(p => (
              <div key={p.user_id} style={{ textAlign: 'center' }}>
                {calculateTotals(p.user_id).backNine}
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px repeat(' + participants.length + ', 1fr)',
            gap: '4px',
            padding: '4px 0',
            fontWeight: '700',
            fontSize: '13px',
            backgroundColor: 'var(--ion-color-primary-tint)',
            color: 'var(--ion-color-primary-contrast)'
          }}>
            <div>TOTAL</div>
            {participants.map(p => {
              const total = calculateTotals(p.user_id).total;
              const diff = typeof total === 'number' ? total - coursePar : null;
              return (
                <div key={p.user_id} style={{ textAlign: 'center' }}>
                  {total}
                  {diff !== null && (
                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                      ({diff > 0 ? '+' : ''}{diff})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          backgroundColor: 'var(--ion-color-light)',
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          <div style={{ marginBottom: '4px', fontWeight: '600' }}>Score Colors:</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span><span style={{ color: 'var(--ion-color-warning)' }}>●</span> Eagle</span>
            <span><span style={{ color: 'var(--ion-color-primary)' }}>●</span> Birdie</span>
            <span><span style={{ color: 'var(--ion-text-color)' }}>●</span> Par</span>
            <span><span style={{ color: 'var(--ion-color-danger-shade)' }}>●</span> Bogey</span>
            <span><span style={{ color: 'var(--ion-color-danger)' }}>●</span> Double+</span>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default CompletedScorecard;
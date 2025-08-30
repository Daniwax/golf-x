import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonBadge,
  IonChip
} from '@ionic/react';
import { 
  trophyOutline, 
  medalOutline,
  ribbonOutline 
} from 'ionicons/icons';

interface Participant {
  user_id: string;
  profiles: {
    full_name: string;
  };
  tee_boxes?: {
    name: string;
  };
  handicap_index: number;
  total_strokes: number | null;
  net_score: number | null;
  course_handicap: number;
  holes_won?: number;
  holes_halved?: number;
  holes_lost?: number;
  position?: number;
}

interface CompletedLeaderboardProps {
  participants: Participant[];
  scoringFormat: 'match_play' | 'stroke_play';
  coursePar: number;
}

const CompletedLeaderboard: React.FC<CompletedLeaderboardProps> = ({
  participants,
  scoringFormat,
  coursePar
}) => {
  
  // Ensure participants is an array
  const safeParticipants = Array.isArray(participants) ? participants : [];
  
  // Handle empty participants
  if (safeParticipants.length === 0) {
    return (
      <IonCard>
        <IonCardContent>
          <p style={{ textAlign: 'center', color: '#666' }}>No participants to display</p>
        </IonCardContent>
      </IonCard>
    );
  }
  
  // Sort participants by total strokes
  const sortedParticipants = [...safeParticipants].sort((a, b) => {
    if (a.total_strokes === null) return 1;
    if (b.total_strokes === null) return -1;
    return a.total_strokes - b.total_strokes;
  });

  const getPositionIcon = (position: number) => {
    if (position === 1) return trophyOutline;
    if (position === 2) return medalOutline;
    if (position === 3) return ribbonOutline;
    return null;
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return 'warning';
    if (position === 2) return 'medium';
    if (position === 3) return 'tertiary';
    return 'medium';
  };

  const getScoreDisplay = (strokes: number | null) => {
    if (strokes === null) return '-';
    const diff = strokes - coursePar;
    if (diff === 0) return 'E';
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  const getPositionDisplay = (position: number) => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  // Calculate positions with ties
  const calculatePositions = () => {
    const withPositions = sortedParticipants.map((participant, index) => {
      let position = 1;
      if (participant.total_strokes !== null) {
        for (let i = 0; i < index; i++) {
          if (sortedParticipants[i].total_strokes !== null &&
              sortedParticipants[i].total_strokes! < participant.total_strokes) {
            position++;
          }
        }
      }
      return { ...participant, position };
    });
    return withPositions;
  };

  const leaderboard = calculatePositions();

  return (
    <>
      {/* Gross Leaderboard */}
      <IonCard>
        <IonCardContent>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Final Standings
          </h3>
          {leaderboard.map((participant) => {
            const icon = getPositionIcon(participant.position);
            const color = getPositionColor(participant.position);
            
            return (
              <IonItem 
                key={participant.user_id}
                style={{ 
                  '--padding-start': '0',
                  marginBottom: '8px',
                  border: participant.position === 1 ? '2px solid var(--ion-color-warning)' : 'none',
                  borderRadius: '8px'
                }}
              >
                <div 
                  slot="start" 
                  style={{ 
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}
                >
                  {icon ? (
                    <IonIcon 
                      icon={icon} 
                      style={{ 
                        fontSize: '24px',
                        color: `var(--ion-color-${color})`
                      }} 
                    />
                  ) : (
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '700',
                      color: 'var(--ion-color-medium)'
                    }}>
                      {participant.position}
                    </span>
                  )}
                </div>
                
                <IonLabel>
                  <h2 style={{ fontWeight: '600' }}>
                    {participant.profiles.full_name}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                    {participant.tee_boxes?.name} Tee • HCP {participant.handicap_index}
                  </p>
                </IonLabel>
                
                <div slot="end" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>
                    {participant.total_strokes || '-'}
                  </div>
                  <IonBadge 
                    color={participant.position === 1 ? 'success' : 'medium'}
                    style={{ fontSize: '12px' }}
                  >
                    {getScoreDisplay(participant.total_strokes)}
                  </IonBadge>
                </div>
              </IonItem>
            );
          })}
        </IonCardContent>
      </IonCard>

      {/* Match Play Results (if applicable) */}
      {scoringFormat === 'match_play' && (
        <IonCard>
          <IonCardContent>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
              Match Play Results
            </h3>
            <p style={{ 
              margin: '0 0 16px 0', 
              fontSize: '12px', 
              fontStyle: 'italic', 
              color: 'var(--ion-color-medium)' 
            }}>
              * Results include handicap strokes applied per hole based on stroke index
            </p>
            {leaderboard.map((participant) => (
              <div 
                key={participant.user_id}
                style={{ 
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: 'var(--ion-color-light)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontWeight: '600' }}>
                    {participant.profiles.full_name}
                  </span>
                  <IonChip color={participant.position === 1 ? 'success' : 'medium'}>
                    <IonLabel>{getPositionDisplay(participant.position)}</IonLabel>
                  </IonChip>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  fontSize: '13px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ color: 'var(--ion-color-success)', fontWeight: '600' }}>
                      {participant.holes_won || 0}
                    </div>
                    <IonNote>Won</IonNote>
                  </div>
                  <div>
                    <div style={{ color: 'var(--ion-color-medium)', fontWeight: '600' }}>
                      {participant.holes_halved || 0}
                    </div>
                    <IonNote>Halved</IonNote>
                  </div>
                  <div>
                    <div style={{ color: 'var(--ion-color-danger)', fontWeight: '600' }}>
                      {participant.holes_lost || 0}
                    </div>
                    <IonNote>Lost</IonNote>
                  </div>
                </div>
              </div>
            ))}
          </IonCardContent>
        </IonCard>
      )}

      {/* Net Scores (if handicaps were used) */}
      {leaderboard.some(p => p.net_score !== null) && (
        <IonCard>
          <IonCardContent>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              Net Scores
            </h3>
            {[...leaderboard]
              .sort((a, b) => {
                if (a.net_score === null) return 1;
                if (b.net_score === null) return -1;
                return a.net_score - b.net_score;
              })
              .map((participant, index) => (
                <div 
                  key={participant.user_id}
                  style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < leaderboard.length - 1 ? '1px solid var(--ion-color-light)' : 'none'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>
                      {participant.profiles.full_name}
                    </div>
                    <IonNote style={{ fontSize: '12px' }}>
                      Gross {participant.total_strokes} - HCP {participant.course_handicap}
                    </IonNote>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ion-color-primary)' }}>
                    {participant.net_score || '-'}
                  </div>
                </div>
              ))}
          </IonCardContent>
        </IonCard>
      )}
    </>
  );
};

export default CompletedLeaderboard;
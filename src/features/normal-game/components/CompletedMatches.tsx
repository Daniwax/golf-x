import React, { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonBadge
} from '@ionic/react';
import { 
  golfOutline, 
  trophyOutline,
  calendarOutline,
  peopleOutline
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { profileGameService, type CompletedGame } from '../services/profileGameService';
import { format } from 'date-fns';

interface CompletedMatchesProps {
  userId: string;
}

const CompletedMatches: React.FC<CompletedMatchesProps> = ({ userId }) => {
  const [games, setGames] = useState<CompletedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const ionRouter = useIonRouter();

  useEffect(() => {
    const loadCompletedGames = async () => {
      setLoading(true);
      try {
        const completedGames = await profileGameService.getUserCompletedGames(userId);
        setGames(completedGames);
      } catch (error) {
        console.error('Error loading completed games:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompletedGames();
  }, [userId]);


  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return '-';
    }
  };

  const getPositionDisplay = (position: number, totalPlayers: number) => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}/${totalPlayers}`;
  };

  const getScoreDisplay = (strokes: number | null, par: number) => {
    if (strokes === null) return '-';
    const diff = strokes - par;
    if (diff === 0) return 'E';
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  if (loading) {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Match History</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
          <IonSpinner name="crescent" />
          <p style={{ marginTop: '16px', color: 'var(--ion-color-medium)' }}>
            Loading match history...
          </p>
        </IonCardContent>
      </IonCard>
    );
  }

  if (games.length === 0) {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Match History</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
          <IonIcon 
            icon={golfOutline} 
            style={{ 
              fontSize: '64px', 
              color: 'var(--ion-color-medium)',
              marginBottom: '16px'
            }} 
          />
          <p style={{ color: 'var(--ion-color-medium)' }}>
            No completed matches yet
          </p>
          <p style={{ fontSize: '14px', color: 'var(--ion-color-medium)' }}>
            Your completed games will appear here
          </p>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Match History</IonCardTitle>
      </IonCardHeader>
      <IonCardContent style={{ paddingTop: 0, paddingBottom: 0 }}>
        {games.map((game) => (
          <IonItem 
            key={game.id}
            button
            detail={true}
            onClick={() => ionRouter.push(`/game/view/${game.id}`, 'forward', 'push')}
            style={{ '--padding-start': '0' }}
          >
            <IonLabel>
              <h2 style={{ fontWeight: '600', marginBottom: '4px' }}>
                {game.courseName}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                {game.clubName}
              </p>
              {game.gameDescription && (
                <p style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>
                  "{game.gameDescription}"
                </p>
              )}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '8px',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '13px',
                  color: 'var(--ion-color-medium)'
                }}>
                  <IonIcon icon={calendarOutline} style={{ fontSize: '16px' }} />
                  {formatDate(game.completedAt)}
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '13px',
                  color: 'var(--ion-color-medium)'
                }}>
                  <IonIcon icon={peopleOutline} style={{ fontSize: '16px' }} />
                  {game.totalPlayers} players
                </span>
                {game.winner && (
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '13px',
                    color: 'var(--ion-color-success)'
                  }}>
                    <IonIcon icon={trophyOutline} style={{ fontSize: '16px' }} />
                    {game.winner}
                  </span>
                )}
              </div>
            </IonLabel>
            <div slot="end" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>
                {game.totalStrokes || '-'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                {getScoreDisplay(game.totalStrokes, game.coursePar)}
              </div>
              <IonBadge 
                color={game.position === 1 ? 'success' : 'medium'}
                style={{ marginTop: '4px' }}
              >
                {getPositionDisplay(game.position, game.totalPlayers)}
              </IonBadge>
            </div>
          </IonItem>
        ))}
      </IonCardContent>
    </IonCard>
  );
};

export default CompletedMatches;
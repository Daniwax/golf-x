/**
 * LiveMatchCard component using new DataService architecture
 * This is a migration of the original LiveMatchCard.tsx
 */

import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonNote,
  IonIcon,
  IonChip
} from '@ionic/react';
import { 
  golfOutline, 
  playOutline, 
  peopleOutline,
  flagOutline,
  timeOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useLiveGamesWithNavigation } from '../../../hooks/useLiveGames';

const LiveMatchCardNew: React.FC = () => {
  const history = useHistory();
  const { data: liveGames, loading, error } = useLiveGamesWithNavigation(history);

  const handleContinueGame = (gameId: string) => {
    history.push(`/game/live/${gameId}`);
  };

  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Silent loading for home page
  if (loading) {
    return null;
  }

  // Handle errors silently (just don't show the card)
  if (error) {
    console.error('Error loading live games:', error);
    return null;
  }

  // No live games to show
  if (!liveGames || liveGames.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {liveGames.map((liveGame) => (
        <IonCard key={liveGame.game.id} style={{ marginBottom: '12px' }}>
          <IonCardHeader style={{ paddingBottom: '8px' }}>
            <IonCardTitle style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={golfOutline} />
                Live Game
              </span>
              <IonChip color="success" style={{ height: '24px', fontSize: '11px' }}>
                <IonIcon icon={playOutline} style={{ fontSize: '12px', marginRight: '4px' }} />
                In Progress
              </IonChip>
            </IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={flagOutline} color="medium" style={{ fontSize: '14px' }} />
                    <IonNote style={{ fontSize: '13px' }}>
                      Hole {liveGame.currentHole}/18
                    </IonNote>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={peopleOutline} color="medium" style={{ fontSize: '14px' }} />
                    <IonNote style={{ fontSize: '13px' }}>
                      {liveGame.participants?.length || 0} players
                    </IonNote>
                  </div>
                </div>
                <IonNote style={{ fontSize: '12px' }}>
                  <IonIcon icon={timeOutline} style={{ fontSize: '12px', marginRight: '4px' }} />
                  {getTimeAgo(liveGame.game.created_at)}
                </IonNote>
              </div>
              
              {/* Progress bar */}
              <div style={{ 
                width: '100%', 
                height: '6px', 
                backgroundColor: 'var(--ion-color-light)', 
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${(liveGame.holesCompleted / 18) * 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--ion-color-primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <IonNote style={{ fontSize: '12px' }}>
                {Math.round((liveGame.holesCompleted / 18) * 100)}% complete • {liveGame.game.scoring_format?.replace('_', ' ') || 'stroke play'}
              </IonNote>
            </div>
            
            <IonButton 
              expand="block" 
              onClick={() => handleContinueGame(liveGame.game.id)}
            >
              <IonIcon icon={playOutline} slot="start" />
              Continue Game
            </IonButton>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );
};

export default LiveMatchCardNew;
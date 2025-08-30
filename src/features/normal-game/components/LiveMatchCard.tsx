import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonIcon,
  IonChip
} from '@ionic/react';
import { 
  golfOutline, 
  playOutline, 
  peopleOutline,
  flagOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useLiveGamesWithNavigation } from '../../../hooks/useLiveGames';

const LiveMatchCard: React.FC = () => {
  const history = useHistory();
  const { data: liveGames, loading } = useLiveGamesWithNavigation(history);

  const handleContinueGame = (gameId: string) => {
    history.push(`/game/live/${gameId}`);
  };

  if (loading && !liveGames) {
    return null; // Silent loading for home page only on initial load
  }

  if (!liveGames || liveGames.length === 0) {
    return null; // No live games to show
  }

  // Always use condensed view for all games
  return (
    <IonCard style={{ marginBottom: '16px' }}>
      <IonCardHeader style={{ paddingBottom: '8px' }}>
        <IonCardTitle style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={golfOutline} />
            Active Games
          </span>
          <IonChip color="success" style={{ height: '24px', fontSize: '11px' }}>
            <IonIcon icon={playOutline} style={{ fontSize: '12px', marginRight: '4px' }} />
            {liveGames.length} {liveGames.length === 1 ? 'Game' : 'Games'}
          </IonChip>
        </IonCardTitle>
      </IonCardHeader>
      
      <IonCardContent>
        {liveGames.map((liveGame, index) => (
          <div key={liveGame.game.id} style={{ 
            marginBottom: index < liveGames.length - 1 ? '12px' : '0',
            paddingBottom: index < liveGames.length - 1 ? '12px' : '0',
            borderBottom: index < liveGames.length - 1 ? '1px solid var(--ion-color-light)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                  Game {index + 1}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <IonNote style={{ fontSize: '12px' }}>
                    <IonIcon icon={flagOutline} style={{ fontSize: '12px', marginRight: '2px' }} />
                    Hole {liveGame.currentHole}/{liveGame.totalHoles}
                  </IonNote>
                  <IonNote style={{ fontSize: '12px' }}>
                    <IonIcon icon={peopleOutline} style={{ fontSize: '12px', marginRight: '2px' }} />
                    {liveGame.participants?.length || 0}
                  </IonNote>
                  <IonNote style={{ fontSize: '12px' }}>
                    {Math.round((liveGame.holesCompleted / liveGame.totalHoles) * 100)}%
                  </IonNote>
                </div>
              </div>
              <div 
                onClick={() => handleContinueGame(liveGame.game.id)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(42, 84, 52, 0.05)',
                  transition: 'all 0.2s ease',
                  margin: '-8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(42, 84, 52, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(42, 84, 52, 0.05)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <IonIcon 
                  icon={chevronForwardOutline} 
                  style={{ 
                    fontSize: '24px', 
                    color: '#2a5434' 
                  }} 
                />
              </div>
            </div>
          </div>
        ))}
      </IonCardContent>
    </IonCard>
  );
};

export default LiveMatchCard;
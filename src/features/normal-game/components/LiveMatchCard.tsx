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

const LiveMatchCard: React.FC = () => {
  const history = useHistory();
  const { data: liveGames, loading } = useLiveGamesWithNavigation(history);

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

  if (loading && !liveGames) {
    return null; // Silent loading for home page only on initial load
  }

  if (!liveGames || liveGames.length === 0) {
    return null; // No live games to show
  }

  // Show condensed view for 3+ games
  const showCondensed = liveGames.length >= 3;

  if (showCondensed) {
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
              {liveGames.length} Games
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
                <IonButton 
                  size="small"
                  onClick={() => handleContinueGame(liveGame.game.id)}
                  style={{ 
                    '--padding-start': '12px', 
                    '--padding-end': '12px',
                    '--background': '#2a5434',
                    '--background-activated': '#3d7c47',
                    '--background-hover': '#3d7c47'
                  }}
                >
                  <IonIcon icon={playOutline} slot="icon-only" />
                </IonButton>
              </div>
            </div>
          ))}
        </IonCardContent>
      </IonCard>
    );
  }

  // Show detailed view for 1-2 games
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
                      Hole {liveGame.currentHole}/{liveGame.totalHoles}
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
                  width: `${(liveGame.holesCompleted / liveGame.totalHoles) * 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--ion-color-primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <IonNote style={{ fontSize: '12px' }}>
                {Math.round((liveGame.holesCompleted / liveGame.totalHoles) * 100)}% complete • {liveGame.game.scoring_format.replace('_', ' ')}
              </IonNote>
            </div>
            
            <IonButton 
              expand="block" 
              onClick={() => handleContinueGame(liveGame.game.id)}
              style={{
                '--background': '#2a5434',
                '--background-activated': '#3d7c47',
                '--background-hover': '#3d7c47'
              }}
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

export default LiveMatchCard;
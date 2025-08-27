import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '../../../lib/supabase';
import { gameService } from '../services/gameService';
import type { Game, GameParticipant } from '../types';

interface LiveGame {
  game: Game;
  participants: GameParticipant[];
  currentHole: number;
  holesCompleted: number;
}

const LiveMatchCard: React.FC = () => {
  const history = useHistory();
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserAndGames = useCallback(async () => {
    try {
      // Get current user
      if (!supabase) {
        console.log('Supabase not initialized');
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in');
        return;
      }
      
      console.log('Loading games for user:', user.id);
      
      // Load active games where user is a participant
      const { data: games, error } = await supabase
        .from('games')
        .select(`
          *,
          game_participants!inner(*)
        `)
        .eq('game_participants.user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading live games:', error);
        return;
      }

      console.log('Found active games:', games?.length || 0);

      if (!games || games.length === 0) {
        setLiveGames([]);
        return;
      }

      // Load detailed info for each game
      const liveGameData = (await Promise.all(
        games.map(async (game) => {
          try {
            const gameDetails = await gameService.getGameDetails(game.id);
            
            // Calculate current hole and holes completed
            const scoresWithStrokes = gameDetails.scores.filter(s => s.strokes);
            const holesPlayed = new Set(scoresWithStrokes.map(s => s.hole_number));
            const holesCompleted = holesPlayed.size;
            const currentHole = Math.min(Math.max(...Array.from(holesPlayed), 0) + 1, 18);
            
            return {
              game: gameDetails.game,
              participants: gameDetails.participants,
              currentHole,
              holesCompleted
            };
          } catch (err) {
            console.error('Error loading game details:', err);
            return null;
          }
        })
      )).filter((game): game is LiveGame => game !== null);

      setLiveGames(liveGameData.filter(g => g !== null) as LiveGame[]);
    } catch (error) {
      console.error('Error loading live games:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserAndGames();
  }, [loadUserAndGames]);

  // Reload games when navigating back to home page
  useEffect(() => {
    const unlistenHistory = history.listen((location) => {
      if (location.pathname === '/home') {
        console.log('Navigated to home - reloading live games');
        // Small delay to ensure navigation is complete
        setTimeout(() => loadUserAndGames(), 100);
      }
    });

    return unlistenHistory;
  }, [history, loadUserAndGames]);

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

  if (loading) {
    return null; // Silent loading for home page
  }

  if (liveGames.length === 0) {
    return null; // No live games to show
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
                {Math.round((liveGame.holesCompleted / 18) * 100)}% complete • {liveGame.game.scoring_format.replace('_', ' ')}
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

export default LiveMatchCard;
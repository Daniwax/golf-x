import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonNote
} from '@ionic/react';
import { 
  trophyOutline, 
  flagOutline, 
  calendarOutline,
  locationOutline,
  peopleOutline
} from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { dataService } from '../services/data/DataService';

interface GameHistory {
  id: string; // UUID, not number!
  name: string;
  date: string;
  courseName: string;
  teeBox: string;
  status: string;
  totalStrokes?: number;
  netScore?: number;
  numHoles: number;
  gameType: string;
  participants: number;
}

const MatchHistory: React.FC = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'completed' | 'active'>('all');

  useEffect(() => {
    if (user?.id) {
      loadGames();
    }
  }, [user]);

  const loadGames = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get both completed and active games
      const [completedGames, activeGames] = await Promise.all([
        dataService.games.getUserGameHistory(user.id, 50),
        dataService.games.getUserActiveGames(user.id)
      ]);
      
      // Format completed games - game.id is a UUID string from CompletedGame
      const formattedCompleted: GameHistory[] = completedGames.map((game: any) => ({
        id: game.id || `completed-${Date.now()}-${Math.random()}`, // Keep as string UUID
        name: game.gameDescription || `Game at ${game.courseName}`,
        date: game.completedAt ? new Date(game.completedAt).toLocaleDateString() : 'Unknown date',
        courseName: game.courseName || 'Unknown Course',
        teeBox: 'Default',
        status: 'completed',
        totalStrokes: game.totalStrokes,
        netScore: game.netScore,
        numHoles: 18,
        gameType: game.scoringFormat || 'stroke_play',
        participants: game.totalPlayers || 1
      }));
      
      // Format active games
      const formattedActive: GameHistory[] = activeGames.map((game: any) => ({
        id: game.id || `active-${Date.now()}-${Math.random()}`, // Keep as string UUID
        name: game.game_description || `Active Game`,
        date: new Date(game.created_at).toLocaleDateString(),
        courseName: 'In Progress',
        teeBox: 'Default',
        status: 'in_progress',
        totalStrokes: game.game_participants?.[0]?.total_strokes || null,
        netScore: game.game_participants?.[0]?.net_score || null,
        numHoles: 18,
        gameType: game.scoring_format || 'stroke_play',
        participants: game.game_participants?.length || 1
      }));
      
      // Combine and sort by date (most recent first)
      const allGames = [...formattedActive, ...formattedCompleted];
      setGames(allGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    if (selectedSegment === 'completed') return game.status === 'completed';
    if (selectedSegment === 'active') return game.status === 'in_progress';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      default: return 'medium';
    }
  };

  const getGameTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'stroke_play': 'Stroke Play',
      'match_play': 'Match Play',
      'skins': 'Skins',
      'stableford': 'Stableford'
    };
    return types[type] || type;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Match History</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div style={{ padding: '16px' }}>
          <IonSegment 
            value={selectedSegment} 
            onIonChange={e => setSelectedSegment(e.detail.value as any)}
            style={{ marginBottom: '16px' }}
          >
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completed</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="active">
              <IonLabel>Active</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px' 
            }}>
              <IonSpinner />
            </div>
          ) : filteredGames.length === 0 ? (
            <IonCard>
              <IonCardContent style={{ textAlign: 'center', padding: '40px 20px' }}>
                <IonIcon 
                  icon={flagOutline} 
                  style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }} 
                />
                <p style={{ color: '#666' }}>
                  {selectedSegment === 'all' 
                    ? 'No games found. Start playing to see your history!'
                    : `No ${selectedSegment} games found.`}
                </p>
              </IonCardContent>
            </IonCard>
          ) : (
            filteredGames.map(game => (
              <IonCard 
                key={game.id} 
                button 
                routerLink={game.status === 'completed' ? `/game/view/${game.id}` : `/game/live/${game.id}`}
                style={{ marginBottom: '12px' }}
              >
                <IonCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <IonCardTitle style={{ fontSize: '18px' }}>{game.name}</IonCardTitle>
                      <IonBadge color={getStatusColor(game.status)} style={{ marginTop: '8px' }}>
                        {game.status.replace('_', ' ').toUpperCase()}
                      </IonBadge>
                    </div>
                    {game.totalStrokes && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                          {game.totalStrokes}
                        </div>
                        <IonNote>strokes</IonNote>
                      </div>
                    )}
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={locationOutline} style={{ fontSize: '16px', color: '#666' }} />
                      <span style={{ fontSize: '14px' }}>
                        {game.courseName} • {game.teeBox} Tees • {game.numHoles} Holes
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={calendarOutline} style={{ fontSize: '16px', color: '#666' }} />
                      <span style={{ fontSize: '14px' }}>{game.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonIcon icon={trophyOutline} style={{ fontSize: '16px', color: '#666' }} />
                        <span style={{ fontSize: '14px' }}>{getGameTypeLabel(game.gameType)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonIcon icon={peopleOutline} style={{ fontSize: '16px', color: '#666' }} />
                        <span style={{ fontSize: '14px' }}>{game.participants} players</span>
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MatchHistory;
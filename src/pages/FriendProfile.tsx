import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonAvatar,
  IonToast,
  IonSpinner,
  IonBackButton,
  IonButtons,
  IonNote,
  IonActionSheet,
  IonAlert,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonList
} from '@ionic/react';
import { 
  golfOutline,
  locationOutline,
  trophyOutline,
  statsChartOutline,
  personRemoveOutline,
  ellipsisHorizontalOutline,
  flagOutline,
  peopleOutline,
  calendarOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { getFriendProfile, removeFriend, type UserProfile } from '../lib/friends';
import { supabase } from '../lib/supabase';

interface RouteParams {
  id: string;
}

interface GameStats {
  totalGames: number;
  gamesWithFriend: number;
  bestScore: number | null;
  averageScore: number | null;
  lastPlayed: string | null;
  winRate: number;
  coursesPlayed: string[];
  recentScores: number[];
}

interface RecentGame {
  id: string;
  course_name: string;
  played_at: string;
  my_score: number;
  friend_score: number;
  result: 'won' | 'lost' | 'tied';
}

interface GameWithCourse {
  games: Array<{
    id: any;
    status?: any;
    course_id: any;
    created_at: string;
    golf_courses: Array<{
      name: string;
    }>;
  }>;
}

const FriendProfile: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [friend, setFriend] = useState<UserProfile | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    loadData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user ID
      if (!supabase) throw new Error('Supabase not initialized');
      const { data: { user } } = await supabase.auth.getUser();

      // Load friend profile
      const { data, error } = await getFriendProfile(id);
      
      if (error) {
        showMessage(error, 'danger');
        setTimeout(() => history.goBack(), 2000);
      } else if (data) {
        setFriend(data);
        
        // Load game stats
        if (user) {
          await loadGameStats(user.id, id);
          await loadRecentGames(user.id, id);
        }
      }
    } catch (error) {
      console.error('Error loading friend profile:', error);
      showMessage('Failed to load friend profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadGameStats = async (userId: string, friendId: string) => {
    if (!supabase) return;

    try {
      // Get all games where both players participated
      const { data: userGames } = await supabase
        .from('game_participants')
        .select('game_id')
        .eq('user_id', userId);

      if (!userGames || userGames.length === 0) {
        setGameStats({
          totalGames: 0,
          gamesWithFriend: 0,
          bestScore: null,
          averageScore: null,
          lastPlayed: null,
          winRate: 0,
          coursesPlayed: [],
          recentScores: []
        });
        return;
      }

      const gameIds = userGames.map(g => g.game_id);

      // Get games where friend also participated
      const { data: friendGames } = await supabase
        .from('game_participants')
        .select(`
          game_id,
          total_strokes,
          games!inner(
            id,
            status,
            course_id,
            created_at,
            golf_courses(name)
          )
        `)
        .eq('user_id', friendId)
        .in('game_id', gameIds)
        .eq('games.status', 'completed');

      if (!friendGames || friendGames.length === 0) {
        setGameStats({
          totalGames: 0,
          gamesWithFriend: 0,
          bestScore: null,
          averageScore: null,
          lastPlayed: null,
          winRate: 0,
          coursesPlayed: [],
          recentScores: []
        });
        return;
      }

      // Get user's scores in those games
      const sharedGameIds = friendGames.map(g => g.game_id);
      const { data: userScores } = await supabase
        .from('game_participants')
        .select('game_id, total_strokes')
        .eq('user_id', userId)
        .in('game_id', sharedGameIds);

      // Calculate stats
      const friendScores = friendGames
        .filter(g => g.total_strokes && g.total_strokes > 0)
        .map(g => g.total_strokes);

      const scores = friendScores as number[];
      const bestScore = scores.length > 0 ? Math.min(...scores) : null;
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : null;

      // Calculate win rate
      let wins = 0;
      let losses = 0;
      let ties = 0;

      if (userScores) {
        friendGames.forEach(friendGame => {
          const userGame = userScores.find(u => u.game_id === friendGame.game_id);
          if (userGame && userGame.total_strokes && friendGame.total_strokes) {
            if (userGame.total_strokes < friendGame.total_strokes) wins++;
            else if (userGame.total_strokes > friendGame.total_strokes) losses++;
            else ties++;
          }
        });
      }

      const totalMatchups = wins + losses + ties;
      const winRate = totalMatchups > 0 ? Math.round((wins / totalMatchups) * 100) : 0;

      // Get unique courses
      const coursesSet = new Set<string>();
      friendGames.forEach(g => {
        const gameData = g as GameWithCourse;
        if (gameData.games?.[0]?.golf_courses?.[0]?.name) {
          coursesSet.add(gameData.games[0].golf_courses[0].name);
        }
      });

      // Get last played date
      const lastGame = friendGames
        .sort((a, b) => new Date((b as GameWithCourse).games[0].created_at).getTime() - new Date((a as GameWithCourse).games[0].created_at).getTime())[0];

      // Get recent scores (last 5)
      const recentScores = scores.slice(-5);

      setGameStats({
        totalGames: friendGames.length,
        gamesWithFriend: friendGames.length,
        bestScore,
        averageScore,
        lastPlayed: (lastGame as GameWithCourse | undefined)?.games?.[0]?.created_at || null,
        winRate,
        coursesPlayed: Array.from(coursesSet),
        recentScores
      });
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };

  const loadRecentGames = async (userId: string, friendId: string) => {
    if (!supabase) return;

    try {
      // Get recent games played together
      const { data: userGames } = await supabase
        .from('game_participants')
        .select(`
          game_id,
          total_strokes,
          games!inner(
            id,
            created_at,
            golf_courses(name)
          )
        `)
        .eq('user_id', userId)
        .eq('games.status', 'completed')
        .order('games.created_at', { ascending: false })
        .limit(50);

      if (!userGames) return;

      // Get friend's scores in those games
      const gameIds = userGames.map(g => g.game_id);
      const { data: friendGames } = await supabase
        .from('game_participants')
        .select('game_id, total_strokes')
        .eq('user_id', friendId)
        .in('game_id', gameIds);

      if (!friendGames) return;

      // Build recent games list
      const recent: RecentGame[] = [];
      userGames.forEach(userGame => {
        const friendGame = friendGames.find(f => f.game_id === userGame.game_id);
        if (friendGame && userGame.total_strokes && friendGame.total_strokes) {
          let result: 'won' | 'lost' | 'tied' = 'tied';
          if (userGame.total_strokes < friendGame.total_strokes) result = 'won';
          else if (userGame.total_strokes > friendGame.total_strokes) result = 'lost';

          const userGameData = userGame as GameWithCourse;
          recent.push({
            id: userGame.game_id,
            course_name: userGameData.games?.[0]?.golf_courses?.[0]?.name || 'Unknown Course',
            played_at: userGameData.games?.[0]?.created_at || '',
            my_score: userGame.total_strokes,
            friend_score: friendGame.total_strokes,
            result
          });
        }
      });

      setRecentGames(recent.slice(0, 5)); // Keep only 5 most recent
    } catch (error) {
      console.error('Error loading recent games:', error);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friend) return;
    
    history.replace('/friends');
    showMessage('Friend removed', 'success');
    
    removeFriend(friend.id).catch(error => {
      console.error('Failed to remove friend:', error);
    });
  };

  const handleRemoveClick = () => {
    setShowActionSheet(false);
    setShowRemoveAlert(true);
  };

  const showMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadData();
    const target = event.target as HTMLIonRefresherElement;
    target.complete();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/friends" />
            </IonButtons>
            <IonTitle>Friend Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            gap: '16px'
          }}>
            <IonSpinner name="crescent" style={{ '--color': '#667eea' }} />
            <IonNote>Loading friend profile...</IonNote>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!friend) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/friends" />
            </IonButtons>
            <IonTitle>Friend Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <IonNote>Friend not found</IonNote>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="friend-profile-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/friends" />
          </IonButtons>
          <IonTitle>{friend.full_name || 'Friend'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowActionSheet(true)}>
              <IonIcon icon={ellipsisHorizontalOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Profile Header - Hero Style */}
        <div className="profile-hero">
          <div className="profile-avatar-container">
            <IonAvatar className="profile-avatar">
              {(friend.custom_avatar_url || friend.avatar_url) ? (
                <img 
                  src={friend.custom_avatar_url || friend.avatar_url || undefined} 
                  alt={friend.full_name || 'Friend'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).nextElementSibling;
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className="avatar-fallback" style={{ 
                display: (friend.custom_avatar_url || friend.avatar_url) ? 'none' : 'flex'
              }}>
                {friend.full_name?.[0] || friend.email?.[0] || '?'}
              </div>
            </IonAvatar>
          </div>
          
          <h1 className="profile-name">{friend.full_name || 'Golf Friend'}</h1>
          <p className="profile-email">{friend.email}</p>
          
          {friend.bio && (
            <p className="profile-bio">{friend.bio}</p>
          )}

          {/* Quick Stats Bar */}
          <div className="quick-stats">
            <div className="quick-stat">
              <div className="stat-value">{friend.handicap || '--'}</div>
              <div className="stat-label">Handicap</div>
            </div>
            <div className="quick-stat">
              <div className="stat-value">{gameStats?.gamesWithFriend || 0}</div>
              <div className="stat-label">Games Together</div>
            </div>
            <div className="quick-stat">
              <div className="stat-value">{gameStats?.winRate || 0}%</div>
              <div className="stat-label">Your Win Rate</div>
            </div>
          </div>
        </div>

        <div className="ion-padding">
          {/* Performance Stats */}
          {gameStats && gameStats.totalGames > 0 && (
            <IonCard className="stats-card">
              <IonCardHeader>
                <IonCardTitle>Performance Together</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="stats-grid">
                  <div className="stat-item">
                    <IonIcon icon={trophyOutline} className="stat-icon success" />
                    <div className="stat-content">
                      <div className="stat-number">{gameStats.bestScore || '--'}</div>
                      <div className="stat-desc">Best Score</div>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <IonIcon icon={statsChartOutline} className="stat-icon primary" />
                    <div className="stat-content">
                      <div className="stat-number">{gameStats.averageScore || '--'}</div>
                      <div className="stat-desc">Avg Score</div>
                    </div>
                  </div>

                  <div className="stat-item">
                    <IonIcon icon={calendarOutline} className="stat-icon warning" />
                    <div className="stat-content">
                      <div className="stat-number">
                        {gameStats.lastPlayed ? formatDate(gameStats.lastPlayed) : 'Never'}
                      </div>
                      <div className="stat-desc">Last Played</div>
                    </div>
                  </div>

                  <div className="stat-item">
                    <IonIcon icon={flagOutline} className="stat-icon secondary" />
                    <div className="stat-content">
                      <div className="stat-number">{gameStats.coursesPlayed.length}</div>
                      <div className="stat-desc">Courses</div>
                    </div>
                  </div>
                </div>

                {gameStats.recentScores.length > 0 && (
                  <div className="recent-scores">
                    <h4>Recent Scores</h4>
                    <div className="scores-list">
                      {gameStats.recentScores.map((score, index) => (
                        <div key={index} className="score-badge">
                          {score}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {/* Recent Games Together */}
          {recentGames.length > 0 && (
            <IonCard className="games-card">
              <IonCardHeader>
                <IonCardTitle>Recent Games Together</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {recentGames.map((game) => (
                    <IonItem key={game.id} lines="full">
                      <div className="game-item">
                        <div className="game-info">
                          <h4>{game.course_name}</h4>
                          <p>{formatDate(game.played_at)}</p>
                        </div>
                        <div className="game-scores">
                          <div className={`score ${game.result === 'won' ? 'winner' : ''}`}>
                            <span className="score-label">You</span>
                            <span className="score-value">{game.my_score}</span>
                          </div>
                          <div className={`score ${game.result === 'lost' ? 'winner' : ''}`}>
                            <span className="score-label">Friend</span>
                            <span className="score-value">{game.friend_score}</span>
                          </div>
                          <IonBadge 
                            color={game.result === 'won' ? 'success' : game.result === 'lost' ? 'danger' : 'medium'}
                            className="result-badge"
                          >
                            {game.result === 'won' ? 'W' : game.result === 'lost' ? 'L' : 'T'}
                          </IonBadge>
                        </div>
                      </div>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}

          {/* No Games Message */}
          {(!gameStats || gameStats.totalGames === 0) && (
            <IonCard className="empty-card">
              <IonCardContent>
                <div className="empty-state">
                  <IonIcon icon={golfOutline} />
                  <h3>No games played together yet</h3>
                  <p>Start a game with your friend to see stats here</p>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* Friend Details */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {friend.home_course && (
                <IonItem lines="none">
                  <IonIcon icon={locationOutline} slot="start" />
                  <IonLabel>
                    <h3>Home Course</h3>
                    <p>{friend.home_course}</p>
                  </IonLabel>
                </IonItem>
              )}
              <IonItem lines="none">
                <IonIcon icon={peopleOutline} slot="start" />
                <IonLabel>
                  <h3>Friends Since</h3>
                  <p>{new Date(friend.created_at).toLocaleDateString()}</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>
        </div>

        {/* CSS Styles */}
        <style>{`
          .friend-profile-page {
            --ion-background-color: #f8f9fa;
          }

          .profile-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 32px 16px 24px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
          }

          .profile-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            pointer-events: none;
          }

          .profile-avatar-container {
            position: relative;
            z-index: 1;
          }

          .profile-avatar {
            width: 100px;
            height: 100px;
            margin: 0 auto 16px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .avatar-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            color: #667eea;
            font-size: 36px;
            font-weight: bold;
          }

          .profile-name {
            margin: 0 0 4px;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
          }

          .profile-email {
            margin: 0 0 16px;
            opacity: 0.9;
            font-size: 14px;
            position: relative;
            z-index: 1;
          }

          .profile-bio {
            margin: 0 0 24px;
            opacity: 0.95;
            font-size: 15px;
            line-height: 1.4;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
            position: relative;
            z-index: 1;
          }

          .quick-stats {
            display: flex;
            justify-content: space-around;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 16px;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 1;
          }

          .quick-stat {
            text-align: center;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            opacity: 0.9;
            letter-spacing: 0.5px;
          }

          .stats-card,
          .games-card,
          .empty-card {
            margin-bottom: 16px;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 24px;
          }

          .stat-item {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .stat-icon {
            font-size: 32px;
            flex-shrink: 0;
          }

          .stat-icon.success {
            color: var(--ion-color-success);
          }

          .stat-icon.primary {
            color: var(--ion-color-primary);
          }

          .stat-icon.warning {
            color: var(--ion-color-warning);
          }

          .stat-icon.secondary {
            color: var(--ion-color-secondary);
          }

          .stat-content {
            flex: 1;
          }

          .stat-number {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
          }

          .stat-desc {
            font-size: 12px;
            color: #6b7280;
          }

          .recent-scores {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }

          .recent-scores h4 {
            margin: 0 0 12px;
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .scores-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .score-badge {
            background: #f3f4f6;
            color: #1f2937;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }

          .game-item {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
          }

          .game-info h4 {
            margin: 0 0 4px;
            font-size: 15px;
            color: #1f2937;
          }

          .game-info p {
            margin: 0;
            font-size: 12px;
            color: #6b7280;
          }

          .game-scores {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .score {
            text-align: center;
          }

          .score-label {
            display: block;
            font-size: 10px;
            color: #9ca3af;
            text-transform: uppercase;
            margin-bottom: 2px;
          }

          .score-value {
            display: block;
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
          }

          .score.winner .score-value {
            color: var(--ion-color-success);
          }

          .result-badge {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: 700;
            font-size: 12px;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
          }

          .empty-state ion-icon {
            font-size: 64px;
            color: #d1d5db;
            margin-bottom: 16px;
          }

          .empty-state h3 {
            margin: 0 0 8px;
            font-size: 18px;
            color: #1f2937;
          }

          .empty-state p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }
        `}</style>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Remove Friend',
              role: 'destructive',
              icon: personRemoveOutline,
              handler: handleRemoveClick
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]}
        />

        <IonAlert
          isOpen={showRemoveAlert}
          onDidDismiss={() => setShowRemoveAlert(false)}
          header="Remove Friend?"
          message={`Are you sure you want to remove ${friend?.full_name || 'this friend'}?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Remove',
              cssClass: 'danger',
              handler: handleRemoveFriend
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastColor}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default FriendProfile;
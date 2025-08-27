import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonIcon,
  IonChip,
  IonNote
} from '@ionic/react';
import { 
  trophyOutline,
  calendarOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { profileGameService } from '../services/profileGameService';
import ScorecardDisplay from './ScorecardDisplay';
import CompletedLeaderboard from './CompletedLeaderboard';
import { calculateMatchPlayResults } from '../utils/handicapCalculations';

interface GameData {
  game: {
    id: string;
    game_description?: string;
    scoring_format: 'match_play' | 'stroke_play';
    weather_condition?: string;
    completed_at: string;
    golf_courses: {
      name: string;
      par: number;
      golf_clubs: {
        name: string;
      };
    };
  };
  participants: Array<{
    user_id: string;
    total_strokes: number | null;
    profiles: {
      full_name: string;
    };
    tee_boxes?: {
      name: string;
    };
    handicap_index: number;
    net_score: number | null;
    course_handicap: number;
    holes_won?: number;
    holes_halved?: number;
    holes_lost?: number;
  }>;
  scores: Array<{
    user_id: string;
    hole_number: number;
    strokes: number | null;
  }>;
  holes: Array<{
    hole_number: number;
    par: number;
  }>;
}

interface ViewCompletedGameParams {
  gameId: string;
}

const ViewCompletedGame: React.FC = () => {
  const { gameId } = useParams<ViewCompletedGameParams>();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState<'scorecard' | 'leaderboard'>('scorecard');
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData | null>(null);

  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      try {
        const data = await profileGameService.getGameDetails(gameId);
        if (data) {
          // Calculate match play results if it's a match play game
          if (data.game.scoring_format === 'match_play' && data.participants && data.scores && data.holes) {
            const validParticipants = data.participants.filter(p => p.profiles).map(p => ({
              ...p,
              profiles: p.profiles || { full_name: 'Unknown' },
              tee_boxes: p.tee_boxes || { name: 'Default' }
            }));
            const participantsWithMatchPlay = calculateMatchPlayResults(
              validParticipants,
              data.scores,
              data.holes
            );
            setGameData({
              ...data,
              participants: participantsWithMatchPlay
            } as GameData);
          } else {
            setGameData(data as GameData);
          }
        } else {
          // Navigate back if game not found
          history.goBack();
        }
      } catch (error) {
        console.error('Error loading game data:', error);
        history.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    loadGameData();
  }, [gameId, history]);


  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy \'at\' h:mm a');
    } catch {
      return '-';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return '☀️';
      case 'partly_cloudy':
        return '⛅';
      case 'rainy':
        return '🌧️';
      case 'windy':
        return '💨';
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/profile" />
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!gameData) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/profile" />
            </IonButtons>
            <IonTitle>Game Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>This game could not be found.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const { game, participants, scores, holes } = gameData;
  const winner = participants.find((p) => 
    p.total_strokes === Math.min(...participants.map((p) => p.total_strokes).filter((s) => s !== null))
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Match Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        {/* Game Info Card */}
        <IonCard style={{ marginTop: '8px' }}>
          <IonCardContent>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600' }}>
                {game.golf_courses.name}
              </h2>
              <p style={{ margin: '0', color: 'var(--ion-color-medium)', fontSize: '14px' }}>
                {game.golf_courses.golf_clubs.name}
              </p>
            </div>
            
            {game.game_description && (
              <p style={{ 
                fontStyle: 'italic', 
                fontSize: '14px',
                margin: '8px 0',
                color: 'var(--ion-color-medium)'
              }}>
                "{game.game_description}"
              </p>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              <IonChip color="primary">
                <IonLabel>
                  {game.scoring_format === 'match_play' ? 'Match Play' : 'Stroke Play'}
                </IonLabel>
              </IonChip>
              
              {game.weather_condition && (
                <IonChip color="medium">
                  <IonLabel>
                    {getWeatherIcon(game.weather_condition)} {' '}
                    {game.weather_condition.replace('_', ' ')}
                  </IonLabel>
                </IonChip>
              )}

              {winner && (
                <IonChip color="success">
                  <IonIcon icon={trophyOutline} />
                  <IonLabel>
                    {winner.profiles.full_name}
                  </IonLabel>
                </IonChip>
              )}
            </div>

            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--ion-color-light)' 
            }}>
              <IonNote style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IonIcon icon={calendarOutline} style={{ fontSize: '16px' }} />
                Completed {formatDate(game.completed_at)}
              </IonNote>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Tab Navigation */}
        <IonSegment 
          value={selectedTab} 
          onIonChange={e => setSelectedTab(e.detail.value as 'scorecard' | 'leaderboard')}
          style={{ padding: '8px 16px' }}
        >
          <IonSegmentButton value="scorecard">
            <IonLabel>Scorecard</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="leaderboard">
            <IonLabel>Leaderboard</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Tab Content */}
        <div style={{ padding: '0' }}>
          {selectedTab === 'scorecard' && (
            <ScorecardDisplay 
              participants={participants}
              scores={scores}
              holes={holes}
              courseName={game.golf_courses.name}
              coursePar={game.golf_courses.par || 72}
              isReadOnly={true}
            />
          )}
          {selectedTab === 'leaderboard' && (
            <div style={{ padding: '0 16px 16px 16px' }}>
              <CompletedLeaderboard 
                participants={participants}
                scoringFormat={game.scoring_format}
                coursePar={game.golf_courses.par || 72}
              />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ViewCompletedGame;
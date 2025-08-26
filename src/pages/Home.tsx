import React from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonNote,
  IonChip,
  IonAvatar
} from '@ionic/react';
import { 
  addOutline, 
  golfOutline, 
  trophyOutline, 
  statsChartOutline,
  timeOutline,
  locationOutline
} from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';

const Home: React.FC = () => {
  const { user } = useAuth();

  const recentRounds = [
    {
      id: '1',
      course: 'Pebble Beach',
      score: 82,
      par: 72,
      date: '2024-01-15',
      holes: 18
    },
    {
      id: '2',
      course: 'Augusta National',
      score: 78,
      par: 72,
      date: '2024-01-10',
      holes: 18
    },
    {
      id: '3',
      course: 'St. Andrews',
      score: 85,
      par: 72,
      date: '2024-01-05',
      holes: 18
    }
  ];

  const upcomingTournaments = [
    {
      id: '1',
      name: 'Spring Championship',
      date: '2024-02-15',
      course: 'Royal Oak Golf Club',
      participants: 24
    },
    {
      id: '2',
      name: 'Monthly Medal',
      date: '2024-02-20',
      course: 'Pinehurst Resort',
      participants: 16
    }
  ];

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= 0) return 'success';
    if (diff <= 5) return 'warning';
    return 'danger';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Golf X</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Golf X</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {/* Welcome Section */}
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', paddingTop: '32px' }}>
              <IonAvatar style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 16px auto' 
              }}>
                <div style={{ 
                  background: 'var(--ion-color-primary)',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'G'}
                </div>
              </IonAvatar>
              <h2 style={{ margin: '0 0 8px 0' }}>
                Welcome back, {user?.user_metadata?.full_name || 'Golfer'}!
              </h2>
              <IonNote color="medium">
                Ready for your next round?
              </IonNote>
              <IonButton 
                expand="block" 
                fill="solid" 
                style={{ marginTop: '24px' }}
              >
                <IonIcon icon={addOutline} slot="start" />
                Log New Round
              </IonButton>
            </IonCardContent>
          </IonCard>

          {/* Quick Stats */}
          <IonGrid>
            <IonRow>
              <IonCol size="4">
                <IonCard button>
                  <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon 
                      icon={golfOutline} 
                      style={{ fontSize: '32px', color: 'var(--ion-color-primary)' }}
                    />
                    <h3 style={{ margin: '8px 0 4px 0', fontSize: '20px' }}>78</h3>
                    <IonNote color="medium" style={{ fontSize: '12px' }}>
                      Best Score
                    </IonNote>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="4">
                <IonCard button>
                  <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon 
                      icon={statsChartOutline} 
                      style={{ fontSize: '32px', color: 'var(--ion-color-secondary)' }}
                    />
                    <h3 style={{ margin: '8px 0 4px 0', fontSize: '20px' }}>12.5</h3>
                    <IonNote color="medium" style={{ fontSize: '12px' }}>
                      Handicap
                    </IonNote>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="4">
                <IonCard button>
                  <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon 
                      icon={trophyOutline} 
                      style={{ fontSize: '32px', color: 'var(--ion-color-warning)' }}
                    />
                    <h3 style={{ margin: '8px 0 4px 0', fontSize: '20px' }}>3</h3>
                    <IonNote color="medium" style={{ fontSize: '12px' }}>
                      Rounds
                    </IonNote>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Recent Rounds */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Recent Rounds</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              {recentRounds.map((round) => (
                <IonItem key={round.id} button detail>
                  <IonIcon icon={golfOutline} slot="start" />
                  <IonLabel>
                    <h3>{round.course}</h3>
                    <p>
                      <IonIcon icon={timeOutline} style={{ fontSize: '14px', marginRight: '4px' }} />
                      {formatDate(round.date)}
                    </p>
                  </IonLabel>
                  <IonChip 
                    slot="end" 
                    color={getScoreColor(round.score, round.par)}
                  >
                    {round.score > round.par ? '+' : ''}{round.score - round.par}
                  </IonChip>
                </IonItem>
              ))}
              <IonButton 
                fill="clear" 
                expand="block" 
                size="small" 
                style={{ marginTop: '16px' }}
              >
                View All Rounds
              </IonButton>
            </IonCardContent>
          </IonCard>

          {/* Upcoming Tournaments */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Upcoming Tournaments</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              {upcomingTournaments.map((tournament) => (
                <IonItem key={tournament.id} button detail>
                  <IonIcon icon={trophyOutline} slot="start" />
                  <IonLabel>
                    <h3>{tournament.name}</h3>
                    <p>
                      <IonIcon icon={locationOutline} style={{ fontSize: '14px', marginRight: '4px' }} />
                      {tournament.course}
                    </p>
                    <p>
                      <IonIcon icon={timeOutline} style={{ fontSize: '14px', marginRight: '4px' }} />
                      {formatDate(tournament.date)}
                    </p>
                  </IonLabel>
                  <IonNote slot="end" color="medium">
                    {tournament.participants} players
                  </IonNote>
                </IonItem>
              ))}
              <IonButton 
                fill="clear" 
                expand="block" 
                size="small" 
                style={{ marginTop: '16px' }}
              >
                Browse All Tournaments
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
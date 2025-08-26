import React, { useState } from 'react';
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonItem,
  IonButton,
  IonChip,
  IonNote,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { 
  trophyOutline,
  timeOutline,
  locationOutline,
  peopleOutline,
  cashOutline,
  addOutline,
  ribbonOutline,
  medalOutline,
} from 'ionicons/icons';

const Tournaments: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('upcoming');
  const [searchText, setSearchText] = useState('');

  const upcomingTournaments = [
    {
      id: '1',
      name: 'Spring Championship',
      course: 'Royal Oak Golf Club',
      date: '2024-02-15',
      time: '8:00 AM',
      entryFee: 85,
      prizePool: 2500,
      participants: 24,
      maxParticipants: 32,
      category: 'Championship',
      handicapRange: '0-18',
      status: 'open'
    },
    {
      id: '2',
      name: 'Monthly Medal Play',
      course: 'Pinehurst Resort',
      date: '2024-02-20',
      time: '7:30 AM',
      entryFee: 45,
      prizePool: 800,
      participants: 16,
      maxParticipants: 24,
      category: 'Medal Play',
      handicapRange: '5-20',
      status: 'open'
    },
    {
      id: '3',
      name: 'Couples Tournament',
      course: 'Pebble Beach',
      date: '2024-02-25',
      time: '9:00 AM',
      entryFee: 120,
      prizePool: 3000,
      participants: 32,
      maxParticipants: 32,
      category: 'Couples',
      handicapRange: 'Mixed',
      status: 'full'
    },
    {
      id: '4',
      name: 'Junior Championship',
      course: 'Augusta National',
      date: '2024-03-01',
      time: '8:30 AM',
      entryFee: 25,
      prizePool: 500,
      participants: 8,
      maxParticipants: 16,
      category: 'Junior',
      handicapRange: '10-36',
      status: 'open'
    }
  ];

  const myTournaments = [
    {
      id: '1',
      name: 'Winter Championship',
      course: 'St. Andrews',
      date: '2024-01-15',
      position: 3,
      totalPlayers: 28,
      score: 78,
      prize: 150,
      status: 'completed'
    },
    {
      id: '2',
      name: 'Holiday Tournament',
      course: 'Torrey Pines',
      date: '2024-01-08',
      position: 1,
      totalPlayers: 20,
      score: 75,
      prize: 500,
      status: 'completed'
    },
    {
      id: '3',
      name: 'New Year Classic',
      course: 'Bethpage Black',
      date: '2024-01-02',
      position: 5,
      totalPlayers: 32,
      score: 82,
      prize: 0,
      status: 'completed'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'full': return 'warning';
      case 'closed': return 'danger';
      default: return 'medium';
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return medalOutline;
    if (position <= 3) return ribbonOutline;
    return trophyOutline;
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return 'warning';
    if (position <= 3) return 'secondary';
    return 'medium';
  };

  const renderUpcoming = () => (
    <div>
      <IonSearchbar
        value={searchText}
        onIonInput={(e) => setSearchText(e.detail.value!)}
        placeholder="Search tournaments..."
        style={{ marginBottom: '16px' }}
      />

      {upcomingTournaments
        .filter(tournament => 
          tournament.name.toLowerCase().includes(searchText.toLowerCase()) ||
          tournament.course.toLowerCase().includes(searchText.toLowerCase())
        )
        .map((tournament) => (
          <IonCard key={tournament.id}>
            <IonCardHeader>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <IonCardTitle style={{ fontSize: '18px' }}>
                  {tournament.name}
                </IonCardTitle>
                <IonChip color={getStatusColor(tournament.status)} outline>
                  <IonLabel style={{ textTransform: 'capitalize' }}>
                    {tournament.status}
                  </IonLabel>
                </IonChip>
              </div>
              <IonNote color="medium">{tournament.category}</IonNote>
            </IonCardHeader>
            
            <IonCardContent style={{ paddingTop: 0 }}>
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <IonItem lines="none">
                      <IonIcon icon={locationOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h3>{tournament.course}</h3>
                        <p>Handicap: {tournament.handicapRange}</p>
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                </IonRow>
                
                <IonRow>
                  <IonCol size="6">
                    <IonItem lines="none">
                      <IonIcon icon={timeOutline} slot="start" color="secondary" />
                      <IonLabel>
                        <h3>{formatDate(tournament.date)}</h3>
                        <p>{tournament.time}</p>
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol size="6">
                    <IonItem lines="none">
                      <IonIcon icon={peopleOutline} slot="start" color="tertiary" />
                      <IonLabel>
                        <h3>{tournament.participants}/{tournament.maxParticipants}</h3>
                        <p>Players</p>
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                </IonRow>
                
                <IonRow>
                  <IonCol size="6">
                    <IonItem lines="none">
                      <IonIcon icon={cashOutline} slot="start" color="success" />
                      <IonLabel>
                        <h3>${tournament.entryFee}</h3>
                        <p>Entry Fee</p>
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol size="6">
                    <IonItem lines="none">
                      <IonIcon icon={trophyOutline} slot="start" color="warning" />
                      <IonLabel>
                        <h3>${tournament.prizePool}</h3>
                        <p>Prize Pool</p>
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
              
              <IonButton 
                expand="block" 
                fill={tournament.status === 'full' ? 'outline' : 'solid'}
                disabled={tournament.status === 'full'}
                style={{ marginTop: '16px' }}
              >
                {tournament.status === 'full' ? 'Tournament Full' : 'Register Now'}
              </IonButton>
            </IonCardContent>
          </IonCard>
        ))
      }
    </div>
  );

  const renderMyTournaments = () => (
    <div>
      {/* Tournament History */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Tournament History</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ paddingTop: 0 }}>
          {myTournaments.map((tournament) => (
            <IonItem key={tournament.id} detail>
              <IonIcon 
                icon={getPositionIcon(tournament.position)} 
                slot="start" 
                color={getPositionColor(tournament.position)}
              />
              <IonLabel>
                <h3>{tournament.name}</h3>
                <p>{tournament.course} • {formatDate(tournament.date)}</p>
                <p>Score: {tournament.score} • {tournament.totalPlayers} players</p>
              </IonLabel>
              <div slot="end" style={{ textAlign: 'center' }}>
                <IonBadge color={getPositionColor(tournament.position)}>
                  #{tournament.position}
                </IonBadge>
                {tournament.prize > 0 && (
                  <IonNote color="success" style={{ 
                    display: 'block', 
                    marginTop: '4px',
                    fontSize: '12px'
                  }}>
                    ${tournament.prize}
                  </IonNote>
                )}
              </div>
            </IonItem>
          ))}
        </IonCardContent>
      </IonCard>

      {/* Statistics */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Tournament Stats</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ paddingTop: 0 }}>
          <IonGrid>
            <IonRow>
              <IonCol size="6" style={{ textAlign: 'center' }}>
                <IonIcon 
                  icon={trophyOutline} 
                  style={{ fontSize: '32px', color: 'var(--ion-color-warning)' }}
                />
                <h3 style={{ margin: '8px 0 4px 0' }}>3</h3>
                <IonNote color="medium">Tournaments</IonNote>
              </IonCol>
              <IonCol size="6" style={{ textAlign: 'center' }}>
                <IonIcon 
                  icon={medalOutline} 
                  style={{ fontSize: '32px', color: 'var(--ion-color-success)' }}
                />
                <h3 style={{ margin: '8px 0 4px 0' }}>1</h3>
                <IonNote color="medium">Wins</IonNote>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6" style={{ textAlign: 'center' }}>
                <IonIcon 
                  icon={ribbonOutline} 
                  style={{ fontSize: '32px', color: 'var(--ion-color-secondary)' }}
                />
                <h3 style={{ margin: '8px 0 4px 0' }}>2</h3>
                <IonNote color="medium">Top 3</IonNote>
              </IonCol>
              <IonCol size="6" style={{ textAlign: 'center' }}>
                <IonIcon 
                  icon={cashOutline} 
                  style={{ fontSize: '32px', color: 'var(--ion-color-primary)' }}
                />
                <h3 style={{ margin: '8px 0 4px 0' }}>$650</h3>
                <IonNote color="medium">Earnings</IonNote>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tournaments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tournaments</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <IonSegment 
            value={selectedSegment} 
            onIonChange={e => setSelectedSegment(e.detail.value as string)}
            style={{ marginBottom: '16px' }}
          >
            <IonSegmentButton value="upcoming">
              <IonLabel>Upcoming</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="my-tournaments">
              <IonLabel>My History</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {selectedSegment === 'upcoming' && renderUpcoming()}
          {selectedSegment === 'my-tournaments' && renderMyTournaments()}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tournaments;
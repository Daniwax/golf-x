import React, { useState, useEffect, useCallback } from 'react';
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
  IonAlert
} from '@ionic/react';
import { 
  golfOutline,
  locationOutline,
  trophyOutline,
  statsChartOutline,
  personRemoveOutline,
  ellipsisHorizontalOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { getFriendProfile, removeFriend, type UserProfile } from '../lib/friends';

interface RouteParams {
  id: string;
}

const FriendProfile: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [friend, setFriend] = useState<UserProfile | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    loadFriendProfile();
  }, [loadFriendProfile]);

  const loadFriendProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getFriendProfile(id);
      
      if (error) {
        showMessage(error, 'danger');
        setTimeout(() => history.goBack(), 2000);
      } else if (data) {
        setFriend(data);
      }
    } catch (error) {
      console.error('Error loading friend profile:', error);
      showMessage('Failed to load friend profile', 'danger');
    } finally {
      setLoading(false);
    }
  }, [id, showMessage, history]);

  const handleRemoveFriend = async () => {
    if (!friend) return;
    
    // Use replace instead of push to prevent going back to deleted friend
    history.replace('/friends');
    
    // Show a toast message on the friends page
    showMessage('Friend removed. Changes may take a moment to appear.', 'success');
    
    // Remove the friend in the background
    removeFriend(friend.id).catch(error => {
      console.error('Failed to remove friend:', error);
    });
  };

  const handleRemoveClick = () => {
    setShowActionSheet(false);
    setShowRemoveAlert(true);
  };

  const showMessage = useCallback((message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  }, []);

  // Mock golf stats - in future these would come from database
  const golfingStats = [
    { label: 'Rounds Played', value: '42', icon: golfOutline, color: 'primary' },
    { label: 'Best Score', value: '78', icon: trophyOutline, color: 'success' },
    { label: 'Average Score', value: '85.2', icon: statsChartOutline, color: 'secondary' },
    { label: 'Handicap Index', value: '12.5', icon: golfOutline, color: 'warning' }
  ];

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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/friends" />
          </IonButtons>
          <IonTitle>Friend Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowActionSheet(true)} disabled={loading}>
              <IonIcon icon={ellipsisHorizontalOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Friend Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {/* Profile Header Card */}
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', paddingTop: '32px' }}>
              <IonAvatar style={{ 
                width: '120px', 
                height: '120px', 
                margin: '0 auto 16px auto'
              }}>
                {friend.avatar_url ? (
                  <img src={friend.avatar_url} alt={friend.full_name || 'Friend'} />
                ) : (
                  <div style={{ 
                    background: 'var(--ion-color-primary)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {friend.full_name?.[0] || friend.email?.[0] || '?'}
                  </div>
                )}
              </IonAvatar>

              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
                {friend.full_name || 'Golf Friend'}
              </h2>
              <IonNote color="medium" style={{ fontSize: '16px' }}>
                {friend.email}
              </IonNote>
              
              <p style={{ 
                margin: '16px 0 0 0', 
                color: 'var(--ion-color-medium)',
                lineHeight: '1.4'
              }}>
                Passionate golfer working to improve their game
              </p>
            </IonCardContent>
          </IonCard>

          {/* Golf Stats */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Golf Statistics</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px' 
              }}>
                {golfingStats.map((stat, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <IonIcon 
                      icon={stat.icon} 
                      style={{ 
                        fontSize: '32px', 
                        color: `var(--ion-color-${stat.color})`,
                        marginBottom: '8px'
                      }}
                    />
                    <h3 style={{ margin: '0', fontSize: '20px' }}>
                      {stat.value}
                    </h3>
                    <IonNote color="medium" style={{ fontSize: '12px' }}>
                      {stat.label}
                    </IonNote>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Golf Details */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Golf Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              <IonItem>
                <IonIcon icon={golfOutline} slot="start" />
                <IonLabel>
                  <h3>Handicap Index</h3>
                  <p>12.5</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={locationOutline} slot="start" />
                <IonLabel>
                  <h3>Home Course</h3>
                  <p>Pebble Beach Golf Links</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Member Since */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '24px',
            color: 'var(--ion-color-medium)',
            fontSize: '14px'
          }}>
            Friends since {new Date(friend.created_at).toLocaleDateString()}
          </div>
        </div>

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
          message={`Are you sure you want to remove ${friend?.full_name || 'this friend'}? You won't be able to share profiles or enter competitions together anymore. They may take a moment to disappear from your friends list.`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Remove',
              cssClass: 'danger',
              handler: () => {
                handleRemoveFriend();
              }
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default FriendProfile;
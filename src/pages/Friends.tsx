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
  IonInput,
  IonAvatar,
  IonToast,
  IonSpinner,
  IonList,
  IonBackButton,
  IonButtons,
  IonNote,
  IonText,
  useIonViewWillEnter
} from '@ionic/react';
import { 
  personAddOutline,
  copyOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { addFriend, getFriends, getCurrentUserId, type FriendProfile } from '../lib/friends';

const Friends: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendId, setFriendId] = useState('');
  const [userId, setUserId] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    loadUserIdAndFriends();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload friends list every time the page is viewed
  useIonViewWillEnter(() => {
    // Simply reload the friends list each time we view the page
    loadFriends();
  });

  const loadUserIdAndFriends = async () => {
    setLoading(true);
    try {
      // Get current user ID
      const id = await getCurrentUserId();
      if (id) setUserId(id);

      // Load friends list
      const { data, error } = await getFriends();
      if (error) {
        showMessage('Failed to load friends', 'danger');
      } else if (data) {
        setFriends(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('Error loading data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    // Just refresh the friends list without showing loading state
    const { data, error } = await getFriends();
    if (!error && data) {
      setFriends(data);
    }
  };

  const handleCopyUserId = async () => {
    if (userId) {
      try {
        await navigator.clipboard.writeText(userId);
        showMessage('User ID copied to clipboard', 'success');
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = userId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('User ID copied to clipboard', 'success');
      }
    }
  };

  const handleAddFriend = async () => {
    if (!friendId.trim()) {
      showMessage('Please enter a friend ID', 'danger');
      return;
    }

    setLoading(true);
    const { error } = await addFriend(friendId.trim());
    
    if (error) {
      showMessage(error, 'danger');
    } else {
      showMessage('Friend added successfully!', 'success');
      setFriendId('');
      // Reload friends list
      const { data } = await getFriends();
      if (data) setFriends(data);
    }
    setLoading(false);
  };

  const showMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const navigateToFriendProfile = (friendId: string) => {
    history.push(`/friend/${friendId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Friends</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Friends</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {/* Your ID Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Your Friend ID</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                background: 'var(--ion-color-light)',
                borderRadius: '8px'
              }}>
                <IonText style={{ 
                  fontSize: '14px', 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {userId || 'Loading...'}
                </IonText>
                <IonButton 
                  fill="clear" 
                  onClick={handleCopyUserId}
                  disabled={!userId}
                >
                  <IonIcon icon={copyOutline} />
                </IonButton>
              </div>
              <IonNote style={{ 
                display: 'block', 
                marginTop: '12px',
                textAlign: 'center' 
              }}>
                Share this ID with friends so they can add you
              </IonNote>
            </IonCardContent>
          </IonCard>

          {/* Add Friend Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Add Friend</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Friend ID</IonLabel>
                <IonInput
                  value={friendId}
                  placeholder="Enter friend's ID"
                  onIonInput={(e) => setFriendId(e.detail.value!)}
                  disabled={loading}
                />
              </IonItem>
              <IonButton
                expand="block"
                onClick={handleAddFriend}
                disabled={loading || !friendId.trim()}
                style={{ marginTop: '16px' }}
              >
                {loading ? <IonSpinner name="crescent" /> : (
                  <>
                    <IonIcon icon={personAddOutline} slot="start" />
                    Add Friend
                  </>
                )}
              </IonButton>
            </IonCardContent>
          </IonCard>

          {/* Friends List */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Friends {friends.length > 0 && `(${friends.length})`}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingBottom: 0 }}>
              {loading && friends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <IonSpinner name="crescent" />
                </div>
              ) : friends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <IonIcon 
                    icon={alertCircleOutline} 
                    style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }}
                  />
                  <IonText color="medium">
                    <p>No friends yet</p>
                    <p style={{ fontSize: '14px' }}>
                      Share your ID or add friends to get started
                    </p>
                  </IonText>
                </div>
              ) : (
                <IonList>
                  {friends.map((friend) => (
                    <IonItem 
                      key={friend.friendship_id}
                      button
                      onClick={() => navigateToFriendProfile(friend.friend_id)}
                    >
                      <IonAvatar slot="start">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt={friend.full_name || 'Friend'} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--ion-color-primary)',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold'
                          }}>
                            {friend.full_name?.[0] || friend.email?.[0] || '?'}
                          </div>
                        )}
                      </IonAvatar>
                      <IonLabel>
                        <h2>{friend.full_name || 'Golf Friend'}</h2>
                        <p>{friend.email}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        </div>

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

export default Friends;
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonAvatar,
  IonNote,
  IonSpinner,
  IonBadge,
  IonSearchbar,
  IonList
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { getFriends, type FriendProfile } from '../../../lib/friends';
import { getCurrentUserId } from '../../../lib/friends';

interface LocationState {
  gameData: {
    description?: string;
    courseId: number;
    weather: string;
    format: string;
  };
}

const AddParticipants: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const gameData = location.state?.gameData;
  
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameData) {
      history.replace('/game/create');
      return;
    }
    loadFriendsAndUser();
  }, []);

  const loadFriendsAndUser = async () => {
    try {
      setLoading(true);
      
      // Get current user ID (they are always a participant)
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
      // Load friends list
      const { data, error } = await getFriends();
      if (error) {
        setError('Failed to load friends');
      } else if (data) {
        setFriends(data);
      }
    } catch (err) {
      console.error('Error loading friends:', err);
      setError('Error loading friends list');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      // Max 5 friends (6 total with current user)
      if (newSelection.size < 5) {
        newSelection.add(friendId);
      }
    }
    setSelectedFriends(newSelection);
  };

  const handleNext = () => {
    if (selectedFriends.size === 0) {
      setError('Please select at least one friend');
      return;
    }
    
    // Clear any focused elements before navigation
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
    
    // Navigate to player configuration with selected participants
    const participants = [
      currentUserId, // Current user is always first
      ...Array.from(selectedFriends)
    ];
    
    history.push('/game/configure-players', {
      gameData,
      participants
    });
  };

  // Filter friends based on search
  const filteredFriends = friends.filter(friend =>
    friend.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalParticipants = selectedFriends.size + 1; // +1 for current user

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/game/create" />
          </IonButtons>
          <IonTitle>Add Participants</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Selection Info Header */}
        <div style={{ 
          backgroundColor: 'var(--ion-color-primary)',
          color: 'white',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {totalParticipants} / 6
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
            {totalParticipants === 1 ? 'Select friends to play with' : `${totalParticipants} players selected`}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            You + {selectedFriends.size} friend{selectedFriends.size !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search Bar */}
        {friends.length > 0 && (
          <IonSearchbar
            value={searchText}
            onIonInput={e => setSearchText(e.detail.value!)}
            placeholder="Search friends..."
            style={{ 
              '--background': 'var(--ion-color-light)',
              padding: '8px'
            }}
          />
        )}

        {/* Friends List */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px'
          }}>
            <IonSpinner name="crescent" />
          </div>
        ) : friends.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 16px',
            color: 'var(--ion-color-medium)'
          }}>
            <h3>No Friends Yet</h3>
            <p>Add friends from your Profile to invite them to games</p>
            <IonButton 
              fill="outline" 
              onClick={() => history.push('/friends')}
              style={{ marginTop: '16px' }}
            >
              Add Friends
            </IonButton>
          </div>
        ) : (
          <IonList style={{ paddingBottom: '100px' }}>
            {filteredFriends.map(friend => (
              <IonItem 
                key={friend.friend_id}
                lines="full"
                disabled={selectedFriends.size >= 5 && !selectedFriends.has(friend.friend_id)}
              >
                <IonCheckbox
                  slot="start"
                  checked={selectedFriends.has(friend.friend_id)}
                  onIonChange={() => toggleFriend(friend.friend_id)}
                  disabled={selectedFriends.size >= 5 && !selectedFriends.has(friend.friend_id)}
                />
                <IonAvatar slot="start" style={{ marginLeft: '12px' }}>
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt={friend.full_name || ''} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--ion-color-primary)',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {friend.full_name?.[0] || friend.email?.[0] || '?'}
                    </div>
                  )}
                </IonAvatar>
                <IonLabel>
                  <h2>{friend.full_name || 'Golf Friend'}</h2>
                  <p style={{ fontSize: '14px', opacity: 0.7 }}>{friend.email}</p>
                  {friend.handicap !== null && (
                    <IonBadge color="medium" style={{ marginTop: '4px' }}>
                      HCP: {friend.handicap.toFixed(1)}
                    </IonBadge>
                  )}
                </IonLabel>
              </IonItem>
            ))}
            
            {filteredFriends.length === 0 && searchText && (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px',
                color: 'var(--ion-color-medium)'
              }}>
                No friends found matching "{searchText}"
              </div>
            )}
          </IonList>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '16px',
            position: 'fixed',
            bottom: '100px',
            left: '16px',
            right: '16px',
            backgroundColor: 'var(--ion-color-danger)',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            zIndex: 100
          }}>
            {error}
          </div>
        )}

        {/* Bottom Action Bar */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--ion-background-color)',
          borderTop: '1px solid var(--ion-color-light-shade)',
          padding: '16px',
          display: 'flex',
          gap: '12px'
        }}>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => history.goBack()}
            style={{ flex: 1 }}
          >
            Back
          </IonButton>
          <IonButton
            expand="block"
            onClick={handleNext}
            disabled={selectedFriends.size === 0}
            style={{ flex: 2 }}
          >
            Next ({totalParticipants} Players) →
          </IonButton>
        </div>

        {/* Requirements Note */}
        {!loading && friends.length > 0 && (
          <IonNote style={{ 
            display: 'block',
            textAlign: 'center',
            padding: '8px',
            position: 'fixed',
            bottom: '80px',
            left: 0,
            right: 0,
            fontSize: '12px',
            backgroundColor: 'var(--ion-color-light)',
            color: 'var(--ion-color-medium)'
          }}>
            Min 2 players (including you) • Max 6 players total
          </IonNote>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AddParticipants;
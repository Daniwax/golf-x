import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonInput,
  IonToast,
  IonSpinner,
  IonBackButton,
  IonButtons,
  useIonViewWillEnter,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar
} from '@ionic/react';
import { 
  personAddOutline,
  copyOutline,
  peopleOutline,
  golfOutline,
  chevronForwardOutline,
  searchOutline,
  closeOutline,
  personCircleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getCurrentUserId } from '../lib/friends';
import { useFriends } from '../hooks/useFriends';

const Friends: React.FC = () => {
  const history = useHistory();
  const { friends, gamesPlayed, loading, error, addFriend: addFriendToList, refresh } = useFriends();
  const [filteredFriends, setFilteredFriends] = useState(friends);
  const [friendId, setFriendId] = useState('');
  const [userId, setUserId] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [searchText, setSearchText] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    let filtered = friends;
    
    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(friend =>
        (friend.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
         friend.email?.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    setFilteredFriends(filtered);
  }, [searchText, friends]);

  // Reload friends list every time the page is viewed
  useIonViewWillEnter(() => {
    refresh();
  });

  const loadUserId = async () => {
    try {
      const id = await getCurrentUserId();
      if (id) setUserId(id);
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };
  // Error effect to show messages
  useEffect(() => {
    if (error) {
      showMessage('Failed to load friends', 'danger');
    }
  }, [error]);

  const handleCopyUserId = async () => {
    if (userId) {
      try {
        await navigator.clipboard.writeText(userId);
        showMessage('Friend ID copied!', 'success');
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = userId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('Friend ID copied!', 'success');
      }
    }
  };

  const handleAddFriend = async () => {
    if (!friendId.trim()) {
      showMessage('Please enter a friend ID', 'danger');
      return;
    }

    const { error } = await addFriendToList(friendId.trim());
    
    if (error) {
      showMessage(error, 'danger');
    } else {
      showMessage('Friend added successfully!', 'success');
      setFriendId('');
      setShowAddFriend(false);
    }
  };

  const showMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const navigateToFriendProfile = (friendId: string) => {
    history.push(`/friend/${friendId}`);
  };

  const handleRefresh = async (event: CustomEvent) => {
    await refresh();
    const target = event.target as HTMLIonRefresherElement;
    target.complete();
  };

  const handleScroll = (event: CustomEvent) => {
    const scrollTop = event.detail.scrollTop;
    setIsScrolled(scrollTop > 50);
  };

  return (
    <IonPage className="friends-page">
      <IonHeader className={isScrolled ? 'header-transparent' : 'header-solid'}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>
            <div>Friends</div>
            {friends.length > 0 && (
              <div style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.7 }}>
                {friends.length} {friends.length === 1 ? 'connection' : 'connections'}
              </div>
            )}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowAddFriend(!showAddFriend)}>
              <IonIcon icon={showAddFriend ? closeOutline : personAddOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen scrollEvents={true} onIonScroll={handleScroll}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Hero Section with Your ID */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="id-card">
              <div className="id-card-header">
                <IonIcon icon={personCircleOutline} />
                <span>Your Friend ID</span>
              </div>
              <div className="id-display">
                <code>{userId || 'Loading...'}</code>
                <IonButton 
                  fill="clear" 
                  onClick={handleCopyUserId}
                  disabled={!userId}
                  className="copy-button"
                >
                  <IonIcon icon={copyOutline} />
                </IonButton>
              </div>
              <p className="id-hint">Share this ID with friends to connect</p>
            </div>
          </div>
        </div>

        {/* Add Friend Section - Collapsible */}
        {showAddFriend && (
          <div className="add-friend-section">
            <div className="add-friend-content">
              <h3>Add a Friend</h3>
              <div className="input-group">
                <IonInput
                  value={friendId}
                  placeholder="Enter friend's ID"
                  onIonInput={(e) => setFriendId(e.detail.value!)}
                  disabled={loading}
                  className="friend-input"
                />
                <IonButton
                  onClick={handleAddFriend}
                  disabled={loading || !friendId.trim()}
                  className="add-button"
                >
                  {loading ? <IonSpinner name="crescent" /> : 'Add'}
                </IonButton>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {friends.length > 0 && (
          <div className="search-section">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value!)}
              placeholder="Search friends..."
              className="friends-searchbar"
              showClearButton="focus"
            />
          </div>
        )}

        {/* Friends List */}
        <div className="friends-container">
          {loading && friends.length === 0 ? (
            <div className="loading-state">
              <IonSpinner name="crescent" />
              <p>Loading friends...</p>
            </div>
          ) : filteredFriends.length === 0 && searchText ? (
            <div className="empty-state">
              <IonIcon icon={searchOutline} />
              <h3>No matches found</h3>
              <p>Try a different search term</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={peopleOutline} />
              <h3>No friends yet</h3>
              <p>Share your ID or add friends to get started</p>
              <IonButton 
                fill="outline" 
                onClick={() => setShowAddFriend(true)}
                className="empty-action"
              >
                <IonIcon icon={personAddOutline} slot="start" />
                Add Your First Friend
              </IonButton>
            </div>
          ) : (
            <div className="friends-grid">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.friendship_id}
                  className="friend-card"
                  onClick={() => navigateToFriendProfile(friend.friend_id)}
                >
                  <div className="friend-avatar">
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
                  </div>
                  
                  <div className="friend-info">
                    <h4>{friend.full_name || 'Golf Friend'}</h4>
                    <p>{friend.email}</p>
                  </div>

                  <div className="friend-stats">
                    <div className="stat-badge">
                      <IonIcon icon={golfOutline} />
                      <span>{gamesPlayed[friend.friend_id] || 0} {gamesPlayed[friend.friend_id] === 1 ? 'game' : 'games'}</span>
                    </div>
                  </div>

                  <IonIcon icon={chevronForwardOutline} className="friend-arrow" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CSS Styles */}
        <style>{`
          .friends-page {
            --ion-background-color: #f8f9fa;
          }

          .header-solid {
            --background: white;
            --border-width: 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .header-transparent {
            --background: rgba(255, 255, 255, 0.95);
            --border-width: 0;
            backdrop-filter: blur(10px);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 24px 16px 32px;
            position: relative;
            overflow: hidden;
          }

          .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            pointer-events: none;
          }

          .hero-content {
            position: relative;
            z-index: 1;
          }

          .id-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }

          .id-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .id-card-header ion-icon {
            font-size: 20px;
          }

          .id-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f3f4f6;
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 12px;
          }

          .id-display code {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
            color: #1f2937;
            word-break: break-all;
          }

          .copy-button {
            --color: #6b7280;
            --padding-start: 8px;
            --padding-end: 8px;
          }

          .id-hint {
            text-align: center;
            color: #9ca3af;
            font-size: 13px;
            margin: 0;
          }

          .add-friend-section {
            background: white;
            border-bottom: 1px solid #e5e7eb;
            padding: 20px 16px;
            animation: slideDown 0.3s ease;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .add-friend-content h3 {
            margin: 0 0 16px;
            font-size: 18px;
            color: #1f2937;
          }

          .input-group {
            display: flex;
            gap: 12px;
          }

          .friend-input {
            flex: 1;
            --background: #f3f4f6;
            --padding-start: 16px;
            --padding-end: 16px;
            border-radius: 12px;
            font-size: 15px;
          }

          .add-button {
            --background: #667eea;
            --background-hover: #5a67d8;
            --border-radius: 12px;
            --padding-start: 24px;
            --padding-end: 24px;
            font-weight: 600;
          }

          .search-section {
            padding: 16px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
          }

          .friends-searchbar {
            --background: #f3f4f6;
            --border-radius: 12px;
            --box-shadow: none;
            --placeholder-color: #9ca3af;
          }

          .friends-container {
            padding: 16px;
            min-height: 400px;
          }

          .loading-state,
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
          }

          .loading-state ion-spinner {
            --color: #667eea;
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
          }

          .empty-state ion-icon {
            font-size: 64px;
            color: #d1d5db;
            margin-bottom: 16px;
          }

          .empty-state h3 {
            margin: 0 0 8px;
            font-size: 20px;
            color: #1f2937;
          }

          .empty-state p {
            margin: 0 0 24px;
            color: #6b7280;
            font-size: 14px;
          }

          .empty-action {
            --border-color: #667eea;
            --color: #667eea;
            --border-radius: 12px;
            font-weight: 600;
          }

          .friends-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .friend-card {
            background: white;
            border-radius: 16px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
          }

          .friend-card:active {
            transform: scale(0.98);
          }

          .friend-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            overflow: hidden;
            position: relative;
            flex-shrink: 0;
          }

          .friend-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .avatar-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 20px;
            font-weight: bold;
          }

          .friend-info {
            flex: 1;
            min-width: 0;
          }

          .friend-info h4 {
            margin: 0 0 4px;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .friend-info p {
            margin: 0;
            font-size: 13px;
            color: #6b7280;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .friend-stats {
            display: flex;
            align-items: center;
            margin-right: 36px;
          }

          .stat-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #9ca3af;
            white-space: nowrap;
          }

          .stat-badge ion-icon {
            font-size: 14px;
          }

          .friend-arrow {
            position: absolute;
            right: 16px;
            color: #d1d5db;
            font-size: 20px;
          }

          @media (min-width: 768px) {
            .friends-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .friends-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}</style>

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

export default Friends;
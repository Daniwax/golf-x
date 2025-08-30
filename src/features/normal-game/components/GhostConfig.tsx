import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonNote,
  IonSpinner,
  IonIcon
} from '@ionic/react';
import { trophyOutline, personOutline, peopleOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { getFriends, getCurrentUserId, type FriendProfile } from '../../../lib/friends';
import { dataService } from '../../../services/data/DataService';
import type { WeatherCondition } from '../types';
import '../../../styles/golf_style.css';

interface LocationState {
  gameData: {
    description?: string;
    courseId: number;
    weather: WeatherCondition;
    handicapType: string;
    scoringMethod: string;
    numberOfHoles: number;
    includeHandicap: boolean;
    isCustomGame: boolean;
  };
}

interface GameMatch {
  id: number;
  name: string;
  date: string;
  totalStrokes: number;
  netScore: number;
  userId?: string;
  playerName?: string;
  numHoles?: number;
}

const GHOST_TYPES = {
  personal_best: {
    displayName: 'Beat Your Best Round',
    description: 'Challenge your personal best performance',
    icon: personOutline
  },
  friend_best: {
    displayName: "Chase a Friend's Best",
    description: 'Compete against a friend\'s top round',
    icon: peopleOutline
  },
  course_record: {
    displayName: 'Challenge Course Record',
    description: 'Take on the course\'s best performer',
    icon: trophyOutline
  }
};

const GhostConfig: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const gameData = location.state?.gameData;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ghost configuration state
  const [ghostType, setGhostType] = useState<'personal_best' | 'friend_best' | 'course_record'>('personal_best');
  const [teeBoxId, setTeeBoxId] = useState<number | null>(null);
  const [teeBoxes, setTeeBoxes] = useState<Array<{ id: number; name: string; color: string; slope_rating: number; course_rating: number }>>([]);
  
  // User and friends
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  
  // Matches
  const [selectedMatch, setSelectedMatch] = useState<GameMatch | null>(null);
  const [isCurrentUserKing, setIsCurrentUserKing] = useState(false);

  // Define callback functions before useEffects
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load current user
      const userId = await getCurrentUserId();
      if (userId) {
        setCurrentUserId(userId);
      }
      
      // Load friends
      const { data: friendsList, error: friendsError } = await getFriends();
      if (!friendsError && friendsList && friendsList.length > 0) {
        setFriends(friendsList);
        setSelectedFriendId(friendsList[0].friend_id);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeeBoxes = useCallback(async (courseId: number) => {
    try {
      const teesData = await dataService.courses.getCourseTeeBoxes(courseId);
      if (teesData && teesData.length > 0) {
        setTeeBoxes(teesData);
        setTeeBoxId(teesData[0].id);
      }
    } catch (err) {
      console.error('Error loading tee boxes:', err);
    }
  }, []);

  const loadMatchesForGhostType = useCallback(async () => {
    if (!gameData?.courseId || !teeBoxId) return;
    
    try {
      setLoading(true);
      setSelectedMatch(null);
      setIsCurrentUserKing(false);
      
      if (ghostType === 'personal_best' && currentUserId) {
        // Load user's best match
        const games = await dataService.games.getUserCompletedGames(currentUserId, gameData.courseId, teeBoxId);
        if (games && games.length > 0) {
          // Sort by net score to get best
          const sortedGames = games.sort((a, b) => a.netScore - b.netScore);
          setSelectedMatch({
            id: sortedGames[0].id,
            name: sortedGames[0].name,
            date: sortedGames[0].date,
            totalStrokes: sortedGames[0].totalStrokes,
            netScore: sortedGames[0].netScore
          });
        }
      } else if (ghostType === 'friend_best' && selectedFriendId) {
        // Load friend's best match
        const games = await dataService.games.getUserCompletedGames(selectedFriendId, gameData.courseId, teeBoxId);
        if (games && games.length > 0) {
          const sortedGames = games.sort((a, b) => a.netScore - b.netScore);
          const friend = friends.find(f => f.friend_id === selectedFriendId);
          setSelectedMatch({
            id: sortedGames[0].id,
            name: sortedGames[0].name,
            date: sortedGames[0].date,
            totalStrokes: sortedGames[0].totalStrokes,
            netScore: sortedGames[0].netScore,
            playerName: friend?.full_name || friend?.email || 'Friend'
          });
        }
      } else if (ghostType === 'course_record') {
        // Load course record
        const games = await dataService.games.getTopCompletedGames(gameData.courseId, teeBoxId, 10, [9, 18]);
        if (games && games.length > 0) {
          const topGame = games[0];
          
          // Check if current user is the top player
          if (topGame.userId === currentUserId) {
            setIsCurrentUserKing(true);
          } else {
            setSelectedMatch({
              id: topGame.id,
              name: topGame.name,
              date: topGame.date,
              totalStrokes: topGame.totalStrokes,
              netScore: topGame.netScore,
              userId: topGame.userId,
              playerName: topGame.playerName,
              numHoles: topGame.numHoles
            });
          }
        }
      }
    } catch (err) {
      console.error('Error loading matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [gameData?.courseId, teeBoxId, ghostType, currentUserId, selectedFriendId, friends]);

  useEffect(() => {
    if (!gameData) {
      history.replace('/game/create-custom');
      return;
    }
    loadInitialData();
  }, [gameData, history, loadInitialData]);

  useEffect(() => {
    if (gameData?.courseId) {
      loadTeeBoxes(gameData.courseId);
    }
  }, [gameData?.courseId, loadTeeBoxes]);

  useEffect(() => {
    if (teeBoxId && gameData?.courseId) {
      loadMatchesForGhostType();
    }
  }, [ghostType, teeBoxId, selectedFriendId, gameData?.courseId, loadMatchesForGhostType]);

  const handleNext = () => {
    if (!selectedMatch && !isCurrentUserKing) {
      setError('Please select a valid configuration');
      return;
    }
    
    // Clear any focused elements before navigation
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
    
    // Navigate to participant selection with ghost configuration
    history.push('/game/add-participants', {
      gameData: {
        ...gameData,
        ghostType,
        selectedFriendId: ghostType === 'friend_best' ? selectedFriendId : undefined,
        selectedGameId: selectedMatch?.id,
        isGhostGame: true
      }
    });
  };

  // Ghost type info available but not currently used in render
  // const ghostTypeInfo = GHOST_TYPES[ghostType];

  return (
    <IonPage className="golf-letter-container">
      <IonHeader>
        <IonToolbar style={{ '--background': '#f8f6f0', '--border-color': '#d4c4a0' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/game/create-custom" style={{ color: '#2a5434' }} />
          </IonButtons>
          <IonTitle style={{ color: '#2a5434', fontFamily: 'serif' }}>Ghost Challenge</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f8f6f0' }}>
        {/* Golf Club Letter Header */}
        <div className="golf-letter-card" style={{ marginTop: '20px' }}>
          <h1 className="golf-letter-heading">Ghost Challenge Invitation</h1>
          <p className="golf-subheading">Select your opponent for today's round</p>
          
          {/* Ghost Type Selection */}
          <div className="golf-margin-bottom">
            <h3 className="golf-section-header">CHALLENGE TYPE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {Object.entries(GHOST_TYPES).map(([key, info]) => (
                <div
                  key={key}
                  className={`golf-radio-item ${ghostType === key ? 'selected' : ''}`}
                  onClick={() => setGhostType(key as keyof typeof GHOST_TYPES)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={info.icon} style={{ fontSize: '24px', color: '#2a5434' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#2a5434', fontSize: '14px', fontFamily: 'serif' }}>
                        {info.displayName}
                      </div>
                      <div className="golf-text-detail" style={{ marginTop: '2px' }}>
                        {info.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tee Box Selection */}
          <div className="golf-margin-bottom">
            <h3 className="golf-section-header">TEE SELECTION</h3>
            <div className="golf-tee-selector-container">
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'stretch' }}>
                {teeBoxes.map(tee => (
                  <div
                    key={tee.id}
                    onClick={() => setTeeBoxId(tee.id)}
                    className={`golf-tee-box ${teeBoxId === tee.id ? 'selected' : ''}`}
                  >
                    <div className="golf-tee-box-name">
                      {(tee.name || tee.color || '').charAt(0).toUpperCase()}
                    </div>
                    <div className="golf-tee-box-details">
                      {`CR ${tee.rating}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Friend Selection for Chase a Friend */}
          {ghostType === 'friend_best' && friends.length > 0 && (
            <div className="golf-margin-bottom">
              <h3 className="golf-section-header">SELECT OPPONENT</h3>
              <div className="golf-friend-grid">
                {friends.map(friend => (
                  <div
                    key={friend.friend_id}
                    onClick={() => setSelectedFriendId(friend.friend_id)}
                    className={`golf-friend-item ${selectedFriendId === friend.friend_id ? 'selected' : ''}`}
                  >
                    <img 
                      className="golf-friend-avatar"
                      src={friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name || friend.email || 'Friend')}&background=2a5434&color=fff`} 
                      alt={friend.full_name || 'Friend'} 
                    />
                    <div className="golf-friend-name">
                      {friend.full_name?.split(' ')[0] || friend.email?.split('@')[0] || 'Friend'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Match Display Section */}
        <div style={{ padding: '0 16px', marginTop: '20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <IonSpinner name="crescent" />
            </div>
          ) : isCurrentUserKing && ghostType === 'course_record' ? (
            // User is already the king message
            <div className="golf-champion-card">
              <IonIcon 
                icon={trophyOutline} 
                className="golf-champion-icon"
              />
              <h2 className="golf-champion-title">
                You Are The Champion
              </h2>
              <p className="golf-champion-subtitle">
                No one has beaten your record on this course!
              </p>
            </div>
          ) : selectedMatch ? (
            // Match summary card - Golf Club Scorecard Style
            <div className="golf-card golf-fade-in">
              {/* Golf club style header with decorative line */}
              <div className="golf-header-bar" />
              
              {/* Date in top corner - traditional scorecard style */}
              <div className="golf-date-corner">
                {new Date(selectedMatch.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>

              {/* Main scores section - Classic golf scorecard layout */}
              <div className="golf-scores-container">
                {/* Gross Score - Main score */}
                <div className="golf-score-block">
                  <div className="golf-score-label">GROSS</div>
                  <div className="golf-score-net">
                    {selectedMatch.totalStrokes}
                  </div>
                </div>

                {/* Divider line */}
                <div className="golf-divider-vertical" />

                {/* Match Info - Participants and type */}
                <div className="golf-score-block">
                  <div className="golf-score-label">MATCH INFO</div>
                  <div style={{ fontSize: '16px', color: '#2a5434', fontFamily: 'Georgia, serif', marginTop: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '20px', marginBottom: '4px' }}>
                      {ghostType === 'personal_best' ? 'Solo' : '1v1'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {ghostType === 'personal_best' ? 'Personal' : 
                       ghostType === 'friend_best' ? 'Friend' : 
                       'Record'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature section with player name */}
              <div className="golf-signature-section">
                {/* Player signature - handwritten style */}
                <div className="golf-signature">
                  {ghostType === 'personal_best' ? 
                    'Personal Best' :
                   ghostType === 'friend_best' && selectedMatch.playerName ? 
                    selectedMatch.playerName :
                   ghostType === 'course_record' && selectedMatch.playerName ?
                    selectedMatch.playerName :
                   'Ghost Player'}
                </div>
                
                {/* Underline for signature */}
                <div className="golf-signature-line" />
                
                {/* Additional details in small print */}
                <div className="golf-text-small" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <span>{selectedMatch.numHoles ? `${selectedMatch.numHoles} HOLES` : '18 HOLES'}</span>
                  {gameData?.weather && (
                    <>
                      <span>•</span>
                      <span>{gameData.weather}</span>
                    </>
                  )}
                </div>

                {/* Achievement label for course record */}
                {ghostType === 'course_record' && (
                  <div className="golf-badge" style={{ marginTop: '8px' }}>
                    COURSE RECORD
                  </div>
                )}
              </div>
            </div>
          ) : (
            // No matches available
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              backgroundColor: 'var(--ion-color-light)',
              borderRadius: '12px'
            }}>
              <IonNote style={{ fontSize: '14px' }}>
                {ghostType === 'personal_best' ? 'No matches available for this tee box' :
                 ghostType === 'friend_best' ? 'Selected friend has no matches on this tee box' :
                 'No course records available'}
              </IonNote>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '16px', marginTop: '16px' }}>
            <div style={{ 
              backgroundColor: 'var(--ion-color-danger-tint)',
              color: 'var(--ion-color-danger-contrast)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div style={{ 
          padding: '16px',
          paddingBottom: '32px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <button
            className="golf-button-primary"
            onClick={handleNext}
            disabled={loading || (!selectedMatch && !isCurrentUserKing)}
            style={{ 
              width: '100%',
              maxWidth: '400px',
              height: '56px',
              fontSize: '14px'
            }}
          >
            {loading ? <IonSpinner name="crescent" /> : 'PROCEED TO CHALLENGE'}
          </button>
        </div>
      </IonContent>

    </IonPage>
  );
};

export default GhostConfig;
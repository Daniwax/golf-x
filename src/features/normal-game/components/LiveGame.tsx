import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonButton,
  IonButtons,
  IonAlert,
  IonBadge,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/react';
import { 
  gridOutline, 
  trophyOutline, 
  golfOutline, 
  exitOutline,
  refreshOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { gameService } from '../services/gameService';
import type { Game, GameParticipant, GameHoleScore } from '../types';
import ScorecardMobile from './ScorecardMobile';
import Leaderboard from './Leaderboard';
import HoleEntry from './HoleEntry';
import ScorecardColorGuideModal from './ScorecardColorGuideModal';
import StrokesInfoModal from './StrokesInfoModal';

interface LiveGameParams {
  gameId: string;
}

const LiveGame: React.FC = () => {
  const { gameId } = useParams<LiveGameParams>();
  const history = useHistory();
  
  const [selectedTab, setSelectedTab] = useState<'scorecard' | 'leaderboard' | 'hole-entry' | 'exit'>('scorecard');
  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [scores, setScores] = useState<GameHoleScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentHole, setCurrentHole] = useState(1);
  const [courseName, setCourseName] = useState('');
  const [showColorGuide, setShowColorGuide] = useState(false);
  const [showStrokesInfo, setShowStrokesInfo] = useState(false);

  // Load game data on mount
  useEffect(() => {
    loadGameData();
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && !loading) {
      const interval = setInterval(() => {
        loadGameData(false); // Silent refresh
      }, 30000); // 30 seconds
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGameData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const gameData = await gameService.getGameDetails(gameId);
      setGame(gameData.game);
      setParticipants(gameData.participants);
      setScores(gameData.scores);
      
      // Calculate current hole based on scores
      const maxHolePlayed = Math.max(
        0,
        ...gameData.scores.filter(s => s.strokes).map(s => s.hole_number)
      );
      setCurrentHole(Math.min(maxHolePlayed + 1, 18));
      
      // Load course name
      // TODO: Add course name loading from database
      setCourseName('Golf Course');
      
      setError(null);
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadGameData(false);
    const target = event.target as HTMLIonRefresherElement;
    target.complete();
  };


  const confirmExit = () => {
    // Navigate directly to home page
    history.replace('/home');
  };

  const handleCancelGame = async () => {
    try {
      setLoading(true);
      await gameService.cancelGame(gameId);
      history.replace('/home');
    } catch (error) {
      console.error('Error canceling game:', error);
      // Still navigate to home even if deletion fails
      history.replace('/home');
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <IonSpinner name="crescent" />
            <IonNote>Loading game...</IonNote>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !game) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Game Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '16px',
            padding: '20px'
          }}>
            <IonNote color="danger">{error || 'Game not found'}</IonNote>
            <IonButton onClick={() => history.replace('/home')}>
              Back to Home
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Check if game is completed
  const isGameCompleted = game?.status === 'completed';

  // If game is completed, show completion screen
  if (isGameCompleted) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Game Completed</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => history.replace('/home')} fill="clear">
                <IonIcon icon={exitOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '20px',
            textAlign: 'center'
          }}>
            <IonIcon 
              icon={trophyOutline} 
              style={{ fontSize: '80px', color: 'var(--ion-color-warning)', marginBottom: '20px' }}
            />
            <h2 style={{ marginBottom: '10px' }}>Great Round!</h2>
            <IonNote style={{ display: 'block', marginBottom: '30px', fontSize: '16px' }}>
              Your game has been completed and saved.
            </IonNote>
            
            {/* Show final scores */}
            <IonCard style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '16px' }}>Final Scores</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {participants.map((p, idx) => {
                  const total = scores
                    .filter(s => s.user_id === p.user_id && s.strokes)
                    .reduce((sum, s) => sum + (s.strokes || 0), 0);
                  return (
                    <div key={p.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: idx < participants.length - 1 ? '1px solid var(--ion-color-light-shade)' : 'none'
                    }}>
                      <span style={{ fontWeight: '600' }}>
                        {p.profiles?.full_name || `Player ${idx + 1}`}
                      </span>
                      <IonBadge color={idx === 0 ? 'warning' : 'medium'}>
                        {total || '-'}
                      </IonBadge>
                    </div>
                  );
                })}
              </IonCardContent>
            </IonCard>
            
            <IonButton expand="block" onClick={() => history.replace('/home')}>
              Back to Home
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{courseName}</IonTitle>
          <IonButtons slot="start">
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--ion-color-medium)',
              padding: '0 8px',
              opacity: 0.7
            }}>
              #{gameId.slice(0, 8)}
            </div>
          </IonButtons>
          <IonButtons slot="end">
            {selectedTab === 'scorecard' && (
              <IonButton 
                onClick={() => setShowColorGuide(true)}
                fill="clear"
                style={{ '--color': 'var(--ion-color-primary)' }}
              >
                <IonIcon 
                  icon={informationCircleOutline} 
                  slot="icon-only"
                  style={{ fontSize: '24px' }}
                />
              </IonButton>
            )}
            {selectedTab === 'hole-entry' && (
              <IonButton 
                onClick={() => setShowStrokesInfo(true)}
                fill="clear"
                style={{ '--color': 'var(--ion-color-primary)' }}
              >
                <IonIcon 
                  icon={informationCircleOutline} 
                  slot="icon-only"
                  style={{ fontSize: '24px' }}
                />
              </IonButton>
            )}
            <IonButton onClick={() => loadGameData()} fill="clear">
              <IonIcon icon={refreshOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar color="light" style={{ minHeight: '44px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: '0 16px',
            width: '100%'
          }}>
            <div style={{ 
              flex: '1', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              justifyContent: 'flex-start'
            }}>
              <IonNote>Hole</IonNote>
              <IonBadge color="primary">{currentHole}</IonBadge>
            </div>
            <div style={{ 
              flex: '1', 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <IonNote style={{ fontSize: '12px' }}>
                {game.game_description || game.scoring_format.replace('_', ' ').toUpperCase()}
              </IonNote>
            </div>
            <div style={{ 
              flex: '1', 
              display: 'flex', 
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              <IonButton
                fill="clear"
                onClick={toggleAutoRefresh}
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  '--color': autoRefresh ? '#22c55e' : '#ef4444',
                  '--padding-start': '8px',
                  '--padding-end': '8px',
                  minHeight: '24px',
                  height: '24px'
                }}
              >
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Pull to refresh" refreshingText="Refreshing..."></IonRefresherContent>
        </IonRefresher>

        {/* Tab Content */}
        <div style={{ height: 'calc(100% - 56px)', overflow: 'auto', paddingBottom: '56px' }}>
          {selectedTab === 'scorecard' && (
            <ScorecardMobile
              gameId={gameId}
              participants={participants}
              scores={scores}
              currentHole={currentHole}
              onRefresh={() => loadGameData()}
              onEditHole={(hole) => {
                setCurrentHole(hole);
                setSelectedTab('hole-entry');
              }}
            />
          )}

          {selectedTab === 'leaderboard' && (
            <Leaderboard
              participants={participants}
              scores={scores}
              format={game.scoring_format}
              currentHole={currentHole}
              gameId={game.id}
            />
          )}

          {selectedTab === 'hole-entry' && (
            <HoleEntry
              gameId={gameId}
              participants={participants}
              scores={scores}
              currentHole={currentHole}
              onHoleChange={setCurrentHole}
              onScoreUpdate={() => loadGameData(false)}
              onGameComplete={() => {
                setSelectedTab('scorecard');
                loadGameData(true);
              }}
              isLiveMatch={game.status === 'active'}
            />
          )}

          {selectedTab === 'exit' && (
            <div style={{ 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '24px'
            }}>
              <IonIcon 
                icon={exitOutline} 
                style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }}
              />
              <div style={{ textAlign: 'center' }}>
                <h2>What would you like to do?</h2>
                <IonNote style={{ display: 'block', marginTop: '8px' }}>
                  Choose how to handle this game
                </IonNote>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
                <IonButton 
                  expand="block" 
                  fill="outline"
                  onClick={() => setSelectedTab('scorecard')}
                >
                  Continue Playing
                </IonButton>
                
                <IonButton 
                  expand="block" 
                  color="primary"
                  onClick={confirmExit}
                >
                  Exit & Save Game
                </IonButton>
                
                <IonButton 
                  expand="block" 
                  color="danger"
                  fill="outline"
                  onClick={handleCancelGame}
                >
                  Cancel & Delete Game
                </IonButton>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      {/* Custom Tab Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        backgroundColor: 'var(--ion-background-color)',
        borderTop: '1px solid var(--ion-color-light)',
        display: 'flex',
        zIndex: 1000
      }}>
        <IonButton 
          fill="clear"
          expand="full"
          className={selectedTab === 'scorecard' ? 'tab-selected' : ''}
          onClick={() => setSelectedTab('scorecard')}
          style={{
            '--color': selectedTab === 'scorecard' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)',
            flex: 1,
            height: '56px',
            margin: 0,
            borderRadius: 0
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <IonIcon icon={gridOutline} style={{ fontSize: '20px' }} />
            <IonLabel style={{ fontSize: '10px' }}>Scorecard</IonLabel>
          </div>
        </IonButton>
        
        <IonButton 
          fill="clear"
          expand="full"
          className={selectedTab === 'leaderboard' ? 'tab-selected' : ''}
          onClick={() => setSelectedTab('leaderboard')}
          style={{
            '--color': selectedTab === 'leaderboard' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)',
            flex: 1,
            height: '56px',
            margin: 0,
            borderRadius: 0
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <IonIcon icon={trophyOutline} style={{ fontSize: '20px' }} />
            <IonLabel style={{ fontSize: '10px' }}>Leaderboard</IonLabel>
          </div>
        </IonButton>
        
        <IonButton 
          fill="clear"
          expand="full"
          className={selectedTab === 'hole-entry' ? 'tab-selected' : ''}
          onClick={() => setSelectedTab('hole-entry')}
          style={{
            '--color': selectedTab === 'hole-entry' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)',
            flex: 1,
            height: '56px',
            margin: 0,
            borderRadius: 0
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <IonIcon icon={golfOutline} style={{ fontSize: '20px' }} />
            <IonLabel style={{ fontSize: '10px' }}>Hole Entry</IonLabel>
          </div>
        </IonButton>
        
        <IonButton 
          fill="clear"
          expand="full"
          className={selectedTab === 'exit' ? 'tab-selected' : ''}
          onClick={() => setSelectedTab('exit')}
          style={{
            '--color': selectedTab === 'exit' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)',
            flex: 1,
            height: '56px',
            margin: 0,
            borderRadius: 0
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <IonIcon icon={exitOutline} style={{ fontSize: '20px' }} />
            <IonLabel style={{ fontSize: '10px' }}>Exit</IonLabel>
          </div>
        </IonButton>
      </div>

      {/* Exit Confirmation Alert */}
      <IonAlert
        isOpen={showExitAlert}
        onDidDismiss={() => setShowExitAlert(false)}
        header="Exit Game"
        message="Are you sure you want to exit? Your progress will be saved."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Exit',
            handler: confirmExit
          }
        ]}
      />

      {/* Scorecard Color Guide Modal */}
      <ScorecardColorGuideModal
        isOpen={showColorGuide}
        onClose={() => setShowColorGuide(false)}
      />

      {/* Strokes Info Modal */}
      <StrokesInfoModal
        isOpen={showStrokesInfo}
        onClose={() => setShowStrokesInfo(false)}
      />
    </IonPage>
  );
};

export default LiveGame;
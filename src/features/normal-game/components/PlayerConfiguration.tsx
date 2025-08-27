import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonBackButton,
  IonButtons,
  IonAvatar,
  IonSpinner,
  IonNote,
  IonLabel,
  IonIcon
} from '@ionic/react';
import { checkmarkCircleOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import HandicapInput from './HandicapInput';
import TeeSelector from './TeeSelector';
import { 
  calculateCourseHandicap, 
  calculatePlayingHandicap,
  calculateMatchHandicap
} from '../utils/handicapCalculations';
import type { TeeBox } from '../types';

interface LocationState {
  gameData: {
    description?: string;
    courseId: number;
    weather: string;
    format: 'match_play' | 'stroke_play';
  };
  participants: string[]; // Array of user IDs
}

interface PlayerData {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  handicapIndex: number;
  teeBoxId: number | null;
  teeBox: TeeBox | null;
  courseHandicap: number;
  playingHandicap: number;
  matchHandicap: number;
}

const PlayerConfiguration: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { gameData, participants } = location.state || {};
  
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [coursePar, setCoursePar] = useState<number>(72); // Default to standard par
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Redirect if no game data
  useEffect(() => {
    if (!gameData || !participants) {
      history.replace('/game/create');
      return;
    }
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Load course data and tees in parallel
      const [courseResult, teesResult, profilesResult] = await Promise.all([
        supabase.from('golf_courses').select('par').eq('id', gameData.courseId).single(),
        supabase.from('tee_boxes')
          .select('id, course_id, name, color, slope_rating, course_rating, total_yards, total_meters, display_order')
          .eq('course_id', gameData.courseId)
          .order('display_order'),
        supabase.from('profiles')
          .select('id, full_name, email, avatar_url, handicap')
          .in('id', participants)
      ]);
      
      if (courseResult.error || !courseResult.data) {
        throw new Error('Failed to load course data');
      }
      
      if (teesResult.error || !teesResult.data || teesResult.data.length === 0) {
        throw new Error('Failed to load tee boxes');
      }
      
      if (profilesResult.error || !profilesResult.data) {
        throw new Error('Failed to load player profiles');
      }
      
      const par = courseResult.data.par || 72;
      setCoursePar(par);
      
      // Get default tee (usually blue/men's tee or second in order)
      const defaultTee = teesResult.data[1] || teesResult.data[0];
      
      // Initialize all players with calculated handicaps
      const initializedPlayers: PlayerData[] = profilesResult.data.map(profile => {
        const handicapIndex = profile.handicap || 15.0;
        
        // Calculate all handicaps immediately (defaultTee comes from database with slope_rating)
        const courseHandicap = calculateCourseHandicap(
          handicapIndex,
          defaultTee.slope_rating || 113,
          defaultTee.course_rating || 72,
          par
        );
        const playingHandicap = calculatePlayingHandicap(courseHandicap, gameData.format);
        
        return {
          userId: profile.id,
          fullName: profile.full_name || 'Player',
          email: profile.email,
          avatarUrl: profile.avatar_url,
          handicapIndex,
          teeBoxId: defaultTee.id,
          teeBox: {
            ...defaultTee,
            slope: defaultTee.slope_rating || 113
          },
          courseHandicap,
          playingHandicap,
          matchHandicap: 0 // Will be calculated after all players are initialized
        };
      });
      
      // Calculate match handicaps based on all playing handicaps
      const allPlayingHandicaps = initializedPlayers.map(p => p.playingHandicap);
      initializedPlayers.forEach((player, idx) => {
        player.matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);
      });
      
      setPlayers(initializedPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get slope and rating from tee box (handles both property names)
  const getTeeBoxValues = useCallback((teeBox: TeeBox) => {
    // gameService returns 'slope', database has 'slope_rating'
    const slope = teeBox.slope || (teeBox as unknown as {slope_rating?: number}).slope_rating || 113;
    const courseRating = teeBox.course_rating || 72;
    return { slope, courseRating };
  }, []);

  const recalculateAllHandicaps = useCallback((updatedPlayers: PlayerData[]) => {
    // Ensure all players have course and playing handicaps
    updatedPlayers.forEach(player => {
      if (player.teeBox && coursePar) {
        const { slope, courseRating } = getTeeBoxValues(player.teeBox);
        player.courseHandicap = calculateCourseHandicap(
          player.handicapIndex,
          slope,
          courseRating,
          coursePar
        );
        player.playingHandicap = calculatePlayingHandicap(player.courseHandicap, gameData?.format || 'stroke_play');
      }
    });
    
    // Recalculate match handicaps for all players
    const allPlayingHandicaps = updatedPlayers.map(p => p.playingHandicap);
    updatedPlayers.forEach((player, idx) => {
      player.matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);
    });
    
    return updatedPlayers;
  }, [coursePar, gameData?.format, getTeeBoxValues]);

  const updatePlayerHandicap = (index: number, handicapIndex: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].handicapIndex = handicapIndex;
    
    const recalculated = recalculateAllHandicaps(updatedPlayers);
    setPlayers(recalculated);
  };

  const updatePlayerTee = (index: number, teeBoxId: number, teeBox: TeeBox) => {
    // Don't update if same tee
    if (players[index]?.teeBoxId === teeBoxId) {
      return;
    }
    
    // Create updated players array
    const updatedPlayers = [...players];
    updatedPlayers[index].teeBoxId = teeBoxId;
    updatedPlayers[index].teeBox = teeBox;
    
    // Calculate handicaps immediately
    const { slope, courseRating } = getTeeBoxValues(teeBox);
    
    const courseHandicap = calculateCourseHandicap(
      updatedPlayers[index].handicapIndex,
      slope,
      courseRating,
      coursePar
    );
    const playingHandicap = calculatePlayingHandicap(courseHandicap, gameData.format);
    
    updatedPlayers[index].courseHandicap = courseHandicap;
    updatedPlayers[index].playingHandicap = playingHandicap;
    
    // Recalculate match handicaps for all players
    const allPlayingHandicaps = updatedPlayers.map(p => p.playingHandicap);
    updatedPlayers.forEach((player, idx) => {
      player.matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);
    });
    
    setPlayers(updatedPlayers);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const handlePreviousPlayer = () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    }
  };

  const handleProceedToSummary = () => {
    // All players already have calculated handicaps, so just navigate
    history.push('/game/summary', {
      gameData,
      players: players.map(p => ({
        userId: p.userId,
        fullName: p.fullName,
        handicapIndex: p.handicapIndex,
        teeBoxId: p.teeBoxId!,
        teeBox: p.teeBox!,
        courseHandicap: p.courseHandicap,
        playingHandicap: p.playingHandicap,
        matchHandicap: p.matchHandicap
      }))
    });
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
            <IonNote>Loading player data...</IonNote>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !gameData) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/game/add-participants" />
            </IonButtons>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{
            padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--ion-color-danger)' }}>
              {error || 'Game data not found. Please go back and try again.'}
            </p>
            <IonButton onClick={() => history.goBack()}>Go Back</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;
  const isFirstPlayer = currentPlayerIndex === 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/game/add-participants" />
          </IonButtons>
          <IonTitle>Player Configuration</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '12px',
          gap: '6px'
        }}>
          {players.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: idx === currentPlayerIndex 
                  ? 'var(--ion-color-primary)'
                  : idx < currentPlayerIndex
                  ? 'var(--ion-color-success)'
                  : 'var(--ion-color-light-shade)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Player Info with Handicap Adjustment */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: 'var(--ion-color-light)',
          marginBottom: '14px',
          gap: '10px'
        }}>
          <IonAvatar style={{ width: '36px', height: '36px' }}>
            {currentPlayer.avatarUrl ? (
              <img src={currentPlayer.avatarUrl} alt={currentPlayer.fullName} />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--ion-color-primary)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {currentPlayer.fullName[0]}
              </div>
            )}
          </IonAvatar>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '600'
            }}>
              {currentPlayer.fullName}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '11px',
              color: 'var(--ion-color-medium)'
            }}>
              Player {currentPlayerIndex + 1} of {players.length}
            </p>
          </div>
          
          {/* Handicap Adjustment in Top Right */}
          <HandicapInput
            value={currentPlayer.handicapIndex}
            onChange={(value) => updatePlayerHandicap(currentPlayerIndex, value)}
            showLabel={true}
          />
        </div>

        {/* Configuration Section */}
        <div style={{ padding: '0 14px' }}>
          {/* Tee Selection */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--ion-color-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              margin: '0 0 10px 0'
            }}>
              SELECT TEE *
            </h3>
            <TeeSelector
              courseId={gameData.courseId}
              value={currentPlayer.teeBoxId}
              onChange={(teeBoxId, teeBox) => updatePlayerTee(currentPlayerIndex, teeBoxId, teeBox)}
            />
          </div>

          {/* Calculated Handicaps */}
          <div style={{
            backgroundColor: 'var(--ion-background-color)',
            borderRadius: '10px',
            padding: '12px',
            border: '1px solid var(--ion-color-light-shade)',
            minHeight: '140px'
          }}>
            <IonLabel style={{ 
              fontSize: '12px', 
              fontWeight: 'bold',
              display: 'block',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Tee Information & Handicaps
            </IonLabel>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              textAlign: 'center',
              alignItems: 'stretch'
            }}>
              {/* Tee Ratings */}
              <div style={{
                backgroundColor: 'var(--ion-color-light)',
                borderRadius: '6px',
                padding: '8px 6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '9px', 
                      color: 'var(--ion-color-medium)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2px',
                      marginBottom: '1px'
                    }}>
                      Course Rating
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: 'var(--ion-color-primary)',
                      lineHeight: '1'
                    }}>
                      {currentPlayer.teeBox ? getTeeBoxValues(currentPlayer.teeBox).courseRating.toFixed(1) : '72.0'}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '9px', 
                      color: 'var(--ion-color-medium)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2px',
                      marginBottom: '1px'
                    }}>
                      Slope Rating
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: 'var(--ion-color-primary)',
                      lineHeight: '1'
                    }}>
                      {currentPlayer.teeBox ? getTeeBoxValues(currentPlayer.teeBox).slope : '113'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Handicap */}
              <div style={{
                backgroundColor: 'var(--ion-color-light)',
                borderRadius: '6px',
                padding: '8px 6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  fontSize: '9px', 
                  color: 'var(--ion-color-medium)',
                  marginBottom: '4px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  Course HC
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: 'var(--ion-color-secondary)',
                  lineHeight: '1.1'
                }}>
                  {isNaN(currentPlayer.courseHandicap) ? '0' : currentPlayer.courseHandicap}
                </div>
              </div>

              {/* Match Handicap */}
              <div style={{
                backgroundColor: 'var(--ion-color-light)',
                borderRadius: '6px',
                padding: '8px 6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  fontSize: '9px', 
                  color: 'var(--ion-color-medium)',
                  marginBottom: '4px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  Match HC
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: currentPlayer.matchHandicap === 0 
                    ? 'var(--ion-color-success)' 
                    : 'var(--ion-color-tertiary)',
                  lineHeight: '1.1'
                }}>
                  {isNaN(currentPlayer.matchHandicap) ? '0' : currentPlayer.matchHandicap}
                </div>
              </div>
            </div>

            {currentPlayer.matchHandicap === 0 && !isNaN(currentPlayer.matchHandicap) && (
              <div style={{
                marginTop: '8px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: 'var(--ion-color-success)'
              }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '14px' }} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>
                  Lowest handicap (plays to scratch)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons - Part of scrollable content */}
        <div style={{
          padding: '16px',
          marginTop: '18px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            width: '88%',
            maxWidth: '360px'
          }}>
            {!isFirstPlayer && (
              <IonButton
                expand="block"
                fill="outline"
                onClick={handlePreviousPlayer}
                style={{ 
                  flex: 1,
                  height: '42px'
                }}
              >
                <IonIcon icon={chevronBackOutline} slot="start" />
                Previous
              </IonButton>
            )}
            
            {!isLastPlayer ? (
              <IonButton
                expand="block"
                onClick={handleNextPlayer}
                style={{ 
                  flex: 1,
                  height: '42px'
                }}
              >
                Next Player
                <IonIcon icon={chevronForwardOutline} slot="end" />
              </IonButton>
            ) : (
              <IonButton
                expand="block"
                onClick={handleProceedToSummary}
                style={{ 
                  flex: 1,
                  height: '42px'
                }}
                color="success"
              >
                Review & Start Game
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PlayerConfiguration;
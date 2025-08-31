import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  IonLabel,
  IonIcon
} from '@ionic/react';
import { 
  checkmarkCircleOutline, 
  chevronBackOutline, 
  chevronForwardOutline, 
  informationCircleOutline 
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import HandicapInput from './HandicapInput';
import TeeSelector from './TeeSelector';
import { 
  calculateCourseHandicap, 
  calculatePlayingHandicap,
  calculateMatchHandicap
} from '../utils/handicapCalculations';
import { MatchHandicapEngine } from '../engines/MatchHandicapEngine';
import type { Player as EnginePlayer, HandicapContext } from '../engines/MatchHandicapEngine';
import type { TeeBox } from '../types';

interface LocationState {
  gameData: {
    description?: string;
    courseId: number;
    weather: string;
    format: 'match_play' | 'stroke_play';
    handicapType?: string;
    scoringMethod?: string;
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
  const [handicapsCalculated, setHandicapsCalculated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const initializingRef = useRef(false);

  // Redirect if no game data
  useEffect(() => {
    if (!gameData || !participants) {
      history.replace('/game/create');
      return;
    }
    
    // Prevent double execution in React StrictMode
    let mounted = true;
    
    const load = async () => {
      if (mounted) {
        await loadInitialData();
      }
    };
    
    load();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = async () => {
    
    // Prevent concurrent initialization
    if (initializingRef.current) {
      return;
    }
    
    // Don't reload if already loaded
    if (players.length > 0 && handicapsCalculated) {
      return;
    }
    
    initializingRef.current = true;
    
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
          .select('id, full_name, email, avatar_url, custom_avatar_url, handicap')
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
        
        const player = {
          userId: profile.id,
          fullName: profile.full_name || 'Player',
          email: profile.email,
          avatarUrl: profile.custom_avatar_url || profile.avatar_url,
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
        
        return player;
      });
      
      // Calculate match handicaps using engine if handicap type is specified
      if (gameData?.handicapType || gameData?.scoringMethod) {
        // Prepare players for engine
        const enginePlayers: EnginePlayer[] = initializedPlayers.map(p => ({
          userId: p.userId,
          fullName: p.fullName,
          handicapIndex: p.handicapIndex,
          courseHandicap: p.courseHandicap,
          teeBoxId: p.teeBoxId || undefined
        }));
        
        // Create context for engine
        const context: HandicapContext = {
          courseId: gameData.courseId,
          teeBoxId: defaultTee.id
        };
        
        try {
          // Use handicapType if explicitly set, otherwise determine from scoringMethod
          let handicapType = gameData.handicapType;
          
          if (!handicapType) {
            // If no explicit handicap type, use a sensible default based on scoring method
            if (gameData.scoringMethod === 'match_play') {
              handicapType = 'match_play'; // Relative handicapping for match play
            } else {
              handicapType = 'stroke_play'; // Full handicap for other scoring methods
            }
          }
          
          
          // Calculate match handicaps using engine
          const matchHandicapResults = await MatchHandicapEngine.calculateMatchHandicap(
            enginePlayers,
            handicapType,
            context
          );
          
          // Apply engine results to players
          matchHandicapResults.forEach(result => {
            const player = initializedPlayers.find(p => p.userId === result.userId);
            if (player) {
              player.matchHandicap = result.matchHandicap;
            }
          });
        } catch (err) {
          console.error('Failed to calculate match handicaps with engine:', err);
          // Fallback to old method
          const allPlayingHandicaps = initializedPlayers.map(p => p.playingHandicap);
          initializedPlayers.forEach((player, idx) => {
            player.matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);
          });
        }
      } else {
        // Fallback to old method if no handicap type specified
        const allPlayingHandicaps = initializedPlayers.map(p => p.playingHandicap);
        initializedPlayers.forEach((player, idx) => {
          player.matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);
        });
      }
      
      
      setPlayers(initializedPlayers);
      setHandicapsCalculated(true); // Mark that handicaps have been calculated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      initializingRef.current = false;
    }
  };

  // Helper to get slope and rating from tee box (handles both property names)
  const getTeeBoxValues = useCallback((teeBox: TeeBox) => {
    // gameService returns 'slope', database has 'slope_rating'
    const slope = teeBox.slope || (teeBox as unknown as {slope_rating?: number}).slope_rating || 113;
    const courseRating = teeBox.course_rating || 72;
    return { slope, courseRating };
  }, []);

  const recalculateAllHandicaps = useCallback(async (updatedPlayers: PlayerData[]) => {
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
    
    // Use MatchHandicapEngine based on game type
    if (gameData?.handicapType || gameData?.scoringMethod) {
      // Prepare players for engine
      const enginePlayers: EnginePlayer[] = updatedPlayers.map(p => ({
        userId: p.userId,
        fullName: p.fullName,
        handicapIndex: p.handicapIndex,
        courseHandicap: p.courseHandicap,
        teeBoxId: p.teeBoxId || undefined
      }));
      
      // Create context for engine
      const context: HandicapContext = {
        courseId: gameData.courseId,
        teeBoxId: updatedPlayers[0]?.teeBoxId || undefined
      };
      
      try {
        // Use handicapType if explicitly set, otherwise determine from scoringMethod
        // Note: handicapType is the handicap calculation method (how strokes are distributed)
        // scoringMethod is how the game is scored (stroke_play, match_play, stableford, skins)
        let handicapType = gameData.handicapType;
        
        if (!handicapType) {
          // If no explicit handicap type, use a sensible default based on scoring method
          if (gameData.scoringMethod === 'match_play') {
            handicapType = 'match_play'; // Relative handicapping for match play
          } else {
            handicapType = 'stroke_play'; // Full handicap for other scoring methods
          }
        }
        
        
        // Calculate match handicaps using engine
        const matchHandicapResults = await MatchHandicapEngine.calculateMatchHandicap(
          enginePlayers,
          handicapType,
          context
        );
        
        // Apply engine results to players
        matchHandicapResults.forEach(result => {
          const player = updatedPlayers.find(p => p.userId === result.userId);
          if (player) {
            player.matchHandicap = result.matchHandicap;
          }
        });
      } catch (err) {
        console.error('Failed to calculate match handicaps with engine:', err);
        // Fallback to old method
        const allPlayingHandicaps = updatedPlayers.map(p => p.playingHandicap);
        updatedPlayers.forEach((player, idx) => {
          player.matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);
        });
      }
    } else {
      // Fallback to old method if no handicap type specified
      const allPlayingHandicaps = updatedPlayers.map(p => p.playingHandicap);
      updatedPlayers.forEach((player, idx) => {
        player.matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);
      });
    }
    
    return updatedPlayers;
  }, [coursePar, gameData?.format, gameData?.handicapType, gameData?.scoringMethod, gameData?.courseId, getTeeBoxValues]);

  const updatePlayerHandicap = async (index: number, handicapIndex: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].handicapIndex = handicapIndex;
    
    const recalculated = await recalculateAllHandicaps(updatedPlayers);
    setPlayers(recalculated);
  };

  const updatePlayerTee = async (index: number, teeBoxId: number, teeBox: TeeBox) => {
    // Don't update if same tee
    if (players[index]?.teeBoxId === teeBoxId) {
      return;
    }
    
    // Create updated players array
    const updatedPlayers = [...players];
    updatedPlayers[index].teeBoxId = teeBoxId;
    updatedPlayers[index].teeBox = teeBox;
    
    // Use the engine-based recalculation
    const recalculated = await recalculateAllHandicaps(updatedPlayers);
    setPlayers(recalculated);
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
        avatarUrl: p.avatarUrl,
        handicapIndex: p.handicapIndex,
        teeBoxId: p.teeBoxId!,
        teeBox: p.teeBox!,
        courseHandicap: p.courseHandicap,
        playingHandicap: p.playingHandicap,
        matchHandicap: p.matchHandicap
      }))
    });
  };

  if (loading || !handicapsCalculated) {
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
        <IonContent>
          <div style={{ 
            padding: '20px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Progress dots skeleton */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '12px',
              gap: '6px',
              marginBottom: '20px'
            }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--ion-color-light-shade)',
                    animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`
                  }}
                />
              ))}
            </div>

            {/* Player card skeleton */}
            <div style={{
              backgroundColor: 'var(--ion-color-light)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              animation: 'shimmer 2s infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Avatar skeleton */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'loading 1.5s infinite'
                }}/>
                
                {/* Name skeleton */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    height: '20px',
                    width: '120px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    animation: 'loading 1.5s infinite'
                  }}/>
                  <div style={{
                    height: '14px',
                    width: '80px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    animation: 'loading 1.5s infinite 0.1s'
                  }}/>
                </div>

                {/* Handicap skeleton */}
                <div style={{
                  width: '60px',
                  height: '36px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  animation: 'loading 1.5s infinite 0.2s'
                }}/>
              </div>
            </div>

            {/* Tee selector skeleton */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                height: '14px',
                width: '100px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                marginBottom: '12px',
                animation: 'loading 1.5s infinite'
              }}/>
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '4px 0'
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      minWidth: '80px',
                      height: '60px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '8px',
                      animation: `loading 1.5s infinite ${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Handicap cards skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    height: '80px',
                    animation: `loading 1.5s infinite ${i * 0.15}s`
                  }}
                />
              ))}
            </div>

            {/* Loading message */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid var(--ion-color-light-shade)',
                borderTopColor: 'var(--ion-color-primary)',
                animation: 'spin 1s linear infinite'
              }}/>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--ion-color-dark)'
                }}>
                  Setting up players
                </h3>
                <p style={{ 
                  margin: 0,
                  fontSize: '14px',
                  color: 'var(--ion-color-medium)'
                }}>
                  Calculating handicaps...
                </p>
              </div>
            </div>

            {/* CSS animations */}
            <style>
              {`
                @keyframes loading {
                  0% {
                    background-position: -200% 0;
                  }
                  100% {
                    background-position: 200% 0;
                  }
                }
                
                @keyframes pulse {
                  0%, 100% {
                    opacity: 0.3;
                    transform: scale(1);
                  }
                  50% {
                    opacity: 1;
                    transform: scale(1.2);
                  }
                }
                
                @keyframes spin {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
                
                @keyframes shimmer {
                  0% {
                    opacity: 0.9;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    opacity: 0.9;
                  }
                }
              `}
            </style>
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
                  {!handicapsCalculated ? '...' : (isNaN(currentPlayer.courseHandicap) ? '0' : currentPlayer.courseHandicap)}
                </div>
              </div>

              {/* Match/Playing Handicap */}
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
                  {(() => {
                    // Same logic as in the engine calculation
                    let hcType = gameData?.handicapType;
                    if (!hcType) {
                      hcType = gameData?.scoringMethod === 'match_play' ? 'match_play' : 'stroke_play';
                    }
                    switch(hcType) {
                      case 'match_play':
                        return 'Match HC';
                      case 'stroke_play':
                        return 'Playing HC';
                      case 'none':
                        return 'Scratch';
                      case 'random':
                        return 'Lucky HC';
                      case 'ghost':
                        return 'Ghost HC';
                      default:
                        return 'Playing HC';
                    }
                  })()}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: (() => {
                    // Same logic as in the engine calculation
                    let hcType = gameData?.handicapType;
                    if (!hcType) {
                      hcType = gameData?.scoringMethod === 'match_play' ? 'match_play' : 'stroke_play';
                    }
                    if (hcType === 'none') return 'var(--ion-color-medium)';
                    if (hcType === 'ghost') return 'var(--ion-color-warning)';
                    if (currentPlayer.matchHandicap === 0) return 'var(--ion-color-success)';
                    return 'var(--ion-color-tertiary)';
                  })(),
                  lineHeight: '1.1'
                }}>
                  {!handicapsCalculated ? '...' : (isNaN(currentPlayer.matchHandicap) ? '0' : currentPlayer.matchHandicap)}
                </div>
              </div>
            </div>

            {handicapsCalculated && currentPlayer.matchHandicap === 0 && !isNaN(currentPlayer.matchHandicap) && gameData?.handicapType === 'match_play' && (
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

        {/* Handicap Type Info Label */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          marginTop: '24px'
        }}>
          <div style={{
            backgroundColor: 'rgba(128, 128, 128, 0.08)',
            border: '1px solid rgba(128, 128, 128, 0.15)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '360px',
            width: '88%'
          }}>
            <IonIcon 
              icon={informationCircleOutline} 
              style={{ 
                fontSize: '16px',
                color: 'var(--ion-color-medium)',
                flexShrink: 0
              }}
            />
            <div style={{
              fontSize: '12px',
              color: 'var(--ion-color-medium-shade)',
              lineHeight: '1.4'
            }}>
              <span style={{ fontWeight: '600' }}>
                {gameData.handicapType ? 'Handicap Type: ' : 'Game Format: '}
              </span>
              <span style={{ textTransform: 'capitalize' }}>
                {gameData.handicapType?.replace('_', ' ') || gameData.format?.replace('_', ' ') || 'Stroke Play'}
              </span>
              {gameData.scoringMethod && (
                <span style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>
                  <span style={{ fontWeight: '600' }}>Scoring: </span>
                  <span style={{ textTransform: 'capitalize' }}>
                    {gameData.scoringMethod.replace('_', ' ')}
                  </span>
                </span>
              )}
              <span style={{ 
                display: 'block',
                fontSize: '11px',
                marginTop: '2px',
                color: 'var(--ion-color-medium)'
              }}>
                {(() => {
                  // Same logic as in the engine calculation
                  let hcType = gameData.handicapType;
                  if (!hcType) {
                    hcType = gameData.scoringMethod === 'match_play' ? 'match_play' : 'stroke_play';
                  }
                  switch(hcType) {
                    case 'match_play':
                      return 'Match HC: Lowest player plays to 0, others get the difference';
                    case 'stroke_play':
                      return 'Playing HC: 95% of Course HC for tournament play';
                    case 'none':
                      return 'Scratch play: No handicap adjustments applied';
                    case 'random':
                      return 'Lucky Draw: 95% HC with randomized stroke distribution';
                    case 'ghost':
                      return 'Ghost Mode: Compete against best historical scores';
                    default:
                      return 'Standard handicap calculation applied';
                  }
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Part of scrollable content */}
        <div style={{
          padding: '16px',
          marginTop: '12px',
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
              <button
                className="golf-button-secondary"
                onClick={handlePreviousPlayer}
                style={{ 
                  flex: 1,
                  height: '48px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: '1px solid #2a5434',
                  backgroundColor: 'transparent',
                  color: '#2a5434',
                  borderRadius: '8px',
                  padding: '0 16px',
                  cursor: 'pointer'
                }}
              >
                <IonIcon icon={chevronBackOutline} style={{ fontSize: '18px' }} />
                Previous
              </button>
            )}
            
            {!isLastPlayer ? (
              <button
                className="golf-button-primary"
                onClick={handleNextPlayer}
                style={{ 
                  flex: 1,
                  height: '48px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#2a5434',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '0 16px',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                Next Player
                <IonIcon icon={chevronForwardOutline} style={{ fontSize: '18px' }} />
              </button>
            ) : (
              <button
                className="golf-button-primary"
                onClick={handleProceedToSummary}
                style={{ 
                  flex: 1,
                  height: '48px',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  backgroundColor: '#2a5434',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '0 16px',
                  cursor: 'pointer',
                  border: 'none',
                  textTransform: 'uppercase'
                }}
              >
                Review & Start Game
              </button>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PlayerConfiguration;
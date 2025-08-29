import React, { useEffect, useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonLabel, 
  IonNote, 
  IonBackButton, 
  IonButtons,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAvatar
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { checkmark, trophy } from 'ionicons/icons';
import { supabase } from '../../../lib/supabase';
import { gameService } from '../services/gameService';
import type { TeeBox, CreateGameData } from '../types';

interface LocationState {
  gameData: {
    description?: string;
    courseId: number;
    weather: string;
    format: 'match_play' | 'stroke_play';
    handicapType?: string;
    scoringMethod?: string;
  };
  players: Array<{
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
    handicapIndex: number;
    teeBoxId: number;
    teeBox?: TeeBox;
    courseHandicap: number;
    playingHandicap: number;
    matchHandicap: number;
  }>;
}

interface HoleInfo {
  hole_number: number;
  par: number;
  handicap_index: number;
}

const GameSummary: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { gameData, players } = location.state || {};
  
  const [holes, setHoles] = useState<HoleInfo[]>([]);
  const [courseName, setCourseName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  useEffect(() => {
    if (!gameData || !players || players.length === 0) {
      history.replace('/game/create');
      return;
    }
    
    loadCourseData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const loadCourseData = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Load course details and holes
      const { data: course } = await supabase
        .from('golf_courses')
        .select('name')
        .eq('id', gameData.courseId)
        .single();
        
      if (course) {
        setCourseName(course.name);
      }
      
      // Load hole information
      const { data: holeData } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', gameData.courseId)
        .order('hole_number');
        
      if (holeData) {
        setHoles(holeData);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStrokesForHole = (playerMatchHandicap: number, holeHandicapIndex: number): number => {
    if (playerMatchHandicap <= 0) return 0;
    
    // For 18 holes:
    // If player has 1-18 strokes, they get 1 stroke on holes with HCP 1 through their match handicap
    // If player has 19-36 strokes, they get 2 strokes on holes with HCP 1 through (match handicap - 18), and 1 stroke on the rest
    // And so on...
    
    const fullRounds = Math.floor(playerMatchHandicap / 18);
    const remainingStrokes = playerMatchHandicap % 18;
    
    if (holeHandicapIndex <= remainingStrokes) {
      return fullRounds + 1;
    } else {
      return fullRounds;
    }
  };
  
  const handleCreateGame = async () => {
    setCreating(true);
    try {
      // Debug: Check authentication first
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found. Please log in again.');
      }
      
      // Create the game with the configured players
      const gameConfig: CreateGameData = {
        description: gameData.description || undefined,
        course_id: gameData.courseId,
        weather: gameData.weather as 'sunny' | 'partly_cloudy' | 'rainy' | 'windy',
        format: gameData.format,
        handicap_type: gameData.handicapType as 'none' | 'match_play' | 'stroke_play' | 'random' | undefined,
        scoring_method: gameData.scoringMethod as 'net_score' | 'match_play' | 'stableford' | 'skins' | undefined,
        participants: players.map(p => ({
          user_id: p.userId,
          full_name: p.fullName,
          handicap_index: p.handicapIndex,
          tee_box_id: p.teeBoxId
        }))
      };
      
      const game = await gameService.createGame(gameConfig);
      
      // Navigate to live game
      history.replace(`/game/live/${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      
      // Create detailed debug info
      const errorObj = error as { message?: string; code?: string; details?: string; hint?: string };
      const debugInfo = {
        errorMessage: errorObj?.message || 'Unknown error',
        errorCode: errorObj?.code || 'No code',
        errorDetails: errorObj?.details || 'No details',
        errorHint: errorObj?.hint || 'No hint',
        browser: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      // Show detailed error in an alert for debugging
      const detailedError = `
DEBUG INFO (Please screenshot and share):

Error: ${debugInfo.errorMessage}
Code: ${debugInfo.errorCode}
Details: ${debugInfo.errorDetails}
Hint: ${debugInfo.errorHint}

Browser Info:
${debugInfo.browser.substring(0, 100)}...

Time: ${debugInfo.timestamp}
      `.trim();
      
      alert(detailedError);
      setCreating(false);
    }
  };
  
  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  // Handle case where state is missing (e.g., when navigating back)
  if (!gameData || !players || players.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/game/configure-players" />
            </IonButtons>
            <IonTitle>Game Summary</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <IonNote>No game data available. Please start from the beginning.</IonNote>
            <IonButton 
              onClick={() => history.replace('/game/create')}
              style={{ marginTop: '20px' }}
            >
              Start New Game
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  const lowestHandicap = Math.min(...players.map(p => p.playingHandicap));
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/game/configure-players" />
          </IonButtons>
          <IonTitle>Game Summary</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {/* Game Info Card */}
        <IonCard style={{ 
          margin: '0',
          borderRadius: '0',
          boxShadow: 'none',
          borderBottom: '1px solid var(--ion-color-light-shade)'
        }}>
          <IonCardHeader style={{ padding: '16px' }}>
            <IonCardTitle>{courseName}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <IonNote>Format</IonNote>
                <IonLabel style={{ display: 'block', fontWeight: 'bold' }}>
                  {gameData.format === 'match_play' ? 'Match Play' : 'Stroke Play'}
                </IonLabel>
              </div>
              <div>
                <IonNote>Weather</IonNote>
                <IonLabel style={{ display: 'block', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {gameData.weather.replace('_', ' ')}
                </IonLabel>
              </div>
            </div>
            {gameData.description && (
              <div style={{ marginTop: '12px' }}>
                <IonNote>Description</IonNote>
                <IonLabel style={{ display: 'block', marginTop: '4px' }}>
                  "{gameData.description}"
                </IonLabel>
              </div>
            )}
          </IonCardContent>
        </IonCard>
        
        {/* Players Summary */}
        <div style={{ padding: '16px 16px 8px 16px', backgroundColor: 'var(--ion-color-light)' }}>
          <IonLabel style={{ fontWeight: 'bold', fontSize: '16px' }}>
            Players & Handicaps
          </IonLabel>
        </div>
        
        <IonCard style={{ 
          margin: '0',
          borderRadius: '0',
          boxShadow: 'none',
          borderBottom: '1px solid var(--ion-color-light-shade)'
        }}>
          <IonCardContent style={{ padding: '16px' }}>
            {players.map((player, index) => {
              // Get tee box values safely
              const getTeeBoxValues = (teeBox?: TeeBox) => {
                if (!teeBox) return { courseRating: 72, slope: 113 };
                const slope = teeBox.slope || (teeBox as unknown as {slope_rating?: number}).slope_rating || 113;
                const courseRating = teeBox.course_rating || 72;
                return { slope, courseRating };
              };
              
              const teeValues = getTeeBoxValues(player.teeBox);
              
              // Find best (lowest match HC) and worst (highest match HC) players
              const lowestMatchHC = Math.min(...players.map(p => p.matchHandicap));
              const highestMatchHC = Math.max(...players.map(p => p.matchHandicap));
              
              // Determine background color
              let backgroundColor = 'transparent';
              if (player.matchHandicap === lowestMatchHC) {
                backgroundColor = 'rgb(45 212 191 / 18%)'; // Light turquoise/teal
              } else if (player.matchHandicap === highestMatchHC) {
                backgroundColor = 'rgba(128, 128, 128, 0.1)'; // Light gray
              }
              
              return (
                <div 
                  key={player.userId} 
                  style={{ 
                    padding: '12px 16px',
                    borderBottom: index < players.length - 1 ? '1px solid var(--ion-color-light-shade)' : 'none',
                    backgroundColor,
                    marginLeft: '-16px',
                    marginRight: '-16px',
                    marginBottom: '0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <IonAvatar style={{ width: '40px', height: '40px' }}>
                        {player.avatarUrl ? (
                          <img src={player.avatarUrl} alt={player.fullName} />
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
                            {player.fullName?.[0] || '?'}
                          </div>
                        )}
                      </IonAvatar>
                      <IonLabel style={{ fontWeight: 'bold' }}>
                        {player.fullName}
                      </IonLabel>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <IonNote style={{ display: 'block', fontSize: '11px' }}>Match HC</IonNote>
                      <IonLabel style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        color: player.matchHandicap === 0 ? 'var(--ion-color-success)' : 'var(--ion-color-primary)'
                      }}>
                        {player.matchHandicap}
                      </IonLabel>
                    </div>
                  </div>
                  
                  {/* Tee Information and Handicaps Row */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    marginTop: '8px'
                  }}>
                    {/* Tee Ratings */}
                    <div style={{
                      backgroundColor: 'var(--ion-color-light-tint)',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          <div style={{ 
                            fontSize: '9px', 
                            color: 'var(--ion-color-medium)',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            Course Rating
                          </div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            color: 'var(--ion-color-dark)'
                          }}>
                            {teeValues.courseRating.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '9px', 
                            color: 'var(--ion-color-medium)',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            Slope Rating
                          </div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            color: 'var(--ion-color-dark)'
                          }}>
                            {teeValues.slope}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Course Handicap */}
                    <div style={{
                      backgroundColor: 'var(--ion-color-light-tint)',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '9px', 
                        color: 'var(--ion-color-medium)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '2px'
                      }}>
                        Course HC
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: 'var(--ion-color-secondary)'
                      }}>
                        {player.courseHandicap}
                      </div>
                    </div>
                    
                    {/* Handicap Index */}
                    <div style={{
                      backgroundColor: 'var(--ion-color-light-tint)',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '9px', 
                        color: 'var(--ion-color-medium)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '2px'
                      }}>
                        HCP Index
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: 'var(--ion-color-tertiary)'
                      }}>
                        {player.handicapIndex.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </IonCardContent>
        </IonCard>
        
        {/* Stroke Distribution Table (Match Play Only) - Vertical Layout */}
        {gameData.format === 'match_play' && holes.length > 0 && (
          <>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'var(--ion-color-light)', 
              marginTop: '1px',
              borderTop: '1px solid var(--ion-color-light-shade)'
            }}>
              <IonLabel style={{ fontWeight: 'bold', fontSize: '16px' }}>
                Stroke Distribution
              </IonLabel>
              <IonNote style={{ display: 'block', marginTop: '4px', fontSize: '13px' }}>
                Strokes given based on hole handicap index
              </IonNote>
            </div>
            
            {/* Front Nine */}
            <IonCard style={{
              margin: '0',
              borderRadius: '0',
              boxShadow: 'none'
            }}>
              <IonCardHeader style={{ 
                backgroundColor: 'var(--ion-color-light)',
                padding: '12px 16px',
                borderTop: '1px solid var(--ion-color-light-shade)'
              }}>
                <IonCardTitle style={{ fontSize: '14px' }}>Front Nine</IonCardTitle>
              </IonCardHeader>
              <IonCardContent style={{ padding: '0' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '11px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--ion-color-light)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', width: '25%' }}>
                        Hole
                      </th>
                      <th style={{ padding: '6px 4px', textAlign: 'center', width: '15%' }}>
                        Par
                      </th>
                      <th style={{ padding: '6px 4px', textAlign: 'center', width: '15%' }}>
                        HCP
                      </th>
                      {players.map(player => (
                        <th key={player.userId} style={{ 
                          padding: '6px 4px', 
                          textAlign: 'center',
                          width: `${45 / players.length}%`
                        }}>
                          {player.fullName.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holes.slice(0, 9).map(hole => (
                      <tr key={hole.hole_number} style={{ 
                        borderTop: '1px solid var(--ion-color-light-shade)'
                      }}>
                        <td style={{ padding: '8px', fontWeight: '600' }}>
                          Hole {hole.hole_number}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          {hole.par}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          <IonNote>{hole.handicap_index}</IonNote>
                        </td>
                        {players.map(player => {
                          const strokes = getStrokesForHole(player.matchHandicap, hole.handicap_index);
                          return (
                            <td 
                              key={player.userId}
                              style={{ 
                                padding: '8px 4px', 
                                textAlign: 'center',
                                backgroundColor: strokes > 0 
                                  ? strokes === 1 
                                    ? 'var(--ion-color-primary-tint)' 
                                    : 'var(--ion-color-warning-tint)'
                                  : 'transparent',
                                fontWeight: strokes > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {strokes > 0 ? `+${strokes}` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Front Nine Total */}
                    <tr style={{ 
                      borderTop: '1px solid var(--ion-color-light-shade)',
                      backgroundColor: 'rgba(var(--ion-color-light-rgb), 0.5)',
                      fontWeight: 'bold'
                    }}>
                      <td style={{ padding: '8px' }}>OUT</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        {holes.slice(0, 9).reduce((sum, h) => sum + h.par, 0)}
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>-</td>
                      {players.map(player => {
                        const frontStrokes = holes.slice(0, 9).reduce((sum, hole) => 
                          sum + getStrokesForHole(player.matchHandicap, hole.handicap_index), 0
                        );
                        return (
                          <td key={player.userId} style={{ 
                            padding: '8px 4px', 
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}>
                            {frontStrokes > 0 ? `+${frontStrokes}` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </IonCardContent>
            </IonCard>
            
            {/* Back Nine */}
            <IonCard style={{ 
              margin: '0',
              marginTop: '1px',
              borderRadius: '0',
              boxShadow: 'none'
            }}>
              <IonCardHeader style={{ 
                backgroundColor: 'var(--ion-color-light)',
                padding: '12px 16px',
                borderTop: '1px solid var(--ion-color-light-shade)'
              }}>
                <IonCardTitle style={{ fontSize: '14px' }}>Back Nine</IonCardTitle>
              </IonCardHeader>
              <IonCardContent style={{ padding: '0' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '11px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--ion-color-light)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', width: '25%' }}>
                        Hole
                      </th>
                      <th style={{ padding: '6px 4px', textAlign: 'center', width: '15%' }}>
                        Par
                      </th>
                      <th style={{ padding: '6px 4px', textAlign: 'center', width: '15%' }}>
                        HCP
                      </th>
                      {players.map(player => (
                        <th key={player.userId} style={{ 
                          padding: '6px 4px', 
                          textAlign: 'center',
                          width: `${45 / players.length}%`
                        }}>
                          {player.fullName.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holes.slice(9, 18).map(hole => (
                      <tr key={hole.hole_number} style={{ 
                        borderTop: '1px solid var(--ion-color-light-shade)'
                      }}>
                        <td style={{ padding: '8px', fontWeight: '600' }}>
                          Hole {hole.hole_number}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          {hole.par}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          <IonNote>{hole.handicap_index}</IonNote>
                        </td>
                        {players.map(player => {
                          const strokes = getStrokesForHole(player.matchHandicap, hole.handicap_index);
                          return (
                            <td 
                              key={player.userId}
                              style={{ 
                                padding: '8px 4px', 
                                textAlign: 'center',
                                backgroundColor: strokes > 0 
                                  ? strokes === 1 
                                    ? 'var(--ion-color-primary-tint)' 
                                    : 'var(--ion-color-warning-tint)'
                                  : 'transparent',
                                fontWeight: strokes > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {strokes > 0 ? `+${strokes}` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Back Nine Total */}
                    <tr style={{ 
                      borderTop: '1px solid var(--ion-color-light-shade)',
                      backgroundColor: 'rgba(var(--ion-color-light-rgb), 0.5)',
                      fontWeight: 'bold'
                    }}>
                      <td style={{ padding: '8px' }}>IN</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        {holes.slice(9, 18).reduce((sum, h) => sum + h.par, 0)}
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>-</td>
                      {players.map(player => {
                        const backStrokes = holes.slice(9, 18).reduce((sum, hole) => 
                          sum + getStrokesForHole(player.matchHandicap, hole.handicap_index), 0
                        );
                        return (
                          <td key={player.userId} style={{ 
                            padding: '8px 4px', 
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}>
                            {backStrokes > 0 ? `+${backStrokes}` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                    {/* Total Row */}
                    <tr style={{ 
                      borderTop: '2px solid var(--ion-color-light-shade)',
                      backgroundColor: 'var(--ion-color-light)',
                      fontWeight: 'bold'
                    }}>
                      <td style={{ padding: '8px', fontSize: '12px' }}>TOTAL</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        {holes.reduce((sum, h) => sum + h.par, 0)}
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>-</td>
                      {players.map(player => {
                        const totalStrokes = holes.reduce((sum, hole) => 
                          sum + getStrokesForHole(player.matchHandicap, hole.handicap_index), 0
                        );
                        return (
                          <td key={player.userId} style={{ 
                            padding: '8px 4px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            color: 'var(--ion-color-primary)'
                          }}>
                            {totalStrokes > 0 ? `+${totalStrokes}` : '0'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </IonCardContent>
            </IonCard>
            
            {/* Legend */}
            <div style={{ padding: '16px', marginBottom: '80px' }}>
              <IonNote style={{ display: 'flex', gap: '16px', fontSize: '12px', justifyContent: 'center' }}>
                <span>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'var(--ion-color-primary-tint)',
                    marginRight: '4px',
                    verticalAlign: 'middle'
                  }}></span>
                  +1 stroke
                </span>
                <span>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'var(--ion-color-warning-tint)',
                    marginRight: '4px',
                    verticalAlign: 'middle'
                  }}></span>
                  +2 strokes
                </span>
              </IonNote>
            </div>
          </>
        )}
        
        {/* Create Game Button */}
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
            disabled={creating}
            style={{ flex: 1 }}
          >
            Back
          </IonButton>
          <IonButton
            expand="block"
            onClick={handleCreateGame}
            disabled={creating}
            style={{ flex: 2 }}
          >
            {creating ? (
              <>
                <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                Creating...
              </>
            ) : (
              <>
                <IonIcon icon={checkmark} slot="start" />
                Start Game
              </>
            )}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GameSummary;
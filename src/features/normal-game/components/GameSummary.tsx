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
import { checkmark, refresh } from 'ionicons/icons';
import { supabase } from '../../../lib/supabase';
import { gameService } from '../services/gameService';
import type { TeeBox, CreateGameData } from '../types';
import { MatchHandicapEngine } from '../engines/MatchHandicapEngine';
import { PMPEngine } from '../engines/PMPEngine';
import type { Player as EnginePlayer, HandicapContext, MatchHandicapResult } from '../engines/MatchHandicapEngine';
import type { Hole as EngineHole, PlayerMatchPar } from '../engines/PMPEngine';

interface LocationState {
  gameData: {
    description?: string;
    courseId: number;
    weather: string;
    format: 'match_play' | 'stroke_play';
    handicapType?: string;
    scoringMethod?: string;
    numberOfHoles?: number;
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
  const [matchHandicapResults, setMatchHandicapResults] = useState<MatchHandicapResult[]>([]);
  const [pmpResults, setPmpResults] = useState<Map<string, PlayerMatchPar[]>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  
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
      console.log('Loading holes for course:', gameData.courseId);
      const { data: holeData, error: holeError } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', gameData.courseId)
        .order('hole_number');
        
      console.log('Hole data result:', { holeData, holeError });
      
      if (holeData && holeData.length > 0) {
        // Filter holes based on numberOfHoles if specified
        const holesToUse = gameData.numberOfHoles 
          ? holeData.slice(0, gameData.numberOfHoles)
          : holeData;
        
        setHoles(holesToUse);
        
        // Calculate handicaps using engines with the filtered holes
        await calculateHandicapsWithEngines(holesToUse);
      } else {
        console.warn('No holes found for course:', gameData.courseId);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateHandicapsWithEngines = async (holeData: HoleInfo[]) => {
    try {
      // Convert players to engine format
      const enginePlayers: EnginePlayer[] = players.map(p => ({
        userId: p.userId,
        fullName: p.fullName,
        handicapIndex: p.handicapIndex,
        courseHandicap: p.courseHandicap,
        teeBoxId: p.teeBoxId
      }));
      
      // Create context for engine
      const context: HandicapContext = {
        courseId: gameData.courseId,
        teeBoxId: players[0]?.teeBoxId
      };
      
      // Determine handicap type
      let handicapType = gameData.handicapType;
      if (!handicapType) {
        handicapType = gameData.scoringMethod === 'match_play' ? 'match_play' : 'stroke_play';
      }
      
      // Calculate match handicaps using engine
      const matchResults = await MatchHandicapEngine.calculateMatchHandicap(
        enginePlayers,
        handicapType,
        context
      );
      setMatchHandicapResults(matchResults);
      
      // Convert holes to engine format
      const engineHoles: EngineHole[] = holeData.map(h => ({
        holeNumber: h.hole_number,
        par: h.par,
        strokeIndex: h.handicap_index
      }));
      
      // Calculate PMP using engine
      const pmpMap = await PMPEngine.calculatePMP(
        matchResults,
        engineHoles,
        handicapType,
        new Map() // No ghost game IDs for GameSummary
      );
      setPmpResults(pmpMap);
      
    } catch (error) {
      console.error('Error calculating handicaps with engines:', error);
      // Fall back to using the original data from PlayerConfiguration
    }
  };
  
  const getStrokesForHole = (userId: string, holeNumber: number): number => {
    const playerPMP = pmpResults.get(userId);
    if (!playerPMP || !playerPMP.length) {
      // Fallback to old method if PMP not available
      const player = players.find(p => p.userId === userId);
      if (!player) return 0;
      
      const hole = holes.find(h => h.hole_number === holeNumber);
      if (!hole) return 0;
      
      return getStrokesForHoleOld(player.matchHandicap, hole.handicap_index);
    }
    
    const holePMP = playerPMP.find(pmp => pmp.holeNumber === holeNumber);
    return holePMP ? holePMP.strokesReceived : 0;
  };
  
  const getStrokesForHoleOld = (playerMatchHandicap: number, holeHandicapIndex: number): number => {
    if (playerMatchHandicap <= 0) return 0;
    
    const fullRounds = Math.floor(playerMatchHandicap / 18);
    const remainingStrokes = playerMatchHandicap % 18;
    
    if (holeHandicapIndex <= remainingStrokes) {
      return fullRounds + 1;
    } else {
      return fullRounds;
    }
  };
  
  const getPlayerMatchHandicap = (userId: string): number => {
    // Try to get from engine results first
    const engineResult = matchHandicapResults.find(result => result.userId === userId);
    if (engineResult) {
      return engineResult.matchHandicap;
    }
    
    // Fallback to original data from PlayerConfiguration
    const player = players.find(p => p.userId === userId);
    return player ? player.matchHandicap : 0;
  };

  const handleRefreshRandomization = async () => {
    if (gameData?.handicapType !== 'random') return;
    
    setRefreshing(true);
    try {
      // Re-run the handicap calculation to get new random values
      await calculateHandicapsWithEngines(holes);
    } catch (error) {
      console.error('Error refreshing randomization:', error);
    } finally {
      setRefreshing(false);
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
      
      // Create the game with the configured players and engine-calculated handicaps
      const gameConfig: CreateGameData = {
        description: gameData.description || undefined,
        course_id: gameData.courseId,
        weather: gameData.weather as 'sunny' | 'partly_cloudy' | 'rainy' | 'windy',
        format: gameData.format,
        handicap_type: gameData.handicapType as 'none' | 'match_play' | 'stroke_play' | 'random' | undefined,
        scoring_method: gameData.scoringMethod as 'stroke_play' | 'match_play' | 'stableford' | 'skins' | undefined,
        num_holes: gameData.numberOfHoles,
        participants: players.map(p => ({
          user_id: p.userId,
          full_name: p.fullName,
          handicap_index: p.handicapIndex,
          tee_box_id: p.teeBoxId
        }))
      };
      
      // Use new engine-aware game creation method
      const game = await gameService.createGameWithEngines(
        gameConfig, 
        matchHandicapResults, 
        pmpResults,
        holes
      );
      
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
  
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/game/configure-players" />
          </IonButtons>
          <IonTitle>Game Summary</IonTitle>
          {gameData?.handicapType === 'random' && (
            <IonButtons slot="end">
              <IonButton 
                onClick={handleRefreshRandomization}
                disabled={refreshing}
              >
                {refreshing ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <IonIcon icon={refresh} />
                )}
              </IonButton>
            </IonButtons>
          )}
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
                <IonNote>Game Type</IonNote>
                <IonLabel style={{ display: 'block', fontWeight: 'bold' }}>
                  {gameData.handicapType === 'match_play' ? 'Match Play' : 
                   gameData.handicapType === 'stroke_play' ? 'Stroke Play' :
                   gameData.handicapType === 'random' ? 'Lucky Draw' :
                   gameData.handicapType === 'ghost' ? 'Ghost Mode' :
                   gameData.handicapType === 'none' ? 'Scratch Golf' :
                   'Match Play'}
                </IonLabel>
              </div>
              <div>
                <IonNote>Scoring</IonNote>
                <IonLabel style={{ display: 'block', fontWeight: 'bold' }}>
                  {gameData.scoringMethod === 'match_play' ? 'Match Play' :
                   gameData.scoringMethod === 'stroke_play' ? 'Stroke Play' :
                   gameData.scoringMethod === 'stableford' ? 'Stableford' :
                   gameData.scoringMethod === 'skins' ? 'Skins' :
                   'Stroke Play'}
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
              
              // Find best (lowest match HC) and worst (highest match HC) players using engine results
              const currentPlayerMatchHC = getPlayerMatchHandicap(player.userId);
              const allMatchHCs = players.map(p => getPlayerMatchHandicap(p.userId));
              const lowestMatchHC = Math.min(...allMatchHCs);
              const highestMatchHC = Math.max(...allMatchHCs);
              
              // Determine background color
              let backgroundColor = 'transparent';
              if (currentPlayerMatchHC === lowestMatchHC) {
                backgroundColor = 'rgb(45 212 191 / 18%)'; // Light turquoise/teal
              } else if (currentPlayerMatchHC === highestMatchHC) {
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
                        color: currentPlayerMatchHC === 0 ? 'var(--ion-color-success)' : 'var(--ion-color-primary)'
                      }}>
                        {currentPlayerMatchHC}
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
        
        {/* Stroke Distribution Table - Show for all games except scratch */}
        {console.log('Show hole table?', {
          handicapType: gameData.handicapType,
          scoringMethod: gameData.scoringMethod, 
          holesLength: holes.length,
          shouldShow: (gameData.handicapType !== 'none' || gameData.scoringMethod === 'match_play') && holes.length > 0
        })}
        {(gameData.handicapType !== 'none' || gameData.scoringMethod === 'match_play') && holes.length > 0 && (
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
            
            {/* Front Nine - only show if we have holes */}
            {holes.slice(0, 9).length > 0 && (
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
                <IonCardTitle style={{ fontSize: '14px' }}>
                  {holes.length <= 9 ? `Holes 1-${holes.length}` : 'Front Nine'}
                </IonCardTitle>
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
                          <span style={{ fontSize: '11px', color: 'var(--ion-color-medium)' }}>
                            {hole.handicap_index}
                          </span>
                        </td>
                        {players.map(player => {
                          const strokes = getStrokesForHole(player.userId, hole.hole_number);
                          return (
                            <td 
                              key={player.userId}
                              style={{ 
                                padding: '8px 4px', 
                                textAlign: 'center',
                                backgroundColor: strokes > 0 
                                  ? strokes === 1 
                                    ? 'rgba(255, 69, 0, 0.15)' // Light orange-red for +1
                                    : strokes === 2
                                    ? 'rgba(220, 20, 60, 0.15)' // Light crimson for +2
                                    : 'rgba(139, 0, 0, 0.15)' // Light maroon for +3
                                  : 'transparent',
                                fontWeight: strokes > 0 ? 'bold' : 'normal',
                                fontSize: strokes > 0 ? '13px' : '12px',
                                color: strokes > 0 
                                  ? strokes === 1 
                                    ? 'rgba(255, 69, 0, 1)' // Orange-red text
                                    : strokes === 2
                                    ? 'rgba(220, 20, 60, 1)' // Crimson text
                                    : 'rgba(139, 0, 0, 1)' // Maroon text
                                  : 'inherit'
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
                          sum + getStrokesForHole(player.userId, hole.hole_number), 0
                        );
                        return (
                          <td key={player.userId} style={{ 
                            padding: '8px 4px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '13px'
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
            )}
            
            {/* Back Nine - only show if we have more than 9 holes */}
            {holes.slice(9, 18).length > 0 && (
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
                          <span style={{ fontSize: '11px', color: 'var(--ion-color-medium)' }}>
                            {hole.handicap_index}
                          </span>
                        </td>
                        {players.map(player => {
                          const strokes = getStrokesForHole(player.userId, hole.hole_number);
                          return (
                            <td 
                              key={player.userId}
                              style={{ 
                                padding: '8px 4px', 
                                textAlign: 'center',
                                backgroundColor: strokes > 0 
                                  ? strokes === 1 
                                    ? 'rgba(255, 69, 0, 0.15)' // Light orange-red for +1
                                    : strokes === 2
                                    ? 'rgba(220, 20, 60, 0.15)' // Light crimson for +2
                                    : 'rgba(139, 0, 0, 0.15)' // Light maroon for +3
                                  : 'transparent',
                                fontWeight: strokes > 0 ? 'bold' : 'normal',
                                fontSize: strokes > 0 ? '13px' : '12px',
                                color: strokes > 0 
                                  ? strokes === 1 
                                    ? 'rgba(255, 69, 0, 1)' // Orange-red text
                                    : strokes === 2
                                    ? 'rgba(220, 20, 60, 1)' // Crimson text
                                    : 'rgba(139, 0, 0, 1)' // Maroon text
                                  : 'inherit'
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
                          sum + getStrokesForHole(player.userId, hole.hole_number), 0
                        );
                        return (
                          <td key={player.userId} style={{ 
                            padding: '8px 4px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '13px'
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
                          sum + getStrokesForHole(player.userId, hole.hole_number), 0
                        );
                        return (
                          <td key={player.userId} style={{ 
                            padding: '8px 4px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px',
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
            )}
            
            {/* Legend */}
            <div style={{ padding: '16px', marginBottom: '80px' }}>
              <IonNote style={{ display: 'flex', gap: '16px', fontSize: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'rgba(255, 69, 0, 0.15)',
                    border: '1px solid rgba(255, 69, 0, 0.3)',
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
                    backgroundColor: 'rgba(220, 20, 60, 0.15)',
                    border: '1px solid rgba(220, 20, 60, 0.3)',
                    marginRight: '4px',
                    verticalAlign: 'middle'
                  }}></span>
                  +2 strokes
                </span>
                <span>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'rgba(139, 0, 0, 0.15)',
                    border: '1px solid rgba(139, 0, 0, 0.3)',
                    marginRight: '4px',
                    verticalAlign: 'middle'
                  }}></span>
                  +3 strokes
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
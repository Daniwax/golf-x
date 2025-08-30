import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonNote,
  IonButton,
  IonRippleEffect
} from '@ionic/react';
import { 
  trophyOutline, 
  flagOutline, 
  calendarOutline,
  locationOutline,
  peopleOutline,
  golfOutline,
  medalOutline,
  starOutline,
  chevronForwardOutline,
  sparklesOutline,
  ribbonOutline,
  playOutline,
  eyeOutline,
  timeOutline
} from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { dataService } from '../services/data/DataService';
import { useHistory } from 'react-router-dom';
import { useCourseList } from '../hooks/useCourses';
import { ScoringEngine, type ScoringMethod, type Scorecard as EngineScorecard, type LeaderboardResult } from '../features/normal-game/engines/ScoringEngine';
import '../styles/championship.css';
import '../styles/golf_style.css';

interface GameHistory {
  id: string; // UUID, not number!
  name: string;
  date: string;
  courseName: string;
  teeBox: string;
  status: string;
  totalStrokes?: number;
  netScore?: number;
  numHoles: number;
  gameType: string;
  participants: number;
  course_id?: string;
  leaderboard?: LeaderboardResult;
  winner?: string;
  winnerScore?: number | string;
  scoringType?: 'Gross' | 'Net'; // Add scoring type
  userPosition?: number; // Player's position in the game
  userScore?: number | string; // Player's score/points
  scoringMethod?: string; // Add scoring method field
}

const MatchHistory: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'completed'>('all');
  
  // Get course images from useCourseList
  const { courseImages } = useCourseList();

  useEffect(() => {
    if (user?.id) {
      loadGames();
    }
  }, [user]);

  const loadGames = async () => {
    if (!user?.id) {
      console.error('[MatchHistory] No user ID found');
      return;
    }
    
    setLoading(true);
    try {
      // Get completed games only
      const completedGames = await dataService.games.getUserGameHistory(user.id, 50);
      
      // Format completed games and calculate leaderboards
      if (!completedGames || completedGames.length === 0) {
        setGames([]);
        setLoading(false);
        return;
      }
      
      const formattedCompleted: GameHistory[] = await Promise.all(
        completedGames.map(async (game: any) => {
          let leaderboard: LeaderboardResult | undefined;
          let winner = '';
          let winnerScore: number | string = '';
          let userPosition: number | undefined;
          let userScore: number | string | undefined;
          let scoringType: 'Gross' | 'Net' = 'Gross';
          
          
          try {
            // Load participants and scores for each game
            const participants = await dataService.games.getGameParticipants(game.id);
            const holeScores = await dataService.games.getGameHoleScores(game.id);
            
            
            if (participants.length > 0 && holeScores.length > 0) {
              // Get course holes for stroke index
              const holes = await dataService.courses.getCourseHoles(game.courseId);
              
              // Build scorecards for ScoringEngine
              const engineScorecards: EngineScorecard[] = participants.map((participant: any) => {
                const playerScores = holeScores.filter((hs: any) => hs.user_id === participant.user_id);
                // Only include holes up to the game's num_holes limit
                const gameHoleCount = game.numHoles || 18;
                const playerHoles = holes
                  .filter((hole: any) => hole.hole_number <= gameHoleCount)
                  .map((hole: any) => {
                    const score = playerScores.find((ps: any) => ps.hole_number === hole.hole_number);
                    return {
                      holeNumber: hole.hole_number,
                      par: hole.par,
                      strokes: score?.strokes || 0,
                      putts: score?.putts || 0,
                      strokeIndex: hole.stroke_index || hole.hole_number
                    };
                  });
                
                return {
                  gameId: game.id,
                  userId: participant.user_id,
                  playerName: participant.display_name || 'Player',
                  holes: playerHoles,
                  totalStrokes: playerHoles.reduce((sum: number, h: any) => sum + h.strokes, 0),
                  totalPutts: playerHoles.reduce((sum: number, h: any) => sum + h.putts, 0),
                  courseHandicap: participant.course_handicap || 0,
                  playingHandicap: participant.playing_handicap || 0
                };
              });
              
              // Debug: Check what we're getting from database
              console.log(`📊 DB values for ${game.id}:`, {
                handicap_type: game.handicap_type,
                scoring_method: game.scoring_method,
                numHoles: game.numHoles,
                scoringFormat: game.scoringFormat // old field
              });
              
              // Calculate leaderboard using the game's scoring method
              const scoringMethod = (game.scoring_method || 'stroke_play') as ScoringMethod;
              const includeHandicap = participants.some((p: any) => p.handicap_index > 0);
              scoringType = includeHandicap ? 'Net' : 'Gross';
              
              console.log(`🔧 Scoring params for ${game.id}:`, {
                method: scoringMethod,
                includeHandicap,
                playersCount: engineScorecards.length,
                gameHoles: game.numHoles || 18,
                actualHolesUsed: engineScorecards[0]?.holes?.length || 0
              });
              
              console.log(`🚀 Calling ScoringEngine for ${game.id}:`, {
                scoringMethod,
                includeHandicap,
                numPlayers: engineScorecards.length,
                engineScorecards: engineScorecards.map(scorecard => ({
                  gameId: scorecard.gameId,
                  userId: scorecard.userId,
                  playerName: scorecard.playerName,
                  totalStrokes: scorecard.totalStrokes,
                  totalPutts: scorecard.totalPutts,
                  courseHandicap: scorecard.courseHandicap,
                  playingHandicap: scorecard.playingHandicap,
                  holesCount: scorecard.holes.length,
                  firstFewHoles: scorecard.holes.slice(0, 3).map(h => ({
                    holeNumber: h.holeNumber,
                    par: h.par,
                    strokes: h.strokes,
                    putts: h.putts,
                    strokeIndex: h.strokeIndex
                  }))
                }))
              });
              
              leaderboard = ScoringEngine.calculateLeaderboard(
                engineScorecards,
                scoringMethod,
                includeHandicap
              );
              
              console.log(`⚡ Engine Results for ${game.id}:`, {
                totalEntries: leaderboard?.entries?.length || 0,
                allEntries: leaderboard?.entries?.map(entry => ({
                  position: entry.position,
                  playerId: entry.playerId,
                  playerName: entry.playerName,
                  score: entry.score,
                  details: entry.details
                })) || [],
                scoringMetadata: leaderboard?.metadata || {}
              });
              
              // Get winner info and user's position
              if (leaderboard && leaderboard.entries.length > 0) {
                const topEntry = leaderboard.entries[0];
                
                
                winner = topEntry.playerName;
                
                // Find user's position and score
                const userEntry = leaderboard.entries.find(entry => entry.playerId === user.id);
                console.log(`👤 User lookup for ${game.id}:`, {
                  userId: user.id,
                  userEntryFound: !!userEntry,
                  userEntry: userEntry ? {
                    position: userEntry.position,
                    playerId: userEntry.playerId,
                    playerName: userEntry.playerName,
                    score: userEntry.score,
                    details: userEntry.details
                  } : null
                });
                
                if (userEntry) {
                  userPosition = userEntry.position;
                  
                  // Extract user's score based on game type
                  switch (scoringMethod) {
                    case 'stroke_play':
                      userScore = userEntry.details?.scoreVsPar || 'E';
                      break;
                    case 'match_play':
                      if (participants.length === 2 && userEntry.details?.matchStatus) {
                        userScore = userEntry.details.matchStatus;
                      } else {
                        userScore = userEntry.details?.totalPoints || userEntry.score;
                      }
                      break;
                    case 'stableford':
                      userScore = userEntry.details?.totalPoints || userEntry.score;
                      break;
                    case 'skins':
                      userScore = userEntry.details?.skinsWon || userEntry.score;
                      break;
                    default:
                      userScore = userEntry.score;
                  }
                }
                
                // Extract the appropriate score/status based on game type - following CompletedLeaderboard logic
                switch (scoringMethod) {
                  case 'stroke_play':
                    // For stroke play, show the score vs par (not the total strokes)
                    winnerScore = topEntry.details?.scoreVsPar || 'E';
                    break;
                    
                  case 'match_play':
                    // For match play, show total points or match status
                    if (participants.length === 2 && topEntry.details?.matchStatus) {
                      winnerScore = topEntry.details.matchStatus;
                    } else {
                      winnerScore = topEntry.details?.totalPoints || topEntry.score;
                    }
                    break;
                    
                  case 'stableford':
                    // For stableford, show total points
                    winnerScore = topEntry.details?.totalPoints || topEntry.score;
                    break;
                    
                  case 'skins':
                    // For skins, show skins won
                    winnerScore = topEntry.details?.skinsWon || topEntry.score;
                    break;
                    
                  default:
                    winnerScore = topEntry.score;
                }
              }
            }
          } catch (err) {
            console.error(`Error calculating leaderboard for game ${game.id}:`, err);
          }
          
          console.log(`🎯 FIXED Game ${game.id}: userPos=${userPosition}, userScore=${userScore}`);
          
          return {
            id: game.id || `completed-${Date.now()}-${Math.random()}`,
            name: game.gameDescription || `Round at ${game.courseName}`,
            date: game.completedAt ? new Date(game.completedAt).toLocaleDateString() : 'Unknown date',
            courseName: game.courseName || 'Championship Course',
            teeBox: 'Championship Tees',
            status: 'completed',
            totalStrokes: game.totalStrokes,
            netScore: game.netScore,
            numHoles: game.numHoles || 18,
            gameType: game.handicap_type || 'none',
            scoringMethod: game.scoring_method || 'stroke_play',
            participants: game.totalPlayers || 1,
            course_id: game.courseId,
            leaderboard,
            winner,
            winnerScore,
            scoringType,
            userPosition,
            userScore
          };
        })
      );
      
      // Sort by date (most recent first)
      formattedCompleted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setGames(formattedCompleted);
    } catch (error) {
      console.error('[MatchHistory] Error loading games:', error);
      // Try to load games without scoring engine calculation as fallback
      try {
        const completedGames = await dataService.games.getUserGameHistory(user.id, 50);
        const simpleGames = completedGames.map((game: any) => ({
          id: game.id || `completed-${Date.now()}-${Math.random()}`,
          name: game.gameDescription || `Round at ${game.courseName}`,
          date: game.completedAt ? new Date(game.completedAt).toLocaleDateString() : 'Unknown date',
          courseName: game.courseName || 'Championship Course',
          teeBox: 'Championship Tees',
          status: 'completed',
          totalStrokes: game.totalStrokes,
          netScore: game.netScore,
          numHoles: 18,
          gameType: game.handicap_type || 'none',
          scoringMethod: game.scoring_method || 'stroke_play',
          participants: game.totalPlayers || 1,
          course_id: game.courseId
        }));
        console.log('[MatchHistory] Fallback: Loading simple games without scoring details');
        setGames(simpleGames);
      } catch (fallbackError) {
        console.error('[MatchHistory] Fallback also failed:', fallbackError);
        setGames([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    if (selectedSegment === 'all') return true;
    if (selectedSegment === 'completed') return game.status === 'completed';
    return true;
  });

  // Helper function to get handicap type label (this is the actual "Game Format")
  const getGameTypeLabel = (handicapType: string) => {
    // HandicapType values from types/index.ts: 'none' | 'match_play' | 'stroke_play' | 'random' | 'ghost'
    const types: Record<string, string> = {
      'none': 'Scratch Play',
      'match_play': 'Match Play', 
      'stroke_play': 'Stroke Play',
      'random': 'Lucky Draw',
      'ghost': 'Ghost Player'
    };
    return types[handicapType] || handicapType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Helper function to get scoring method label (this is the actual "Scoring Method")
  const getScoringTypeLabel = (scoringMethod: string) => {
    // ScoringMethod values from types/index.ts: 'stroke_play' | 'match_play' | 'stableford' | 'skins'
    const types: Record<string, string> = {
      'stroke_play': 'Stroke Play',
      'match_play': 'Match Play',
      'stableford': 'Stableford',
      'skins': 'Skins Game'
    };
    return types[scoringMethod] || scoringMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getScoringLabel = (game: GameHistory) => {
    if (!game.leaderboard || !game.winnerScore) return '';
    
    // Get the actual score value and format based on game type
    const score = game.winnerScore;
    
    switch (game.gameType) {
      case 'stroke_play':
        // For stroke play, winnerScore is already the vs par value (like "-2" or "+3" or "E")
        // Just return it as is since it's the important metric
        return score.toString();
        
      case 'match_play':
        // Match play shows different formats based on player count
        if (game.participants === 2) {
          // Head-to-head shows match result like "Won 3&2" or "2 up"
          return typeof score === 'string' ? score : `${score} points`;
        } else {
          // Multi-player shows points from round-robin
          return `${score} points`;
        }
        
      case 'stableford':
        // Stableford uses points (higher is better)
        return `${score} points`;
        
      case 'skins':
        // Skins shows number of skins won
        return `${score} skins`;
        
      default:
        // Default to stroke play format
        return score?.toString() || '';
    }
  };

  const getUserScoringLabel = (game: GameHistory) => {
    if (!game.userScore) return '';
    
    // Get the actual score value and format based on scoring method (not game type)
    const score = game.userScore;
    
    switch (game.scoringMethod) {
      case 'stroke_play':
        return score.toString();
      case 'match_play':
        if (game.participants === 2) {
          return typeof score === 'string' ? score : `${score} pts`;
        } else {
          return `${score} pts`;
        }
      case 'stableford':
        return `${score} pts`;
      case 'skins':
        return `${score} skins`;
      default:
        return score?.toString() || '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--champ-green-dark)';
      case 'in_progress':
        return 'var(--champ-gold)';
      default:
        return 'var(--champ-gray)';
    }
  };

  const getTotalDiff = (totalStrokes: number | undefined) => {
    if (!totalStrokes) return null;
    const diff = totalStrokes - 72; // Assuming par 72
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const processImageData = (imageData: string | undefined, mimeType: string | undefined) => {
    if (!imageData) return '/assets/golf-course-placeholder.jpg';
    
    try {
      if (imageData.startsWith('\\x')) {
        // Hex-encoded bytea from PostgreSQL
        const hexString = imageData.slice(2);
        const hexMatches = hexString.match(/.{1,2}/g);
        if (hexMatches && hexMatches.length < 500000) {
          const bytes = new Uint8Array(hexMatches.map((byte: string) => parseInt(byte, 16)));
          let binaryString = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.slice(i, i + chunkSize);
            binaryString += String.fromCharCode(...chunk);
          }
          const base64String = btoa(binaryString);
          return `data:${mimeType || 'image/jpeg'};base64,${base64String}`;
        }
      } else {
        // Assume it's already base64
        return imageData.startsWith('data:') ? imageData : `data:${mimeType || 'image/jpeg'};base64,${imageData}`;
      }
      
      return '/assets/golf-course-placeholder.jpg';
    } catch (error) {
      console.error('Error processing image data:', error);
      return '/assets/golf-course-placeholder.jpg';
    }
  };

  const getCourseImage = (courseId?: string) => {
    if (!courseId) return null;
    return courseImages.find(img => 
      img.course_id === courseId && img.image_type === 'default'
    );
  };

  const handleGameClick = (game: GameHistory) => {
    if (game.status === 'completed') {
      history.push(`/game/view/${game.id}`);
    } else {
      history.push(`/game/live/${game.id}`);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border" style={{ '--background': 'transparent' }}>
          <IonToolbar style={{
            '--background': 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
            '--color': 'var(--champ-cream)'
          }}>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/profile" />
            </IonButtons>
            <IonTitle>Loading History...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            background: 'var(--champ-pearl)'
          }}>
            <IonSpinner name="crescent" style={{ fontSize: '32px', color: 'var(--champ-gold)' }} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="golf-letter-container">
      <IonHeader className="ion-no-border">
        <IonToolbar style={{
          '--background': 'var(--golf-green)',
          '--color': 'var(--golf-cream)',
          '--padding-top': '8px',
          '--padding-bottom': '8px',
          '--min-height': '56px'
        }}>
          
          
          <IonButtons slot="start" style={{ position: 'relative', zIndex: 1 }}>
            <IonButton 
              fill="clear" 
              onClick={() => history.goBack()}
              style={{
                '--color': 'var(--champ-cream)',
                '--color-activated': 'var(--champ-gold)',
                margin: '0 8px'
              }}
            >
              <IonIcon 
                icon={chevronForwardOutline} 
                style={{ 
                  fontSize: '24px',
                  transform: 'rotate(180deg)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} 
              />
            </IonButton>
          </IonButtons>
          
          <IonTitle>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px'
            }}>
              <IonIcon 
                icon={trophyOutline} 
                style={{ 
                  fontSize: '20px', 
                  color: 'var(--golf-gold)'
                }} 
              />
              <span className="golf-font-serif" style={{
                fontSize: '16px',
                color: 'var(--golf-cream)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Match History
              </span>
              <IonIcon 
                icon={trophyOutline} 
                style={{ 
                  fontSize: '20px', 
                  color: 'var(--golf-gold)'
                }} 
              />
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': 'var(--golf-cream)' }}>
        {/* Filter Tabs */}
        <div style={{ 
          padding: '16px',
          background: 'var(--golf-white)',
          borderBottom: '1px solid var(--golf-tan-border)'
        }}>
          <IonSegment 
            value={selectedSegment} 
            onIonChange={e => setSelectedSegment(e.detail.value as 'all' | 'completed')}
            style={{
              '--background': 'var(--golf-cream)',
              borderRadius: '8px',
              padding: '4px',
              border: '1px solid var(--golf-tan-border)'
            }}
          >
            <IonSegmentButton value="all" style={{
              '--color-checked': 'var(--golf-cream)',
              '--background-checked': 'var(--golf-green)',
              '--indicator-color': 'transparent',
              borderRadius: '4px'
            }}>
              <IonLabel className="golf-font-serif golf-text-small">
                All Games
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed" style={{
              '--color-checked': 'var(--golf-cream)',
              '--background-checked': 'var(--golf-green)',
              '--indicator-color': 'transparent',
              borderRadius: '4px'
            }}>
              <IonLabel className="golf-font-serif golf-text-small">
                Completed
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Championship Game Cards */}
        <div style={{ padding: '0', margin: '0' }}>
          {filteredGames.length === 0 ? (
            <div className="golf-letter-card" style={{ margin: '20px', textAlign: 'center' }}>
              <IonIcon 
                icon={trophyOutline} 
                style={{ 
                  fontSize: '48px', 
                  color: 'var(--golf-brown)',
                  marginBottom: '16px' 
                }} 
              />
              <h3 className="golf-letter-heading">
                No Matches Found
              </h3>
              <p className="golf-text-detail">
                Start playing to build your golf history
              </p>
            </div>
          ) : (
            filteredGames.map((game, index) => {
              const courseImage = getCourseImage(game.course_id);
              const totalDiff = getTotalDiff(game.totalStrokes);
              
              return (
                <div 
                  key={game.id} 
                  className="ion-activatable golf-card"
                  onClick={() => handleGameClick(game)}
                  style={{
                    margin: '0',
                    cursor: 'pointer',
                    borderRadius: '0',
                    borderBottom: '1px solid var(--golf-tan-border)'
                  }}
                >
                  <IonRippleEffect />
                  
                  {/* Course Image */}
                  <div style={{
                    position: 'relative',
                    height: '140px',
                    background: courseImage 
                      ? 'transparent' 
                      : 'linear-gradient(135deg, var(--golf-green) 0%, var(--golf-green-light) 100%)',
                    overflow: 'hidden',
                    borderRadius: '0',
                    margin: '0',
                    padding: '0'
                  }}>
                    {courseImage && (
                      <img
                        src={processImageData(courseImage.image_data, courseImage.mime_type)}
                        alt={game.courseName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '0',
                          display: 'block'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/golf-course-placeholder.jpg';
                        }}
                      />
                    )}
                    
                    {/* Status Badge */}
                    <div className="golf-badge" style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: game.status === 'in_progress' ? 'var(--golf-gold)' : 'var(--golf-green)'
                    }}>
                      {game.status === 'in_progress' ? 'LIVE' : 'COMPLETE'}
                    </div>
                  </div>

                  {/* Game Details Section */}
                  <div style={{ padding: '12px 16px' }}>
                    {/* Course Name */}
                    <h2 className="golf-letter-heading" style={{ marginBottom: '8px', fontSize: '16px' }}>
                      {game.courseName}
                    </h2>
                    
                    {/* Game Info Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ textAlign: 'left' }}>
                        <span className="golf-text-small">Game Format</span>
                        <div className="golf-text-detail" style={{ fontWeight: '600', color: 'var(--golf-green)' }}>
                          {getGameTypeLabel(game.gameType)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="golf-text-small">Scoring Method</span>
                        <div className="golf-text-detail" style={{ fontWeight: '600', color: 'var(--golf-green)' }}>
                          {getScoringTypeLabel(game.scoringMethod || 'stroke_play')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Players count row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--golf-tan-border)'
                    }}>
                      <span className="golf-text-small">
                        {game.participants} {game.participants === 1 ? 'Player' : 'Players'}
                      </span>
                      <span className="golf-text-small">
                        {game.numHoles} Holes
                      </span>
                    </div>

                    {/* Date and Scoring */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginBottom: '4px'
                        }}>
                          <IonIcon 
                            icon={calendarOutline} 
                            style={{ 
                              fontSize: '12px', 
                              color: 'var(--golf-brown)' 
                            }} 
                          />
                          <span className="golf-date">
                            {game.date}
                          </span>
                        </div>
                        <div className="golf-text-small" style={{ color: 'var(--golf-brown)' }}>
                          {game.teeBox}
                        </div>
                      </div>

                      {/* Score Display - Show user's score/position format */}
                      {game.userPosition && game.userScore && (
                        <div className="golf-score-block">
                          <div className="golf-score-label">Your Result</div>
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'center',
                            gap: '2px'
                          }}>
                            <div className="golf-score-gross" style={{ 
                              fontSize: '16px',
                              color: game.userPosition === 1 ? 'var(--golf-gold)' : 'var(--golf-green)',
                              lineHeight: '1'
                            }}>
                              {getUserScoringLabel(game)}
                            </div>
                            <div style={{
                              fontSize: '10px',
                              color: 'black',
                              fontWeight: '500',
                              lineHeight: '1'
                            }}>
                              /{game.userPosition === 1 ? '🏆' : game.userPosition}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fallback to old scoring if no leaderboard data */}
                      {(!game.userPosition && game.totalStrokes) && (
                        <div className="golf-score-block">
                          <div className="golf-score-label">Your Score</div>
                          <div className="golf-score-gross">
                            {game.totalStrokes}
                          </div>
                          {totalDiff && (
                            <div className="golf-text-small" style={{
                              color: totalDiff === 'E' ? 'var(--golf-green)' :
                                     totalDiff.startsWith('+') ? 'var(--golf-brown)' :
                                     'var(--golf-gold)',
                              marginTop: '2px'
                            }}>
                              {totalDiff}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Padding for Navigation */}
        <div style={{ height: '60px' }} />
      </IonContent>
    </IonPage>
  );
};

export default MatchHistory;
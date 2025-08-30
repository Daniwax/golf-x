import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonButton,
  IonRippleEffect
} from '@ionic/react';
import { 
  trophyOutline, 
  calendarOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { dataService } from '../services/data/DataService';
import { useHistory } from 'react-router-dom';
import { useCourseList } from '../hooks/useCourses';
import { ScoringEngine, type ScoringMethod, type Scorecard as EngineScorecard, type LeaderboardResult } from '../features/normal-game/engines/ScoringEngine';
import type { GameHoleScore } from '../services/data/types';
import '../styles/championship.css';
import '../styles/golf_style.css';

// Database response types (what we actually get from the API)
interface DbGameParticipant {
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    handicap: number | null;
  } | null;
  id: string;
  game_id: string;
  user_id: string;
  tee_box_id: string | null;
  handicap_index: number | null;
  course_handicap: number | null;
  playing_handicap: number | null;
  total_strokes: number | null;
  total_putts: number | null;
  final_position: number | null;
  front_nine_strokes: number | null;
  back_nine_strokes: number | null;
  display_name?: string;
}

interface DbHole {
  id: string;
  course_id: string | number;
  hole_number: number;
  hole_name: string | null;
  par: number;
  handicap_index: number;
  has_water: boolean;
  has_bunkers: boolean;
  dogleg_direction: string | null;
  notes: string | null;
  signature_hole: boolean;
  created_at: string;
  updated_at: string;
  hole_distances: Array<{ tee_box_id: string; distance: number; unit: string }>;
  stroke_index?: number;
}

interface DbGameResponse {
  id: string;
  courseId: number;
  numHoles?: number;
  scoringMethod?: string;
  handicapType?: string;
  courseName?: string;
  gameDescription?: string | null;
  completedAt?: string | null;
  totalStrokes?: number | null;
  netScore?: number | null;
  totalPlayers?: number;
  handicap_type?: string;
  scoring_method?: string;
  scoringFormat?: string;
}

// Leaderboard entry details types
interface StrokePlayDetails {
  scoreVsPar: string | number;
  totalStrokes: number;
}

interface MatchPlayDetails {
  matchStatus?: string;
  totalPoints: number;
}

interface StablefordDetails {
  totalPoints: number;
}

interface SkinsDetails {
  skinsWon: number;
}

type LeaderboardEntryDetails = StrokePlayDetails | MatchPlayDetails | StablefordDetails | SkinsDetails | Record<string, unknown>;

// Type guard functions for safe detail access
function isStrokePlayDetails(details: LeaderboardEntryDetails): details is StrokePlayDetails {
  return typeof details === 'object' && details !== null && 'scoreVsPar' in details;
}

function isMatchPlayDetails(details: LeaderboardEntryDetails): details is MatchPlayDetails {
  return typeof details === 'object' && details !== null && ('matchStatus' in details || 'totalPoints' in details);
}

function isStablefordDetails(details: LeaderboardEntryDetails): details is StablefordDetails {
  return typeof details === 'object' && details !== null && 'totalPoints' in details;
}

function isSkinsDetails(details: LeaderboardEntryDetails): details is SkinsDetails {
  return typeof details === 'object' && details !== null && 'skinsWon' in details;
}

interface GameHistory {
  id: string; // UUID, not number!
  name: string;
  date: string;
  courseName: string;
  teeBox: string;
  status: string;
  totalStrokes?: number | null;
  netScore?: number | null;
  numHoles: number;
  gameType: string;
  participants: number;
  course_id?: string | number;
  leaderboard?: LeaderboardResult;
  winner?: string;
  winnerScore?: number | string;
  scoringType?: 'Gross' | 'Net'; // Add scoring type
  userPosition?: number; // Player's position in the game
  userScore?: number | string; // Player's score/points
  scoringMethod?: string; // Add scoring method field
}

// Cache for match history
const matchHistoryCache = new Map<string, { data: GameHistory[]; timestamp: number; hasMore: boolean }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 5; // Load 5 games at a time

const MatchHistory: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'completed'>('all');
  
  // Get course images from useCourseList
  const { courseImages } = useCourseList();

  useEffect(() => {
    if (user?.id) {
      loadInitialGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadInitialGames = async () => {
    if (!user?.id) return;
    
    // Check cache first
    const cacheKey = `${user.id}_page_0`;
    const cached = matchHistoryCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      setGames(cached.data);
      setHasMore(cached.hasMore);
      setLoading(false);
      return;
    }
    
    // Load fresh data
    await loadGames(0, true);
  };

  const loadGames = async (page = 0, isInitial = false) => {
    if (!user?.id) {
      console.error('[MatchHistory] No user ID found');
      return;
    }
    
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // Get paginated games - offset by page * PAGE_SIZE
      const offset = page * PAGE_SIZE;
      const completedGames = await dataService.games.getUserGameHistory(user.id, PAGE_SIZE + 1, offset);
      
      // Check if we have more games than requested (indicates more pages available)
      const hasMoreGames = completedGames && completedGames.length > PAGE_SIZE;
      const gamesToProcess = hasMoreGames ? completedGames.slice(0, PAGE_SIZE) : completedGames;
      
      if (!gamesToProcess || gamesToProcess.length === 0) {
        if (isInitial) {
          setGames([]);
          setHasMore(false);
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      const formattedCompleted: GameHistory[] = await Promise.all(
        (gamesToProcess as unknown as DbGameResponse[]).map(async (game: DbGameResponse) => {
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
              const engineScorecards: EngineScorecard[] = (participants as unknown as DbGameParticipant[]).map((participant: DbGameParticipant) => {
                const playerScores = holeScores.filter((hs: GameHoleScore) => hs.user_id === participant.user_id);
                // Only include holes up to the game's num_holes limit
                const gameHoleCount = game.numHoles || 18;
                const playerHoles = (holes as unknown as DbHole[])
                  .filter((hole: DbHole) => hole.hole_number <= gameHoleCount)
                  .map((hole: DbHole) => {
                    const score = playerScores.find((ps: GameHoleScore) => ps.hole_number === hole.hole_number);
                    return {
                      holeNumber: hole.hole_number,
                      par: hole.par,
                      strokes: score?.strokes || 0,
                      putts: score?.putts || 0,
                      strokeIndex: hole.stroke_index || hole.handicap_index || hole.hole_number
                    };
                  });
                
                return {
                  gameId: game.id,
                  userId: participant.user_id,
                  playerName: participant.profiles?.full_name || participant.display_name || 'Player',
                  holes: playerHoles,
                  totalStrokes: playerHoles.reduce((sum: number, h: { strokes: number }) => sum + h.strokes, 0),
                  totalPutts: playerHoles.reduce((sum: number, h: { putts: number }) => sum + h.putts, 0),
                  courseHandicap: participant.course_handicap || 0,
                  playingHandicap: participant.playing_handicap || 0
                };
              });
              
              
              // Calculate leaderboard using the game's scoring method
              const scoringMethod = (game.scoringMethod || 'stroke_play') as ScoringMethod;
              const includeHandicap = (participants as unknown as DbGameParticipant[]).some((p: DbGameParticipant) => p.handicap_index && p.handicap_index > 0);
              scoringType = includeHandicap ? 'Net' : 'Gross';
              
              
              
              leaderboard = ScoringEngine.calculateLeaderboard(
                engineScorecards,
                scoringMethod,
                includeHandicap
              );
              
              
              // Get winner info and user's position
              if (leaderboard && leaderboard.entries.length > 0) {
                const topEntry = leaderboard.entries[0];
                
                
                winner = topEntry.playerName;
                
                // Find user's position and score
                const userEntry = leaderboard.entries.find(entry => entry.playerId === user.id);
                
                if (userEntry) {
                  userPosition = userEntry.position;
                  
                  // Extract user's score based on game type
                  switch (scoringMethod) {
                    case 'stroke_play':
                      if (userEntry.details && isStrokePlayDetails(userEntry.details)) {
                        userScore = userEntry.details.scoreVsPar || 'E';
                      } else {
                        userScore = 'E';
                      }
                      break;
                    case 'match_play':
                      if ((participants as unknown as DbGameParticipant[]).length === 2 && userEntry.details && isMatchPlayDetails(userEntry.details) && 'matchStatus' in userEntry.details) {
                        userScore = userEntry.details.matchStatus || userEntry.score;
                      } else if (userEntry.details && isMatchPlayDetails(userEntry.details)) {
                        userScore = userEntry.details.totalPoints || userEntry.score;
                      } else {
                        userScore = userEntry.score;
                      }
                      break;
                    case 'stableford':
                      if (userEntry.details && isStablefordDetails(userEntry.details)) {
                        userScore = userEntry.details.totalPoints || userEntry.score;
                      } else {
                        userScore = userEntry.score;
                      }
                      break;
                    case 'skins':
                      if (userEntry.details && isSkinsDetails(userEntry.details)) {
                        userScore = userEntry.details.skinsWon || userEntry.score;
                      } else {
                        userScore = userEntry.score;
                      }
                      break;
                    default:
                      userScore = userEntry.score;
                  }
                }
                
                // Extract the appropriate score/status based on game type - following CompletedLeaderboard logic
                switch (scoringMethod) {
                  case 'stroke_play':
                    // For stroke play, show the score vs par (not the total strokes)
                    if (topEntry.details && isStrokePlayDetails(topEntry.details)) {
                      winnerScore = topEntry.details.scoreVsPar || 'E';
                    } else {
                      winnerScore = 'E';
                    }
                    break;
                    
                  case 'match_play':
                    // For match play, show total points or match status
                    if ((participants as unknown as DbGameParticipant[]).length === 2 && topEntry.details && isMatchPlayDetails(topEntry.details) && 'matchStatus' in topEntry.details) {
                      winnerScore = topEntry.details.matchStatus || topEntry.score;
                    } else if (topEntry.details && isMatchPlayDetails(topEntry.details)) {
                      winnerScore = topEntry.details.totalPoints || topEntry.score;
                    } else {
                      winnerScore = topEntry.score;
                    }
                    break;
                    
                  case 'stableford':
                    // For stableford, show total points
                    if (topEntry.details && isStablefordDetails(topEntry.details)) {
                      winnerScore = topEntry.details.totalPoints || topEntry.score;
                    } else {
                      winnerScore = topEntry.score;
                    }
                    break;
                    
                  case 'skins':
                    // For skins, show skins won
                    if (topEntry.details && isSkinsDetails(topEntry.details)) {
                      winnerScore = topEntry.details.skinsWon || topEntry.score;
                    } else {
                      winnerScore = topEntry.score;
                    }
                    break;
                    
                  default:
                    winnerScore = topEntry.score;
                }
              }
            }
          } catch (err) {
            console.error(`Error calculating leaderboard for game ${game.id}:`, err);
          }
          
          
          return {
            id: game.id || `completed-${Date.now()}-${Math.random()}`,
            name: (game as DbGameResponse & { gameDescription?: string; completedAt?: string }).gameDescription || `Round at ${game.courseName}`,
            date: (game as DbGameResponse & { completedAt?: string }).completedAt ? new Date((game as DbGameResponse & { completedAt?: string }).completedAt!).toLocaleDateString() : 'Unknown date',
            courseName: game.courseName || 'Championship Course',
            teeBox: 'Championship Tees',
            status: 'completed',
            totalStrokes: (game as DbGameResponse & { totalStrokes?: number }).totalStrokes,
            netScore: (game as DbGameResponse & { netScore?: number }).netScore,
            numHoles: game.numHoles || 18,
            gameType: (game as DbGameResponse & { handicapType?: string }).handicapType || game.handicap_type || 'none',
            scoringMethod: game.scoringMethod || game.scoring_method || 'stroke_play',
            participants: (game as DbGameResponse & { totalPlayers?: number }).totalPlayers || 1,
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
      
      // Update games list - append for pagination or replace for initial load
      if (isInitial) {
        setGames(formattedCompleted);
        // Cache initial page
        const cacheKey = `${user.id}_page_0`;
        matchHistoryCache.set(cacheKey, { 
          data: formattedCompleted, 
          timestamp: Date.now(),
          hasMore: hasMoreGames 
        });
      } else {
        setGames(prevGames => [...prevGames, ...formattedCompleted]);
      }
      
      setHasMore(hasMoreGames);
    } catch (error) {
      console.error('[MatchHistory] Error loading games:', error);
      // Try to load games without scoring engine calculation as fallback
      try {
        const completedGames = await dataService.games.getUserGameHistory(user.id, 50);
        const simpleGames = (completedGames as unknown as DbGameResponse[]).map((game: DbGameResponse) => ({
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
        setGames(simpleGames);
      } catch (fallbackError) {
        console.error('[MatchHistory] Fallback also failed:', fallbackError);
        setGames([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreGames = async () => {
    if (loadingMore || !hasMore || !user?.id) return;
    
    const currentPage = Math.floor(games.length / PAGE_SIZE);
    await loadGames(currentPage, false);
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


  const getTotalDiff = (totalStrokes: number | null | undefined) => {
    if (!totalStrokes) return null;
    const diff = totalStrokes - 72; // Assuming par 72
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };


  const getCourseImage = (courseId?: string | number) => {
    if (!courseId) return null;
    const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    return courseImages.find(img => 
      img.course_id === courseIdNum
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
              
              <span className="golf-font-serif" style={{
                fontSize: '16px',
                color: 'var(--golf-cream)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Match History
              </span>
              
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
            filteredGames.map((game) => {
              const courseImage = getCourseImage(game.course_id);
              const totalDiff = getTotalDiff(game.totalStrokes);
              
              return (
                <div 
                  key={game.id} 
                  className="ion-activatable golf-card-no-padding"
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
                        src={courseImage.image_url}
                        alt={game.courseName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '0',
                          display: 'block'
                        }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (!img.dataset.errorHandled) {
                            img.dataset.errorHandled = 'true';
                            img.style.display = 'none';
                          }
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
          
          {/* Load More Button */}
          {hasMore && !loading && (
            <div style={{ textAlign: 'center', margin: '20px' }}>
              <IonButton
                fill="outline"
                onClick={loadMoreGames}
                disabled={loadingMore}
                style={{
                  '--border-color': 'var(--golf-brown)',
                  '--color': 'var(--golf-brown)',
                  '--border-radius': '8px'
                }}
              >
                {loadingMore ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: '8px', width: '16px', height: '16px' }} />
                    Loading...
                  </>
                ) : (
                  'Load More Games'
                )}
              </IonButton>
            </div>
          )}
        </div>

        {/* Bottom Padding for Navigation */}
        <div style={{ height: '60px' }} />
      </IonContent>
    </IonPage>
  );
};

export default MatchHistory;
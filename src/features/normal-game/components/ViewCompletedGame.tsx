import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonIcon,
  IonChip,
  IonNote
} from '@ionic/react';
import { 
  trophyOutline,
  calendarOutline,
  informationCircleOutline,
  golfOutline,
  flagOutline,
  medalOutline,
  ribbonOutline,
  sparklesOutline,
  chevronBackOutline,
  timeOutline,
  locationOutline,
  starOutline,
  roseOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { profileGameService } from '../services/profileGameService';
import { gameService } from '../services/gameService';
import { supabase } from '../../../lib/supabase';
import ScorecardDisplay from './ScorecardDisplay';
import CompletedLeaderboard from './CompletedLeaderboard';
import ScorecardColorGuideModal from './ScorecardColorGuideModal';
import { calculateMatchPlayResults } from '../utils/handicapCalculations';
import '../../../styles/championship.css';

interface GameData {
  game: {
    id: string;
    game_description?: string;
    scoring_format: 'match_play' | 'stroke_play';
    weather_condition?: string;
    completed_at: string;
    golf_courses: {
      name: string;
      par: number;
      golf_clubs: {
        name: string;
      };
    };
  };
  participants: Array<{
    user_id: string;
    total_strokes: number | null;
    profiles: {
      full_name: string;
    };
    tee_boxes?: {
      name: string;
    };
    handicap_index: number;
    net_score: number | null;
    course_handicap: number;
    holes_won?: number;
    holes_halved?: number;
    holes_lost?: number;
  }>;
  scores: Array<{
    user_id: string;
    hole_number: number;
    strokes: number | null;
  }>;
  holes: Array<{
    hole_number: number;
    par: number;
  }>;
}

interface ViewCompletedGameParams {
  gameId: string;
}

const ViewCompletedGame: React.FC = () => {
  const { gameId } = useParams<ViewCompletedGameParams>();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState<'scorecard' | 'leaderboard'>('scorecard');
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isColorGuideOpen, setIsColorGuideOpen] = useState(false);

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

  // Helper function to get handicap type rules (Game Format)
  const getHandicapRules = (handicapType: string) => {
    const rules: Record<string, string[]> = {
      'random': [
        'Handicaps assigned randomly',
        'Fair playing field for all levels', 
        'Each player gets different handicap'
      ],
      'none': [
        'No handicap adjustments',
        'Pure gross score competition',
        'Skill-based advantage/disadvantage'
      ],
      'ghost': [
        'Play against virtual opponent',
        'Ghost player has set score',
        'Individual challenge format'
      ],
      'stroke_play': [
        'Official handicap adjustments',
        'Net score = Gross - Handicap',
        'Fair competition across skill levels'
      ],
      'match_play': [
        'Handicap strokes on hardest holes',
        'Get strokes where you need them most',
        'Level the playing field per hole'
      ]
    };
    return rules[handicapType] || rules['none'];
  };

  // Helper function to get scoring method rules  
  const getScoringRules = (scoringMethod: string) => {
    const rules: Record<string, string[]> = {
      'stroke_play': [
        'Lowest total score wins',
        'Count every stroke taken',
        'Ties broken by back 9 score'
      ],
      'match_play': [
        'Win = 1 point, Tie = ½ point',
        'Most holes won takes match', 
        'All Square = tied match'
      ],
      'stableford': [
        'Eagle = 4 pts, Birdie = 3 pts',
        'Par = 2 pts, Bogey = 1 pt',
        'Double bogey+ = 0 pts'
      ],
      'skins': [
        'Lowest score wins the hole',
        'No winner = skin carries forward',
        'Most skins won takes match'
      ]
    };
    return rules[scoringMethod] || rules['stroke_play'];
  };

  // Legacy function for backward compatibility
  const getGameRules = (format: string) => {
    const rules: Record<string, { gameType: string[], scoring: string[] }> = {
      'stroke_play': {
        gameType: [
          'Count every stroke taken',
          'Complete all 18 holes',
          'No maximum score per hole'
        ],
        scoring: [
          'Lowest total score wins',
          'Net score = Gross - Handicap',
          'Ties broken by back 9 score'
        ]
      },
      'match_play': {
        gameType: [
          'Win individual holes',
          'Hole won by lowest net score',
          'Match ends when mathematically decided'
        ],
        scoring: [
          'Win = 1 point, Tie = ½ point',
          'Most holes won takes match',
          'All Square = tied match'
        ]
      },
      'skins': {
        gameType: [
          'Each hole has a value (skin)',
          'Win hole outright to claim skin',
          'Tied holes carry over (push)'
        ],
        scoring: [
          'Lowest score wins the hole',
          'No winner = skin carries forward',
          'Most skins won takes match'
        ]
      },
      'stableford': {
        gameType: [
          'Points based on score vs par',
          'Higher scores are better',
          'Rewards aggressive play'
        ],
        scoring: [
          'Eagle = 4 pts, Birdie = 3 pts',
          'Par = 2 pts, Bogey = 1 pt',
          'Double bogey+ = 0 pts'
        ]
      },
      // Handicap Types (Game Formats)
      'random': {
        gameType: [
          'Handicaps assigned randomly',
          'Fair playing field for all levels',
          'Each player gets different handicap'
        ],
        scoring: [
          'Net score = Gross - Handicap',
          'Random handicaps level competition',
          'Depends on chosen scoring method'
        ]
      },
      'none': {
        gameType: [
          'No handicap adjustments',
          'Pure gross score competition',
          'Skill-based advantage/disadvantage'
        ],
        scoring: [
          'Gross score only',
          'No handicap deductions',
          'Best raw score wins'
        ]
      },
      'ghost': {
        gameType: [
          'Play against virtual opponent',
          'Ghost player has set score',
          'Individual challenge format'
        ],
        scoring: [
          'Beat the ghost score',
          'Ghost typically plays to par',
          'Personal best challenge'
        ]
      },
      'nassau': {
        gameType: [
          'Three separate matches',
          'Front 9, Back 9, and Overall',
          'Each worth equal value'
        ],
        scoring: [
          'Win front 9 = 1 point',
          'Win back 9 = 1 point', 
          'Win overall = 1 point'
        ]
      },
      'four_ball': {
        gameType: [
          'Teams of 2 players',
          'Both play own ball',
          'Best score counts for team'
        ],
        scoring: [
          'Lower team score wins hole',
          'Match play or stroke play format',
          'Handicaps typically at 90%'
        ]
      },
      'best_ball': {
        gameType: [
          'Teams of 2-4 players',
          'Everyone plays own ball',
          'Best individual score counts'
        ],
        scoring: [
          'Lowest team score per hole',
          'Can be match or stroke play',
          'Full handicaps usually apply'
        ]
      },
      'scramble': {
        gameType: [
          'Team format (2-4 players)',
          'All play from best shot',
          'Continue until holed'
        ],
        scoring: [
          'One score per team',
          'Lowest total wins',
          'Handicap: 20% of combined'
        ]
      }
    };
    
    return rules[format] || rules['stroke_play'];
  };


  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      try {
        // Use gameService like LiveGame does - it returns clean arrays
        const gameData = await gameService.getGameDetails(gameId);
        
        // Load hole and course information separately if needed
        let holes = [];
        let courseInfo = null;
        if (gameData && gameData.game && gameData.game.course_id) {
          const [holesResult, courseResult] = await Promise.all([
            supabase
              .from('holes')
              .select('hole_number, par, handicap_index')
              .eq('course_id', gameData.game.course_id)
              .order('hole_number'),
            supabase
              .from('golf_courses')
              .select('id, name, par, golf_clubs(name)')
              .eq('id', gameData.game.course_id)
              .single()
          ]);
          
          // Filter holes based on game.num_holes if specified
          const allHoles = holesResult.data || [];
          holes = gameData.game.num_holes && gameData.game.num_holes < 18 
            ? allHoles.slice(0, gameData.game.num_holes)
            : allHoles;
          courseInfo = courseResult.data;
        }
        
        if (gameData) {
          // Now we have clean arrays from gameService
          const safeData = {
            ...gameData,
            holes: holes,
            game: {
              ...gameData.game,
              golf_courses: courseInfo || gameData.game.golf_courses || { name: 'Unknown Course', par: 72, golf_clubs: { name: 'Unknown Club' } }
            }
          };
          
          // Calculate match play results if it's a match play game
          if (safeData.game.scoring_method === 'match_play' && safeData.participants.length > 0) {
            const validParticipants = safeData.participants.filter(p => p.profiles).map(p => ({
              ...p,
              profiles: p.profiles || { full_name: 'Unknown' },
              tee_boxes: p.tee_boxes || { name: 'Default' }
            }));
            const participantsWithMatchPlay = calculateMatchPlayResults(
              validParticipants,
              safeData.scores,
              safeData.holes
            );
            setGameData({
              ...safeData,
              participants: participantsWithMatchPlay
            } as unknown as GameData);
          } else {
            setGameData(safeData as unknown as GameData);
          }
        } else {
          // Navigate back if game not found
          history.goBack();
        }
      } catch (error) {
        console.error('[ViewCompletedGame] Error loading game:', error);
        history.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      loadGameData();
    }
  }, [gameId, history]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy • h:mm a');
    } catch {
      return 'Date not available';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return '☀️';
      case 'partly_cloudy':
        return '⛅';
      case 'rainy':
        return '🌧️';
      case 'windy':
        return '💨';
      default:
        return null;
    }
  };

  const getWeatherLabel = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return 'Sunny Day';
      case 'partly_cloudy':
        return 'Partly Cloudy';
      case 'rainy':
        return 'Rainy';
      case 'windy':
        return 'Windy';
      default:
        return condition?.replace('_', ' ') || '';
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
            <IonTitle>Loading...</IonTitle>
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
            <IonSpinner name="crescent" color="primary" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!gameData) {
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
            <IonTitle>Game Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen style={{ '--background': 'var(--champ-pearl)' }}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>This game could not be found.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const { game, participants = [], scores = [], holes = [] } = gameData;
  
  // DEBUG: Log the actual data values for the cards
  console.log('=== ViewCompletedGame DETAILED DEBUG ===');
  console.log('Complete game object:', game);
  console.log('game.scoring_format:', game.scoring_format);
  console.log('game.handicap_type:', game.handicap_type);
  console.log('game.scoring_method:', game.scoring_method);
  console.log('Available game fields:', Object.keys(game));
  console.log('participants with handicaps:', participants?.map(p => ({
    name: p.profiles?.full_name,
    handicap_index: p.handicap_index
  })));
  console.log('getGameTypeLabel result:', getGameTypeLabel(game.handicap_type));
  console.log('getScoringTypeLabel result:', getScoringTypeLabel(game.scoring_method));
  console.log('=== END DETAILED DEBUG ===');
  
  const winner = participants && Array.isArray(participants) && participants.length > 0
    ? participants.find((p) => 
        p.total_strokes === Math.min(...participants.map((p) => p.total_strokes).filter((s) => s !== null))
      )
    : null;

  return (
    <IonPage>
      <IonHeader className="ion-no-border" style={{ 
        '--background': 'transparent'
      }}>
        <IonToolbar style={{
          '--background': 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
          '--color': 'var(--champ-cream)',
          padding: '8px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative pattern overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.02) 10px,
              rgba(255, 255, 255, 0.02) 20px
            )`,
            pointerEvents: 'none'
          }} />
          
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
                icon={chevronBackOutline} 
                style={{ 
                  fontSize: '24px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} 
              />
            </IonButton>
          </IonButtons>
          
          <IonTitle style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px'
            }}>
              <span className="champ-font-display" style={{
                fontSize: '16px',
                color: 'var(--champ-cream)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <IonIcon icon={starOutline} style={{ fontSize: '16px', color: 'var(--champ-gold)' }} />
              </span>
            
            </div>
          </IonTitle>
          
          <IonButtons slot="end" style={{ position: 'relative', zIndex: 1 }}>
            <IonButton 
              fill="clear" 
              onClick={() => setIsColorGuideOpen(true)}
              title="Scoring Guide"
              style={{
                '--color': 'var(--champ-gold)',
                '--color-activated': 'var(--champ-cream)',
                '--background-activated': 'rgba(255, 215, 0, 0.1)',
                margin: '0 8px'
              }}
            >
              <IonIcon 
                icon={informationCircleOutline} 
                style={{ 
                  fontSize: '22px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} 
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="scorecard-elite" style={{ '--background': 'var(--champ-pearl)' }}>
        {/* Championship Game Info Card - Stunning and Delicate */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 251, 240, 1) 0%, rgba(255, 245, 225, 1) 100%)',
          padding: '16px 20px',
          margin: '0',
          borderBottom: '3px solid var(--champ-gold)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          {/* Decorative watermark */}
          <div style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: '180px',
            height: '180px',
            opacity: 0.06,
            transform: 'rotate(15deg)'
          }}>
            <IonIcon 
              icon={trophyOutline} 
              style={{ 
                fontSize: '180px', 
                color: 'var(--champ-gold)'
              }} 
            />
          </div>

          {/* Elegant corner flourish */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: '20px',
            color: 'var(--champ-gold)',
            opacity: 0.3,
            fontFamily: 'serif',
            fontStyle: 'italic'
          }}>
            ❦
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Course Title with Romance Typography */}
            <div style={{ 
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'inline-block',
                position: 'relative'
              }}>
                <h1 className="champ-font-display" style={{ 
                  margin: '0', 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: 'var(--champ-green-dark)',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  {game.golf_courses.name}
                </h1>
                <div style={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, var(--champ-gold), transparent)'
                }} />
              </div>
              
              <p className="champ-font-sans" style={{ 
                margin: '8px 0 0 0', 
                color: 'var(--champ-gray)', 
                fontSize: '14px',
                fontWeight: '500',
                fontStyle: 'italic',
                letterSpacing: '1px'
              }}>
                ~ {game.golf_courses.golf_clubs?.name} ~
              </p>
            </div>

            {/* Game Description - Elegant Quote Style */}
            {game.game_description && (
              <div style={{
                textAlign: 'center',
                margin: '20px 0',
                padding: '0 20px'
              }}>
                <span style={{
                  fontSize: '24px',
                  color: 'var(--champ-gold)',
                  opacity: 0.5,
                  fontFamily: 'serif'
                }}>"</span>
                <p style={{ 
                  fontStyle: 'italic', 
                  fontSize: '15px',
                  margin: '0 8px',
                  color: 'var(--champ-gray)',
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1.6',
                  display: 'inline'
                }}>
                  {game.game_description}
                </p>
                <span style={{
                  fontSize: '24px',
                  color: 'var(--champ-gold)',
                  opacity: 0.5,
                  fontFamily: 'serif'
                }}>"</span>
              </div>
            )}

            {/* Match Details - 2x2 Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '20px'
            }}>
              {/* Date - Top Left */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(218, 165, 32, 0.2)',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <IonIcon 
                  icon={calendarOutline}
                  style={{
                    fontSize: '20px',
                    color: 'var(--champ-gold)',
                    marginBottom: '4px'
                  }}
                />
                <div className="champ-font-sans" style={{
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '2px'
                }}>
                  Played On
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '600'
                }}>
                  {format(new Date(game.completed_at), 'MMM d, yyyy')}
                </div>
              </div>

              {/* Weather - Top Right */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(218, 165, 32, 0.2)',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: '20px',
                  marginBottom: '4px'
                }}>
                  {game.weather_condition ? getWeatherIcon(game.weather_condition) : '☀️'}
                </div>
                <div className="champ-font-sans" style={{
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '2px'
                }}>
                  Weather
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '600'
                }}>
                  {game.weather_condition ? getWeatherLabel(game.weather_condition) : 'Perfect'}
                </div>
              </div>

              {/* Game Format - Bottom Left */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(218, 165, 32, 0.2)',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <IonIcon 
                  icon={flagOutline}
                  style={{
                    fontSize: '20px',
                    color: 'var(--champ-gold)',
                    marginBottom: '4px'
                  }}
                />
                <div className="champ-font-sans" style={{
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '2px'
                }}>
                  Game Format
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '600'
                }}>
                  {getGameTypeLabel(game.handicap_type)}
                </div>
              </div>

              {/* Scoring Method - Bottom Right */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(218, 165, 32, 0.2)',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <IonIcon 
                  icon={ribbonOutline}
                  style={{
                    fontSize: '20px',
                    color: 'var(--champ-gold)',
                    marginBottom: '4px'
                  }}
                />
                <div className="champ-font-sans" style={{
                  fontSize: '11px',
                  color: 'var(--champ-gray)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '2px'
                }}>
                  Scoring Method
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--champ-green-dark)',
                  fontWeight: '600'
                }}>
                  {getScoringTypeLabel(game.scoring_method)}
                </div>
              </div>
            </div>

            {/* Elegant Divider */}
            <div style={{
              margin: '24px auto 0',
              width: '80%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--champ-gold-light))'
              }} />
              <span style={{
                fontSize: '14px',
                color: 'var(--champ-gold)',
                fontFamily: 'serif',
                fontStyle: 'italic'
              }}>
                ⚜
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, var(--champ-gold-light), transparent)'
              }} />
            </div>
          </div>
        </div>

        {/* Elegant Tab Selector */}
        <div style={{ 
          padding: '16px',
          background: 'white',
          borderBottom: '1px solid var(--champ-gold-light)'
        }}>
          <IonSegment 
            value={selectedTab} 
            onIonChange={e => setSelectedTab(e.detail.value as 'scorecard' | 'leaderboard')}
            style={{
              '--background': 'var(--champ-cream)',
              borderRadius: '12px',
              padding: '4px',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <IonSegmentButton value="scorecard" style={{
              '--color-checked': 'var(--champ-cream)',
              '--background-checked': 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
              '--indicator-color': 'transparent',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <IonLabel className="champ-font-sans" style={{
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                <IonIcon icon={flagOutline} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Scorecard
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="leaderboard" style={{
              '--color-checked': 'var(--champ-cream)',
              '--background-checked': 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
              '--indicator-color': 'transparent',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <IonLabel className="champ-font-sans" style={{
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                <IonIcon icon={trophyOutline} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Leaderboard
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Tab Content */}
        <div style={{ paddingBottom: '20px' }}>
          {selectedTab === 'scorecard' ? (
            <ScorecardDisplay
              participants={participants}
              scores={scores}
              holes={holes}
              courseName={game.golf_courses.name}
              coursePar={game.golf_courses.par}
              isReadOnly={true}
            />
          ) : (
            <>
              {/* Leaderboard Component */}
              <CompletedLeaderboard
                participants={participants}
                scores={scores}
                holes={holes}
                gameFormat={game.scoring_method}
              />
              
              {/* Golf Club Style Rules Card - Below Leaderboard */}
              <div style={{
                background: '#f8f6f0',
                borderRadius: '8px',
                padding: '24px 20px 20px',
                margin: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                border: '1px solid #d4c4a0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Green header bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #2a5434 0%, #3d7c47 50%, #2a5434 100%)'
                }} />
                
                {/* Date in top right */}
                <div style={{ 
                  position: 'absolute',
                  top: '10px',
                  right: '20px',
                  fontSize: '10px', 
                  color: '#8b7355',
                  fontFamily: 'serif',
                  fontStyle: 'italic'
                }}>
                  {getGameTypeLabel(game.handicap_type)}
                </div>
                
                {/* Title */}
                <h3 style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#8b7355',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin: '0 0 16px 0',
                  fontFamily: 'serif',
                  textAlign: 'center'
                }}>
                  Tournament Rules & Scoring
                </h3>
                
                {/* Rules Content with vertical divider */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                  gap: '20px'
                }}>
                  {/* Game Type Rules */}
                  <div style={{ 
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#2a5434',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: 'serif',
                      fontWeight: '600'
                    }}>
                      Game Format
                    </div>
                    <ul style={{
                      margin: 0,
                      padding: '0 0 0 16px',
                      listStyleType: 'none'
                    }}>
                      {getHandicapRules(game.handicap_type).map((rule, index) => (
                        <li key={index} style={{
                          fontSize: '11px',
                          color: '#2a5434',
                          fontFamily: 'Georgia, serif',
                          marginBottom: '6px',
                          position: 'relative',
                          paddingLeft: '12px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: '#b8860b'
                          }}>•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Vertical Divider */}
                  <div style={{
                    width: '1px',
                    background: 'linear-gradient(180deg, transparent, #d4c4a0, transparent)',
                    margin: '0 10px'
                  }} />
                  
                  {/* Scoring Rules */}
                  <div style={{ 
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#2a5434',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: 'serif',
                      fontWeight: '600'
                    }}>
                      Scoring Method
                    </div>
                    <ul style={{
                      margin: 0,
                      padding: '0 0 0 16px',
                      listStyleType: 'none'
                    }}>
                      {getScoringRules(game.scoring_method).map((rule, index) => (
                        <li key={index} style={{
                          fontSize: '11px',
                          color: '#2a5434',
                          fontFamily: 'Georgia, serif',
                          marginBottom: '6px',
                          position: 'relative',
                          paddingLeft: '12px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: '#b8860b'
                          }}>•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Bottom decorative line */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #d4c4a0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '9px',
                    color: '#8b7355',
                    fontFamily: 'serif',
                    fontStyle: 'italic',
                    letterSpacing: '0.5px'
                  }}>
                    {participants.length} Players • {holes.length} Holes • {game.weather_condition ? getWeatherLabel(game.weather_condition) : 'Perfect Conditions'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Finish/Close Button */}
        <div style={{ 
          padding: '20px',
          background: 'var(--champ-pearl)',
          borderTop: '1px solid var(--champ-gold-light)'
        }}>
          <IonButton 
            expand="block" 
            onClick={() => history.push('/home')}
            style={{
              background: 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
              color: 'var(--champ-cream)',
              borderRadius: '12px',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              '--background': 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
              '--background-activated': 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
              '--background-focused': 'linear-gradient(135deg, var(--champ-green-dark) 0%, var(--champ-green) 100%)',
              '--background-hover': 'linear-gradient(135deg, #0a2912 0%, #154a2a 100%)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            <IonIcon slot="icon-only" icon={starOutline} style={{ fontSize: '24px', color: 'var(--champ-gold)' }} />
          </IonButton>
        </div>

        <ScorecardColorGuideModal
          isOpen={isColorGuideOpen}
          onClose={() => setIsColorGuideOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ViewCompletedGame;
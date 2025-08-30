import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonNote,
  IonLabel,
  IonSpinner,
  IonToast
} from '@ionic/react';
import { 
  addOutline, 
  removeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkOutline,
  statsChartOutline,
  closeOutline
} from 'ionicons/icons';
import { supabase } from '../../../lib/supabase';
import { gameService } from '../services/gameService';
import type { GameParticipant, GameHoleScore } from '../types';

interface HoleEntryProps {
  gameId: string;
  participants: GameParticipant[];
  scores: GameHoleScore[];
  currentHole: number;
  game: { id: string; course_id?: string; teebox_id?: string; status?: string; name?: string; format?: string }; // Add game prop to match Scorecard and Leaderboard
  onHoleChange: (hole: number) => void;
  onScoreUpdate: () => void;
  onGameComplete?: () => void;
  isLiveMatch?: boolean;
}

interface HoleInfo {
  hole_number: number;
  par: number;
  handicap_index: number;
  meters?: number;
}

interface PlayerScore {
  participantId: string;
  userId: string;
  strokes: number;
  putts: number;
}

const HoleEntry: React.FC<HoleEntryProps> = ({
  gameId,
  participants,
  scores,
  currentHole,
  game,
  onHoleChange,
  onScoreUpdate,
  onGameComplete,
  isLiveMatch = false
}) => {
  const [holeInfo, setHoleInfo] = useState<HoleInfo | null>(null);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadHoleData();
  }, [currentHole]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Initialize scores when holeInfo changes or participants/scores change
  useEffect(() => {
    if (holeInfo) {
      initializeScores();
    }
  }, [holeInfo, participants, scores, currentHole]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHoleData = async () => {
    try {
      if (!supabase) return;
      
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('course_id')
        .eq('id', gameId)
        .single();
        
      if (gameError || !game) {
        console.error('Error loading game:', gameError);
        return;
      }

      // First get the hole info with a join to hole_distances
      const firstParticipant = participants[0];
      
      // Try to get hole with distance data using left join
      const { data: hole } = await supabase
        .from('holes')
        .select(`
          id,
          hole_number,
          par,
          handicap_index,
          hole_distances(
            meters,
            yards,
            tee_box_id
          )
        `)
        .eq('course_id', game.course_id)
        .eq('hole_number', currentHole)
        .single();
      
      if (hole) {
        // Find the distance for the participant's tee box
        let meters = undefined;
        
        if (hole.hole_distances && Array.isArray(hole.hole_distances) && hole.hole_distances.length > 0) {
          // Try to find exact match for participant's tee box
          const distance = hole.hole_distances.find(
            d => d.tee_box_id === firstParticipant?.tee_box_id
          );
          
          if (distance) {
            meters = distance.meters;
          } else {
            // Fallback: use the first available distance
            meters = hole.hole_distances[0]?.meters;
          }
        }
        
        setHoleInfo({
          hole_number: hole.hole_number,
          par: hole.par,
          handicap_index: hole.handicap_index,
          meters: meters
        });
      }
    } catch (error) {
      console.error('Error loading hole data:', error);
      // Fallback to just basic hole info without distance
      try {
        const { data: game } = await supabase
          .from('games')
          .select('course_id')
          .eq('id', gameId)
          .single();
          
        if (game) {
          const { data: hole } = await supabase
            .from('holes')
            .select('hole_number, par, handicap_index')
            .eq('course_id', game.course_id)
            .eq('hole_number', currentHole)
            .single();
            
          if (hole) {
            setHoleInfo(hole);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeScores = () => {
    if (!participants || participants.length === 0) {
      setPlayerScores([]);
      return;
    }
    
    const initialScores: PlayerScore[] = participants.map(p => {
      const existingScore = scores.find(
        s => s.user_id === p.user_id && s.hole_number === currentHole
      );
      
      // Calculate player's personal par (hole par + handicap strokes)
      const matchHandicap = p.match_handicap;
      let handicapStrokes = 0;
      
      if (matchHandicap > 0 && holeInfo?.handicap_index) {
        const fullRounds = Math.floor(matchHandicap / 18);
        const remainingStrokes = matchHandicap % 18;
        handicapStrokes = holeInfo.handicap_index <= remainingStrokes ? fullRounds + 1 : fullRounds;
      }
      
      const playerPar = (holeInfo?.par || 4) + handicapStrokes;
      
      // Default to player's personal par for strokes, and 0 for putts (optional)
      return {
        participantId: p.id,
        userId: p.user_id,
        strokes: existingScore?.strokes !== undefined && existingScore.strokes > 0 
          ? existingScore.strokes 
          : playerPar,  // Default to player's personal par if no score exists
        putts: existingScore?.putts !== undefined 
          ? existingScore.putts 
          : 0  // Default to 0 (optional field)
      };
    });
    
    setPlayerScores(initialScores);
  };

  const updatePlayerScore = (userId: string, field: 'strokes' | 'putts', value: number) => {
    setPlayerScores(prev => prev.map(score => {
      if (score.userId !== userId) return score;
      
      if (field === 'strokes') {
        // When updating strokes, ensure putts don't exceed the new stroke value
        const newStrokes = Math.max(1, Math.min(value, 15));
        const adjustedPutts = Math.min(score.putts, newStrokes);
        return { ...score, strokes: newStrokes, putts: adjustedPutts };
      } else {
        // When updating putts, ensure it doesn't exceed strokes
        const newPutts = Math.max(0, Math.min(value, score.strokes));
        return { ...score, putts: newPutts };
      }
    }));
  };

  const handleSaveScores = async () => {
    setSaving(true);
    try {
      // Debug: Check critical values
      console.log('=== SAVE DEBUG ===');
      console.log('supabase client exists?', !!supabase);
      console.log('gameId:', gameId);
      console.log('currentHole:', currentHole);
      console.log('playerScores:', playerScores);
      console.log('participants:', participants);
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      if (!gameId) {
        throw new Error('Game ID is missing');
      }
      
      // Save all scores for this hole
      await Promise.all(
        playerScores.map(score => 
          gameService.updateHoleScore(
            gameId,
            score.userId,
            currentHole,
            score.strokes,
            score.putts
          )
        )
      );
      
      onScoreUpdate();
      
      // Handle completion or move to next hole
      const maxHoles = game?.num_holes || 18;
      if (currentHole === maxHoles) {
        // Complete the game
        await gameService.closeGame(gameId);
        
        // Navigate to completed game view immediately
        if (onGameComplete) {
          onGameComplete();
        }
      } else {
        // Move to next hole
        // Success feedback handled by parent component green dot
        setTimeout(() => {
          onHoleChange(currentHole + 1);
        }, 500);
      }
    } catch (error) {
      console.error('Error saving scores:', error);
      setToastMessage('Failed to save scores');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  // Calculate the maximum hole that has been played (has scores)
  const maxHolePlayed = Math.max(
    0,
    ...scores.filter(s => s.strokes && s.strokes > 0).map(s => s.hole_number)
  );
  
  // Allow navigation to all holes, but track if current hole is playable
  const maxHoles = game?.num_holes || 18;
  const canGoPrevious = currentHole > 1;
  const canGoNext = currentHole < maxHoles;
  const isCurrentHolePlayable = !isLiveMatch || currentHole <= maxHolePlayed + 1;

  if (loading || !holeInfo) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  const getPlayerHandicapStrokes = (participant: GameParticipant): number => {
    // Calculate strokes received on this hole based on match handicap
    const matchHandicap = participant.match_handicap;
    if (matchHandicap <= 0) return 0;
    
    const fullRounds = Math.floor(matchHandicap / 18);
    const remainingStrokes = matchHandicap % 18;
    
    if (holeInfo.handicap_index <= remainingStrokes) {
      return fullRounds + 1;
    }
    return fullRounds;
  };

  // Dynamic gradient colors based on hole number
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Sunset
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Ocean
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Soft
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', // Coral
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // Warm
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', // Mint
    'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)', // Violet
    'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)', // Sky
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Peach
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Cream
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // Light Blue
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', // Lavender
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // Aqua
    'linear-gradient(135deg, #fc6076 0%, #ff9a44 100%)', // Fire
  ];
  
  const currentGradient = gradients[(currentHole - 1) % gradients.length];


  return (
    <div style={{ padding: '0', paddingBottom: '70px', position: 'relative' }}>
      {/* Stats Panel - Slide Down */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        backgroundColor: 'var(--ion-background-color)',
        zIndex: 999,
        transform: showStats ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: showStats ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
        overflowY: 'auto'
      }}>
        {/* Stats Header */}
        <div style={{
          background: currentGradient,
          padding: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Hole {currentHole} Stats
            </h2>
            <IonButton
              fill="clear"
              onClick={() => setShowStats(false)}
              style={{
                '--color': 'white',
                minHeight: '32px'
              }}
            >
              <IonIcon icon={closeOutline} slot="icon-only" />
            </IonButton>
          </div>
        </div>
        
        {/* Stats Content - Placeholder */}
        <div style={{ padding: '20px' }}>
          <div style={{
            backgroundColor: 'var(--ion-color-light)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--ion-text-color)'
            }}>
              Historical Performance
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--ion-color-medium)',
              margin: 0
            }}>
              Player statistics for this hole will appear here
            </p>
          </div>
          
          {/* Player Stats Cards - Placeholder */}
          {participants.map((participant, index) => (
            <IonCard key={participant.id} style={{ marginBottom: '12px' }}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '16px' }}>
                  {participant.profiles?.full_name || `Player ${index + 1}`}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                      Avg Score
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      --
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                      Best
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--ion-color-success)' }}>
                      --
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                      Times Played
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      --
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </div>

      {/* Professional Hole Header - iOS Style */}
      <div style={{
        background: currentGradient,
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease'
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
        }} />
        
        {/* Navigation and Hole Info */}
        <div style={{
          position: 'relative',
          padding: '20px 0 16px',
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* Left Arrow - Centered */}
          <IonButton
            fill="clear"
            style={{ 
              '--color': 'white',
              minHeight: '32px',
              opacity: canGoPrevious ? 1 : 0.3,
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1
            }}
            disabled={!canGoPrevious}
            onClick={() => onHoleChange(currentHole - 1)}
          >
            <IonIcon icon={chevronBackOutline} slot="icon-only" />
          </IonButton>

          {/* Center Content */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Hole Number */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '2px'
              }}>
                Hole
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '700',
                color: 'white',
                lineHeight: '1'
              }}>
                {currentHole}
              </div>
            </div>
            
            {/* Bottom Row - Hole Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  Par
                </div>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {holeInfo.par}
                </div>
              </div>
              
              {holeInfo.meters && (
                <>
                  <div style={{ 
                    width: '1px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    margin: '8px 0'
                  }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'rgba(255, 255, 255, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px'
                    }}>
                      Distance
                    </div>
                    <div style={{ 
                      fontSize: '22px', 
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {holeInfo.meters}<span style={{ fontSize: '14px', fontWeight: '400' }}>m</span>
                    </div>
                  </div>
                </>
              )}
              
              <div style={{ 
                width: '1px', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                margin: '8px 0'
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  Index
                </div>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {holeInfo.handicap_index}
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow - Centered */}
          <IonButton
            fill="clear"
            style={{ 
              '--color': 'white',
              minHeight: '32px',
              opacity: canGoNext ? 1 : 0.3,
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1
            }}
            disabled={!canGoNext}
            onClick={() => onHoleChange(currentHole + 1)}
          >
            <IonIcon icon={chevronForwardOutline} slot="icon-only" />
          </IonButton>
        </div>
      </div>

      {/* Stats Button - Full Width Below Header */}
      <IonButton
        expand="block"
        fill="solid"
        onClick={() => setShowStats(true)}
        style={{
          margin: 0,
          borderRadius: 0,
          height: '48px',
          '--background': 'var(--ion-color-primary)',
          '--background-hover': 'var(--ion-color-primary-shade)',
          '--background-activated': 'var(--ion-color-primary-tint)',
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          borderTop: '1px solid #e0e0e0',
          '--border-radius': '0'
        }}
      >
        <IonIcon icon={statsChartOutline} slot="start" />
        View Hole Statistics
      </IonButton>

      {/* Player Scores - More Compact */}
      {playerScores.map((playerScore, index) => {
        const participant = participants.find(p => p.user_id === playerScore.userId);
        if (!participant) return null;
        
        const handicapStrokes = getPlayerHandicapStrokes(participant);
        const playerPar = holeInfo.par + handicapStrokes;
        const scoreDiff = playerScore.strokes - playerPar;  // Compare to player's personal par, not hole par
        
        return (
          <IonCard key={playerScore.userId} style={{ margin: '0', borderRadius: '0', borderTop: '1px solid var(--ion-color-light-shade)' }}>
            <IonCardHeader style={{ padding: '12px 16px' }}>
              <IonCardTitle style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{participant.profiles?.full_name || `Player ${index + 1}`}</span>
                {handicapStrokes > 0 && (
                  <div style={{ 
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'var(--ion-color-primary)'
                  }}>
                    +{handicapStrokes}
                  </div>
                )}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ padding: '16px' }}>
              {/* Strokes and Putts Side by Side */}
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                {/* Strokes Input - Larger */}
                <div style={{ flex: '1.5' }}>
                  <IonLabel style={{ 
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '11px',
                    color: 'var(--ion-color-medium)',
                    textAlign: 'center'
                  }}>
                    STROKES (Par {playerPar})
                  </IonLabel>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <IonButton
                      fill="outline"
                      shape="round"
                      onClick={() => updatePlayerScore(playerScore.userId, 'strokes', playerScore.strokes - 1)}
                      disabled={playerScore.strokes <= 1}
                      style={{ 
                        '--padding-start': '0',
                        '--padding-end': '0',
                        height: '40px',
                        width: '40px',
                        minHeight: '40px',
                        margin: 0
                      }}
                    >
                      <IonIcon icon={removeOutline} slot="icon-only" style={{ fontSize: '20px' }} />
                    </IonButton>

                    <div style={{
                      minWidth: '60px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: '40px'
                    }}>
                      <div style={{
                        fontSize: '26px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        color: scoreDiff === 0 ? 'var(--ion-color-dark)' :
                               scoreDiff < 0 ? 'var(--ion-color-primary)' :
                               'var(--ion-color-danger)'
                      }}>
                        {playerScore.strokes}
                      </div>
                      <IonNote style={{ fontSize: '9px', lineHeight: '1' }}>
                        {scoreDiff === 0 ? 'Net Par' :
                         scoreDiff === -2 ? 'Net Eagle' :
                         scoreDiff === -1 ? 'Net Birdie' :
                         scoreDiff === 1 ? 'Net Bogey' :
                         scoreDiff === 2 ? 'Net Double' :
                         scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`}
                      </IonNote>
                    </div>

                    <IonButton
                      fill="outline"
                      shape="round"
                      onClick={() => updatePlayerScore(playerScore.userId, 'strokes', playerScore.strokes + 1)}
                      disabled={playerScore.strokes >= 15}
                      style={{ 
                        '--padding-start': '0',
                        '--padding-end': '0',
                        height: '40px',
                        width: '40px',
                        minHeight: '40px',
                        margin: 0
                      }}
                    >
                      <IonIcon icon={addOutline} slot="icon-only" style={{ fontSize: '20px' }} />
                    </IonButton>
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  width: '1px',
                  backgroundColor: 'var(--ion-color-light-shade)',
                  margin: '0 4px',
                  alignSelf: 'stretch'
                }} />

                {/* Putts Input - Smaller */}
                <div style={{ flex: '1' }}>
                  <IonLabel style={{ 
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '11px',
                    color: 'var(--ion-color-medium)',
                    textAlign: 'center'
                  }}>
                    PUTTS <span style={{ fontSize: '9px' }}>(opt)</span>
                  </IonLabel>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <IonButton
                      fill="outline"
                      shape="round"
                      onClick={() => updatePlayerScore(playerScore.userId, 'putts', playerScore.putts - 1)}
                      disabled={playerScore.putts <= 0}
                      style={{ 
                        '--padding-start': '0',
                        '--padding-end': '0',
                        height: '32px',
                        width: '32px',
                        minHeight: '32px',
                        margin: 0
                      }}
                    >
                      <IonIcon icon={removeOutline} style={{ fontSize: '16px' }} />
                    </IonButton>

                    <div style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '32px',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {playerScore.putts}
                    </div>

                    <IonButton
                      fill="outline"
                      shape="round"
                      onClick={() => updatePlayerScore(playerScore.userId, 'putts', playerScore.putts + 1)}
                      disabled={playerScore.putts >= playerScore.strokes}
                      style={{ 
                        '--padding-start': '0',
                        '--padding-end': '0',
                        height: '32px',
                        width: '32px',
                        minHeight: '32px',
                        margin: 0
                      }}
                    >
                      <IonIcon icon={addOutline} style={{ fontSize: '16px' }} />
                    </IonButton>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        );
      })}

      {/* Show warning if trying to enter scores for future holes in live match */}
      {isLiveMatch && !isCurrentHolePlayable && (
        <div style={{
          margin: '16px',
          padding: '10px',
          backgroundColor: '#fff4e6',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ffd4a3'
        }}>
          <IonNote style={{ fontSize: '11px', fontWeight: '400', opacity: 0.8, color: '#8b6914' }}>
            Tip: Stop auto-refresh to maintain hole view
          </IonNote>
        </div>
      )}

      {/* Save Button - More Compact */}
      <div style={{
        position: 'fixed',
        bottom: '56px',
        left: '12px',
        right: '12px',
        padding: '10px 0',
        backgroundColor: 'var(--ion-background-color)'
      }}>
        <IonButton
          expand="block"
          onClick={handleSaveScores}
          disabled={saving || !isCurrentHolePlayable}
          style={{ height: '44px' }}
        >
          {saving ? (
            <>
              <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
              Saving...
            </>
          ) : !isCurrentHolePlayable ? (
            <>
              <IonIcon icon={checkmarkOutline} slot="start" />
              Complete Hole {maxHolePlayed + 1} First
            </>
          ) : (
            <>
              <IonIcon icon={checkmarkOutline} slot="start" />
              Save & {currentHole < maxHoles ? 'Next Hole' : 'Finish'}
            </>
          )}
        </IonButton>
      </div>

      {/* Toast Notification */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
        color={toastMessage.includes('success') ? 'success' : 'danger'}
      />
    </div>
  );
};

export default HoleEntry;
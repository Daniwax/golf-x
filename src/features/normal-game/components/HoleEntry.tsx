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
  IonChip,
  IonToast
} from '@ionic/react';
import { 
  addOutline, 
  removeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { supabase } from '../../../lib/supabase';
import { gameService } from '../services/gameService';
import type { GameParticipant, GameHoleScore } from '../types';

interface HoleEntryProps {
  gameId: string;
  participants: GameParticipant[];
  scores: GameHoleScore[];
  currentHole: number;
  onHoleChange: (hole: number) => void;
  onScoreUpdate: () => void;
  onGameComplete?: () => void;
}

interface HoleInfo {
  hole_number: number;
  par: number;
  handicap_index: number;
  yards?: number;
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
  onHoleChange,
  onScoreUpdate,
  onGameComplete
}) => {
  const [holeInfo, setHoleInfo] = useState<HoleInfo | null>(null);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadHoleData();
    initializeScores();
  }, [currentHole, participants, scores]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHoleData = async () => {
    try {
      if (!supabase) return;
      
      const { data: game } = await supabase
        .from('games')
        .select('course_id')
        .eq('id', gameId)
        .single();
        
      if (!game) return;
      
      const { data: hole } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', game.course_id)
        .eq('hole_number', currentHole)
        .single();
        
      if (hole) {
        setHoleInfo(hole);
      }
    } catch (error) {
      console.error('Error loading hole data:', error);
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
      
      // Default to par for strokes (most common score), and 0 for putts (optional)
      return {
        participantId: p.id,
        userId: p.user_id,
        strokes: existingScore?.strokes || (holeInfo?.par || 4),  // Default to par
        putts: existingScore?.putts || 0                          // Default to 0 (optional field)
      };
    });
    
    setPlayerScores(initialScores);
  };

  const updatePlayerScore = (userId: string, field: 'strokes' | 'putts', value: number) => {
    setPlayerScores(prev => prev.map(score => 
      score.userId === userId 
        ? { ...score, [field]: Math.max(0, Math.min(value, field === 'strokes' ? 15 : 10)) }
        : score
    ));
  };

  const handleSaveScores = async () => {
    setSaving(true);
    try {
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
      if (currentHole === 18) {
        // Complete the game
        await gameService.closeGame(gameId);
        setToastMessage('Game completed! Great round!');
        setShowToast(true);
        
        // Call completion handler after a short delay
        setTimeout(() => {
          if (onGameComplete) {
            onGameComplete();
          }
        }, 1500);
      } else {
        // Move to next hole
        setToastMessage('Scores saved successfully!');
        setShowToast(true);
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

  const canGoPrevious = currentHole > 1;
  const canGoNext = currentHole < 18;

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

  return (
    <div style={{ padding: '0', paddingBottom: '70px' }}>
      {/* Hole Navigation with Info Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: currentHole % 2 === 0 ? '#e8f5e8' : '#e8f0f7',
        position: 'relative',
        margin: '0'
      }}>
        <IonButton
          fill="clear"
          size="small"
          disabled={!canGoPrevious}
          onClick={() => onHoleChange(currentHole - 1)}
        >
          <IonIcon icon={chevronBackOutline} slot="icon-only" />
        </IonButton>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            Hole {currentHole}
          </h2>
          <IonNote style={{ fontSize: '12px' }}>Par {holeInfo.par} • SI {holeInfo.handicap_index}</IonNote>
        </div>

        <IonButton
          fill="clear"
          size="small"
          disabled={!canGoNext}
          onClick={() => onHoleChange(currentHole + 1)}
        >
          <IonIcon icon={chevronForwardOutline} slot="icon-only" />
        </IonButton>
      </div>

      {/* Player Scores - More Compact */}
      {playerScores.map((playerScore, index) => {
        const participant = participants.find(p => p.user_id === playerScore.userId);
        if (!participant) return null;
        
        const handicapStrokes = getPlayerHandicapStrokes(participant);
        const playerPar = holeInfo.par + handicapStrokes;
        const scoreDiff = playerScore.strokes - holeInfo.par;
        
        return (
          <IonCard key={playerScore.userId} style={{ margin: '0', borderRadius: '0', borderTop: '1px solid var(--ion-color-light-shade)' }}>
            <IonCardHeader style={{ padding: '12px 16px' }}>
              <IonCardTitle style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{participant.profiles?.full_name || `Player ${index + 1}`}</span>
                {handicapStrokes > 0 && (
                  <IonChip 
                    color="primary" 
                    style={{ 
                      height: '18px',
                      fontSize: '10px',
                      padding: '0 6px'
                    }}
                  >
                    +{handicapStrokes}
                  </IonChip>
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
                        {scoreDiff === 0 ? 'Par' :
                         scoreDiff === -2 ? 'Eagle' :
                         scoreDiff === -1 ? 'Birdie' :
                         scoreDiff === 1 ? 'Bogey' :
                         scoreDiff === 2 ? 'Double' :
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
                      disabled={playerScore.putts >= 10}
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
          disabled={saving}
          style={{ height: '44px' }}
        >
          {saving ? (
            <>
              <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
              Saving...
            </>
          ) : (
            <>
              <IonIcon icon={checkmarkOutline} slot="start" />
              Save & {currentHole < 18 ? 'Next Hole' : 'Finish'}
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
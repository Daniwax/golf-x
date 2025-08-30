import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonRadioGroup,
  IonRadio,
  IonBackButton,
  IonButtons,
  IonNote,
  IonSpinner,
  IonIcon
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import WeatherSelector from './WeatherSelector';
import CourseSelector from './CourseSelector';
import GameRulesModal from './GameRulesModal';
import type { WeatherCondition, ScoringFormat, HandicapType, ScoringMethod } from '../types';

const CreateGame: React.FC = () => {
  const history = useHistory();
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [description, setDescription] = useState('');
  const [showHandicapModal, setShowHandicapModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const format: ScoringFormat = 'match_play'; // Legacy - kept for compatibility
  
  // New multi-game fields
  const [handicapType, setHandicapType] = useState<HandicapType>('match_play');
  const [scoringMethod, setScoringMethod] = useState<ScoringMethod>('match_play');

  const handleNext = () => {
    // Validate inputs
    if (!courseId) {
      setError('Please select a golf course');
      return;
    }
    
    // Clear any focused elements before navigation
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
    
    // Navigate to participant selection with state
    history.push('/game/add-participants', {
      gameData: {
        description,
        courseId,
        weather,
        format,
        handicapType,
        scoringMethod
      }
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Create New Game</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Game Description Section */}
        <div style={{ paddingTop: '20px' }}>
          <div style={{ padding: '0 16px', marginBottom: '8px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--ion-color-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0'
            }}>
              GAME DESCRIPTION
            </h3>
          </div>
          <IonItem lines="full">
            <IonInput
              value={description}
              onIonInput={e => setDescription(e.detail.value || '')}
              placeholder="Add match description"
              maxlength={100}
              disabled={loading}
            />
          </IonItem>
        </div>

        {/* Course Selection Section */}
        <div style={{ paddingTop: '24px' }}>
          <div style={{ padding: '0 16px', marginBottom: '8px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--ion-color-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0'
            }}>
              SELECT GOLF COURSE *
            </h3>
          </div>
          <IonItem lines="full">
            <CourseSelector
              value={courseId}
              onChange={setCourseId}
              disabled={loading}
            />
          </IonItem>
        </div>

        {/* Weather Conditions Section */}
        <div style={{ paddingTop: '24px' }}>
          <div style={{ padding: '0 16px', marginBottom: '8px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--ion-color-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0'
            }}>
              WEATHER CONDITIONS
            </h3>
          </div>
          <div style={{ backgroundColor: 'var(--ion-color-light)', padding: '12px 16px' }}>
            <WeatherSelector
              value={weather}
              onChange={setWeather}
              disabled={loading}
            />
          </div>
        </div>

        {/* Handicap Type Section */}
        <div style={{ paddingTop: '24px' }}>
          <div style={{ padding: '0 16px', marginBottom: '8px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--ion-color-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>HANDICAP TYPE</span>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowHandicapModal(true)}
                style={{
                  '--padding-start': '8px',
                  '--padding-end': '8px',
                  height: '28px'
                }}
              >
                <IonIcon 
                  icon={informationCircleOutline} 
                  slot="icon-only" 
                  style={{ 
                    fontSize: '20px',
                    color: 'var(--ion-color-primary)'
                  }}
                />
              </IonButton>
            </h3>
          </div>
          <IonRadioGroup value={handicapType}>
            <IonItem lines="inset" button={true} detail={false} onClick={() => setHandicapType('match_play')}>
              <IonLabel>
                <div>Match Play</div>
                <IonNote>Relative handicap - lowest plays off scratch</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="match_play" />
            </IonItem>
            <IonItem lines="inset" button={true} detail={false} onClick={() => setHandicapType('stroke_play')}>
              <IonLabel>
                <div>Stroke Play</div>
                <IonNote>Full handicap for all players</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="stroke_play" />
            </IonItem>
            <IonItem lines="inset" button={true} detail={false} onClick={() => setHandicapType('none')}>
              <IonLabel>
                <div>No Handicap</div>
                <IonNote>All players play to course par</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="none" />
            </IonItem>
            <IonItem lines="full" button={true} detail={false} onClick={() => setHandicapType('random')}>
              <IonLabel>
                <div>Random</div>
                <IonNote>Fun mode - strokes distributed randomly</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="random" />
            </IonItem>
          </IonRadioGroup>
        </div>

        {/* Scoring Method Section */}
        <div style={{ paddingTop: '24px' }}>
          <div style={{ padding: '0 16px', marginBottom: '8px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--ion-color-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>SCORING METHOD</span>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowScoringModal(true)}
                style={{
                  '--padding-start': '8px',
                  '--padding-end': '8px',
                  height: '28px'
                }}
              >
                <IonIcon 
                  icon={informationCircleOutline} 
                  slot="icon-only" 
                  style={{ 
                    fontSize: '20px',
                    color: 'var(--ion-color-primary)'
                  }}
                />
              </IonButton>
            </h3>
          </div>
          <IonRadioGroup value={scoringMethod}>
            <IonItem lines="inset" button={true} detail={false} onClick={() => setScoringMethod('match_play')}>
              <IonLabel>
                <div>Match Play</div>
                <IonNote>Points for each hole won</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="match_play" />
            </IonItem>
            <IonItem lines="inset" button={true} detail={false} onClick={() => setScoringMethod('stroke_play')}>
              <IonLabel>
                <div>Stroke Play</div>
                <IonNote>Total strokes minus handicap</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="stroke_play" />
            </IonItem>
            <IonItem lines="inset" button={true} detail={false} onClick={() => setScoringMethod('stableford')}>
              <IonLabel>
                <div>Stableford</div>
                <IonNote>Points based on score vs par</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="stableford" />
            </IonItem>
            <IonItem lines="full" button={true} detail={false} onClick={() => setScoringMethod('skins')}>
              <IonLabel>
                <div>Skins</div>
                <IonNote>Winner takes all on each hole</IonNote>
              </IonLabel>
              <IonRadio slot="end" value="skins" />
            </IonItem>
          </IonRadioGroup>
        </div>


        {/* Error Message */}
        {error && (
          <div style={{ padding: '16px', marginTop: '16px' }}>
            <div style={{ 
              backgroundColor: 'var(--ion-color-danger-tint)',
              color: 'var(--ion-color-danger-contrast)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          </div>
        )}

        {/* Next Button - Fixed at bottom */}
        <div style={{ 
          padding: '16px',
          paddingBottom: '32px',
          marginTop: '40px'
        }}>
          <IonButton
            expand="block"
            size="large"
            onClick={handleNext}
            disabled={loading || !courseId}
            style={{ 
              '--border-radius': '12px',
              height: '56px',
              fontWeight: '600'
            }}
          >
            {loading ? <IonSpinner name="crescent" /> : 'Add Participants →'}
          </IonButton>
        </div>
      </IonContent>
      
      {/* Handicap Rules Modal */}
      <GameRulesModal
        isOpen={showHandicapModal}
        onDismiss={() => setShowHandicapModal(false)}
        mode="handicap"
        initialSelection={handicapType}
      />
      
      {/* Scoring Rules Modal */}
      <GameRulesModal
        isOpen={showScoringModal}
        onDismiss={() => setShowScoringModal(false)}
        mode="scoring"
        initialSelection={scoringMethod}
      />
    </IonPage>
  );
};

export default CreateGame;
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
import ScoringFormatModal from './ScoringFormatModal';
import type { WeatherCondition, ScoringFormat } from '../types';

const CreateGame: React.FC = () => {
  const history = useHistory();
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [description, setDescription] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [format, setFormat] = useState<ScoringFormat>('match_play');

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
        format
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

        {/* Scoring Format Section */}
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
              <span>SCORING FORMAT</span>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowRulesModal(true)}
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
          <IonRadioGroup
            value={format}
            onIonChange={e => setFormat(e.detail.value)}
          >
            <IonItem lines="inset" disabled={loading}>
              <IonLabel>Match Play</IonLabel>
              <IonRadio slot="start" value="match_play" />
            </IonItem>
            <IonItem lines="full">
              <IonLabel>
                <div>Stroke Play</div>
                <IonNote>Coming Soon</IonNote>
              </IonLabel>
              <IonRadio slot="start" value="stroke_play" disabled />
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
      
      {/* Scoring Format Rules Modal */}
      <ScoringFormatModal
        isOpen={showRulesModal}
        onDismiss={() => setShowRulesModal(false)}
        initialFormat={format}
      />
    </IonPage>
  );
};

export default CreateGame;
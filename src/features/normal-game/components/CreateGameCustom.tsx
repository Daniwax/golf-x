import React, { useState, useEffect } from 'react';
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
  IonIcon,
  IonRange
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import WeatherSelector from './WeatherSelector';
import CourseSelector from './CourseSelector';
import GameRulesModal from './GameRulesModal';
import { dataService } from '../../../services/data/DataService';
import type { WeatherCondition } from '../types';

// Game types from HandicapEngineTest
const GAME_TYPES = {
  match_play: {
    displayName: 'Match Play',
    description: 'Classic match play with relative handicaps (100%, lowest plays off 0)'
  },
  stroke_play: {
    displayName: 'Stroke Play', 
    description: 'Tournament format with 95% handicap allowance'
  },
  none: {
    displayName: 'Scratch Golf',
    description: 'No handicap - pure skill competition'
  },
  random: {
    displayName: 'Lucky Draw',
    description: 'Fair handicaps (95%) with controlled random distribution'
  },
  ghost: {
    displayName: 'Ghost Mode',
    description: 'Compete against historical performances'
  }
};

const SCORING_METHODS = {
  stroke_play: {
    displayName: 'Stroke Play',
    description: 'Lowest total score wins'
  },
  match_play: {
    displayName: 'Match Play',
    description: 'Points for winning each hole'
  },
  stableford: {
    displayName: 'Stableford',
    description: 'Points based on score vs par'
  },
  skins: {
    displayName: 'Skins Game',
    description: 'Winner takes all on each hole'
  }
};

const CreateGameCustom: React.FC = () => {
  const history = useHistory();
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [description, setDescription] = useState('');
  const [showGameTypeModal, setShowGameTypeModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  
  // Custom game configuration
  const [handicapType, setHandicapType] = useState<string>('match_play');
  const [scoringMethod, setScoringMethod] = useState<string>('match_play');
  const [numberOfHoles, setNumberOfHoles] = useState<number>(18);
  
  
  // Data

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-select stroke_play scoring when ghost mode is selected
  useEffect(() => {
    if (handicapType === 'ghost') {
      setScoringMethod('stroke_play');
    }
  }, [handicapType]);


  const loadInitialData = async () => {
    try {
      // Load courses
      const coursesData = await dataService.courses.getAllCourses();
      if (coursesData && coursesData.length > 0) {
        // Just set the first course as default, no need to store all courses
        setCourseId(coursesData[0].id);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
    }
  };




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
    
    if (handicapType === 'ghost') {
      // Navigate to ghost configuration page
      history.push('/game/ghost-config', {
        gameData: {
          description,
          courseId,
          weather,
          handicapType,
          scoringMethod,
          numberOfHoles: 18, // Ghost mode always uses 18 holes
          includeHandicap: true, // Ghost mode always includes handicap
          isCustomGame: true
        }
      });
    } else {
      // Navigate to participant selection for normal games
      history.push('/game/add-participants', {
        gameData: {
          description,
          courseId,
          weather,
          handicapType,
          scoringMethod,
          numberOfHoles,
          includeHandicap: handicapType !== 'none',
          isCustomGame: true
        }
      });
    }
  };

  const gameTypeInfo = GAME_TYPES[handicapType as keyof typeof GAME_TYPES] || GAME_TYPES.match_play;
  const scoringMethodInfo = SCORING_METHODS[scoringMethod as keyof typeof SCORING_METHODS] || SCORING_METHODS.match_play;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Create Custom Game</IonTitle>
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

        {/* Number of Holes Section - Only for non-ghost games */}
        {handicapType !== 'ghost' && (
          <div style={{ paddingTop: '24px' }}>
            <div style={{ padding: '0 16px', marginBottom: '4px' }}>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--ion-color-medium)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 2px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>NUMBER OF HOLES</span>
                <span style={{
                  color: 'var(--ion-color-primary)',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {numberOfHoles}
                </span>
              </h3>
              <div style={{ padding: '0', margin: '0' }}>
                <IonNote color="medium" style={{ fontSize: '12px' }}>
                  {numberOfHoles <= 9 ? 'Quick Round' : numberOfHoles === 18 ? 'Full Round' : 'Custom Round'}
                </IonNote>
              </div>
            </div>
            <IonItem lines="full">
              <IonRange
                value={numberOfHoles}
                min={1}
                max={18}
                step={1}
                onIonChange={e => setNumberOfHoles(e.detail.value as number)}
                snaps={true}
              />
            </IonItem>
          </div>
        )}

        {/* Game Type Section */}
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
              <span>GAME TYPE</span>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowGameTypeModal(true)}
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
            {Object.entries(GAME_TYPES).map(([key, info]) => (
              <IonItem key={key} lines="inset" button detail={false} onClick={() => setHandicapType(key)}>
                <IonLabel>
                  <div>{info.displayName}</div>
                  <IonNote style={{ fontSize: '11px', lineHeight: '1.3' }}>{info.description}</IonNote>
                </IonLabel>
                <IonRadio slot="end" value={key} />
              </IonItem>
            ))}
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
                onClick={() => !handicapType || handicapType !== 'ghost' ? setShowScoringModal(true) : null}
                disabled={handicapType === 'ghost'}
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
                    color: handicapType === 'ghost' ? 'var(--ion-color-medium)' : 'var(--ion-color-primary)'
                  }}
                />
              </IonButton>
            </h3>
            {handicapType === 'ghost' && (
              <IonNote style={{ fontSize: '12px', display: 'block', padding: '0 0 8px 0' }}>
                Ghost mode uses stroke play scoring
              </IonNote>
            )}
          </div>
          <IonRadioGroup value={scoringMethod}>
            {Object.entries(SCORING_METHODS).map(([key, info]) => (
              <IonItem 
                key={key} 
                lines="inset" 
                button={handicapType !== 'ghost'}
                detail={false} 
                onClick={() => handicapType !== 'ghost' ? setScoringMethod(key) : null}
                disabled={handicapType === 'ghost'}
                style={{
                  opacity: handicapType === 'ghost' ? 0.5 : 1,
                  pointerEvents: handicapType === 'ghost' ? 'none' : 'auto'
                }}
              >
                <IonLabel>
                  <div>{info.displayName}</div>
                  <IonNote style={{ fontSize: '11px', lineHeight: '1.3' }}>{info.description}</IonNote>
                </IonLabel>
                <IonRadio slot="end" value={key} disabled={handicapType === 'ghost'} />
              </IonItem>
            ))}
          </IonRadioGroup>
        </div>



        {/* Configuration Summary Buttons */}
        <div style={{ paddingTop: '24px', paddingLeft: '16px', paddingRight: '16px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '6px',
            marginBottom: '16px'
          }}>
            {/* Game Type Button */}
            <div style={{
              backgroundColor: 'var(--ion-color-light)',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              border: '1px solid var(--ion-color-medium-tint)',
              flex: 1
            }}>
              <div style={{ fontSize: '10px', color: 'var(--ion-color-medium)', textTransform: 'uppercase', fontWeight: '600' }}>TYPE</div>
              <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>{gameTypeInfo.displayName.split(' ')[0]}</div>
            </div>

            {/* Scoring Method Button */}
            <div style={{
              backgroundColor: 'var(--ion-color-light)',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              border: '1px solid var(--ion-color-medium-tint)',
              flex: 1
            }}>
              <div style={{ fontSize: '10px', color: 'var(--ion-color-medium)', textTransform: 'uppercase', fontWeight: '600' }}>SCORING</div>
              <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>{scoringMethodInfo.displayName.split(' ')[0]}</div>
            </div>

            {/* Holes Button */}
            <div style={{
              backgroundColor: (handicapType === 'ghost' ? 18 : numberOfHoles) !== 9 && (handicapType === 'ghost' ? 18 : numberOfHoles) !== 18 ? '#FFE5B4' : 'var(--ion-color-light)',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              border: `1px solid ${(handicapType === 'ghost' ? 18 : numberOfHoles) !== 9 && (handicapType === 'ghost' ? 18 : numberOfHoles) !== 18 ? '#FFB366' : 'var(--ion-color-medium-tint)'}`,
              flex: 1
            }}>
              <div style={{ 
                fontSize: '10px', 
                color: (handicapType === 'ghost' ? 18 : numberOfHoles) !== 9 && (handicapType === 'ghost' ? 18 : numberOfHoles) !== 18 ? '#B8690A' : 'var(--ion-color-medium)', 
                textTransform: 'uppercase', 
                fontWeight: '600' 
              }}>HOLES</div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                marginTop: '2px',
                color: (handicapType === 'ghost' ? 18 : numberOfHoles) !== 9 && (handicapType === 'ghost' ? 18 : numberOfHoles) !== 18 ? '#B8690A' : 'inherit'
              }}>
                {handicapType === 'ghost' ? 18 : numberOfHoles}
              </div>
            </div>

            {/* Handicaps Button */}
            <div style={{
              backgroundColor: handicapType === 'none' ? '#FFE5B4' : 'var(--ion-color-light)',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              border: `1px solid ${handicapType === 'none' ? '#FFB366' : 'var(--ion-color-medium-tint)'}`,
              flex: 1
            }}>
              <div style={{ 
                fontSize: '10px', 
                color: handicapType === 'none' ? '#B8690A' : 'var(--ion-color-medium)', 
                textTransform: 'uppercase', 
                fontWeight: '600' 
              }}>HANDICAPS</div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                marginTop: '2px',
                color: handicapType === 'none' ? '#B8690A' : 'inherit'
              }}>{handicapType !== 'none' ? 'Yes' : 'No'}</div>
            </div>
          </div>
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
          marginTop: '20px'
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
            {loading ? <IonSpinner name="crescent" /> : 
              handicapType === 'ghost' ? 'Configure Ghost →' : 'Add Participants →'
            }
          </IonButton>
        </div>
      </IonContent>
      
      {/* Game Type Modal */}
      <GameRulesModal
        isOpen={showGameTypeModal}
        onDismiss={() => setShowGameTypeModal(false)}
        mode="handicap"
        initialSelection={handicapType}
      />
      
      {/* Scoring Method Modal */}
      <GameRulesModal
        isOpen={showScoringModal}
        onDismiss={() => setShowScoringModal(false)}
        mode="scoring"
        initialSelection={scoringMethod}
      />
    </IonPage>
  );
};

export default CreateGameCustom;
import React from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon
} from '@ionic/react';
import { 
  playCircleOutline,
  trophyOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import LiveMatchCard from '../features/normal-game/components/LiveMatchCard';

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px'
        }}>
          {/* Live Games Section */}
          <div style={{ flexShrink: 0 }}>
            <LiveMatchCard />
          </div>
          
          {/* Spacer to push buttons to bottom */}
          <div style={{ flex: 1 }} />
          
          {/* Game Buttons Container - Bottom of screen for thumb reach */}
          <div style={{
            width: '100%',
            maxWidth: '380px',
            margin: '0 auto',
            paddingBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Normal Game Button */}
              <IonButton
                expand="block"
                size="default"
                onClick={() => history.push('/game/create')}
                style={{
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  '--background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '--background-activated': 'linear-gradient(135deg, #5a67d8 0%, #6b4299 100%)',
                  '--border-radius': '12px',
                  letterSpacing: '0.5px'
                }}
              >
                <IonIcon icon={playCircleOutline} slot="start" style={{ fontSize: '20px' }} />
                Normal Game
              </IonButton>

              {/* Ranked Game Button */}
              <IonButton
                expand="block"
                size="default"
                fill="outline"
                disabled={true}
                style={{
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  '--border-radius': '12px',
                  '--border-width': '2px',
                  '--border-color': 'var(--ion-color-medium-tint)',
                  letterSpacing: '0.5px',
                  position: 'relative'
                }}
              >
                <IonIcon icon={trophyOutline} slot="start" style={{ fontSize: '20px' }} />
                Ranked Game
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '16px',
                  background: 'var(--ion-color-warning)',
                  color: 'white',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px'
                }}>
                  SOON
                </span>
              </IonButton>
            </div>
            
            {/* App Title and Version */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: '300',
                letterSpacing: '2px',
                margin: '0',
                color: 'var(--ion-color-medium)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                GOLF X
              </h2>
              <p style={{
                fontSize: '9px',
                color: 'var(--ion-color-medium-shade)',
                marginTop: '2px',
                letterSpacing: '0.8px',
                opacity: 0.7
              }}>
                TRACK YOUR GAME
              </p>
              <p style={{
                fontSize: '9px',
                color: 'var(--ion-color-medium-shade)',
                marginTop: '8px',
                opacity: 0.4
              }}>
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
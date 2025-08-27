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

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          position: 'relative',
          paddingBottom: '40px'
        }}>
          {/* Game Buttons Container - Lower portion */}
          <div style={{
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '80px'
          }}>
              {/* Normal Game Button */}
              <IonButton
                expand="block"
                size="large"
                onClick={() => history.push('/game/create')}
                style={{
                  height: '60px',
                  fontSize: '18px',
                  fontWeight: '600',
                  '--background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '--background-activated': 'linear-gradient(135deg, #5a67d8 0%, #6b4299 100%)',
                  '--border-radius': '12px',
                  letterSpacing: '0.5px'
                }}
              >
                <IonIcon icon={playCircleOutline} slot="start" style={{ fontSize: '24px' }} />
                Normal Game
              </IonButton>

              {/* Ranked Game Button */}
              <IonButton
                expand="block"
                size="large"
                fill="outline"
                disabled={true}
                style={{
                  height: '60px',
                  fontSize: '18px',
                  fontWeight: '600',
                  '--border-radius': '12px',
                  '--border-width': '2px',
                  '--border-color': 'var(--ion-color-medium-tint)',
                  letterSpacing: '0.5px',
                  position: 'relative'
                }}
              >
                <IonIcon icon={trophyOutline} slot="start" style={{ fontSize: '24px' }} />
                Ranked Game
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  background: 'var(--ion-color-warning)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}>
                  SOON
                </span>
              </IonButton>
          </div>

          {/* Bottom Section - App Title and Version */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '300',
              letterSpacing: '3px',
              margin: '0',
              color: 'var(--ion-color-medium)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              GOLF X
            </h2>
            <p style={{
              fontSize: '11px',
              color: 'var(--ion-color-medium-shade)',
              marginTop: '4px',
              letterSpacing: '1px',
              opacity: 0.8
            }}>
              TRACK YOUR GAME
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--ion-color-medium-shade)',
              marginTop: '12px',
              opacity: 0.5
            }}>
              v1.0.0
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
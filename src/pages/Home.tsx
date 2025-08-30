import React from 'react';
import {
  IonContent,
  IonPage,
  IonButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import LiveMatchCard from '../features/normal-game/components/LiveMatchCard';
import '../styles/golf_style.css';

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
              {/* Start Game Button - Simple Green */}
              <IonButton
                expand="block"
                size="default"
                onClick={() => history.push('/game/create-custom')}
                style={{
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  '--background': '#2a5434',
                  '--background-activated': '#3d7c47',
                  '--background-hover': '#3d7c47',
                  '--border-radius': '12px',
                  letterSpacing: '0.5px'
                }}
              >
                Start Game
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
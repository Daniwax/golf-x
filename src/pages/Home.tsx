import React from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonIcon
} from '@ionic/react';
import { 
  trophyOutline, 
  gameControllerOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen style={{ 
        '--background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100%',
          padding: '20px'
        }}>
          {/* Game Mode Selection - Clean Gaming Interface */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            maxWidth: '400px'
          }}>
            {/* Casual Game Button */}
            <IonCard style={{
              borderRadius: '16px',
              overflow: 'hidden',
              margin: 0,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div 
                onClick={() => history.push('/game/casual')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <IonIcon 
                  icon={gameControllerOutline} 
                  style={{ 
                    fontSize: '64px', 
                    color: 'white',
                    marginBottom: '16px'
                  }} 
                />
                <h2 style={{ 
                  color: 'white', 
                  margin: '0',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}>
                  Casual Game
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  marginTop: '8px',
                  fontSize: '14px'
                }}>
                  Play for fun and practice
                </p>
              </div>
            </IonCard>

            {/* Ranked Game Button - Disabled */}
            <IonCard style={{
              borderRadius: '16px',
              overflow: 'hidden',
              margin: 0,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #a8a8a8 0%, #6b6b6b 100%)',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'not-allowed',
                opacity: 0.7
              }}>
                <IonIcon 
                  icon={lockClosedOutline} 
                  style={{ 
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    fontSize: '24px',
                    color: 'rgba(255,255,255,0.7)'
                  }}
                />
                <IonIcon 
                  icon={trophyOutline} 
                  style={{ 
                    fontSize: '64px', 
                    color: 'white',
                    marginBottom: '16px'
                  }} 
                />
                <h2 style={{ 
                  color: 'white', 
                  margin: '0',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}>
                  Ranked Game
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  marginTop: '8px',
                  fontSize: '14px'
                }}>
                  Coming Soon
                </p>
              </div>
            </IonCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
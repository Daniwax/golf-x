import React from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonButton
} from '@ionic/react';
import { constructOutline, alertCircleOutline } from 'ionicons/icons';

const ConfigError: React.FC = () => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <IonCard style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <IonCardHeader>
              <IonIcon 
                icon={constructOutline} 
                style={{ 
                  fontSize: '64px', 
                  color: 'var(--ion-color-warning)',
                  animation: 'pulse 2s infinite'
                }}
              />
              <IonCardTitle style={{ fontSize: '24px', marginTop: '16px' }}>
                We're Setting Things Up!
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                🏌️ Our golf course is being prepared...
              </p>
              
              <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px' }}>
                Golf X is currently being configured. 
                Please check back in a few moments while we get everything ready for you.
              </p>

              {isDevelopment && (
                <div style={{ 
                  background: 'var(--ion-color-light)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginTop: '20px',
                  textAlign: 'left'
                }}>
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'var(--ion-color-danger)',
                    fontFamily: 'monospace',
                    margin: '0 0 8px 0'
                  }}>
                    <IonIcon icon={alertCircleOutline} /> Developer Info:
                  </p>
                  <p style={{ fontSize: '11px', fontFamily: 'monospace', margin: '4px 0' }}>
                    Missing environment variables:
                  </p>
                  <ul style={{ fontSize: '11px', fontFamily: 'monospace', margin: '4px 0' }}>
                    {!import.meta.env.VITE_SUPABASE_URL && <li>VITE_SUPABASE_URL</li>}
                    {!import.meta.env.VITE_SUPABASE_ANON_KEY && <li>VITE_SUPABASE_ANON_KEY</li>}
                  </ul>
                </div>
              )}

              <IonButton 
                expand="block" 
                fill="outline"
                style={{ marginTop: '24px' }}
                onClick={() => window.location.reload()}
              >
                Try Again
              </IonButton>
            </IonCardContent>
          </IonCard>

          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfigError;
import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonText,
  IonToast
} from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { signInWithGoogle, loading } = useAuth();
  const history = useHistory();

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    
    if (error) {
      setToastMessage(error.message);
      setShowToast(true);
    } else {
      history.replace('/home');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 20px'
        }}>
          {/* Top Section with Logo and App Name */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '20%'
          }}>
            {/* App Icon */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #2DD4BF 0%, #0EA5E9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 10px 40px rgba(45, 212, 191, 0.3)'
            }}>
              <IonText style={{ 
                fontSize: '48px', 
                fontWeight: 'bold',
                color: 'white'
              }}>
                GX
              </IonText>
            </div>

            {/* App Name */}
            <IonText style={{
              fontSize: '32px',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--ion-text-color)'
            }}>
              Golf X
            </IonText>

            {/* Tagline */}
            <IonText color="medium" style={{
              fontSize: '17px',
              fontWeight: '400'
            }}>
              Track your game, improve your score
            </IonText>
          </div>

          {/* Bottom Section with Sign In */}
          <div style={{
            paddingBottom: '40px'
          }}>
            {/* Welcome Text */}
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <IonText style={{
                fontSize: '22px',
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px',
                color: 'var(--ion-text-color)'
              }}>
                Welcome
              </IonText>
              <IonText color="medium" style={{
                fontSize: '15px'
              }}>
                Sign in to continue
              </IonText>
            </div>

            {/* Google Sign In Button */}
            <IonButton
              expand="block"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                '--background': '#ffffff',
                '--color': '#000000',
                '--border-radius': '12px',
                height: '56px',
                fontSize: '17px',
                fontWeight: '600',
                marginBottom: '16px',
                '--box-shadow': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
              }}
              mode="ios"
            >
              <IonIcon slot="start" icon={logoGoogle} style={{ marginRight: '12px' }} />
              Continue with Google
            </IonButton>

            {/* Privacy Text */}
            <IonText color="medium" style={{
              fontSize: '12px',
              textAlign: 'center',
              display: 'block',
              marginTop: '24px',
              paddingHorizontal: '20px',
              lineHeight: '18px'
            }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </IonText>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonIcon,
  IonSpinner,
  IonToast,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { mailOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { useHistory } from 'react-router-dom';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');
  const { signUp, loading } = useAuth();
  const history = useHistory();

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setToastMessage('Please fill in all fields');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (password !== confirmPassword) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (password.length < 6) {
      setToastMessage('Password must be at least 6 characters');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    const { data, error } = await signUp(email, password, fullName);
    
    if (error) {
      setToastMessage(error.message);
      setToastColor('danger');
      setShowToast(true);
    } else {
      setToastMessage('Account created successfully! Please check your email to verify your account.');
      setToastColor('success');
      setShowToast(true);
      setTimeout(() => {
        history.replace('/login');
      }, 2000);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Create Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          paddingTop: '40px'
        }}>
          {/* Signup Card */}
          <IonCard style={{ width: '100%', maxWidth: '400px' }}>
            <IonCardHeader>
              <IonCardTitle>Join Golf X</IonCardTitle>
              <IonText color="medium">
                Create your account to start tracking your golf game
              </IonText>
            </IonCardHeader>
            
            <IonCardContent>
              <IonItem>
                <IonIcon icon={personOutline} slot="start" />
                <IonLabel position="stacked">Full Name</IonLabel>
                <IonInput
                  type="text"
                  value={fullName}
                  placeholder="Enter your full name"
                  onIonInput={(e) => setFullName(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={mailOutline} slot="start" />
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onIonInput={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={lockClosedOutline} slot="start" />
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  placeholder="Create a password (min 6 characters)"
                  onIonInput={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={lockClosedOutline} slot="start" />
                <IonLabel position="stacked">Confirm Password</IonLabel>
                <IonInput
                  type="password"
                  value={confirmPassword}
                  placeholder="Confirm your password"
                  onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                />
              </IonItem>

              <IonButton
                expand="block"
                fill="solid"
                style={{ marginTop: '24px' }}
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? <IonSpinner name="crescent" /> : 'Create Account'}
              </IonButton>

              <div style={{ 
                textAlign: 'center', 
                marginTop: '24px' 
              }}>
                <IonText color="medium" style={{ fontSize: '14px' }}>
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={toastColor === 'success' ? 3000 : 3000}
            color={toastColor}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
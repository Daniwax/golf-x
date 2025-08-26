import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonAvatar,
  IonActionSheet,
  IonToast,
  IonSpinner,
  IonList,
  IonItemDivider,
  IonNote,
  IonToggle,
  IonRange
} from '@ionic/react';
import { 
  cameraOutline,
  createOutline,
  logOutOutline,
  golfOutline,
  locationOutline,
  trophyOutline,
  statsChartOutline,
  notificationsOutline,
  moonOutline,
  helpCircleOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { useHistory } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email] = useState(user?.email || '');
  const [handicap, setHandicap] = useState(12.5);
  const [homeCourse, setHomeCourse] = useState('Pebble Beach Golf Links');
  const [bio, setBio] = useState('Passionate golfer working to improve my game. Love playing different courses and meeting new people on the course.');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    if (error) {
      setToastMessage('Error signing out');
      setShowToast(true);
    } else {
      history.replace('/login');
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setToastMessage('Profile updated successfully');
    setShowToast(true);
    setLoading(false);
  };

  const golfingStats = [
    { label: 'Rounds Played', value: '42', icon: golfOutline, color: 'primary' },
    { label: 'Best Score', value: '78', icon: trophyOutline, color: 'success' },
    { label: 'Average Score', value: '85.2', icon: statsChartOutline, color: 'secondary' },
    { label: 'Handicap Index', value: handicap.toString(), icon: golfOutline, color: 'warning' }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
          {!isEditing ? (
            <IonButton
              fill="clear"
              slot="end"
              onClick={() => setIsEditing(true)}
            >
              <IonIcon icon={createOutline} />
            </IonButton>
          ) : (
            <>
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => setIsEditing(false)}
                color="medium"
              >
                Cancel
              </IonButton>
            </>
          )}
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {/* Profile Header Card */}
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', paddingTop: '32px' }}>
              <IonAvatar style={{ 
                width: '120px', 
                height: '120px', 
                margin: '0 auto 16px auto',
                position: 'relative'
              }}>
                <div style={{ 
                  background: 'var(--ion-color-primary)',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {fullName?.[0] || email?.[0] || 'G'}
                </div>
                {isEditing && (
                  <IonButton
                    fill="solid"
                    size="small"
                    style={{
                      position: 'absolute',
                      bottom: '-8px',
                      right: '-8px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%'
                    }}
                    onClick={() => setShowActionSheet(true)}
                  >
                    <IonIcon icon={cameraOutline} style={{ fontSize: '18px' }} />
                  </IonButton>
                )}
              </IonAvatar>

              {isEditing ? (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Full Name</IonLabel>
                    <IonInput
                      value={fullName}
                      placeholder="Enter your full name"
                      onIonInput={(e) => setFullName(e.detail.value!)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Bio</IonLabel>
                    <IonTextarea
                      value={bio}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      onIonInput={(e) => setBio(e.detail.value!)}
                    />
                  </IonItem>
                  <IonButton
                    expand="block"
                    fill="solid"
                    onClick={handleSaveProfile}
                    disabled={loading}
                    style={{ marginTop: '16px' }}
                  >
                    {loading ? <IonSpinner name="crescent" /> : 'Save Changes'}
                  </IonButton>
                </>
              ) : (
                <>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
                    {fullName || 'Golf Enthusiast'}
                  </h2>
                  <IonNote color="medium" style={{ fontSize: '16px' }}>
                    {email}
                  </IonNote>
                  <p style={{ 
                    margin: '16px 0 0 0', 
                    color: 'var(--ion-color-medium)',
                    lineHeight: '1.4'
                  }}>
                    {bio}
                  </p>
                </>
              )}
            </IonCardContent>
          </IonCard>

          {/* Golf Stats */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Golf Statistics</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px' 
              }}>
                {golfingStats.map((stat, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <IonIcon 
                      icon={stat.icon} 
                      style={{ 
                        fontSize: '32px', 
                        color: `var(--ion-color-${stat.color})`,
                        marginBottom: '8px'
                      }}
                    />
                    <h3 style={{ margin: '0', fontSize: '20px' }}>
                      {stat.value}
                    </h3>
                    <IonNote color="medium" style={{ fontSize: '12px' }}>
                      {stat.label}
                    </IonNote>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Golf Details */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Golf Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              {isEditing ? (
                <>
                  <IonItem>
                    <IonIcon icon={golfOutline} slot="start" />
                    <IonLabel position="stacked">Handicap Index</IonLabel>
                    <IonRange
                      value={handicap}
                      min={0}
                      max={36}
                      step={0.1}
                      snaps={true}
                      pin={true}
                      onIonInput={(e) => setHandicap(e.detail.value as number)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonIcon icon={locationOutline} slot="start" />
                    <IonLabel position="stacked">Home Course</IonLabel>
                    <IonInput
                      value={homeCourse}
                      placeholder="Enter your home course"
                      onIonInput={(e) => setHomeCourse(e.detail.value!)}
                    />
                  </IonItem>
                </>
              ) : (
                <>
                  <IonItem>
                    <IonIcon icon={golfOutline} slot="start" />
                    <IonLabel>
                      <h3>Handicap Index</h3>
                      <p>{handicap}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon icon={locationOutline} slot="start" />
                    <IonLabel>
                      <h3>Home Course</h3>
                      <p>{homeCourse}</p>
                    </IonLabel>
                  </IonItem>
                </>
              )}
            </IonCardContent>
          </IonCard>

          {/* Settings */}
          <IonList>
            <IonItemDivider>
              <IonLabel>Settings</IonLabel>
            </IonItemDivider>
            
            <IonItem>
              <IonIcon icon={notificationsOutline} slot="start" />
              <IonLabel>Push Notifications</IonLabel>
              <IonToggle
                checked={notifications}
                onIonChange={(e) => setNotifications(e.detail.checked)}
              />
            </IonItem>
            
            <IonItem>
              <IonIcon icon={moonOutline} slot="start" />
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle
                checked={darkMode}
                onIonChange={(e) => setDarkMode(e.detail.checked)}
              />
            </IonItem>
            
            <IonItem button>
              <IonIcon icon={shieldCheckmarkOutline} slot="start" />
              <IonLabel>Privacy & Security</IonLabel>
            </IonItem>
            
            <IonItem button>
              <IonIcon icon={helpCircleOutline} slot="start" />
              <IonLabel>Help & Support</IonLabel>
            </IonItem>
            
            <IonItem button onClick={handleSignOut} disabled={loading}>
              <IonIcon icon={logOutOutline} slot="start" color="danger" />
              <IonLabel color="danger">
                {loading ? 'Signing Out...' : 'Sign Out'}
              </IonLabel>
            </IonItem>
          </IonList>
        </div>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          cssClass="my-custom-class"
          buttons={[
            {
              text: 'Take Photo',
              icon: cameraOutline,
              handler: () => {
                // Photo capture functionality to be implemented
              }
            },
            {
              text: 'Choose from Gallery',
              icon: 'image-outline',
              handler: () => {
                // Gallery selection functionality to be implemented
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                // Action sheet will close automatically
              }
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
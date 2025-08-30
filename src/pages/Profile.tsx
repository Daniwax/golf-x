/**
 * Profile page v2 - Modularized version using DataService
 * Clean separation of concerns with reusable components
 */

import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonToggle,
  IonToast,
  IonSpinner,
  IonNote
} from '@ionic/react';
import { 
  logOutOutline,
  golfOutline,
  statsChartOutline,
  notificationsOutline,
  moonOutline,
  helpCircleOutline,
  shieldCheckmarkOutline,
  peopleOutline,
  chevronForwardOutline,
  timeOutline
} from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { useHistory } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { StatsGrid } from '../components/profile/StatsGrid';

const Profile: React.FC = () => {
  const { signOut } = useAuth();
  const history = useHistory();
  
  // Use our new hook for all data
  const {
    profile,
    profileLoading,
    gameStats,
    statsLoading,
    updateProfile
  } = useProfile();

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  // Settings state (local only for now)
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Track when initial load is complete
  useEffect(() => {
    if (!profileLoading && !statsLoading && profile) {
      setHasInitiallyLoaded(true);
    }
  }, [profileLoading, statsLoading, profile]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      setToastMessage('Error signing out');
      setShowToast(true);
      setSigningOut(false);
    } else {
      history.replace('/login');
    }
  };

  const handleSaveProfile = async (updates: any) => {
    const success = await updateProfile(updates);
    if (success) {
      setToastMessage('Profile updated successfully');
      setIsEditing(false);
    } else {
      setToastMessage('Failed to save profile');
    }
    setShowToast(true);
  };

  // Show loading skeleton while initial data loads or hasn't loaded yet
  if (!hasInitiallyLoaded || profileLoading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div style={{ padding: '0' }}>
            {/* Profile Header Skeleton */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '48px 24px 24px',
              borderRadius: '0 0 24px 24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Avatar Skeleton */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
                
                {/* Info Skeleton */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    height: '28px',
                    width: '150px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{
                    height: '20px',
                    width: '200px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: '0.1s'
                  }} />
                  <div style={{
                    height: '18px',
                    width: '120px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: '0.2s'
                  }} />
                </div>
              </div>
            </div>

            {/* Stats Card Skeleton */}
            <IonCard style={{ margin: '16px', borderRadius: '12px' }}>
              <IonCardHeader>
                <div style={{
                  height: '24px',
                  width: '180px',
                  background: '#e0e0e0',
                  borderRadius: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              </IonCardHeader>
              <IonCardContent>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{
                        height: '32px',
                        width: '60px',
                        background: '#e0e0e0',
                        borderRadius: '8px',
                        margin: '0 auto 8px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`
                      }} />
                      <div style={{
                        height: '16px',
                        width: '80px',
                        background: '#f0f0f0',
                        borderRadius: '6px',
                        margin: '0 auto',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`
                      }} />
                    </div>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>

            {/* Navigation Items Skeleton */}
            <IonCard style={{ margin: '16px', borderRadius: '12px' }}>
              <IonCardContent style={{ padding: '0' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: '20px',
                        width: '120px',
                        background: '#e0e0e0',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`
                      }} />
                      <div style={{
                        height: '16px',
                        width: '200px',
                        background: '#f0f0f0',
                        borderRadius: '6px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1 + 0.05}s`
                      }} />
                    </div>
                  </div>
                ))}
              </IonCardContent>
            </IonCard>

            {/* Settings Card Skeleton */}
            <IonCard style={{ margin: '16px', borderRadius: '12px' }}>
              <IonCardHeader>
                <div style={{
                  height: '24px',
                  width: '100px',
                  background: '#e0e0e0',
                  borderRadius: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              </IonCardHeader>
              <IonCardContent style={{ padding: '0' }}>
                {[1, 2].map(i => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#e0e0e0',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`
                      }} />
                      <div style={{
                        height: '18px',
                        width: '100px',
                        background: '#e0e0e0',
                        borderRadius: '6px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`
                      }} />
                    </div>
                    <div style={{
                      width: '48px',
                      height: '24px',
                      borderRadius: '12px',
                      background: '#f0f0f0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`
                    }} />
                  </div>
                ))}
              </IonCardContent>
            </IonCard>

            <style>{`
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.5;
                }
              }
            `}</style>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Career stats for the stats card
  const careerStats = [
    { 
      value: statsLoading ? '...' : (gameStats.totalGamesPlayed || 0), 
      label: 'Total Rounds',
      color: 'var(--ion-color-primary)'
    },
    { 
      value: statsLoading ? '...' : (gameStats.bestScore !== null ? gameStats.bestScore : '-'), 
      label: 'Best Round',
      color: 'var(--ion-color-success)'
    },
    { 
      value: statsLoading ? '...' : (gameStats.averageScore !== null ? gameStats.averageScore.toFixed(1) : '-'), 
      label: 'Average',
      color: 'var(--ion-color-warning)'
    }
  ];

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ padding: '0' }}>
          {/* Version indicator - small + in top corner */}
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(102, 126, 234, 0.9)',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            zIndex: 9999,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            +
          </div>
          
          {/* Profile Header - Now a clean component */}
          <ProfileHeader
            profile={profile}
            gameStats={gameStats}
            isEditing={isEditing}
            onEditToggle={setIsEditing}
            onSave={handleSaveProfile}
            statsLoading={statsLoading}
          />

          {/* Career Statistics - Using StatsGrid component */}
          <IonCard button onClick={() => history.push('/stats')} style={{ margin: '0 0 16px 0', borderRadius: '0px' }}>
            <IonCardHeader style={{ paddingBottom: '8px' }}>
              <IonCardTitle style={{ 
                fontSize: '18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={statsChartOutline} color="primary" />
                  Career Statistics
                </span>
                <IonIcon icon={chevronForwardOutline} color="medium" />
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <StatsGrid 
                stats={careerStats}
                columns={3}
                size="medium"
                loading={statsLoading}
                style={{ marginBottom: '16px' }}
              />
              <IonNote style={{ fontSize: '13px', display: 'block' }}>
                View detailed performance analytics and hole-by-hole statistics
              </IonNote>
            </IonCardContent>
          </IonCard>

          {/* Navigation Section */}
          <IonCard style={{ margin: '0 0 16px 0', borderRadius: '0px' }}>
            <IonCardContent style={{ padding: '0' }}>
              <NavigationItem
                icon={peopleOutline}
                color="primary"
                title="Friends"
                subtitle="Manage your golf buddies and connections"
                onClick={() => history.push('/friends')}
              />
              <NavigationItem
                icon={timeOutline}
                color="success"
                title="Match History"
                subtitle="View all your completed rounds and matches"
                onClick={() => history.push('/profile/match-history')}
              />
              <NavigationItem
                icon={golfOutline}
                color="warning"
                title="Golf Courses (Original)"
                subtitle="Browse and explore golf courses"
                onClick={() => history.push('/courses')}
              />
            </IonCardContent>
          </IonCard>

          {/* Settings */}
          <IonCard style={{ margin: '0 0 16px 0', borderRadius: '0px' }}>
            <IonCardHeader style={{ paddingBottom: '8px' }}>
              <IonCardTitle style={{ fontSize: '18px' }}>Settings</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ padding: '0' }}>
              <SettingsToggle
                icon={notificationsOutline}
                color="primary"
                label="Push Notifications"
                checked={notifications}
                onChange={setNotifications}
              />
              <SettingsToggle
                icon={moonOutline}
                color="medium"
                label="Dark Mode"
                checked={darkMode}
                onChange={setDarkMode}
              />
              <NavigationItem
                icon={shieldCheckmarkOutline}
                color="success"
                title="Privacy & Security"
                onClick={() => console.log('Privacy')}
              />
              <NavigationItem
                icon={helpCircleOutline}
                color="tertiary"
                title="Help & Support"
                onClick={() => console.log('Help')}
              />
            </IonCardContent>
          </IonCard>

          {/* Sign Out */}
          <IonCard style={{ margin: '0 0 16px 0', borderRadius: '0px' }}>
            <IonCardContent style={{ padding: '0' }}>
              <IonItem button onClick={handleSignOut} disabled={signingOut}>
                <IonIcon icon={logOutOutline} slot="start" color="danger" />
                <IonLabel color="danger">
                  {signingOut ? 'Signing Out...' : 'Sign Out'}
                </IonLabel>
                {signingOut && <IonSpinner slot="end" />}
              </IonItem>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastMessage.includes('success') ? 'success' : 'danger'}
        />
      </IonContent>
    </IonPage>
  );
};

// Reusable navigation item component
const NavigationItem: React.FC<{
  icon: string;
  color: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}> = ({ icon, color, title, subtitle, onClick }) => (
  <IonItem button onClick={onClick}>
    <IonIcon icon={icon} slot="start" color={color} />
    <IonLabel>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </IonLabel>
  </IonItem>
);

// Reusable settings toggle component
const SettingsToggle: React.FC<{
  icon: string;
  color: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ icon, color, label, checked, onChange }) => (
  <IonItem>
    <IonIcon icon={icon} slot="start" color={color} />
    <IonLabel>{label}</IonLabel>
    <IonToggle
      checked={checked}
      onIonChange={(e) => onChange(e.detail.checked)}
      slot="end"
    />
  </IonItem>
);

export default Profile;
/**
 * Profile header component with gradient background
 * Includes avatar, edit mode, and stats display
 */

import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonNote,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonRange,
  IonSpinner
} from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import { AvatarUpload } from '../../features/profile/components/AvatarUpload';
import type { Profile, GameStats } from '../../services/data/types';

interface ProfileHeaderProps {
  profile: Profile | null;
  gameStats: GameStats;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  onSave: (updates: any) => Promise<void>;
  loading?: boolean;
  statsLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  gameStats,
  isEditing,
  onEditToggle,
  onSave,
  loading = false,
  statsLoading = false
}) => {
  // Local state for editing
  const [nickname, setNickname] = React.useState(profile?.full_name || '');
  const [bio, setBio] = React.useState(profile?.bio || '');
  const [handicap, setHandicap] = React.useState(profile?.handicap || 12.5);

  // Update local state when profile changes
  React.useEffect(() => {
    setNickname(profile?.full_name || '');
    setBio(profile?.bio || 'Passionate golfer working to improve my game.');
    setHandicap(profile?.handicap || 12.5);
  }, [profile]);

  const handleSave = async () => {
    await onSave({
      full_name: nickname,
      bio: bio,
      handicap: handicap
    });
    onEditToggle(false);
  };

  return (
    <IonCard style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '0px',
      margin: '0 0 16px 0',
      boxShadow: 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <IonCardContent style={{ 
        textAlign: 'center', 
        paddingTop: '20px', 
        paddingBottom: '16px',
        paddingLeft: '20px',
        paddingRight: '20px',
        position: 'relative'
      }}>
        {/* Edit/Cancel Button */}
        {!isEditing ? (
          <IonButton
            fill="clear"
            onClick={() => onEditToggle(true)}
            style={{ 
              position: 'absolute',
              top: '12px',
              right: '12px',
              '--color': 'rgba(255,255,255,0.9)',
              zIndex: 10
            }}
          >
            <IonIcon icon={createOutline} />
          </IonButton>
        ) : (
          <IonButton
            fill="clear"
            onClick={() => onEditToggle(false)}
            style={{ 
              position: 'absolute',
              top: '12px',
              right: '12px',
              '--color': 'rgba(255,255,255,0.8)',
              zIndex: 10
            }}
          >
            Cancel
          </IonButton>
        )}

        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '-15px',
          width: '50px',
          height: '50px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%'
        }} />

        {/* Avatar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '16px' 
        }}>
          <AvatarUpload
            userId={profile?.id || ''}
            userName={nickname}
            userEmail={profile?.email || ''}
            googleAvatarUrl={profile?.avatar_url}
            customAvatarUrl={profile?.custom_avatar_url}
            size="small"
            editable={isEditing}
            onAvatarChange={(newUrl) => {
              // Handle avatar change
              console.log('Avatar changed:', newUrl);
            }}
          />
        </div>

        {isEditing ? (
          <EditForm
            nickname={nickname}
            bio={bio}
            handicap={handicap}
            onNicknameChange={setNickname}
            onBioChange={setBio}
            onHandicapChange={setHandicap}
            onSave={handleSave}
            loading={loading}
          />
        ) : (
          <ProfileDisplay
            nickname={nickname}
            email={profile?.email || ''}
            bio={bio}
            handicap={handicap}
            gameStats={gameStats}
            statsLoading={statsLoading}
          />
        )}
      </IonCardContent>
    </IonCard>
  );
};

// Edit form component
const EditForm: React.FC<{
  nickname: string;
  bio: string;
  handicap: number;
  onNicknameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onHandicapChange: (value: number) => void;
  onSave: () => void;
  loading: boolean;
}> = ({ nickname, bio, handicap, onNicknameChange, onBioChange, onHandicapChange, onSave, loading }) => (
  <div style={{ 
    background: 'rgba(255,255,255,0.95)', 
    borderRadius: '12px', 
    padding: '20px',
    marginTop: '16px',
    backdropFilter: 'blur(10px)',
    color: '#333'
  }}>
    <IonItem style={{ '--background': 'transparent', '--border-style': 'none', '--padding-start': '0', '--padding-end': '0', marginBottom: '12px' }}>
      <IonLabel position="stacked" style={{ color: '#333', fontWeight: '600', marginBottom: '8px', fontSize: '16px' }}>
        Nickname
      </IonLabel>
      <IonInput
        value={nickname}
        placeholder="What should we call you?"
        onIonInput={(e) => onNicknameChange(e.detail.value!)}
        style={{ '--color': '#333', '--placeholder-color': '#999', fontSize: '18px' }}
      />
    </IonItem>
    
    <IonItem style={{ '--background': 'transparent', '--border-style': 'none', '--padding-start': '0', '--padding-end': '0', marginBottom: '12px' }}>
      <IonLabel position="stacked" style={{ color: '#333', fontWeight: '600', marginBottom: '8px', fontSize: '16px' }}>
        Description
      </IonLabel>
      <IonTextarea
        value={bio}
        placeholder="Tell us about your golf journey..."
        rows={3}
        onIonInput={(e) => onBioChange(e.detail.value!)}
        style={{ 
          '--color': '#333', 
          '--placeholder-color': '#999',
          minHeight: '80px',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '16px'
        }}
      />
    </IonItem>
    
    <IonItem style={{ '--background': 'transparent', '--border-style': 'none', '--padding-start': '0', '--padding-end': '0', marginBottom: '20px' }}>
      <IonLabel position="stacked" style={{ color: '#333', fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>
        Current Handicap: <span style={{ fontSize: '28px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#667eea' }}>
          {handicap.toFixed(1)}
        </span>
      </IonLabel>
      <IonRange
        value={handicap}
        min={0}
        max={36}
        step={0.1}
        snaps={true}
        pin={true}
        onIonInput={(e) => onHandicapChange(e.detail.value as number)}
        style={{ '--bar-background': 'rgba(0,0,0,0.1)', '--bar-background-active': '#667eea', '--pin-background': '#667eea', '--knob-background': '#667eea' }}
      />
    </IonItem>
    
    <IonButton
      expand="block"
      fill="solid"
      onClick={onSave}
      disabled={loading}
      style={{ 
        '--background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '--color': 'white',
        '--border-radius': '12px',
        fontWeight: '600',
        height: '52px',
        fontSize: '18px'
      }}
    >
      {loading ? <IonSpinner name="crescent" /> : 'Save Profile'}
    </IonButton>
  </div>
);

// Profile display component
const ProfileDisplay: React.FC<{
  nickname: string;
  email: string;
  bio: string;
  handicap: number;
  gameStats: GameStats;
  statsLoading: boolean;
}> = ({ nickname, email, bio, handicap, gameStats, statsLoading }) => (
  <>
    <h1 style={{ 
      margin: '0 0 8px 0', 
      fontSize: '28px',
      fontWeight: '700',
      letterSpacing: '-0.5px'
    }}>
      {nickname || 'Golf Enthusiast'}
    </h1>
    <IonNote style={{ 
      color: 'rgba(255,255,255,0.7)', 
      fontSize: '14px',
      display: 'block',
      marginBottom: '16px'
    }}>
      {email}
    </IonNote>
    <p style={{ 
      margin: '0 0 20px 0', 
      color: 'rgba(255,255,255,0.9)',
      lineHeight: '1.5',
      fontSize: '15px'
    }}>
      {bio}
    </p>

    {/* Golf Stats in Header */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '16px',
      padding: '16px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
          {statsLoading ? '...' : (gameStats.totalGamesPlayed || 0)}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Rounds</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
          {handicap.toFixed(1)}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Handicap</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
          {statsLoading ? '...' : (gameStats.bestScore !== null ? gameStats.bestScore : '-')}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Best</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
          {statsLoading ? '...' : (gameStats.averageScore !== null ? gameStats.averageScore.toFixed(1) : '-')}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Average</div>
      </div>
    </div>
  </>
);
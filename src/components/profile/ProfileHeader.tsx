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
  onSave: (updates: { full_name?: string; bio?: string; handicap?: number }) => Promise<void>;
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
    <div className="golf-letter-card" style={{ 
      margin: '16px',
      position: 'relative'
    }}>
      {/* Green Header Bar */}
      <div className="golf-header-bar"></div>
      
      {/* Date in corner */}
      <div className="golf-date-corner">
        Est. {new Date().getFullYear()}
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '20px', 
        paddingBottom: '16px',
        position: 'relative'
      }}>
        {/* Golf X Card Title */}
        <h2 className="golf-letter-heading" style={{ marginBottom: '4px' }}>
          GOLF X
        </h2>
        <div className="golf-signature-line"></div>
        <p className="golf-subheading" style={{ marginBottom: '20px' }}>
          Official Member Card
        </p>

        {/* Edit/Cancel Button */}
        {!isEditing ? (
          <IonButton
            fill="clear"
            onClick={() => onEditToggle(true)}
            style={{ 
              position: 'absolute',
              top: '40px',
              right: '20px',
              '--color': 'var(--golf-green)',
              zIndex: 10,
              fontSize: '12px'
            }}
          >
            <IonIcon icon={createOutline} style={{ fontSize: '18px' }} />
          </IonButton>
        ) : (
          <IonButton
            fill="clear"
            onClick={() => onEditToggle(false)}
            style={{ 
              position: 'absolute',
              top: '40px',
              right: '20px',
              '--color': 'var(--golf-brown)',
              zIndex: 10,
              fontSize: '12px'
            }}
          >
            Cancel
          </IonButton>
        )}

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
            profile={profile}
          />
        )}
      </div>
    </div>
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
  <div className="golf-card" style={{ 
    marginTop: '16px',
    border: '1px solid var(--golf-tan-border)'
  }}>
    <IonItem style={{ '--background': 'transparent', '--border-style': 'none', '--padding-start': '0', '--padding-end': '0', marginBottom: '12px' }}>
      <IonLabel position="stacked" className="golf-section-header" style={{ marginBottom: '8px' }}>
        Nickname
      </IonLabel>
      <IonInput
        value={nickname}
        placeholder="What should we call you?"
        onIonInput={(e) => onNicknameChange(e.detail.value!)}
        style={{ '--color': 'var(--golf-green)', '--placeholder-color': 'var(--golf-brown)', fontSize: '18px', fontFamily: 'Georgia, serif' }}
      />
    </IonItem>
    
    <IonItem style={{ '--background': 'transparent', '--border-style': 'none', '--padding-start': '0', '--padding-end': '0', marginBottom: '12px' }}>
      <IonLabel position="stacked" className="golf-section-header" style={{ marginBottom: '8px' }}>
        Description
      </IonLabel>
      <IonTextarea
        value={bio}
        placeholder="Tell us about your golf journey..."
        rows={3}
        onIonInput={(e) => onBioChange(e.detail.value!)}
        style={{ 
          '--color': 'var(--golf-green)', 
          '--placeholder-color': 'var(--golf-brown)',
          minHeight: '80px',
          background: 'var(--golf-cream)',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '14px',
          fontFamily: 'serif',
          border: '1px solid var(--golf-tan-border)'
        }}
      />
    </IonItem>
    
    <IonItem style={{ '--background': 'transparent', '--border-style': 'none', '--padding-start': '0', '--padding-end': '0', marginBottom: '20px' }}>
      <IonLabel position="stacked" className="golf-section-header" style={{ marginBottom: '12px' }}>
        Current Handicap: <span className="golf-score-net" style={{ fontSize: '28px' }}>
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
        style={{ '--bar-background': 'var(--golf-tan-border)', '--bar-background-active': 'var(--golf-green)', '--pin-background': 'var(--golf-green)', '--knob-background': 'var(--golf-green)' }}
      />
    </IonItem>
    
    <button
      className="golf-button-primary"
      onClick={onSave}
      disabled={loading}
      style={{ 
        width: '100%',
        height: '48px',
        fontSize: '14px'
      }}
    >
      {loading ? <IonSpinner name="crescent" /> : 'SAVE PROFILE'}
    </button>
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
  profile: Profile | null;
}> = ({ nickname, email, bio, handicap, gameStats, statsLoading, profile }) => (
  <>
    {/* Signature Name */}
    <div className="golf-signature" style={{ 
      fontSize: '32px',
      marginBottom: '8px',
      color: 'var(--golf-green)'
    }}>
      {nickname || 'Golf Enthusiast'}
    </div>
    <div className="golf-signature-line" style={{ marginBottom: '12px' }}></div>
    
    <IonNote className="golf-text-detail" style={{ 
      display: 'block',
      marginBottom: '16px',
      fontSize: '11px'
    }}>
      {email}
    </IonNote>
    
    <p className="golf-text-detail" style={{ 
      margin: '0 0 20px 0', 
      lineHeight: '1.5',
      fontSize: '13px',
      fontStyle: 'italic'
    }}>
      {bio}
    </p>

    {/* Golf Stats in Professional Card Style */}
    <div className="golf-divider-horizontal" style={{ margin: '20px 0' }}></div>
    
    <div className="golf-scores-container">
      <div className="golf-score-block">
        <div className="golf-score-label">Games Played</div>
        <div className="golf-score-gross">
          {statsLoading ? '...' : (gameStats.totalGamesPlayed || 0)}
        </div>
      </div>
      
      <div className="golf-divider-vertical"></div>
      
      <div className="golf-score-block">
        <div className="golf-score-label">Handicap</div>
        <div className="golf-score-net">
          {handicap.toFixed(1)}
        </div>
      </div>
    </div>
    
    {/* Signature Section */}
    <div className="golf-signature-section" style={{ marginTop: '20px' }}>
      <p className="golf-text-small" style={{ marginBottom: '8px' }}>Member Since</p>
      <p className="golf-date">
        {profile?.created_at ? 
          new Date(profile.created_at).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          }) : 
          `January ${new Date().getFullYear()}`
        }
      </p>
    </div>
  </>
);
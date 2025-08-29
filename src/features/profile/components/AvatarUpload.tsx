import React, { useState, useRef, useEffect } from 'react';
import {
  IonAvatar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonActionSheet,
  IonToast
} from '@ionic/react';
import { 
  cameraOutline,
  imagesOutline,
  trashOutline,
  closeOutline
} from 'ionicons/icons';
import { avatarService } from '../services/avatarService';

interface AvatarUploadProps {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  googleAvatarUrl?: string | null;
  customAvatarUrl?: string | null;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  onAvatarChange?: (newUrl: string | null) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  userName,
  userEmail,
  googleAvatarUrl,
  customAvatarUrl,
  size = 'medium',
  editable = true,
  onAvatarChange
}) => {
  const [loading, setLoading] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar size mapping
  const sizeMap = {
    small: { width: '60px', height: '60px', fontSize: '24px' },
    medium: { width: '120px', height: '120px', fontSize: '48px' },
    large: { width: '180px', height: '180px', fontSize: '72px' }
  };

  const avatarSize = sizeMap[size];

  useEffect(() => {
    // Priority: custom avatar -> Google avatar -> initials
    setCurrentAvatarUrl(customAvatarUrl || googleAvatarUrl || null);
  }, [customAvatarUrl, googleAvatarUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Please select an image file', 'danger');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      showMessage('Image size must be less than 10MB', 'danger');
      return;
    }

    setLoading(true);
    try {
      // Ensure bucket exists
      // Bucket is created via SQL migration, no need to ensure it exists

      // Upload and compress image
      const newAvatarUrl = await avatarService.uploadAvatar(userId, file);
      
      setCurrentAvatarUrl(newAvatarUrl);
      onAvatarChange?.(newAvatarUrl);
      showMessage('Photo updated successfully', 'success');

      // Clean up old avatars in background
      avatarService.cleanupOldAvatars(userId).catch(console.error);
    } catch (error) {
      console.error('Upload failed:', error);
      showMessage('Failed to upload photo. Please try again.', 'danger');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomAvatar = async () => {
    setLoading(true);
    try {
      await avatarService.removeCustomAvatar(userId);
      setCurrentAvatarUrl(googleAvatarUrl || null);
      onAvatarChange?.(null);
      showMessage('Custom photo removed', 'success');
    } catch (error) {
      console.error('Remove failed:', error);
      showMessage('Failed to remove photo', 'danger');
    } finally {
      setLoading(false);
      setShowActionSheet(false);
    }
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
    setShowActionSheet(false);
  };

  const showMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const getInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail?.[0]?.toUpperCase() || '?';
  };

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <IonAvatar style={avatarSize}>
          {currentAvatarUrl ? (
            <>
              <img 
                src={currentAvatarUrl}
                alt={userName || 'Profile'}
                onError={(e) => {
                  // Hide broken image and show fallback
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling;
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div style={{
                width: '100%',
                height: '100%',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--ion-color-primary)',
                color: 'white',
                fontSize: avatarSize.fontSize,
                fontWeight: 'bold'
              }}>
                {getInitials()}
              </div>
            </>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--ion-color-primary)',
              color: 'white',
              fontSize: avatarSize.fontSize,
              fontWeight: 'bold'
            }}>
              {getInitials()}
            </div>
          )}
        </IonAvatar>

        {editable && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#667eea',
              borderRadius: '50%',
              border: '2px solid white',
              cursor: 'pointer'
            }}
            onClick={() => !loading && setShowActionSheet(true)}
          >
            {loading ? (
              <IonSpinner name="crescent" style={{ width: '24px', height: '24px', '--color': 'white' }} />
            ) : (
              <IonIcon icon={cameraOutline} style={{ fontSize: '24px', color: 'white' }} />
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Action Sheet for photo options */}
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header="Update Profile Photo"
        buttons={[
          {
            text: 'Take Photo',
            icon: cameraOutline,
            handler: openFileInput
          },
          {
            text: 'Choose from Library',
            icon: imagesOutline,
            handler: openFileInput
          },
          ...(customAvatarUrl ? [{
            text: 'Remove Custom Photo',
            icon: trashOutline,
            role: 'destructive' as const,
            handler: handleRemoveCustomAvatar
          }] : []),
          {
            text: 'Cancel',
            icon: closeOutline,
            role: 'cancel' as const
          }
        ]}
      />

      {/* Toast for messages */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        position="bottom"
      />
    </>
  );
};
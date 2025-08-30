import React from 'react';
import { IonChip, IonIcon } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';

export const DevAuthWarning: React.FC = () => {
  const isDev = import.meta.env.DEV && window.location.search.includes('devAuth=true');
  
  if (!isDev) return null;
  
  return (
    <IonChip 
      color="danger" 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 99999,
        fontWeight: 'bold',
        fontSize: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}
    >
      <IonIcon icon={warningOutline} />
      DEV AUTH ACTIVE
    </IonChip>
  );
};
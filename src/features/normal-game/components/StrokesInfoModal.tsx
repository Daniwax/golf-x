import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';
import { closeOutline, golfOutline, flagOutline } from 'ionicons/icons';

interface StrokesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrokesInfoModal: React.FC<StrokesInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Strokes vs. Putts</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Overview */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px' }}>Overview</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                In golf scoring, every action counts as a <strong>stroke</strong>, 
                but putts are tracked separately as a useful statistic. This allows 
                players to analyze performance both overall and specifically on the green.
              </p>
            </IonCardContent>
          </IonCard>

          {/* Strokes */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px' }}>
                <IonIcon icon={golfOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Strokes (Total Shots)
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <IonLabel>
                    <strong>Definition:</strong> Every shot taken, from tee to green.
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Includes:</strong> Drives, approach shots, chips, bunker shots, and putts.
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    On the scorecard, this represents the <strong>total number of strokes</strong> taken on the hole.
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Putts */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px' }}>
                <IonIcon icon={flagOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Putts (Subset of Strokes)
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <IonLabel>
                    <strong>Definition:</strong> Strokes made with the putter while on the green.
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    Putts are <strong>a subset of total strokes</strong>, not an additional category.
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Example:</strong> On a Par 4, if you reach the green in 2 shots and take 2 putts, 
                    the total is 4 strokes (with 2 being putts).
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Usage */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px' }}>Usage in the App</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <IonLabel>
                    <strong>Strokes:</strong> Always required, recorded as total shots.
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <strong>Putts:</strong> Optional entry for tracking on-green performance.
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Quick Summary */}
          <IonCard color="primary">
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px', color: 'white' }}>
                Quick Summary
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ color: 'white' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  • <strong>Strokes</strong> = All shots (including putts)
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  • <strong>Putts</strong> = Only strokes made on the green
                </p>
                <p style={{ margin: 0 }}>
                  • Putts are optional but provide valuable insight
                </p>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default StrokesInfoModal;
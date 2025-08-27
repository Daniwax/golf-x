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
import { closeOutline, flagOutline, trophyOutline, personOutline } from 'ionicons/icons';

interface ScorecardColorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScorecardColorGuideModal: React.FC<ScorecardColorGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scorecard Color Guide</IonTitle>
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
                The scorecard uses colors to help you quickly understand performance on each hole. 
                Colors reflect both <strong>absolute performance</strong> (against course par) and 
                <strong> relative performance</strong> (against your personal par with handicap strokes).
              </p>
            </IonCardContent>
          </IonCard>

          {/* Course Performance */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px' }}>
                <IonIcon icon={trophyOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Course Performance
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <div slot="start" style={{
                    width: '40px',
                    height: '30px',
                    backgroundColor: '#00AA00',
                    borderRadius: '4px',
                    marginRight: '12px'
                  }} />
                  <IonLabel>
                    <strong>Intense Green</strong>
                    <p>Eagle or better (2+ strokes under par)</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <div slot="start" style={{
                    width: '40px',
                    height: '30px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '4px',
                    marginRight: '12px'
                  }} />
                  <IonLabel>
                    <strong>Green</strong>
                    <p>Birdie (1 stroke under par)</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Personal Performance */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px' }}>
                <IonIcon icon={personOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Personal Performance
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <div slot="start" style={{
                    width: '40px',
                    height: '30px',
                    backgroundColor: '#4A90E2',
                    borderRadius: '4px',
                    marginRight: '12px'
                  }} />
                  <IonLabel>
                    <strong>Blue</strong>
                    <p>Better than your personal par (with handicap strokes)</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <div slot="start" style={{
                    width: '40px',
                    height: '30px',
                    backgroundColor: '#2D3748',
                    borderRadius: '4px',
                    marginRight: '12px'
                  }} />
                  <IonLabel>
                    <strong>Black/Dark Gray</strong>
                    <p>Exactly your personal par</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <div slot="start" style={{
                    width: '40px',
                    height: '30px',
                    backgroundColor: '#E53E3E',
                    borderRadius: '4px',
                    marginRight: '12px'
                  }} />
                  <IonLabel>
                    <strong>Red</strong>
                    <p>Over your personal par</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Example */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px' }}>
                <IonIcon icon={flagOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Example
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 12px 0' }}>
                  <strong>Hole: Par 4, you receive 1 handicap stroke</strong><br />
                  Your personal par = 5
                </p>
                <ul style={{ marginLeft: '20px' }}>
                  <li>Score 2 → <span style={{ color: '#00AA00', fontWeight: 'bold' }}>Intense Green</span> (eagle)</li>
                  <li>Score 3 → <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Green</span> (birdie)</li>
                  <li>Score 4 → <span style={{ color: '#4A90E2', fontWeight: 'bold' }}>Blue</span> (beat personal par)</li>
                  <li>Score 5 → <span style={{ fontWeight: 'bold' }}>Black</span> (made personal par)</li>
                  <li>Score 6+ → <span style={{ color: '#E53E3E', fontWeight: 'bold' }}>Red</span> (over personal par)</li>
                </ul>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Quick Summary */}
          <IonCard color="primary">
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '18px', color: 'white' }}>
                Quick Reference
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ color: 'white', fontSize: '14px' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Green shades</strong> = Under course par (great shots!)
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Blue</strong> = Better than expected with your handicap
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Black</strong> = Met your personal par expectation
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Red</strong> = Need improvement on this hole
                </p>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ScorecardColorGuideModal;
import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';
import { closeOutline, trophyOutline, golfOutline } from 'ionicons/icons';
import { scoringFormatRules } from '../data/scoringFormatRules';
import ReactMarkdown from 'react-markdown';
import './ScoringFormatModal.css';

interface ScoringFormatModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  initialFormat?: 'stroke_play' | 'match_play';
}

const ScoringFormatModal: React.FC<ScoringFormatModalProps> = ({ 
  isOpen, 
  onDismiss,
  initialFormat = 'stroke_play'
}) => {
  const [selectedFormat, setSelectedFormat] = React.useState<'stroke_play' | 'match_play'>(initialFormat);

  React.useEffect(() => {
    setSelectedFormat(initialFormat);
  }, [initialFormat]);

  const rules = scoringFormatRules[selectedFormat];

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onDismiss}
      className="scoring-format-modal"
    >
      <IonHeader className="modal-header-glass">
        <IonToolbar color="none">
          <IonTitle>Scoring Format Rules</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss} fill="clear">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        
        <div style={{ padding: '8px 16px 16px' }}>
          <IonSegment 
            value={selectedFormat} 
            onIonChange={e => setSelectedFormat(e.detail.value as 'stroke_play' | 'match_play')}
            className="format-segment"
          >
            <IonSegmentButton value="stroke_play">
              <IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IonIcon icon={golfOutline} style={{ fontSize: '16px' }} />
                  Stroke Play
                </div>
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="match_play">
              <IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IonIcon icon={trophyOutline} style={{ fontSize: '16px' }} />
                  Match Play
                </div>
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
      </IonHeader>

      <IonContent className="ion-padding modal-content-glass">
        <div className="rules-container">
          {/* Format Type Badge */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <IonChip 
              color={selectedFormat === 'stroke_play' ? 'primary' : 'success'}
              className="format-chip-glass"
            >
              <IonIcon icon={selectedFormat === 'stroke_play' ? golfOutline : trophyOutline} />
              <IonLabel>{rules.title}</IonLabel>
            </IonChip>
          </div>

          {/* Main Content Card with Glass Effect */}
          <IonCard className="rules-card-glass">
            <IonCardContent className="markdown-content">
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="md-h1">{children}</h1>,
                  h2: ({children}) => <h2 className="md-h2">{children}</h2>,
                  h3: ({children}) => <h3 className="md-h3">{children}</h3>,
                  p: ({children}) => <p className="md-p">{children}</p>,
                  ul: ({children}) => <ul className="md-ul">{children}</ul>,
                  ol: ({children}) => <ol className="md-ol">{children}</ol>,
                  li: ({children}) => <li className="md-li">{children}</li>,
                  strong: ({children}) => <strong className="md-strong">{children}</strong>,
                  blockquote: ({children}) => (
                    <blockquote className="md-blockquote tiger-quote">
                      <IonIcon icon={trophyOutline} className="quote-icon" />
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="md-hr" />,
                  code: ({children}: {children: React.ReactNode}) => 
                      <code className="md-code-inline">{children}</code>,
                  pre: ({children}: {children: React.ReactNode}) => 
                      <pre className="md-code-block">{children}</pre>
                }}
              >
                {rules.content}
              </ReactMarkdown>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Footer Note */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          padding: '16px'
        }}>
          <IonNote style={{ fontSize: '12px' }}>
            Rules are based on USGA handicap system
          </IonNote>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ScoringFormatModal;
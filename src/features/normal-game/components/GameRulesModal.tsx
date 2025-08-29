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
import { closeOutline, trophyOutline, golfOutline, calculatorOutline, diceOutline } from 'ionicons/icons';
import { handicapTypes, scoringMethods } from '../rules';
import type { HandicapTypeKey, ScoringMethodKey } from '../rules';
import ReactMarkdown from 'react-markdown';
import './ScoringFormatModal.css';

interface GameRulesModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  mode: 'handicap' | 'scoring';
  initialSelection?: string;
}

const GameRulesModal: React.FC<GameRulesModalProps> = ({ 
  isOpen, 
  onDismiss,
  mode,
  initialSelection
}) => {
  // Determine initial selection based on mode
  const getInitialSelection = () => {
    if (mode === 'handicap') {
      return (initialSelection as HandicapTypeKey) || 'match_play';
    } else {
      return (initialSelection as ScoringMethodKey) || 'net_score';
    }
  };

  const [selectedRule, setSelectedRule] = React.useState<string>(getInitialSelection());

  React.useEffect(() => {
    setSelectedRule(getInitialSelection());
  }, [mode, initialSelection]);

  // Get the appropriate rules based on mode
  const rulesCollection = mode === 'handicap' ? handicapTypes : scoringMethods;
  const currentRule = rulesCollection[selectedRule as keyof typeof rulesCollection];

  // Icons for different rule types
  const getIcon = (key: string) => {
    const icons: Record<string, string> = {
      // Handicap icons
      match_play: trophyOutline,
      stroke_play: golfOutline,
      none: calculatorOutline,
      random: diceOutline,
      // Scoring icons
      net_score: calculatorOutline,
      stableford: trophyOutline,
      skins: diceOutline
    };
    return icons[key] || golfOutline;
  };

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onDismiss}
      className="scoring-format-modal"
    >
      <IonHeader className="modal-header-glass">
        <IonToolbar color="none">
          <IonTitle>
            {mode === 'handicap' ? 'Handicap Types' : 'Scoring Methods'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss} fill="clear">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        
        <div style={{ padding: '8px 16px 16px' }}>
          <IonSegment 
            value={selectedRule} 
            onIonChange={e => setSelectedRule(e.detail.value as string)}
            className="format-segment"
            scrollable
          >
            {Object.keys(rulesCollection).map(key => (
              <IonSegmentButton key={key} value={key}>
                <IonLabel>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '13px'
                  }}>
                    <IonIcon 
                      icon={getIcon(key)} 
                      style={{ fontSize: '16px' }} 
                    />
                    <span style={{ whiteSpace: 'nowrap' }}>
                      {rulesCollection[key as keyof typeof rulesCollection].title.replace(' Handicap', '').replace(' Method', '')}
                    </span>
                  </div>
                </IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>
      </IonHeader>

      <IonContent className="ion-padding modal-content-glass">
        <div className="rules-container">
          {/* Format Type Badge */}
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <IonChip 
              color="primary"
              className="format-chip-glass"
            >
              <IonIcon icon={getIcon(selectedRule)} />
              <IonLabel>{currentRule.title}</IonLabel>
            </IonChip>
            <IonNote style={{ fontSize: '14px', textAlign: 'center' }}>
              {currentRule.subtitle}
            </IonNote>
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
                  code: ({children}: {children?: React.ReactNode}) => 
                      <code className="md-code-inline">{children}</code>,
                  pre: ({children}: {children?: React.ReactNode}) => 
                      <pre className="md-code-block">{children}</pre>
                }}
              >
                {currentRule.content}
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
            {mode === 'handicap' 
              ? 'Handicap calculations based on USGA/R&A system'
              : 'Scoring methods follow standard golf rules'
            }
          </IonNote>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default GameRulesModal;
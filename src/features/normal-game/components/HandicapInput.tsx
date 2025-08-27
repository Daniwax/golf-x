import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { addOutline, removeOutline } from 'ionicons/icons';

interface HandicapInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showLabel?: boolean;
}

const HandicapInput: React.FC<HandicapInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 54,
  step = 0.1,
  disabled = false,
  showLabel = false
}) => {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(Math.round(newValue * 10) / 10); // Round to 1 decimal
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(Math.round(newValue * 10) / 10); // Round to 1 decimal
  };

  const formatHandicap = (hcp: number): string => {
    if (hcp < 0) {
      return `+${Math.abs(hcp).toFixed(1)}`;
    }
    return hcp.toFixed(1);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: 'var(--ion-color-light)',
      borderRadius: '12px',
      padding: '4px'
    }}>
      <IonButton
        fill="clear"
        size="small"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        style={{
          '--padding-start': '8px',
          '--padding-end': '8px',
          margin: 0,
          height: '36px',
          width: '36px'
        }}
      >
        <IonIcon icon={removeOutline} style={{ fontSize: '20px' }} />
      </IonButton>
      
      <div style={{
        minWidth: '60px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {showLabel && (
          <div style={{
            fontSize: '8px',
            color: 'var(--ion-color-medium)',
            marginBottom: '2px',
            lineHeight: '1'
          }}>
            Adjust handicap
          </div>
        )}
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          fontFamily: 'monospace',
          lineHeight: '1'
        }}>
          {formatHandicap(value)}
        </div>
      </div>
      
      <IonButton
        fill="clear"
        size="small"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        style={{
          '--padding-start': '8px',
          '--padding-end': '8px',
          margin: 0,
          height: '36px',
          width: '36px'
        }}
      >
        <IonIcon icon={addOutline} style={{ fontSize: '20px' }} />
      </IonButton>
    </div>
  );
};

export default HandicapInput;
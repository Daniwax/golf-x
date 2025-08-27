import React from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonIcon } from '@ionic/react';
import { sunnyOutline, cloudyOutline, rainyOutline, flashOutline } from 'ionicons/icons';
import type { WeatherCondition } from '../types';

interface WeatherSelectorProps {
  value: WeatherCondition;
  onChange: (weather: WeatherCondition) => void;
  disabled?: boolean;
}

const weatherOptions = [
  { value: 'sunny' as WeatherCondition, icon: sunnyOutline, label: 'Sunny' },
  { value: 'partly_cloudy' as WeatherCondition, icon: cloudyOutline, label: 'Cloudy' },
  { value: 'rainy' as WeatherCondition, icon: rainyOutline, label: 'Rain' },
  { value: 'windy' as WeatherCondition, icon: flashOutline, label: 'Windy' }
];

const WeatherSelector: React.FC<WeatherSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  return (
    <IonSegment 
      value={value} 
      onIonChange={e => onChange(e.detail.value as WeatherCondition)}
      disabled={disabled}
    >
      {weatherOptions.map(option => (
        <IonSegmentButton key={option.value} value={option.value}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '4px' 
          }}>
            <IonIcon icon={option.icon} style={{ fontSize: '20px' }} />
            <IonLabel style={{ fontSize: '11px' }}>{option.label}</IonLabel>
          </div>
        </IonSegmentButton>
      ))}
    </IonSegment>
  );
};

export default WeatherSelector;
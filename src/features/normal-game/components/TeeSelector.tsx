import React, { useEffect, useState } from 'react';
import { IonRadioGroup, IonRadio, IonItem, IonLabel, IonSpinner, IonNote } from '@ionic/react';
import { gameService } from '../services/gameService';
import type { TeeBox } from '../types';

interface TeeSelectorProps {
  courseId: number;
  value: number | null;
  onChange: (teeBoxId: number, teeBox: TeeBox) => void;
  disabled?: boolean;
}

// Map tee colors to actual colors for display
const getTeeColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'blue': '#0066cc',
    'white': '#808080',
    'yellow': '#ffcc00',
    'red': '#cc0000',
    'green': '#00cc00',
    'gold': '#ffd700',
    'silver': '#c0c0c0'
  };
  return colorMap[color.toLowerCase()] || '#666666';
};

const TeeSelector: React.FC<TeeSelectorProps> = ({
  courseId,
  value,
  onChange,
  disabled = false
}) => {
  const [teeBoxes, setTeeBoxes] = useState<TeeBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadTeeBoxes();
    }
  }, [courseId]);

  const loadTeeBoxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gameService.getTeeBoxes(courseId);
      setTeeBoxes(data);
      
      // Auto-select middle tee if none selected
      if (data.length > 0 && !value) {
        const middleIndex = Math.floor(data.length / 2);
        const defaultTee = data[middleIndex];
        onChange(defaultTee.id, defaultTee);
      }
    } catch (err) {
      console.error('Error loading tee boxes:', err);
      setError('Failed to load tee boxes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (error) {
    return <IonNote color="danger">{error}</IonNote>;
  }

  if (teeBoxes.length === 0) {
    return <IonNote>No tee boxes available</IonNote>;
  }

  return (
    <IonRadioGroup 
      value={value} 
      onIonChange={e => {
        if (disabled) return; // Prevent changes when disabled
        const teeBox = teeBoxes.find(t => t.id === e.detail.value);
        if (teeBox) {
          onChange(e.detail.value, teeBox);
        }
      }}
    >
      {teeBoxes.map(tee => (
        <IonItem 
          key={tee.id} 
          lines="inset" 
          button={!disabled}
          onClick={() => {
            if (disabled) return;
            const teeBox = teeBoxes.find(t => t.id === tee.id);
            if (teeBox) {
              onChange(tee.id, teeBox);
            }
          }}
          style={{
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          <div
            slot="start"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: getTeeColor(tee.color),
              border: '2px solid var(--ion-color-medium-tint)',
              marginRight: '12px'
            }}
          />
          <IonLabel>
            <h3 style={{ fontWeight: '600' }}>{tee.name}</h3>
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              marginTop: '4px',
              fontSize: '13px',
              color: 'var(--ion-color-medium)'
            }}>
              <span>Slope: {tee.slope}</span>
              <span>Rating: {tee.course_rating}</span>
              {tee.total_distance && <span>{tee.total_distance} {tee.distance_unit || 'yards'}</span>}
            </div>
          </IonLabel>
          <IonRadio 
            slot="end" 
            value={tee.id}
            disabled={disabled}
          />
        </IonItem>
      ))}
    </IonRadioGroup>
  );
};

export default TeeSelector;
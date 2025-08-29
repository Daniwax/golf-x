/**
 * Reusable stats grid component
 * Displays statistics in a responsive grid layout
 */

import React from 'react';
import { IonNote } from '@ionic/react';

export interface StatItem {
  value: string | number;
  label: string;
  color?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 3 | 4;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  style?: React.CSSProperties;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  size = 'medium',
  loading = false,
  style
}) => {
  const fontSize = {
    small: '20px',
    medium: '24px',
    large: '28px'
  }[size];

  const labelSize = {
    small: '11px',
    medium: '12px',
    large: '13px'
  }[size];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px',
      ...style
    }}>
      {stats.map((stat, index) => (
        <div key={index} style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize,
            fontWeight: '700',
            color: stat.color || 'inherit',
            marginBottom: '4px'
          }}>
            {loading ? '...' : stat.value}
          </div>
          <IonNote style={{ fontSize: labelSize }}>
            {stat.label}
          </IonNote>
        </div>
      ))}
    </div>
  );
};
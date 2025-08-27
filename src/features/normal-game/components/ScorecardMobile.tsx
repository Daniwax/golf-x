import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonSpinner,
  IonBadge
} from '@ionic/react';
import { supabase } from '../../../lib/supabase';
import type { GameParticipant, GameHoleScore } from '../types';

interface ScorecardProps {
  gameId: string;
  participants: GameParticipant[];
  scores: GameHoleScore[];
  currentHole: number;
  onRefresh?: () => void;
  onEditHole?: (holeNumber: number) => void;
}

interface HoleInfo {
  hole_number: number;
  par: number;
  handicap_index: number;
  yards?: number;
}

const ScorecardMobile: React.FC<ScorecardProps> = ({
  gameId,
  participants,
  scores,
  currentHole,
  // onRefresh, // Optional prop
  onEditHole
}) => {
  const [holes, setHoles] = useState<HoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    loadHoleData();
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHoleData = async () => {
    try {
      if (!supabase) return;
      
      const { data: game } = await supabase
        .from('games')
        .select('course_id')
        .eq('id', gameId)
        .single();
        
      if (!game) return;
      
      const { data: course } = await supabase
        .from('golf_courses')
        .select('name')
        .eq('id', game.course_id)
        .single();
        
      if (course) {
        setCourseName(course.name);
      }
      
      const { data: holeData } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', game.course_id)
        .order('hole_number');
        
      if (holeData) {
        setHoles(holeData);
      }
    } catch (error) {
      console.error('Error loading hole data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScore = (userId: string, holeNumber: number): number | null => {
    const score = scores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.strokes || null;
  };

  const getHandicapStrokes = (userId: string, holeNumber: number): number => {
    const score = scores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.hole_handicap_strokes || 0;
  };

  const getScoreColor = (strokes: number | null, par: number, handicapStrokes: number): string => {
    if (strokes === null) return 'transparent';
    
    // Personal par includes handicap strokes
    const personalPar = par + handicapStrokes;
    const diffFromPersonalPar = strokes - personalPar;
    const diffFromCoursePar = strokes - par;
    
    // First check performance against course par for green colors
    if (diffFromCoursePar <= -2) return '#00AA00'; // Eagle or better - Intense green
    if (diffFromCoursePar === -1) return '#4CAF50'; // Birdie - Green
    
    // Then check against personal par
    if (diffFromPersonalPar < 0) return '#4A90E2'; // Better than personal par - Blue
    if (diffFromPersonalPar === 0) return '#2D3748'; // Personal par - Dark gray/black
    if (diffFromPersonalPar > 0) return '#E53E3E'; // Over personal par - Red
    
    return '#E53E3E'; // Default red
  };

  const getScoreTextColor = (strokes: number | null): string => {
    if (strokes === null) return '#9CA3AF'; // Light gray
    return '#FFFFFF'; // White on all colored backgrounds
  };

  const calculateTotal = (userId: string, startHole: number, endHole: number): number => {
    let total = 0;
    for (let i = startHole; i <= endHole; i++) {
      const score = getScore(userId, i);
      if (score !== null) total += score;
    }
    return total || 0;
  };

  const calculateParTotal = (startHole: number, endHole: number): number => {
    return holes
      .filter(h => h.hole_number >= startHole && h.hole_number <= endHole)
      .reduce((sum, h) => sum + h.par, 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  const frontNineHoles = holes.filter(h => h.hole_number <= 9);
  const backNineHoles = holes.filter(h => h.hole_number > 9);

  // Calculate totals for all players
  const playerTotals = participants.map(p => ({
    participant: p,
    front: calculateTotal(p.user_id, 1, 9),
    back: calculateTotal(p.user_id, 10, 18),
    total: calculateTotal(p.user_id, 1, 18)
  }));

  const parFront = calculateParTotal(1, 9);
  const parBack = calculateParTotal(10, 18);
  const parTotal = calculateParTotal(1, 18);

  // Get shortened player names (first name + last initial)
  const getShortName = (fullName: string | undefined, index: number): string => {
    if (!fullName) return `P${index + 1}`;
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 8);
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const tableStyles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '13px'
    },
    th: {
      padding: '8px 4px',
      textAlign: 'center' as const,
      fontWeight: '600',
      borderBottom: '2px solid var(--ion-color-light)',
      backgroundColor: 'var(--ion-color-light-tint)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 10
    },
    td: {
      padding: '6px 4px',
      textAlign: 'center' as const,
      borderBottom: '1px solid var(--ion-color-light-shade)'
    },
    holeCell: {
      fontWeight: '600',
      backgroundColor: 'var(--ion-color-light-tint)',
      width: '28px'
    },
    parCell: {
      color: 'var(--ion-color-medium)',
      fontSize: '11px',
      width: '24px'
    },
    scoreCell: {
      fontWeight: '600',
      borderRadius: '4px',
      minWidth: '36px',
      cursor: 'pointer'
    },
    totalRow: {
      backgroundColor: 'var(--ion-color-light)',
      fontWeight: '700'
    },
    currentHoleRow: {
      backgroundColor: '#e8f0f7'
    }
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Course Header */}
      <IonCard style={{ margin: '0', borderRadius: '0' }}>
        <IonCardHeader style={{ padding: '16px' }}>
          <IonCardTitle style={{ fontSize: '18px' }}>
            {courseName}
            <IonNote style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
              Par {parTotal} • Hole {currentHole}/18
            </IonNote>
          </IonCardTitle>
        </IonCardHeader>
      </IonCard>

      {/* Front Nine Table */}
      <IonCard style={{ margin: '0', borderRadius: '0', borderTop: '1px solid var(--ion-color-light-shade)' }}>
        <IonCardHeader style={{ padding: '12px 16px' }}>
          <IonCardTitle style={{ fontSize: '14px' }}>Front Nine</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: '0', overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ ...tableStyles.th, ...tableStyles.holeCell }}>Hole</th>
                <th style={{ ...tableStyles.th, ...tableStyles.parCell }}>Par</th>
                {participants.map((p, idx) => (
                  <th key={p.id} style={{ ...tableStyles.th, minWidth: '40px' }}>
                    {getShortName(p.profiles?.full_name, idx)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frontNineHoles.map(hole => {
                const isCurrentHole = hole.hole_number === currentHole;
                return (
                  <tr 
                    key={hole.hole_number}
                    onClick={() => onEditHole?.(hole.hole_number)}
                    style={{ 
                      cursor: 'pointer',
                      ...(isCurrentHole ? tableStyles.currentHoleRow : {})
                    }}
                  >
                    <td style={{ ...tableStyles.td, ...tableStyles.holeCell }}>
                      {hole.hole_number}
                    </td>
                    <td style={{ ...tableStyles.td, ...tableStyles.parCell }}>
                      {hole.par}
                    </td>
                    {participants.map(p => {
                      const score = getScore(p.user_id, hole.hole_number);
                      const handicapStrokes = getHandicapStrokes(p.user_id, hole.hole_number);
                      return (
                        <td key={p.id} style={tableStyles.td}>
                          <div style={{
                            ...tableStyles.scoreCell,
                            backgroundColor: score ? getScoreColor(score, hole.par, handicapStrokes) : 'transparent',
                            color: score ? getScoreTextColor(score) : '#9CA3AF',
                            padding: '4px 6px',
                            margin: '0 auto',
                            display: 'inline-block'
                          }}>
                            {score || '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* OUT Total Row */}
              <tr style={tableStyles.totalRow}>
                <td style={{ ...tableStyles.td, fontWeight: '700' }}>OUT</td>
                <td style={{ ...tableStyles.td, color: 'var(--ion-color-medium)' }}>{parFront}</td>
                {participants.map(p => {
                  const total = calculateTotal(p.user_id, 1, 9);
                  return (
                    <td key={p.id} style={{ ...tableStyles.td, fontWeight: '700' }}>
                      {total || '-'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </IonCardContent>
      </IonCard>

      {/* Back Nine Table */}
      <IonCard style={{ margin: '0', borderRadius: '0', borderTop: '1px solid var(--ion-color-light-shade)' }}>
        <IonCardHeader style={{ padding: '12px 16px' }}>
          <IonCardTitle style={{ fontSize: '14px' }}>Back Nine</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: '0', overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ ...tableStyles.th, ...tableStyles.holeCell }}>Hole</th>
                <th style={{ ...tableStyles.th, ...tableStyles.parCell }}>Par</th>
                {participants.map((p, idx) => (
                  <th key={p.id} style={{ ...tableStyles.th, minWidth: '40px' }}>
                    {getShortName(p.profiles?.full_name, idx)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backNineHoles.map(hole => {
                const isCurrentHole = hole.hole_number === currentHole;
                return (
                  <tr 
                    key={hole.hole_number}
                    onClick={() => onEditHole?.(hole.hole_number)}
                    style={{ 
                      cursor: 'pointer',
                      ...(isCurrentHole ? tableStyles.currentHoleRow : {})
                    }}
                  >
                    <td style={{ ...tableStyles.td, ...tableStyles.holeCell }}>
                      {hole.hole_number}
                    </td>
                    <td style={{ ...tableStyles.td, ...tableStyles.parCell }}>
                      {hole.par}
                    </td>
                    {participants.map(p => {
                      const score = getScore(p.user_id, hole.hole_number);
                      const handicapStrokes = getHandicapStrokes(p.user_id, hole.hole_number);
                      return (
                        <td key={p.id} style={tableStyles.td}>
                          <div style={{
                            ...tableStyles.scoreCell,
                            backgroundColor: score ? getScoreColor(score, hole.par, handicapStrokes) : 'transparent',
                            color: score ? getScoreTextColor(score) : '#9CA3AF',
                            padding: '4px 6px',
                            margin: '0 auto',
                            display: 'inline-block'
                          }}>
                            {score || '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* IN Total Row */}
              <tr style={tableStyles.totalRow}>
                <td style={{ ...tableStyles.td, fontWeight: '700' }}>IN</td>
                <td style={{ ...tableStyles.td, color: 'var(--ion-color-medium)' }}>{parBack}</td>
                {participants.map(p => {
                  const total = calculateTotal(p.user_id, 10, 18);
                  return (
                    <td key={p.id} style={{ ...tableStyles.td, fontWeight: '700' }}>
                      {total || '-'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </IonCardContent>
      </IonCard>

      {/* Total Summary Card */}
      <IonCard style={{ margin: '0', borderRadius: '0', borderTop: '1px solid var(--ion-color-light-shade)' }}>
        <IonCardHeader style={{ padding: '12px 16px' }}>
          <IonCardTitle style={{ fontSize: '14px' }}>Total</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <IonNote>Course Par</IonNote>
            <IonBadge color="dark">{parTotal}</IonBadge>
          </div>
          {playerTotals.map((pt, idx) => {
            const totalDiff = pt.total - parTotal;
            return (
              <div key={pt.participant.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderTop: '1px solid var(--ion-color-light-shade)'
              }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {pt.participant.profiles?.full_name || `Player ${idx + 1}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IonNote style={{ fontSize: '12px' }}>
                    {pt.front || '-'} / {pt.back || '-'}
                  </IonNote>
                  <IonBadge 
                    color={
                      !pt.total ? 'medium' :
                      totalDiff === 0 ? 'dark' :
                      totalDiff < 0 ? 'primary' : 'danger'
                    }
                    style={{ minWidth: '48px', fontSize: '14px', fontWeight: '700' }}
                  >
                    {pt.total || '-'}
                    {pt.total > 0 && totalDiff !== 0 && (
                      <span style={{ fontSize: '11px', marginLeft: '4px' }}>
                        ({totalDiff > 0 ? '+' : ''}{totalDiff})
                      </span>
                    )}
                  </IonBadge>
                </div>
              </div>
            );
          })}
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default ScorecardMobile;
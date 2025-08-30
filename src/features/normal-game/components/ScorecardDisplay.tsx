import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonBadge
} from '@ionic/react';

interface Participant {
  id?: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Score {
  user_id: string;
  hole_number: number;
  strokes: number | null;
  hole_handicap_strokes?: number;
}

interface Hole {
  hole_number: number;
  par: number;
  handicap_index?: number;
}

interface ScorecardDisplayProps {
  participants: Participant[];
  scores: Score[];
  holes: Hole[];
  courseName: string;
  coursePar: number;
  currentHole?: number;
  onEditHole?: (holeNumber: number) => void;
  isReadOnly?: boolean;
}

const ScorecardDisplay: React.FC<ScorecardDisplayProps> = ({
  participants,
  scores,
  holes,
  courseName,
  coursePar,
  currentHole = 0,
  onEditHole,
  isReadOnly = false
}) => {
  console.log('[ScorecardDisplay] Props received:', { participants, scores, holes, courseName, coursePar });
  
  // Ensure we have valid arrays
  const safeParticipants = Array.isArray(participants) ? participants : [];
  const safeHoles = Array.isArray(holes) ? holes : [];
  const safeScores = Array.isArray(scores) ? scores : [];
  
  // Helper functions
  const getScore = (userId: string, holeNumber: number): number | null => {
    const score = safeScores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.strokes || null;
  };

  const getHandicapStrokes = (userId: string, holeNumber: number): number => {
    const score = safeScores.find(s => s.user_id === userId && s.hole_number === holeNumber);
    return score?.hole_handicap_strokes || 0;
  };

  const getScoreColor = (strokes: number | null, par: number, handicapStrokes: number): string => {
    if (strokes === null) return 'transparent';
    
    // For read-only mode (completed games), we don't have handicap strokes
    if (isReadOnly) {
      const diffFromPar = strokes - par;
      if (diffFromPar <= -2) return '#00AA00'; // Eagle or better - Intense green
      if (diffFromPar === -1) return '#4CAF50'; // Birdie - Green
      if (diffFromPar === 0) return '#2D3748'; // Par - Dark gray/black
      if (diffFromPar === 1) return '#FFA500'; // Bogey - Orange
      if (diffFromPar >= 2) return '#E53E3E'; // Double bogey or worse - Red
      return '#E53E3E'; // Default red
    }
    
    // For live games with handicap
    const personalPar = par + handicapStrokes;
    const diffFromPersonalPar = strokes - personalPar;
    const diffFromCoursePar = strokes - par;
    
    if (diffFromCoursePar <= -2) return '#00AA00'; // Eagle or better
    if (diffFromCoursePar === -1) return '#4CAF50'; // Birdie
    if (diffFromPersonalPar < 0) return '#4A90E2'; // Better than personal par - Blue
    if (diffFromPersonalPar === 0) return '#2D3748'; // Personal par
    if (diffFromPersonalPar > 0) return '#E53E3E'; // Over personal par
    
    return '#E53E3E';
  };

  const getScoreTextColor = (strokes: number | null): string => {
    if (strokes === null) return '#9CA3AF';
    return '#FFFFFF';
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
    return safeHoles
      .filter(h => h.hole_number >= startHole && h.hole_number <= endHole)
      .reduce((sum, h) => sum + h.par, 0);
  };

  const getShortName = (fullName: string | undefined, index: number): string => {
    if (!fullName) return `P${index + 1}`;
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 8);
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  // Separate front and back nine holes
  const frontNineHoles = safeHoles.filter(h => h.hole_number <= 9);
  const backNineHoles = safeHoles.filter(h => h.hole_number > 9);

  // Calculate totals
  const playerTotals = safeParticipants.map(p => ({
    participant: p,
    front: calculateTotal(p.user_id, 1, 9),
    back: calculateTotal(p.user_id, 10, 18),
    total: calculateTotal(p.user_id, 1, 18)
  }));

  const parFront = calculateParTotal(1, 9);
  const parBack = calculateParTotal(10, 18);
  const parTotal = coursePar || calculateParTotal(1, 18);

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
      cursor: isReadOnly ? 'default' : 'pointer'
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
              Par {parTotal} {!isReadOnly && `• Hole ${currentHole}/18`}
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
                {safeParticipants.map((p, idx) => (
                  <th key={p.id || p.user_id} style={{ ...tableStyles.th, minWidth: '40px' }}>
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
                    onClick={() => !isReadOnly && onEditHole?.(hole.hole_number)}
                    style={{ 
                      cursor: isReadOnly ? 'default' : 'pointer',
                      ...(isCurrentHole && !isReadOnly ? tableStyles.currentHoleRow : {})
                    }}
                  >
                    <td style={{ ...tableStyles.td, ...tableStyles.holeCell }}>
                      {hole.hole_number}
                    </td>
                    <td style={{ ...tableStyles.td, ...tableStyles.parCell }}>
                      {hole.par}
                    </td>
                    {safeParticipants.map(p => {
                      const score = getScore(p.user_id, hole.hole_number);
                      const handicapStrokes = getHandicapStrokes(p.user_id, hole.hole_number);
                      return (
                        <td key={p.id || p.user_id} style={tableStyles.td}>
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
                {safeParticipants.map(p => {
                  const total = calculateTotal(p.user_id, 1, 9);
                  return (
                    <td key={p.id || p.user_id} style={{ ...tableStyles.td, fontWeight: '700' }}>
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
                {safeParticipants.map((p, idx) => (
                  <th key={p.id || p.user_id} style={{ ...tableStyles.th, minWidth: '40px' }}>
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
                    onClick={() => !isReadOnly && onEditHole?.(hole.hole_number)}
                    style={{ 
                      cursor: isReadOnly ? 'default' : 'pointer',
                      ...(isCurrentHole && !isReadOnly ? tableStyles.currentHoleRow : {})
                    }}
                  >
                    <td style={{ ...tableStyles.td, ...tableStyles.holeCell }}>
                      {hole.hole_number}
                    </td>
                    <td style={{ ...tableStyles.td, ...tableStyles.parCell }}>
                      {hole.par}
                    </td>
                    {safeParticipants.map(p => {
                      const score = getScore(p.user_id, hole.hole_number);
                      const handicapStrokes = getHandicapStrokes(p.user_id, hole.hole_number);
                      return (
                        <td key={p.id || p.user_id} style={tableStyles.td}>
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
                {safeParticipants.map(p => {
                  const total = calculateTotal(p.user_id, 10, 18);
                  return (
                    <td key={p.id || p.user_id} style={{ ...tableStyles.td, fontWeight: '700' }}>
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
              <div key={pt.participant.id || pt.participant.user_id} style={{
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

export default ScorecardDisplay;
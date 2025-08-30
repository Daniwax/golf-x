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
import type { Game, GameParticipant, GameHoleScore } from '../types';
import { handicapTypes, scoringMethods } from '../rules';
import { 
  calculatePersonalPars
} from '../utils/handicapCalculations';

interface ScorecardProps {
  gameId: string;
  participants: GameParticipant[];
  scores: GameHoleScore[];
  currentHole: number;
  game: Game;
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
  game,
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
      
      // If game prop is not available yet, load it from database
      let gameData = game;
      if (!gameData) {
        const { data: loadedGame } = await supabase
          .from('games')
          .select('course_id, num_holes')
          .eq('id', gameId)
          .single();
          
        if (!loadedGame) return;
        gameData = loadedGame;
      }
      
      if (!gameData) return;
      
      const { data: course } = await supabase
        .from('golf_courses')
        .select('name')
        .eq('id', gameData.course_id)
        .single();
        
      if (course) {
        setCourseName(course.name);
      }
      
      const { data: holeData } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_index')
        .eq('course_id', gameData.course_id)
        .order('hole_number');
        
      if (holeData) {
        // Filter holes based on game.num_holes if specified
        console.log('[ScorecardMobile] Loading holes:', {
          gameNumHoles: gameData.num_holes,
          totalHolesFromDB: holeData.length,
          holesBeforeFilter: holeData.map(h => h.hole_number)
        });
        
        const holesToUse = gameData.num_holes && gameData.num_holes < 18 
          ? holeData.slice(0, gameData.num_holes)
          : holeData;
        
        console.log('[ScorecardMobile] Holes after filter:', {
          holesToUseCount: holesToUse.length,
          holesAfterFilter: holesToUse.map(h => h.hole_number)
        });
        
        setHoles(holesToUse);
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

  const calculateHandicapStrokes = (userId: string, holeNumber: number): number => {
    // First check if we have saved score data
    const savedStrokes = getHandicapStrokes(userId, holeNumber);
    if (savedStrokes > 0) return savedStrokes;
    
    // Calculate from participant's match handicap and hole handicap index
    const participant = participants.find(p => p.user_id === userId);
    const hole = holes.find(h => h.hole_number === holeNumber);
    
    if (!participant || !hole) return 0;
    
    const matchHandicap = participant.match_handicap;
    const holeHandicapIndex = hole.handicap_index;
    
    if (matchHandicap <= 0) return 0;
    
    // Calculate strokes using the same logic as the old method
    const fullRounds = Math.floor(matchHandicap / 18);
    const remainingStrokes = matchHandicap % 18;
    
    if (holeHandicapIndex <= remainingStrokes) {
      return fullRounds + 1;
    } else {
      return fullRounds;
    }
  };

  // Get score background color and text color based on diff from player match par
  const getScoreStyle = (strokes: number | null, par: number, handicapStrokes: number): { backgroundColor: string, color: string } => {
    if (strokes === null) {
      return { backgroundColor: 'transparent', color: '#9CA3AF' }; // Light gray for empty scores
    }
    
    // Check for Hole in One first
    if (strokes === 1) {
      // Hole in One - Golden
      return { backgroundColor: 'rgba(255, 215, 0, 1)', color: '#000' }; // Gold with black text
    }
    
    // Calculate player's match par (course par + handicap strokes)
    const playerMatchPar = par + handicapStrokes;
    const diff = strokes - playerMatchPar;
    
    // Color scale from -3 to +3
    if (diff <= -3) {
      // -3 or better - Deep red/maroon
      return { backgroundColor: 'rgba(139, 0, 0, 1)', color: 'white' };
    }
    if (diff === -2) {
      // -2 - Crimson red
      return { backgroundColor: 'rgba(220, 20, 60, 1)', color: 'white' };
    }
    if (diff === -1) {
      // -1 - Orange-red
      return { backgroundColor: 'rgba(255, 69, 0, 1)', color: 'white' };
    }
    if (diff === 0) {
      // Par - Neutral (transparent)
      return { backgroundColor: 'transparent', color: '#2D3748' };
    }
    if (diff === 1) {
      // +1 - Light blue
      return { backgroundColor: 'rgba(135, 206, 235, 1)', color: '#000' };
    }
    if (diff === 2) {
      // +2 - Royal blue
      return { backgroundColor: 'rgba(65, 105, 225, 1)', color: 'white' };
    }
    // +3 or worse - Dark blue/navy
    return { backgroundColor: 'rgba(25, 25, 112, 1)', color: 'white' };
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
  
  console.log('[ScorecardMobile] Rendering with holes:', {
    totalHoles: holes.length,
    frontNineCount: frontNineHoles.length,
    backNineCount: backNineHoles.length,
    allHoleNumbers: holes.map(h => h.hole_number)
  });

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

  // Concise rule summaries (max 5 lines each)
  const getHandicapSummary = (handicapType: string | undefined): string => {
    switch (handicapType) {
      case 'match_play':
        return '• Lowest handicap player plays off scratch (0 strokes)\n• Other players get difference in strokes\n• Strokes given on hardest holes first (lowest handicap index)\n• Focus on winning holes, not total score';
      case 'stroke_play':
        return '• Players get 95% of their full course handicap\n• Strokes allocated based on hole difficulty index\n• Lowest total net score wins\n• Every stroke counts equally';
      case 'random':
        return '• Handicaps randomly assigned each game\n• Creates unpredictable, fun competition\n• Distribution changes every round\n• Great for leveling the field';
      case 'none':
        return '• No handicap strokes given\n• Pure skill competition\n• Actual scores determine winner\n• Best for players of similar ability';
      case 'ghost':
        return '• Play against historical best scores\n• Compare with past performances\n• Challenge personal records\n• Great for solo practice rounds';
      default:
        return '';
    }
  };

  const getScoringMethodSummary = (scoringMethod: string | undefined): string => {
    switch (scoringMethod) {
      case 'stroke_play':
        return '• Count every stroke taken\n• Subtract handicap strokes from gross score\n• Lowest net total wins\n• Traditional medal play format';
      case 'match_play':
        return '• Win individual holes, not total score\n• Concede putts and holes allowed\n• Match ends when mathematically decided\n• Head-to-head hole competition';
      case 'stableford':
        return '• Points based on score vs par (plus handicap)\n• Double bogey = 0 pts, Bogey = 1 pt, Par = 2 pts\n• Birdie = 3 pts, Eagle = 4 pts\n• Highest point total wins';
      case 'skins':
        return '• Win money/points by winning holes outright\n• Tie = no winner, value carries to next hole\n• Last hole can be worth multiple skins\n• High risk, high reward format';
      default:
        return '';
    }
  };

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
      width: '24px',
      fontSize: '11px'
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
              Par {parTotal} • Hole {currentHole}/{holes.length || 18}
            </IonNote>
          </IonCardTitle>
        </IonCardHeader>
      </IonCard>

      {/* Front Nine Table */}
      <IonCard style={{ margin: '0', borderRadius: '0', borderTop: '1px solid var(--ion-color-light-shade)' }}>
        <IonCardHeader style={{ padding: '12px 16px' }}>
          <IonCardTitle style={{ fontSize: '14px' }}>
            {holes.length <= 9 ? `Holes (${holes.length})` : 'Front Nine'}
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: '0', overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ ...tableStyles.th, ...tableStyles.holeCell }}>Hole</th>
                <th style={{ ...tableStyles.th, ...tableStyles.parCell }}>Par</th>
                {participants.map((p, idx) => (
                  <th key={p.id} style={{ ...tableStyles.th, width: '50px', minWidth: '50px' }}>
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
                      const handicapStrokes = calculateHandicapStrokes(p.user_id, hole.hole_number);
                      const scoreStyle = getScoreStyle(score, hole.par, handicapStrokes);
                      return (
                        <td key={p.id} style={{ ...tableStyles.td, width: '50px', minWidth: '50px' }}>
                          <div style={{
                            ...tableStyles.scoreCell,
                            backgroundColor: score ? scoreStyle.backgroundColor : 'transparent',
                            color: score ? scoreStyle.color : '#9CA3AF',
                            padding: '4px 6px',
                            margin: '0 auto',
                            display: 'inline-block',
                            position: 'relative'
                          }}>
                            {score ? (
                              // Saved holes: Show score with superscript handicap strokes in white
                              <>
                                {score}
                                {handicapStrokes > 0 && (
                                  <sup style={{
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    marginLeft: '2px',
                                    verticalAlign: 'super',
                                    color: scoreStyle.backgroundColor === 'transparent' ? 
                                           (handicapStrokes === 1 ? '#2196F3' :      // Blue for +1
                                            handicapStrokes === 2 ? '#4CAF50' :      // Green for +2  
                                            '#FF9800') :                            // Orange for +3+
                                           'white'                                   // White for colored backgrounds
                                  }}>
                                    +{handicapStrokes}
                                  </sup>
                                )}
                              </>
                            ) : (
                              // Unsaved holes: Show handicap strokes as regular smaller text
                              handicapStrokes > 0 ? (
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: handicapStrokes === 1 ? '#64B5F6' :      // Lighter blue for unplayed +1
                                         handicapStrokes === 2 ? '#81C784' :      // Lighter green for unplayed +2
                                         '#FFB74D'                               // Lighter orange for unplayed +3+
                                }}>
                                  +{handicapStrokes}
                                </span>
                              ) : '-'
                            )}
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
                    <td key={p.id} style={{ ...tableStyles.td, fontWeight: '700', width: '50px', minWidth: '50px' }}>
                      {total || '-'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </IonCardContent>
      </IonCard>

      {/* Score Color Legend - Between Front and Back */}
      <div style={{ 
        margin: '0', 
        padding: '10px', 
        backgroundColor: 'var(--ion-color-light)',
        borderTop: '1px solid var(--ion-color-light-shade)',
        borderBottom: '1px solid var(--ion-color-light-shade)'
      }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
          {/* H1 - Hole in One */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'rgba(255, 215, 0, 1)',
            color: '#000',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '700',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            H1
          </div>
          
          {/* -3 */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'rgba(139, 0, 0, 1)',
            color: 'white',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            -3
          </div>
          
          {/* -2 */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'rgba(220, 20, 60, 1)',
            color: 'white',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            -2
          </div>
          
          {/* -1 */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'rgba(255, 69, 0, 1)',
            color: 'white',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            -1
          </div>
          
          {/* 0 - Par */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'white',
            color: '#2D3748',
            border: '1px solid var(--ion-color-medium-shade)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            0
          </div>
          
          {/* +1 */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'rgba(135, 206, 235, 1)',
            color: '#000',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            +1
          </div>
          
          {/* +2 */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'rgba(65, 105, 225, 1)',
            color: 'white',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            +2
          </div>
          
          {/* +3 */}
          <div style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'rgba(25, 25, 112, 1)',
            color: 'white',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            +3
          </div>
        </div>
      </div>

      {/* Back Nine Table - Only show if there are more than 9 holes */}
      {backNineHoles.length > 0 && (
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
                  <th key={p.id} style={{ ...tableStyles.th, width: '50px', minWidth: '50px' }}>
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
                      const handicapStrokes = calculateHandicapStrokes(p.user_id, hole.hole_number);
                      const scoreStyle = getScoreStyle(score, hole.par, handicapStrokes);
                      return (
                        <td key={p.id} style={{ ...tableStyles.td, width: '50px', minWidth: '50px' }}>
                          <div style={{
                            ...tableStyles.scoreCell,
                            backgroundColor: score ? scoreStyle.backgroundColor : 'transparent',
                            color: score ? scoreStyle.color : '#9CA3AF',
                            padding: '4px 6px',
                            margin: '0 auto',
                            display: 'inline-block',
                            position: 'relative'
                          }}>
                            {score ? (
                              // Saved holes: Show score with superscript handicap strokes in white
                              <>
                                {score}
                                {handicapStrokes > 0 && (
                                  <sup style={{
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    marginLeft: '2px',
                                    verticalAlign: 'super',
                                    color: scoreStyle.backgroundColor === 'transparent' ? 
                                           (handicapStrokes === 1 ? '#2196F3' :      // Blue for +1
                                            handicapStrokes === 2 ? '#4CAF50' :      // Green for +2  
                                            '#FF9800') :                            // Orange for +3+
                                           'white'                                   // White for colored backgrounds
                                  }}>
                                    +{handicapStrokes}
                                  </sup>
                                )}
                              </>
                            ) : (
                              // Unsaved holes: Show handicap strokes as regular smaller text
                              handicapStrokes > 0 ? (
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: handicapStrokes === 1 ? '#64B5F6' :      // Lighter blue for unplayed +1
                                         handicapStrokes === 2 ? '#81C784' :      // Lighter green for unplayed +2
                                         '#FFB74D'                               // Lighter orange for unplayed +3+
                                }}>
                                  +{handicapStrokes}
                                </span>
                              ) : '-'
                            )}
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
                    <td key={p.id} style={{ ...tableStyles.td, fontWeight: '700', width: '50px', minWidth: '50px' }}>
                      {total || '-'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </IonCardContent>
      </IonCard>
      )}

      {/* Game Rules Section */}
      <IonCard style={{ margin: '0', borderRadius: '0', borderTop: '1px solid var(--ion-color-light-shade)' }}>
        <IonCardHeader style={{ padding: '12px 16px', backgroundColor: 'var(--ion-color-light)' }}>
          <IonCardTitle style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Game Rules</span>
            <IonBadge color="primary" style={{ fontSize: '10px', padding: '2px 6px' }}>
              {game.handicap_type?.toUpperCase()} • {game.scoring_method?.toUpperCase()}
            </IonBadge>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {/* Handicap Type Rules */}
            {game.handicap_type && handicapTypes[game.handicap_type as keyof typeof handicapTypes] && (
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: 'var(--ion-color-primary)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    width: '4px', 
                    height: '18px', 
                    backgroundColor: 'var(--ion-color-primary)', 
                    borderRadius: '2px' 
                  }}></span>
                  {handicapTypes[game.handicap_type as keyof typeof handicapTypes].title}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.4',
                  color: 'var(--ion-color-medium-shade)',
                  whiteSpace: 'pre-line'
                }}>
                  {getHandicapSummary(game.handicap_type)}
                </div>
              </div>
            )}

            {/* Scoring Method Rules */}
            {game.scoring_method && scoringMethods[game.scoring_method as keyof typeof scoringMethods] && (
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: 'var(--ion-color-secondary)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    width: '4px', 
                    height: '18px', 
                    backgroundColor: 'var(--ion-color-secondary)', 
                    borderRadius: '2px' 
                  }}></span>
                  {scoringMethods[game.scoring_method as keyof typeof scoringMethods].title}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.4',
                  color: 'var(--ion-color-medium-shade)',
                  whiteSpace: 'pre-line'
                }}>
                  {getScoringMethodSummary(game.scoring_method)}
                </div>
              </div>
            )}
          </div>
        </IonCardContent>
      </IonCard>

    </div>
  );
};

export default ScorecardMobile;
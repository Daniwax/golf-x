/**
 * Handicap calculations utility functions
 * Used for calculating stroke allocations and personal pars
 */

export interface HoleInfo {
  hole_number: number;
  par: number;
  handicap_index: number;
}

export interface PersonalParInfo {
  holeNumber: number;
  basePar: number;
  strokesReceived: number;
  personalPar: number;
}

/**
 * Calculates how many strokes a player receives on a specific hole
 * based on their playing handicap and the hole's stroke index
 * 
 * @param playingHandicap - The player's total playing handicap (match handicap)
 * @param holeStrokeIndex - The stroke index of the hole (1-18, where 1 is hardest)
 * @returns Number of strokes received on this hole
 */
export function calculateHoleStrokes(playingHandicap: number, holeStrokeIndex: number): number {
  if (playingHandicap <= 0) return 0;
  
  let strokesRemaining = playingHandicap;
  let strokes = 0;
  
  // First, give 1 stroke to all holes if handicap >= 18
  // This handles players with handicaps 18-36 (1 stroke on all holes)
  // and 36-54 (2 strokes on all holes), etc.
  while (strokesRemaining >= 18) {
    strokes++;
    strokesRemaining -= 18;
  }
  
  // Then distribute remaining strokes based on stroke index
  // Strokes go to the hardest holes first (SI 1, then SI 2, etc.)
  if (strokesRemaining > 0 && holeStrokeIndex <= strokesRemaining) {
    strokes++;
  }
  
  return strokes;
}

/**
 * Calculates the personal par for each hole for a player
 * Personal par = course par + handicap strokes received
 * 
 * @param holes - Array of hole information with par and stroke index
 * @param playingHandicap - The player's total playing handicap
 * @returns Array of personal par information for each hole
 */
export function calculatePersonalPars(holes: HoleInfo[], playingHandicap: number): PersonalParInfo[] {
  return holes.map(hole => {
    const strokesReceived = calculateHoleStrokes(playingHandicap, hole.handicap_index);
    return {
      holeNumber: hole.hole_number,
      basePar: hole.par,
      strokesReceived,
      personalPar: hole.par + strokesReceived
    };
  });
}

/**
 * Calculates the total personal par for a player over all holes
 * 
 * @param holes - Array of hole information
 * @param playingHandicap - The player's total playing handicap
 * @returns Total personal par (e.g., 72 + handicap strokes = 95)
 */
export function calculateTotalPersonalPar(holes: HoleInfo[], playingHandicap: number): number {
  const personalPars = calculatePersonalPars(holes, playingHandicap);
  return personalPars.reduce((sum, pp) => sum + pp.personalPar, 0);
}

/**
 * For match play: calculates relative handicap after reducing by the lowest handicap
 * This ensures at least one player plays off scratch (0 handicap)
 * 
 * @param playingHandicaps - Array of all players' playing handicaps
 * @returns Array of adjusted match play handicaps
 */
export function calculateMatchPlayHandicaps(playingHandicaps: number[]): number[] {
  const lowestHandicap = Math.min(...playingHandicaps);
  return playingHandicaps.map(hc => hc - lowestHandicap);
}

/**
 * Calculates net score for a hole (gross score minus strokes received)
 * 
 * @param grossScore - The actual strokes taken
 * @param strokesReceived - Handicap strokes received on this hole
 * @returns Net score
 */
export function calculateNetScore(grossScore: number, strokesReceived: number): number {
  return grossScore - strokesReceived;
}

/**
 * Determines the color coding for personal par display
 * 
 * @param strokesReceived - Number of strokes received on a hole
 * @returns Color identifier for UI display
 */
export function getPersonalParColor(strokesReceived: number): 'normal' | 'primary' | 'warning' {
  if (strokesReceived === 0) return 'normal';
  if (strokesReceived === 1) return 'primary';
  return 'warning'; // 2+ strokes
}

/**
 * Calculates Course Handicap from Handicap Index
 * CH = HI × (Slope/113) + (CR - Par)
 * 
 * @param handicapIndex - The player's handicap index
 * @param slopeRating - The slope rating of the tee
 * @param courseRating - The course rating of the tee
 * @param par - The course par
 * @returns Course handicap (rounded to nearest whole number)
 */
export function calculateCourseHandicap(
  handicapIndex: number, 
  slopeRating: number, 
  courseRating: number, 
  par: number
): number {
  const courseHandicap = (handicapIndex * (slopeRating / 113)) + (courseRating - par);
  return Math.round(courseHandicap);
}

/**
 * Calculates Playing Handicap from Course Handicap
 * For singles stroke play: PH = CH × 1.0 (100%)
 * 
 * @param courseHandicap - The calculated course handicap
 * @param formatOrAllowance - Game format string ('stroke_play', 'match_play') or allowance percentage
 * @returns Playing handicap
 */
export function calculatePlayingHandicap(
  courseHandicap: number, 
  formatOrAllowance: string | number = 100
): number {
  // Handle both old (format string) and new (percentage) signatures
  let allowancePercentage = 100;
  
  if (typeof formatOrAllowance === 'string') {
    // Old signature: format string
    // For singles stroke play and match play, use 100% allowance
    allowancePercentage = 100;
  } else {
    // New signature: direct percentage
    allowancePercentage = formatOrAllowance;
  }
  
  return Math.round(courseHandicap * (allowancePercentage / 100));
}

/**
 * Calculates Match Handicap (for match play)
 * Reduces all handicaps so the lowest plays off scratch
 * 
 * @param allPlayingHandicaps - Array of all players' playing handicaps OR a single playing handicap
 * @param playerIndexOrLowestHC - Index of the current player OR the lowest handicap
 * @returns Match handicap
 */
export function calculateMatchHandicap(
  allPlayingHandicaps: number[] | number, 
  playerIndexOrLowestHC: number
): number {
  // Handle both signatures for backwards compatibility
  if (Array.isArray(allPlayingHandicaps)) {
    // New signature: array of handicaps and player index
    if (allPlayingHandicaps.length === 0) return 0;
    
    const lowestHandicap = Math.min(...allPlayingHandicaps);
    const playerHandicap = allPlayingHandicaps[playerIndexOrLowestHC];
    
    if (isNaN(playerHandicap) || isNaN(lowestHandicap)) return 0;
    
    return playerHandicap - lowestHandicap;
  } else {
    // Old signature: two numbers (playingHandicap, lowestHandicap)
    const playingHandicap = allPlayingHandicaps;
    const lowestHandicap = playerIndexOrLowestHC;
    
    if (isNaN(playingHandicap) || isNaN(lowestHandicap)) return 0;
    
    return playingHandicap - lowestHandicap;
  }
}

/**
 * Determines if a player gets strokes on a specific hole
 * 
 * @param holeStrokeIndex - The stroke index of the hole
 * @param playerHandicap - The player's match/playing handicap
 * @returns Number of strokes received on this hole
 */
export function getStrokesOnHole(holeStrokeIndex: number, playerHandicap: number): number {
  return calculateHoleStrokes(playerHandicap, holeStrokeIndex);
}

/**
 * Calculate hole difficulty ranking based on handicap index
 * Lower handicap index means harder hole (gets strokes first)
 * 
 * @param holes - Array of holes with handicap_index
 * @param targetHoleNumber - The hole number to get ranking for
 * @returns The difficulty ranking (1 = hardest, 18 = easiest)
 */
export function getHoleDifficultyRanking(
  holes: Array<{ hole_number: number; handicap_index: number }>,
  targetHoleNumber: number
): number {
  if (!holes || holes.length === 0) return 1;
  
  // Sort holes by handicap_index (ascending - lower index = harder hole)
  const sortedByDifficulty = [...holes].sort((a, b) => a.handicap_index - b.handicap_index);
  
  // Find position of target hole in sorted array
  const rankIndex = sortedByDifficulty.findIndex(h => h.hole_number === targetHoleNumber);
  
  // Return rank (1-based index), default to 1 if not found
  return rankIndex !== -1 ? rankIndex + 1 : 1;
}

/**
 * Calculate match play results (for completed games)
 * This is a placeholder for ViewCompletedGame component
 */
export function calculateMatchPlayResults(participants: Array<{ user_id: string; profiles?: { full_name: string } }>, _scores: Array<{ user_id: string; hole_number: number; strokes: number }>, _holes: Array<{ hole_number: number; par: number }>): Array<{ user_id: string; total_strokes: number }> {
  if (!Array.isArray(participants) || participants.length === 0) {
    return [];
  }
  
  // For now, just return the participants with basic match play stats
  // TODO: Implement proper hole-by-hole match play calculations
  const participantsWithMatchPlay = participants.map(participant => ({
    ...participant,
    holes_won: 0,
    holes_halved: 0,
    holes_lost: 0
  }));
  
  return participantsWithMatchPlay;
}
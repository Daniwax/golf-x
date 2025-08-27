/**
 * Probability calculations for golf performance
 * Estimates likelihood of achieving handicapped par based on current performance
 */

/**
 * Calculates the probability of achieving handicapped par
 * Simple formula based on current pace vs expected pace
 * 
 * @param currentStrokes - Total strokes taken so far
 * @param holesPlayed - Number of holes completed
 * @param personalPar - Player's total personal par (e.g., 95 for 23 HC)
 * @param playingHandicap - Player's playing handicap
 * @returns Probability as percentage (0-100)
 */
export function calculateSuccessProbability(
  currentStrokes: number,
  holesPlayed: number,
  personalPar: number,
  playingHandicap: number
): number {
  // If no holes played yet, base probability on handicap
  if (holesPlayed === 0) {
    // Start everyone at 50%
    return 50;
  }

  const holesRemaining = 18 - holesPlayed;
  
  // Simple calculation:
  // 1. What should they have scored by now?
  const expectedSoFar = (personalPar * holesPlayed) / 18;
  
  // 2. How are they doing compared to expected?
  const difference = expectedSoFar - currentStrokes; // Positive = doing well
  
  // 3. Simple probability based on current performance
  // Each stroke better = +5% probability, each stroke worse = -5%
  const baseProbability = 50; // Start at 50%
  const adjustment = difference * 5; // 5% per stroke
  
  // 4. Apply confidence based on holes remaining
  // More holes remaining = results closer to 50% (more uncertainty)
  const confidenceFactor = holesPlayed / 18; // 0 to 1 as round progresses
  const adjustedProbability = baseProbability + (adjustment * confidenceFactor);
  
  // Ensure probability is within 5-95 range (never completely hopeless or certain)
  return Math.round(Math.max(5, Math.min(95, adjustedProbability)));
}

/**
 * Calculates strokes remaining to reach personal par goal
 * 
 * @param currentStrokes - Total strokes taken so far
 * @param personalPar - Player's total personal par
 * @returns Strokes remaining (negative means over par)
 */
export function calculateStrokesRemaining(
  currentStrokes: number,
  personalPar: number
): number {
  return personalPar - currentStrokes;
}

/**
 * Calculates performance ratio (lower is better)
 * Used to rank players by who's performing best relative to their handicap
 * 
 * @param currentStrokes - Total strokes taken
 * @param holesPlayed - Number of holes completed
 * @param personalPar - Player's total personal par
 * @returns Performance ratio (1.0 = playing to handicap, <1.0 = better, >1.0 = worse)
 */
export function calculatePerformanceRatio(
  currentStrokes: number,
  holesPlayed: number,
  personalPar: number
): number {
  if (holesPlayed === 0) return 1.0;
  
  const expectedStrokesAtThisPoint = (personalPar / 18) * holesPlayed;
  return currentStrokes / expectedStrokesAtThisPoint;
}

/**
 * Gets a motivational message based on probability
 * 
 * @param probability - Success probability (0-100)
 * @param strokesRemaining - Strokes left to reach goal
 * @returns Encouraging or informative message
 */
export function getPerformanceMessage(
  probability: number,
  strokesRemaining: number
): string {
  if (strokesRemaining < -5) {
    return "Tough day";
  } else if (strokesRemaining < 0) {
    return "Keep fighting";
  } else if (probability >= 80) {
    return "Looking great!";
  } else if (probability >= 60) {
    return "On track";
  } else if (probability >= 40) {
    return "Stay focused";
  } else if (probability >= 20) {
    return "Need birdies";
  } else {
    return "One shot at a time";
  }
}

/**
 * Determines color coding based on probability
 * 
 * @param probability - Success probability (0-100)
 * @returns Color identifier for UI
 */
export function getProbabilityColor(probability: number): string {
  if (probability >= 70) return 'success';
  if (probability >= 50) return 'primary';
  if (probability >= 30) return 'warning';
  return 'danger';
}
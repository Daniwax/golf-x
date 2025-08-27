/**
 * Golf Handicap Calculations following USGA/R&A World Handicap System
 * Critical for accurate game scoring
 */

/**
 * Calculate Course Handicap from Handicap Index
 * Formula: CH = HI × (Slope Rating / 113) + (Course Rating - Par)
 * 
 * @param handicapIndex - Player's official handicap index (0.0 to 54.0)
 * @param slopeRating - Tee box slope rating (55 to 155)
 * @param courseRating - Tee box course rating
 * @param coursePar - Total par for the course
 * @returns Rounded course handicap
 */
export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  coursePar: number
): number {
  // Validate inputs
  if (handicapIndex < 0 || handicapIndex > 54) {
    throw new Error('Handicap index must be between 0 and 54');
  }
  if (slopeRating < 55 || slopeRating > 155) {
    throw new Error('Slope rating must be between 55 and 155');
  }

  // Standard slope is always 113
  const STANDARD_SLOPE = 113;
  
  // Calculate course handicap
  const courseHandicap = (handicapIndex * (slopeRating / STANDARD_SLOPE)) + 
                        (courseRating - coursePar);
  
  // Round to nearest integer (.5 rounds up)
  return Math.round(courseHandicap);
}

/**
 * Calculate Playing Handicap from Course Handicap
 * For singles match play: 100% of course handicap
 * For singles stroke play: 95% of course handicap
 * 
 * @param courseHandicap - Calculated course handicap
 * @param format - 'match_play' or 'stroke_play'
 * @returns Rounded playing handicap
 */
export function calculatePlayingHandicap(
  courseHandicap: number,
  format: 'match_play' | 'stroke_play'
): number {
  const percentage = format === 'match_play' ? 1.0 : 0.95;
  return Math.round(courseHandicap * percentage);
}

/**
 * Calculate Match Handicap (strokes given/received relative to lowest)
 * In match play, the lowest handicap plays to 0
 * 
 * @param playingHandicaps - Array of all players' playing handicaps
 * @param playerIndex - Index of the player to calculate for
 * @returns Match handicap (0 for lowest, positive for others)
 */
export function calculateMatchHandicap(
  playingHandicaps: number[],
  playerIndex: number
): number {
  if (playingHandicaps.length === 0) return 0;
  
  const lowestHandicap = Math.min(...playingHandicaps);
  return playingHandicaps[playerIndex] - lowestHandicap;
}

/**
 * Determine which holes a player receives strokes on
 * Based on hole handicap index (stroke index)
 * 
 * @param matchHandicap - Number of strokes player receives
 * @param totalHoles - Number of holes (usually 18)
 * @returns Array of hole numbers where player gets strokes
 */
export function getStrokeHoles(
  matchHandicap: number,
  totalHoles: number = 18
): number[] {
  const strokeHoles: number[] = [];
  
  if (matchHandicap <= 0) return strokeHoles;
  
  // For 18 holes:
  // 1-18 strokes: holes with SI 1 through matchHandicap
  // 19-36 strokes: all holes get 1, holes SI 1-(matchHandicap-18) get 2
  // And so on...
  
  const fullRounds = Math.floor(matchHandicap / totalHoles);
  const remainingStrokes = matchHandicap % totalHoles;
  
  // All holes get at least 'fullRounds' strokes
  for (let hole = 1; hole <= totalHoles; hole++) {
    if (fullRounds > 0) {
      strokeHoles.push(hole);
    }
  }
  
  // Additional strokes on holes with lowest SI
  for (let si = 1; si <= remainingStrokes; si++) {
    strokeHoles.push(si);
  }
  
  return strokeHoles;
}

/**
 * Calculate net score for a hole
 * Gross score minus handicap strokes received
 * 
 * @param grossScore - Actual strokes taken
 * @param handicapStrokes - Strokes received on this hole
 * @returns Net score
 */
export function calculateNetScore(
  grossScore: number,
  handicapStrokes: number
): number {
  return grossScore - handicapStrokes;
}

/**
 * Calculate Stableford points for a hole
 * Used in Stableford competitions
 * 
 * @param netScore - Net score for the hole
 * @param par - Par for the hole
 * @returns Stableford points
 */
export function calculateStablefordPoints(
  netScore: number,
  par: number
): number {
  const scoreToPar = netScore - par;
  
  if (scoreToPar <= -3) return 5; // Albatross or better
  if (scoreToPar === -2) return 4; // Eagle
  if (scoreToPar === -1) return 3; // Birdie
  if (scoreToPar === 0) return 2;  // Par
  if (scoreToPar === 1) return 1;  // Bogey
  return 0; // Double bogey or worse
}

/**
 * Determine match play hole result
 * 
 * @param player1NetScore - Player 1's net score
 * @param player2NetScore - Player 2's net score
 * @returns 'won', 'lost', or 'halved' from player 1's perspective
 */
export function getMatchPlayResult(
  player1NetScore: number,
  player2NetScore: number
): 'won' | 'lost' | 'halved' {
  if (player1NetScore < player2NetScore) return 'won';
  if (player1NetScore > player2NetScore) return 'lost';
  return 'halved';
}

/**
 * Calculate match status (e.g., "2 up", "All Square", "3&2")
 * 
 * @param holesWon - Holes won by player
 * @param holesLost - Holes lost by player
 * @param holesPlayed - Total holes played
 * @param totalHoles - Total holes in match (usually 18)
 * @returns Match status string
 */
export function getMatchStatus(
  holesWon: number,
  holesLost: number,
  holesPlayed: number,
  totalHoles: number = 18
): string {
  const differential = holesWon - holesLost;
  const holesRemaining = totalHoles - holesPlayed;
  
  if (differential === 0) return 'All Square';
  
  const leader = differential > 0 ? 'Up' : 'Down';
  const margin = Math.abs(differential);
  
  // Check if match is over (dormie or won)
  if (margin > holesRemaining) {
    // Match is won
    const winMargin = margin;
    const holesLeftWhenWon = holesRemaining + 1;
    return `${winMargin} & ${holesLeftWhenWon}`;
  }
  
  if (margin === holesRemaining && holesRemaining > 0) {
    // Dormie (can't lose, worst case is tie)
    return `${margin} ${leader} (Dormie)`;
  }
  
  return `${margin} ${leader}`;
}

/**
 * Validate handicap index
 * 
 * @param handicapIndex - Handicap to validate
 * @returns true if valid
 */
export function isValidHandicapIndex(handicapIndex: number): boolean {
  return handicapIndex >= -10.0 && handicapIndex <= 54.0;
}

/**
 * Format handicap for display
 * Plus handicaps shown as "+X.X", others as "X.X"
 * 
 * @param handicap - Handicap to format
 * @returns Formatted string
 */
export function formatHandicap(handicap: number): string {
  if (handicap < 0) {
    return `+${Math.abs(handicap).toFixed(1)}`;
  }
  return handicap.toFixed(1);
}

/**
 * Calculate strokes received on a specific hole
 * Based on hole's stroke index and player's match handicap
 * 
 * @param holeStrokeIndex - Hole's difficulty ranking (1-18, 1 is hardest)
 * @param matchHandicap - Player's match handicap
 * @returns Number of strokes received on this hole
 */
export function getStrokesOnHole(
  holeStrokeIndex: number,
  matchHandicap: number
): number {
  if (matchHandicap <= 0) return 0;
  
  // How many full rounds of 18 strokes?
  const fullRounds = Math.floor(matchHandicap / 18);
  const remainingStrokes = matchHandicap % 18;
  
  // Base strokes from full rounds
  let strokes = fullRounds;
  
  // Additional stroke if this hole's SI is within remaining strokes
  if (holeStrokeIndex <= remainingStrokes) {
    strokes++;
  }
  
  return strokes;
}

/**
 * Calculate total score relative to par
 * 
 * @param totalStrokes - Total strokes taken
 * @param coursePar - Course par
 * @returns Score relative to par (negative is under par)
 */
export function getScoreToPar(
  totalStrokes: number,
  coursePar: number
): number {
  return totalStrokes - coursePar;
}

/**
 * Format score relative to par for display
 * 
 * @param scoreToPar - Score relative to par
 * @returns Formatted string (e.g., "-2", "E", "+5")
 */
export function formatScoreToPar(scoreToPar: number): string {
  if (scoreToPar === 0) return 'E';
  if (scoreToPar > 0) return `+${scoreToPar}`;
  return scoreToPar.toString();
}

/**
 * Calculate match play results for all players in a game
 * Analyzes each hole to determine who won, lost, or halved
 * 
 * @param participants - Array of participants with their match handicaps
 * @param scores - Array of all scores for the game
 * @param holes - Array of hole information with handicap indexes
 * @returns Array of participants with match play results added
 */
export function calculateMatchPlayResults(
  participants: Array<{
    user_id: string;
    match_handicap?: number;
    handicap_index: number;
    course_handicap: number;
    playing_handicap: number;
    total_strokes: number | null;
    net_score: number | null;
    profiles?: {
      full_name: string;
    };
    tee_boxes?: {
      name: string;
    };
  }>,
  scores: Array<{
    user_id: string;
    hole_number: number;
    strokes: number | null;
  }>,
  holes: Array<{
    hole_number: number;
    handicap_index: number;
    par: number;
  }>
) {
  // Initialize results for each participant
  const results = participants.map(p => ({
    ...p,
    holes_won: 0,
    holes_halved: 0,
    holes_lost: 0
  }));

  // Process each hole
  for (const hole of holes) {
    // Get scores for this hole
    const holeScores = participants.map(participant => {
      const score = scores.find(
        s => s.user_id === participant.user_id && s.hole_number === hole.hole_number
      );
      
      if (!score || score.strokes === null) {
        return { user_id: participant.user_id, netScore: null, grossScore: null };
      }

      // Calculate net score (gross - handicap strokes)
      const handicapStrokes = getStrokesOnHole(
        hole.handicap_index,
        participant.match_handicap || 0
      );
      const netScore = score.strokes - handicapStrokes;
      
      return { user_id: participant.user_id, netScore, grossScore: score.strokes };
    });

    // Skip holes where not all players have scores
    const validScores = holeScores.filter(s => s.netScore !== null);
    if (validScores.length !== participants.length) continue;

    // For match play with 2+ players, we need to compare each player against each other
    // In multi-player match play, each player's result is calculated against every other player
    
    if (participants.length === 2) {
      // Simple 2-player match play
      const player1Score = holeScores[0];
      const player2Score = holeScores[1];
      
      if (player1Score.netScore === player2Score.netScore) {
        // Hole is halved
        results[0].holes_halved++;
        results[1].holes_halved++;
      } else if (player1Score.netScore! < player2Score.netScore!) {
        // Player 1 wins
        results[0].holes_won++;
        results[1].holes_lost++;
      } else {
        // Player 2 wins
        results[0].holes_lost++;
        results[1].holes_won++;
      }
    } else {
      // Multi-player match play: each player gets a result based on the best score
      const bestScore = Math.min(...validScores.map(s => s.netScore!));
      const winners = validScores.filter(s => s.netScore === bestScore);
      
      for (const participant of results) {
        const playerScore = holeScores.find(s => s.user_id === participant.user_id);
        if (!playerScore || playerScore.netScore === null) continue;

        if (winners.length === participants.length) {
          // Everyone has the same score - all halved
          participant.holes_halved++;
        } else if (playerScore.netScore === bestScore) {
          if (winners.length === 1) {
            // This player is the sole winner
            participant.holes_won++;
          } else {
            // Multiple players tied for best score - halved among them
            participant.holes_halved++;
          }
        } else {
          // This player lost the hole
          participant.holes_lost++;
        }
      }
    }
  }

  return results;
}
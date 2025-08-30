/**
 * ScoringEngine - Calculates leaderboards based on different scoring methods
 * Supports: Stroke Play, Stableford, Match Play, Skins
 */

export interface HoleScore {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number;
  strokeIndex: number;
}

export interface Scorecard {
  gameId: string;
  userId: string;
  playerName: string;
  holes: HoleScore[];
  totalStrokes: number;
  totalPutts: number;
  courseHandicap?: number;
  playingHandicap?: number;
}

export interface LeaderboardResult {
  metadata: {
    scoringMethod: ScoringMethod;
    scoringName: string;
    sortDirection: 'asc' | 'desc';
    sortDescription: string;
    scoringDetails: string; // Markdown with all rules, examples, etc.
  };
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  position: number;
  playerId: string;
  playerName: string;
  score: number; // Always numeric for proper sorting
  details?: any;
}

export type ScoringMethod = 'stroke_play' | 'stableford' | 'match_play' | 'skins';

export class ScoringEngine {
  /**
   * Main entry point - calculates leaderboard based on scoring method
   */
  static calculateLeaderboard(
    scorecards: Scorecard[],
    scoringMethod: ScoringMethod,
    includeHandicap: boolean = false
  ): LeaderboardResult {
    if (!scorecards || scorecards.length === 0) {
      return {
        metadata: this.getScoringMetadata(scoringMethod),
        entries: []
      };
    }

    let entries: LeaderboardEntry[] = [];

    switch (scoringMethod) {
      case 'stroke_play':
        entries = this.calculateStrokePlay(scorecards, includeHandicap);
        break;
      case 'stableford':
        entries = this.calculateStableford(scorecards, includeHandicap);
        break;
      case 'match_play':
        entries = this.calculateMatchPlay(scorecards, includeHandicap);
        break;
      case 'skins':
        entries = this.calculateSkins(scorecards, includeHandicap);
        break;
      default:
        entries = this.calculateStrokePlay(scorecards, includeHandicap);
    }

    return {
      metadata: this.getScoringMetadata(scoringMethod),
      entries
    };
  }

  /**
   * Get metadata for a scoring method
   */
  private static getScoringMetadata(scoringMethod: ScoringMethod) {
    switch (scoringMethod) {
      case 'stroke_play':
        return {
          scoringMethod,
          scoringName: 'Stroke Play',
          sortDirection: 'asc' as const,
          sortDescription: 'Lower is better',
          scoringDetails: `
## Stroke Play Scoring

**How it works:** Count every stroke taken. Lowest total score wins.

### Scoring:
- Score is difference from par (e.g., +5, E, -2)
- Uses personal par when handicaps are applied
- Ensures fair comparison between players with different pars

### Display:
- Main score shows strokes relative to par
- Also displays total strokes and personal par details

### Tiebreaker:
- Back 9 score (lowest wins)
- If still tied, back 6, back 3, then last hole

### Strategy:
- Consistent play is rewarded
- Every stroke counts - no "gimmes"
- Best for competitive tournaments
          `
        };

      case 'stableford':
        return {
          scoringMethod,
          scoringName: 'Stableford Points',
          sortDirection: 'desc' as const,
          sortDescription: 'Higher is better',
          scoringDetails: `
## Stableford Scoring System

**How it works:** Earn points based on your score per hole. Highest points wins.

### Points System:
- **Double Eagle** (-3 or better): **5 points**
- **Eagle** (-2): **4 points**
- **Birdie** (-1): **3 points**
- **Par** (0): **2 points**
- **Bogey** (+1): **1 point**
- **Double Bogey** (+2 or worse): **0 points**

### Strategy:
- Rewards aggressive play - go for birdies and eagles
- No penalty for disasters - 8 on a hole = same as 6
- Excellent for high handicappers and windy conditions

### Tiebreaker:
- Most holes with points scored
- Then back 9 points total
          `
        };

      case 'match_play':
        return {
          scoringMethod,
          scoringName: 'Match Play',
          sortDirection: 'desc' as const,
          sortDescription: 'Higher is better',
          scoringDetails: `
## Match Play Format

**How it works:** True round robin - every player plays against every other player on each hole. Most points wins.

### Scoring Per Hole (Pairwise Comparisons):
- **Win head-to-head: 2 points** per opponent beaten (configurable)
- **Tie head-to-head: 1 point** per opponent tied with (configurable)
- **Lose head-to-head: 0 points** per opponent lost to
- **All combinations compared on each hole**

### Head-to-Head (2 players):
- Default: winner gets 2 points, loser gets 0, tie gets 1 each
- Track match status: "4 up", "All Square", "Won 8&10"
- Maximum: 36 points (18 holes × 2 points) with default scoring

### Multiple Players (Round Robin):
- 3 players = 3 comparisons per hole = 6 points total per hole (default)
- 4 players = 6 comparisons per hole = 12 points total per hole (default)
- Each player faces every other player on every hole
- Point distribution scales with configured win/tie values

### Examples (Default 2/1/0 scoring):
- **3 players, Hole 1:** Scores A=4, B=5, C=6
  - A beats B: A+2, A beats C: A+2, B beats C: B+2  
  - **Result: A=4, B=2, C=0** (6 points total)
- **3 players, Hole 2:** Scores A=4, B=4, C=6
  - A ties B: A+1, B+1, A beats C: A+2, B beats C: B+2
  - **Result: A=3, B=3, C=0** (6 points total)

### Strategy:
- Focus on winning individual holes, not total score
- Risk/reward decisions on each hole
- Ties hurt less than in traditional formats

### Tiebreaker:
- Most outright holes won (not shared)
- Then fewest total strokes
          `
        };

      case 'skins':
        return {
          scoringMethod,
          scoringName: 'Skins Game',
          sortDirection: 'desc' as const,
          sortDescription: 'Higher is better',
          scoringDetails: `
## Skins Game Format

**How it works:** Win a hole outright to claim the "skin". Tied holes carry over value to next hole.

### Scoring:
- Each hole starts worth **1 skin**
- Must win hole outright (no ties)
- Tied holes add their value to the next hole

### Carryovers:
- Hole 1 tied → Hole 2 worth 2 skins
- Holes 1-3 all tied → Hole 4 worth 4 skins
- Creates high-value opportunities!

### Example:
- Holes 1-5 all tied → Hole 6 winner gets 6 skins
- One great hole can win multiple skins

### Strategy:
- Dramatic swings possible
- Risk vs reward decisions on every shot
- Best for creating excitement and comebacks

### Tiebreaker:
- Most individual holes won
- Then lowest total strokes
          `
        };

      default:
        return this.getScoringMetadata('stroke_play');
    }
  }

  /**
   * Stroke Play - Lowest total score wins (lower is better)
   * When player match par is used, the par values are already adjusted for handicap
   */
  private static calculateStrokePlay(
    scorecards: Scorecard[],
    includeHandicap: boolean
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = scorecards.map(card => {
      const grossScore = card.totalStrokes;
      
      // Calculate total par (this might be adjusted par if using player match par)
      const totalPar = card.holes.reduce((sum, hole) => sum + hole.par, 0);
      
      // Net score calculation
      let netScore = grossScore;
      if (includeHandicap && card.courseHandicap) {
        // Traditional handicap calculation
        netScore = grossScore - card.courseHandicap;
      }
      
      // Score vs par calculation (using the potentially adjusted par)
      const scoreDiff = grossScore - totalPar;
      const scoreDisplay = scoreDiff === 0 ? 'E' : 
                          scoreDiff > 0 ? `+${scoreDiff}` : 
                          `${scoreDiff}`;
      
      // The score used for ranking should be the difference from par
      // This ensures fair comparison between players with different personal pars
      const rankingScore = scoreDiff;
      
      return {
        position: 0, // Will be set after sorting
        playerId: card.userId,
        playerName: card.playerName,
        score: rankingScore,
        details: {
          grossScore,
          netScore,
          handicap: card.courseHandicap,
          scoreVsPar: scoreDisplay,
          totalPar,
          holesPlayed: card.holes.length,
          adjustedPar: totalPar !== 72 // Indicates if using player match par
        }
      };
    });

    // Sort by score (lowest first)
    entries.sort((a, b) => {
      const scoreDiff = (a.score as number) - (b.score as number);
      if (scoreDiff !== 0) return scoreDiff;
      
      // Tiebreaker: back 9 score
      const aBack9 = scorecards.find(c => c.userId === a.playerId)?.holes
        .slice(-9)
        .reduce((sum, h) => sum + h.strokes, 0) || 0;
      const bBack9 = scorecards.find(c => c.userId === b.playerId)?.holes
        .slice(-9)
        .reduce((sum, h) => sum + h.strokes, 0) || 0;
      
      return aBack9 - bBack9;
    });

    // Assign positions
    this.assignPositions(entries);
    
    return entries;
  }

  /**
   * Stableford - Points based on score per hole (higher is better)
   * Traditional: Double Eagle: 5, Eagle: 4, Birdie: 3, Par: 2, Bogey: 1, Double+: 0
   */
  private static calculateStableford(
    scorecards: Scorecard[],
    includeHandicap: boolean
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = scorecards.map(card => {
      let totalPoints = 0;
      const holeDetails: any[] = [];
      
      card.holes.forEach((hole, index) => {
        let strokes = hole.strokes;
        
        // Apply handicap strokes if included
        if (includeHandicap && card.playingHandicap) {
          const strokesReceived = this.getHandicapStrokes(
            card.playingHandicap,
            hole.strokeIndex,
            card.holes.length
          );
          strokes = strokes - strokesReceived;
        }
        
        // Calculate points based on score vs par
        const scoreDiff = strokes - hole.par;
        let points = 0;
        
        if (scoreDiff <= -3) points = 5; // Double Eagle or better
        else if (scoreDiff === -2) points = 4; // Eagle
        else if (scoreDiff === -1) points = 3; // Birdie
        else if (scoreDiff === 0) points = 2; // Par
        else if (scoreDiff === 1) points = 1; // Bogey
        else points = 0; // Double bogey or worse
        
        totalPoints += points;
        holeDetails.push({
          hole: hole.holeNumber,
          strokes: hole.strokes,
          netStrokes: strokes,
          par: hole.par,
          points
        });
      });
      
      return {
        position: 0,
        playerId: card.userId,
        playerName: card.playerName,
        score: totalPoints,
        details: {
          totalPoints,
          holesPlayed: card.holes.length,
          holeDetails,
          grossScore: card.totalStrokes,
          handicap: card.courseHandicap
        }
      };
    });

    // Sort by points (highest first)
    entries.sort((a, b) => (b.score as number) - (a.score as number));
    
    // Assign positions
    this.assignPositions(entries);
    
    return entries;
  }

  /**
   * Match Play - Award points per hole to all players (higher points is better)
   * Each hole: configurable points for win/tie/loss
   */
  private static calculateMatchPlay(
    scorecards: Scorecard[],
    includeHandicap: boolean,
    pointsForWin: number = 2,
    pointsForTie: number = 1
  ): LeaderboardEntry[] {
    const playerPoints = new Map<string, number>();
    const playerDetails = new Map<string, { holesWon: number; holesTied: number; holeResults: string[] }>();
    
    // Initialize tracking
    scorecards.forEach(card => {
      playerPoints.set(card.userId, 0);
      playerDetails.set(card.userId, { holesWon: 0, holesTied: 0, holeResults: [] });
    });
    
    // Get minimum holes played by any player
    const numHoles = Math.min(...scorecards.map(card => card.holes.length));
    
    // Compare each hole with pairwise comparisons (true round robin)
    for (let holeIdx = 0; holeIdx < numHoles; holeIdx++) {
      const holeScores: { userId: string; strokes: number; gross: number; playerName?: string }[] = [];
      
      // Get each player's score for this hole
      scorecards.forEach(card => {
        const hole = card.holes[holeIdx];
        if (!hole) return; // Skip if hole doesn't exist
        
        let strokes = hole.strokes;
        
        // When par values are already adjusted (PMP), calculate score vs par
        // Otherwise apply traditional handicap strokes
        if (includeHandicap && card.playingHandicap) {
          const strokesReceived = this.getHandicapStrokes(
            card.playingHandicap,
            hole.strokeIndex,
            numHoles
          );
          strokes -= strokesReceived;
        } else if (!includeHandicap && hole.par) {
          // When not using traditional handicap, but par is adjusted (PMP)
          // Convert to score vs par for fair comparison
          // This ensures players with different PMP pars are compared fairly
          strokes = hole.strokes - hole.par; // Score relative to PMP par
        }
        
        holeScores.push({
          userId: card.userId,
          strokes,
          gross: hole.strokes,
          playerName: card.playerName
        });
      });
      
      // Skip holes where nobody has played yet (all strokes are 0)
      const playersWhoPlayed = holeScores.filter(h => h.gross > 0);
      if (playersWhoPlayed.length === 0) {
        // Skip this hole - nobody has played it yet
        continue;
      }
      
      // Players who played this hole (removed console.log)
      
      // First, determine overall hole results for tracking
      const bestScore = Math.min(...holeScores.filter(h => h.gross > 0).map(h => h.strokes));
      const winners = holeScores.filter(h => h.gross > 0 && h.strokes === bestScore);
      
      // Track hole results for each player
      holeScores.forEach(score => {
        const details = playerDetails.get(score.userId)!;
        
        // Only track results for players who have played this hole
        if (score.gross > 0) {
          if (score.strokes === bestScore) {
            if (winners.length === 1) {
              // Won the hole outright
              details.holesWon++;
              details.holeResults.push('W');
            } else {
              // Tied for best on the hole
              details.holesTied++;
              details.holeResults.push('T');
            }
          } else {
            // Lost the hole
            details.holeResults.push('L');
          }
        }
      });
      
      // Then do pairwise comparisons for points
      for (let i = 0; i < holeScores.length; i++) {
        for (let j = i + 1; j < holeScores.length; j++) {
          const player1 = holeScores[i];
          const player2 = holeScores[j];
          
          // Only compare if both players have played this hole
          if (player1.gross === 0 || player2.gross === 0) {
            continue; // Skip comparison if either player hasn't played
          }
          
          const currentPoints1 = playerPoints.get(player1.userId)!;
          const currentPoints2 = playerPoints.get(player2.userId)!;
          
          if (player1.strokes < player2.strokes) {
            // Player 1 wins this head-to-head
            playerPoints.set(player1.userId, currentPoints1 + pointsForWin);
            // Player 1 wins this head-to-head
          } else if (player2.strokes < player1.strokes) {
            // Player 2 wins this head-to-head
            playerPoints.set(player2.userId, currentPoints2 + pointsForWin);
            // Player 2 wins this head-to-head
          } else {
            // Tied head-to-head
            playerPoints.set(player1.userId, currentPoints1 + pointsForTie);
            playerPoints.set(player2.userId, currentPoints2 + pointsForTie);
            // Tied head-to-head
          }
        }
      }
    }
    
    // Calculate final points (removed console.log)
    
    // Create leaderboard entries
    const entries: LeaderboardEntry[] = scorecards.map(card => {
      const points = playerPoints.get(card.userId) || 0;
      const details = playerDetails.get(card.userId)!;
      const holesLost = numHoles - details.holesWon - details.holesTied;
      
      // Create match status
      let matchStatus: string;
      if (scorecards.length === 2) {
        // Head-to-head format
        const opponent = scorecards.find(c => c.userId !== card.userId)!;
        const opponentPoints = playerPoints.get(opponent.userId) || 0;
        const lead = points - opponentPoints;
        const holesRemaining = 18 - numHoles;
        
        if (lead > holesRemaining * pointsForWin) {
          matchStatus = `Won ${lead}&${holesRemaining}`;
        } else if (numHoles === 18) {
          if (lead > 0) {
            matchStatus = `Won ${lead} up`;
          } else if (lead < 0) {
            matchStatus = `Lost ${Math.abs(lead)} down`;
          } else {
            matchStatus = 'All Square';
          }
        } else {
          if (lead > 0) {
            matchStatus = `${lead} up`;
          } else if (lead < 0) {
            matchStatus = `${Math.abs(lead)} down`;
          } else {
            matchStatus = 'All Square';
          }
        }
      } else {
        // Multi-player format
        matchStatus = `${points} pts from ${numHoles} holes`;
      }
      
      return {
        position: 0, // Will be assigned after sorting
        playerId: card.userId,
        playerName: card.playerName,
        score: points, // Always whole numbers (2 for win, 1 for tie, 0 for loss)
        details: {
          holesWon: details.holesWon,
          holesLost,
          holesTied: details.holesTied,
          holeResults: details.holeResults,
          matchStatus,
          totalPoints: points
        }
      };
    });
    
    // Sort by points (highest first), with tiebreakers
    entries.sort((a, b) => {
      const pointsDiff = (b.score as number) - (a.score as number);
      if (pointsDiff !== 0) return pointsDiff;
      
      // Tiebreaker 1: Most outright holes won (not shared)
      const holesDiff = (b.details.holesWon || 0) - (a.details.holesWon || 0);
      if (holesDiff !== 0) return holesDiff;
      
      // Tiebreaker 2: Fewest total strokes
      const aCard = scorecards.find(c => c.userId === a.playerId);
      const bCard = scorecards.find(c => c.userId === b.playerId);
      const aStrokes = aCard?.totalStrokes || 0;
      const bStrokes = bCard?.totalStrokes || 0;
      
      return aStrokes - bStrokes; // Lower strokes is better
    });
    
    // Assign positions
    this.assignPositions(entries);
    
    return entries;
  }


  /**
   * Skins - Winner takes all per hole (higher is better)
   */
  private static calculateSkins(
    scorecards: Scorecard[],
    includeHandicap: boolean
  ): LeaderboardEntry[] {
    const skinWins = new Map<string, number[]>();
    const skinValues = new Map<number, number>(); // Hole number -> skin value
    const holeDetails: any[] = []; // Track each hole's calculation for debugging
    
    // Initialize
    scorecards.forEach(card => {
      skinWins.set(card.userId, []);
    });
    
    // Check each hole
    const numHoles = Math.min(...scorecards.map(c => c.holes.length));
    let carryOver = 0;
    
    for (let holeIdx = 0; holeIdx < numHoles; holeIdx++) {
      const holeNumber = holeIdx + 1;
      const currentSkinValue = 1 + carryOver;
      
      // Get scores for this hole
      const holeScores = scorecards.map(card => {
        const hole = card.holes[holeIdx];
        let netStrokes = hole.strokes;
        const personalPar = hole.par;
        
        // Apply handicap strokes to reduce net strokes (and effective personal par)
        if (includeHandicap && card.playingHandicap) {
          const strokesReceived = this.getHandicapStrokes(
            card.playingHandicap,
            hole.strokeIndex,
            numHoles
          );
          netStrokes -= strokesReceived;
          // Personal par effectively becomes lower when you get strokes
          // But we keep it as par for the difference calculation
        }
        
        // Calculate score vs personal par (this is what we compare in skins)
        const scoreVsPar = netStrokes - personalPar;
        
        return {
          userId: card.userId,
          playerName: card.playerName,
          strokes: hole.strokes, // Raw strokes
          netStrokes, // Strokes after handicap
          personalPar,
          scoreVsPar, // This is what determines the winner
          gross: hole.strokes
        };
      });
      
      // Find the winner based on score vs personal par (must be outright, no ties)
      holeScores.sort((a, b) => a.scoreVsPar - b.scoreVsPar);
      const bestScoreVsPar = holeScores[0].scoreVsPar;
      const winners = holeScores.filter(s => s.scoreVsPar === bestScoreVsPar);
      
      // Create detailed log for this hole
      const holeDetail = {
        hole: holeNumber,
        carryOverBefore: carryOver,
        skinValue: currentSkinValue,
        par: holeScores[0].personalPar, // Should be same for all players
        scores: holeScores.map(s => ({
          player: s.playerName,
          strokes: s.strokes,
          netStrokes: s.netStrokes,
          scoreVsPar: s.scoreVsPar,
          display: s.scoreVsPar === 0 ? 'E' : s.scoreVsPar > 0 ? `+${s.scoreVsPar}` : `${s.scoreVsPar}`
        })),
        bestScoreVsPar,
        winnersCount: winners.length,
        result: '',
        carryOverAfter: 0
      };
      
      if (winners.length === 1) {
        // We have a winner!
        const winnerId = winners[0].userId;
        const winnerName = winners[0].playerName;
        const winnerScore = winners[0].scoreVsPar;
        const winnerScoreDisplay = winnerScore === 0 ? 'E' : winnerScore > 0 ? `+${winnerScore}` : `${winnerScore}`;
        const wins = skinWins.get(winnerId)!;
        wins.push(holeNumber);
        skinValues.set(holeNumber, currentSkinValue);
        
        holeDetail.result = `${winnerName} wins ${currentSkinValue} skin${currentSkinValue > 1 ? 's' : ''} with ${winnerScoreDisplay}`;
        holeDetail.carryOverAfter = 0;
        carryOver = 0; // Reset carryover
      } else {
        // Tied - carry over 1 skin to next hole (FIXED: was adding currentSkinValue)
        const tiedScore = bestScoreVsPar === 0 ? 'E' : bestScoreVsPar > 0 ? `+${bestScoreVsPar}` : `${bestScoreVsPar}`;
        holeDetail.result = `Tied at ${tiedScore} (${winners.length} players) - ${currentSkinValue} skin${currentSkinValue > 1 ? 's' : ''} carry forward`;
        carryOver += 1; // FIXED: Only add 1 for the tied hole, not currentSkinValue
        holeDetail.carryOverAfter = carryOver;
      }
      
      holeDetails.push(holeDetail);
      console.log(`[Skins] Hole ${holeNumber}: ${holeDetail.result} (carryover: ${holeDetail.carryOverBefore} → ${holeDetail.carryOverAfter})`);
    }
    
    // Calculate total skins won
    const entries = scorecards.map(card => {
      const holesWon = skinWins.get(card.userId) || [];
      const totalSkins = holesWon.reduce((sum, hole) => sum + (skinValues.get(hole) || 1), 0);
      
      return {
        position: 0,
        playerId: card.userId,
        playerName: card.playerName,
        score: totalSkins,
        details: {
          skinsWon: totalSkins,
          holesWon: holesWon,
          skinValues: holesWon.map(h => ({ hole: h, value: skinValues.get(h) || 1 })),
          grossScore: card.totalStrokes,
          holeByHoleDetails: holeDetails // Include detailed calculation log
        }
      };
    });
    
    // Sort by skins won
    entries.sort((a, b) => (b.score as number) - (a.score as number));
    this.assignPositions(entries);
    
    return entries;
  }

  /**
   * Helper: Calculate handicap strokes for a hole
   */
  private static getHandicapStrokes(
    handicap: number,
    strokeIndex: number,
    numHoles: number
  ): number {
    // Adjust handicap for partial rounds
    const adjustedHandicap = Math.round(handicap * (numHoles / 18));
    
    if (adjustedHandicap >= strokeIndex) {
      // Gets a stroke on this hole
      if (adjustedHandicap >= 18 + strokeIndex) {
        return 2; // Gets 2 strokes
      }
      return 1;
    }
    return 0;
  }

  /**
   * Helper: Assign positions handling ties
   */
  private static assignPositions(entries: LeaderboardEntry[]): void {
    let currentPosition = 1;
    
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].score !== entries[i - 1].score) {
        currentPosition = i + 1;
      }
      entries[i].position = currentPosition;
    }
  }
}
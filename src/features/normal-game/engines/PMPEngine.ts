/**
 * PMPEngine - Calculates Player Match Par (personal par per hole)
 * Distributes match handicap strokes across holes based on strategy
 */

import type { MatchHandicapResult, Hole } from './MatchHandicapEngine';

// ==========================================
// Type Definitions
// ==========================================

export interface PlayerMatchPar {
  userId: string;
  holeNumber: number;
  holePar: number;
  strokesReceived: number;
  playerMatchPar: number;
  isGhost?: boolean;
  putts?: number;  // Putts from ghost scorecard (for future use)
}

export interface PMPDistributionStrategy {
  name: string;
  description: string;
  distribute(
    matchHandicap: number,
    holes: Hole[],
    userId: string
  ): PlayerMatchPar[];
}

// ==========================================
// Distribution Strategies
// ==========================================

/**
 * Normal Distribution - By Stroke Index
 * Strokes go to hardest holes first
 */
class StrokeIndexDistribution implements PMPDistributionStrategy {
  name = 'stroke_index';
  description = 'Strokes allocated to hardest holes first';

  distribute(
    matchHandicap: number,
    holes: Hole[],
    userId: string
  ): PlayerMatchPar[] {
    // Sort holes by stroke index to allocate strokes to hardest holes first
    const sortedByStrokeIndex = [...holes].sort((a, b) => a.strokeIndex - b.strokeIndex);
    
    // Allocate strokes based on the adjusted match handicap
    const strokeAllocation = new Map<number, number>();
    let remainingStrokes = matchHandicap;
    
    // First pass: give 1 stroke to each hole in SI order
    for (const hole of sortedByStrokeIndex) {
      if (remainingStrokes > 0) {
        strokeAllocation.set(hole.holeNumber, 1);
        remainingStrokes--;
      } else {
        strokeAllocation.set(hole.holeNumber, 0);
      }
    }
    
    // Second pass: give additional strokes if MH > number of holes
    if (remainingStrokes > 0) {
      for (const hole of sortedByStrokeIndex) {
        if (remainingStrokes > 0) {
          const currentStrokes = strokeAllocation.get(hole.holeNumber) || 0;
          strokeAllocation.set(hole.holeNumber, currentStrokes + 1);
          remainingStrokes--;
        }
      }
    }
    
    // Third pass: give third stroke if MH > 2 * number of holes
    if (remainingStrokes > 0) {
      for (const hole of sortedByStrokeIndex) {
        if (remainingStrokes > 0) {
          const currentStrokes = strokeAllocation.get(hole.holeNumber) || 0;
          strokeAllocation.set(hole.holeNumber, currentStrokes + 1);
          remainingStrokes--;
        }
      }
    }
    
    // Return PMPs in original hole order
    return holes.map(hole => {
      const strokesReceived = strokeAllocation.get(hole.holeNumber) || 0;
      
      return {
        userId,
        holeNumber: hole.holeNumber,
        holePar: hole.par,
        strokesReceived,
        playerMatchPar: hole.par + strokesReceived
      };
    });
  }
}

/**
 * Even Distribution - Spread strokes evenly
 * For future use - spreads strokes as evenly as possible
 */
class EvenDistribution implements PMPDistributionStrategy {
  name = 'even';
  description = 'Strokes spread evenly across all holes';

  distribute(
    matchHandicap: number,
    holes: Hole[],
    userId: string
  ): PlayerMatchPar[] {
    const baseStrokes = Math.floor(matchHandicap / holes.length);
    const extraStrokes = matchHandicap % holes.length;
    
    return holes.map((hole, index) => {
      // Give base strokes to all, plus one extra to first n holes
      const strokesReceived = baseStrokes + (index < extraStrokes ? 1 : 0);
      
      return {
        userId,
        holeNumber: hole.holeNumber,
        holePar: hole.par,
        strokesReceived,
        playerMatchPar: hole.par + strokesReceived
      };
    });
  }
}

/**
 * Random Distribution - Random stroke allocation
 */
class RandomDistribution implements PMPDistributionStrategy {
  name = 'random';
  description = 'Strokes distributed randomly';

  distribute(
    matchHandicap: number,
    holes: Hole[],
    userId: string
  ): PlayerMatchPar[] {
    // Create array to track strokes per hole
    const strokesPerHole = new Array(holes.length).fill(0);
    let remainingStrokes = matchHandicap;
    
    // Use seeded random for consistency within a game
    const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Randomly distribute strokes
    while (remainingStrokes > 0) {
      const randomIndex = this.seededRandom(seed + remainingStrokes) * holes.length;
      const holeIndex = Math.floor(randomIndex);
      strokesPerHole[holeIndex]++;
      remainingStrokes--;
    }
    
    return holes.map((hole, index) => ({
      userId,
      holeNumber: hole.holeNumber,
      holePar: hole.par,
      strokesReceived: strokesPerHole[index],
      playerMatchPar: hole.par + strokesPerHole[index]
    }));
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}

/**
 * Controlled Random Distribution - For Lucky Draw mode
 * Random allocation with caps and spread requirements for playability
 */
class ControlledRandomDistribution implements PMPDistributionStrategy {
  name = 'controlled_random';
  description = 'Random distribution with playability controls';

  distribute(
    matchHandicap: number,
    holes: Hole[],
    userId: string
  ): PlayerMatchPar[] {
    // Calculate what the original 18-hole match handicap would be
    // This is needed to determine proper max strokes per hole
    const holesPlayed = holes.length;
    const original18HoleMatchHandicap = Math.round(matchHandicap * (18 / holesPlayed));
    
    // Determine constraints based on ORIGINAL 18-hole Match HC range
    const maxPerHole = this.getMaxStrokesPerHole(original18HoleMatchHandicap);
    
    // Initialize stroke allocation
    const strokeAllocation = new Array(holes.length).fill(0);
    let remainingStrokes = matchHandicap;
    
    // Pure random distribution - one stroke at a time
    while (remainingStrokes > 0) {
      // Try to find a random hole that can receive a stroke
      let attempts = 0;
      const maxAttempts = holes.length * 10; // Prevent infinite loop
      
      while (attempts < maxAttempts) {
        // Pick a random hole
        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        
        // Check if this hole can receive another stroke
        if (strokeAllocation[randomHoleIndex] < maxPerHole) {
          strokeAllocation[randomHoleIndex]++;
          remainingStrokes--;
          break;
        }
        
        attempts++;
      }
      
      // Safety check: if we can't find a hole after many attempts, 
      // find any available hole (shouldn't happen with proper max settings)
      if (attempts >= maxAttempts && remainingStrokes > 0) {
        const availableHole = strokeAllocation.findIndex(s => s < maxPerHole);
        if (availableHole !== -1) {
          strokeAllocation[availableHole]++;
          remainingStrokes--;
        } else {
          break; // No holes available (shouldn't happen)
        }
      }
    }
    
    // Convert to PlayerMatchPar format
    return holes.map((hole, index) => ({
      userId,
      holeNumber: hole.holeNumber,
      holePar: hole.par,
      strokesReceived: strokeAllocation[index],
      playerMatchPar: hole.par + strokeAllocation[index]
    }));
  }
  
  private getMaxStrokesPerHole(original18HoleMatchHandicap: number): number {
    // These thresholds are based on the original 18-hole match handicap
    if (original18HoleMatchHandicap <= 9) return 1;
    if (original18HoleMatchHandicap <= 27) return 2;
    return 3; // Cap at 3 for all higher handicaps
  }
  
  // Unused method - commented out to fix TypeScript warning
  /*
  private getMinHolesNeeded(matchHandicap: number, maxPerHole: number, totalHoles: number = 18): number {
    // Calculate base minimum holes needed
    let minHoles: number;
    
    if (matchHandicap <= 9) {
      minHoles = matchHandicap; // Each stroke on different hole
    } else if (matchHandicap <= 18) {
      minHoles = Math.max(9, Math.ceil(matchHandicap / 2));
    } else if (matchHandicap <= 27) {
      minHoles = Math.max(10, Math.ceil(matchHandicap / maxPerHole));
    } else if (matchHandicap <= 36) {
      minHoles = Math.max(12, Math.ceil(matchHandicap / maxPerHole));
    } else {
      // 37+
      minHoles = Math.max(15, Math.ceil(matchHandicap / maxPerHole));
    }
    
    // Cap minimum holes by actual holes being played
    return Math.min(minHoles, totalHoles);
  }
  */
}

/**
 * Ghost Distribution - Uses actual scores from a past game
 * For ghost mode - replays exact scores from selected game
 */
class GhostDistribution implements PMPDistributionStrategy {
  name = 'ghost';
  description = 'Actual scores from past game';

  private scorecard?: Map<number, { strokes: number; putts: number }>;

  constructor(scorecard?: Map<number, { strokes: number; putts: number }>) {
    this.scorecard = scorecard;
  }

  distribute(
    _matchHandicap: number,  // Not used for ghosts (prefixed with _ to indicate unused)
    holes: Hole[],
    userId: string
  ): PlayerMatchPar[] {
    // For ghost mode, only return PMPs for holes that exist in the scorecard
    // This ensures the match adapts to the exact number of holes played historically
    const pmps: PlayerMatchPar[] = [];
    
    // If we have a scorecard, only process holes that exist in it
    if (this.scorecard && this.scorecard.size > 0) {
      // Only process holes that exist in the historical scorecard
      for (const hole of holes) {
        const scorecardData = this.scorecard.get(hole.holeNumber);
        if (scorecardData) {
          pmps.push({
            userId,
            holeNumber: hole.holeNumber,
            holePar: hole.par,
            strokesReceived: scorecardData.strokes - hole.par,  // Shows how many over/under par
            playerMatchPar: scorecardData.strokes,  // Their actual score IS their target
            isGhost: true,
            putts: scorecardData.putts  // Store putts for future use
          });
        }
      }
    } else {
      // Fallback if no scorecard (shouldn't happen in proper ghost mode)
      console.warn(`No scorecard data for ghost distribution`);
      return holes.map(hole => ({
        userId,
        holeNumber: hole.holeNumber,
        holePar: hole.par,
        strokesReceived: 0,
        playerMatchPar: hole.par,
        isGhost: true
      }));
    }
    
    return pmps;
  }
}

// ==========================================
// Main PMP Engine
// ==========================================

export class PMPEngine {
  private static strategies = new Map<string, PMPDistributionStrategy>([
    ['stroke_index', new StrokeIndexDistribution()],
    ['even', new EvenDistribution()],
    ['random', new RandomDistribution()],  // Legacy random (uncapped)
    ['controlled_random', new ControlledRandomDistribution()]  // New Lucky Draw
  ]);

  /**
   * Calculate PMP for all players based on their match handicaps
   * Distribution method is determined by handicap type
   * IMPORTANT: Adjusts Match Handicap based on number of holes played
   */
  static async calculatePMP(
    matchHandicaps: MatchHandicapResult[],
    holes: Hole[],
    handicapType: string,
    ghostGameIds?: Map<string, number> // userId -> gameId for ghost players
  ): Promise<Map<string, PlayerMatchPar[]>> {
    const pmpMap = new Map<string, PlayerMatchPar[]>();
    
    // Store the original holes for reference
    let actualHoles = holes;
    // const holesPlayed = holes.length;
    // const adjustmentFactor = holesPlayed / 18;
    
    // Fetch ghost scorecards if game IDs are provided
    const ghostScorecards = new Map<string, Map<number, { strokes: number; putts: number }>>();
    let ghostHoleNumbers: number[] | null = null; // Track which holes were played in ghost game
    
    if (ghostGameIds && ghostGameIds.size > 0) {
      console.log('[PMPEngine] Loading ghost scorecards for:', Array.from(ghostGameIds.entries()));
      const { dataService } = await import('../../../services/data/DataService');
      
      for (const [userId, gameId] of ghostGameIds.entries()) {
        try {
          // Fetch hole scores for this game
          const holeScores = await dataService.games.getGameHoleScores(gameId.toString());
          
          if (holeScores && holeScores.length > 0) {
            // For ghost mode, we're replaying a specific game
            // Since it's a selected game with one player's scores, just use all scores
            // This works for personal best, friend best, and course record
            const playerScores = holeScores;
            
            // Convert to scorecard map (handles both 9 and 18 hole rounds)
            const scorecard = new Map<number, { strokes: number; putts: number }>();
            playerScores.forEach(score => {
              scorecard.set(score.hole_number, {
                strokes: score.strokes,
                putts: score.putts || 0
              });
            });
            
            // Track which holes were actually played in the ghost game
            if (!ghostHoleNumbers && scorecard.size > 0) {
              ghostHoleNumbers = Array.from(scorecard.keys()).sort((a, b) => a - b);
              console.log(`Ghost game has ${ghostHoleNumbers.length} holes:`, ghostHoleNumbers);
            }
            
            // Store scorecard for ALL players in ghost mode
            // In ghost mode, all players (real and ghost) need access to the historical scorecard
            // Store it with the userId from the map (which could be any player)
            ghostScorecards.set(userId, scorecard);
            
            // Also store for all players in the match
            // This ensures every player can access the scorecard regardless of their userId
            for (const player of matchHandicaps) {
              console.log(`[PMPEngine] Storing scorecard for player: ${player.userId}`);
              ghostScorecards.set(player.userId, scorecard);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch ghost scorecard for ${userId}, game ${gameId}:`, error);
        }
      }
    }
    
    // In ghost mode, use ONLY the holes from the historical game
    if (handicapType === 'ghost' && ghostHoleNumbers && ghostHoleNumbers.length > 0) {
      // Use exactly the holes that were played in the ghost game
      actualHoles = holes.filter(hole => ghostHoleNumbers.includes(hole.holeNumber));
      console.log(`Ghost mode: Using ${ghostHoleNumbers.length} holes from historical game (holes ${ghostHoleNumbers.join(', ')})`);
    }
    
    // Process each player
    for (const { userId, matchHandicap, isGhost } of matchHandicaps) {
      // In ghost mode, everyone has 0 handicap (scratch play)
      // For other modes, adjust the match handicap proportionally for holes played
      const adjustedMatchHandicap = handicapType === 'ghost' ? 0 : Math.round(matchHandicap * (actualHoles.length / 18));
      
      let distribution: PMPDistributionStrategy;
      
      // In ghost mode, BOTH real players and ghosts use the historical scorecard
      if (handicapType === 'ghost') {
        // In ghost mode, all players use the same scorecard
        // Just get it with the current userId
        const scorecard = ghostScorecards.get(userId);
        
        if (scorecard) {
          // Both player and ghost use the same historical scorecard
          distribution = new GhostDistribution(scorecard);
        } else {
          // Fallback if no scorecard found (shouldn't happen in proper ghost mode)
          console.warn(`[PMPEngine] No scorecard found for ${userId} in ghost mode. Available keys:`, Array.from(ghostScorecards.keys()));
          distribution = this.strategies.get('stroke_index')!;
        }
      } else if (isGhost && ghostScorecards.has(userId)) {
        // This shouldn't happen anymore but keep for safety
        const scorecard = ghostScorecards.get(userId);
        distribution = new GhostDistribution(scorecard);
      } else if (handicapType === 'random') {
        // Use controlled random for Lucky Draw mode
        distribution = this.strategies.get('controlled_random')!;
      } else {
        // Default to stroke index distribution
        distribution = this.strategies.get('stroke_index')!;
      }
      
      // Use ADJUSTED match handicap for distribution with actualHoles (filtered for ghost mode)
      const playerPMPs = distribution.distribute(adjustedMatchHandicap, actualHoles, userId);
      
      // Mark ghost players
      if (isGhost) {
        playerPMPs.forEach(pmp => pmp.isGhost = true);
      }
      
      pmpMap.set(userId, playerPMPs);
    }
    
    return pmpMap;
  }

  /**
   * Register a custom distribution strategy
   */
  static registerStrategy(name: string, strategy: PMPDistributionStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * Get available distribution strategies
   */
  static getAvailableStrategies(): PMPDistributionStrategy[] {
    return Array.from(this.strategies.values());
  }
}

// ==========================================
// Game Type Definitions with Display Names
// ==========================================

export const GAME_TYPES = {
  // Traditional Handicap Types
  match_play: {
    id: 'match_play',
    displayName: 'Match Play',
    shortName: 'Match',
    description: 'Classic match play with relative handicaps',
    icon: '⚔️',
    category: 'traditional'
  },
  stroke_play: {
    id: 'stroke_play',
    displayName: 'Stroke Play',
    shortName: 'Stroke',
    description: 'Traditional stroke play with full handicaps',
    icon: '🎯',
    category: 'traditional'
  },
  none: {
    id: 'none',
    displayName: 'Scratch Golf',
    shortName: 'Scratch',
    description: 'No handicap - pure skill',
    icon: '💪',
    category: 'traditional'
  },
  random: {
    id: 'random',
    displayName: 'Lucky Draw',
    shortName: 'Lucky',
    description: 'Random handicaps for fun',
    icon: '🎲',
    category: 'fun'
  },
  
  // Ghost Mode Types
  ghost_personal: {
    id: 'ghost_personal',
    displayName: 'Beat Your Best',
    shortName: 'Personal Best',
    description: 'Compete against your best round on this course',
    icon: '👻',
    category: 'ghost'
  },
  ghost_friend: {
    id: 'ghost_friend',
    displayName: 'Chase a Friend',
    shortName: 'Friend Ghost',
    description: 'Compete against a friend\'s best round',
    icon: '👥',
    category: 'ghost'
  },
  ghost_record: {
    id: 'ghost_record',
    displayName: 'Course Challenge',
    shortName: 'Course Record',
    description: 'Try to beat the course record',
    icon: '🏆',
    category: 'ghost'
  },
  
  // Future Additions
  personal_par: {
    id: 'personal_par',
    displayName: 'Your Par',
    shortName: 'Personal',
    description: 'Par based on your typical performance',
    icon: '📊',
    category: 'adaptive',
    comingSoon: true
  },
  weather_adjusted: {
    id: 'weather_adjusted',
    displayName: 'Weather Factor',
    shortName: 'Weather',
    description: 'Handicap adjusted for conditions',
    icon: '🌦️',
    category: 'adaptive',
    comingSoon: true
  },
  team_scramble: {
    id: 'team_scramble',
    displayName: 'Team Scramble',
    shortName: 'Scramble',
    description: 'Best ball team format',
    icon: '👨‍👩‍👦‍👦',
    category: 'team',
    comingSoon: true
  }
} as const;

export type GameTypeId = keyof typeof GAME_TYPES;

// Helper to get display info
export function getGameTypeInfo(typeId: string) {
  return GAME_TYPES[typeId as GameTypeId] || {
    id: typeId,
    displayName: typeId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    shortName: typeId,
    description: 'Custom game type',
    icon: '⛳',
    category: 'custom'
  };
}

// Types are already exported at declaration
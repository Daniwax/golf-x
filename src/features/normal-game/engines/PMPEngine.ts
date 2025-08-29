/**
 * PMPEngine - Calculates Player Match Par (personal par per hole)
 * Distributes match handicap strokes across holes based on strategy
 */

import { getStrokesOnHole } from '../utils/handicapCalculations';
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
    return holes.map(hole => {
      const strokesReceived = getStrokesOnHole(hole.strokeIndex, matchHandicap);
      
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
    // Determine constraints based on Match HC range (ADJUSTED)
    const maxPerHole = this.getMaxStrokesPerHole(matchHandicap);
    const minHolesNeeded = this.getMinHolesNeeded(matchHandicap, maxPerHole, holes.length);
    
    // Initialize stroke allocation
    const strokeAllocation = new Array(holes.length).fill(0);
    let remainingStrokes = matchHandicap;
    
    // Randomly select which holes will receive strokes
    const shuffledIndices = [...Array(holes.length).keys()]
      .sort(() => Math.random() - 0.5);
    const selectedHoles = shuffledIndices.slice(0, minHolesNeeded);
    
    // First pass: Distribute base strokes evenly to selected holes
    const baseStrokes = Math.floor(matchHandicap / minHolesNeeded);
    selectedHoles.forEach(holeIndex => {
      const strokes = Math.min(baseStrokes, maxPerHole);
      strokeAllocation[holeIndex] = strokes;
      remainingStrokes -= strokes;
    });
    
    // Second pass: Distribute remaining strokes randomly
    while (remainingStrokes > 0) {
      // Find holes that can still receive strokes
      const availableHoles = strokeAllocation
        .map((strokes, idx) => ({ idx, strokes }))
        .filter(h => h.strokes < maxPerHole);
      
      if (availableHoles.length === 0) break;
      
      // Randomly select a hole and add a stroke
      const randomHole = availableHoles[
        Math.floor(Math.random() * availableHoles.length)
      ];
      strokeAllocation[randomHole.idx]++;
      remainingStrokes--;
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
  
  private getMaxStrokesPerHole(matchHandicap: number): number {
    if (matchHandicap <= 9) return 1;
    if (matchHandicap <= 27) return 2;
    return 3; // Cap at 3 for all higher handicaps
  }
  
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
}

/**
 * Historical Distribution - Based on past performance
 * For ghost mode - uses actual strokes from best round
 */
class HistoricalDistribution implements PMPDistributionStrategy {
  name = 'historical';
  description = 'Based on actual past performance';

  constructor(private historicalScores?: Map<number, number>) {}

  distribute(
    matchHandicap: number,
    holes: Hole[],
    userId: string
  ): PlayerMatchPar[] {
    return holes.map(hole => {
      // If we have historical data, use it
      const historicalScore = this.historicalScores?.get(hole.holeNumber);
      let strokesReceived = 0;
      let playerMatchPar = hole.par;
      
      if (historicalScore !== undefined) {
        // Calculate strokes received based on historical score
        strokesReceived = Math.max(0, historicalScore - hole.par);
        playerMatchPar = historicalScore;
      } else {
        // Fallback to normal distribution
        strokesReceived = getStrokesOnHole(hole.strokeIndex, matchHandicap);
        playerMatchPar = hole.par + strokesReceived;
      }
      
      return {
        userId,
        holeNumber: hole.holeNumber,
        holePar: hole.par,
        strokesReceived,
        playerMatchPar,
        isGhost: userId.includes('ghost')
      };
    });
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
    ['controlled_random', new ControlledRandomDistribution()],  // New Lucky Draw
    ['historical', new HistoricalDistribution()]
  ]);

  /**
   * Calculate PMP for all players based on their match handicaps
   * Distribution method is determined by handicap type
   * IMPORTANT: Adjusts Match Handicap based on number of holes played
   */
  static calculatePMP(
    matchHandicaps: MatchHandicapResult[],
    holes: Hole[],
    handicapType: string,
    historicalData?: Map<string, Map<number, number>> // userId -> holeNumber -> score
  ): Map<string, PlayerMatchPar[]> {
    const pmpMap = new Map<string, PlayerMatchPar[]>();
    
    // CRITICAL: Adjust match handicap for number of holes
    const holesPlayed = holes.length;
    const adjustmentFactor = holesPlayed / 18;
    
    matchHandicaps.forEach(({ userId, matchHandicap, isGhost }) => {
      // Adjust the match handicap proportionally for holes played
      const adjustedMatchHandicap = Math.round(matchHandicap * adjustmentFactor);
      
      let distribution: PMPDistributionStrategy;
      
      // Choose distribution based on handicap type and player type
      if (isGhost && historicalData?.has(userId)) {
        // Use historical distribution for ghosts with data (first N holes)
        const historicalScores = historicalData.get(userId);
        // Filter historical data to only include the holes being played
        const filteredHistorical = new Map<number, number>();
        holes.forEach(hole => {
          const score = historicalScores?.get(hole.holeNumber);
          if (score !== undefined) {
            filteredHistorical.set(hole.holeNumber, score);
          }
        });
        distribution = new HistoricalDistribution(filteredHistorical);
      } else if (handicapType === 'random') {
        // Use controlled random for Lucky Draw mode
        distribution = this.strategies.get('controlled_random')!;
      } else {
        // Default to stroke index distribution
        distribution = this.strategies.get('stroke_index')!;
      }
      
      // Use ADJUSTED match handicap for distribution
      const playerPMPs = distribution.distribute(adjustedMatchHandicap, holes, userId);
      
      // Mark ghost players
      if (isGhost) {
        playerPMPs.forEach(pmp => pmp.isGhost = true);
      }
      
      pmpMap.set(userId, playerPMPs);
    });
    
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

// Export types
export type { PMPDistributionStrategy };
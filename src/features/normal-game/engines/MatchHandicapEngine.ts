/**
 * MatchHandicapEngine - Extensible engine for calculating match handicaps
 * Supports multiple strategies including ghost mode and future expansions
 */

import { dataService } from '../../../services/data/DataService';

// ==========================================
// Type Definitions
// ==========================================

export interface Player {
  userId: string;
  fullName?: string;
  handicapIndex: number;
  courseHandicap: number;
  teeBoxId?: number;
  // playingHandicap removed - format allowances applied in match handicap calculation
}

export interface Hole {
  holeNumber: number;
  par: number;
  strokeIndex: number; // SI (1-18, 1 is hardest)
}

export interface MatchHandicapResult {
  userId: string;
  fullName?: string;
  matchHandicap: number;
  isGhost?: boolean; // For ghost players
  ghostType?: 'personal_best' | 'friend_best' | 'course_record';
}

// Context for additional parameters needed by strategies
export interface HandicapContext {
  courseId: number;
  teeBoxId?: number;
  selectedFriendId?: string; // For ghost mode with friend
  selectedGhostType?: 'personal_best' | 'friend_best' | 'course_record';
  selectedGameId?: number | null; // For replaying specific matches in ghost mode
  // Future additions:
  weatherAdjustment?: boolean;
  seasonalAdjustment?: boolean;
  timeOfDayAdjustment?: boolean;
}

// Strategy interface for extensibility
export interface HandicapStrategy {
  name: string;
  description: string;
  requiresHistoricalData?: boolean;
  calculate(
    players: Player[],
    context: HandicapContext
  ): Promise<MatchHandicapResult[]>;
}

// ==========================================
// Handicap Strategies
// ==========================================

/**
 * Match Play Strategy - Relative to lowest handicap
 */
class MatchPlayStrategy implements HandicapStrategy {
  name = 'match_play';
  description = 'Relative handicap - lowest plays off scratch';

  async calculate(players: Player[]): Promise<MatchHandicapResult[]> {
    // Match play uses 100% allowance
    const lowestHandicap = Math.min(...players.map(p => p.courseHandicap));
    return players.map(player => ({
      userId: player.userId,
      fullName: player.fullName,
      matchHandicap: player.courseHandicap - lowestHandicap
    }));
  }
}

/**
 * Stroke Play Strategy - Full handicap for all
 */
class StrokePlayStrategy implements HandicapStrategy {
  name = 'stroke_play';
  description = 'Full handicap for all players';

  async calculate(players: Player[]): Promise<MatchHandicapResult[]> {
    // Stroke play uses 95% allowance, no relative adjustment
    return players.map(player => ({
      userId: player.userId,
      fullName: player.fullName,
      matchHandicap: Math.round(player.courseHandicap * 0.95)
    }));
  }
}

/**
 * No Handicap Strategy - Everyone plays scratch
 */
class NoHandicapStrategy implements HandicapStrategy {
  name = 'none';
  description = 'No handicap adjustments';

  async calculate(players: Player[]): Promise<MatchHandicapResult[]> {
    return players.map(player => ({
      userId: player.userId,
      fullName: player.fullName,
      matchHandicap: 0
    }));
  }
}

/**
 * Lucky Draw Strategy - Fun mode with fair handicapping
 * Uses stroke play calculation (95%) but with random distribution
 */
class RandomHandicapStrategy implements HandicapStrategy {
  name = 'random';
  description = 'Lucky Draw - 95% handicap with random distribution';

  async calculate(players: Player[]): Promise<MatchHandicapResult[]> {
    // Use same calculation as stroke play (95% allowance)
    // The randomness will be in PMP distribution, not in Match HC
    return players.map(player => ({
      userId: player.userId,
      fullName: player.fullName,
      matchHandicap: Math.round(player.courseHandicap * 0.95)
    }));
  }
}

/**
 * Ghost Mode Strategy - Compete against best scorecards
 * Everyone plays scratch (0 handicap) - pure competition against historical scores
 */
class GhostModeStrategy implements HandicapStrategy {
  name = 'ghost';
  description = 'Compete against best scorecards (scratch play)';
  requiresHistoricalData = true;

  async calculate(
    players: Player[],
    context: HandicapContext
  ): Promise<MatchHandicapResult[]> {
    const results: MatchHandicapResult[] = [];
    
    // Ghost mode = 0% handicap allowance (everyone plays scratch)
    const realPlayerHandicaps = players.map(player => ({
      userId: player.userId,
      fullName: player.fullName,
      matchHandicap: 0 // 0% allowance - scratch play
    }));
    results.push(...realPlayerHandicaps);

    // Add a single ghost player if we have a game ID to replay
    // All ghost types work the same - they just differ in which game ID is selected
    if (context.selectedGameId) {
      let ghostUserId = '';
      let ghostName = '';
      
      if (context.selectedGhostType === 'personal_best') {
        // Ghost is the current player's best
        ghostUserId = `ghost_${players[0]?.userId || 'player'}`;
        ghostName = `${players[0]?.fullName || 'You'} (Best)`;
      } else if (context.selectedGhostType === 'friend_best' && context.selectedFriendId) {
        // Ghost is a friend's best
        ghostUserId = `ghost_${context.selectedFriendId}`;
        // Get friend name if possible
        try {
          const profile = await dataService.profiles.getUserProfile(context.selectedFriendId);
          ghostName = `${profile?.full_name || 'Friend'} (Best)`;
        } catch {
          ghostName = 'Friend (Best)';
        }
      } else if (context.selectedGhostType === 'course_record') {
        // Ghost is the course record holder
        ghostUserId = 'ghost_record';
        ghostName = 'Course Record';
      }
      
      if (ghostUserId) {
        results.push({
          userId: ghostUserId,
          fullName: ghostName,
          matchHandicap: 0, // Ghost mode = scratch play
          isGhost: true,
          ghostType: context.selectedGhostType
        });
      }
    }

    return results;
  }

  // Removed unnecessary helper methods - ghost mode now just needs a game ID
}

/**
 * Personal Par Strategy - Based on player's average performance per hole
 * Future implementation
 */
class PersonalParStrategy implements HandicapStrategy {
  name = 'personal_par';
  description = 'Handicap based on your typical performance';
  requiresHistoricalData = true;

  async calculate(
    players: Player[],
    context: HandicapContext
  ): Promise<MatchHandicapResult[]> {
    // TODO: Calculate based on average scores per hole
    // For now, fallback to stroke play
    return new StrokePlayStrategy().calculate(players, context);
  }
}

// ==========================================
// Strategy Registry
// ==========================================

class StrategyRegistry {
  private strategies = new Map<string, HandicapStrategy>();

  constructor() {
    // Register built-in strategies
    this.register(new MatchPlayStrategy());
    this.register(new StrokePlayStrategy());
    this.register(new NoHandicapStrategy());
    this.register(new RandomHandicapStrategy());
    this.register(new GhostModeStrategy());
    this.register(new PersonalParStrategy());
  }

  register(strategy: HandicapStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  get(name: string): HandicapStrategy | undefined {
    return this.strategies.get(name);
  }

  list(): HandicapStrategy[] {
    return Array.from(this.strategies.values());
  }
}

// ==========================================
// Main Engine
// ==========================================

export class MatchHandicapEngine {
  private static registry = new StrategyRegistry();

  /**
   * Calculate match handicaps using the specified strategy
   */
  static async calculateMatchHandicap(
    players: Player[],
    handicapType: string,
    context: HandicapContext
  ): Promise<MatchHandicapResult[]> {
    const strategy = this.registry.get(handicapType);
    
    if (!strategy) {
      console.warn(`Unknown handicap type: ${handicapType}, falling back to match_play`);
      return this.calculateMatchHandicap(players, 'match_play', context);
    }

    try {
      return await strategy.calculate(players, context);
    } catch (error) {
      console.error(`Error calculating handicaps with ${handicapType}:`, error);
      // Fallback to simple match play on error
      return new MatchPlayStrategy().calculate(players, context);
    }
  }

  /**
   * Register a custom handicap strategy
   */
  static registerStrategy(strategy: HandicapStrategy): void {
    this.registry.register(strategy);
  }

  /**
   * Get all available strategies
   */
  static getAvailableStrategies(): HandicapStrategy[] {
    return this.registry.list();
  }

  /**
   * Check if a strategy requires historical data
   */
  static requiresHistoricalData(handicapType: string): boolean {
    const strategy = this.registry.get(handicapType);
    return strategy?.requiresHistoricalData || false;
  }
}

// Export types for use in other modules
export type { HandicapStrategy, HandicapContext };
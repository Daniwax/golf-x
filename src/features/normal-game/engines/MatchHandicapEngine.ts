/**
 * MatchHandicapEngine - Extensible engine for calculating match handicaps
 * Supports multiple strategies including ghost mode and future expansions
 */

import { supabase } from '../../../lib/supabase';

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
 */
class GhostModeStrategy implements HandicapStrategy {
  name = 'ghost';
  description = 'Compete against best scorecards';
  requiresHistoricalData = true;

  async calculate(
    players: Player[],
    context: HandicapContext
  ): Promise<MatchHandicapResult[]> {
    const results: MatchHandicapResult[] = [];
    
    // Add real players with their handicaps (ghost mode uses 100% allowance)
    const realPlayerHandicaps = players.map(player => ({
      userId: player.userId,
      fullName: player.fullName,
      matchHandicap: player.courseHandicap
    }));
    results.push(...realPlayerHandicaps);

    // Add ghost player(s) based on context
    if (context.selectedGhostType === 'personal_best') {
      const ghosts = await this.getPersonalBestGhosts(players, context);
      results.push(...ghosts);
    } else if (context.selectedGhostType === 'friend_best' && context.selectedFriendId) {
      const ghost = await this.getFriendBestGhost(context.selectedFriendId, context);
      if (ghost) results.push(ghost);
    } else if (context.selectedGhostType === 'course_record') {
      const ghost = await this.getCourseRecordGhost(context);
      if (ghost) results.push(ghost);
    }

    // Recalculate as relative handicaps including ghosts
    const lowestHandicap = Math.min(...results.map(r => r.matchHandicap));
    return results.map(result => ({
      ...result,
      matchHandicap: result.matchHandicap - lowestHandicap
    }));
  }

  private async getPersonalBestGhosts(
    players: Player[],
    context: HandicapContext
  ): Promise<MatchHandicapResult[]> {
    const ghosts: MatchHandicapResult[] = [];
    
    for (const player of players) {
      const bestScore = await this.getBestScore(
        player.userId,
        context.courseId,
        context.teeBoxId
      );
      
      if (bestScore) {
        ghosts.push({
          userId: `ghost_${player.userId}`,
          fullName: `${player.fullName} (Best)`,
          matchHandicap: bestScore.effectiveHandicap || 0,
          isGhost: true,
          ghostType: 'personal_best'
        });
      }
    }
    
    return ghosts;
  }

  private async getFriendBestGhost(
    friendId: string,
    context: HandicapContext
  ): Promise<MatchHandicapResult | null> {
    const bestScore = await this.getBestScore(
      friendId,
      context.courseId,
      context.teeBoxId
    );
    
    if (!bestScore) return null;

    // Get friend's name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', friendId)
      .single();

    return {
      userId: `ghost_friend_${friendId}`,
      fullName: `${profile?.full_name || 'Friend'} (Best)`,
      matchHandicap: bestScore.effectiveHandicap || 0,
      isGhost: true,
      ghostType: 'friend_best'
    };
  }

  private async getCourseRecordGhost(
    context: HandicapContext
  ): Promise<MatchHandicapResult | null> {
    // Get course record for this tee
    const { data: record } = await supabase
      .from('game_participants')
      .select(`
        user_id,
        total_strokes,
        profiles!inner(full_name)
      `)
      .eq('course_id', context.courseId)
      .eq('tee_box_id', context.teeBoxId)
      .order('total_strokes', { ascending: true })
      .limit(1)
      .single();

    if (!record) return null;

    // Calculate what handicap would produce this score
    const coursePar = 72; // Should get from course data
    const effectiveHandicap = (record.total_strokes || coursePar) - coursePar;

    return {
      userId: `ghost_record`,
      fullName: `Course Record (${record.profiles.full_name})`,
      matchHandicap: effectiveHandicap,
      isGhost: true,
      ghostType: 'course_record'
    };
  }

  private async getBestScore(
    userId: string,
    courseId: number,
    teeBoxId?: number
  ): Promise<{ totalStrokes: number; effectiveHandicap: number } | null> {
    const query = supabase
      .from('game_participants')
      .select('total_strokes, course_handicap')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('total_strokes', { ascending: true })
      .limit(1);

    if (teeBoxId) {
      query.eq('tee_box_id', teeBoxId);
    }

    const { data } = await query.single();
    
    if (!data) return null;

    // Calculate effective handicap from that round
    const coursePar = 72; // Should get from course data
    const netScore = (data.total_strokes || coursePar) - (data.course_handicap || 0);
    const effectiveHandicap = netScore - coursePar;

    return {
      totalStrokes: data.total_strokes || coursePar,
      effectiveHandicap
    };
  }
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
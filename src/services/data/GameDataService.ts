/**
 * Game Data Service
 * Handles all game-related data operations
 */

import { CacheService } from '../cache/CacheService';
import { getCacheKey, getTTL, getInvalidationPatterns } from '../../config/cache.config';

export class GameDataService {
  constructor(private cache: CacheService) {}

  /**
   * Get user's completed games
   */
  async getUserGameHistory(userId: string, limit: number = 10) {
    const key = getCacheKey('games', 'history', userId, limit);
    return this.cache.get(
      key,
      async () => {
        const { profileGameService } = await import('../../features/normal-game/services/profileGameService');
        return profileGameService.getUserGames(userId, limit);
      },
      getTTL('gameHistory')
    );
  }

  /**
   * Get user's active games with all columns
   */
  async getUserActiveGames(userId: string) {
    const key = getCacheKey('games', 'active', userId);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        const { data: games, error } = await supabase
          .from('games')
          .select(`
            id,
            course_id,
            creator_user_id,
            game_description,
            scoring_format,
            weather_condition,
            status,
            created_at,
            started_at,
            completed_at,
            notes,
            notes_updated_by,
            notes_updated_at,
            handicap_type,
            scoring_method,
            game_participants!inner(
              id,
              game_id,
              user_id,
              tee_box_id,
              handicap_index,
              course_handicap,
              playing_handicap,
              match_handicap,
              total_strokes,
              total_putts,
              net_score,
              front_nine_strokes,
              back_nine_strokes
            )
          `)
          .eq('game_participants.user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return games || [];
      },
      getTTL('activeGames')
    );
  }

  /**
   * Get game details by ID
   */
  async getGameById(gameId: string) {
    const key = getCacheKey('games', 'detail', gameId);
    return this.cache.get(
      key,
      async () => {
        const { gameService } = await import('../../features/normal-game/services/gameService');
        return gameService.getGameDetails(gameId);
      },
      getTTL('gameDetail')
    );
  }

  /**
   * Get game participants
   */
  async getGameParticipants(gameId: string) {
    const key = getCacheKey('games', 'participants', gameId);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        const { data, error } = await supabase
          .from('game_participants')
          .select(`
            id,
            game_id,
            user_id,
            tee_box_id,
            handicap_index,
            course_handicap,
            playing_handicap,
            match_handicap,
            total_strokes,
            total_putts,
            net_score,
            front_nine_strokes,
            back_nine_strokes,
            profiles:user_id (
              id,
              full_name,
              email,
              avatar_url,
              handicap
            )
          `)
          .eq('game_id', gameId);
        
        if (error) throw error;
        return data;
      },
      getTTL('participants')
    );
  }

  /**
   * Get hole scores for a game
   */
  async getGameHoleScores(gameId: string) {
    const key = getCacheKey('games', 'scores', gameId);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        const { data, error } = await supabase
          .from('game_hole_scores')
          .select(`
            id,
            game_id,
            user_id,
            hole_number,
            strokes,
            putts,
            hole_par,
            hole_handicap_strokes,
            net_score,
            score_vs_par,
            updated_at,
            player_match_par
          `)
          .eq('game_id', gameId)
          .order('hole_number');
        
        if (error) throw error;
        return data;
      },
      getTTL('holeScores')
    );
  }

  /**
   * Invalidate game caches
   */
  invalidateGame(gameId: string, userId?: string) {
    const patterns = getInvalidationPatterns('onScoreUpdate', { gameId });
    patterns.forEach(pattern => this.cache.invalidate(pattern));
    
    if (userId) {
      this.cache.invalidate(`games:active:${userId}`);
      this.cache.invalidate(`games:history:${userId}*`);
    }
  }

  /**
   * Invalidate all game caches for a user
   */
  invalidateUserGames(userId: string) {
    this.cache.invalidate(`games:*:${userId}*`);
  }
}
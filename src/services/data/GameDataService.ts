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
        const games = await profileGameService.getUserCompletedGames(userId);
        // Apply limit to the results
        return games.slice(0, limit);
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
        
        // First get participants
        const { data: participants, error: participantsError } = await supabase
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
            back_nine_strokes
          `)
          .eq('game_id', gameId);
        
        if (participantsError) throw participantsError;
        if (!participants || participants.length === 0) return [];
        
        // Get unique user IDs
        const userIds = [...new Set(participants.map(p => p.user_id))];
        
        // Fetch profiles for all users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, handicap')
          .in('id', userIds);
        
        if (profilesError) throw profilesError;
        
        // Create a map for quick lookup
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        // Combine participants with their profiles
        return participants.map(participant => ({
          ...participant,
          profiles: profileMap.get(participant.user_id) || null
        }));
      },
      getTTL('participants')
    );
  }

  /**
   * Get user's completed games on specific course and tee
   * Returns games with basic info and score for dropdown display
   */
  async getUserCompletedGames(userId: string, courseId?: number, teeBoxId?: number) {
    // Build cache key with optional filters
    const keyParts = ['games', 'completed', userId];
    if (courseId) keyParts.push(courseId.toString());
    if (teeBoxId) keyParts.push(teeBoxId.toString());
    const key = keyParts.join(':');
    
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        // Build query
        let query = supabase
          .from('games')
          .select(`
            id,
            game_description,
            course_id,
            created_at,
            completed_at,
            status,
            game_participants!inner (
              user_id,
              tee_box_id,
              total_strokes,
              course_handicap,
              net_score
            )
          `)
          .eq('game_participants.user_id', userId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
        
        // Apply optional filters
        if (courseId) {
          query = query.eq('course_id', courseId);
        }
        if (teeBoxId) {
          query = query.eq('game_participants.tee_box_id', teeBoxId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Format the response with participant data flattened
        return data?.map(game => ({
          id: game.id,
          name: game.game_description || `Game ${game.id}`,
          courseId: game.course_id,
          date: new Date(game.created_at).toLocaleDateString(),
          completedAt: game.completed_at,
          status: game.status,
          // Flatten participant data (there should be only one for this user)
          totalStrokes: game.game_participants[0]?.total_strokes,
          courseHandicap: game.game_participants[0]?.course_handicap,
          netScore: game.game_participants[0]?.net_score,
          teeBoxId: game.game_participants[0]?.tee_box_id
        })) || [];
      },
      getTTL('gameHistory')
    );
  }

  /**
   * Get top completed games on a course/tee by total strokes
   * Used for course record ghost mode - gets best scores from ALL users
   * Only includes standard rounds (9 or 18 holes)
   */
  async getTopCompletedGames(
    courseId: number,
    teeBoxId: number,
    limit: number = 10,
    validHoles: number[] = [9, 18]
  ) {
    const key = getCacheKey('games', 'topscores', courseId.toString(), teeBoxId.toString(), limit.toString());
    
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        // Query for best scores across ALL users on this course/tee
        // Filter for standard rounds only (9 or 18 holes)
        const { data, error } = await supabase
          .from('games')
          .select(`
            id,
            game_description,
            course_id,
            created_at,
            completed_at,
            status,
            num_holes,
            game_participants!inner (
              user_id,
              tee_box_id,
              total_strokes,
              course_handicap,
              net_score
            )
          `)
          .eq('course_id', courseId)
          .eq('game_participants.tee_box_id', teeBoxId)
          .eq('status', 'completed')
          .in('num_holes', validHoles)  // Only 9 or 18 hole rounds
          .order('game_participants.total_strokes', { ascending: true })
          .limit(limit);
        
        if (error) throw error;
        
        // Format the response with player info
        return data?.map(game => ({
          id: game.id,
          name: game.game_description || `Game ${game.id}`,
          courseId: game.course_id,
          date: new Date(game.created_at).toLocaleDateString(),
          completedAt: game.completed_at,
          status: game.status,
          numHoles: game.num_holes,
          // Player info from the participant
          userId: game.game_participants[0]?.user_id,
          playerName: 'Unknown Player', // Profile needs to be fetched separately
          totalStrokes: game.game_participants[0]?.total_strokes,
          courseHandicap: game.game_participants[0]?.course_handicap,
          netScore: game.game_participants[0]?.net_score,
          teeBoxId: game.game_participants[0]?.tee_box_id
        })) || [];
      },
      getTTL('gameHistory')
    );
  }

  /**
   * Get user's best score on a specific course and tee
   * Used for ghost mode to find the best round to compete against
   */
  async getUserBestScore(
    userId: string, 
    courseId: number, 
    teeBoxId?: number
  ): Promise<{ totalStrokes: number; courseHandicap: number } | null> {
    // Build cache key
    const keyParts = ['games', 'bestscore', userId, courseId.toString()];
    if (teeBoxId) keyParts.push(teeBoxId.toString());
    const key = keyParts.join(':');
    
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        // Query all completed games for this user on this course
        let query = supabase
          .from('games')
          .select(`
            id,
            course_id,
            game_participants!inner (
              user_id,
              tee_box_id,
              total_strokes,
              course_handicap
            )
          `)
          .eq('course_id', courseId)
          .eq('status', 'completed')
          .eq('game_participants.user_id', userId);

        if (teeBoxId) {
          query = query.eq('game_participants.tee_box_id', teeBoxId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        if (!data || data.length === 0) return null;
        
        // Filter out games with null scores and find the best score
        const validGames = data.filter(game => 
          game.game_participants?.[0]?.total_strokes != null
        );
        
        if (validGames.length === 0) return null;
        
        // Sort by total_strokes to find the best score
        validGames.sort((a, b) => {
          const scoreA = a.game_participants[0].total_strokes;
          const scoreB = b.game_participants[0].total_strokes;
          return scoreA - scoreB;
        });
        
        const bestGame = validGames[0];
        const participant = bestGame.game_participants[0];
        
        return {
          totalStrokes: participant.total_strokes,
          courseHandicap: participant.course_handicap || 0
        };
      },
      getTTL('gameHistory')
    );
  }

  /**
   * Get game scorecard for a specific player
   * Used for ghost mode to replay exact scores from a past game
   */
  async getGameScorecard(gameId: string, userId: string): Promise<Map<number, { strokes: number; putts: number }> | null> {
    const key = getCacheKey('games', 'scorecard', gameId, userId);
    
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        const { data, error } = await supabase
          .from('game_hole_scores')
          .select('hole_number, strokes, putts')
          .eq('game_id', gameId)
          .eq('user_id', userId)
          .order('hole_number');
        
        if (error) throw error;
        if (!data || data.length === 0) return null;
        
        // Convert to Map for easy lookup by hole number
        const scorecard = new Map<number, { strokes: number; putts: number }>();
        data.forEach(hole => {
          if (hole.strokes != null) {
            scorecard.set(hole.hole_number, {
              strokes: hole.strokes,
              putts: hole.putts || 0
            });
          }
        });
        
        return scorecard;
      },
      getTTL('holeScores')
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
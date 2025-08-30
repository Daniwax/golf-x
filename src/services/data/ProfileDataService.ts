/**
 * Profile Data Service
 * Handles profile and social-related data operations
 */

import { CacheService } from '../cache/CacheService';
import { getCacheKey, getTTL, getInvalidationPatterns } from '../../config/cache.config';

export class ProfileDataService {
  private cache: CacheService;
  
  constructor(cache: CacheService) {
    this.cache = cache;
  }

  /**
   * Get user profile with all columns
   */
  async getUserProfile(userId: string) {
    const key = getCacheKey('profile', userId);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            bio,
            handicap,
            avatar_url,
            home_course,
            created_at,
            updated_at
          `)
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        return data;
      },
      getTTL('profile')
    );
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: { full_name?: string; bio?: string; handicap?: number; avatar_url?: string }) {
    const { supabase } = await import('../../lib/supabase');
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Invalidate cache after update
    const patterns = getInvalidationPatterns('onProfileUpdate', { userId });
    patterns.forEach(pattern => this.cache.invalidate(pattern));
    
    return data;
  }

  /**
   * Get user avatar URL
   */
  async getUserAvatar(userId: string) {
    const key = getCacheKey('profile', 'avatar', userId);
    return this.cache.get(
      key,
      async () => {
        const { avatarService } = await import('../../features/profile/services/avatarService');
        return avatarService.getUserAvatars(userId);
      },
      getTTL('avatar')
    );
  }

  /**
   * Get user's friends list
   */
  async getUserFriends(userId: string) {
    const key = getCacheKey('social', 'friends', userId);
    return this.cache.get(
      key,
      async () => {
        const { getFriends } = await import('../../lib/friends');
        const result = await getFriends();
        if (result.error) throw new Error(result.error);
        return result.data;
      },
      getTTL('friends')
    );
  }

  /**
   * Add a friend connection
   */
  async addFriend(userId: string, friendId: string) {
    const { addFriend } = await import('../../lib/friends');
    const result = await addFriend(friendId);
    
    if (!result.error) {
      // Invalidate friend lists for both users
      this.cache.invalidate(`social:friends:${userId}`);
      this.cache.invalidate(`social:friends:${friendId}`);
    }
    
    return result;
  }

  /**
   * Remove a friend connection
   */
  async removeFriend(userId: string, friendId: string) {
    const { removeFriend } = await import('../../lib/friends');
    const result = await removeFriend(friendId);
    
    if (!result.error) {
      // Invalidate friend lists for both users
      this.cache.invalidate(`social:friends:${userId}`);
      this.cache.invalidate(`social:friends:${friendId}`);
    }
    
    return result;
  }

  /**
   * Get a specific friend's profile
   */
  async getFriendProfile(friendId: string) {
    const key = getCacheKey('social', 'friend-profile', friendId);
    return this.cache.get(
      key,
      async () => {
        const { getFriendProfile } = await import('../../lib/friends');
        const result = await getFriendProfile(friendId);
        if (result.error) throw new Error(result.error);
        return result.data;
      },
      getTTL('profile')
    );
  }

  /**
   * Get games played count with friends
   */
  async getGamesPlayedWithFriends(userId: string) {
    const key = getCacheKey('social', 'games-played', userId);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        if (!supabase) return {};
        
        // Get all completed games where current user participated
        const { data: userGames } = await supabase
          .from('game_participants')
          .select('game_id')
          .eq('user_id', userId);
        
        if (!userGames || userGames.length === 0) return {};
        
        const gameIds = userGames.map(g => g.game_id);
        
        // Get all participants from those games
        const { data: allParticipants } = await supabase
          .from('game_participants')
          .select(`
            id,
            game_id,
            user_id,
            games!inner(
              id,
              status
            )
          `)
          .in('game_id', gameIds)
          .eq('games.status', 'completed');
        
        if (!allParticipants) return {};
        
        // Count games played with each friend
        const gamesCount: { [key: string]: Set<string> } = {};
        
        allParticipants.forEach(participant => {
          if (participant.user_id !== userId) {
            if (!gamesCount[participant.user_id]) {
              gamesCount[participant.user_id] = new Set();
            }
            gamesCount[participant.user_id].add(participant.game_id);
          }
        });
        
        // Convert to final count
        const finalCounts: { [key: string]: number } = {};
        Object.keys(gamesCount).forEach(friendId => {
          finalCounts[friendId] = gamesCount[friendId].size;
        });
        
        return finalCounts;
      },
      getTTL('gameHistory')
    );
  }

  /**
   * Invalidate profile caches
   */
  invalidateProfile(userId: string) {
    this.cache.invalidate(`profile:${userId}`);
    this.cache.invalidate(`profile:avatar:${userId}`);
  }

  /**
   * Invalidate social caches
   */
  invalidateSocial(userId: string) {
    this.cache.invalidate(`social:friends:${userId}`);
  }
}
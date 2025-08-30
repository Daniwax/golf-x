/**
 * Custom hook for friends management
 * Provides friends list, games played counts, and friend operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/useAuth';
import { dataService } from '../services/data/DataService';
import type { FriendProfile } from '../lib/friends';

export interface UseFriendsResult {
  friends: FriendProfile[];
  gamesPlayed: { [key: string]: number };
  loading: boolean;
  error: Error | null;
  addFriend: (friendId: string) => Promise<{ error: string | null }>;
  removeFriend: (friendId: string) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

export function useFriends(): UseFriendsResult {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [gamesPlayed, setGamesPlayed] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFriends = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Load friends list and games played in parallel
      const [friendsList, gamesCount] = await Promise.all([
        dataService.profiles.getUserFriends(user.id),
        dataService.profiles.getGamesPlayedWithFriends(user.id)
      ]);
      
      setFriends(friendsList || []);
      setGamesPlayed(gamesCount || {});
    } catch (err) {
      console.error('Error loading friends:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const addFriend = useCallback(async (friendId: string): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }
    
    try {
      const result = await dataService.profiles.addFriend(user.id, friendId);
      if (!result.error) {
        // Reload friends list after successful add
        await loadFriends();
      }
      return result;
    } catch (err) {
      console.error('Error adding friend:', err);
      return { error: (err as Error).message || 'Failed to add friend' };
    }
  }, [user?.id, loadFriends]);

  const removeFriend = useCallback(async (friendId: string): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }
    
    try {
      const result = await dataService.profiles.removeFriend(user.id, friendId);
      if (!result.error) {
        // Reload friends list after successful removal
        await loadFriends();
      }
      return result;
    } catch (err) {
      console.error('Error removing friend:', err);
      return { error: (err as Error).message || 'Failed to remove friend' };
    }
  }, [user?.id, loadFriends]);

  const refresh = useCallback(async () => {
    if (user?.id) {
      // Invalidate cache and reload
      dataService.profiles.invalidateSocial(user.id);
      await loadFriends();
    }
  }, [user?.id, loadFriends]);

  return {
    friends,
    gamesPlayed,
    loading,
    error,
    addFriend,
    removeFriend,
    refresh
  };
}
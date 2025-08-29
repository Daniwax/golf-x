/**
 * Custom hook for managing user profile data
 * Handles loading, updating, and caching of profile information
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/data/DataService';
import { useAuth } from '../lib/useAuth';
import type { Profile, ProfileUpdate, GameStats } from '../services/data/types';

interface UseProfileResult {
  // Profile data
  profile: Profile | null;
  profileLoading: boolean;
  profileError: Error | null;
  
  // Game stats
  gameStats: GameStats;
  statsLoading: boolean;
  
  // Actions
  updateProfile: (updates: ProfileUpdate) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

/**
 * Main hook for profile page
 * Combines profile data and game statistics
 */
export function useProfile(): UseProfileResult {
  const { user } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  
  // Game stats state
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGamesPlayed: 0,
    bestScore: null,
    averageScore: null,
    recentHandicap: null,
    preferredCourse: null
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const profileData = await dataService.profiles.getUserProfile(user.id);
      
      // Set defaults for new users
      if (!profileData) {
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          bio: 'Passionate golfer working to improve my game. Love playing different courses and meeting new people on the course.',
          handicap: 12.5,
          avatar_url: null,
          custom_avatar_url: null,
          home_course: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError(error as Error);
      
      // Set fallback values on error
      setProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        bio: 'Passionate golfer working to improve my game.',
        handicap: 12.5,
        avatar_url: null,
        custom_avatar_url: null,
        home_course: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  // Load game stats
  const loadGameStats = useCallback(async () => {
    if (!user?.id) {
      setStatsLoading(false);
      return;
    }

    setStatsLoading(true);

    try {
      const stats = await dataService.stats.getUserGameStats(user.id);
      setGameStats(stats);
    } catch (error) {
      console.error('Error loading game stats:', error);
      // Keep default stats on error
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates: ProfileUpdate): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      await dataService.profiles.updateUserProfile(user.id, updates);
      
      // Update local state optimistically
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Refresh from server to ensure consistency
      await loadProfile();
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }, [user, loadProfile]);

  // Refresh functions
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      dataService.profiles.invalidateProfile(user.id);
      await loadProfile();
    }
  }, [user, loadProfile]);

  const refreshStats = useCallback(async () => {
    if (user?.id) {
      dataService.stats.invalidateUserStats(user.id);
      await loadGameStats();
    }
  }, [user, loadGameStats]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadProfile();
    loadGameStats();
  }, [loadProfile, loadGameStats]);

  return {
    profile,
    profileLoading,
    profileError,
    gameStats,
    statsLoading,
    updateProfile,
    refreshProfile,
    refreshStats
  };
}

/**
 * Simplified hook for just profile data (no stats)
 */
export function useProfileData(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await dataService.profiles.getUserProfile(targetUserId);
        setProfile(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [targetUserId]);

  return { profile, loading, error };
}
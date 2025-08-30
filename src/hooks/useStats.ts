/**
 * Custom hook for accessing statistics data
 * Example of how to use DataService in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/data/DataService';
import { useAuth } from '../lib/useAuth';
import type { HoleStatistic, ParPerformance, UseDataResult } from '../services/data/types';

/**
 * Hook for hole statistics
 */
export function useHoleStats(
  userId?: string,
  holeNumber?: number
): UseDataResult<HoleStatistic[]> {
  const { user } = useAuth();
  const [data, setData] = useState<HoleStatistic[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;

  const fetchData = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stats = await dataService.stats.getHoleStats(targetUserId, holeNumber);
      setData(stats);
    } catch (err) {
      console.error('Error fetching hole stats:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, holeNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    if (targetUserId) {
      // Invalidate cache and refetch
      dataService.stats.invalidateUserStats(targetUserId);
      await fetchData();
    }
  }, [targetUserId, fetchData]);

  return { data, loading, error, refresh };
}

/**
 * Hook for par performance statistics
 */
export function useParPerformance(userId?: string): UseDataResult<ParPerformance[]> {
  const { user } = useAuth();
  const [data, setData] = useState<ParPerformance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;

  const fetchData = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const performance = await dataService.stats.getParPerformance(targetUserId);
      setData(performance);
    } catch (err) {
      console.error('Error fetching par performance:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    if (targetUserId) {
      // Invalidate cache and refetch
      dataService.stats.invalidateUserStats(targetUserId);
      await fetchData();
    }
  }, [targetUserId, fetchData]);

  return { data, loading, error, refresh };
}

/**
 * Combined hook for all stats (hole + par performance)
 */
export function useStats(userId?: string) {
  const holeStats = useHoleStats(userId);
  const parPerformance = useParPerformance(userId);

  return {
    holeStats: holeStats.data,
    parPerformance: parPerformance.data,
    loading: holeStats.loading || parPerformance.loading,
    error: holeStats.error || parPerformance.error,
    refresh: async () => {
      await Promise.all([
        holeStats.refresh(),
        parPerformance.refresh()
      ]);
    }
  };
}
/**
 * Custom hook for hole statistics
 * Provides hole stats and par performance data with caching
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/data/DataService';
import type { HoleStatistic, ParPerformance, RecentHoleScore } from '../services/data/StatsDataService';

export interface UseHoleStatsResult {
  holeStats: HoleStatistic[];
  parPerformance: ParPerformance[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getRecentHoleScores: (holeNumber: number, limit?: number) => Promise<RecentHoleScore[]>;
}

export function useHoleStats(userId: string | undefined): UseHoleStatsResult {
  const [holeStats, setHoleStats] = useState<HoleStatistic[]>([]);
  const [parPerformance, setParPerformance] = useState<ParPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStatistics = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const [holes, pars] = await Promise.all([
        dataService.stats.getUserHoleStats(userId),
        dataService.stats.getUserParPerformance(userId)
      ]);
      
      setHoleStats(holes || []);
      setParPerformance(pars || []);
    } catch (err) {
      console.error('Error loading hole statistics:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const refresh = useCallback(async () => {
    // Invalidate cache and reload
    if (userId) {
      dataService.stats.invalidateUserStats(userId);
      await loadStatistics();
    }
  }, [userId, loadStatistics]);

  const getRecentHoleScores = useCallback(async (holeNumber: number, limit = 10): Promise<RecentHoleScore[]> => {
    if (!userId) return [];
    
    try {
      return await dataService.stats.getRecentHoleScores(userId, holeNumber, limit);
    } catch (err) {
      console.error('Error loading recent hole scores:', err);
      return [];
    }
  }, [userId]);

  return {
    holeStats,
    parPerformance,
    loading,
    error,
    refresh,
    getRecentHoleScores
  };
}
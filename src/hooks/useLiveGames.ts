/**
 * Custom hook for fetching and managing live games
 * Used by LiveMatchCard component on Home page
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { dataService } from '../services/data/DataService';
import { useAuth } from '../lib/useAuth';
import type { UseDataResult } from '../services/data/types';
import type { Game, GameParticipant, GameHoleScore } from '../features/normal-game/types';

export interface LiveGame {
  game: Game;
  participants: GameParticipant[];
  currentHole: number;
  holesCompleted: number;
  totalHoles: number;
  courseName?: string;
}

// Cache for active games data
export const activeGamesCache = new Map<string, { data: LiveGame[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Export cache to window for external access
if (typeof window !== 'undefined') {
  (window as unknown as { __activeGamesCache?: typeof activeGamesCache }).__activeGamesCache = activeGamesCache;
}

/**
 * Hook for fetching user's active/live games with intelligent caching
 */
export function useLiveGames(): UseDataResult<LiveGame[]> {
  const { user } = useAuth();
  const [data, setData] = useState<LiveGame[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchLiveGames = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = user.id;
    const cached = activeGamesCache.get(cacheKey);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_DURATION)) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Avoid multiple simultaneous requests
    if (!forceRefresh && (now - lastFetchRef.current < 1000)) {
      return;
    }
    
    lastFetchRef.current = now;
    setLoading(true);
    setError(null);

    try {
      // Use DataService to get active games
      const activeGames = await dataService.games.getUserActiveGames(user.id);
      
      if (!activeGames || activeGames.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Transform and enrich the data
      const liveGameData = await Promise.all(
        activeGames.map(async (game: Game) => {
          try {
            // Get detailed game info using existing gameService
            // This will be migrated to DataService later
            const { gameService } = await import('../features/normal-game/services/gameService');
            const gameDetails = await gameService.getGameDetails(game.id);
            
            // Calculate current hole and holes completed
            const scoresWithStrokes = gameDetails.scores.filter((s: GameHoleScore) => s.strokes);
            const holesPlayed = new Set(scoresWithStrokes.map((s: GameHoleScore) => s.hole_number));
            const holesCompleted = holesPlayed.size;
            const totalHoles = gameDetails.game?.num_holes || 18;
            const currentHole = Math.min(Math.max(...Array.from(holesPlayed), 0) + 1, totalHoles);
            
            return {
              game: gameDetails.game,
              participants: gameDetails.participants,
              currentHole,
              holesCompleted,
              totalHoles
            };
          } catch (err) {
            console.error('Error loading game details:', err);
            return null;
          }
        })
      );

      // Filter out any failed loads
      const validGames = liveGameData.filter((game): game is LiveGame => game !== null);
      
      // Cache the result
      activeGamesCache.set(cacheKey, { data: validGames, timestamp: now });
      setData(validGames);
    } catch (err) {
      console.error('Error fetching live games:', err);
      setError(err as Error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLiveGames();
  }, [fetchLiveGames]);

  const refresh = useCallback(async () => {
    // Invalidate cache and force refetch
    if (user?.id) {
      activeGamesCache.delete(user.id);
      dataService.games.invalidateUserGames(user.id);
      await fetchLiveGames(true); // Force refresh
    }
  }, [user?.id, fetchLiveGames]);

  return { data, loading, error, refresh };
}

// History interface for Ionic Router
interface IonicHistory {
  listen: (callback: (location: { pathname: string }) => void) => (() => void);
}

/**
 * Hook that also listens to navigation for smart refreshing
 * Only refreshes if data is stale or user is returning from game completion
 */
export function useLiveGamesWithNavigation(history: IonicHistory) {
  const liveGamesResult = useLiveGames();
  const lastNavigationRef = useRef<number>(0);

  useEffect(() => {
    const unlistenHistory = history.listen((location: { pathname: string }) => {
      if (location.pathname === '/home') {
        const now = Date.now();
        // Only refresh if we haven't navigated to home recently (avoid rapid navigation refreshes)
        if (now - lastNavigationRef.current > 2000) {
          // Always refresh when returning to home to catch game deletions
          console.log('Navigated to home - refreshing live games');
          setTimeout(() => liveGamesResult.refresh(), 100);
        }
        lastNavigationRef.current = now;
      }
    });

    return unlistenHistory;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, liveGamesResult.refresh]);

  return liveGamesResult;
}
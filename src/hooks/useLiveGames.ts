/**
 * Custom hook for fetching and managing live games
 * Used by LiveMatchCard component on Home page
 */

import { useState, useEffect, useCallback } from 'react';
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

/**
 * Hook for fetching user's active/live games
 */
export function useLiveGames(): UseDataResult<LiveGame[]> {
  const { user } = useAuth();
  const [data, setData] = useState<LiveGame[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLiveGames = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

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
    // Invalidate cache and refetch
    if (user?.id) {
      dataService.games.invalidateUserGames(user.id);
      await fetchLiveGames();
    }
  }, [user?.id, fetchLiveGames]);

  return { data, loading, error, refresh };
}

// History interface for Ionic Router
interface IonicHistory {
  listen: (callback: (location: { pathname: string }) => void) => (() => void);
}

/**
 * Hook that also listens to navigation for refreshing
 * Useful for Home page that needs to refresh when navigated back to
 */
export function useLiveGamesWithNavigation(history: IonicHistory) {
  const liveGamesResult = useLiveGames();

  useEffect(() => {
    const unlistenHistory = history.listen((location: { pathname: string }) => {
      if (location.pathname === '/home') {
        console.log('Navigated to home - refreshing live games');
        // Small delay to ensure navigation is complete
        setTimeout(() => liveGamesResult.refresh(), 100);
      }
    });

    return unlistenHistory;
  }, [history, liveGamesResult.refresh]);

  return liveGamesResult;
}
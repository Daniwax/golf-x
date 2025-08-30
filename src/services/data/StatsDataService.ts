/**
 * Stats Data Service
 * Handles all statistics-related data operations
 */

import { CacheService } from '../cache/CacheService';
import { getCacheKey, getTTL } from '../../config/cache.config';

// Types from holeStatsService
export interface HoleStatistic {
  holeNumber: number;
  totalRounds: number;
  averageScore: number;
  averagePutts: number;
  bestScore: number;
  worstScore: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  others: number;
  scoringDistribution: {
    label: string;
    value: number;
    percentage: number;
  }[];
}

export interface ParPerformance {
  parType: number;
  totalHoles: number;
  averageScore: number;
  averageScoreToPar: number;
  scoringDistribution: {
    eagles: number;
    birdies: number;
    pars: number;
    bogeys: number;
    doubleBogeys: number;
    others: number;
  };
}

export interface RecentHoleScore {
  gameId: string;
  courseName: string;
  holeNumber: number;
  strokes: number;
  putts: number | null;
  par: number;
  scoreToPar: number;
  playedAt: string;
}

export class StatsDataService {
  private cache: CacheService;
  
  constructor(cache: CacheService) {
    this.cache = cache;
  }

  /**
   * Get hole statistics for a user
   */
  async getUserHoleStats(userId: string, holeNumber?: number): Promise<HoleStatistic[]> {
    const key = getCacheKey('stats', 'hole', userId, holeNumber || 'all');
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        if (!supabase) {
          console.error('Supabase not initialized');
          return [];
        }

        let query = supabase
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
            player_match_par,
            games (
              id,
              status,
              completed_at
            )
          `)
          .eq('user_id', userId)
          .not('strokes', 'is', null);

        if (holeNumber) {
          query = query.eq('hole_number', holeNumber);
        }

        const { data: scores, error } = await query;

        if (error) {
          console.error('Error fetching hole statistics:', error);
          return [];
        }

        if (!scores || scores.length === 0) {
          return [];
        }

        // Filter for completed games
        const completedScores = scores.filter(score => {
          const game = Array.isArray(score.games) ? score.games[0] : score.games;
          return game && game.status === 'completed';
        });

        if (completedScores.length === 0) {
          return [];
        }

        // Group scores by hole number
        const holeGroups = completedScores.reduce((acc, score) => {
          const hole = score.hole_number;
          if (!acc[hole]) {
            acc[hole] = [];
          }
          acc[hole].push(score);
          return acc;
        }, {} as Record<number, typeof completedScores>);

        // Calculate statistics for each hole
        const statistics: HoleStatistic[] = Object.entries(holeGroups).map(([holeNum, holeScores]) => {
          const holeNumber = parseInt(holeNum);
          const validScores = holeScores.filter(s => s.strokes !== null && s.strokes > 0);
          const validPutts = holeScores.filter(s => s.putts !== null && s.putts >= 0);
          
          // Calculate scoring distribution
          const scoringCounts = {
            eagles: 0,
            birdies: 0,
            pars: 0,
            bogeys: 0,
            doubleBogeys: 0,
            others: 0
          };

          validScores.forEach(score => {
            const diff = score.score_vs_par || 0;
            if (diff <= -2) scoringCounts.eagles++;
            else if (diff === -1) scoringCounts.birdies++;
            else if (diff === 0) scoringCounts.pars++;
            else if (diff === 1) scoringCounts.bogeys++;
            else if (diff === 2) scoringCounts.doubleBogeys++;
            else scoringCounts.others++;
          });

          const totalRounds = validScores.length;
          const scoringDistribution = [
            { label: 'Eagle', value: scoringCounts.eagles, percentage: (scoringCounts.eagles / totalRounds) * 100 },
            { label: 'Birdie', value: scoringCounts.birdies, percentage: (scoringCounts.birdies / totalRounds) * 100 },
            { label: 'Par', value: scoringCounts.pars, percentage: (scoringCounts.pars / totalRounds) * 100 },
            { label: 'Bogey', value: scoringCounts.bogeys, percentage: (scoringCounts.bogeys / totalRounds) * 100 },
            { label: 'Double', value: scoringCounts.doubleBogeys, percentage: (scoringCounts.doubleBogeys / totalRounds) * 100 },
            { label: 'Other', value: scoringCounts.others, percentage: (scoringCounts.others / totalRounds) * 100 }
          ].filter(item => item.value > 0);

          return {
            holeNumber,
            totalRounds,
            averageScore: totalRounds > 0 
              ? Math.round(validScores.reduce((sum, s) => sum + (s.strokes || 0), 0) / totalRounds * 10) / 10
              : 0,
            averagePutts: validPutts.length > 0
              ? Math.round(validPutts.reduce((sum, s) => sum + (s.putts || 0), 0) / validPutts.length * 10) / 10
              : 0,
            bestScore: validScores.length > 0 
              ? Math.min(...validScores.map(s => s.strokes!))
              : 0,
            worstScore: validScores.length > 0
              ? Math.max(...validScores.map(s => s.strokes!))
              : 0,
            ...scoringCounts,
            scoringDistribution
          };
        });

        // Sort by hole number
        return statistics.sort((a, b) => a.holeNumber - b.holeNumber);
      },
      getTTL('holeStats')
    );
  }

  /**
   * Get par performance statistics
   */
  async getUserParPerformance(userId: string): Promise<ParPerformance[]> {
    const key = getCacheKey('stats', 'par', userId);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        if (!supabase) {
          console.error('Supabase not initialized');
          return [];
        }

        const { data: scores, error } = await supabase
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
            player_match_par,
            games (
              id,
              status
            )
          `)
          .eq('user_id', userId)
          .not('strokes', 'is', null)
          .not('hole_par', 'is', null);

        if (error) {
          console.error('Error fetching par performance:', error);
          return [];
        }

        if (!scores || scores.length === 0) {
          return [];
        }

        // Filter for completed games
        const completedScores = scores.filter(score => {
          const game = Array.isArray(score.games) ? score.games[0] : score.games;
          return game && game.status === 'completed';
        });

        if (completedScores.length === 0) {
          return [];
        }

        // Group by par value
        const parGroups = completedScores.reduce((acc, score) => {
          const par = score.hole_par!;
          if (!acc[par]) {
            acc[par] = [];
          }
          acc[par].push(score);
          return acc;
        }, {} as Record<number, typeof completedScores>);

        // Calculate statistics for each par type
        const parPerformance: ParPerformance[] = Object.entries(parGroups).map(([parValue, parScores]) => {
          const parType = parseInt(parValue);
          const totalHoles = parScores.length;
          
          const scoringDistribution = {
            eagles: 0,
            birdies: 0,
            pars: 0,
            bogeys: 0,
            doubleBogeys: 0,
            others: 0
          };

          let totalStrokes = 0;
          let totalScoreToPar = 0;

          parScores.forEach(score => {
            totalStrokes += score.strokes!;
            const diff = score.score_vs_par || 0;
            totalScoreToPar += diff;
            
            if (diff <= -2) scoringDistribution.eagles++;
            else if (diff === -1) scoringDistribution.birdies++;
            else if (diff === 0) scoringDistribution.pars++;
            else if (diff === 1) scoringDistribution.bogeys++;
            else if (diff === 2) scoringDistribution.doubleBogeys++;
            else scoringDistribution.others++;
          });

          return {
            parType,
            totalHoles,
            averageScore: Math.round((totalStrokes / totalHoles) * 10) / 10,
            averageScoreToPar: Math.round((totalScoreToPar / totalHoles) * 10) / 10,
            scoringDistribution
          };
        });

        // Sort by par type
        return parPerformance.sort((a, b) => a.parType - b.parType);
      },
      getTTL('parPerformance')
    );
  }

  /**
   * Get recent scores for a specific hole number across all courses
   */
  async getRecentHoleScores(userId: string, holeNumber: number, limit = 10): Promise<RecentHoleScore[]> {
    const key = getCacheKey('stats', 'recent-hole', userId, holeNumber, limit);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        if (!supabase) {
          console.error('Supabase not initialized');
          return [];
        }

        const { data: scores, error } = await supabase
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
            player_match_par,
            games (
              id,
              status,
              completed_at,
              golf_courses (
                id,
                name
              )
            )
          `)
          .eq('user_id', userId)
          .eq('hole_number', holeNumber)
          .not('strokes', 'is', null)
          .limit(limit * 2); // Get more to filter

        if (error) {
          console.error('Error fetching recent hole scores:', error);
          return [];
        }

        if (!scores || scores.length === 0) {
          return [];
        }

        // Filter for completed games and sort by completion date
        const completedScores = scores
          .filter(score => {
            const game = Array.isArray(score.games) ? score.games[0] : score.games;
            return game && game.status === 'completed' && game.completed_at;
          })
          .sort((a, b) => {
            const gameA = Array.isArray(a.games) ? a.games[0] : a.games;
            const gameB = Array.isArray(b.games) ? b.games[0] : b.games;
            return new Date(gameB.completed_at || 0).getTime() - new Date(gameA.completed_at || 0).getTime();
          })
          .slice(0, limit);

        if (completedScores.length === 0) {
          return [];
        }

        return completedScores.map(score => {
          const game = Array.isArray(score.games) ? score.games[0] : score.games;
          const gameWithCourse = game as { golf_courses?: { name?: string; par?: number }[] | { name?: string; par?: number } };
          const course = Array.isArray(gameWithCourse?.golf_courses) 
            ? gameWithCourse.golf_courses[0] 
            : gameWithCourse?.golf_courses;

          return {
            gameId: score.game_id,
            courseName: course?.name || 'Unknown Course',
            holeNumber: score.hole_number,
            strokes: score.strokes!,
            putts: score.putts,
            par: score.hole_par || 4,
            scoreToPar: score.score_vs_par || 0,
            playedAt: (game as { completed_at?: string })?.completed_at || ''
          };
        });
      },
      getTTL('recentScores')
    );
  }

  /**
   * Get overall player statistics
   */
  async getUserGameStats(userId: string) {
    const key = getCacheKey('stats', 'player', userId);
    return this.cache.get(
      key,
      async () => {
        const { profileGameService } = await import('../../features/normal-game/services/profileGameService');
        return profileGameService.getUserGameStats(userId);
      },
      getTTL('playerStats')
    );
  }

  /**
   * Get user's best scores by course
   */
  async getUserBestScores(userId: string, courseId?: string) {
    const key = getCacheKey('stats', 'best', userId, courseId || 'all');
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        if (!supabase) throw new Error('Supabase client not initialized');
        
        let query = supabase
          .from('game_participants')
          .select(`
            id,
            total_strokes,
            net_score,
            total_putts,
            games!inner(
              id,
              course_id,
              created_at,
              golf_courses(
                id,
                name,
                par
              )
            )
          `)
          .eq('user_id', userId)
          .eq('games.status', 'completed')
          .not('total_strokes', 'is', null);
        
        if (courseId) {
          query = query.eq('games.course_id', courseId);
        }
        
        const { data, error } = await query
          .order('total_strokes', { ascending: true })
          .limit(10);
        
        if (error) throw error;
        return data;
      },
      getTTL('bestScores')
    );
  }

  /**
   * Get scoring averages by period
   */
  async getUserScoringTrends(userId: string, days: number = 30) {
    const key = getCacheKey('stats', 'trends', userId, days);
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('game_participants')
          .select(`
            total_strokes,
            net_score,
            total_putts,
            games!inner(
              created_at,
              course_id,
              golf_courses(
                par
              )
            )
          `)
          .eq('user_id', userId)
          .eq('games.status', 'completed')
          .gte('games.created_at', startDate.toISOString())
          .order('games.created_at', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      getTTL('trends')
    );
  }

  /**
   * Invalidate all stats for a user
   */
  invalidateUserStats(userId: string) {
    this.cache.invalidate(`stats:*:${userId}*`);
  }

  /**
   * Calculate handicap range based on player's handicap level
   * Uses variable range: smaller range for better players, larger for higher handicaps
   */
  private getHandicapRange(handicap: number): number {
    // Professional level (< 5 handicap): ±2 range
    if (handicap < 5) return 2;
    
    // Low handicap (5-10): ±3 range
    if (handicap >= 5 && handicap < 10) return 3;
    
    // Mid handicap (10-18): ±4 range
    if (handicap >= 10 && handicap < 18) return 4;
    
    // High handicap (18-28): ±5 range
    if (handicap >= 18 && handicap < 28) return 5;
    
    // Very high handicap (28+): ±6 range
    return 6;
  }

  /**
   * Get friends' average scores for specific holes on a course
   * Filters friends within variable handicap range based on skill level
   */
  async getFriendsAverageForHoles(
    userId: string, 
    courseId: string, 
    teeBoxId: number,
    userHandicap: number
  ): Promise<Record<number, { average: number; count: number }>> {
    const key = getCacheKey('stats', 'friends-avg', userId, courseId, teeBoxId);
    
    // Add debug flag - set to true for debugging
    const DEBUG = true;
    const BYPASS_CACHE = true; // Set to true to bypass cache during debugging
    
    // Clear cache for debugging if needed
    if (BYPASS_CACHE) {
      this.cache.invalidate(key);
      console.log('🔄 Cache cleared for key:', key);
    }
    
    return this.cache.get(
      key,
      async () => {
        const { supabase } = await import('../../lib/supabase');
        
        if (!supabase) {
          console.error('Supabase not initialized');
          return {} as Record<number, { average: number; count: number }>;
        }

        // Calculate dynamic range based on handicap
        const handicapRange = this.getHandicapRange(userHandicap);
        
        if (DEBUG) {
          console.log('🔍 DEBUG: getFriendsAverageForHoles called with:', {
            userId,
            courseId,
            teeBoxId,
            userHandicap,
            calculatedRange: `±${handicapRange}`,
            actualRange: `${userHandicap - handicapRange} to ${userHandicap + handicapRange}`
          });
        }

        // First get user's friends (avoiding duplicates by using DISTINCT-like approach)
        const { data: friendships, error: friendshipsError } = await supabase
          .from('friendships')
          .select('requester_id, friend_id')
          .or(`requester_id.eq.${userId},friend_id.eq.${userId}`)
          .eq('status', 'accepted');

        if (DEBUG) {
          console.log('🔍 DEBUG: Friendships query result:', {
            count: friendships?.length || 0,
            error: friendshipsError,
            data: friendships
          });
        }

        if (!friendships || friendships.length === 0) {
          if (DEBUG) console.log('❌ No friendships found');
          return {};
        }

        // Get friend IDs  
        interface Friendship {
          requester_id: string;
          friend_id: string;
        }
        const friendIdsRaw = friendships.map((f: Friendship) => 
          f.friend_id === userId ? f.requester_id : f.friend_id
        ).filter((id): id is string => !!id && id !== userId);
        
        // Remove duplicates
        const friendIds = [...new Set(friendIdsRaw)];

        if (DEBUG) {
          console.log('🔍 DEBUG: Friend IDs extracted:', friendIds);
        }

        if (friendIds.length === 0) {
          if (DEBUG) console.log('❌ No friend IDs after filtering');
          return {};
        }

        // Get friends' profiles to filter by handicap (variable range)
        const { data: friendProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, handicap')
          .in('id', friendIds)
          .gte('handicap', userHandicap - handicapRange)
          .lte('handicap', userHandicap + handicapRange);

        if (DEBUG) {
          console.log('🔍 DEBUG: Friends within handicap range:', {
            handicapRange: `${userHandicap - handicapRange} to ${userHandicap + handicapRange}`,
            rangeSize: `±${handicapRange}`,
            count: friendProfiles?.length || 0,
            error: profilesError,
            profiles: friendProfiles
          });
        }

        if (!friendProfiles || friendProfiles.length === 0) {
          if (DEBUG) console.log('❌ No friends within handicap range');
          return {};
        }

        const eligibleFriendIds = friendProfiles.map(p => p.id);

        // Get hole scores for eligible friends on this course and tee
        // First get the games with matching participants
        // Note: We need to filter games separately as Supabase doesn't support nested filters well
        const { data: participantGames, error: participantError } = await supabase
          .from('game_participants')
          .select(`
            game_id,
            user_id,
            tee_box_id,
            games (
              id,
              course_id,
              status
            )
          `)
          .in('user_id', eligibleFriendIds)
          .eq('tee_box_id', teeBoxId);

        if (participantError) {
          console.error('❌ Error fetching participant games:', participantError);
          return {};
        }

        if (DEBUG) {
          console.log('🔍 DEBUG: Raw participant games query:', {
            eligibleFriendIds,
            teeBoxId,
            count: participantGames?.length || 0,
            rawGames: participantGames
          });
        }
        
        if (!participantGames || participantGames.length === 0) {
          if (DEBUG) {
            console.log('❌ No participant games found at all');
          }
          return {};
        }

        // Filter for completed games on the specific course
        const filteredGames = participantGames.filter(pg => {
          const game = Array.isArray(pg.games) ? pg.games[0] : pg.games;
          
          if (DEBUG && game) {
            console.log('🔍 Comparing:', {
              gameCourseId: game.course_id,
              gameCourseIdType: typeof game.course_id,
              inputCourseId: courseId,
              inputCourseIdType: typeof courseId,
              isEqual: game.course_id == courseId,
              gameStatus: game.status,
              isCompleted: game.status === 'completed'
            });
          }
          
          // Ensure courseId comparison works with both string and number types
          return game && 
                 game.course_id == courseId && // Use == for type coercion
                 game.status === 'completed';
        });

        if (DEBUG) {
          console.log('🔍 DEBUG: Filtered participant games:', {
            courseId,
            beforeFilter: participantGames.length,
            afterFilter: filteredGames.length,
            filteredGames
          });
        }

        if (filteredGames.length === 0) {
          if (DEBUG) {
            console.log('❌ No completed games found for friends on this course');
            console.log('   Searched for:', { courseId, teeBoxId, eligibleFriendIds });
          }
          return {};
        }

        // Extract unique game IDs from filtered games
        const gameIds = [...new Set(filteredGames.map(pg => pg.game_id))];

        // Now get the hole scores for these games and users
        const { data: scores, error } = await supabase
          .from('game_hole_scores')
          .select(`
            hole_number,
            strokes,
            user_id,
            game_id
          `)
          .in('game_id', gameIds)
          .in('user_id', eligibleFriendIds)
          .not('strokes', 'is', null);

        if (DEBUG) {
          console.log('🔍 DEBUG: Hole scores query:', {
            gameIds,
            eligibleFriendIds,
            count: scores?.length || 0,
            error,
            sampleScores: scores?.slice(0, 5)
          });
        }

        if (error) {
          console.error('❌ Error fetching friends hole scores:', error);
          return {};
        }

        if (!scores || scores.length === 0) {
          if (DEBUG) console.log('❌ No hole scores found for these games');
          return {};
        }

        // Group scores by hole and calculate averages
        const holeGroups = scores.reduce((acc, score) => {
          const hole = score.hole_number;
          if (!acc[hole]) {
            acc[hole] = [];
          }
          acc[hole].push(score.strokes);
          return acc;
        }, {} as Record<number, number[]>);

        if (DEBUG) {
          console.log('🔍 DEBUG: Hole groups:', {
            holesWithData: Object.keys(holeGroups),
            sampleData: Object.entries(holeGroups).slice(0, 3).map(([hole, strokes]) => ({
              hole,
              strokeCount: strokes.length,
              strokes
            }))
          });
        }

        // Calculate averages and counts
        const averages: Record<number, { average: number; count: number }> = {};
        Object.entries(holeGroups).forEach(([hole, strokes]) => {
          const avg = strokes.reduce((sum, s) => sum + s, 0) / strokes.length;
          averages[parseInt(hole)] = {
            average: Math.round(avg * 10) / 10, // Round to 1 decimal
            count: strokes.length
          };
        });

        if (DEBUG) {
          console.log('✅ DEBUG: Final averages calculated:', averages);
        }

        return averages;
      },
      getTTL('friendsAvg')
    );
  }

  /**
   * Invalidate specific stat type
   */
  invalidateStatType(type: 'hole' | 'par' | 'player' | 'best' | 'trends' | 'friends-avg', userId: string) {
    this.cache.invalidate(`stats:${type}:${userId}*`);
  }
}
import { supabase } from '../../../lib/supabase';

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

export const holeStatsService = {
  // Get statistics for all holes or a specific hole
  async getHoleStatistics(userId: string, holeNumber?: number): Promise<HoleStatistic[]> {
    if (!supabase) {
      console.error('Supabase not initialized');
      return [];
    }

    try {
      console.log(`Fetching hole statistics for user: ${userId}${holeNumber ? `, hole: ${holeNumber}` : ''}`);
      
      let query = supabase
        .from('game_hole_scores')
        .select(`
          hole_number,
          strokes,
          putts,
          hole_par,
          hole_handicap_strokes,
          score_vs_par,
          game_id,
          games (
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
        console.error('Error details:', error.message, error.details);
        return [];
      }

      console.log(`Raw data fetched: ${scores?.length || 0} scores`);
      
      if (!scores || scores.length === 0) {
        console.log('No scores found in database');
        return [];
      }

      // Filter for completed games
      const completedScores = scores.filter(score => {
        const game = Array.isArray(score.games) ? score.games[0] : score.games;
        return game && game.status === 'completed';
      });

      console.log(`Completed game scores: ${completedScores.length}`);

      if (completedScores.length === 0) {
        console.log('No completed game scores found');
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
    } catch (error) {
      console.error('Error in getHoleStatistics:', error);
      return [];
    }
  },

  // Get statistics grouped by par value
  async getParPerformance(userId: string): Promise<ParPerformance[]> {
    if (!supabase) {
      console.error('Supabase not initialized');
      return [];
    }

    try {
      console.log(`Fetching par performance for user: ${userId}`);
      
      const { data: scores, error } = await supabase
        .from('game_hole_scores')
        .select(`
          strokes,
          hole_par,
          score_vs_par,
          games (
            status
          )
        `)
        .eq('user_id', userId)
        .not('strokes', 'is', null)
        .not('hole_par', 'is', null);

      if (error) {
        console.error('Error fetching par performance:', error);
        console.error('Error details:', error.message, error.details);
        return [];
      }

      console.log(`Raw par performance data: ${scores?.length || 0} scores`);

      if (!scores || scores.length === 0) {
        console.log('No par performance data found');
        return [];
      }

      // Filter for completed games
      const completedScores = scores.filter(score => {
        const game = Array.isArray(score.games) ? score.games[0] : score.games;
        return game && game.status === 'completed';
      });

      console.log(`Completed par performance scores: ${completedScores.length}`);

      if (completedScores.length === 0) {
        console.log('No completed par performance scores found');
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
    } catch (error) {
      console.error('Error in getParPerformance:', error);
      return [];
    }
  },

  // Get recent scores for a specific hole number across all courses
  async getRecentHoleScores(userId: string, holeNumber: number, limit = 10): Promise<RecentHoleScore[]> {
    if (!supabase) {
      console.error('Supabase not initialized');
      return [];
    }

    try {
      console.log(`Fetching recent hole scores for user: ${userId}, hole: ${holeNumber}`);
      
      const { data: scores, error } = await supabase
        .from('game_hole_scores')
        .select(`
          game_id,
          hole_number,
          strokes,
          putts,
          hole_par,
          score_vs_par,
          games (
            status,
            completed_at,
            golf_courses (
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
        console.error('Error details:', error.message, error.details);
        return [];
      }

      console.log(`Raw recent hole scores: ${scores?.length || 0} scores`);

      if (!scores || scores.length === 0) {
        console.log('No recent hole scores found');
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

      console.log(`Completed recent hole scores: ${completedScores.length}`);

      if (completedScores.length === 0) {
        console.log('No completed recent hole scores found');
        return [];
      }

      return completedScores.map(score => {
        const game = Array.isArray(score.games) ? score.games[0] : score.games;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const course = Array.isArray((game as any)?.golf_courses) 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (game as any).golf_courses[0] 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (game as any)?.golf_courses;

        return {
          gameId: score.game_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          courseName: (course as any)?.name || 'Unknown Course',
          holeNumber: score.hole_number,
          strokes: score.strokes!,
          putts: score.putts,
          par: score.hole_par || 4,
          scoreToPar: score.score_vs_par || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          playedAt: (game as any)?.completed_at || ''
        };
      });
    } catch (error) {
      console.error('Error in getRecentHoleScores:', error);
      return [];
    }
  }
};
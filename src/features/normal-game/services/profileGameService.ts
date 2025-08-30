import { supabase } from '../../../lib/supabase';


export interface GameStats {
  totalGamesPlayed: number;
  bestScore: number | null;
  averageScore: number | null;
  recentHandicap: number | null;
  preferredCourse: string | null;
}

export interface CompletedGame {
  id: string;
  courseId: number;
  courseName: string;
  clubName: string;
  gameDescription: string | null;
  scoringFormat: 'match_play' | 'stroke_play';
  completedAt: string;
  totalStrokes: number | null;
  netScore: number | null;
  position: number;
  totalPlayers: number;
  winner: string | null;
  coursePar: number;
}

export const profileGameService = {
  // Get aggregated game statistics for a user
  async getUserGameStats(userId: string): Promise<GameStats> {
    if (!supabase) {
      console.error('Supabase not initialized');
      return {
        totalGamesPlayed: 0,
        averageScore: null,
        bestScore: null,
        recentHandicap: null,
        preferredCourse: null
      };
    }
    
    try {
      // Fetch all completed games the user participated in
      const { data: participations, error } = await supabase
        .from('game_participants')
        .select(`
          total_strokes,
          handicap_index,
          game_id,
          games!inner (
            status,
            completed_at,
            course_id,
            golf_courses!inner (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .eq('games.status', 'completed');

      if (error) {
        console.error('Error fetching user game stats:', error);
        return {
          totalGamesPlayed: 0,
          bestScore: null,
          averageScore: null,
          recentHandicap: null,
          preferredCourse: null
        };
      }

      if (!participations || participations.length === 0) {
        return {
          totalGamesPlayed: 0,
          bestScore: null,
          averageScore: null,
          recentHandicap: null,
          preferredCourse: null
        };
      }

      // Calculate statistics
      const validScores = participations
        .filter(p => p.total_strokes !== null && p.total_strokes > 0)
        .map(p => p.total_strokes as number);

      // Find most played course
      const courseFrequency = participations.reduce((acc, p) => {
        const games = Array.isArray(p.games) ? p.games[0] : p.games;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const courseName = Array.isArray((games as any)?.golf_courses) 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (games as any)?.golf_courses[0]?.name 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (games as any)?.golf_courses?.name;
        if (courseName) {
          acc[courseName] = (acc[courseName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const mostPlayedCourse = Object.keys(courseFrequency).length > 0
        ? Object.entries(courseFrequency).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        : null;

      const stats: GameStats = {
        totalGamesPlayed: participations.length,
        bestScore: validScores.length > 0 ? Math.min(...validScores) : null,
        averageScore: validScores.length > 0 
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length * 10) / 10 
          : null,
        recentHandicap: participations[0]?.handicap_index || null,
        preferredCourse: mostPlayedCourse
      };

      return stats;
    } catch (error) {
      console.error('Error in getUserGameStats:', error);
      return {
        totalGamesPlayed: 0,
        bestScore: null,
        averageScore: null,
        recentHandicap: null,
        preferredCourse: null
      };
    }
  },

  // Get list of completed games for a user
  async getUserCompletedGames(userId: string): Promise<CompletedGame[]> {
    if (!supabase) {
      console.error('Supabase not initialized');
      return [];
    }
    
    try {
      const { data: games, error } = await supabase
        .from('game_participants')
        .select(`
          game_id,
          total_strokes,
          net_score,
          games!inner (
            id,
            course_id,
            game_description,
            scoring_format,
            status,
            completed_at,
            golf_courses!inner (
              id,
              name,
              par,
              golf_clubs!inner (
                name
              )
            )
          )
        `)
        .eq('user_id', userId)
        .eq('games.status', 'completed');

      if (error) {
        console.error('Error fetching completed games:', error);
        return [];
      }

      if (!games || games.length === 0) {
        return [];
      }

      // Sort games by completed_at in descending order
      const sortedGames = games.sort((a, b) => {
        const gameA = Array.isArray(a.games) ? a.games[0] : a.games;
        const gameB = Array.isArray(b.games) ? b.games[0] : b.games;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dateA = (gameA as any)?.completed_at ? new Date((gameA as any).completed_at).getTime() : 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dateB = (gameB as any)?.completed_at ? new Date((gameB as any).completed_at).getTime() : 0;
        return dateB - dateA; // Descending order (most recent first)
      });

      // For each game, get all participants to determine winner and position
      const completedGames: CompletedGame[] = await Promise.all(
        sortedGames.map(async (game) => {
          const { data: allParticipants, error: participantsError } = await supabase!
            .from('game_participants')
            .select(`
              user_id,
              total_strokes,
              net_score
            `)
            .eq('game_id', game.game_id);

          if (participantsError) {
            console.error('Error fetching participants for game:', game.game_id, participantsError);
          }

          // Sort participants by total_strokes (nulls last)
          const sortedParticipants = allParticipants?.sort((a, b) => {
            if (a.total_strokes === null && b.total_strokes === null) return 0;
            if (a.total_strokes === null) return 1;
            if (b.total_strokes === null) return -1;
            return a.total_strokes - b.total_strokes;
          }) || [];

          const totalPlayers = sortedParticipants.length || 0;
          let position = 1;
          let winner = null;

          if (sortedParticipants.length > 0) {
            // Find position (1-based)
            const userScore = game.total_strokes;
            if (userScore !== null) {
              position = sortedParticipants.filter(p => 
                p.total_strokes !== null && p.total_strokes < userScore
              ).length + 1;
            }
            
            // Get winner (lowest score - first in sorted array with non-null score)
            const winnerData = sortedParticipants.find(p => p.total_strokes !== null);
            if (winnerData) {
              // Fetch winner's profile
              const { data: winnerProfile } = await supabase!
                .from('profiles')
                .select('full_name')
                .eq('id', winnerData.user_id)
                .single();
              winner = winnerProfile?.full_name || null;
            }
          }

          const gameData = Array.isArray(game.games) ? game.games[0] : game.games;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const courseData = Array.isArray((gameData as any)?.golf_courses) ? (gameData as any).golf_courses[0] : (gameData as any)?.golf_courses;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clubData = Array.isArray((courseData as any)?.golf_clubs) ? (courseData as any).golf_clubs[0] : (courseData as any)?.golf_clubs;
          
          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            id: (gameData as any).id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            courseId: (gameData as any).course_id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            courseName: (courseData as any)?.name || '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clubName: (clubData as any)?.name || '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            gameDescription: (gameData as any).game_description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            scoringFormat: (gameData as any).scoring_format,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            completedAt: (gameData as any).completed_at,
            totalStrokes: game.total_strokes,
            netScore: game.net_score,
            position,
            totalPlayers,
            winner,
            coursePar: courseData?.par || 72
          };
        })
      );

      return completedGames;
    } catch (error) {
      console.error('Error in getUserCompletedGames:', error);
      return [];
    }
  },

  // Get detailed game data for viewing
  async getGameDetails(gameId: string) {
    if (!supabase) {
      console.error('Supabase not initialized');
      return null;
    }
    
    try {
      // Get game info
      const { data: game, error: gameError } = await supabase
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
          golf_courses (
            id,
            name,
            par,
            holes,
            golf_clubs (
              name
            )
          )
        `)
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game details:', gameError);
        return null;
      }

      // Get participants with their scores
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

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return null;
      }
      
      console.log('[profileGameService] Participants fetched:', participants);

      // Fetch profiles and tee boxes separately for each participant
      const participantsWithDetails = await Promise.all(
        (participants || []).map(async (participant) => {
          // Fetch profile
          const { data: profile } = await supabase!
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', participant.user_id)
            .single();

          // Fetch tee box
          const { data: teeBox } = await supabase!
            .from('tee_boxes')
            .select('name, color, slope_rating, course_rating')
            .eq('id', participant.tee_box_id)
            .single();

          return {
            ...participant,
            profiles: profile,
            tee_boxes: teeBox
          };
        })
      );

      console.log('[profileGameService] Participants with details:', participantsWithDetails);
      
      // Sort participants by total_strokes (nulls last)
      const sortedParticipants = participantsWithDetails.sort((a, b) => {
        if (a.total_strokes === null && b.total_strokes === null) return 0;
        if (a.total_strokes === null) return 1;
        if (b.total_strokes === null) return -1;
        return a.total_strokes - b.total_strokes;
      });
      
      console.log('[profileGameService] Sorted participants:', sortedParticipants);

      // Get hole scores
      const { data: scores, error: scoresError } = await supabase
        .from('game_hole_scores')
        .select(`
          id,
          game_id,
          user_id,
          hole_number,
          strokes,
          putts,
          hole_handicap_strokes
        `)
        .eq('game_id', gameId)
        .order('hole_number', { ascending: true });

      if (scoresError) {
        console.error('Error fetching scores:', scoresError);
      }
      
      console.log('[profileGameService] Scores fetched:', scores);

      // Get hole information
      const { data: holes, error: holesError } = await supabase
        .from('holes')
        .select(`
          hole_number,
          course_id,
          par,
          handicap_index
        `)
        .eq('course_id', game.course_id)
        .order('hole_number', { ascending: true });

      if (holesError) {
        console.error('Error fetching holes:', holesError);
      }
      
      console.log('[profileGameService] Holes fetched:', holes);

      const result = {
        game,
        participants: sortedParticipants,
        scores: scores || [],
        holes: holes || []
      };
      
      console.log('[profileGameService] Final result being returned:', result);
      return result;
    } catch (error) {
      console.error('Error in getGameDetails:', error);
      return null;
    }
  }
};
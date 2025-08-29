import { supabase } from '../../../lib/supabase';
import type { 
  Game, 
  GameParticipant, 
  GameHoleScore, 
  CreateGameData,
  GolfCourse,
  TeeBox,
  PlayerConfig
} from '../types';
import { 
  calculateCourseHandicap, 
  calculatePlayingHandicap, 
  calculateMatchHandicap,
  getStrokesOnHole
} from '../utils/handicapCalculations';

class GameService {
  // Fetch available golf courses
  async getCourses(): Promise<GolfCourse[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('golf_courses')
      .select(`
        id,
        club_id,
        name,
        course_number,
        holes,
        par,
        course_type,
        golf_clubs!inner (
          name,
          city
        )
      `)
      .eq('status', 'active')
      .order('name');
    
    if (error) throw error;
    
    // Transform the data to ensure golf_clubs is a single object, not an array
    const transformedData = (data || []).map(course => ({
      ...course,
      golf_clubs: Array.isArray(course.golf_clubs) ? course.golf_clubs[0] : course.golf_clubs
    }));
    
    return transformedData as GolfCourse[];
  }

  // Fetch tee boxes for a course
  async getTeeBoxes(courseId: number): Promise<TeeBox[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('tee_boxes')
      .select(`
        id,
        course_id,
        name,
        color,
        slope_rating,
        course_rating,
        total_yards,
        total_meters
      `)
      .eq('course_id', courseId)
      .order('course_rating', { ascending: false });
    
    if (error) throw error;
    
    // Map database columns to our interface
    return (data || []).map(tee => ({
      id: tee.id,
      course_id: tee.course_id,
      name: tee.name,
      color: tee.color,
      slope: tee.slope_rating,
      course_rating: tee.course_rating,
      total_distance: tee.total_yards || tee.total_meters || 0,
      distance_unit: tee.total_yards ? 'yards' : 'meters'
    }));
  }

  // Create a new game
  async createGame(gameData: CreateGameData): Promise<Game> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Try multiple methods to get user for better browser compatibility
    let userId: string | null = null;
    
    // Method 1: getUser (recommended)
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      userId = userData.user.id;
    }
    
    // Method 2: getSession (fallback for cookie issues)
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        userId = sessionData.session.user.id;
      }
    }
    
    if (!userId) {
      throw new Error('Authentication failed. Please sign out and sign in again. If the problem persists, try clearing your browser data.');
    }

    // Get course par for handicap calculations
    const { data: course } = await supabase
      .from('golf_courses')
      .select('par')
      .eq('id', gameData.course_id)
      .single();
    
    if (!course) throw new Error('Course not found');

    // Create the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        course_id: gameData.course_id,
        creator_user_id: userId,
        game_description: gameData.description,
        scoring_format: gameData.format,
        weather_condition: gameData.weather,
        handicap_type: gameData.handicap_type || 'match_play',
        scoring_method: gameData.scoring_method || 'match_play',
        num_holes: gameData.num_holes || 18,
        status: 'setup'
      })
      .select()
      .single();
    
    if (gameError) throw gameError;

    // Calculate handicaps for all participants
    const participants = await Promise.all(
      gameData.participants.map(async (p, idx) => {
        const handicaps = await this.calculateHandicapsForPlayer(
          p.handicap_index,
          p.tee_box_id,
          course.par,
          gameData.participants,
          idx,
          gameData.format
        );
        
        return {
          game_id: game.id,
          user_id: p.user_id,
          tee_box_id: p.tee_box_id,
          handicap_index: p.handicap_index,
          ...handicaps
        };
      })
    );

    const { error: participantError } = await supabase
      .from('game_participants')
      .insert(participants);
    
    if (participantError) {
      // Rollback game creation if participants fail
      await supabase.from('games').delete().eq('id', game.id);
      throw participantError;
    }

    // Update game status to 'active' now that setup is complete
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({ status: 'active' })
      .eq('id', game.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating game status:', updateError);
      return game; // Return game with setup status if update fails
    }

    return updatedGame || game;
  }

  // Calculate handicaps for a player with proper formulas
  private async calculateHandicapsForPlayer(
    handicapIndex: number, 
    teeBoxId: number,
    coursePar: number,
    allParticipants: PlayerConfig[],
    participantIndex: number,
    format: 'match_play' | 'stroke_play'
  ) {
    // Get tee box data for accurate calculations
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: teeBox } = await supabase
      .from('tee_boxes')
      .select('slope_rating, course_rating')
      .eq('id', teeBoxId)
      .single();
    
    if (!teeBox) {
      throw new Error('Tee box data not found');
    }
    
    // Calculate course handicap using official formula
    const courseHandicap = calculateCourseHandicap(
      handicapIndex,
      teeBox.slope_rating,
      teeBox.course_rating,
      coursePar
    );
    
    // Calculate playing handicap (100% for match play, 95% for stroke play)
    const playingHandicap = calculatePlayingHandicap(courseHandicap, format);
    
    // Calculate all playing handicaps for match handicap calculation
    const allPlayingHandicaps = await Promise.all(
      allParticipants.map(async (p, idx) => {
        if (idx === participantIndex) return playingHandicap;
        
        if (!supabase) throw new Error('Supabase not configured');
        
        const { data: pTeeBox } = await supabase
          .from('tee_boxes')
          .select('slope_rating, course_rating')
          .eq('id', p.tee_box_id)
          .single();
        
        if (!pTeeBox) return 0;
        
        const pCourseHandicap = calculateCourseHandicap(
          p.handicap_index,
          pTeeBox.slope_rating,
          pTeeBox.course_rating,
          coursePar
        );
        
        return calculatePlayingHandicap(pCourseHandicap, format);
      })
    );
    
    // Calculate match handicap (strokes given/received)
    const matchHandicap = calculateMatchHandicap(
      allPlayingHandicaps,
      participantIndex
    );

    return {
      course_handicap: courseHandicap,
      playing_handicap: playingHandicap,
      match_handicap: matchHandicap
    };
  }

  // Start a game
  async startGame(gameId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('games')
      .update({ 
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', gameId);
    
    if (error) throw error;
  }

  // Get active game for current user
  async getActiveGame(): Promise<Game | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data } = await supabase
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
        completed_at
      `)
      .in('status', ['setup', 'active'])
      .or(`creator_user_id.eq.${user.user.id},id.in.(
        select game_id from game_participants where user_id='${user.user.id}'
      )`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return data || null;
  }

  // Get game details with participants and scores
  async getGameDetails(gameId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const [gameResult, participantsResult, scoresResult] = await Promise.all([
      supabase.from('games')
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
          completed_at
        `)
        .eq('id', gameId)
        .single(),
      supabase.from('game_participants')
        .select(`
          id,
          game_id,
          user_id,
          tee_box_id,
          handicap_index,
          course_handicap,
          playing_handicap,
          match_handicap
        `)
        .eq('game_id', gameId),
      supabase.from('game_hole_scores')
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
          updated_at
        `)
        .eq('game_id', gameId)
    ]);

    if (gameResult.error) throw gameResult.error;
    if (participantsResult.error) throw participantsResult.error;
    if (scoresResult.error) throw scoresResult.error;

    // Get participant names separately
    const participants = participantsResult.data || [];
    const participantsWithNames = await Promise.all(
      participants.map(async (participant) => {
        if (!supabase) return { ...participant, full_name: 'Unknown' };
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', participant.user_id)
          .single();
        
        return {
          ...participant,
          profiles: profile ? { full_name: profile.full_name } : null
        };
      })
    );
    
    return {
      game: gameResult.data as Game,
      participants: participantsWithNames as GameParticipant[],
      scores: scoresResult.data as GameHoleScore[]
    };
  }

  // Update hole score with proper handicap stroke calculation
  async updateHoleScore(
    gameId: string, 
    userId: string, 
    holeNumber: number, 
    strokes: number,
    putts?: number
  ): Promise<void> {
    console.log('=== updateHoleScore DEBUG ===');
    console.log('gameId:', gameId);
    console.log('userId:', userId);
    console.log('holeNumber:', holeNumber);
    console.log('strokes:', strokes);
    console.log('putts:', putts);
    console.log('supabase exists?', !!supabase);
    
    if (!supabase) throw new Error('Supabase not configured');
    
    // Get game and hole data
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('course_id')
      .eq('id', gameId)
      .single();
    
    console.log('Game data:', gameData);
    console.log('Game error:', gameError);
    
    if (!gameData) throw new Error('Game not found');

    // Get hole par and stroke index
    const { data: holeData } = await supabase
      .from('holes')
      .select('par, handicap_index')
      .eq('course_id', gameData.course_id)
      .eq('hole_number', holeNumber)
      .single();
    
    if (!holeData) throw new Error('Hole data not found');
    
    // Get player's match handicap to calculate strokes on this hole
    const { data: participant } = await supabase
      .from('game_participants')
      .select('match_handicap')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .single();
    
    if (!participant) throw new Error('Participant not found');
    
    // Calculate strokes received on this hole based on stroke index
    const handicapStrokes = getStrokesOnHole(
      holeData.handicap_index,
      participant.match_handicap
    );

    // Prepare the score data
    const scoreData = {
      game_id: gameId,
      user_id: userId,
      hole_number: holeNumber,
      strokes,
      putts,
      hole_par: holeData.par,
      hole_handicap_strokes: handicapStrokes,
      updated_at: new Date().toISOString()
    };
    
    console.log('Score data to upsert:', scoreData);
    
    // Check auth session before upsert
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session?.user?.id);
    
    if (!session) {
      console.error('No active session!');
      throw new Error('Authentication session expired. Please refresh the page and sign in again.');
    }
    
    // Upsert the score with calculated handicap strokes
    const { error } = await supabase
      .from('game_hole_scores')
      .upsert(scoreData, {
        onConflict: 'game_id,user_id,hole_number'
      });
    
    console.log('Upsert error:', error);
    
    if (error) throw error;
    
    // Update participant totals
    await this.updateParticipantTotals(gameId, userId);
  }
  
  // Update participant total scores
  private async updateParticipantTotals(gameId: string, userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Get all scores for this participant
    const { data: scores } = await supabase
      .from('game_hole_scores')
      .select('hole_number, strokes, putts, net_score')
      .eq('game_id', gameId)
      .eq('user_id', userId);
    
    if (!scores || scores.length === 0) return;
    
    // Calculate totals
    const totalStrokes = scores.reduce((sum, s) => sum + (s.strokes || 0), 0);
    const totalPutts = scores.reduce((sum, s) => sum + (s.putts || 0), 0);
    const netScore = scores.reduce((sum, s) => sum + (s.net_score || 0), 0);
    
    // Calculate 9-hole splits
    const frontNine = scores
      .filter(s => s.hole_number <= 9)
      .reduce((sum, s) => sum + (s.strokes || 0), 0);
    
    const backNine = scores
      .filter(s => s.hole_number > 9)
      .reduce((sum, s) => sum + (s.strokes || 0), 0);
    
    // Update participant record
    await supabase
      .from('game_participants')
      .update({
        total_strokes: totalStrokes || null,
        total_putts: totalPutts || null,
        net_score: netScore || null,
        front_nine_strokes: frontNine || null,
        back_nine_strokes: backNine || null
      })
      .eq('game_id', gameId)
      .eq('user_id', userId);
  }

  // Close/complete a game
  async closeGame(gameId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('games')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', gameId);
    
    if (error) throw error;
  }

  // Cancel a game - updates status to 'cancelled' (preserves data)
  async cancelGame(gameId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('games')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString() // Mark when cancelled
      })
      .eq('id', gameId);
    
    if (error) throw error;
  }

  // Update game notes
  async updateNotes(gameId: string, notes: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('games')
      .update({ 
        notes,
        notes_updated_by: user.user.id,
        notes_updated_at: new Date().toISOString()
      })
      .eq('id', gameId);
    
    if (error) throw error;
  }

  // Get active games for the current user
  async getActiveGames(): Promise<Game[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    // Get games where user is a participant and status is 'active'
    const { data, error } = await supabase
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
        golf_courses!inner (
          name
        ),
        game_participants!inner (
          user_id
        )
      `)
      .eq('status', 'active')
      .eq('game_participants.user_id', user.user.id);
    
    if (error) throw error;
    
    return data || [];
  }
}

export const gameService = new GameService();
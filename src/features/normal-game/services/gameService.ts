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
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

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
        creator_user_id: user.user.id,
        game_description: gameData.description,
        scoring_format: gameData.format,
        weather_condition: gameData.weather,
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

    return game;
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
      .select('slope, course_rating')
      .eq('id', teeBoxId)
      .single();
    
    if (!teeBox) {
      throw new Error('Tee box data not found');
    }
    
    // Calculate course handicap using official formula
    const courseHandicap = calculateCourseHandicap(
      handicapIndex,
      teeBox.slope,
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
          .select('slope, course_rating')
          .eq('id', p.tee_box_id)
          .single();
        
        if (!pTeeBox) return 0;
        
        const pCourseHandicap = calculateCourseHandicap(
          p.handicap_index,
          pTeeBox.slope,
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
      .select('*')
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
      supabase.from('games').select('*').eq('id', gameId).single(),
      supabase.from('game_participants').select('*').eq('game_id', gameId),
      supabase.from('game_hole_scores').select('*').eq('game_id', gameId)
    ]);

    if (gameResult.error) throw gameResult.error;
    
    return {
      game: gameResult.data as Game,
      participants: participantsResult.data as GameParticipant[],
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
    if (!supabase) throw new Error('Supabase not configured');
    
    // Get game and hole data
    const { data: gameData } = await supabase
      .from('games')
      .select('course_id')
      .eq('id', gameId)
      .single();
    
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

    // Upsert the score with calculated handicap strokes
    const { error } = await supabase
      .from('game_hole_scores')
      .upsert({
        game_id: gameId,
        user_id: userId,
        hole_number: holeNumber,
        strokes,
        putts,
        hole_par: holeData.par,
        hole_handicap_strokes: handicapStrokes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'game_id,user_id,hole_number'
      });
    
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

  // Cancel a game
  async cancelGame(gameId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('games')
      .update({ status: 'cancelled' })
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
}

export const gameService = new GameService();
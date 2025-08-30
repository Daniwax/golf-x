// Game-related type definitions for Normal Game feature

export type WeatherCondition = 'sunny' | 'partly_cloudy' | 'rainy' | 'windy';
export type ScoringFormat = 'match_play' | 'stroke_play'; // Legacy - kept for compatibility
export type GameStatus = 'setup' | 'active' | 'completed' | 'cancelled';

// New multi-game types
export type HandicapType = 'none' | 'match_play' | 'stroke_play' | 'random' | 'ghost';
export type ScoringMethod = 'stroke_play' | 'match_play' | 'stableford' | 'skins';

export interface Game {
  id: string;
  course_id: number;
  creator_user_id: string;
  game_description?: string;
  scoring_format: ScoringFormat; // Legacy field
  weather_condition?: WeatherCondition;
  status: GameStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  notes_updated_by?: string;
  notes_updated_at?: string;
  // New fields for multi-game support
  handicap_type?: HandicapType;
  scoring_method?: ScoringMethod;
  num_holes?: number; // Number of holes to play (1-18), defaults to 18
}

export interface GameParticipant {
  id: string;
  game_id: string;
  user_id: string;
  tee_box_id: number;
  handicap_index: number;
  course_handicap: number;
  playing_handicap: number;
  match_handicap: number;
  total_strokes?: number;
  total_putts?: number;
  net_score?: number;
  front_nine_strokes?: number;
  back_nine_strokes?: number;
  // Note: holes_won, holes_lost, holes_halved are calculated at runtime for match play
  // They are not stored in the database
  profiles?: {
    full_name: string;
  };
}

export interface GameHoleScore {
  id: string;
  game_id: string;
  user_id: string;
  hole_number: number;
  strokes?: number;
  putts?: number;
  hole_par: number;
  hole_handicap_strokes: number;
  net_score?: number;
  score_vs_par?: number;
  player_match_par?: number;
  updated_at: string;
}

export interface TeeBox {
  id: number;
  course_id: number;
  name: string;
  color: string;
  slope: number;  // This is what gameService returns
  course_rating: number;
  total_distance?: number;
  distance_unit?: string;
  // Raw database fields (optional, for when we read directly)
  slope_rating?: number;
  color_hex?: string;
  gender?: string;
  total_yards?: number;
  total_meters?: number;
  bogey_rating?: number;
  front_nine_rating?: number;
  front_nine_slope?: number;
  front_nine_bogey?: number;
  back_nine_rating?: number;
  back_nine_slope?: number;
  back_nine_bogey?: number;
  display_order?: number;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GolfCourse {
  id: number;
  club_id: number;
  name: string;
  course_number: number;
  holes: number;
  par: number;
  course_type: string;
  golf_clubs?: {
    name: string;
    city: string;
  };
}

export interface PlayerConfig {
  user_id: string;
  full_name: string;
  handicap_index: number;
  tee_box_id: number;
}

export interface CreateGameData {
  description?: string;
  course_id: number;
  weather: WeatherCondition;
  format: ScoringFormat; // Legacy - kept for compatibility
  participants: PlayerConfig[];
  // New fields for multi-game support
  handicap_type?: HandicapType;
  scoring_method?: ScoringMethod;
  num_holes?: number; // Number of holes to play (1-18), defaults to 18
}

export interface LiveGameState {
  game: Game;
  participants: GameParticipant[];
  scores: GameHoleScore[];
  currentHole: number;
  isAutoRefresh: boolean;
  lastRefresh: Date;
}
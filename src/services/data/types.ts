/**
 * Type definitions for DataService
 * Centralized types for all data operations
 */

// ============================================
// Profile Types
// ============================================

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  handicap: number | null;
  avatar_url: string | null;
  custom_avatar_url: string | null;
  home_course: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  full_name?: string;
  bio?: string;
  handicap?: number;
  avatar_url?: string;
  custom_avatar_url?: string;
  home_course?: string;
}

// ============================================
// Game Types
// ============================================

export interface Game {
  id: string;
  course_id: string;
  status: 'setup' | 'in_progress' | 'completed' | 'abandoned';
  game_type: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  current_hole: number | null;
}

export interface GameParticipant {
  id: string;
  game_id: string;
  user_id: string;
  tee_box_id: string;
  course_handicap: number | null;
  playing_handicap: number | null;
  total_strokes: number | null;
  total_putts: number | null;
  final_position: number | null;
}

export interface GameHoleScore {
  id: string;
  game_id: string;
  user_id: string;
  hole_number: number;
  strokes: number | null;
  putts: number | null;
  hole_par: number;
  hole_handicap_strokes: number;
  score_vs_par: number | null;
}

// ============================================
// Course Types
// ============================================

export interface GolfCourse {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  par: number;
  holes: number;
  yards: number | null;
  rating: number | null;
  slope: number | null;
  website: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeeBox {
  id: string;
  course_id: string;
  name: string;
  color: string | null;
  yards: number;
  rating: number | null;
  slope: number | null;
}

export interface Hole {
  id: string;
  course_id: string;
  hole_number: number;
  par: number;
  handicap_index: number;
  yards_blue: number | null;
  yards_white: number | null;
  yards_yellow: number | null;
  yards_red: number | null;
}

export interface CourseImage {
  id: string;
  course_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

// ============================================
// Statistics Types
// ============================================

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

export interface GameStats {
  totalGamesPlayed: number;
  bestScore: number | null;
  averageScore: number | null;
  recentHandicap: number | null;
  preferredCourse: string | null;
}

// ============================================
// Social Types
// ============================================

export interface Friendship {
  id: string;
  requester_id: string;
  friend_id: string;
  status: 'accepted' | 'blocked';
  created_at: string;
}

export interface FriendProfile {
  friendship_id: string;
  friend_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  custom_avatar_url: string | null;
  handicap: number | null;
  created_at: string;
}

// ============================================
// Query Options
// ============================================

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface GameFilters {
  status?: Game['status'];
  courseId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Hook Return Types
// ============================================

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: Error | null;
  data: TData | null;
}
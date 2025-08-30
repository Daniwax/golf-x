// Temporary database types file - will be replaced with auto-generated types from Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          handicap: number | null;
          home_course: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      games: {
        Row: {
          id: string;
          course_id: number;
          creator_user_id: string;
          game_description: string | null;
          scoring_format: 'match_play' | 'stroke_play';
          weather_condition: string | null;
          status: 'setup' | 'active' | 'completed' | 'cancelled';
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          notes: string | null;
          notes_updated_by: string | null;
          notes_updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['games']['Row']>;
        Update: Partial<Database['public']['Tables']['games']['Row']>;
      };
      game_participants: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          tee_box_id: number;
          handicap_index: number;
          course_handicap: number;
          playing_handicap: number;
          match_handicap: number;
          total_strokes: number | null;
          total_putts: number | null;
          net_score: number | null;
          front_nine_strokes: number | null;
          back_nine_strokes: number | null;
        };
        Insert: Partial<Database['public']['Tables']['game_participants']['Row']>;
        Update: Partial<Database['public']['Tables']['game_participants']['Row']>;
      };
      golf_courses: {
        Row: {
          id: number;
          club_id: number | null;
          name: string;
          course_number: number | null;
          holes: number;
          par: number | null;
          course_type: string | null;
          status: string | null;
        };
        Insert: Partial<Database['public']['Tables']['golf_courses']['Row']>;
        Update: Partial<Database['public']['Tables']['golf_courses']['Row']>;
      };
      tee_boxes: {
        Row: {
          id: number;
          course_id: number;
          name: string;
          color: string;
          slope_rating: number | null;
          course_rating: number | null;
          total_yards: number | null;
          total_meters: number | null;
        };
        Insert: Partial<Database['public']['Tables']['tee_boxes']['Row']>;
        Update: Partial<Database['public']['Tables']['tee_boxes']['Row']>;
      };
      holes: {
        Row: {
          hole_number: number;
          course_id: number;
          par: number;
          handicap_index: number;
        };
        Insert: Partial<Database['public']['Tables']['holes']['Row']>;
        Update: Partial<Database['public']['Tables']['holes']['Row']>;
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['friendships']['Row']>;
        Update: Partial<Database['public']['Tables']['friendships']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Profile {
  id: string
  email: string
  full_name?: string
  handicap?: number
  home_course?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Round {
  id: string
  user_id: string
  course_name: string
  date: string
  score: number
  par: number
  holes_played: number
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  course_name: string
  date: string
  entry_fee?: number
  prize_pool?: number
  max_participants?: number
  participants_count: number
  created_at: string
}
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in GitHub Secrets')
  console.warn('Using placeholder Supabase configuration. Authentication will not work.')
}

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
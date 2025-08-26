import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
export const isConfigured = !!(supabaseUrl && supabaseKey)

if (!isConfigured) {
  console.error('⚠️ Supabase environment variables are not configured!')
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
}

// Only create client if properly configured
// If not configured, we'll handle this in the app to show an error page
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null as any // We'll check for null in components and show error page

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
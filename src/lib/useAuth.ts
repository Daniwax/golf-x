import { useState, useEffect } from 'react'
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, isConfigured } from './supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip auth if not configured
    if (!isConfigured || !supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }: { data: { session: Session | null }, error: AuthError | null }) => {
      if (error && import.meta.env.DEV) {
        console.error('Auth session error:', error);
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err: Error) => {
      if (import.meta.env.DEV) {
        console.error('Auth session error:', err);
      }
      setLoading(false);
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } as AuthError }
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } as AuthError }
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } as AuthError }
    }
    setLoading(true)
    try {
      // Get the current origin
      const currentOrigin = window.location.origin
      
      // Determine the correct redirect URL
      let redirectTo = currentOrigin
      
      // Special handling for localhost - always use Vite's port
      if (currentOrigin.includes('localhost')) {
        redirectTo = 'http://localhost:5173'
      }
      
      // Log for debugging
      console.log('Current origin:', currentOrigin)
      console.log('Redirect URL:', redirectTo)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('OAuth error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError }
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  }
}
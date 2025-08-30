/**
 * Simple Session Tracking Service
 * Tracks app entries, time spent, and page visits with minimal load impact
 */

import { supabase } from '../lib/supabase';

interface PageVisits {
  [page: string]: number;
}

class SessionTrackingService {
  private currentSessionId: string | null = null;
  private startTime: Date | null = null;
  private pageVisits: PageVisits = {};
  private currentPage: string = '/home';
  private lastActivity: Date = new Date();

  /**
   * Start tracking a new session (call on app entry/home load)
   */
  async startSession(userId: string, initialPage: string = '/home'): Promise<void> {
    try {
      this.startTime = new Date();
      this.currentPage = initialPage;
      this.pageVisits = { [initialPage]: 1 };
      this.lastActivity = new Date();

      // Insert new session (fire and forget - don't block UI)
      setTimeout(async () => {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: userId,
            entry_time: this.startTime,
            current_page: initialPage,
            page_visits: this.pageVisits
          })
          .select('id')
          .single();

        if (!error && data) {
          this.currentSessionId = data.id;
        }
      }, 100);
    } catch (error) {
      console.warn('Session tracking start failed:', error);
    }
  }

  /**
   * Track page visit (call on route changes)
   */
  trackPageVisit(page: string): void {
    try {
      this.currentPage = page;
      this.pageVisits[page] = (this.pageVisits[page] || 0) + 1;
      this.lastActivity = new Date();

      // Update session in background (debounced)
      this.debouncedUpdate();
    } catch (error) {
      console.warn('Page visit tracking failed:', error);
    }
  }

  /**
   * End session (call on app exit/beforeunload)
   */
  async endSession(): Promise<void> {
    if (!this.currentSessionId || !this.startTime) return;

    try {
      if (!supabase) return;
      const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
      
      await supabase
        .from('user_sessions')
        .update({
          exit_time: new Date(),
          session_duration: duration,
          page_visits: this.pageVisits
        })
        .eq('id', this.currentSessionId);

      // Reset tracking
      this.currentSessionId = null;
      this.startTime = null;
      this.pageVisits = {};
    } catch (error) {
      console.warn('Session tracking end failed:', error);
    }
  }

  /**
   * Get current session stats (for debugging)
   */
  getCurrentStats() {
    if (!this.startTime) return null;

    return {
      duration: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      pageVisits: this.pageVisits,
      currentPage: this.currentPage,
      lastActivity: this.lastActivity
    };
  }

  // Private methods
  private updateTimeout: NodeJS.Timeout | null = null;

  private debouncedUpdate = () => {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Update session every 10 seconds (debounced)
    this.updateTimeout = setTimeout(() => {
      this.updateSession();
    }, 10000);
  };

  private async updateSession(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      if (!supabase) return;
      const duration = this.startTime 
        ? Math.floor((Date.now() - this.startTime.getTime()) / 1000)
        : 0;

      await supabase
        .from('user_sessions')
        .update({
          current_page: this.currentPage,
          session_duration: duration,
          page_visits: this.pageVisits,
          updated_at: new Date()
        })
        .eq('id', this.currentSessionId);
    } catch (error) {
      console.warn('Session update failed:', error);
    }
  }
}

// Export singleton instance
export const sessionTracker = new SessionTrackingService();
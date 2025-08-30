/**
 * Cache configuration for different data types
 * Optimized for Golf X usage patterns
 */

export const cacheConfig = {
  // Global cache settings
  maxEntries: 200, // Reasonable limit for mobile devices
  cleanupInterval: 5 * 60 * 1000, // Run cleanup every 5 minutes
  
  // Default TTL (Time To Live) in milliseconds
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  
  // Specific TTLs by data type
  ttl: {
    // Static/Semi-static data (long cache)
    courses: 30 * 60 * 1000,        // 30 min - course info rarely changes
    courseImages: 60 * 60 * 1000,   // 60 min - images are static
    holes: 30 * 60 * 1000,          // 30 min - hole layouts don't change
    teeBoxes: 30 * 60 * 1000,       // 30 min - tee configurations stable
    amenities: 60 * 60 * 1000,      // 60 min - facilities rarely change
    
    // User-specific data (medium cache)
    profile: 10 * 60 * 1000,        // 10 min - user profiles
    friends: 10 * 60 * 1000,        // 10 min - friend lists
    avatar: 15 * 60 * 1000,         // 15 min - avatar URLs
    
    // Statistics (medium cache)
    holeStats: 5 * 60 * 1000,       // 5 min - hole statistics
    playerStats: 5 * 60 * 1000,     // 5 min - player performance
    parPerformance: 5 * 60 * 1000,  // 5 min - par analysis
    gameHistory: 3 * 60 * 1000,     // 3 min - recent games list
    friendsAvg: 10 * 60 * 1000,     // 10 min - friends' hole averages
    
    // Active/Dynamic data (short cache)
    activeGames: 60 * 1000,         // 1 min - games in progress
    leaderboard: 60 * 1000,         // 1 min - live leaderboards
    recentScores: 60 * 1000,        // 1 min - just submitted scores
    
    // No cache (real-time only)
    liveScore: 0,                   // 0 - real-time score updates
    gameUpdates: 0,                 // 0 - live game state changes
    
    // Additional stats
    bestScores: 5 * 60 * 1000,      // 5 min - best scores
    trends: 5 * 60 * 1000,          // 5 min - scoring trends
  },
  
  // Cache key prefixes for organization
  keyPrefixes: {
    courses: 'course',
    games: 'game',
    stats: 'stats',
    profile: 'profile',
    social: 'social',
  },
  
  // Invalidation patterns
  invalidationRules: {
    // When a game is completed, invalidate these patterns
    onGameComplete: [
      'stats:*:{userId}',      // User's statistics
      'game:active:*',         // Active games
      'game:history:{userId}', // Game history
    ],
    
    // When a score is updated, invalidate these
    onScoreUpdate: [
      'game:scores:{gameId}',  // Game scores
      'game:leaderboard:{gameId}', // Leaderboard
      'stats:hole:*',         // Hole statistics
    ],
    
    // When profile is updated, invalidate these
    onProfileUpdate: [
      'profile:{userId}',      // User profile
      'profile:avatar:{userId}', // Avatar
    ],
    
    // When friend is added/removed, invalidate these
    onFriendChange: [
      'social:friends:{userId}', // Friend list
      'social:friendships:*',    // All friendship data
    ],
  },
  
  // Performance monitoring thresholds
  monitoring: {
    slowQueryThreshold: 2000,    // Log queries slower than 2s
    cacheHitRateTarget: 0.7,     // Target 70% cache hit rate
    maxMemoryUsage: 10 * 1024 * 1024, // 10MB max cache size
  }
};

/**
 * Get TTL for a specific data type
 */
export function getTTL(dataType: keyof typeof cacheConfig.ttl): number {
  return cacheConfig.ttl[dataType] || cacheConfig.defaultTTL;
}

/**
 * Get cache key with proper prefix
 */
export function getCacheKey(
  prefix: keyof typeof cacheConfig.keyPrefixes,
  ...parts: (string | number)[]
): string {
  const prefixStr = cacheConfig.keyPrefixes[prefix];
  return [prefixStr, ...parts].join(':');
}

/**
 * Get invalidation patterns for an event
 */
export function getInvalidationPatterns(
  event: keyof typeof cacheConfig.invalidationRules,
  params: Record<string, string> = {}
): string[] {
  const patterns = cacheConfig.invalidationRules[event];
  
  // Replace placeholders with actual values
  return patterns.map(pattern => {
    let result = pattern;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  });
}
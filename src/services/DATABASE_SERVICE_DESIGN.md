# Database Service Architecture Design

## Overview
A centralized, type-safe, cacheable database service for Golf X that supports gradual migration and field expansion without breaking existing components.

## Core Principles

### 1. **Backward Compatibility**
- New fields are always optional additions
- Existing components continue working without modification
- Field expansion doesn't break type contracts

### 2. **Progressive Enhancement**
- Components can opt-in to new fields
- Queries can be extended without modifying base queries
- Migration can happen component by component

### 3. **Performance First**
- Built-in caching with TTL
- Request deduplication
- Parallel query execution
- Lazy loading support

## Architecture

```typescript
// Core structure example
interface CourseBasic {
  id: number;
  name: string;
  par: number;
  holes: number;
}

interface CourseWithClub extends CourseBasic {
  golf_clubs: {
    name: string;
    city: string;
  };
}

interface CourseWithStats extends CourseWithClub {
  course_rating?: number;
  total_distance?: number;
  average_par?: number;
}

interface CourseWithPlayerStats extends CourseWithStats {
  completed_matches?: number;
  best_score?: number;
  average_score?: number;
}

// Service returns the most complete type
// Components can use subset types
```

## Service Structure

```
src/services/
├── database/
│   ├── index.ts                 # Main export
│   ├── types/
│   │   ├── base.types.ts       # Base interfaces
│   │   ├── course.types.ts     # Course-specific types
│   │   ├── player.types.ts     # Player-specific types
│   │   └── game.types.ts       # Game-specific types
│   ├── queries/
│   │   ├── courseQueries.ts    # Course-related queries
│   │   ├── playerQueries.ts    # Player stats queries
│   │   ├── gameQueries.ts      # Game-related queries
│   │   └── imageQueries.ts     # Image processing
│   ├── cache/
│   │   ├── cacheManager.ts     # Cache implementation
│   │   └── cacheConfig.ts      # TTL configurations
│   └── utils/
│       ├── queryBuilder.ts     # Query composition utilities
│       └── dataTransform.ts    # Data transformation helpers
```

## Implementation Strategy

### Phase 1: Core Service Setup
```typescript
// services/database/courseQueries.ts
export class CourseService {
  private static cache = new Map<string, CachedData>();
  
  // Base query - minimal fields
  static async getCourses(): Promise<CourseBasic[]> {
    const cacheKey = 'courses:basic';
    if (this.isCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }
    
    const data = await supabase
      .from('golf_courses')
      .select('id, name, par, holes');
    
    return this.setCache(cacheKey, data);
  }
  
  // Extended query - includes all fields
  static async getCoursesWithStats(userId?: string): Promise<CourseWithPlayerStats[]> {
    const cacheKey = `courses:full:${userId || 'anon'}`;
    if (this.isCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }
    
    // Parallel execution of all queries
    const [courses, stats, images] = await Promise.all([
      this.getCourses(),
      userId ? this.getPlayerStats(userId) : null,
      this.getCourseImages()
    ]);
    
    // Merge and return complete data
    return this.mergeData(courses, stats, images);
  }
}
```

### Phase 2: Component Migration
```typescript
// Old component (still works)
const courses = await CourseService.getCourses();
courses.forEach(course => {
  console.log(course.name); // ✅ Works
  console.log(course.best_score); // ❌ TypeScript error
});

// New component (uses extended data)
const courses = await CourseService.getCoursesWithStats(userId);
courses.forEach(course => {
  console.log(course.name); // ✅ Works
  console.log(course.best_score); // ✅ Works
});
```

## Query Composition Pattern

```typescript
// Composable query builders
class QueryBuilder {
  static courseBase() {
    return 'id, name, par, holes';
  }
  
  static courseWithClub() {
    return `${this.courseBase()}, golf_clubs(name, city)`;
  }
  
  static courseWithTeeBoxes() {
    return `${this.courseWithClub()}, tee_boxes(*)`;
  }
}

// Usage
const query = QueryBuilder.courseWithTeeBoxes();
const data = await supabase.from('golf_courses').select(query);
```

## Cache Strategy

### Parameter-Based Caching
Each function call is cached based on its parameters, creating unique cache keys:

```typescript
// Cache key generation based on function + parameters
function getCacheKey(fnName: string, params: any): string {
  const paramStr = JSON.stringify(params, Object.keys(params).sort());
  return `${fnName}:${paramStr}`;
}

// Examples of cache keys:
// getCourseDetails(5) → "getCourseDetails:{\"id\":5}"
// getPlayerStats("user123", 5) → "getPlayerStats:{\"courseId\":5,\"userId\":\"user123\"}"
// getPlayerStats("user456", 5) → "getPlayerStats:{\"courseId\":5,\"userId\":\"user456\"}"
```

### Cache Implementation with Decorators
```typescript
// Cache decorator for automatic caching
function Cached(ttl: number = 5 * 60 * 1000) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const cacheKey = getCacheKey(propertyName, args);
      
      // Check if cached and still valid
      const cached = CacheManager.get(cacheKey);
      if (cached && !cached.isExpired()) {
        console.log(`Cache hit: ${cacheKey}`);
        return cached.data;
      }
      
      // Execute original function
      console.log(`Cache miss: ${cacheKey}`);
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      CacheManager.set(cacheKey, result, ttl);
      return result;
    };
  };
}

// Usage example
class CourseService {
  @Cached(5 * 60 * 1000) // 5 minutes
  static async getCourseDetails(courseId: number) {
    return await supabase
      .from('golf_courses')
      .select('*')
      .eq('id', courseId)
      .single();
  }
  
  @Cached(2 * 60 * 1000) // 2 minutes
  static async getPlayerStats(userId: string, courseId: number) {
    return await supabase
      .from('game_participants')
      .select('*')
      .eq('user_id', userId)
      .eq('games.course_id', courseId);
  }
}
```

### Smart Cache Manager
```typescript
class CacheManager {
  private static cache = new Map<string, CacheEntry>();
  
  interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
    hits: number; // Track usage
  }
  
  static get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Increment hit counter
    entry.hits++;
    return entry.data;
  }
  
  static set(key: string, data: any, ttl: number): void {
    // Limit cache size (LRU)
    if (this.cache.size >= 100) {
      this.evictLeastUsed();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
  }
  
  // Evict least recently used items
  private static evictLeastUsed(): void {
    const sorted = Array.from(this.cache.entries())
      .sort((a, b) => a[1].hits - b[1].hits);
    
    // Remove bottom 20%
    const toRemove = Math.floor(sorted.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(sorted[i][0]);
    }
  }
}
```

### Function-Level Cache Examples
```typescript
// First call - hits database
const stats1 = await CourseService.getPlayerStats("user123", 5);
// → Cache miss, queries database, stores in cache

// Second call with SAME parameters - returns from cache
const stats2 = await CourseService.getPlayerStats("user123", 5);
// → Cache hit, returns immediately from memory

// Call with DIFFERENT parameters - hits database
const stats3 = await CourseService.getPlayerStats("user456", 5);
// → Different cache key, queries database

// Different course, same user - also hits database
const stats4 = await CourseService.getPlayerStats("user123", 7);
// → Different cache key, queries database
```

### Cache Levels
1. **Memory Cache** (instant, parameter-based keys)
2. **SessionStorage** (fast, session lifetime)
3. **LocalStorage** (persistent, 24hr TTL)

### Cache Configuration
```typescript
interface CacheConfig {
  // Function-specific TTLs
  getCourses: 5 * 60 * 1000,          // 5 minutes
  getCourseDetails: 10 * 60 * 1000,   // 10 minutes
  getPlayerStats: 2 * 60 * 1000,      // 2 minutes
  getCourseImages: 24 * 60 * 60 * 1000, // 24 hours
  getTeeBoxes: 60 * 60 * 1000,        // 1 hour
}
```

### Cache Invalidation
```typescript
// Invalidate specific function + parameters
CacheManager.invalidate('getPlayerStats:{"courseId":5,"userId":"user123"}');

// Invalidate all calls for a function
CacheManager.invalidatePattern('getPlayerStats:*');

// Invalidate everything for a course
CacheManager.invalidatePattern('*:{"courseId":5}*');

// Clear all cache
CacheManager.clear();
```

## Migration Path

### Step 1: Create Service (No Breaking Changes)
- Build service alongside existing code
- Test with sample components
- Ensure type compatibility

### Step 2: Migrate Read Operations
- Replace direct supabase calls with service calls
- Start with simple queries (course list)
- Progress to complex queries (stats, images)

### Step 3: Add Caching Layer
- Implement memory cache
- Add session/local storage
- Monitor performance improvements

### Step 4: Optimize Queries
- Combine related queries
- Implement query batching
- Add prefetching for common paths

## Type Evolution Example

```typescript
// Version 1 - Basic
interface CourseV1 {
  id: number;
  name: string;
}

// Version 2 - Added stats (backward compatible)
interface CourseV2 extends CourseV1 {
  par?: number;
  holes?: number;
}

// Version 3 - Added player data (backward compatible)
interface CourseV3 extends CourseV2 {
  playerStats?: {
    best_score?: number;
    average_score?: number;
  };
}

// Components using CourseV1 still work with CourseV3 data
function displayCourse(course: CourseV1) {
  console.log(course.name); // ✅ Always works
}
```

## Benefits

1. **Single Source of Truth**: All queries in one place
2. **Type Safety**: Consistent types across app
3. **Performance**: Built-in caching and deduplication
4. **Maintainability**: Update queries once, effects everywhere
5. **Testability**: Mock service for testing
6. **Scalability**: Easy to add new fields/queries
7. **Backward Compatible**: Old components keep working

## Implementation Priority

1. **High Priority**
   - Course listing queries
   - Player stats queries
   - Image loading

2. **Medium Priority**
   - Game data queries
   - Hole-by-hole data
   - Tee box information

3. **Low Priority**
   - Historical data
   - Analytics queries
   - Social features

## Success Metrics

- [ ] 50% reduction in database calls
- [ ] 70% faster page loads with cache
- [ ] Zero breaking changes during migration
- [ ] Type-safe across all components
- [ ] Easy to add new fields

## Next Steps

1. Review and approve design
2. Create base service structure
3. Implement CourseService as proof of concept
4. Migrate CoursesList3 to use service
5. Monitor performance improvements
6. Continue migration component by component
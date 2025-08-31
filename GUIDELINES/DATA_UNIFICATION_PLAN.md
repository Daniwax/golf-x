# Golf X Data Unification Plan

## Executive Summary

### Current Problem
- **Inconsistent data retrieval patterns** across the application
- **Multiple agents** have created different approaches for the same data
- **Dead code** and redundant logic making development complex
- **No centralized data access patterns** for new developers/agents
- **Participant names** handled differently in 4+ components
- **Profile data** fetched with various methods

### Main Objective
Create a **unified, centralized data access layer** that:
1. Simplifies development for new agents
2. Provides consistent data structures
3. Reduces code duplication
4. Standardizes error handling and fallbacks
5. Creates clear documentation for data retrieval

## Phase 1: Discovery & Documentation

### Step 1: Analyze Current Data Patterns
We will analyze each main page to identify:
- What data is needed
- How it's currently fetched
- Inconsistencies and duplications
- Dead code to remove

### Step 2: Document Service Requirements
Create tables documenting:
1. **Page-to-Service Mapping** - Which pages need which services
2. **Data Requirements** - What specific data each page needs
3. **Current Implementation** - How it's currently done
4. **Proposed Unified Method** - How it should be done

## Phase 2: Implementation Plan

### New Centralized Services Structure
```
src/services/
├── unified/
│   ├── UserDataService.ts      # Current user profile, stats, preferences
│   ├── ParticipantDataService.ts # Game participants, friends, profiles
│   ├── GameDataService.ts      # Games, scores, leaderboards
│   └── StatsDataService.ts     # Statistics, analytics, history
```

### Unified Data Patterns

#### 1. Profile Data Pattern
```typescript
interface UnifiedProfile {
  id: string;
  fullName: string;  // Never null, has fallback
  email: string;
  avatar: string;    // Unified avatar URL with fallback
  handicap: number;
  // ... consistent structure
}
```

#### 2. Participant Data Pattern
```typescript
interface UnifiedParticipant {
  userId: string;
  profile: UnifiedProfile;  // Always populated
  gameData?: {
    teeBox: string;
    handicaps: HandicapSet;
    scores: Score[];
  }
}
```

#### 3. Standardized Fallbacks
- Names: `fullName || email.split('@')[0] || 'Player'`
- Avatar: `custom_avatar || google_avatar || default_avatar`
- Handicap: `handicap || 12.5`

## Phase 3: Migration Strategy

### Order of Implementation
1. **Start with ProfileDataService** - Most used, highest impact
2. **ParticipantDataService** - Fix naming inconsistencies
3. **GameDataService** - Consolidate game logic
4. **StatsDataService** - Unify statistics

### Migration Rules
1. **Don't break existing functionality**
2. **Test each change thoroughly**
3. **Update one component at a time**
4. **Remove dead code as we go**
5. **Document new patterns immediately**

## Phase 4: Analysis Tables

### Table 1: Profile Data Requirements by Page

| Page | Current Method | Data Needed | Issues | Proposed Solution |
|------|---------------|-------------|---------|-------------------|
| Profile | `useProfile` hook | Full profile, stats, games | Works well | Keep as base pattern |
| Home | Direct supabase | Name, handicap | Inconsistent | Use UserDataService |
| Friends | `useFriends` hook | Friend profiles | Missing fallbacks | Use ParticipantDataService |
| GameSetup | Mixed methods | Participant profiles | Name issues | Use ParticipantDataService |

### Table 2: Participant Name Handling

| Component | Current Implementation | Fallback | Issue |
|-----------|----------------------|----------|--------|
| GameSummary | `p.fullName` | None | Can be undefined |
| Leaderboard | `profiles?.full_name` | 'Player' | Inconsistent property |
| CompletedLeaderboard | Multiple checks | 'Player' | Too complex |
| gameService | Separate queries | Email prefix | Performance issue |

### Table 3: Data Service Dependencies

| Service | Depends On | Used By Pages | Priority |
|---------|------------|---------------|----------|
| ProfileDataService | Supabase auth | All pages | HIGH |
| ParticipantDataService | ProfileDataService | Games, Friends | HIGH |
| GameDataService | ParticipantDataService | Game pages | MEDIUM |
| StatsDataService | GameDataService | Profile, History | LOW |

### Table 4: Dead Code Candidates

| File/Component | Reason | Safe to Remove? | Notes |
|----------------|--------|-----------------|-------|
| [To be analyzed] | | | |

## Next Steps

1. **Commit current changes** to start with clean slate
2. **Begin analysis** of 4 main pages
3. **Fill in tables** with detailed findings
4. **Create UserDataService** as first unified service
5. **Migrate Profile page** as proof of concept
6. **Document patterns** for other agents

## Success Metrics

- [ ] All participant names display consistently
- [ ] Single source of truth for each data type
- [ ] 50% reduction in data fetching code
- [ ] Clear documentation for new developers
- [ ] No more "Unknown" displaying in UI
- [ ] Simplified instructions for agents

## Guidelines for Agents

Once complete, agents will:
1. **Always use unified services** for data
2. **Never write custom profile queries**
3. **Follow standard fallback patterns**
4. **Reuse existing data hooks**
5. **Check this document before creating new data methods**

---

*Document Status: PLANNING PHASE*
*Last Updated: 2024-01-31*
*Next Review: After initial analysis*
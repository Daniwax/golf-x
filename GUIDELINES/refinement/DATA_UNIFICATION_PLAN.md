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
- **Business logic and calculations** embedded in components

### Step 2: Document Service Requirements
Create tables documenting:
1. **Page-to-Service Mapping** - Which pages need which services
2. **Data Requirements** - What specific data each page needs
3. **Current Implementation** - How it's currently done
4. **Proposed Unified Method** - How it should be done
5. **Embedded Logic Inventory** - Document all calculations and business logic

### Step 3: Identify Reusable Logic
Document all component-specific logic that should be extracted:
- **Scoring calculations** (winner determination, leaderboard sorting)
- **Handicap calculations** (course/playing/match handicaps)
- **Statistics computations** (averages, best scores, trends)
- **Data transformations** (formatting, filtering, sorting)
- **Validation rules** (game rules, scoring limits)

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

### Table 1: Profile Data Requirements by Page (Max 10 entries)

| Page | Current Method | Issues | Fix |
|------|---------------|---------|-----|
| Profile.tsx | useProfile hook [Profile.tsx:45-51] | Works well | Keep pattern |
| Home.tsx | Direct supabase [Home.tsx:89-95] | No fallbacks | UserDataService |
| Friends.tsx | useFriends [Friends.tsx:34] | Missing fallbacks | ParticipantDataService |
| GameSetup | Mixed [PlayerConfig.tsx:78-82] | Name issues | ParticipantDataService |

### Table 2: Participant Name Handling (Max 10 entries)

| Component | Implementation | Issue |
|-----------|---------------|--------|
| GameSummary | p.fullName [GameSummary.tsx:234] | No fallback |
| Leaderboard | profiles?.full_name [Leaderboard.tsx:86] | Now 'Player' |
| CompletedLeaderboard | 3 checks [CompletedLeaderboard.tsx:80-83] | Too complex |
| gameService | Separate queries [gameService.ts:519-530] | Performance |

### Table 3: Data Service Dependencies

| Service | Depends On | Used By Pages | Priority |
|---------|------------|---------------|----------|
| ProfileDataService | Supabase auth | All pages | HIGH |
| ParticipantDataService | ProfileDataService | Games, Friends | HIGH |
| GameDataService | ParticipantDataService | Game pages | MEDIUM |
| StatsDataService | GameDataService | Profile, History | LOW |

### Table 4: Embedded Business Logic (Max 15 entries)

| Location | Logic | Reuse? | Move To |
|----------|-------|--------|---------|
| CompletedLeaderboard.tsx:62-127 | Leaderboard calc | YES | ScoringService |
| Leaderboard.tsx:71 | Handicap check | YES | GameUtils |
| GameSummary.tsx:145-189 | Winner calc | YES | ScoringService |
| LiveGame.tsx:234-267 | Score validation | YES | ValidationService |

### Table 5: Duplicate Logic Patterns (Max 10 entries)

| Pattern | Locations | Fix |
|---------|-----------|-----|
| Player name fallback | [Leaderboard:86][CompletedLeaderboard:80-83][gameService:541] | getPlayerName() util |
| Net score calc | [LiveGame:445][GameSummary:234] | ScoringService.getNetScore() |
| Date format | [Home:123][Profile:89][History:234] | formatDate() util |

### Table 6: Dead Code Candidates

| File/Component | Reason | Safe to Remove? | Notes |
|----------------|--------|-----------------|-------|
| CreateGame.tsx | Replaced by CreateGameCustom | YES | Already deleted |
| LiveMatchCardNew.tsx | Unused experiment | YES | Already deleted |
| HomeNew.tsx | Old home page design | YES | Already deleted |
| [To be analyzed] | | | |

## Analysis Format
**Keep entries brief with file references [filename.tsx:lineStart-lineEnd]**

## Documentation Structure

### Phase 1 Documents:
All documents are in `DATA_UNIFICATION/` folder:
1. **DATA_UNIFICATION_PHASE1.md** - Main analysis tables
2. **DATA_UNIFICATION_PHASE1_FILES.md** - File checklist and status
3. **DATA_UNIFICATION_PHASE1_LOGIC.md** - Logic patterns inventory

### Analysis Method for Parallel Agents

#### AGENT ASSIGNMENT
Each agent gets assigned file numbers (e.g., Agent 1: F005-F010):
1. Check your files in `DATA_UNIFICATION/DATA_UNIFICATION_PHASE1_FILES.md`
2. Work ONLY on assigned files
3. Mark status when starting/completing

#### PER-FILE WORKFLOW
For each assigned file [Fxxx]:

1. **START**: Mark file as "in progress" in DATA_UNIFICATION_PHASE1_FILES.md
2. **ANALYZE**: 
   - Read the file completely
   - Check if file is imported anywhere (dead file check)
   - Document data retrieval methods
   - Document business logic
   - Note duplicate patterns
3. **DOCUMENT**:
   - Add to DATA_UNIFICATION_PHASE1.md analysis tables (max 2 lines per entry)
   - Update DATA_UNIFICATION_PHASE1_LOGIC.md if new pattern found
   - Use format: [Fxxx:lineStart-lineEnd]
4. **COMPLETE**: Mark file status in DATA_UNIFICATION_PHASE1_FILES.md:
   - [x] = needs changes
   - [✓] = no changes needed  
   - [🗑️] = dead file
5. **COMMIT**: After each file, commit with message:
   ```
   analyze: Complete analysis of [Fxxx] filename
   - Found X data patterns
   - Found Y logic duplications
   - Status: needs changes/no changes/dead file
   ```

#### CONFLICT PREVENTION
- Each agent works on different file ranges
- Don't modify files outside your range
- Update only designated sections in docs
- Use file numbers [Fxxx] not full paths

## AGENT INSTRUCTION TEMPLATE

### What Each Agent Receives:
```
You have been assigned file number: [Fxxx]

1. Check DATA_UNIFICATION/DATA_UNIFICATION_PHASE1_FILES.md for your file details
2. Analyze the file following the workflow below
3. Document findings in the three PHASE1 documents in DATA_UNIFICATION/ folder
4. If a document is locked (another agent editing), wait 30 seconds and retry
5. Mark your file complete when done

Your task:
- Read your assigned file completely
- Check if it's imported anywhere (grep for imports)
- Document data patterns in DATA_UNIFICATION/DATA_UNIFICATION_PHASE1.md
- Add new logic patterns to DATA_UNIFICATION/DATA_UNIFICATION_PHASE1_LOGIC.md if found
- Update file status in DATA_UNIFICATION/DATA_UNIFICATION_PHASE1_FILES.md

Note: Other agents are working on different files in parallel.
If you can't write to a document, it means another agent is updating it.
Wait and retry.
```

### What to Look For:
1. **Data Fetching**: How does this file get data?
2. **Logic**: What calculations/transformations?
3. **Duplicates**: Same logic as other files?
4. **Dependencies**: What does it import/export?
5. **Usage**: Is anyone importing this file?
6. **Issues**: Error handling? Performance?

## Next Steps

1. ✅ **Commit current changes** to start with clean slate
2. ✅ **Analyze 4 main pages** (Home, Profile, Friends, MatchHistory)
3. **Document logic patterns** in PHASE1_LOGIC.md
4. **Create unified services** starting with UserDataService
5. **Extract business logic** into reusable utilities
6. **Update all documentation** as we progress

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
# Multi-Game Architecture Migration Plan

## Executive Summary

This document provides a comprehensive plan for migrating the Golf X application from a single game type (Match Play) to a flexible multi-game architecture supporting various handicap and scoring methods. The migration preserves all existing functionality while enabling new game combinations.

## Current State Analysis

### Existing Components (Reusable)

#### 1. **Database Structure** ✅ READY
- Tables: `games`, `game_participants`, `game_hole_scores`
- New columns added: `handicap_type`, `scoring_method`
- Auto-calculations: `net_score`, `score_vs_par`, `player_match_par`
- Triggers in place for automatic field calculations

#### 2. **Core Services**
- `gameService.ts` - Game CRUD operations
- `holeStatsService.ts` - Hole statistics
- `profileGameService.ts` - Player game history

#### 3. **UI Components**
- `CreateGame.tsx` - Game creation wizard
- `AddParticipants.tsx` - Player selection
- `PlayerConfiguration.tsx` - Handicap/tee setup
- `GameSummary.tsx` - Pre-game review
- `LiveGame.tsx` - Live game container
- `HoleEntry.tsx` - Score input interface
- `Leaderboard.tsx` - Standings display
- `ScorecardMobile.tsx` - Mobile scorecard view

#### 4. **Utility Functions**
- `handicapCalculations.ts` - Handicap math
- `probabilityCalculations.ts` - Statistical calculations

### Components Needing Updates

| Component | Current State | Required Changes | Priority |
|-----------|--------------|------------------|----------|
| `Game` type | Only has `scoring_format` | Add `handicap_type`, `scoring_method` | HIGH |
| `CreateGame.tsx` | Single format selector | Add handicap & scoring selectors | HIGH |
| `gameService.ts` | Hardcoded match play logic | Use HandicapEngine | HIGH |
| `Leaderboard.tsx` | Match play only | Use ScoringEngine | HIGH |
| `GameSummary.tsx` | Shows match handicaps | Show PMP for all players | MEDIUM |
| `HoleEntry.tsx` | Shows strokes received | Show Player Match Par | MEDIUM |

## IMPORTANT: Handicap System Clarification

### Handicap Variables Used in Golf X

We use a **simplified 2-variable handicap system** for clarity and maintainability:

#### 1. **Course Handicap** (`course_handicap` in DB, `courseHandicap` in code)
- **Definition**: Player's handicap adjusted for course difficulty and tee selection
- **Formula**: `Handicap Index × (Slope Rating / 113) + (Course Rating - Par)`
- **Usage**: Base value for all handicap calculations
- **Example**: HI 15.0 → Course HC 17 (on a difficult course)

#### 2. **Match Handicap** (`match_handicap` in DB, `matchHandicap` in code)  
- **Definition**: Final strokes a player receives after applying game format rules
- **Calculation**: 
  - **Match Play formats**: `(Course HC × Allowance%) - Lowest Player's Adjusted HC`
  - **Stroke Play formats**: `Course HC × Allowance%` (no subtraction)
- **Examples**:
  - Match Play (100%): Player A: CH 10 → MH 0, Player B: CH 17 → MH 7
  - Stroke Play (95%): Player A: CH 10 → MH 9.5, Player B: CH 17 → MH 16.15

#### ~~Playing Handicap~~ (DEPRECATED - DO NOT USE)
- We do NOT store `playing_handicap` separately
- Format allowances are applied directly when calculating Match Handicap
- This simplifies the system and reduces confusion

### Calculation Flow

```
Handicap Index (from profile)
        ↓
Course Handicap (adjusted for course/tees)
        ↓
[Apply Format % + Game Rules]
        ↓
Match Handicap (final strokes for the game)
```

### Format Allowances

| Format | Allowance | Relative? | Formula |
|--------|-----------|-----------|---------|
| Match Play | 100% | Yes | `CH - min(all_CH)` |
| Stroke Play | 95% | No | `CH × 0.95` |
| Stableford | 95% | No | `CH × 0.95` |
| Skins | 100% | Yes | `CH - min(all_CH)` |
| Ghost Mode | 100% | Yes | `CH - ghost_CH` |

### Database Fields

```sql
-- game_participants table
course_handicap INTEGER,  -- Adjusted for course/tees
match_handicap INTEGER,   -- Final strokes after format/rules
playing_handicap INTEGER, -- DEPRECATED - kept for backwards compatibility, will be removed

-- game_hole_scores table  
hole_handicap_strokes INTEGER,  -- Strokes received on this hole
player_match_par INTEGER        -- Personal par for this hole
```

### Migration Notes

**IMPORTANT**: The `playing_handicap` field still exists in the database but is deprecated:
- **Current State**: Field exists in `game_participants` table
- **Transition**: New code should ignore this field and calculate format allowances on-the-fly
- **Future**: Will be removed in a future database migration
- **Fallback**: If `playing_handicap` exists but `match_handicap` doesn't, use `playing_handicap` as fallback

## Migration Architecture

### New Engine System

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ HandicapEngine  │────▶│  Scorecard   │────▶│ ScoringEngine   │
└─────────────────┘     └──────────────┘     └─────────────────┘
        ↓                       ↓                      ↓
   Calculate Match HC     Store Scores      Calculate Points
   & PMP from Course HC
```

### File Structure

```
src/features/normal-game/
├── engines/                    [NEW]
│   ├── HandicapEngine.ts      
│   ├── ScoringEngine.ts       
│   └── __tests__/             
├── services/                   [EXISTING]
│   ├── gameService.ts         [MODIFY]
│   └── scorecardService.ts    [NEW]
├── types/                      [MODIFY]
│   ├── index.ts               
│   ├── handicap.types.ts      [NEW]
│   └── scoring.types.ts       [NEW]
└── components/                 [MODIFY]
    ├── CreateGame.tsx         
    ├── Leaderboard.tsx        
    └── HoleEntry.tsx          
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

#### Task 1.1: Update Type Definitions
**File**: `src/features/normal-game/types/index.ts`

```typescript
// Add to existing types
export type HandicapType = 'none' | 'match_play' | 'stroke_play' | 'random';
export type ScoringMethod = 'net_score' | 'match_play' | 'stableford' | 'skins';

// Update Game interface
export interface Game {
  // ... existing fields
  handicap_type?: HandicapType;  // Add with default
  scoring_method?: ScoringMethod; // Add with default
}
```

#### Task 1.2: Create HandicapEngine
**File**: `src/features/normal-game/engines/HandicapEngine.ts`

```typescript
import { GameParticipant } from '../types';
import { calculateCourseHandicap, calculatePlayingHandicap } from '../utils/handicapCalculations';

export class HandicapEngine {
  static calculatePlayerMatchPar(
    participants: GameParticipant[],
    holes: any[],
    handicapType: HandicapType
  ): Map<string, number[]> {
    const pmpMap = new Map<string, number[]>();
    
    switch (handicapType) {
      case 'none':
        return this.noHandicap(participants, holes);
      case 'match_play':
        return this.matchPlayHandicap(participants, holes);
      case 'stroke_play':
        return this.strokePlayHandicap(participants, holes);
      case 'random':
        return this.randomHandicap(participants, holes);
      default:
        return this.matchPlayHandicap(participants, holes);
    }
  }

  private static noHandicap(participants: GameParticipant[], holes: any[]) {
    // PMP = hole par for all players
    const pmpMap = new Map<string, number[]>();
    participants.forEach(p => {
      pmpMap.set(p.user_id, holes.map(h => h.par));
    });
    return pmpMap;
  }

  private static matchPlayHandicap(participants: GameParticipant[], holes: any[]) {
    // Use existing match_handicap logic
    // Distribute strokes based on hole SI
    // Return PMP per player per hole
  }

  // ... other methods
}
```

#### Task 1.3: Create ScoringEngine
**File**: `src/features/normal-game/engines/ScoringEngine.ts`

```typescript
export class ScoringEngine {
  static calculateScoring(
    scorecard: any,
    scoringMethod: ScoringMethod
  ): GameResults {
    switch (scoringMethod) {
      case 'net_score':
        return this.netScoreScoring(scorecard);
      case 'match_play':
        return this.matchPlayScoring(scorecard);
      case 'stableford':
        return this.stablefordScoring(scorecard);
      case 'skins':
        return this.skinsScoring(scorecard);
      default:
        return this.matchPlayScoring(scorecard);
    }
  }

  private static matchPlayScoring(scorecard: any) {
    // For each hole, compare net scores between players
    // Award points based on wins
    // Return standings
  }

  // ... other scoring methods
}
```

### Phase 2: Service Integration (Week 1-2)

#### Task 2.1: Update GameService
**File**: `src/features/normal-game/services/gameService.ts`

```typescript
// In createGame method
async createGame(gameData: CreateGameData): Promise<Game> {
  // ... existing code
  
  // Add handicap_type and scoring_method to game creation
  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({
      // ... existing fields
      handicap_type: gameData.handicap_type || 'match_play',
      scoring_method: gameData.scoring_method || 'match_play',
    });

  // Calculate PMP using HandicapEngine
  const pmpMap = HandicapEngine.calculatePlayerMatchPar(
    participants,
    holes,
    gameData.handicap_type
  );

  // Store PMP in game_hole_scores when initializing
  // ... 
}
```

#### Task 2.2: Update Score Calculations
**File**: `src/features/normal-game/services/gameService.ts`

```typescript
async updateHoleScore(
  gameId: string,
  userId: string,
  holeNumber: number,
  strokes: number,
  putts?: number
) {
  // Get game type
  const { data: game } = await supabase
    .from('games')
    .select('handicap_type, scoring_method')
    .eq('id', gameId)
    .single();

  // Calculate strokes received based on handicap_type
  const strokesReceived = this.calculateStrokesForHole(
    participant,
    hole,
    game.handicap_type
  );

  // Save with calculated PMP
  const playerMatchPar = hole.par + strokesReceived;
  
  // ... save to database
}
```

### Phase 3: UI Updates (Week 2)

#### Task 3.1: Update CreateGame Component
**File**: `src/features/normal-game/components/CreateGame.tsx`

```typescript
// Add state for game types
const [handicapType, setHandicapType] = useState<HandicapType>('match_play');
const [scoringMethod, setScoringMethod] = useState<ScoringMethod>('match_play');

// ⚠️ IMPORTANT: IonRadioGroup Bug - Use onClick workaround
// Due to iOS mode bug, use onClick on IonItem instead of onIonChange
<div>
  <h3>Handicap System</h3>
  <IonRadioGroup value={handicapType}>
    <IonItem onClick={() => setHandicapType('match_play')}>
      <IonLabel>Match Play (Relative)</IonLabel>
      <IonRadio slot="end" value="match_play" />
    </IonItem>
    <IonItem onClick={() => setHandicapType('stroke_play')}>
      <IonLabel>Stroke Play (Full)</IonLabel>
      <IonRadio slot="end" value="stroke_play" />
    </IonItem>
    <IonItem onClick={() => setHandicapType('none')}>
      <IonLabel>No Handicap</IonLabel>
      <IonRadio slot="end" value="none" />
    </IonItem>
  </IonRadioGroup>
</div>

<div>
  <h3>Scoring Method</h3>
  <IonRadioGroup value={scoringMethod}>
    <IonItem onClick={() => setScoringMethod('match_play')}>
      <IonLabel>Match Play Points</IonLabel>
      <IonRadio slot="end" value="match_play" />
    </IonItem>
    <IonItem onClick={() => setScoringMethod('net_score')}>
      <IonLabel>Net Score Total</IonLabel>
      <IonRadio slot="end" value="net_score" />
    </IonItem>
  </IonRadioGroup>
</div>
```

#### Task 3.2: Update Leaderboard Component
**File**: `src/features/normal-game/components/Leaderboard.tsx`

```typescript
// Get scoring method from game
const { scoringMethod } = game;

// Use ScoringEngine for calculations
const standings = ScoringEngine.calculateScoring(
  { participants, scores, holes },
  scoringMethod
);

// Add scoring method switcher
const [viewMode, setViewMode] = useState(scoringMethod);

// Allow switching views
<IonSegment value={viewMode} onIonChange={e => setViewMode(e.detail.value)}>
  <IonSegmentButton value="match_play">
    <IonLabel>Match Play</IonLabel>
  </IonSegmentButton>
  <IonSegmentButton value="net_score">
    <IonLabel>Net Score</IonLabel>
  </IonSegmentButton>
</IonSegment>
```

#### Task 3.3: Update HoleEntry Component
**File**: `src/features/normal-game/components/HoleEntry.tsx`

```typescript
// Show Player Match Par instead of handicap strokes
<div>
  {participant.profiles?.full_name}
  <div>Personal Par: {playerMatchPar}</div>
</div>

// Update net score display
const netScore = strokes - playerMatchPar;
<div>
  {netScore === 0 ? 'Net Par' : 
   netScore < 0 ? `Net -${Math.abs(netScore)}` : 
   `Net +${netScore}`}
</div>
```

### Phase 4: Testing & Validation (Week 2-3)

#### Task 4.1: Unit Tests
```typescript
// HandicapEngine.test.ts
describe('HandicapEngine', () => {
  test('no handicap returns course par', () => {
    const result = HandicapEngine.calculatePlayerMatchPar(
      participants, holes, 'none'
    );
    expect(result.get(player1)).toEqual([4,4,3,5...]); // course pars
  });

  test('match play adjusts relative to lowest', () => {
    // Test relative handicap calculation
  });
});

// ScoringEngine.test.ts
describe('ScoringEngine', () => {
  test('match play awards points correctly', () => {
    const results = ScoringEngine.calculateScoring(
      scorecard, 'match_play'
    );
    expect(results[0].points).toBe(6);
  });
});
```

#### Task 4.2: Integration Tests
- Test game creation with different types
- Test score saving and calculations
- Test leaderboard updates

#### Task 4.3: E2E Tests
- Complete game flow with each combination
- Verify database integrity
- Test UI responsiveness

## Rollback Plan

If issues arise:

1. **Database**: Keep old columns, new columns have defaults
2. **Code**: Use feature flags to toggle new system
3. **UI**: Show/hide new selectors based on flag

```typescript
const ENABLE_MULTI_GAME = process.env.REACT_APP_MULTI_GAME === 'true';

if (ENABLE_MULTI_GAME) {
  // Show new selectors
} else {
  // Use old match_play only
}
```

## Success Metrics

- [ ] All existing games continue working
- [ ] New games can select handicap & scoring types
- [ ] Leaderboard shows correct standings
- [ ] Database calculations are accurate
- [ ] No performance degradation
- [ ] User feedback positive

## Common Issues & Solutions

### Issue 1: Old games missing new fields
**Solution**: Migration set defaults, handle nulls gracefully

```typescript
const handicapType = game.handicap_type || 'match_play';
const scoringMethod = game.scoring_method || 'match_play';
```

### Issue 2: PMP not calculated for old games
**Solution**: Calculate on-the-fly if missing

```typescript
if (!score.player_match_par) {
  score.player_match_par = hole.par + (score.hole_handicap_strokes || 0);
}
```

### Issue 3: Performance with multiple scoring calculations
**Solution**: Cache results, calculate on-demand

```typescript
const scoringCache = new Map();
function getScoring(gameId, method) {
  const key = `${gameId}-${method}`;
  if (!scoringCache.has(key)) {
    scoringCache.set(key, ScoringEngine.calculate(...));
  }
  return scoringCache.get(key);
}
```

## Implementation Status (Updated 2025-01-29)

### ✅ Completed Work

1. **Advanced Engine Architecture** (NEW)
   - [x] Created extensible MatchHandicapEngine with plugin system
   - [x] Implemented base strategies: match_play, stroke_play, none, random
   - [x] Added Ghost Mode for competing against best scorecards
   - [x] Created PMPEngine with flexible distribution methods
   - [x] Added support for friend selection in ghost mode
   - [x] Implemented proper display names for all game types
   - [x] Created comprehensive test page at `/test/handicap-engine`

2. **Engine Features**
   - [x] **MatchHandicapEngine** (`src/features/normal-game/engines/MatchHandicapEngine.ts`)
     - Strategy pattern for extensibility
     - Ghost mode with personal best, friend's best, course record
     - Context support for courseId, teeBoxId, selectedFriendId
     - Fallback handling for errors
   - [x] **PMPEngine** (`src/features/normal-game/engines/PMPEngine.ts`)
     - Multiple distribution strategies (stroke index, even, random, historical)
     - Ghost player support with historical data
     - Game type definitions with display names and icons
   - [x] **Test Page** (`src/pages/test/HandicapEngineTest.tsx`)
     - Desktop-only testing interface
     - All game type selection
     - Friend selection for ghost mode
     - Visual PMP grid showing strokes per hole
     - Debug information display

### ⚠️ Partially Complete

3. **UI Updates**
   - [x] CreateGame has handicap & scoring selectors
   - [ ] Selectors not connected to engines
   - [ ] PlayerConfiguration still uses old logic

### ❌ Not Started

4. **Service Integration**
   - [ ] gameService doesn't use new engines
   - [ ] PlayerConfiguration not using MatchHandicapEngine
   - [ ] HoleEntry not showing PMP

## Agent Checklist

When implementing:

1. **Read Documentation First**
   - [ ] GAMING_ARCHITECTURE.md
   - [ ] feature_specification.md
   - [ ] This migration plan
   - [x] Engine README at `src/features/normal-game/engines/README.md`

2. **Database Ready** ✅
   - [x] Tables have new columns
   - [x] Triggers calculate fields
   - [x] Old data has defaults

3. **Create Engines** ✅
   - [x] MatchHandicapEngine with extensible strategies
   - [x] PMPEngine with distribution methods
   - [x] Ghost mode support
   - [x] Test page for validation

4. **Update Services** ❌
   - [ ] gameService uses engines
   - [ ] PlayerConfiguration uses MatchHandicapEngine
   - [ ] Backwards compatible

5. **Update UI** ⚠️
   - [x] CreateGame has selectors
   - [ ] Leaderboard uses engine
   - [ ] HoleEntry shows PMP
   - [ ] Ghost mode UI in CreateGame

6. **Test Everything**
   - [x] Manual testing via test page
   - [ ] Integration with real game flow
   - [ ] Unit tests for engines

## Timeline

- **Week 1**: Core infrastructure (Engines + Types)
- **Week 2**: Service integration + UI updates
- **Week 3**: Testing + bug fixes
- **Week 4**: Rollout + monitoring

## Support & Questions

- Check `GUIDELINES/` folder for documentation
- Database schema in `DATABASE_SCHEMA_SIMPLE.md`
- Architecture details in `GAMING_ARCHITECTURE.md`
- Feature specs in `features/normal_game/feature_specification.md`

## Test Page Access

To test the new engine system:

1. Navigate to: **`http://localhost:5173/test/handicap-engine`**
2. Select handicap type from dropdown (includes ghost modes)
3. Configure course, tee box, and friend (for ghost mode)
4. Adjust test player handicaps
5. Click "Run Engine Test"
6. View Match HC and PMP results in tables below

**Note**: Test page is desktop-only and for development purposes.

---

*Last Updated: 2025-01-29*
*Version: 1.1*
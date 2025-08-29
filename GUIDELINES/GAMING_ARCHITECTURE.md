# Golf X - Gaming Architecture

## Overview

The Golf X gaming system is built on a modular architecture that separates handicap calculation from scoring methods, allowing flexible game combinations while maintaining a consistent scorecard structure.

## Core Principles

### 1. Separation of Concerns
- **Handicap Engine**: Determines stroke allocation (Player Match Par)
- **Scoring Engine**: Calculates points/results from scorecard
- **Scorecard**: Universal data structure for all game types

### 2. Modularity
Each component operates independently:
```
Players + Course + Handicap Type → [Handicap Engine] → Player Match Par (PMP)
                                                              ↓
Strokes + Putts + PMP → [Scorecard] → [Scoring Engine] → Points/Results
```

### 3. Flexibility
Any handicap method can be combined with any scoring method, enabling diverse game types from a single codebase.

## System Components

### Handicap Engine

**Purpose**: Calculate Player Match Par (PMP) for each player on each hole

**Location**: `src/features/normal-game/engines/HandicapEngine.ts`

**Interface**:
```typescript
interface HandicapEngine {
  calculatePlayerMatchPar(
    players: Player[],
    holes: Hole[],
    coursePar: number,
    handicapType: HandicapType
  ): PlayerMatchPar[][]
}

type HandicapType = 
  | 'none'           // No handicap - PMP equals course par
  | 'match_play'     // Relative handicap - lowest plays scratch
  | 'stroke_play'    // Full handicap strokes
  | 'random'         // Random stroke distribution
  | 'custom'         // Future: user-defined rules
```

**Output Structure**:
```typescript
interface PlayerMatchPar {
  playerId: string
  holeNumber: number
  basePar: number          // Course par for hole
  strokesReceived: number  // Handicap strokes allocated
  playerMatchPar: number   // basePar + strokesReceived
}
```

### Scoring Engine

**Purpose**: Calculate game results from completed/partial scorecards

**Location**: `src/features/normal-game/engines/ScoringEngine.ts`

**Interface**:
```typescript
interface ScoringEngine {
  calculateScoring(
    scorecard: Scorecard,
    scoringMethod: ScoringMethod
  ): GameResults
}

type ScoringMethod = 
  | 'net_score'      // Total: strokes - PMP
  | 'match_play'     // Points from 1v1 hole wins
  | 'stableford'     // Points based on score vs par
  | 'skins'          // Winner takes all per hole
  | 'custom'         // Future: user-defined scoring
```

**Scoring Method Details**:

#### Net Score
- Points = Strokes - Player Match Par
- Lower is better
- Used for stroke play competitions

#### Match Play
- For each hole, compare net scores between players
- Win = 1 point, Draw = 0.5 points, Loss = 0 points
- Points are sum of all 1v1 comparisons

#### Stableford (future)
- Points based on net score vs par
- Eagle or better: 4 points
- Birdie: 3 points
- Par: 2 points
- Bogey: 1 point
- Double bogey or worse: 0 points

### Universal Scorecard

**Purpose**: Consistent data structure for all game types

**Structure**:
```typescript
interface Scorecard {
  gameId: string
  courseId: number
  handicapType: HandicapType
  scoringMethod: ScoringMethod
  holes: HoleScore[]
}

interface HoleScore {
  holeNumber: number
  par: number
  handicapIndex: number  // Hole difficulty (1-18)
  playerScores: PlayerHoleScore[]
}

interface PlayerHoleScore {
  playerId: string
  strokes: number | null       // Actual strokes taken
  putts: number | null         // Putts taken
  playerMatchPar: number       // From HandicapEngine
  netScore: number | null      // strokes - playerMatchPar
  strokesReceived: number      // Handicap strokes on this hole
}
```

## Database Schema Extensions

### games table additions:
```sql
ALTER TABLE games ADD COLUMN handicap_type VARCHAR(20) DEFAULT 'match_play';
ALTER TABLE games ADD COLUMN scoring_method VARCHAR(20) DEFAULT 'match_play';
```

### game_hole_scores table additions:
```sql
ALTER TABLE game_hole_scores ADD COLUMN player_match_par INTEGER;
ALTER TABLE game_hole_scores ADD COLUMN strokes_received INTEGER DEFAULT 0;
```

## Implementation Guidelines

### 1. Game Creation Flow
```typescript
// Step 1: Select game parameters
const gameConfig = {
  courseId: number,
  handicapType: HandicapType,
  scoringMethod: ScoringMethod,
  players: Player[]
}

// Step 2: Calculate PMPs using HandicapEngine
const pmps = HandicapEngine.calculatePlayerMatchPar(
  gameConfig.players,
  holes,
  coursePar,
  gameConfig.handicapType
)

// Step 3: Initialize scorecard with PMPs
const scorecard = initializeScorecard(gameConfig, pmps)

// Step 4: Save to database
await gameService.createGame(gameConfig, scorecard)
```

### 2. Score Entry Flow
```typescript
// Step 1: User enters strokes and putts
const holeScore = {
  strokes: 5,
  putts: 2
}

// Step 2: Calculate net score
const netScore = holeScore.strokes - playerMatchPar

// Step 3: Update scorecard
scorecard.updateHoleScore(playerId, holeNumber, holeScore)

// Step 4: Recalculate game results
const results = ScoringEngine.calculateScoring(
  scorecard,
  game.scoringMethod
)
```

### 3. Live Scoring Updates
```typescript
// The scorecard maintains all raw data
// Scoring can be recalculated on-demand with different methods
const matchPlayResults = ScoringEngine.calculateScoring(scorecard, 'match_play')
const netScoreResults = ScoringEngine.calculateScoring(scorecard, 'net_score')

// Display multiple scoring views simultaneously
<ScoringTabs>
  <MatchPlayView results={matchPlayResults} />
  <NetScoreView results={netScoreResults} />
</ScoringTabs>
```

## File Structure

```
src/features/normal-game/
├── engines/
│   ├── HandicapEngine.ts       # Handicap calculation logic
│   ├── ScoringEngine.ts        # Scoring calculation logic
│   └── __tests__/              # Engine unit tests
├── services/
│   ├── gameService.ts          # Game CRUD operations
│   └── scorecardService.ts     # Scorecard management
├── types/
│   ├── handicap.types.ts       # Handicap-related types
│   ├── scoring.types.ts        # Scoring-related types
│   └── scorecard.types.ts      # Scorecard types
├── components/
│   ├── game-setup/             # Game creation components
│   ├── live-game/              # Active game components
│   └── game-results/           # Completed game components
└── utils/
    └── gameHelpers.ts          # Utility functions
```

## Migration Strategy

### Phase 1: Core Infrastructure
1. Create HandicapEngine with existing match_play logic
2. Create ScoringEngine with existing scoring logic
3. Add new database columns with defaults

### Phase 2: Refactor Existing
1. Update game creation to use engines
2. Modify scorecard to universal structure
3. Update LiveGame to use engines

### Phase 3: Add New Game Types
1. Implement additional handicap methods
2. Implement additional scoring methods
3. Add UI for game type selection

### Phase 4: Advanced Features
1. Custom game rules
2. Tournament modes
3. Team competitions

## Testing Strategy

### Unit Tests
- Test each handicap method independently
- Test each scoring method independently
- Test edge cases (0 handicap, max handicap, etc.)

### Integration Tests
- Test various handicap/scoring combinations
- Test scorecard updates and recalculations
- Test database persistence

### E2E Tests
- Complete game flow with different settings
- Score entry and live updates
- Game completion and results

## Performance Considerations

1. **Caching**: Cache PMP calculations per game
2. **Lazy Loading**: Calculate scoring only when viewed
3. **Incremental Updates**: Update only affected holes
4. **Background Processing**: Complex calculations in web workers

## Future Extensibility

### Custom Game Rules
```typescript
interface CustomRule {
  id: string
  name: string
  description: string
  modifyPMP?: (pmp: number, context: GameContext) => number
  modifyScore?: (score: number, context: GameContext) => number
}
```

### Tournament Support
```typescript
interface Tournament {
  rounds: Game[]
  aggregateScoring: AggregateMethod
  handicapAdjustment: HandicapAdjustment
}
```

### Team Games
```typescript
interface TeamGame {
  teams: Team[]
  teamHandicapMethod: TeamHandicapMethod
  teamScoringMethod: TeamScoringMethod
}
```

## Key Invariants

1. **Scorecard Immutability**: Once created, scorecard structure doesn't change
2. **PMP Consistency**: PMPs are calculated once at game start
3. **Score Independence**: Scoring method can be changed without affecting raw scores
4. **Data Integrity**: All scores must reference valid players and holes

## Common Game Configurations

### Traditional Match Play
- Handicap: `match_play` (relative to lowest)
- Scoring: `match_play` (hole-by-hole wins)

### Net Stroke Play
- Handicap: `stroke_play` (full handicap)
- Scoring: `net_score` (total strokes - handicap)

### Skins Game
- Handicap: `none` (no handicap)
- Scoring: `skins` (winner takes hole)

### Fun/Social Game
- Handicap: `random` (randomized strokes)
- Scoring: `stableford` (points system)

## Agent Development Notes

When implementing features:

1. **Always use engines** - Don't implement handicap/scoring logic in components
2. **Maintain scorecard structure** - All game types use the same scorecard
3. **Test combinations** - Ensure new methods work with existing ones
4. **Document game rules** - Add clear descriptions for user understanding
5. **Consider mobile UX** - Keep interfaces simple despite complexity

## Security Considerations

1. **Validate handicaps** - Ensure handicap indices are within valid ranges
2. **Prevent score tampering** - Use RLS policies for score updates
3. **Audit game changes** - Log all score modifications
4. **Rate limit updates** - Prevent rapid score changes

---

*Last Updated: 2025-01-29*
*Version: 1.0*
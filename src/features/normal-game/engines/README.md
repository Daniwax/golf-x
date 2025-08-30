# Handicap & PMP Engine System

## Overview

The Golf X handicap system is built with two main engines that work together:

1. **MatchHandicapEngine** - Calculates total match handicap strokes
2. **PMPEngine** - Distributes strokes across holes to create Player Match Par

## Architecture

```
User Selection → MatchHandicapEngine → MatchHandicapResult[] → PMPEngine → PlayerMatchPar[]
```

## Available Game Types

### Traditional Modes
- **Match Play** - Classic relative handicap (lowest plays off scratch)
- **Stroke Play** - Full handicap for all players
- **Scratch Golf** - No handicap adjustments
- **Lucky Draw** - Random handicaps for fun

### Ghost Modes
- **Beat Your Best** - Compete against your personal best on this course
- **Chase a Friend** - Compete against a selected friend's best round
- **Course Challenge** - Try to beat the course record

### Future Modes (Coming Soon)
- **Your Par** - Handicap based on your typical performance per hole
- **Weather Factor** - Adjusted for current conditions
- **Team Scramble** - Best ball team format

## Usage Example

```typescript
import { MatchHandicapEngine } from './MatchHandicapEngine';
import { PMPEngine } from './PMPEngine';

// Example players
const players = [
  {
    userId: 'user1',
    fullName: 'John Doe',
    handicapIndex: 15.0,
    courseHandicap: 16,
    playingHandicap: 16,
    teeBoxId: 1
  },
  {
    userId: 'user2',
    fullName: 'Jane Smith',
    handicapIndex: 8.0,
    courseHandicap: 9,
    playingHandicap: 9,
    teeBoxId: 1
  }
];

// Example holes
const holes = [
  { holeNumber: 1, par: 4, strokeIndex: 3 },
  { holeNumber: 2, par: 3, strokeIndex: 15 },
  { holeNumber: 3, par: 5, strokeIndex: 1 },
  // ... remaining holes
];

// Context for additional parameters
const context = {
  courseId: 123,
  teeBoxId: 1,
  // For ghost mode:
  selectedFriendId: 'friend123',
  selectedGhostType: 'friend_best' as const
};

// Step 1: Calculate Match Handicaps
const matchHandicaps = await MatchHandicapEngine.calculateMatchHandicap(
  players,
  'match_play', // or 'stroke_play', 'ghost', etc.
  context
);

// Result:
// [
//   { userId: 'user1', fullName: 'John Doe', matchHandicap: 7 },
//   { userId: 'user2', fullName: 'Jane Smith', matchHandicap: 0 }
// ]

// Step 2: Calculate PMP (Player Match Par)
// For ghost mode, pass game IDs to fetch historical scorecards
const ghostGameIds = new Map(); // Map<userId, gameId> for ghost players
const pmpMap = await PMPEngine.calculatePMP(
  matchHandicaps,
  holes,
  'match_play', // Uses this to determine distribution method
  ghostGameIds  // Optional: Map of userId -> gameId for ghost players
);

// Result: Map with PMP for each player on each hole
// user1 → [
//   { holeNumber: 1, holePar: 4, strokesReceived: 1, playerMatchPar: 5 },
//   { holeNumber: 2, holePar: 3, strokesReceived: 0, playerMatchPar: 3 },
//   { holeNumber: 3, holePar: 5, strokesReceived: 1, playerMatchPar: 6 },
//   ...
// ]
```

## Ghost Mode Example

```typescript
// Enable ghost mode - compete against friend's best
const context = {
  courseId: 123,
  teeBoxId: 1,
  selectedFriendId: 'friend123',
  selectedGhostType: 'friend_best' as const
};

const matchHandicaps = await MatchHandicapEngine.calculateMatchHandicap(
  players,
  'ghost', // Ghost mode
  context
);

// Result includes ghost player:
// [
//   { userId: 'user1', fullName: 'John Doe', matchHandicap: 7 },
//   { userId: 'user2', fullName: 'Jane Smith', matchHandicap: 0 },
//   { 
//     userId: 'ghost_friend_friend123',
//     fullName: 'Mike Johnson (Best)',
//     matchHandicap: 5,
//     isGhost: true,
//     ghostType: 'friend_best'
//   }
// ]
```

## Adding Custom Strategies

The system is designed to be extensible:

```typescript
// Create custom handicap strategy
class CustomHandicapStrategy implements HandicapStrategy {
  name = 'custom_mode';
  description = 'My custom handicap calculation';
  
  async calculate(players, context) {
    // Custom logic here
    return players.map(p => ({
      userId: p.userId,
      fullName: p.fullName,
      matchHandicap: customCalculation(p)
    }));
  }
}

// Register it
MatchHandicapEngine.registerStrategy(new CustomHandicapStrategy());

// Use it
const results = await MatchHandicapEngine.calculateMatchHandicap(
  players,
  'custom_mode',
  context
);
```

## Integration Points

### PlayerConfiguration Component
Should use `MatchHandicapEngine` instead of `calculateMatchHandicap`:

```typescript
// Old way (always uses relative handicap)
const matchHandicap = calculateMatchHandicap(allPlayingHandicaps, idx);

// New way (respects handicap type)
const matchHandicaps = await MatchHandicapEngine.calculateMatchHandicap(
  players,
  gameData.handicapType,
  { courseId: gameData.courseId, teeBoxId }
);
```

### GameService
Should integrate both engines when creating/updating games:

```typescript
// Calculate handicaps
const matchHandicaps = await MatchHandicapEngine.calculateMatchHandicap(
  participants,
  game.handicap_type,
  context
);

// Calculate PMP
const pmpMap = PMPEngine.calculatePMP(
  matchHandicaps,
  holes,
  game.handicap_type
);

// Store PMP in game_hole_scores
```

### HoleEntry Component
Should display PMP instead of strokes received:

```typescript
// Get player's PMP for this hole
const playerPMP = pmpMap.get(userId)?.[holeNumber - 1];

// Display
<div>Your Par: {playerPMP.playerMatchPar}</div>
```

## Database Considerations

For ghost mode to work properly, we need:

1. **Historical scores** in `game_hole_scores` table
2. **Best round tracking** - could add a `is_personal_best` flag
3. **Friend relationships** to allow ghost mode with friends

## Testing

Run the test suite:

```bash
npm test -- MatchHandicapEngine
npm test -- PMPEngine
```

## Migration Status

- ✅ Engines created with extensible architecture
- ✅ Ghost mode support implemented
- ✅ Display names added for all game types
- ❌ PlayerConfiguration not using new engines
- ❌ GameService not integrated
- ❌ HoleEntry not showing PMP
- ❌ Database queries for ghost mode not tested

## Next Steps

1. Integrate MatchHandicapEngine in PlayerConfiguration
2. Update GameService to use both engines
3. Modify HoleEntry to show PMP
4. Test ghost mode with real data
5. Add UI for selecting ghost mode options
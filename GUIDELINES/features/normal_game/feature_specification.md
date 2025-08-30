# Normal Game Feature Specification - Multi-Game Architecture

## Overview
The Normal Game mode supports flexible game combinations through modular handicap and scoring systems, allowing players to mix different handicap methods with various scoring formats. Supports 2-6 players in friend-based matches.

## Architecture Components

### Handicap Engine
Determines Player Match Par (PMP) for each player on each hole:
- **None**: No handicap (PMP = Course Par)
- **Match Play**: Relative handicap (lowest plays scratch)
- **Stroke Play**: Full handicap strokes
- **Random**: Fun randomized stroke distribution

### Scoring Engine
Calculates points/standings from scorecard data:
- **Net Score**: Total strokes minus PMP
- **Match Play**: Points from hole-by-hole wins
- **Stableford**: Points based on performance vs par
- **Skins**: Winner takes all per hole

## User Flow

### 1. Game Creation Flow

#### 1.1 Initial Setup Screen
```
┌─────────────────────────┐
│     Create New Game     │
├─────────────────────────┤
│                         │
│ Game Description:       │
│ [Loser pays dinner! 🍽️] │
│ (optional, 100 chars)   │
│                         │
│ Select Golf Course:     │
│ [La Moraleja       ▼]   │
│                         │
│ Weather Conditions:     │
│ ┌────┬────┬────┬────┐  │
│ │ ☀️ │ ⛅ │ 🌧️ │ 💨 │  │
│ └────┴────┴────┴────┘  │
│                         │
│ Handicap System:        │
│ ◉ Match Play (Relative) │
│ ○ Stroke Play (Full)    │
│ ○ No Handicap           │
│ ○ Random Fun            │
│                         │
│ Scoring Method:         │
│ ◉ Match Play Points     │
│ ○ Net Score Total       │
│ ○ Stableford Points     │
│ ○ Skins Game            │
│                         │
│ [Add Participants →]    │
└─────────────────────────┘
```

#### 1.2 Add Participants Screen
```
┌─────────────────────────┐
│    Add Participants     │
│    (Min 2, Max 6)       │
├─────────────────────────┤
│ Your Friends:           │
│                         │
│ □ John Smith           │
│ □ Mike Johnson         │
│ □ Sarah Williams       │
│ □ Tom Brown            │
│                         │
│ Selected: 0/6           │
│                         │
│ [Cancel]    [Next →]    │
└─────────────────────────┘
```

#### 1.3 Player Configuration Screen
```
┌─────────────────────────┐
│   Player Configuration  │
├─────────────────────────┤
│ John Smith              │
│                         │
│ Handicap Index:         │
│ [-] 12.5 [+]           │
│                         │
│ Select Tee:             │
│ ◉ Blue (Men's)         │
│ ○ White (Senior)        │
│ ○ Red (Ladies')         │
│                         │
│ Calculated Values:      │
│ • Course HCP: 14        │
│ • Playing HCP: 14       │
│ • Match HCP: 0          │
├─────────────────────────┤
│ Mike Johnson            │
│                         │
│ Handicap Index:         │
│ [-] 18.0 [+]           │
│                         │
│ Select Tee:             │
│ ◉ White (Senior)        │
│                         │
│ Calculated Values:      │
│ • Course HCP: 21        │
│ • Playing HCP: 21       │
│ • Match HCP: 7          │
└─────────────────────────┘
```

#### 1.4 Game Summary Screen
```
┌─────────────────────────┐
│     Game Summary        │
├─────────────────────────┤
│ La Moraleja             │
│ Match Play Handicap     │
│ Match Play Scoring      │
│ Sunny ☀️                │
├─────────────────────────┤
│ Player Match Pars       │
│                         │
│ John Smith              │
│ Personal Par: 72        │
│ (0 strokes received)    │
│                         │
│ Mike Johnson            │
│ Personal Par: 79        │
│ (7 strokes on SI 1-7)   │
│                         │
│ Sarah Williams          │
│ Personal Par: 83        │
│ (11 strokes on SI 1-11) │
├─────────────────────────┤
│ [Back]    [Start Game]  │
└─────────────────────────┘
```

### 2. Live Game Interface

#### 2.1 Scorecard View with Multi-Scoring
```
┌─────────────────────────────────────┐
│      Live Scorecard                 │
│   [Match Play] [Net Score] [Stats]  │
├────┬───────┬───────┬────────┬───┬───┤
│Hole│ John  │ Mike  │ Sarah  │PAR│PMP│
├────┼───────┼───────┼────────┼───┼───┤
│ 1  │ 5(5)  │ 6(5)  │ 7(6)   │ 4 │4/5│
│ 2  │ 4(4)  │ 5(4)  │ 6(5)   │ 4 │4/4│
│ 3  │ 3(3)  │ 4(4)  │ 5(5)   │ 3 │3/4│
├────┼───────┼───────┼────────┼───┼───┤
│NET │  12   │  13   │  16    │   │   │
│PTS │   2   │   1   │   0    │   │   │
└────┴───────┴───────┴────────┴───┴───┘

Format: strokes(net_score)
PMP: Course_Par/Player_Match_Par
```

#### 2.2 Dynamic Leaderboard
```
┌─────────────────────────┐
│   Current Standings     │
│   Format: Match Play    │
├─────────────────────────┤
│                         │
│ Match Play Points:      │
│ 1. John    6 pts        │
│ 2. Mike    3 pts        │
│ 3. Sarah   0 pts        │
│                         │
│ Alternative View:       │
│ [Switch to Net Score ▼] │
│                         │
│ Net Performance:        │
│ 1. John    -2           │
│ 2. Mike    +1           │
│ 3. Sarah   +3           │
│                         │
│ Holes: 3/18 completed   │
└─────────────────────────┘
```

#### 2.3 Universal Hole Entry
```
┌───────────────────────────────────────────────────┐
│ < Hole 4 - Par 5 - HCP 1 - 485 yards >           │
├───────────────────────────────────────────────────┤
│     John          Mike           Sarah            │
│   PMP: 5         PMP: 6         PMP: 6           │
│                                                   │
│  [-] 5 [+]      [-] 6 [+]      [-] 7 [+]        │
│   Strokes        Strokes        Strokes          │
│                                                   │
│  [-] 2 [+]      [-] 2 [+]      [-] 3 [+]        │
│    Putts          Putts          Putts           │
│                                                   │
│  Net: Par       Net: Par       Net: +1           │
│                                                   │
│              [Save & Next →]                      │
└───────────────────────────────────────────────────┘

PMP = Player Match Par (personal expected score)
Net = Strokes - PMP
```

### 3. Scoring Display Modes

#### Match Play Points View
```
Current Hole Results:
John vs Mike: John wins (1 pt)
John vs Sarah: John wins (1 pt)
Mike vs Sarah: Mike wins (1 pt)

Total Points: John 2, Mike 1, Sarah 0
```

#### Net Score View
```
Net Scores (vs Personal Par):
John: -2 (70 vs 72)
Mike: +1 (80 vs 79)
Sarah: +3 (86 vs 83)
```

#### Stableford View
```
Points This Hole:
John: 2 pts (Par)
Mike: 2 pts (Net Par)
Sarah: 1 pt (Net Bogey)

Total: John 18, Mike 16, Sarah 12
```

## Database Structure

### games Table
- `handicap_type`: 'none' | 'match_play' | 'stroke_play' | 'random'
- `scoring_method`: 'net_score' | 'match_play' | 'stableford' | 'skins'

### game_participants Table
- `course_handicap`: Adjusted for course difficulty
- `playing_handicap`: Format-specific adjustment
- `match_handicap`: Relative handicap for stroke allocation

### game_hole_scores Table
- `strokes`: Actual strokes taken (user input)
- `putts`: Putts taken (optional)
- `hole_par`: Course par for hole
- `hole_handicap_strokes`: Strokes received on hole
- `player_match_par`: Personal par (auto-calculated)
- `net_score`: Strokes - handicap strokes (auto-calculated)
- `score_vs_par`: Strokes - hole par (auto-calculated)

## Handicap Engine Implementation

```typescript
interface HandicapEngine {
  calculatePlayerMatchPar(
    players: Player[],
    holes: Hole[],
    handicapType: HandicapType
  ): PlayerMatchPar[][]
}

// Example: Match Play Handicap
function matchPlayHandicap(players, holes) {
  // 1. Calculate course handicaps
  // 2. Find lowest handicap
  // 3. Adjust all relative to lowest
  // 4. Distribute strokes by hole SI
  return playerMatchPars;
}
```

## Scoring Engine Implementation

```typescript
interface ScoringEngine {
  calculateScoring(
    scorecard: Scorecard,
    scoringMethod: ScoringMethod
  ): GameResults
}

// Example: Match Play Scoring
function matchPlayScoring(scorecard) {
  // For each hole, compare net scores
  // Award points for wins
  // Sum total points
  return standings;
}
```

## Benefits of Multi-Game Architecture

1. **Flexibility**: Any handicap × any scoring = unique game
2. **Fairness**: Multiple ways to level playing field
3. **Variety**: Same round, different winners possible
4. **Simplicity**: One scorecard, multiple interpretations
5. **Extensibility**: Easy to add new methods

## Common Game Combinations

### Traditional Match Play
- Handicap: Match Play (relative)
- Scoring: Match Play (hole wins)
- Best for: Head-to-head competition

### Net Stroke Play
- Handicap: Stroke Play (full)
- Scoring: Net Score (total)
- Best for: Tournament style

### Skins Game
- Handicap: None
- Scoring: Skins (winner takes hole)
- Best for: High stakes fun

### Fun Scramble
- Handicap: Random
- Scoring: Stableford
- Best for: Social rounds

## Migration from Single to Multi-Game

### Phase 1: Database Ready ✅
- Added handicap_type and scoring_method fields
- Created auto-calculation triggers
- Cleaned up redundant columns

### Phase 2: Engine Development
- Create HandicapEngine service
- Create ScoringEngine service
- Unit test all combinations

### Phase 3: UI Updates
- Add game type selectors
- Multiple scoring views
- Real-time switching

### Phase 4: Advanced Features
- Custom handicap rules
- Team competitions
- Tournament modes

## Testing Strategy

### Unit Tests
- Each handicap method
- Each scoring method
- Edge cases (0 handicap, max handicap)

### Integration Tests
- Game creation with types
- Score entry and calculations
- Leaderboard updates

### E2E Tests
- Complete game flow
- Scoring method switching
- Multi-player scenarios

## Performance Optimizations

1. **Calculate Once**: PMP at game start
2. **Cache Results**: Store calculations
3. **Lazy Load**: Calculate scoring on demand
4. **Background**: Heavy calculations in workers

## Security Considerations

- Validate handicap ranges (0-54)
- Prevent score tampering via RLS
- Audit trail for changes
- Rate limit updates

## Future Enhancements

### Near Term
- More handicap methods (9-hole, progressive)
- Additional scoring (Nassau, Vegas)
- Team formats (Best Ball, Scramble)

### Long Term
- AI-suggested handicaps
- Historical performance analysis
- Tournament management
- Live streaming scores
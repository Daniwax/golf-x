// Scoring Method Documentation
// Standardized documentation for all scoring calculation methods

export const scoringMethodRules = {
  match_play: {
    title: 'Match Play Scoring',
    content: `# Match Play Scoring Method

## Overview
Match Play scoring is a hole-by-hole competition where each hole is a separate contest. Players earn points by winning holes against opponents. The player with the most points after 18 holes wins.

---

## Scoring System
- **Win a hole**: 1 point
- **Halve a hole**: 0.5 points
- **Lose a hole**: 0 points
- **Multiple opponents**: Points earned against each opponent separately

---

## How It Works

### Hole-by-Hole Competition
1. Compare net scores on each hole
2. Lowest net score wins the hole
3. Equal net scores = hole halved
4. Points accumulate throughout the round

### Multiple Player Calculation
- Each player competes against every other player
- Example with 4 players: Each hole has 6 separate matches (A vs B, A vs C, A vs D, B vs C, B vs D, C vs D)
- Maximum points per hole = (number of opponents)

---

## Scoring Example

**Hole 5 (Par 4)**
- Player A: Net 3 (birdie)
- Player B: Net 4 (par)
- Player C: Net 4 (par)
- Player D: Net 5 (bogey)

**Points Awarded:**
- Player A: 3 points (beat all 3 opponents)
- Player B: 1.5 points (tied with C, beat D)
- Player C: 1.5 points (tied with B, beat D)
- Player D: 0 points (lost to all)

---

## Final Standings Calculation

1. **Sum all points** earned across 18 holes
2. **Rank by total points** (highest wins)
3. **Tiebreakers** (if needed):
   - Head-to-head record
   - Most holes won
   - Back 9 points
   - Countback from hole 18

---

## Strategic Considerations

### Advantages
✓ Every hole matters equally
✓ Can recover from bad holes
✓ Exciting head-to-head competition
✓ Natural pressure situations

### Playing Strategy
- Focus on winning holes, not total score
- Aggressive play often rewarded
- Match situation affects strategy
- Concede when appropriate (match play etiquette)

---

## Game Completion
- Traditional match play: Ends when one player is "up" more holes than remain
- Points-based: Always play all 18 holes
- Final winner: Most total points

---

## Best Used With
- **Handicap Types**: Match Play Handicap (recommended), Stroke Play Handicap
- **Group Size**: 2-4 players ideal
- **Competition Level**: All levels, from casual to championship`
  },
  
  net_score: {
    title: 'Net Score',
    content: `# Net Score Scoring Method

## Overview
Net Score is the traditional stroke play scoring where the winner is determined by the lowest total net score after 18 holes. Each player's gross score is adjusted by their handicap strokes to calculate their net score.

---

## Scoring System
- **Gross Score**: Actual strokes taken
- **Handicap Strokes**: Strokes received based on handicap
- **Net Score**: Gross Score - Handicap Strokes
- **Winner**: Lowest total net score

---

## How It Works

### Score Calculation Per Hole
1. Record gross score (actual strokes)
2. Subtract handicap strokes for that hole
3. Result = Net score for the hole
4. Sum all 18 net scores for total

### Formula
\\[
\\text{Net Score} = \\text{Gross Score} - \\text{Handicap Strokes}
\\]

\\[
\\text{Total Net} = \\sum_{i=1}^{18} \\text{Net Score}_i
\\]

---

## Scoring Example

**Player with 15 handicap strokes**

| Hole | Par | SI | Gross | Strokes | Net |
|------|-----|-----|-------|---------|-----|
| 1 | 4 | 3 | 5 | 1 | 4 |
| 2 | 3 | 15 | 4 | 1 | 3 |
| 3 | 5 | 7 | 6 | 1 | 5 |
| 4 | 4 | 1 | 6 | 1 | 5 |
| ... | ... | ... | ... | ... | ... |
| 18 | 4 | 16 | 5 | 0 | 5 |

**Total: Gross 88, Net 73**

---

## Final Standings Calculation

1. **Calculate total net score** for each player
2. **Rank by net score** (lowest wins)
3. **Tiebreakers** (if needed):
   - Lower back 9 net score
   - Lower back 6 net score
   - Lower back 3 net score
   - Hole-by-hole from 18 backwards

---

## Strategic Considerations

### Advantages
✓ Simple and traditional
✓ Every stroke counts
✓ Clear winner determination
✓ Suitable for any field size

### Playing Strategy
- Consistency is key
- Avoid big numbers
- Course management important
- Play to your handicap

---

## Game Completion
- All 18 holes must be completed
- Maximum score rules may apply (net double bogey)
- Final winner: Lowest total net score

---

## Best Used With
- **Handicap Types**: Stroke Play Handicap (recommended), Match Play Handicap
- **Group Size**: Any size field
- **Competition Level**: All levels, tournaments standard`
  },
  
  stableford: {
    title: 'Stableford Scoring',
    content: `# Stableford Scoring Method

## Overview
Stableford is a points-based scoring system where players earn points based on their net score relative to par on each hole. Higher points are better, rewarding good holes while minimizing the impact of disaster holes.

---

## Scoring System

### Points Table (Net Score vs Par)
- **Albatross or better** (≤-3): 5 points
- **Eagle** (-2): 4 points
- **Birdie** (-1): 3 points
- **Par** (0): 2 points
- **Bogey** (+1): 1 point
- **Double Bogey or worse** (≥+2): 0 points

---

## How It Works

### Point Calculation Per Hole
1. Calculate net score for the hole
2. Compare net score to par
3. Award points based on the table
4. Sum all points for 18-hole total

### Formula
\\[
\\text{Points} = f(\\text{Net Score} - \\text{Par})
\\]

Where f is the points function from the table above

\\[
\\text{Total Points} = \\sum_{i=1}^{18} \\text{Points}_i
\\]

---

## Scoring Example

**Hole-by-hole for 15 handicap player**

| Hole | Par | Net | vs Par | Points |
|------|-----|-----|--------|---------|
| 1 | 4 | 4 | 0 | 2 |
| 2 | 3 | 2 | -1 | 3 |
| 3 | 5 | 7 | +2 | 0 |
| 4 | 4 | 3 | -1 | 3 |
| 5 | 4 | 5 | +1 | 1 |
| ... | ... | ... | ... | ... |

**Total: 36 points**

---

## Final Standings Calculation

1. **Sum all points** from 18 holes
2. **Rank by total points** (highest wins)
3. **Tiebreakers** (if needed):
   - Back 9 points
   - Back 6 points
   - Back 3 points
   - Hole-by-hole from 18 backwards

---

## Strategic Considerations

### Advantages
✓ Rewards aggressive play
✓ One bad hole won't ruin the round
✓ Encourages faster play (pick up after net double bogey)
✓ More exciting than stroke play

### Playing Strategy
- Go for birdies and eagles
- Don't fear the big number
- Pick up when out of points
- Attack pins when appropriate

---

## Modified Stableford Variations

Some competitions use modified point values:
- **Pro Modified**: Eagle=5, Birdie=2, Par=0, Bogey=-1, Double=-3
- **High Stakes**: Eagle=8, Birdie=3, Par=1, Bogey=-1, Double=-3

---

## Game Completion
- Can pick up once no points possible
- All 18 holes scored (even if 0 points)
- Final winner: Most total points

---

## Best Used With
- **Handicap Types**: Any handicap type works well
- **Group Size**: Any size field
- **Competition Level**: Popular for society days and fun competitions`
  },
  
  skins: {
    title: 'Skins Game',
    content: `# Skins Game Scoring Method

## Overview
Skins is a winner-takes-all format where each hole has a value (skin). The player with the lowest net score wins the skin. If players tie, the skin carries over to the next hole, creating accumulating prizes.

---

## Scoring System
- **Each hole** = 1 skin (base value)
- **Win outright** = Collect all skins for that hole
- **Tie** = Skin carries to next hole
- **Carryover** = Accumulated skins increase hole value

---

## How It Works

### Skin Allocation
1. Each hole starts with 1 skin
2. Lowest net score wins the skin(s)
3. Ties cause carryover to next hole
4. Carryovers accumulate until won
5. Winner takes all accumulated skins

### Special Rules
- **Validation**: Some games require birdie or better to win skins
- **No carryover on 18**: Final hole ties split skins
- **Progressive value**: Later holes may be worth more

---

## Scoring Example

**9-Hole Example**

| Hole | Base | Carry | Total | Winner | Skins Won |
|------|------|-------|-------|---------|-----------|
| 1 | 1 | 0 | 1 | Player A | 1 |
| 2 | 1 | 0 | 1 | Tied | 0 |
| 3 | 1 | 1 | 2 | Tied | 0 |
| 4 | 1 | 2 | 3 | Player B | 3 |
| 5 | 1 | 0 | 1 | Player C | 1 |
| 6 | 1 | 0 | 1 | Tied | 0 |
| 7 | 1 | 1 | 2 | Tied | 0 |
| 8 | 1 | 2 | 3 | Tied | 0 |
| 9 | 1 | 3 | 4 | Player A | 4 |

**Total Skins: A=5, B=3, C=1**

---

## Final Standings Calculation

1. **Count total skins won** by each player
2. **Rank by skins** (most wins)
3. **Tiebreakers** (if needed):
   - Total number of holes won
   - Quality of wins (birdies/eagles)
   - Playoff holes

---

## Strategic Considerations

### Advantages
✓ Every hole is a new opportunity
✓ Dramatic carryover situations
✓ Rewards exceptional play
✓ Natural excitement builder

### Playing Strategy
- Be aggressive when skins accumulate
- Know when to play safe
- Watch what opponents need
- Final holes often most valuable

---

## Variations

### Common Modifications
- **Automatic Press**: Double value on par 3s
- **Birdie Validation**: Must birdie to win skins
- **Progressive Values**: Back 9 worth double
- **Team Skins**: Best ball format

---

## Game Completion
- All 18 holes played
- Unresolved ties on 18 split evenly
- Final winner: Most total skins
- Monetary games: Each skin has cash value

---

## Best Used With
- **Handicap Types**: Match Play Handicap (recommended) for fairness
- **Group Size**: 3-4 players ideal
- **Competition Level**: Popular for gambling games and charity events`
  }
};

export type ScoringMethod = keyof typeof scoringMethodRules;
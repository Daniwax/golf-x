// Handicap Type Documentation
// Standardized documentation for all handicap calculation methods

export const handicapTypeRules = {
  match_play: {
    title: 'Match Play Handicap',
    content: `# Match Play Handicap System

## Overview
Match Play Handicap creates a level playing field by giving strokes relative to the lowest handicap player. The lowest handicap player plays off scratch (0), while others receive the difference in strokes.

---

## Purpose
- **Fairness**: Ensures equal competition between players of different skill levels
- **Competition**: Each hole becomes a winnable contest for all players
- **Simplicity**: Easy to track who gets strokes on which holes

---

## Mathematical Formula

### Step 1: Course Handicap (CH)
\\[
CH = HI × \\frac{Slope}{113} + (CR - Par)
\\]

### Step 2: Playing Handicap (PH)
\\[
PH = CH × 1.0 \\quad (100\\% \\ allowance)
\\]

### Step 3: Match Handicap (MH)
\\[
MH_i = PH_i - \\min(PH_{all})
\\]

Where:
- HI = Handicap Index
- Slope = Slope Rating of the tee box
- CR = Course Rating
- Par = Course Par
- min(PH) = Lowest Playing Handicap in the group

---

## Stroke Allocation Rules

1. **Players receive strokes based on Stroke Index (SI)**
   - SI 1 is the hardest hole, SI 18 is the easiest
   
2. **Distribution pattern:**
   - 1-18 strokes: One stroke on holes SI 1 through MH
   - 19-36 strokes: Two strokes on holes SI 1 through (MH-18)
   - 37+ strokes: Three strokes on holes SI 1 through (MH-36)

---

## Example Calculation

**Players:**
- Player A: HI = 8.2, CH = 9, PH = 9
- Player B: HI = 15.4, CH = 17, PH = 17
- Player C: HI = 22.1, CH = 24, PH = 24

**Match Handicaps:**
- Player A: 9 - 9 = **0 strokes**
- Player B: 17 - 9 = **8 strokes** (on SI 1-8)
- Player C: 24 - 9 = **15 strokes** (on SI 1-15)

---

## When to Use
- **Best for**: Head-to-head or small group competitions
- **Game formats**: Match play, skins, Nassau
- **Group size**: 2-4 players ideal

---

## Advantages
✓ Creates exciting hole-by-hole competition
✓ Higher handicaps have realistic chance to win holes
✓ Simple to understand and track
✓ Standard in competitive match play

---

## Considerations
- Can create large stroke differences in mixed-skill groups
- Not suitable for large field competitions
- Focuses on individual holes rather than total score`
  },
  
  stroke_play: {
    title: 'Stroke Play Handicap',
    content: `# Stroke Play Handicap System

## Overview
Stroke Play Handicap gives each player their full course handicap strokes, allowing everyone to compete against the course and field simultaneously. All players receive their complete handicap allowance.

---

## Purpose
- **Individual Performance**: Each player plays against the course
- **Field Competition**: Compare net scores across all players
- **Full Allowance**: Everyone gets their complete handicap benefit

---

## Mathematical Formula

### Step 1: Course Handicap (CH)
\\[
CH = HI × \\frac{Slope}{113} + (CR - Par)
\\]

### Step 2: Playing Handicap (PH)
\\[
PH = CH × 1.0 \\quad (100\\% \\ allowance)
\\]

### Step 3: Stroke Play Handicap
\\[
StrokePlayHandicap = PH
\\]

Where:
- HI = Handicap Index
- Slope = Slope Rating of the tee box
- CR = Course Rating
- Par = Course Par

---

## Stroke Allocation Rules

1. **All players receive their full handicap strokes**
   - Based on Stroke Index (SI) of each hole
   
2. **Distribution pattern:**
   - 1-18 strokes: One stroke on holes SI 1 through PH
   - 19-36 strokes: Two strokes on holes SI 1 through (PH-18)
   - 37+ strokes: Three strokes on holes SI 1 through (PH-36)

---

## Example Calculation

**Players:**
- Player A: HI = 8.2, CH = 9, PH = 9
- Player B: HI = 15.4, CH = 17, PH = 17
- Player C: HI = 22.1, CH = 24, PH = 24

**Stroke Play Handicaps:**
- Player A: **9 strokes** (on SI 1-9)
- Player B: **17 strokes** (on SI 1-17)
- Player C: **24 strokes** (1 on all holes, +1 on SI 1-6)

---

## When to Use
- **Best for**: Tournament play, medal play
- **Game formats**: Stroke play, Stableford, medal competitions
- **Group size**: Any size field

---

## Advantages
✓ Fair comparison across large fields
✓ Everyone plays to their full potential
✓ Standard for tournament golf
✓ Clear total score winner

---

## Considerations
- Can lead to slow play with high handicappers
- No direct hole-by-hole competition
- Focus on total score rather than individual holes`
  },
  
  none: {
    title: 'No Handicap (Scratch)',
    content: `# No Handicap System (Scratch Play)

## Overview
No Handicap system means all players compete at scratch - no strokes are given or received. This is pure golf where actual scores determine the winner, commonly used in professional play.

---

## Purpose
- **Pure Competition**: Test actual golf skill without adjustments
- **Simplicity**: No calculations or stroke allocations needed
- **Professional Standard**: How the pros play

---

## Mathematical Formula

### Step 1: Course Handicap (CH)
\\[
CH = 0
\\]

### Step 2: Playing Handicap (PH)
\\[
PH = 0
\\]

### Step 3: No Handicap Allocation
\\[
Strokes = 0 \\quad \\text{(for all players)}
\\]

Where:
- All players play to par on every hole
- No adjustments made for skill level

---

## Stroke Allocation Rules

1. **No strokes given or received**
   - Every player plays to course par
   
2. **Distribution pattern:**
   - 0 strokes on all holes for all players
   - Gross score = Net score

---

## Example Calculation

**Players:**
- Player A: HI = 8.2 → **0 strokes**
- Player B: HI = 15.4 → **0 strokes**
- Player C: HI = 22.1 → **0 strokes**

**On every hole:**
- Par is the same for everyone
- No stroke adjustments
- Lowest gross score wins

---

## When to Use
- **Best for**: Players of similar skill level
- **Game formats**: Professional tournaments, club championships (gross division)
- **Group size**: Any size, but best with similar abilities

---

## Advantages
✓ Purest form of golf competition
✓ No calculations required
✓ Fastest pace of play
✓ Clear, undisputed results

---

## Considerations
- Only fair with similar skill levels
- Can be discouraging for higher handicappers
- Not suitable for mixed-ability groups
- Eliminates competitive balance between different skill levels`
  },
  
  random: {
    title: 'Random Handicap',
    content: `# Random Handicap System

## Overview
Random Handicap adds an element of fun and unpredictability by randomly distributing each player's handicap strokes across the 18 holes, rather than following the traditional Stroke Index order.

---

## Purpose
- **Fun Factor**: Creates unexpected challenges and opportunities
- **Variety**: Different stroke distribution each round
- **Equalizer**: Can neutralize course knowledge advantage

---

## Mathematical Formula

### Step 1: Course Handicap (CH)
\\[
CH = HI × \\frac{Slope}{113} + (CR - Par)
\\]

### Step 2: Playing Handicap (PH)
\\[
PH = CH × 1.0 \\quad (100\\% \\ allowance)
\\]

### Step 3: Random Distribution
\\[
RandomStrokes = \\text{Randomly assign PH strokes to holes}
\\]

Where:
- Total strokes = PH (same as stroke play)
- Distribution = Random instead of by Stroke Index

---

## Stroke Allocation Rules

1. **Random distribution algorithm:**
   - Start with PH total strokes
   - Randomly select holes to receive strokes
   - Multiple strokes possible on same hole
   
2. **Distribution examples (PH = 12):**
   - Possible: 2 strokes on holes 3,7,14; 1 stroke on 1,5,9,11,13,16
   - Possible: 1 stroke on random 12 holes
   - Possible: 3 strokes on hole 5, 2 on hole 10, 1 on seven other holes

---

## Example Calculation

**Player with PH = 18:**

*Traditional allocation:* 1 stroke on every hole

*Random allocation (example):*
- Holes 1,7,15: 3 strokes each
- Holes 3,8,12,18: 2 strokes each
- Holes 5,11: 1 stroke each
- Holes 2,4,6,9,10,13,14,16,17: 0 strokes

Total = 18 strokes (same total, different distribution)

---

## When to Use
- **Best for**: Casual rounds, fun competitions
- **Game formats**: Any format seeking variety
- **Group size**: Works with any size group

---

## Advantages
✓ Adds excitement and unpredictability
✓ Levels playing field in unexpected ways
✓ Creates unique challenges each round
✓ Fun alternative to traditional methods

---

## Considerations
- Not suitable for official competitions
- Can create unusual scoring patterns
- May give strokes on easy holes, none on hard holes
- Removes strategic element of stroke allocation`
  }
};

export type HandicapType = keyof typeof handicapTypeRules;
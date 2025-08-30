# PMP Engine Distribution Documentation

## Overview
This document describes how the PMP (Player Match Par) Engine distributes Match Handicap strokes across holes for different game types. The PMP Engine takes the Match Handicap (calculated by the Handicap Engine), adjusts it for the number of holes being played, and determines which holes receive strokes.

## Hole Count Normalization (CRITICAL)

### The Two-Step Process
1. **Adjust Match Handicap for holes played**
2. **Distribute adjusted strokes only across those holes**

### Step 1: Match Handicap Adjustment
When playing fewer than 18 holes, the Match Handicap must be proportionally adjusted:

```
Adjusted Match HC = Match HC × (Holes Played / 18)
```

#### Examples:
- **18 holes with MH 18**: Adjusted MH = 18 × (18/18) = 18 strokes
- **9 holes with MH 18**: Adjusted MH = 18 × (9/18) = 9 strokes  
- **6 holes with MH 18**: Adjusted MH = 18 × (6/18) = 6 strokes
- **6 holes with MH 10**: Adjusted MH = 10 × (6/18) = 3.33 → 3 strokes (rounded)

### Step 2: Hole Selection Rules
- **Always start from hole 1**: Games MUST start at hole 1
- **Sequential holes only**: If playing 8 holes, it's holes 1-8 (never random selection)
- **Distribution scope**: Strokes are ONLY distributed across the holes being played


## Distribution Methods

### 1. **Stroke Index Distribution** (Default)
Used by most traditional game formats

#### How It Works
- **Logic**: Strokes allocated to holes with lowest Stroke Index (SI) first
- **Priority**: SI 1 gets strokes before SI 2, and so on
- **Multiple Strokes**: If Match HC > 18, second strokes start again at SI 1

#### Distribution Pattern
```
Match HC 5:  Strokes on holes with SI 1,2,3,4,5
Match HC 18: Strokes on all holes (one each)
Match HC 22: 1 stroke all holes + 2 strokes on SI 1,2,3,4
Match HC 36: 2 strokes on all holes
```

#### Used By Game Types
- **Match Play**: Standard distribution by difficulty
- **Stroke Play**: Same as match play
- **Ghost Modes**: For real players (not ghost)

#### Examples with Variable Hole Counts

**18 holes (Full Round) - MH 18:**
```
Hole:    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
SI:      7  11 15 1  9  5  17 3  13 8  12 16 2  10 6  18 4  14
Adj MH:  18 × (18/18) = 18 strokes
Strokes: 1  1  1  1  1  1  1  1  1  1  1  1  1  1  1  1  1  1
```

**9 holes - MH 18:**
```
Hole:    1  2  3  4  5  6  7  8  9
SI:      7  11 15 1  9  5  17 3  13
Adj MH:  18 × (9/18) = 9 strokes
Strokes: 1  0  0  1  0  1  0  1  0  (SI 1,3,5,7,9 get strokes)
```

**6 holes - MH 18:**
```
Hole:    1  2  3  4  5  6
SI:      7  11 15 1  9  5
Adj MH:  18 × (6/18) = 6 strokes
Strokes: 1  0  0  1  1  1  (SI 1,5,7,9 - but only 1,5,7 are in holes 1-6)
```

---

### 2. **Even Distribution**
Future format for balanced challenge

#### How It Works
- **Logic**: Spreads strokes as evenly as possible across all holes
- **Priority**: First n holes get extra stroke if not divisible by 18
- **Goal**: Avoid clustering strokes on hardest holes

#### Distribution Pattern
```
Match HC 5:  5 holes get 1 stroke (holes 1-5)
Match HC 18: All holes get 1 stroke
Match HC 22: All get 1, first 4 get 2
Match HC 36: All holes get 2 strokes
```

#### Used By Game Types
- **Not currently active** (future format)
- Potential for team events or scrambles

#### Example (18 holes)
```
Hole:    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
MH=5:    1  1  1  1  1  0  0  0  0  0  0  0  0  0  0  0  0  0
MH=22:   2  2  2  2  1  1  1  1  1  1  1  1  1  1  1  1  1  1
```

---

### 3. **Controlled Random Distribution**
For Lucky Draw mode - balanced chaos

#### How It Works
- **Logic**: Random allocation with caps and minimum spread rules
- **Caps**: Maximum strokes per hole based on ADJUSTED MH range
- **Spread**: Minimum number of holes that must receive strokes (capped by holes played)
- **Goal**: Create unpredictability while maintaining playability

#### Control Rules (Based on ADJUSTED Match Handicap)
```
Adj MH 1-9:    Max 1 stroke/hole, all strokes on different holes
Adj MH 10-18:  Max 2 strokes/hole, min(9, holes_played) holes with strokes
Adj MH 19-27:  Max 2 strokes/hole, min(10, holes_played) holes with strokes
Adj MH 28-36:  Max 3 strokes/hole, min(12, holes_played) holes with strokes
Adj MH 37+:    Max 3 strokes/hole, min(15, holes_played) holes with strokes
```

#### Variable Holes Example
**6 holes - MH 18 (Lucky Draw):**
```
Original MH: 18
Adjusted MH: 18 × (6/18) = 6 strokes
Max per hole: 1 (Adj MH 1-9 range)
Min holes: min(6, 6) = all 6 holes must get strokes
Result: Each hole gets exactly 1 stroke (random doesn't matter here)
```

**9 holes - MH 27 (Lucky Draw):**
```
Original MH: 27
Adjusted MH: 27 × (9/18) = 13.5 → 14 strokes
Max per hole: 2 (Adj MH 10-18 range)
Min holes: min(9, 9) = at least 9 holes (all of them)
Result: 5 holes get 2 strokes, 4 holes get 1 stroke (randomly selected)
```

#### Distribution Algorithm
```javascript
function controlledRandomDistribution(matchHandicap, holes) {
  // Determine constraints
  const maxPerHole = matchHandicap <= 9 ? 1 : 
                     matchHandicap <= 27 ? 2 : 3;
  const minHoles = matchHandicap <= 9 ? matchHandicap :
                   matchHandicap <= 18 ? 9 :
                   matchHandicap <= 27 ? 10 :
                   matchHandicap <= 36 ? 12 : 15;
  
  // Initialize allocation
  const allocation = new Array(18).fill(0);
  let remaining = matchHandicap;
  
  // Randomly select holes
  const shuffled = [...Array(18).keys()]
    .sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, minHoles);
  
  // Distribute base strokes evenly
  const base = Math.floor(matchHandicap / minHoles);
  selected.forEach(hole => {
    const strokes = Math.min(base, maxPerHole);
    allocation[hole] = strokes;
    remaining -= strokes;
  });
  
  // Distribute remainder randomly
  while (remaining > 0) {
    const available = allocation
      .map((s, i) => ({i, s}))
      .filter(h => h.s < maxPerHole);
    if (!available.length) break;
    
    const random = available[
      Math.floor(Math.random() * available.length)
    ];
    allocation[random.i]++;
    remaining--;
  }
  
  return allocation;
}
```

#### Used By Game Types
- **Lucky Draw (random)**: Fair chaos with 95% MH calculation

#### Example (18 holes)
```
MH=21 (controlled random):
Step 1: Max 2 per hole, min 11 holes
Step 2: Random selection of 11 holes
Step 3: Base allocation (21/11 = 1.9 → 1 per hole)
Step 4: Distribute 10 remaining strokes

Result:
Hole:    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
Strokes: 0  2  0  2  1  0  2  1  0  2  2  0  2  1  2  0  2  0
(11 holes with strokes, max 2, total = 21)
```

---

### 4. **Historical Distribution**
For ghost players only

#### How It Works
- **Logic**: Uses actual scores from best historical round
- **Data Source**: Database query for best round on course/tee
- **Calculation**: `Strokes Received = Historical Score - Hole Par`
- **Fallback**: If no data, uses Stroke Index distribution

#### Distribution Pattern
```
Not based on Match Handicap at all
Each hole's PMP = actual score from best round
Creates realistic "ghost" to chase
```

#### Used By Game Types
- **Ghost Personal Best**: Your best scores
- **Ghost Friend's Best**: Friend's best scores  
- **Ghost Course Record**: Record holder's scores

#### Example (18 holes)
```
Hole:    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
Par:     4  4  3  5  4  4  3  5  4  4  4  3  5  4  4  3  5  4
Ghost:   4  5  3  5  4  5  2  6  4  4  5  3  5  5  4  3  5  4
Strokes: 0  1  0  0  0  1  -1 1  0  0  1  0  0  1  0  0  0  0
PMP:     4  5  3  5  4  5  2  6  4  4  5  3  5  5  4  3  5  4
```

---

## Distribution by Game Type

### Traditional Games

| Game Type | Distribution Method | Why |
|-----------|-------------------|-----|
| **Match Play** | Stroke Index | Rewards good play on hard holes |
| **Stroke Play** | Stroke Index | Standard tournament distribution |
| **Scratch** | None (MH=0) | No strokes to distribute |

### Fun Modes

| Game Type | Distribution Method | Why |
|-----------|-------------------|-----|
| **Lucky Draw** | Random | Adds chaos element |

### Ghost Modes

| Game Type | Real Players | Ghost Player | Why |
|-----------|-------------|--------------|-----|
| **Personal Best** | Stroke Index | Historical | Real vs actual past |
| **Friend's Best** | Stroke Index | Historical | Compete against friend's actual |
| **Course Record** | Stroke Index | Historical | Challenge the best |

---

## Key Formulas

### Adjusted Match Handicap (CRITICAL - NEW)
```javascript
function adjustMatchHandicap(matchHandicap, holesPlayed) {
  // Always adjust for the number of holes being played
  const adjustedMH = Math.round(matchHandicap * (holesPlayed / 18));
  return adjustedMH;
}
```

### Strokes on Hole (Stroke Index Method - UPDATED)
```javascript
function getStrokesOnHole(hole, adjustedMatchHandicap, holesPlayed) {
  // Only consider holes being played (1 to holesPlayed)
  if (hole.holeNumber > holesPlayed) return 0;
  
  const strokeIndex = hole.strokeIndex;
  if (adjustedMatchHandicap <= 0) return 0;
  
  let strokes = 0;
  // Use adjusted MH for distribution
  if (adjustedMatchHandicap >= strokeIndex) strokes++;           // First round
  if (adjustedMatchHandicap >= holesPlayed + strokeIndex) strokes++;  // Second round
  if (adjustedMatchHandicap >= (holesPlayed * 2) + strokeIndex) strokes++; // Third round
  
  return strokes;
}
```

### Player Match Par
```
PMP = Hole Par + Strokes Received
```

### Historical PMP (Ghost)
```
PMP = Actual Score from Best Round (first N holes if playing less than 18)
Strokes Received = Score - Par (for display)
```

---

## Visual Examples

### Match Handicap 7 (Stroke Index)
```
SI Order:  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
Strokes:   1  1  1  1  1  1  1  0  0  0  0  0  0  0  0  0  0  0
```

### Match Handicap 25 (Stroke Index)
```
SI Order:  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
Strokes:   2  2  2  2  2  2  2  1  1  1  1  1  1  1  1  1  1  1
```

### Match Handicap 7 (Even Distribution)
```
Holes:     1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
Strokes:   1  1  1  1  1  1  1  0  0  0  0  0  0  0  0  0  0  0
```

### Match Handicap 7 (Random)
```
Holes:     1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
Strokes:   0  1  0  2  0  0  0  1  0  1  0  0  2  0  0  0  0  0
```

---

## Important Notes

1. **PMP Engine is separate from Handicap Engine**
   - Handicap Engine: Calculates Match Handicap
   - PMP Engine: Distributes those strokes to holes

2. **Distribution happens AFTER Match HC calculation**
   - Input: Match Handicap from Handicap Engine
   - Output: PMP for each hole

3. **Ghost players are special**
   - Don't use Match Handicap for distribution
   - Use actual historical scores instead

4. **Stroke Index is king**
   - Most formats use SI distribution
   - Only Random and Ghost use different methods

5. **PMP is what matters for scoring**
   - Players compare their score to their PMP
   - Net score = Actual Score - PMP

---

## Testing Distribution

On test page (http://localhost:5173/test/handicap-engine):

1. **Run test with different Match HC values**
2. **Check PMP table** - Shows strokes per hole
3. **Gray cells** = Holes receiving strokes
4. **Total column** = Should equal Par + Match HC

---

*Last Updated: 2025-01-29*
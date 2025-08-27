// Scoring format rules - temporary storage in code
// TODO: Move to database in the future

export const scoringFormatRules = {
  stroke_play: {
    title: 'Singles Stroke Play',
    content: `# Singles Stroke Play – Professional Reference

## Overview
Singles Stroke Play is the most common golf competition format. Every stroke counts, and the player with the lowest **net total score** after 18 holes is the winner.

---

## Required Inputs
- **Handicap Index (HI)**
- **Slope Rating (Slope)**
- **Course Rating (CR)**
- **Par (Par)**
- **Stroke Index (SI[1–18])**

---

## Step 1: Course Handicap (CH)

\\[
CH = HI × \\frac{Slope}{113} + (CR - Par)
\\]

Round to the nearest whole number.

---

## Step 2: Playing Handicap (PH)
For Singles Stroke Play:

\\[
PH = CH \\quad (100\\% \\ allowance)
\\]

---

## Step 3: Handicap Stroke Allocation
Each player's strokes are distributed across holes as follows:

- If **CH ≤ 18** → 1 stroke on holes SI = 1…CH.
- If **CH > 18** → 1 stroke on all 18 holes, then a second stroke on SI = 1…(CH – 18). Repeat if CH > 36.

**Examples:**
- CH = 12 → 1 stroke on SI 1–12.
- CH = 22 → 1 stroke on all 18 holes, plus 1 extra on SI 1–4.

---

## Step 4: Hole Scoring
- **Gross Score** = actual strokes taken on a hole.
- **Net Score** = Gross Score – allocated handicap strokes for that hole.

---

## Step 5: Round Scoring
1. Add all **gross scores** → Gross Total.
2. Add all **net scores** → Net Total.
3. Lowest **Net Total** wins.

---

## Example Calculation
**Inputs**
- Player A: HI = 10.3 → CH ≈ 10
- Player B: HI = 22.5 → CH ≈ 23

**Allocation**
- Player A: 1 stroke on SI 1–10.
- Player B: 1 stroke on all 18 holes, plus extra strokes on SI 1–5.

**Scoring (Hole 1, SI = 1)**
- Gross A = 5 → Net = 5 – 1 = 4
- Gross B = 6 → Net = 6 – 2 = 4
- Result: Hole halved (on net).

---

## Quick Checklist
1. Compute CH.
2. PH = CH.
3. Allocate strokes across holes using SI.
4. Record gross and net scores per hole.
5. Add totals → lowest net wins.

---

### And remember..
> *"Stroke play is a marathon. Every shot matters. Stay patient, respect the grind, and keep stacking good swings—the scoreboard will take care of itself."*`
  },
  match_play: {
    title: 'Singles Match Play',
    content: `# Singles Match Play – Professional Reference

## Overview
Singles Match Play is a head‑to‑head format where each hole is a separate contest. Handicaps are applied to ensure fairness between players of different skill levels.

---

## Required Inputs
- **Handicap Index (HI)**
- **Slope Rating (Slope)**
- **Course Rating (CR)**
- **Par (Par)**
- **Stroke Index (SI[1–18])**

---

## Step 1: Course Handicap (CH)

\\[
CH = HI × \\frac{Slope}{113} + (CR - Par)
\\]

Round to the nearest whole number.

---

## Step 2: Playing Handicap (PH)
For Singles Match Play:

\\[
PH = CH \\quad (100\\% \\ allowance)
\\]

---

## Step 3: Match Handicap
- Subtract the lowest Playing Handicap from all players:

\\[
MatchHandicap_i = PH_i - \\min_j(PH_j)
\\]

- Lowest player(s): **0 strokes**
- Others: receive strokes equal to the difference.

---

## Step 4: Stroke Allocation
For a player with **S = Match Handicap**:
1. If **S ≥ 18** → assign 1 stroke on all 18 holes, then reduce S by 18. Repeat until S < 18.
2. Assign the remaining strokes (S) to the hardest holes (SI = 1…S).

**Examples:**
- S = 9 → strokes on SI 1–9.
- S = 23 → 1 stroke on all 18 holes, plus extra on SI 1–5.

---

## Step 5: Scoring Rules
- Each hole is a contest.
- Lowest **net score** wins the hole.
- If tied, the hole is **halved**.
- Match ends when a player is up more holes than remain.

---

## Example Calculation
**Inputs**
- Player A: HI = 6.2
- Player B: HI = 14.7
- Tees: Slope = 132, CR = 71.5, Par = 72

**Course Handicaps**
- A: (6.2 × 132 / 113) + (71.5 – 72) ≈ 6 → **6**
- B: (14.7 × 132 / 113) – 0.5 ≈ 15 → **15**

**Match Handicap**
- Lowest PH = 6
- A = 0
- B = 15 – 6 = **9**

**Allocation**
- B receives strokes on SI 1–9
- A receives none

**Scoring (Hole 1, SI = 1)**
- Gross A = 4 → Net = 4
- Gross B = 5 – 1 = 4
- Result: Hole halved

---

## Quick Checklist
1. Compute CH.
2. PH = CH.
3. Subtract lowest to get Match Handicap.
4. Allocate strokes by SI.
5. Compare net scores hole by hole.
6. Match ends when one player is up more holes than remain.

---

### And remember..
> *"In match play, it's not about the field, it's about the opponent standing in front of you. Play the course, trust your preparation, and remember—the match is never over until the last putt drops."*`
  }
};

export type ScoringFormat = keyof typeof scoringFormatRules;
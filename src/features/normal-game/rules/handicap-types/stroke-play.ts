export const strokePlayHandicap = {
  id: 'stroke_play',
  title: 'Stroke Play Handicap',
  subtitle: 'Full handicap for all players',
  content: `
## Overview
Stroke Play uses the full handicap system where each player receives their complete handicap allowance to calculate their net score.

## How It Works
- Every player uses their **full Course Handicap**
- Strokes are subtracted from gross score to get net score
- The player with the **lowest net total** wins
- All strokes count toward the final score

## Calculation Example
**Players and Scores:**
- Player A: Gross 85, Handicap 10 = Net 75
- Player B: Gross 92, Handicap 18 = Net 74  
- Player C: Gross 98, Handicap 25 = Net 73

**Winner:** Player C with net 73

## Stroke Distribution
Strokes are allocated across holes based on Stroke Index:
- Handicap 10 = 1 stroke on SI holes 1-10
- Handicap 18 = 1 stroke on all 18 holes
- Handicap 25 = 1 stroke on all holes + extra on SI 1-7
- Handicap 36 = 2 strokes on all 18 holes

## When to Use
**Best for:** Tournaments, club competitions, and when you want the most accurate representation of each player's performance against the course.

## Strategic Notes
- Every stroke matters - no picking up
- Course management is crucial
- Consistency beats occasional brilliance
- Playing safe on high-index holes can pay off
- Know where you get strokes before starting
`
};
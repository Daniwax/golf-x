export const matchPlayHandicap = {
  id: 'match_play',
  title: 'Match Play Handicap',
  subtitle: 'Relative handicap - lowest plays off scratch',
  content: `
## Overview
Match Play uses a relative handicap system where the lowest handicap player plays off scratch (zero), and all other players receive the difference in strokes.

## How It Works
- The player with the **lowest handicap** plays to scratch (0)
- Other players receive strokes equal to the **difference** between their handicap and the lowest
- Strokes are allocated to the hardest holes first (lowest Stroke Index)

## Calculation Example
**Players:**
- Player A: 10 handicap
- Player B: 18 handicap  
- Player C: 25 handicap

**Adjusted for Match Play:**
- Player A: 0 strokes (lowest)
- Player B: 8 strokes (18 - 10)
- Player C: 15 strokes (25 - 10)

## Stroke Distribution
Strokes are given on holes based on the Stroke Index (SI):
- 8 strokes = Holes with SI 1-8
- 15 strokes = Holes with SI 1-15
- More than 18 strokes = Additional strokes on hardest holes

## When to Use
**Best for:** Head-to-head competition where relative skill matters more than absolute scoring. Creates closer matches between players of different abilities.

## Strategic Notes
- Focus on winning individual holes, not total score
- A 10 on a hole counts the same as a bogey if you lose
- Conceded putts are common in match play
- Psychological pressure plays a bigger role
`
};
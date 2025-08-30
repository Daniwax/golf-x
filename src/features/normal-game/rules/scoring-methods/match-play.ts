export const matchPlayMethod = {
  id: 'match_play',
  title: 'Match Play',
  subtitle: 'Points for each hole won',
  content: `
## Overview
Match Play is a hole-by-hole competition where you earn points for winning individual holes. The player who wins the most holes wins the match.

## How It Works
- Win a hole = **1 point**
- Tie a hole = **0 points** (hole is "halved")
- Lose a hole = **0 points**
- Most points after 18 holes wins

## Calculation Example
**9-Hole Match Progress:**
- Holes Won: 4
- Holes Lost: 3  
- Holes Tied: 2
- **Current Status: 1 UP**

**Match Terminology:**
- "2 UP" = Leading by 2 holes
- "All Square" = Match tied
- "3 & 2" = Won by 3 holes with 2 to play
- "Dormie" = Leading by number of holes left

## Scoring Details
**Winning a Hole:**
- Lowest net score wins the hole
- Gross score if no handicap
- Concessions allowed (given putts)
- No carryover - each hole stands alone

## When to Use
**Best for:** Head-to-head competition, team matches, bracket tournaments, or when you want dramatic hole-by-hole competition rather than cumulative scoring.

## Strategic Notes
- A bad hole only costs one point
- Aggressive play often rewarded
- Psychology matters - pressure mounts
- Know when to concede putts
- Match status affects strategy
`
};
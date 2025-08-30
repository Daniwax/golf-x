export const stablefordMethod = {
  id: 'stableford',
  title: 'Stableford',
  subtitle: 'Points based on score vs par',
  content: `
## Overview
Stableford awards points based on your score relative to par on each hole. Higher points are better, and bad holes don't ruin your round.

## How It Works
- Points awarded based on net score vs par
- More points for better scores
- Zero points limits damage from bad holes
- Highest total points wins

## Calculation Example
**Points System (Net Score):**
- Eagle or better: **4 points**
- Birdie: **3 points**
- Par: **2 points**
- Bogey: **1 point**
- Double bogey or worse: **0 points**

**Sample Scoring:**
- Hole 1: Par (2 points)
- Hole 2: Birdie (3 points)
- Hole 3: Triple bogey (0 points)
- **Running Total: 5 points**

## Scoring Details
**Modified Stableford (Optional):**
- Eagle: 5 points
- Birdie: 2 points
- Par: 0 points
- Bogey: -1 point
- Double bogey: -3 points

## When to Use
**Best for:** Encouraging aggressive play, speeding up play (pick up after double bogey), high-handicap events, or when you want to minimize the impact of disaster holes.

## Strategic Notes
- Bad holes can't destroy your round
- Aggressive play for birdies rewarded
- Pick up after reaching double bogey
- Focus on scoring holes where you get strokes
- Consistency in scoring points matters most
`
};
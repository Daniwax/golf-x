# Golf Scoring Methods - Implementation Guide

This document describes the scoring methods implemented in Golf X's ScoringEngine, with actual algorithmic details.

## Overview

All scoring methods return a `LeaderboardResult` object with:
- **metadata**: Scoring method details, rules, and sort direction
- **entries**: Array of player results with position, score, and details

```typescript
interface LeaderboardResult {
  metadata: {
    scoringMethod: ScoringMethod;
    scoringName: string;
    sortDirection: 'asc' | 'desc';
    scoringDetails: string; // Markdown rules
  };
  entries: LeaderboardEntry[];
}
```

---

## 1. **Stroke Play** - Lowest Score Wins

### Implementation Details:
- **Score**: Difference from par (not total strokes)
- **Sort Direction**: Ascending (lower is better)
- **Handicap**: Uses player match par when available
- **Net Score**: Used when traditional handicaps applied

### Algorithm:
```typescript
// Score vs par calculation (using personal par if handicaps applied)
const scoreDiff = grossScore - totalPar;
const rankingScore = scoreDiff; // -2, E, +5, etc.
```

### Tiebreaker:
1. Back 9 score (lowest wins)
2. If still tied: back 6, back 3, then last hole

### Example Results:
- Player A: 78 strokes vs 72 par = **+6** (score for ranking)
- Player B: 85 strokes vs 78 personal par = **+7** (score for ranking)
- Winner: Player A (+6 beats +7)

---

## 2. **Match Play** - Round Robin Points System

### Implementation Details:
- **Score**: Total points from pairwise comparisons
- **Sort Direction**: Descending (higher is better)
- **Default Scoring**: 2 points win, 1 point tie, 0 points loss
- **Configurable**: `calculateMatchPlay(scorecards, handicap, pointsForWin=2, pointsForTie=1)`

### Algorithm:
```typescript
// For each hole, compare every player against every other player
for (let i = 0; i < players.length; i++) {
  for (let j = i + 1; j < players.length; j++) {
    if (player1.strokes < player2.strokes) {
      player1Points += pointsForWin; // Default: +2
    } else if (player2.strokes < player1.strokes) {
      player2Points += pointsForWin; // Default: +2
    } else {
      player1Points += pointsForTie; // Default: +1
      player2Points += pointsForTie; // Default: +1
    }
  }
}
```

### Points Distribution Per Hole:
- **2 players**: 2 points total (2-0 or 1-1)
- **3 players**: 6 points total (3 comparisons × 2 points each)
- **4 players**: 12 points total (6 comparisons × 2 points each)

### Maximum Scores (18 holes, default 2/1/0):
- **2 players**: 36 points (18 × 2)
- **3 players**: 72 points (18 × 4 from beating 2 opponents)
- **4 players**: 108 points (18 × 6 from beating 3 opponents)

### Example (3 players, Hole 1: A=4, B=5, C=6):
- A beats B: A gets 2 points
- A beats C: A gets 2 points
- B beats C: B gets 2 points
- **Result**: A=4, B=2, C=0 (6 points total)

### Tiebreakers:
1. **Most outright holes won** (not shared ties)
2. **Fewest total strokes**

### Head-to-Head Match Status:
- **In Progress**: "3 up", "All Square", "2 down"
- **Completed**: "Won 5&4", "Won 2 up", "Tied"

---

## 3. **Stableford** - Points for Performance

### Implementation Details:
- **Score**: Total points earned across all holes
- **Sort Direction**: Descending (higher is better)
- **Traditional Scoring**: Based on score relative to par

### Point System:
```typescript
const scoreDiff = strokes - par;
if (scoreDiff <= -3) points = 5;      // Double Eagle+
else if (scoreDiff === -2) points = 4; // Eagle
else if (scoreDiff === -1) points = 3; // Birdie
else if (scoreDiff === 0) points = 2;  // Par
else if (scoreDiff === 1) points = 1;  // Bogey
else points = 0;                       // Double Bogey+
```

### Maximum Score:
- **18 holes**: 90 points (18 × 5 if all double eagles)
- **Typical range**: 20-40 points for average players

### Tiebreaker:
1. Most holes with points scored
2. Back 9 points total

---

## 4. **Skins** - Winner Takes All with Carryovers

### Implementation Details:
- **Score**: Total skins won
- **Sort Direction**: Descending (higher is better)
- **Carryover Logic**: Tied holes add value to next hole

### Algorithm:
```typescript
let carryOver = 0;
for (each hole) {
  const currentSkinValue = 1 + carryOver;
  const bestScore = Math.min(...playerScores);
  const winners = players.filter(p => p.score === bestScore);
  
  if (winners.length === 1) {
    // Outright winner gets all skins
    winner.skins += currentSkinValue;
    carryOver = 0;
  } else {
    // Tie - carry over to next hole
    carryOver += currentSkinValue;
  }
}
```

### Example Scenario:
- **Hole 1**: Tied → 1 skin carries over
- **Hole 2**: Tied → 2 skins carry over (1+1)
- **Hole 3**: Tied → 3 skins carry over (2+1)
- **Hole 4**: Player A wins → Gets 4 skins!

### Tiebreaker:
1. Most individual holes won
2. Fewest total strokes

---

## Technical Notes

### Handicap Application:
```typescript
// Applied per hole using stroke index
const strokesReceived = getHandicapStrokes(
  playingHandicap, 
  holeStrokeIndex, 
  numHoles
);
const netStrokes = grossStrokes - strokesReceived;
```

### Position Assignment:
All methods use the same position assignment logic that handles ties:
```typescript
let currentPosition = 1;
for (let i = 0; i < entries.length; i++) {
  if (i > 0 && entries[i].score !== entries[i - 1].score) {
    currentPosition = i + 1;
  }
  entries[i].position = currentPosition;
}
```

### Return Format Consistency:
Every scoring method returns the same structured result:
- **Numeric scores** for proper sorting (no strings)
- **Detailed metadata** with markdown rules
- **Method-specific details** for each player
- **Consistent tiebreaker logic**

---

## Usage Examples

```typescript
// Basic usage with defaults
const result = ScoringEngine.calculateLeaderboard(scorecards, 'match_play');

// Custom match play scoring (3 points win, 1 point tie)
const customResult = ScoringEngine.calculateLeaderboard(
  scorecards, 
  'match_play', 
  false, // includeHandicap
  3,     // pointsForWin
  1      // pointsForTie
);

// Access results
console.log(result.metadata.scoringName); // "Match Play"
console.log(result.entries[0].score);     // 34 (points)
console.log(result.entries[0].details);   // Method-specific details
```
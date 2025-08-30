export const randomHandicap = {
  id: 'random',
  title: 'Lucky Draw',
  subtitle: 'Fun mode with controlled randomness for playable chaos',
  content: `
## Overview
Lucky Draw adds unpredictability while keeping handicaps fair. It applies the same 95% allowance as Stroke Play, but distributes strokes using a controlled random algorithm.

## Match Handicap Calculation
- **Allowance Applied**: 95% of Course Handicap
- **Formula**: \`Course Handicap × 0.95\`
- **Relative Adjustment**: None – each player keeps their adjusted handicap

## PMHP Distribution Method
- **Method**: Controlled random allocation
- **Logic**: Caps per hole and minimum holes ensure playability
- **Why**: Keeps the game fun, fair, and unpredictable

## Control Rules
| Player Match HC | Max Strokes/Hole | Min Holes w/Strokes | Strategy |
|-----------------|------------------|---------------------|----------|
| 1–9             | 1                | 0                   | Simple random |
| 10–18           | 2                | MH/2 (min 9)        | Spread with doubles |
| 19–27           | 2                | 10+                 | Balanced spread |
| 28–36           | 3                | 12+                 | Most holes affected |
| 37+             | 3                | 15+                 | Nearly all holes |

## Distribution Algorithm
1. Calculate max strokes per hole from MH range  
2. Determine minimum holes required (\`MH / max_per_hole\`)  
3. Randomly select holes for strokes  
4. Never exceed the cap per hole  

## Example
Players:  
- Player A: Course HC 10 → Match HC 10 (9.5 rounds up)  
- Player B: Course HC 22 → Match HC 21 (20.9 rounds up)  

PMHP  for Player B (MH=21, controlled random):  
- Max 2 strokes per hole (19–27 range)  
- At least 11 holes receive strokes  
- Random selection, not based on SI
  `
}

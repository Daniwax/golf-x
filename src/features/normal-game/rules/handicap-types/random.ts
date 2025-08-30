export const randomHandicap = {
  id: 'random',
  title: 'Lucky Draw',
  subtitle: 'Fun mode with controlled randomness for playable chaos',
  content: `
## Overview
Lucky Draw adds unpredictability while keeping handicaps fair. It applies the same 95% allowance as Stroke Play, but distributes strokes using a controlled random algorithm.

## Match Handicap Calculation
- Allowance: 95% of Course Handicap
- Relative Adjustment: None – each player keeps their adjusted handicap

## PMHP Distribution Method
- Method: Controlled random allocation
- Logic: Caps per hole and minimum holes ensure playability
- Why: Keeps the game fun, fair, and unpredictable

## Control Rules
- **MH 1–9**: Max 1 stroke per hole, no minimum holes (simple random)  
- **MH 10–18**: Max 2 strokes per hole, at least 9 holes (spread with doubles)  
- **MH 19–27**: Max 2 strokes per hole, at least 10 holes (balanced spread)  
- **MH 28–36**: Max 3 strokes per hole, at least 12 holes (most holes affected)  
- **MH 37+**: Max 3 strokes per hole, at least 15 holes (nearly all holes)  

## Distribution Algorithm
1. Calculate max strokes per hole based on MH range  
2. Determine minimum holes needed (\`MH / max_per_hole\`)  
3. Randomly select which holes get strokes  
4. Never exceed the cap per hole  

## Example
Players:  
- Player A: Course HC 10 → Match HC 10 (9.5 rounds up)  
- Player B: Course HC 22 → Match HC 21 (20.9 rounds up)  

PMHP for Player B (MH = 21, controlled random):  
- Max 2 strokes per hole (19–27 range)  
- At least 11 holes must have strokes  
- Random selection, not based on SI
  `
}

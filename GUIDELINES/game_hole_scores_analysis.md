# Game Hole Scores Table Analysis

## Current Table Structure

### Existing Columns

| Column | Type | Nullable | Default | Purpose | Current Usage |
|--------|------|----------|---------|---------|---------------|
| **id** | uuid | NO | gen_random_uuid() | Primary key | ✅ Working |
| **game_id** | uuid | NO | - | Links to games table | ✅ Working |
| **user_id** | uuid | NO | - | Links to profiles table | ✅ Working |
| **hole_number** | integer | NO | - | Hole number (1-18) | ✅ Working |
| **strokes** | integer | YES | - | Actual strokes taken | ✅ Working |
| **putts** | integer | YES | - | Number of putts | ✅ Working |
| **hole_par** | integer | NO | - | Par for the hole | ✅ Set when saving |
| **hole_handicap_strokes** | integer | YES | 0 | Strokes received on hole | ✅ Set when saving |
| **net_score** | integer | YES | - | Net score (strokes - handicap) | ❌ Never calculated |
| **score_vs_par** | integer | YES | - | Score relative to par | ❌ Never calculated |
| **updated_at** | timestamp | YES | now() | Last update time | ✅ Working |
| **player_match_par** | integer | YES | - | Player's personal par | ❌ Never set (new) |
| **strokes_received** | integer | YES | 0 | Handicap strokes allocated | ❌ Duplicate of hole_handicap_strokes |

## Issues Identified

### 1. Redundant Columns
- **strokes_received** duplicates **hole_handicap_strokes** - both meant for same purpose
- **net_score** could be calculated: `strokes - hole_handicap_strokes`
- **score_vs_par** could be calculated: `strokes - hole_par`

### 2. Missing Calculations
- **net_score** and **score_vs_par** are never calculated in `updateHoleScore()`
- **player_match_par** (newly added) is never set

### 3. Conceptual Problems
- **hole_par** stores the course par, not the player's personal par
- **hole_handicap_strokes** stores strokes received, but name is confusing
- Missing clear distinction between:
  - Course data (par, handicap index)
  - Player data (strokes received, personal par)
  - Score data (actual strokes, putts)

## Recommended Schema Redesign

### Option 1: Minimal Changes (Quick Fix)
```sql
-- Remove redundant column
ALTER TABLE game_hole_scores DROP COLUMN strokes_received;

-- Rename for clarity
ALTER TABLE game_hole_scores 
RENAME COLUMN hole_handicap_strokes TO strokes_received;

-- Add trigger to calculate derived fields
CREATE OR REPLACE FUNCTION calculate_hole_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate net score
  NEW.net_score = NEW.strokes - COALESCE(NEW.strokes_received, 0);
  
  -- Calculate score vs par
  NEW.score_vs_par = NEW.strokes - NEW.hole_par;
  
  -- Calculate player match par
  NEW.player_match_par = NEW.hole_par + COALESCE(NEW.strokes_received, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_scores_trigger
BEFORE INSERT OR UPDATE ON game_hole_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_hole_scores();
```

### Option 2: Clean Architecture (Recommended)
```sql
-- New clean structure
CREATE TABLE game_hole_scores_v2 (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  
  -- Course Data (from holes table, stored for history)
  hole_par INTEGER NOT NULL,
  hole_handicap_index INTEGER NOT NULL, -- Hole difficulty (1-18)
  
  -- Player Handicap Data (calculated at game time)
  strokes_received INTEGER NOT NULL DEFAULT 0, -- Handicap strokes on this hole
  player_match_par INTEGER NOT NULL, -- hole_par + strokes_received
  
  -- Actual Score Data (user input)
  strokes INTEGER, -- Actual strokes taken
  putts INTEGER DEFAULT 0, -- Putts taken (optional)
  
  -- Calculated Fields (via trigger or app)
  net_score INTEGER GENERATED ALWAYS AS (strokes - strokes_received) STORED,
  gross_vs_par INTEGER GENERATED ALWAYS AS (strokes - hole_par) STORED,
  net_vs_par INTEGER GENERATED ALWAYS AS (strokes - player_match_par) STORED,
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(game_id, user_id, hole_number),
  CHECK (putts >= 0 AND putts <= strokes)
);
```

## Data Flow for New Architecture

### When Creating Game:
1. Calculate each player's strokes_received per hole based on handicap system
2. Calculate player_match_par (hole_par + strokes_received)
3. Store these when initializing scores

### When Entering Score:
```typescript
// In gameService.ts
async updateHoleScore(gameId, userId, holeNumber, strokes, putts) {
  // Get hole data
  const hole = await getHoleData(courseId, holeNumber);
  
  // Get player's strokes for this hole (already calculated at game start)
  const participant = await getParticipant(gameId, userId);
  const strokesReceived = calculateStrokesOnHole(
    hole.handicap_index, 
    participant.match_handicap
  );
  
  // Save score with all data
  await supabase.from('game_hole_scores').upsert({
    game_id: gameId,
    user_id: userId,
    hole_number: holeNumber,
    // Course data
    hole_par: hole.par,
    hole_handicap_index: hole.handicap_index,
    // Player handicap data
    strokes_received: strokesReceived,
    player_match_par: hole.par + strokesReceived,
    // Actual scores
    strokes: strokes,
    putts: putts || 0
    // net_score, gross_vs_par, net_vs_par calculated automatically
  });
}
```

## Benefits of Clean Architecture

1. **Clear Separation**: Course data vs Player data vs Scores
2. **No Redundancy**: Each piece of data stored once
3. **Automatic Calculations**: Generated columns ensure consistency
4. **Future Proof**: Ready for multiple handicap/scoring systems
5. **Performance**: Indexed, calculated fields for fast queries

## Migration Strategy

### Phase 1: Add Missing Calculations (Immediate)
```sql
-- Add trigger to calculate missing fields
CREATE OR REPLACE FUNCTION calc_hole_scores_temp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.strokes IS NOT NULL THEN
    NEW.net_score = NEW.strokes - COALESCE(NEW.hole_handicap_strokes, 0);
    NEW.score_vs_par = NEW.strokes - NEW.hole_par;
    NEW.player_match_par = NEW.hole_par + COALESCE(NEW.hole_handicap_strokes, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calc_scores_temp
BEFORE INSERT OR UPDATE ON game_hole_scores
FOR EACH ROW
EXECUTE FUNCTION calc_hole_scores_temp();
```

### Phase 2: Update Application Code
- Modify `updateHoleScore()` to set player_match_par
- Remove references to non-calculated net_score/score_vs_par
- Use calculated fields instead

### Phase 3: Clean Schema (Later)
- Create new table with clean structure
- Migrate data
- Update all references
- Drop old table

## Summary

The current `game_hole_scores` table has redundancy and missing calculations. The immediate fix is to add database triggers to calculate the missing fields. The long-term solution is to redesign the table with a cleaner structure that separates course data, player handicap data, and actual scores, using generated columns for all calculated fields.
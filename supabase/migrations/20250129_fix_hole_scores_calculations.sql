-- Migration: Fix game_hole_scores calculations
-- Date: 2025-01-29
-- Purpose: Clean up duplicate columns and add missing calculations

-- NOTE: net_score and score_vs_par are already GENERATED columns (auto-calculated)!
-- They are defined as:
--   net_score = (strokes - hole_handicap_strokes) 
--   score_vs_par = (strokes - hole_par)

-- 1. Drop the duplicate column (strokes_received duplicates hole_handicap_strokes)
ALTER TABLE game_hole_scores DROP COLUMN IF EXISTS strokes_received;

-- 2. Create function to calculate player_match_par (the only missing field)
CREATE OR REPLACE FUNCTION calculate_player_match_par()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate player match par (personal par for this hole)
  NEW.player_match_par = NEW.hole_par + COALESCE(NEW.hole_handicap_strokes, 0);
  
  -- Always update timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to run before insert or update
DROP TRIGGER IF EXISTS calculate_player_match_par_trigger ON game_hole_scores;
CREATE TRIGGER calculate_player_match_par_trigger
BEFORE INSERT OR UPDATE ON game_hole_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_player_match_par();

-- 4. Update existing records to calculate player_match_par
UPDATE game_hole_scores
SET player_match_par = hole_par + COALESCE(hole_handicap_strokes, 0)
WHERE player_match_par IS NULL;

-- 5. Add comments for clarity
COMMENT ON COLUMN game_hole_scores.hole_handicap_strokes IS 'Number of handicap strokes the player receives on this hole based on their match handicap';
COMMENT ON COLUMN game_hole_scores.net_score IS '[GENERATED] Net score for the hole (strokes - handicap strokes received)';
COMMENT ON COLUMN game_hole_scores.score_vs_par IS '[GENERATED] Gross score relative to par (strokes - hole_par)';
COMMENT ON COLUMN game_hole_scores.player_match_par IS 'Player Match Par for this hole (hole_par + handicap strokes received) - represents the player''s personal par';
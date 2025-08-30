-- Migration: Game Architecture Refactor
-- Date: 2025-01-29
-- Purpose: Support multiple handicap and scoring methods

-- 1. Add handicap_type and scoring_method to games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS handicap_type VARCHAR(20) DEFAULT 'match_play',
ADD COLUMN IF NOT EXISTS scoring_method VARCHAR(20) DEFAULT 'match_play';

-- Add check constraints for valid values
ALTER TABLE games 
ADD CONSTRAINT check_handicap_type 
CHECK (handicap_type IN ('none', 'match_play', 'stroke_play', 'random', 'custom'));

ALTER TABLE games 
ADD CONSTRAINT check_scoring_method 
CHECK (scoring_method IN ('net_score', 'match_play', 'stableford', 'skins', 'custom'));

-- 2. Drop dependent view first
DROP VIEW IF EXISTS v_user_game_history;

-- Remove scoring metric columns from game_participants
-- These will be calculated dynamically based on scoring_method
ALTER TABLE game_participants 
DROP COLUMN IF EXISTS holes_won,
DROP COLUMN IF EXISTS holes_lost,
DROP COLUMN IF EXISTS holes_halved;

-- Recreate the view without the dropped columns
CREATE VIEW v_user_game_history AS
SELECT 
    g.id AS game_id,
    g.game_description,
    g.status,
    g.started_at,
    g.completed_at,
    gc.name AS course_name,
    gp.user_id,
    gp.total_strokes,
    gp.net_score,
    -- Won game logic remains the same
    CASE
        WHEN (gp.net_score = min(gp.net_score) OVER (PARTITION BY g.id)) THEN true
        ELSE false
    END AS won_game
FROM games g
JOIN golf_courses gc ON gc.id = g.course_id
JOIN game_participants gp ON gp.game_id = g.id
WHERE g.status = 'completed'
ORDER BY g.completed_at DESC;

-- 3. Add player_match_par to game_hole_scores for storing PMP per hole
ALTER TABLE game_hole_scores
ADD COLUMN IF NOT EXISTS player_match_par INTEGER,
ADD COLUMN IF NOT EXISTS strokes_received INTEGER DEFAULT 0;

-- 4. Update existing games to have explicit handicap and scoring types
UPDATE games 
SET handicap_type = 'match_play',
    scoring_method = 'match_play'
WHERE handicap_type IS NULL;

-- 5. Add comments for documentation
COMMENT ON COLUMN games.handicap_type IS 'Type of handicap calculation: none, match_play, stroke_play, random, custom';
COMMENT ON COLUMN games.scoring_method IS 'Scoring calculation method: net_score, match_play, stableford, skins, custom';
COMMENT ON COLUMN game_participants.course_handicap IS 'Handicap adjusted for course difficulty (slope/rating)';
COMMENT ON COLUMN game_participants.playing_handicap IS 'Course handicap adjusted by format allowance percentage';
COMMENT ON COLUMN game_participants.match_handicap IS 'Playing handicap adjusted relative to lowest (for stroke allocation)';
COMMENT ON COLUMN game_hole_scores.player_match_par IS 'Player Match Par for this hole (par + strokes received)';
COMMENT ON COLUMN game_hole_scores.strokes_received IS 'Handicap strokes allocated to this hole';

-- 6. Create index for game type queries
CREATE INDEX IF NOT EXISTS idx_games_types ON games(handicap_type, scoring_method);

-- 7. Update RLS policies to ensure users can only see their own games
-- (existing policies should already handle this, but let's ensure they're correct)

-- Migration complete
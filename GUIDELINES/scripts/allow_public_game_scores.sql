-- Allow users to view game scores from completed games (for course records)
-- This allows the course record feature to show best scores from all users

-- Update policy for games table to allow viewing completed games
CREATE POLICY "Users can view completed games for course records"
ON games FOR SELECT
USING (
  status = 'completed' AND
  -- Allow if it's a completed game (for course record viewing)
  EXISTS (
    SELECT 1 FROM game_participants
    WHERE game_participants.game_id = games.id
  )
);

-- Update policy for game_participants to allow viewing scores from completed games
CREATE POLICY "Users can view participants from completed games"
ON game_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM games
    WHERE games.id = game_participants.game_id
    AND games.status = 'completed'
  )
);

-- Update policy for game_hole_scores to allow viewing scores from completed games
CREATE POLICY "Users can view hole scores from completed games"
ON game_hole_scores FOR SELECT  
USING (
  EXISTS (
    SELECT 1 FROM games
    WHERE games.id = game_hole_scores.game_id
    AND games.status = 'completed'
  )
);

-- Note: These policies allow read-only access to completed game data
-- Users can still only modify their own active games
-- This enables features like course records and leaderboards
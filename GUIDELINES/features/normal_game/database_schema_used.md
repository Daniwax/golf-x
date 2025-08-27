# Simplified Normal Game Database Schema

## Overview
Realistic schema for casual golfers focusing on data available from scorecards. No complex shot tracking - just scores, handicaps, and basic statistics that casual players actually care about.

## Existing Table Used

### profiles (existing)
User profile information including their current handicap.

```sql
-- Already exists in the database
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    handicap NUMERIC, -- Player's current handicap index
    home_course TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Core Game Tables (4 tables)

### 1. games
Main table for game/match information.

```sql
CREATE TABLE games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Game setup
    course_id INTEGER NOT NULL REFERENCES golf_courses(id),
    creator_user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Game description (fun message visible to all)
    game_description VARCHAR(100), -- "Loser pays dinner! 🍽️"
    
    -- Configuration
    scoring_format VARCHAR(20) DEFAULT 'match_play' CHECK (scoring_format IN ('match_play', 'stroke_play')),
    weather_condition VARCHAR(20) CHECK (weather_condition IN ('sunny', 'partly_cloudy', 'rainy', 'windy')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'completed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Notes (editable by all participants)
    notes TEXT,
    notes_updated_by UUID REFERENCES auth.users(id),
    notes_updated_at TIMESTAMPTZ
);
```

### 2. game_participants
Players in each game with their handicap info and final scores.

```sql
CREATE TABLE game_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Tee selection
    tee_box_id INTEGER NOT NULL REFERENCES tee_boxes(id),
    
    -- Handicap values (frozen at game time)
    handicap_index DECIMAL(3,1) NOT NULL, -- Player's HI when game started
    course_handicap INTEGER NOT NULL, -- Calculated CH
    playing_handicap INTEGER NOT NULL, -- PH (same as CH for singles)
    match_handicap INTEGER NOT NULL DEFAULT 0, -- Strokes given/received
    
    -- Final scores (calculated from hole scores)
    total_strokes INTEGER,
    total_putts INTEGER,
    net_score INTEGER,
    
    -- Nine-hole splits
    front_nine_strokes INTEGER,
    back_nine_strokes INTEGER,
    
    -- Match play results
    holes_won INTEGER DEFAULT 0,
    holes_lost INTEGER DEFAULT 0,
    holes_halved INTEGER DEFAULT 0,
    
    UNIQUE(game_id, user_id)
);
```

### 3. game_hole_scores
Individual hole scores - the core data we collect.

```sql
CREATE TABLE game_hole_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
    
    -- Basic scoring (what players actually input)
    strokes INTEGER CHECK (strokes BETWEEN 0 AND 25),
    putts INTEGER CHECK (putts BETWEEN 0 AND 10), -- optional
    
    -- Par info (for calculations)
    hole_par INTEGER NOT NULL,
    hole_handicap_strokes INTEGER DEFAULT 0, -- Strokes received on this hole
    
    -- Calculated fields
    net_score INTEGER GENERATED ALWAYS AS (strokes - hole_handicap_strokes) STORED,
    score_vs_par INTEGER GENERATED ALWAYS AS (strokes - hole_par) STORED,
    
    -- Tracking
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(game_id, user_id, hole_number)
);
```

### 4. game_invitations (Optional)
Track pending game invitations.

```sql
CREATE TABLE game_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    invited_user_id UUID NOT NULL REFERENCES auth.users(id),
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    
    UNIQUE(game_id, invited_user_id)
);
```

## Statistics Tables (2 tables only)

### 5. game_statistics
Summary statistics for each completed game.

```sql
CREATE TABLE game_statistics (
    game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
    
    -- Basic game stats (calculated from scores)
    total_players INTEGER,
    winner_user_id UUID REFERENCES auth.users(id),
    lowest_gross_score INTEGER,
    lowest_net_score INTEGER,
    average_score DECIMAL(4,1),
    
    -- Scoring distribution for the game
    total_eagles INTEGER DEFAULT 0,
    total_birdies INTEGER DEFAULT 0,
    total_pars INTEGER DEFAULT 0,
    total_bogeys INTEGER DEFAULT 0,
    total_doubles_plus INTEGER DEFAULT 0, -- Double bogey or worse
    
    -- Simple stats
    total_putts INTEGER,
    average_putts_per_hole DECIMAL(3,1),
    
    -- Weather impact (basic)
    weather_adjustment INTEGER, -- Estimated strokes added due to weather
    
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. user_statistics
Career statistics for each user (updated after each game).

```sql
CREATE TABLE user_statistics (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    
    -- Games played
    total_rounds INTEGER DEFAULT 0,
    rounds_this_year INTEGER DEFAULT 0,
    rounds_this_month INTEGER DEFAULT 0,
    
    -- Best scores
    best_gross_score INTEGER,
    best_net_score INTEGER,
    best_9_holes INTEGER,
    
    -- Averages (last 20 rounds)
    average_score DECIMAL(4,1),
    average_putts DECIMAL(3,1),
    
    -- Handicap tracking
    current_handicap DECIMAL(3,1),
    lowest_handicap DECIMAL(3,1),
    handicap_trend VARCHAR(10) CHECK (handicap_trend IN ('improving', 'stable', 'increasing')),
    
    -- Scoring distribution (career totals)
    total_eagles INTEGER DEFAULT 0,
    total_birdies INTEGER DEFAULT 0,
    total_pars INTEGER DEFAULT 0,
    total_bogeys INTEGER DEFAULT 0,
    total_doubles_plus INTEGER DEFAULT 0,
    
    -- Simple achievements
    holes_in_one INTEGER DEFAULT 0,
    longest_birdie_streak INTEGER DEFAULT 0,
    best_score_vs_par INTEGER, -- Best round relative to par
    
    -- Favorite courses (top 3 most played)
    favorite_courses INTEGER[], -- Array of course_ids
    
    -- Match play record
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    matches_halved INTEGER DEFAULT 0,
    
    last_played_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Helper Functions

### Calculate Handicap Allocation
```sql
CREATE OR REPLACE FUNCTION calculate_handicap_strokes(
    p_game_id UUID,
    p_user_id UUID,
    p_match_handicap INTEGER
) RETURNS TABLE (hole_number INTEGER, strokes INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.hole_number,
        CASE 
            WHEN h.handicap_index <= (p_match_handicap % 18) THEN (p_match_handicap / 18) + 1
            ELSE p_match_handicap / 18
        END as strokes
    FROM games g
    JOIN holes h ON h.course_id = g.course_id
    WHERE g.id = p_game_id
    ORDER BY h.hole_number;
END;
$$ LANGUAGE plpgsql;
```

### Update User Statistics
```sql
CREATE OR REPLACE FUNCTION update_user_statistics(p_game_id UUID)
RETURNS VOID AS $$
DECLARE
    v_participant RECORD;
BEGIN
    -- For each participant in the completed game
    FOR v_participant IN 
        SELECT gp.*, g.completed_at
        FROM game_participants gp
        JOIN games g ON g.id = gp.game_id
        WHERE gp.game_id = p_game_id
    LOOP
        -- Update or insert user statistics
        INSERT INTO user_statistics (user_id, total_rounds, last_played_at)
        VALUES (v_participant.user_id, 1, v_participant.completed_at)
        ON CONFLICT (user_id) DO UPDATE SET
            total_rounds = user_statistics.total_rounds + 1,
            rounds_this_year = CASE 
                WHEN EXTRACT(YEAR FROM EXCLUDED.last_played_at) = EXTRACT(YEAR FROM NOW()) 
                THEN user_statistics.rounds_this_year + 1 
                ELSE 1 
            END,
            rounds_this_month = CASE 
                WHEN DATE_TRUNC('month', EXCLUDED.last_played_at) = DATE_TRUNC('month', NOW()) 
                THEN user_statistics.rounds_this_month + 1 
                ELSE 1 
            END,
            best_gross_score = LEAST(user_statistics.best_gross_score, v_participant.total_strokes),
            best_net_score = LEAST(user_statistics.best_net_score, v_participant.net_score),
            last_played_at = v_participant.completed_at,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Indexes for Performance

```sql
-- Games queries
CREATE INDEX idx_games_status ON games(status) WHERE status IN ('setup', 'active');
CREATE INDEX idx_games_creator ON games(creator_user_id);
CREATE INDEX idx_games_dates ON games(started_at DESC);

-- Participants queries
CREATE INDEX idx_participants_game ON game_participants(game_id);
CREATE INDEX idx_participants_user ON game_participants(user_id);

-- Scores queries (critical for 30-sec polling)
CREATE INDEX idx_scores_game_user ON game_hole_scores(game_id, user_id);
CREATE INDEX idx_scores_game ON game_hole_scores(game_id);
CREATE INDEX idx_scores_updated ON game_hole_scores(updated_at);

-- Statistics queries
CREATE INDEX idx_user_stats_handicap ON user_statistics(current_handicap);
CREATE INDEX idx_user_stats_rounds ON user_statistics(total_rounds DESC);
```

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_hole_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Games: View if participant, Update if active participant
CREATE POLICY "View games you're in" ON games
    FOR SELECT USING (
        auth.uid() = creator_user_id OR
        EXISTS (SELECT 1 FROM game_participants WHERE game_id = games.id AND user_id = auth.uid())
    );

CREATE POLICY "Update active games you're in" ON games
    FOR UPDATE USING (
        status IN ('setup', 'active') AND
        EXISTS (SELECT 1 FROM game_participants WHERE game_id = games.id AND user_id = auth.uid())
    );

-- Scores: Participants can update any score in their active game
CREATE POLICY "Update scores in your game" ON game_hole_scores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM game_participants gp
            JOIN games g ON g.id = gp.game_id
            WHERE gp.game_id = game_hole_scores.game_id 
            AND gp.user_id = auth.uid()
            AND g.status = 'active'
        )
    );

-- User statistics: View all, update only your own
CREATE POLICY "View all user statistics" ON user_statistics
    FOR SELECT USING (true);

CREATE POLICY "Update own statistics" ON user_statistics
    FOR UPDATE USING (user_id = auth.uid());
```

## Key Differences from Enhanced Schema

### What We Kept:
- Core game tracking (games, participants, scores)
- Essential handicap calculations
- Basic statistics from scorecard data
- Weather conditions
- Game description and notes

### What We Removed:
- Fairway hits, GIR, bunker shots (not tracked by casual golfers)
- Detailed shot-by-shot analysis
- Complex achievement system
- Course records table
- Weather impact analysis
- Multiple redundant statistics tables
- Hole handicap allocation table (calculated dynamically)

### Why This Works Better:
1. **Realistic**: Only tracks what casual golfers actually record
2. **Simple**: 6 tables instead of 13+
3. **Fast**: Fewer joins, better performance
4. **Maintainable**: Clear purpose for each table
5. **Extensible**: Can add more stats later if needed
6. **Storage Efficient**: ~70% less storage required

## Migration Strategy

1. Extend existing `profiles` table for handicap if needed
2. Use existing `friendships` table for friend selection
3. Create only these 6 new tables
4. Add triggers for automatic statistics updates
5. Test with 30-second polling performance
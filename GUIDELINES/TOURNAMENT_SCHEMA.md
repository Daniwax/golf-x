# Tournament System Database Schema

## Overview
Casual, arcade-style tournament system for friends with flexible ending conditions, virtual tournament value/pot, and configurable scoring types.

## New Tables

### 1. tournaments
Main tournament configuration and state management.

```sql
CREATE TABLE tournaments (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  
  -- Creator & Status
  creator_user_id uuid REFERENCES profiles(id) NOT NULL,
  status character varying(50) DEFAULT 'pending', -- pending, active, completed, cancelled
  is_public boolean DEFAULT false, -- private friends-only or public
  
  -- Tournament Configuration
  tournament_type character varying(50) DEFAULT 'casual', -- casual, stroke_play, match_play, points_race
  scoring_type character varying(50) DEFAULT 'simple_points', -- simple_points, stableford, skins, match_play, stroke_play, best_ball
  scoring_config jsonb DEFAULT '{}', -- Additional scoring parameters if needed
  max_participants integer DEFAULT 20,
  min_participants integer DEFAULT 2,
  
  -- Ending Conditions
  end_condition character varying(50) NOT NULL, -- time_limit, point_limit, custom_vote, rounds_limit
  end_time timestamp with time zone, -- for time_limit
  end_points integer, -- for point_limit (first to reach)
  end_rounds integer, -- for rounds_limit
  votes_needed_to_end integer, -- for custom_vote (e.g., 75% of players)
  
  -- Virtual Tournament Value/Pot
  base_value numeric(10,2) DEFAULT 0, -- starting pot value
  value_per_player numeric(10,2) DEFAULT 10, -- added per participant
  value_per_match numeric(10,2) DEFAULT 5, -- added per match played
  handicap_multiplier numeric(4,2) DEFAULT 1.5, -- bonus for low HC players (36-HC)*multiplier
  current_value numeric(10,2) DEFAULT 0, -- calculated total pot
  
  -- Timing
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  last_activity_at timestamp with time zone DEFAULT now(),
  
  -- Settings
  allow_late_join boolean DEFAULT true,
  require_same_tees boolean DEFAULT false,
  allow_incomplete_rounds boolean DEFAULT true, -- can submit partial rounds
  
  -- Metadata
  cover_image_url text,
  theme_color character varying(7), -- hex color for UI
  emoji character varying(10) -- fun emoji for tournament
);
```

### 2. tournament_participants
Players registered in the tournament.

```sql
CREATE TABLE tournament_participants (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  
  -- Registration
  joined_at timestamp with time zone DEFAULT now(),
  status character varying(50) DEFAULT 'active', -- active, withdrawn, disqualified
  withdrawal_reason text,
  
  -- Handicap at time of joining (snapshot)
  handicap_index numeric,
  
  -- Scoring
  total_points integer DEFAULT 0,
  rounds_played integer DEFAULT 0,
  best_round_score integer,
  average_score numeric(5,2),
  
  -- Rankings
  current_position integer,
  previous_position integer,
  highest_position integer,
  lowest_position integer,
  
  -- Achievements/Fun Stats
  achievements jsonb DEFAULT '[]', -- ["first_blood", "comeback_kid", "consistent_player"]
  fun_stats jsonb DEFAULT '{}', -- {"birdies": 5, "eagles": 1, "albatrosses": 0}
  
  -- Voting (for custom end)
  voted_to_end boolean DEFAULT false,
  voted_at timestamp with time zone,
  
  UNIQUE(tournament_id, user_id)
);
```

### 3. tournament_rounds
Links games to tournaments (a tournament consists of multiple rounds/games).

```sql
CREATE TABLE tournament_rounds (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id),
  round_number integer NOT NULL,
  
  -- Round Configuration
  round_name character varying(255), -- "Week 1", "Opening Round", etc.
  round_type character varying(50) DEFAULT 'regular', -- regular, bonus, playoff
  
  -- Scheduling
  scheduled_date date,
  played_date date,
  
  -- Status
  status character varying(50) DEFAULT 'pending', -- pending, active, completed
  is_mandatory boolean DEFAULT false,
  
  -- Scoring Multipliers
  points_multiplier numeric(3,2) DEFAULT 1.0, -- 2x points for finals
  value_multiplier numeric(3,2) DEFAULT 1.0, -- bonus pot contribution
  
  created_at timestamp with time zone DEFAULT now()
);
```

### 4. tournament_leaderboard
Cached/materialized view for fast leaderboard queries.

```sql
CREATE TABLE tournament_leaderboard (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES tournament_participants(id) ON DELETE CASCADE,
  
  -- Scores
  total_points integer DEFAULT 0,
  rounds_played integer DEFAULT 0,
  rounds_counted integer DEFAULT 0, -- for "best N rounds" scoring
  
  -- Statistics
  total_strokes integer,
  total_par integer,
  net_score integer,
  gross_score integer,
  
  -- Position
  position integer NOT NULL,
  tied_with integer[], -- array of positions tied with
  points_behind_leader integer,
  
  -- Trend
  position_change integer, -- +2 means moved up 2 spots
  points_gained_today integer,
  momentum character varying(20), -- 'hot', 'cold', 'steady'
  
  -- Last Update
  last_round_id uuid REFERENCES tournament_rounds(id),
  last_updated timestamp with time zone DEFAULT now(),
  
  UNIQUE(tournament_id, participant_id)
);
```

### 5. tournament_invitations
Manage tournament invites for private/friends tournaments.

```sql
CREATE TABLE tournament_invitations (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- Invitation Details
  invited_by uuid REFERENCES profiles(id) NOT NULL,
  invited_user_id uuid REFERENCES profiles(id),
  invited_email character varying(255), -- for non-users
  
  -- Status
  status character varying(50) DEFAULT 'pending', -- pending, accepted, declined, expired
  
  -- Timing
  created_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + INTERVAL '7 days'),
  
  -- Invitation Message
  personal_message text,
  
  UNIQUE(tournament_id, invited_user_id),
  UNIQUE(tournament_id, invited_email)
);
```


## Relationships to Existing Tables

### Direct Relationships
```sql
-- tournaments → profiles (creator)
tournaments.creator_user_id → profiles.id

-- tournament_participants → profiles (players)
tournament_participants.user_id → profiles.id

-- tournament_rounds → games (actual golf games)
tournament_rounds.game_id → games.id

-- games remain independent but can be linked to tournaments
-- This allows normal games and tournament games to coexist
```

### Data Flow
```
Tournament Created
    ↓
Players Join (tournament_participants)
    ↓
Round Scheduled (tournament_rounds)
    ↓
Game Played (games + game_participants + game_hole_scores)
    ↓
Round Linked (tournament_rounds.game_id)
    ↓
Points Calculated (based on scoring_type)
    ↓
Leaderboard Updated (tournament_leaderboard)
    ↓
Check End Conditions
    ↓
Tournament Ends → Final Rankings
```

## Tournament Value Calculation

### Formula
```javascript
tournament_value = 
  base_value +
  (num_participants * value_per_player) +
  (total_matches_played * value_per_match) +
  sum(participant_handicap_bonus)

where:
  participant_handicap_bonus = (36 - handicap_index) * handicap_multiplier
  
Example:
  Base: $50
  5 players × $10 = $50
  15 matches × $5 = $75
  HC bonuses: (36-15)*1.5 + (36-8)*1.5 + ... = $94.50
  Total Pot: $269.50
```

## Ending Conditions

### 1. Time Limit
```sql
-- Check daily
IF current_timestamp > tournament.end_time THEN
  END TOURNAMENT
```

### 2. Point Limit
```sql
-- Check after each round
IF ANY participant.total_points >= tournament.end_points THEN
  END TOURNAMENT
```

### 3. Custom Vote
```sql
-- Players can vote to end
votes = COUNT(*) FROM tournament_participants 
        WHERE voted_to_end = true
IF votes >= (total_participants * 0.75) THEN
  END TOURNAMENT
```


## Scoring Types (Built into Code)

### Available Scoring Types
The `scoring_type` field in tournaments table determines how points are calculated. Logic resides in application code.

#### 1. **simple_points** (Default)
- Participation: 10 points
- Completion: 10 points  
- Position-based: 1st=50, 2nd=30, 3rd=20, others=5
- Bonus for personal best or beating handicap

#### 2. **stableford**
- Double Eagle: 8 points
- Eagle: 5 points
- Birdie: 2 points
- Par: 0 points
- Bogey: -1 point
- Double Bogey or worse: -3 points

#### 3. **skins**
- Points for winning holes outright
- Carry-over points if holes are tied
- Big pot holes worth more

#### 4. **match_play**
- 1 point per hole won
- 0.5 points per hole tied
- Bonus points for winning margin

#### 5. **stroke_play**
- Traditional lowest score wins
- Points based on final position
- Net and gross divisions

#### 6. **best_ball**
- Team format using best score per hole
- Individual points contribute to team total

### Scoring Config Examples
The `scoring_config` JSONB field can store additional parameters:

```json
// For skins
{
  "skin_value": 10,
  "carry_over": true,
  "super_skins": [9, 18]  // Double value holes
}

// For stableford
{
  "use_handicap": true,
  "max_score": 10  // Cap per hole
}

// For simple_points
{
  "attendance_bonus": 5,
  "consistency_bonus": 10,
  "improvement_bonus": 15
}

## Indexes for Performance

```sql
-- Fast leaderboard queries
CREATE INDEX idx_tournament_leaderboard_position 
  ON tournament_leaderboard(tournament_id, position);

-- Active tournaments
CREATE INDEX idx_tournaments_active 
  ON tournaments(status) WHERE status = 'active';

-- Participant lookups
CREATE INDEX idx_tournament_participants_user 
  ON tournament_participants(user_id, tournament_id);

```

## RLS Policies

```sql
-- Tournaments visible to participants or if public
CREATE POLICY "Tournaments visible to participants or public"
  ON tournaments FOR SELECT
  USING (
    is_public = true 
    OR creator_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tournament_participants 
      WHERE tournament_id = tournaments.id 
      AND user_id = auth.uid()
    )
  );

-- Only creator can modify tournament
CREATE POLICY "Only creator can modify tournament"
  ON tournaments FOR UPDATE
  USING (creator_user_id = auth.uid());

-- Participants can view other participants
CREATE POLICY "Participants can view other participants"
  ON tournament_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tournament_participants tp
      WHERE tp.tournament_id = tournament_participants.tournament_id
      AND tp.user_id = auth.uid()
    )
  );
```

## Migration Steps

1. Create tables in order (scoring_systems first, tournaments, then dependent tables)
2. Add indexes
3. Enable RLS on all tables
4. Create RLS policies
5. Add triggers for auto-calculations (tournament value, leaderboard updates)
6. Create views for common queries (active tournaments, my tournaments, etc.)

## Future Enhancements

- Team tournaments (2v2, 4v4)
- Bracket/elimination tournaments  
- Seasonal leagues with promotions/relegations
- Tournament templates for quick setup
- Achievements and badges system
- Push notifications for tournament events
- Spectator mode for non-participants
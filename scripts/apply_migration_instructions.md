# How to Apply the Normal Game Migration

## Method 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/kdzbghjsqjnglzsmhxpu

2. Navigate to **SQL Editor** in the left sidebar

3. Create a new query

4. Copy the entire contents of:
   `D:\projects\repositories\golf-x\GUIDELINES\features\normal_game\migration_01_normal_game.sql`

5. Paste it into the SQL editor

6. Click **Run** to execute the migration

7. Check the output for any errors

## Method 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# From project root
cd D:\projects\repositories\golf-x

# Apply the migration
npx supabase db push --db-url "postgresql://postgres:[YOUR-DB-PASSWORD]@db.kdzbghjsqjnglzsmhxpu.supabase.co:5432/postgres" < GUIDELINES/features/normal_game/migration_01_normal_game.sql
```

## Method 3: Using Node.js Script

```bash
# Install required package
npm install @supabase/supabase-js

# Run the verification script
node scripts/verify_migration.js
```

## After Migration

1. Verify tables were created:
   - games
   - game_participants
   - game_hole_scores
   - game_invitations
   - game_statistics
   - user_statistics

2. Check that RLS is enabled on all tables

3. Test creating a game through the app

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Drop all Normal Game tables
DROP TABLE IF EXISTS game_hole_scores CASCADE;
DROP TABLE IF EXISTS game_participants CASCADE;
DROP TABLE IF EXISTS game_invitations CASCADE;
DROP TABLE IF EXISTS game_statistics CASCADE;
DROP TABLE IF EXISTS user_statistics CASCADE;
DROP TABLE IF EXISTS games CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_handicap_strokes CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS calculate_game_statistics CASCADE;
DROP FUNCTION IF EXISTS update_user_statistics_after_game CASCADE;

-- Drop views
DROP VIEW IF EXISTS v_active_games CASCADE;
DROP VIEW IF EXISTS v_user_game_history CASCADE;
```
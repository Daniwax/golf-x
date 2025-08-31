-- Drop all remaining RLS policies to ensure clean state
-- Even though RLS is disabled, old policies can cause confusion

-- Drop all policies on game tables
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Ensure RLS remains disabled on all tables
ALTER TABLE IF EXISTS public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_hole_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions DISABLE ROW LEVEL SECURITY;
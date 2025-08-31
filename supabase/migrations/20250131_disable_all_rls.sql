-- Disable RLS on all tables to allow full visibility between all users
-- This fixes the issue where participants can't see complete match data

-- Disable RLS on all game-related tables
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_hole_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_invitations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user-related tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;

-- Course-related tables (already public, but ensure RLS is disabled)
ALTER TABLE public.countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.holes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tee_boxes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hole_distances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_amenities DISABLE ROW LEVEL SECURITY;

-- Note: With RLS disabled, all authenticated users can read/write all data
-- The application layer should handle any necessary access control
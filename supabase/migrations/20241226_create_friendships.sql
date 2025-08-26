-- Create friendships table for mutual friend connections
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'accepted' CHECK (status IN ('accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_friendship UNIQUE(requester_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (requester_id != friend_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own friendships
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = requester_id);

-- Users can delete their own friendships (will need to handle mutual deletion)
CREATE POLICY "Users can delete own friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = requester_id);

-- Function to create mutual friendship
CREATE OR REPLACE FUNCTION public.create_mutual_friendship(friend_user_id UUID)
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user id
  current_user_id := auth.uid();
  
  -- Check if friend exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = friend_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check for self-friendship
  IF current_user_id = friend_user_id THEN
    RAISE EXCEPTION 'Cannot add yourself as a friend';
  END IF;
  
  -- Check if friendship already exists
  IF EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE requester_id = current_user_id AND friend_id = friend_user_id
  ) THEN
    RAISE EXCEPTION 'Already friends with this user';
  END IF;
  
  -- Create mutual friendship (both directions)
  INSERT INTO public.friendships (requester_id, friend_id, status)
  VALUES 
    (current_user_id, friend_user_id, 'accepted'),
    (friend_user_id, current_user_id, 'accepted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove mutual friendship
CREATE OR REPLACE FUNCTION public.remove_mutual_friendship(friend_user_id UUID)
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user id
  current_user_id := auth.uid();
  
  -- Delete both friendship records
  DELETE FROM public.friendships 
  WHERE (requester_id = current_user_id AND friend_id = friend_user_id)
     OR (requester_id = friend_user_id AND friend_id = current_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles view that includes user metadata
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  id,
  raw_user_meta_data->>'full_name' as full_name,
  email,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  created_at
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Function to get friends with their profiles
CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS TABLE (
  friendship_id UUID,
  friend_id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as friendship_id,
    f.friend_id,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.email,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    f.created_at
  FROM public.friendships f
  JOIN auth.users u ON u.id = f.friend_id
  WHERE f.requester_id = auth.uid()
  AND f.status = 'accepted'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
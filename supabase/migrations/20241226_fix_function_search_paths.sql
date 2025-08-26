-- Fix search_path for all functions to prevent security issues

-- Fix create_mutual_friendship function
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Fix remove_mutual_friendship function
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Fix get_friends function
CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS TABLE (
  friendship_id UUID,
  friend_id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  handicap NUMERIC(3,1),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as friendship_id,
    f.friend_id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.handicap,
    f.created_at
  FROM public.friendships f
  JOIN public.profiles p ON p.id = f.friend_id
  WHERE f.requester_id = auth.uid()
  AND f.status = 'accepted'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;
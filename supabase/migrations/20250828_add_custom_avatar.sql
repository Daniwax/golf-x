-- Add custom_avatar_url field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.custom_avatar_url IS 'User uploaded custom avatar URL from Supabase Storage';

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE 
WITH CHECK (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT 
USING (bucket_id = 'avatars');

-- Update get_friends function to include custom_avatar_url
CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS TABLE (
  friendship_id uuid,
  friend_id uuid,
  full_name text,
  email text,
  avatar_url text,
  custom_avatar_url text,
  handicap numeric,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as friendship_id,
    f.friend_id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.custom_avatar_url,
    p.handicap,
    f.created_at
  FROM public.friendships f
  JOIN public.profiles p ON p.id = f.friend_id
  WHERE f.requester_id = auth.uid()
  AND f.status = 'accepted'
  ORDER BY f.created_at DESC;
END;
$$;
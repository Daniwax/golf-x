import { supabase } from './supabase';

// TypeScript interfaces
export interface Friendship {
  id: string;
  requester_id: string;
  friend_id: string;
  status: 'accepted' | 'blocked';
  created_at: string;
}

export interface FriendProfile {
  friendship_id: string;
  friend_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  custom_avatar_url: string | null;
  handicap: number | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  custom_avatar_url: string | null;
  handicap: number | null;
  home_course: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// Add a friend by their user ID (creates mutual friendship)
export async function addFriend(friendId: string) {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }
  
  try {
    const { error } = await supabase.rpc('create_mutual_friendship', {
      friend_user_id: friendId
    });

    if (error) {
      if (error.message.includes('User not found')) {
        return { error: 'User ID not found. Please check and try again.' };
      }
      if (error.message.includes('Cannot add yourself')) {
        return { error: 'You cannot add yourself as a friend.' };
      }
      if (error.message.includes('Already friends')) {
        return { error: 'You are already friends with this user.' };
      }
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error adding friend:', error);
    return { error: (error as Error).message || 'Failed to add friend' };
  }
}

// Get list of friends with their profiles
export async function getFriends() {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }
  
  try {
    const { data, error } = await supabase.rpc('get_friends');

    if (error) throw error;

    return { data: data as FriendProfile[], error: null };
  } catch (error) {
    console.error('Error fetching friends:', error);
    return { data: null, error: (error as Error).message || 'Failed to fetch friends' };
  }
}

// Get a specific friend's profile
export async function getFriendProfile(friendId: string) {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }
  
  try {
    // First check if they are friends
    const { data: friendship, error: friendshipError } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', friendId)
      .single();

    if (friendshipError || !friendship) {
      return { data: null, error: 'Not friends with this user' };
    }

    // Get friend's profile from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', friendId)
      .single();

    if (error) throw error;

    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Error fetching friend profile:', error);
    return { data: null, error: (error as Error).message || 'Failed to fetch friend profile' };
  }
}

// Remove a friend (removes mutual friendship)
export async function removeFriend(friendId: string) {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }
  
  try {
    const { error } = await supabase.rpc('remove_mutual_friendship', {
      friend_user_id: friendId
    });

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error removing friend:', error);
    return { error: (error as Error).message || 'Failed to remove friend' };
  }
}

// Get current user's ID for sharing
export async function getCurrentUserId() {
  if (!supabase) {
    return null;
  }
  
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}
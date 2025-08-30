import imageCompression from 'browser-image-compression';
import { supabase } from '../../../lib/supabase';

export interface AvatarUploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

export interface AvatarUrls {
  customAvatarUrl: string | null;
  googleAvatarUrl: string | null;
}

class AvatarService {
  private readonly BUCKET_NAME = 'avatars';
  private readonly DEFAULT_OPTIONS: AvatarUploadOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    quality: 0.8
  };

  /**
   * Compress image file before upload
   */
  private async compressImage(
    file: File, 
    options?: AvatarUploadOptions
  ): Promise<File> {
    const compressionOptions = {
      ...this.DEFAULT_OPTIONS,
      ...options,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, compressionOptions);
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Upload avatar to Supabase Storage
   */
  async uploadAvatar(
    userId: string, 
    file: File,
    options?: AvatarUploadOptions
  ): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      // Compress image
      const compressedFile = await this.compressImage(file, options);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      // Update profile with custom avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ custom_avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      return publicUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Delete old avatar files for a user
   */
  async cleanupOldAvatars(userId: string, keepLatest = 1): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      // List all files in user's folder
      const { data: files, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Skip if no files or less than what we want to keep
      if (!files || files.length <= keepLatest) return;

      // Delete old files
      const filesToDelete = files
        .slice(keepLatest)
        .map(file => `${userId}/${file.name}`);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filesToDelete);

        if (deleteError) {
          console.error('Failed to delete old avatars:', deleteError);
        }
      }
    } catch (error) {
      console.error('Avatar cleanup failed:', error);
    }
  }

  /**
   * Get user's avatar URLs (custom and Google)
   */
  async getUserAvatars(userId: string): Promise<AvatarUrls> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('custom_avatar_url, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        customAvatarUrl: data?.custom_avatar_url || null,
        googleAvatarUrl: data?.avatar_url || null
      };
    } catch (error) {
      console.error('Failed to get user avatars:', error);
      return {
        customAvatarUrl: null,
        googleAvatarUrl: null
      };
    }
  }

  /**
   * Remove custom avatar and revert to Google avatar
   */
  async removeCustomAvatar(userId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      // Update profile to remove custom avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ custom_avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      // Clean up all avatar files
      await this.cleanupOldAvatars(userId, 0);
    } catch (error) {
      console.error('Failed to remove custom avatar:', error);
      throw new Error('Failed to remove avatar');
    }
  }

  /**
   * Create avatars bucket if it doesn't exist
   * Note: Bucket is now created via SQL migration, this method is kept for compatibility
   */
  async ensureBucketExists(): Promise<void> {
    // Bucket creation is now handled via SQL migrations
    // This method is kept for backward compatibility but does nothing
    return;
  }
}

export const avatarService = new AvatarService();
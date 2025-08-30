import { supabase } from './supabase';

export interface CourseImage {
  id: number;
  course_id: number;
  image_type: string;
  title: string;
  mime_type: string;
  image_data: ArrayBuffer;
  file_size: number;
  is_primary: boolean;
  display_order: number;
  description?: string;
}

class CourseImageService {
  private imageCache = new Map<string, string>();

  /**
   * Fetch course image from database and convert to data URL
   */
  async getCourseImage(courseId: number, imageType: string = 'default'): Promise<string | null> {
    const cacheKey = `${courseId}-${imageType}`;
    
    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    if (!supabase) {
      console.error('Supabase not configured');
      return null;
    }

    try {
      // Fetch image from database
      const { data, error } = await supabase
        .from('course_images')
        .select('image_data, mime_type')
        .eq('course_id', courseId)
        .eq('image_type', imageType)
        .single();

      if (error) {
        console.error('Failed to fetch course image:', error);
        return null;
      }

      if (!data || !data.image_data) {
        console.warn(`No image found for course ${courseId} type ${imageType}`);
        return null;
      }

      // Convert binary data to base64 data URL
      const imageDataUrl = `data:${data.mime_type};base64,${data.image_data}`;
      
      // Cache the result
      this.imageCache.set(cacheKey, imageDataUrl);
      
      return imageDataUrl;
    } catch (error) {
      console.error('Error fetching course image:', error);
      return null;
    }
  }

  /**
   * Get default course image with fallback
   */
  async getDefaultCourseImage(courseId: number): Promise<string> {
    const imageUrl = await this.getCourseImage(courseId, 'default');
    
    if (imageUrl) {
      return imageUrl;
    }

    // Fallback to a small placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzNhNjUzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxOCI+R29sZiBDb3Vyc2U8L3RleHQ+Cjwvc3ZnPg==';
  }

  /**
   * Preload images for better performance
   */
  async preloadCourseImages(courseIds: number[]): Promise<void> {
    const promises = courseIds.map(courseId => 
      this.getCourseImage(courseId, 'default')
    );
    
    try {
      await Promise.all(promises);
      console.log(`Preloaded ${courseIds.length} course images`);
    } catch (error) {
      console.warn('Failed to preload some course images:', error);
    }
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache size for debugging
   */
  getCacheSize(): number {
    return this.imageCache.size;
  }
}

export const courseImageService = new CourseImageService();
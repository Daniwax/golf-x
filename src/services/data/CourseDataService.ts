/**
 * Course Data Service
 * Handles all course-related data operations with caching
 */

import { CacheService } from '../cache/CacheService';
import { getCacheKey, getTTL } from '../../config/cache.config';
import { supabase } from '../../lib/supabase';

export class CourseDataService {
  private cache: CacheService;
  
  constructor(cache: CacheService) {
    this.cache = cache;
  }

  /**
   * Get all courses with full club information
   * Returns ALL columns for maximum reusability
   */
  async getAllCourses(searchTerm?: string) {
    const key = getCacheKey('courses', 'list', searchTerm || 'all');
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        let query = supabase.from('golf_courses').select(`
          id,
          club_id,
          external_id,
          name,
          course_number,
          course_type,
          par,
          holes,
          total_yardage,
          total_meters,
          designed_year,
          designer,
          course_style,
          latitude,
          longitude,
          altitude_meters,
          status,
          season_start_month,
          season_end_month,
          booking_url,
          scorecard_url,
          layout_map_url,
          created_at,
          updated_at,
          golf_clubs!inner (
            id,
            external_id,
            slug,
            name,
            country_id,
            region_id,
            city,
            address,
            postal_code,
            latitude,
            longitude,
            established_year,
            designer,
            architect,
            club_type,
            has_royal_prefix,
            website,
            phone,
            email,
            booking_url,
            data_source,
            source_updated_at,
            confidence_score,
            is_verified,
            created_at,
            updated_at
          )
        `);
        
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,golf_clubs.city.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query
          .order('name', { ascending: true })
          .order('course_number', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      getTTL('courses')
    );
  }

  /**
   * Get single course with full details including club
   */
  async getCourseById(courseId: number) {
    const key = getCacheKey('courses', 'detail', courseId);
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('golf_courses')
          .select(`
            id,
            club_id,
            external_id,
            name,
            course_number,
            course_type,
            par,
            holes,
            total_yardage,
            total_meters,
            designed_year,
            designer,
            course_style,
            latitude,
            longitude,
            altitude_meters,
            status,
            season_start_month,
            season_end_month,
            booking_url,
            scorecard_url,
            layout_map_url,
            created_at,
            updated_at,
            golf_clubs!inner (
              id,
              external_id,
              slug,
              name,
              country_id,
              region_id,
              city,
              address,
              postal_code,
              latitude,
              longitude,
              established_year,
              designer,
              architect,
              club_type,
              has_royal_prefix,
              website,
              phone,
              email,
              booking_url,
              data_source,
              source_updated_at,
              confidence_score,
              is_verified,
              created_at,
              updated_at
            )
          `)
          .eq('id', courseId)
          .single();
        
        if (error) throw error;
        return data;
      },
      getTTL('courses')
    );
  }

  /**
   * Get all images for a course
   */
  async getCourseImages(courseId: number) {
    const key = getCacheKey('courses', 'images', courseId);
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('course_images')
          .select(`
            id,
            course_id,
            hole_id,
            image_url,
            mime_type,
            file_size,
            image_type,
            title,
            description,
            width,
            height,
            display_order,
            is_primary,
            is_thumbnail,
            created_at
          `)
          .eq('course_id', courseId)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      getTTL('courseImages')
    );
  }

  /**
   * Get tee boxes for a single course
   */
  async getCourseTeeBoxes(courseId: number) {
    const key = getCacheKey('courses', 'tees', courseId);
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('tee_boxes')
          .select(`
            id,
            course_id,
            name,
            color,
            color_hex,
            gender,
            total_yards,
            total_meters,
            course_rating,
            slope_rating,
            bogey_rating,
            front_nine_rating,
            front_nine_slope,
            front_nine_bogey,
            back_nine_rating,
            back_nine_slope,
            back_nine_bogey,
            display_order,
            is_default,
            created_at,
            updated_at
          `)
          .eq('course_id', courseId)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      getTTL('teeBoxes')
    );
  }

  /**
   * Get tee boxes for multiple courses (batch operation)
   */
  async getTeeBoxesForMultipleCourses(courseIds: number[]) {
    const key = getCacheKey('courses', 'tees', 'multiple', courseIds.join(','));
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('tee_boxes')
          .select(`
            id,
            course_id,
            name,
            color,
            color_hex,
            gender,
            total_yards,
            total_meters,
            course_rating,
            slope_rating,
            bogey_rating,
            front_nine_rating,
            front_nine_slope,
            front_nine_bogey,
            back_nine_rating,
            back_nine_slope,
            back_nine_bogey,
            display_order,
            is_default,
            created_at,
            updated_at
          `)
          .in('course_id', courseIds)
          .order('course_id')
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      getTTL('teeBoxes')
    );
  }

  /**
   * Get all holes for a course with distances
   */
  async getCourseHoles(courseId: number) {
    const key = getCacheKey('courses', 'holes', courseId);
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('holes')
          .select(`
            id,
            course_id,
            hole_number,
            hole_name,
            par,
            handicap_index,
            has_water,
            has_bunkers,
            dogleg_direction,
            notes,
            signature_hole,
            created_at,
            updated_at,
            hole_distances (
              id,
              hole_id,
              tee_box_id,
              yards,
              meters,
              yards_to_layup,
              yards_to_carry,
              created_at,
              tee_boxes (
                id,
                name,
                color,
                color_hex
              )
            )
          `)
          .eq('course_id', courseId)
          .order('hole_number');
        
        if (error) throw error;
        return data;
      },
      getTTL('holes')
    );
  }

  /**
   * Get club amenities
   */
  async getClubAmenities(clubId: number) {
    const key = getCacheKey('courses', 'amenities', clubId);
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
          .from('club_amenities')
          .select(`
            id,
            club_id,
            has_driving_range,
            has_putting_green,
            has_chipping_area,
            has_practice_bunker,
            has_pro_shop,
            has_restaurant,
            has_bar,
            has_accommodation,
            has_cart_rental,
            has_club_rental,
            has_caddie_service,
            has_lessons,
            has_locker_room,
            has_conference_facilities,
            has_wedding_facilities,
            notes,
            created_at,
            updated_at
          `)
          .eq('club_id', clubId)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // Ignore not found
        return data;
      },
      getTTL('amenities')
    );
  }

  /**
   * Get player statistics for courses
   */
  async getPlayerCourseStats(userId: string, courseIds?: number[]) {
    const key = getCacheKey('courses', 'playerStats', userId, courseIds?.join(',') || 'all');
    return this.cache.get(
      key,
      async () => {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        let query = supabase
          .from('game_participants')
          .select(`
            id,
            game_id,
            user_id,
            tee_box_id,
            handicap_index,
            course_handicap,
            playing_handicap,
            match_handicap,
            total_strokes,
            total_putts,
            net_score,
            front_nine_strokes,
            back_nine_strokes,
            games!inner(
              id,
              course_id,
              status,
              created_at,
              completed_at
            )
          `)
          .eq('user_id', userId)
          .eq('games.status', 'completed');
        
        if (courseIds && courseIds.length > 0) {
          query = query.in('games.course_id', courseIds);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      getTTL('playerStats')
    );
  }

  /**
   * Invalidate all caches for a course
   */
  invalidateCourse(courseId: string) {
    this.cache.invalidate(`courses:detail:${courseId}`);
    this.cache.invalidate(`courses:images:${courseId}`);
    this.cache.invalidate(`courses:tees:${courseId}`);
    this.cache.invalidate(`courses:holes:${courseId}`);
    this.cache.invalidate('courses:list:*');
  }

  /**
   * Invalidate all course-related caches
   */
  invalidateAll() {
    this.cache.invalidate('courses:*');
  }
}
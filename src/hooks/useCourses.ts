/**
 * Custom hook for course data management
 * Provides comprehensive course data with caching
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/data/DataService';
import { useAuth } from '../lib/useAuth';

export interface UseCourseListResult {
  courses: Array<{ id: number; name: string; city?: string; state?: string; country?: string; par?: number; holes?: number }>;
  teeBoxes: Array<{ id: number; course_id: number; name: string; color?: string; slope?: number; rating?: number }>;
  playerStats: Array<{ course_id: number; rounds_played: number; best_score?: number; average_score?: number }>;
  courseImages: Array<{ id: number; course_id: number; image_url: string; is_primary?: boolean }>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  search: (term: string) => Promise<void>;
}

export interface UseCourseDetailResult {
  course: { id: number; name: string; city?: string; state?: string; country?: string; par?: number; holes?: number } | null;
  teeBoxes: Array<{ id: number; course_id: number; name: string; color?: string; slope?: number; rating?: number }>;
  holes: Array<{ hole_number: number; par: number; handicap_index?: number; yardage?: number }>;
  amenities: Record<string, boolean> | null;
  courseImages: Array<{ id: number; course_id: number; image_url: string; is_primary?: boolean }>;
  playerStats: Array<{ course_id: number; rounds_played: number; best_score?: number; average_score?: number }>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for course list with all related data
 */
export function useCourseList(): UseCourseListResult {
  const { user } = useAuth();
  const [courses, setCourses] = useState<UseCourseListResult['courses']>([]);
  const [teeBoxes, setTeeBoxes] = useState<UseCourseListResult['teeBoxes']>([]);
  const [playerStats, setPlayerStats] = useState<UseCourseListResult['playerStats']>([]);
  const [courseImages, setCourseImages] = useState<UseCourseListResult['courseImages']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadCourses = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get all courses first
      const coursesData = await dataService.courses.getAllCourses(search);
      setCourses(coursesData || []);

      if (!coursesData || coursesData.length === 0) {
        setTeeBoxes([]);
        setPlayerStats([]);
        setCourseImages([]);
        setLoading(false);
        return;
      }

      const courseIds = coursesData.map((c) => c.id);

      // Load related data in parallel
      const [teeData, statsData, imagesData] = await Promise.all([
        // Get tee boxes for all courses
        dataService.courses.getTeeBoxesForMultipleCourses(courseIds),
        
        // Get player stats if authenticated
        user?.id ? dataService.courses.getPlayerCourseStats(user.id, courseIds) : Promise.resolve([]),
        
        // Get images for all courses
        Promise.all(courseIds.map((id: number) => 
          dataService.courses.getCourseImages(id)
            .then(images => images?.filter((img) => (img as { image_type?: string }).image_type === 'default'))
            .catch(() => [])
        )).then(results => results.flat())
      ]);

      setTeeBoxes(teeData || []);
      setPlayerStats(statsData || []);
      setCourseImages(imagesData || []);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const refresh = useCallback(async () => {
    // Invalidate cache and reload
    dataService.courses.invalidateCourse('*');
    await loadCourses(searchTerm);
  }, [searchTerm, loadCourses]);

  const search = useCallback(async (term: string) => {
    setSearchTerm(term);
    await loadCourses(term);
  }, [loadCourses]);

  return {
    courses,
    teeBoxes,
    playerStats,
    courseImages,
    loading,
    error,
    refresh,
    search
  };
}

/**
 * Hook for single course detail with all related data
 */
export function useCourseDetail(courseId: string): UseCourseDetailResult {
  const { user } = useAuth();
  const [course, setCourse] = useState<UseCourseDetailResult['course']>(null);
  const [teeBoxes, setTeeBoxes] = useState<UseCourseDetailResult['teeBoxes']>([]);
  const [holes, setHoles] = useState<UseCourseDetailResult['holes']>([]);
  const [amenities, setAmenities] = useState<UseCourseDetailResult['amenities']>(null);
  const [courseImages, setCourseImages] = useState<UseCourseDetailResult['courseImages']>([]);
  const [playerStats, setPlayerStats] = useState<UseCourseDetailResult['playerStats']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCourseDetail = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    // Convert string ID to number
    const numericCourseId = parseInt(courseId, 10);
    if (isNaN(numericCourseId)) {
      setError(new Error('Invalid course ID'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load course details first - now with numeric ID
      const courseData = await dataService.courses.getCourseById(numericCourseId);
      setCourse(courseData);

      if (!courseData) {
        throw new Error('Course not found');
      }

      // Load all related data in parallel
      const [teeData, holesData, amenitiesData, imagesData, statsData] = await Promise.all([
        // Tee boxes
        dataService.courses.getCourseTeeBoxes(numericCourseId),
        
        // Holes with distances
        dataService.courses.getCourseHoles(numericCourseId),
        
        // Club amenities
        dataService.courses.getClubAmenities(courseData.club_id),
        
        // Course images
        dataService.courses.getCourseImages(numericCourseId),
        
        // Player stats if authenticated
        user?.id ? dataService.courses.getPlayerCourseStats(user.id, [numericCourseId]) : Promise.resolve([])
      ]);

      setTeeBoxes(teeData || []);
      setHoles(holesData || []);
      setAmenities(amenitiesData);
      setCourseImages(imagesData || []);
      setPlayerStats(statsData || []);
    } catch (err) {
      console.error('Error loading course detail:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    loadCourseDetail();
  }, [loadCourseDetail]);

  const refresh = useCallback(async () => {
    // Invalidate cache and reload
    dataService.courses.invalidateCourse(courseId);
    if (user?.id) {
      dataService.cache.invalidate(`courses:playerStats:${user.id}*`);
    }
    await loadCourseDetail();
  }, [courseId, user?.id, loadCourseDetail]);

  return {
    course,
    teeBoxes,
    holes,
    amenities,
    courseImages,
    playerStats,
    loading,
    error,
    refresh
  };
}
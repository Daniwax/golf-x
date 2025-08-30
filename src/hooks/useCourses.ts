/**
 * Custom hook for course data management
 * Provides comprehensive course data with caching
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/data/DataService';
import { useAuth } from '../lib/useAuth';

// Internal types for data mapping
interface StatsData {
  games?: { course_id: number }[];
  game_id?: number;
  total_strokes?: number;
}

interface ImageData {
  id: number;
  course_id: number;
  image_data?: string;
  image_url?: string;
  is_primary?: boolean;
}

interface CourseData {
  id: number;
  name: string;
  par?: number;
  holes?: number;
  status?: string;
  designer?: string;
  designed_year?: number;
  course_style?: string;
  total_meters?: number;
  city?: string;
  state?: string;
  country?: string;
  golf_clubs?: { name: string; city?: string; state?: string; country?: string }[];
}

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
  course: { 
    id: number; 
    name: string; 
    city?: string; 
    state?: string; 
    country?: string; 
    par?: number; 
    holes?: number;
    status?: string;
    designer?: string;
    designed_year?: string;
    course_style?: string;
    total_meters?: number;
    golf_clubs?: {
      name: string;
      city?: string;
      address?: string;
      phone?: string;
      website?: string;
    };
  } | null;
  teeBoxes: Array<{ 
    id: number; 
    course_id: number; 
    name: string; 
    color?: string; 
    slope?: number; 
    rating?: number;
    total_meters?: number;
    total_yards?: number;
    course_rating?: number;
    slope_rating?: number;
    front_nine_rating?: number;
    front_nine_slope?: number;
    back_nine_rating?: number;
    back_nine_slope?: number;
  }>;
  holes: Array<{ 
    id?: number;
    hole_number: number; 
    par: number; 
    handicap_index?: number; 
    yardage?: number;
  }>;
  amenities: Record<string, boolean> | null;
  courseImages: Array<{ id: number; course_id: number; image_url: string; is_primary?: boolean }>;
  playerStats: Array<{ 
    course_id: number; 
    rounds_played: number; 
    best_score?: number; 
    average_score?: number;
    tee_box_id?: number;
  }>;
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
      // Map the stats data to the expected format
      const mappedStats = (statsData || []).map((stat: StatsData) => ({
        course_id: stat.games?.[0]?.course_id || stat.game_id || 0,
        rounds_played: 1,
        best_score: stat.total_strokes,
        average_score: stat.total_strokes
      }));
      setPlayerStats(mappedStats);
      // Map the images data to the expected format - use image_url only
      const mappedImages = (imagesData || []).map((img: ImageData) => ({
        id: img.id,
        course_id: img.course_id,
        image_url: img.image_url || '',
        is_primary: img.is_primary
      }));
      setCourseImages(mappedImages);
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
      if (courseData) {
        // Map to expected interface
        setCourse({
          id: courseData.id,
          name: courseData.name,
          city: (courseData as CourseData).city,
          state: (courseData as CourseData).state,
          country: (courseData as CourseData).country,
          par: courseData.par,
          holes: courseData.holes,
          status: courseData.status,
          designer: courseData.designer,
          designed_year: courseData.designed_year,
          course_style: courseData.course_style,
          total_meters: courseData.total_meters,
          golf_clubs: courseData.golf_clubs?.[0] ? {
            name: courseData.golf_clubs[0].name,
            city: courseData.golf_clubs[0].city,
            address: courseData.golf_clubs[0].address,
            phone: courseData.golf_clubs[0].phone,
            website: courseData.golf_clubs[0].website
          } : undefined
        });
      }

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
      // Map the images data to the expected format - use image_url only
      const mappedImages = (imagesData || []).map((img: ImageData) => ({
        id: img.id,
        course_id: img.course_id,
        image_url: img.image_url || '',
        is_primary: img.is_primary
      }));
      setCourseImages(mappedImages);
      // Map the stats data to the expected format
      const mappedStats = (statsData || []).map((stat: StatsData) => ({
        course_id: stat.games?.[0]?.course_id || stat.game_id || 0,
        rounds_played: 1,
        best_score: stat.total_strokes,
        average_score: stat.total_strokes
      }));
      setPlayerStats(mappedStats);
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
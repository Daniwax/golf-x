import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonSearchbar,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonNote,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface CourseListItem {
  id: number;
  name: string;
  par: number;
  holes: number;
  course_type: string;
  status: string;
  course_number: number;
  golf_clubs: {
    name: string;
    city: string;
  };
}

const CoursesList: React.FC = () => {
  const history = useHistory();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('golf_courses')
        .select(`
          id,
          name,
          par,
          holes,
          course_type,
          status,
          course_number,
          golf_clubs!inner (
            name,
            city
          )
        `)
        .order('name', { ascending: true })
        .order('course_number', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform the data to ensure golf_clubs is a single object
      const transformedData = (data || []).map(course => ({
        ...course,
        golf_clubs: Array.isArray(course.golf_clubs) ? course.golf_clubs[0] : course.golf_clubs
      })) as CourseListItem[];
      
      setCourses(transformedData);
      setFilteredCourses(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = courses.filter(course =>
        course.name.toLowerCase().includes(searchText.toLowerCase()) ||
        course.golf_clubs.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchText, courses]);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchCourses();
    const target = event.target as HTMLIonRefresherElement;
    target.complete();
  };

  const navigateToCourse = (courseId: number) => {
    history.push(`/debug/course/${courseId}`);
  };

  const getCourseTypeColor = (type: string) => {
    switch (type) {
      case '18-hole':
        return 'primary';
      case '9-hole':
        return 'secondary';
      case 'pitch-putt':
        return 'tertiary';
      default:
        return 'medium';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'medium';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/debug" />
          </IonButtons>
          <IonTitle>Golf Courses</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Golf Courses</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Search courses..."
          animated
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <IonSpinner />
          </div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <IonNote color="danger">Error: {error}</IonNote>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <IonNote>No courses found</IonNote>
          </div>
        ) : (
          <IonList style={{ padding: '10px' }}>
            {filteredCourses.map((course) => (
              <IonCard key={course.id} onClick={() => navigateToCourse(course.id)}>
                <IonCardHeader>
                  <IonCardSubtitle>{course.golf_clubs.name}</IonCardSubtitle>
                  <IonCardTitle>{course.name}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <IonChip color={getCourseTypeColor(course.course_type)}>
                      {course.course_type}
                    </IonChip>
                    <IonChip color="warning">
                      Par {course.par}
                    </IonChip>
                    <IonChip>
                      {course.holes} holes
                    </IonChip>
                    <IonChip color={getStatusColor(course.status)}>
                      {course.status}
                    </IonChip>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <IonNote>{course.golf_clubs.city}</IonNote>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}

        <div style={{ padding: '20px', textAlign: 'center' }}>
          <IonNote>
            Total Courses: {courses.length}
            {searchText && ` • Showing: ${filteredCourses.length}`}
          </IonNote>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CoursesList;
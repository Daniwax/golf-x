import React, { useEffect, useState } from 'react';
import { IonSelect, IonSelectOption, IonSpinner, IonNote } from '@ionic/react';
import { gameService } from '../services/gameService';
import type { GolfCourse } from '../types';

interface CourseSelectorProps {
  value: number | null;
  onChange: (courseId: number) => void;
  disabled?: boolean;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gameService.getCourses();
      setCourses(data);
      
      // Auto-select if only one course
      if (data.length === 1 && !value) {
        onChange(data[0].id);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (error) {
    return <IonNote color="danger">{error}</IonNote>;
  }

  if (courses.length === 0) {
    return <IonNote>No courses available</IonNote>;
  }

  return (
    <IonSelect
      value={value}
      placeholder="Select a golf course"
      onIonChange={e => onChange(e.detail.value)}
      disabled={disabled}
      interface="action-sheet"
      interfaceOptions={{
        header: 'Select Golf Course'
      }}
    >
      {courses.map(course => (
        <IonSelectOption key={course.id} value={course.id}>
          {course.name}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
};

export default CourseSelector;
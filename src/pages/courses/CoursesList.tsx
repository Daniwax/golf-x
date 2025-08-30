/**
 * CoursesList v2 - Using DataService
 * Clean separation with data fetching via useCourseList hook
 */

import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonRefresher,
  IonRefresherContent,
  IonSpinner
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useCourseList } from '../../hooks/useCourses';
import { Trophy, Target, ChevronRight, Star, BarChart3, Play } from 'lucide-react';

const CoursesList: React.FC = () => {
  const history = useHistory();
  const [isScrolled, setIsScrolled] = useState(false);

  // Use our DataService hook for all data
  const { 
    courses, 
    teeBoxes, 
    playerStats, 
    courseImages, 
    loading, 
    error, 
    refresh
    // search 
  } = useCourseList();

  // Process course data with stats and tee boxes
  const processedCourses = React.useMemo(() => {
    return courses.map(course => {
      // Get tee boxes for this course (prefer yellow, otherwise first)
      const courseTees = teeBoxes.filter(tee => tee.course_id === course.id);
      const yellowTee = courseTees.find(t => t.color === 'yellow');
      const selectedTee = yellowTee || courseTees[0];
      
      // Get player stats for this course
      const courseStats = playerStats.filter(stat => 
        stat.games?.course_id === course.id
      );
      
      // Calculate aggregated stats
      const completedMatches = courseStats.length;
      const scores = courseStats
        .map(s => s.total_strokes)
        .filter(s => s !== null && s !== undefined);
      
      const bestScore = scores.length > 0 ? Math.min(...scores) : null;
      const averageScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : null;
      
      // Get course image
      const courseImage = courseImages.find(img => 
        img.course_id === course.id && img.image_type === 'default'
      );
      
      return {
        ...course,
        course_rating: selectedTee?.course_rating,
        total_distance: selectedTee?.total_meters,
        completed_matches: completedMatches,
        best_score: bestScore,
        average_score: averageScore,
        image: courseImage
      };
    });
  }, [courses, teeBoxes, playerStats, courseImages]);

  // Use processed courses directly without filtering
  const filteredCourses = processedCourses;

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  const handleRefresh = async (event: CustomEvent) => {
    await refresh();
    event.detail.complete();
  };

  const handleCourseClick = (courseId: number) => {
    history.push(`/course/${courseId}`);
  };

  const formatDistance = (meters: number | undefined) => {
    if (!meters) return 'N/A';
    return `${Math.round(meters)} m`;
  };

  // const getDifficultyBadge = (rating: number | undefined) => {
  //   if (!rating) return null;
  //   
  //   let color = 'emerald';
  //   let label = 'Easy';
  //   
  //   if (rating >= 72) {
  //     color = 'red';
  //     label = 'Hard';
  //   } else if (rating >= 70) {
  //     color = 'yellow';
  //     label = 'Medium';
  //   }
  //   
  //   return (
  //     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800`}>
  //       {label}
  //     </span>
  //   );
  // };

  const processImageData = (imageData: string | undefined, mimeType: string | undefined) => {
    if (!imageData) return '/assets/golf-course-placeholder.jpg';
    
    try {
      if (imageData.startsWith('\\x')) {
        // Hex-encoded bytea from PostgreSQL
        const hexString = imageData.slice(2);
        const hexMatches = hexString.match(/.{1,2}/g);
        if (hexMatches && hexMatches.length < 500000) {
          const bytes = new Uint8Array(hexMatches.map((byte: string) => parseInt(byte, 16)));
          let binaryString = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.slice(i, i + chunkSize);
            binaryString += String.fromCharCode(...chunk);
          }
          const base64String = btoa(binaryString);
          return `data:${mimeType || 'image/jpeg'};base64,${base64String}`;
        }
      } else {
        // Assume it's already base64
        const cleanBase64 = imageData.replace(/[\s\n\r]/g, '');
        return `data:${mimeType || 'image/jpeg'};base64,${cleanBase64}`;
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
    
    return '/assets/golf-course-placeholder.jpg';
  };

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Golf Courses</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="error-container">
            <p style={{ color: '#ef4444', fontSize: '18px', fontWeight: '500' }}>Error loading courses</p>
            <p className="info-label" style={{ marginTop: '8px' }}>{error.message}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="course-detail">
      <IonHeader className="green-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Golf Courses</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="premium-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Course List - Full Height iOS Design */}
        <div className="courses-list-ios">
          {loading ? (
            <div className="loading-container">
              <IonSpinner className="premium-spinner" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="no-stats">
              <Target style={{ margin: '0 auto 16px', color: '#9ca3af' }} size={48} />
              <p>No courses found</p>
              <p className="info-label" style={{ marginTop: '8px' }}>
                {searchText ? 'Try a different search term' : 'No courses available'}
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="course-card-ios">
                {/* PHOTO ON TOP - Full Width Course Image */}
                <div 
                  className="course-image-full"
                  onClick={() => handleCourseClick(course.id)}
                  style={{
                    background: course.image ? 'transparent' : 'linear-gradient(135deg, #1e2d1e 0%, #2d4a2d 100%)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  {course.image && (
                    <img
                      src={processImageData(course.image.image_data, course.image.mime_type)}
                      alt={course.name}
                      className="course-image"
                      style={{
                        filter: 'brightness(0.95) contrast(1.05)'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/golf-course-placeholder.jpg';
                      }}
                    />
                  )}
                  <div className="course-image-overlay" style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(15, 26, 15, 0.4) 60%, rgba(15, 26, 15, 0.9) 85%, rgba(15, 26, 15, 0.98) 100%)'
                  }} />
                  
                  {/* Course Name and Club INSIDE PHOTO - Overlay Text */}
                  <div className="course-info-overlay">
                    <h3 className="course-title-overlay" style={{
                      fontSize: '22px',
                      fontWeight: '400',
                      textShadow: '0 3px 12px rgba(0, 0, 0, 0.9)',
                      letterSpacing: '0.8px'
                    }}>
                      {course.name}
                    </h3>
                    <p className="club-title-overlay" style={{
                      fontSize: '15px',
                      color: 'rgba(255, 215, 0, 0.95)',
                      textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                      fontWeight: '400',
                      letterSpacing: '0.5px'
                    }}>
                      {course.golf_clubs?.name} • {course.golf_clubs?.city}
                    </p>
                  </div>
                </div>

                {/* TWO LINES BELOW PHOTO - Course Info */}
                <div 
                  className="club-card" 
                  onClick={() => handleCourseClick(course.id)}
                  style={{
                    margin: '0',
                    borderRadius: '0',
                    borderTop: 'none',
                    background: 'linear-gradient(135deg, rgb(14 30 14) 0%, rgb(14 79 14) 100%)',
                    border: 'none',
                    boxShadow: 'none',
                    marginBottom: '0',
                    padding: '20px 24px 18px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                  {/* Elegant data display with subtle divider */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}>
                    {/* Course details row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#ffd700',
                          fontSize: '14px',
                          fontWeight: '400',
                          letterSpacing: '0.3px'
                        }}>
                          <Trophy size={13} style={{ color: '#ffd700', opacity: 0.8 }} />
                          <span>Par {course.par}</span>
                        </div>
                        <div style={{
                          color: '#ffd700',
                          fontSize: '14px',
                          fontWeight: '400',
                          letterSpacing: '0.3px',
                          opacity: 0.9
                        }}>
                          {course.holes} holes
                        </div>
                        <div style={{
                          color: '#ffd700',
                          fontSize: '14px',
                          fontWeight: '400',
                          letterSpacing: '0.3px',
                          opacity: 0.9
                        }}>
                          {formatDistance(course.total_distance)}
                        </div>
                      </div>
                    </div>

                    {/* Subtle divider line */}
                    <div style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent)',
                      margin: '2px 0'
                    }} />

                    {/* Player stats row */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      {course.completed_matches > 0 ? (
                        <div style={{
                          display: 'flex',
                          gap: '20px',
                          alignItems: 'center'
                        }}>
                          {course.best_score && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              fontSize: '13px',
                              color: '#4ade80',
                              fontWeight: '400',
                              letterSpacing: '0.2px'
                            }}>
                              <Star size={11} style={{ color: '#4ade80', opacity: 0.8 }} />
                              <span>Best: {course.best_score}</span>
                            </div>
                          )}
                          {course.average_score && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              fontSize: '13px',
                              color: '#4ade80',
                              fontWeight: '400',
                              letterSpacing: '0.2px'
                            }}>
                              <BarChart3 size={11} style={{ color: '#4ade80', opacity: 0.8 }} />
                              <span>Avg: {course.average_score.toFixed(0)}</span>
                            </div>
                          )}
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            color: '#4ade80',
                            fontWeight: '400',
                            letterSpacing: '0.2px'
                          }}>
                            <Play size={11} style={{ color: '#4ade80', opacity: 0.8 }} />
                            <span>{course.completed_matches} rounds</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.4)',
                          letterSpacing: '0.6px',
                          fontWeight: '400',
                          fontStyle: 'italic'
                        }}>
                          Not played yet
                        </div>
                      )}
                      <ChevronRight size={18} style={{ color: '#ffd700', opacity: 0.5 }} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </IonContent>
    </IonPage>
  );
};

export default CoursesList;
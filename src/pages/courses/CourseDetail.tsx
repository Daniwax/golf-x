/**
 * CourseDetail - Using DataService
 * Clean separation with data fetching via useCourseDetail hook
 */

import React, { useEffect, useState } from 'react';
import '../../styles/extracted-styles.css';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonButton,
  IonIcon,
  IonModal,
  IonLabel,
  IonItem,
  IonList
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useCourseDetail } from '../../hooks/useCourses';
import { holeStatsService, type HoleStatistic } from '../../features/normal-game/services/holeStatsService';
import { useAuth } from '../../lib/useAuth';
import { dataService } from '../../services/data/DataService';
import { 
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  MapPin, 
  Flag, 
  Trophy, 
  Star, 
  Phone,
  Globe,
  Info,
  Target,
  BarChart3,
  Home,
  TrendingUp
} from 'lucide-react';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Use our DataService hook for all data - MUST be called before any early returns
  const {
    course,
    teeBoxes,
    holes,
    amenities,
    courseImages,
    playerStats,
    loading,
    error
  } = useCourseDetail(id);

  const [selectedSegment, setSelectedSegment] = useState('overview');
  const [selectedTee, setSelectedTee] = useState<number | null>(null);
  const [selectedStatsTee, setSelectedStatsTee] = useState<number | null>(null); // null means "All"
  const [holeStats, setHoleStats] = useState<HoleStatistic[]>([]);
  const [friendsAverages, setFriendsAverages] = useState<Record<number, { average: number; count: number }>>({});
  const [userHandicap, setUserHandicap] = useState<number>(0);
  const [showFriendsInfoModal, setShowFriendsInfoModal] = useState(false);

  // Calculate handicap range based on user's handicap
  const getHandicapRange = (handicap: number): number => {
    if (handicap < 5) return 2;
    if (handicap >= 5 && handicap < 10) return 3;
    if (handicap >= 10 && handicap < 18) return 4;
    if (handicap >= 18 && handicap < 28) return 5;
    return 6;
  };

  const handicapRange = getHandicapRange(userHandicap);

  // Process course image
  const courseImage = React.useMemo(() => {
    const defaultImage = courseImages.find(img => img.image_type === 'default');
    if (!defaultImage?.image_data) return '';
    
    try {
      let base64Image = '';
      
      if (defaultImage.image_data.startsWith('\\x')) {
        // Hex-encoded bytea from PostgreSQL
        const hexString = defaultImage.image_data.slice(2);
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
          base64Image = `data:${defaultImage.mime_type || 'image/jpeg'};base64,${base64String}`;
        }
      } else {
        // Assume it's already base64
        const cleanBase64 = defaultImage.image_data.replace(/[\s\n\r]/g, '');
        base64Image = `data:${defaultImage.mime_type || 'image/jpeg'};base64,${cleanBase64}`;
      }
      
      return base64Image;
    } catch (error) {
      console.error('Error processing course image:', error);
      return '';
    }
  }, [courseImages]);

  // Process player statistics
  const processedStats = React.useMemo(() => {
    if (!playerStats || playerStats.length === 0) return null;
    
    // Filter by selected tee if applicable
    let filteredStats = playerStats;
    if (selectedStatsTee !== null) {
      filteredStats = playerStats.filter(stat => stat.tee_box_id === selectedStatsTee);
    }
    
    if (filteredStats.length === 0) return null;
    
    // Calculate aggregate statistics
    const totalRounds = filteredStats.length;
    const scores = filteredStats
      .map(s => s.total_strokes)
      .filter(s => s !== null && s !== undefined);
    
    const bestScore = scores.length > 0 ? Math.min(...scores) : null;
    const worstScore = scores.length > 0 ? Math.max(...scores) : null;
    const averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : null;
    
    const putts = filteredStats
      .map(s => s.total_putts)
      .filter(s => s !== null && s !== undefined);
    
    const averagePutts = putts.length > 0
      ? putts.reduce((a, b) => a + b, 0) / putts.length
      : null;
    
    // Get recent rounds for chart
    const recentRounds = filteredStats
      .sort((a, b) => new Date(b.games.created_at).getTime() - new Date(a.games.created_at).getTime())
      .slice(0, 10)
      .reverse()
      .map((round, index) => ({
        round: `R${index + 1}`,
        strokes: round.total_strokes,
        putts: round.total_putts,
        date: new Date(round.games.created_at).toLocaleDateString()
      }));
    
    return {
      totalRounds,
      bestScore,
      worstScore,
      averageScore,
      averagePutts,
      recentRounds
    };
  }, [playerStats, selectedStatsTee]);

  // Prepare data for the hole-by-hole chart - moved outside render function to avoid hook order issues
  const holeChartData = React.useMemo(() => {
    if (!holes || !teeBoxes || teeBoxes.length === 0) return [];
    
    const selectedTeeData = teeBoxes.find(t => t.id === selectedTee) || teeBoxes[0];
    if (!selectedTeeData) return [];
    
    return holes.map(hole => {
      const distance = hole.hole_distances?.find((d: any) => d.tee_box_id === selectedTee);
      return {
        hole: hole.hole_number,
        par: hole.par,
        distance: distance?.meters || distance?.yards * 0.9144 || 0, // Convert yards to meters if needed
        handicap: 19 - hole.handicap_index, // Inverted handicap (1=18, 18=1)
        handicapIndex: hole.handicap_index
      };
    }).sort((a, b) => a.hole - b.hole);
  }, [holes, selectedTee, teeBoxes]);

  // Set default selected tee when teeBoxes load (prefer Yellow tee)
  useEffect(() => {
    if (teeBoxes && teeBoxes.length > 0 && selectedTee === null) {
      // Try to find Yellow tee first
      const yellowTee = teeBoxes.find(tee => 
        tee.color?.toLowerCase() === 'yellow' || 
        tee.name?.toLowerCase() === 'yellow'
      );
      
      if (yellowTee) {
        setSelectedTee(yellowTee.id);
      } else {
        // Fallback to first tee if no Yellow tee found
        setSelectedTee(teeBoxes[0].id);
      }
    }
  }, [teeBoxes, selectedTee]);

  // Load hole statistics and user profile when user is available
  useEffect(() => {
    const loadHoleStats = async () => {
      if (user?.id) {
        const stats = await holeStatsService.getHoleStatistics(user.id);
        setHoleStats(stats);
        
        // Get user's handicap
        const profile = await dataService.profiles.getUserProfile(user.id);
        if (profile?.handicap) {
          setUserHandicap(profile.handicap);
        }
      }
    };
    loadHoleStats();
  }, [user?.id]);

  // Load friends' averages when tee and course are selected
  useEffect(() => {
    const loadFriendsAverages = async () => {
      if (user?.id && course?.id && selectedTee && userHandicap !== null) {
        console.log('📊 Loading friends averages with:', {
          userId: user.id,
          courseId: course.id,
          teeBoxId: selectedTee,
          userHandicap
        });
        
        try {
          const averages = await dataService.stats.getFriendsAverageForHoles(
            user.id,
            course.id,
            selectedTee,
            userHandicap
          );
          console.log('📊 Friends averages received:', averages);
          setFriendsAverages(averages);
        } catch (error) {
          console.error('❌ Error loading friends averages:', error);
          setFriendsAverages({});
        }
      } else {
        console.log('⏭️ Skipping friends averages load - missing data:', {
          hasUser: !!user?.id,
          hasCourse: !!course?.id,
          hasSelectedTee: !!selectedTee,
          hasUserHandicap: userHandicap !== null
        });
      }
    };
    loadFriendsAverages();
  }, [user?.id, course?.id, selectedTee, userHandicap]);

  const getAmenityList = () => {
    if (!amenities) return [];
    
    const amenityMap = [
      { key: 'has_driving_range', label: 'Driving Range', icon: '🏌️' },
      { key: 'has_putting_green', label: 'Putting Green', icon: '⛳' },
      { key: 'has_chipping_area', label: 'Chipping Area', icon: '🏌️' },
      { key: 'has_practice_bunker', label: 'Practice Bunker', icon: '🏖️' },
      { key: 'has_pro_shop', label: 'Pro Shop', icon: '🛍️' },
      { key: 'has_restaurant', label: 'Restaurant', icon: '🍽️' },
      { key: 'has_bar', label: 'Bar', icon: '🍺' },
      { key: 'has_cart_rental', label: 'Cart Rental', icon: '🛺' },
      { key: 'has_club_rental', label: 'Club Rental', icon: '🏌️' },
      { key: 'has_caddie_service', label: 'Caddie Service', icon: '👤' },
      { key: 'has_lessons', label: 'Golf Lessons', icon: '📚' },
      { key: 'has_locker_room', label: 'Locker Room', icon: '🚿' }
    ];
    
    return amenityMap.filter(item => amenities[item.key]);
  };

  // const getTeeColor = (color: string) => {
  //   const colorMap: { [key: string]: string } = {
  //     'black': '#000000',
  //     'blue': '#3B82F6',
  //     'white': '#FFFFFF',
  //     'yellow': '#FDE047',
  //     'red': '#EF4444',
  //     'green': '#10B981',
  //     'gold': '#F59E0B'
  //   };
  //   return colorMap[color.toLowerCase()] || '#9CA3AF';
  // };

  // const getSelectedTeeData = () => {
  //   if (!selectedTee || !teeBoxes) return null;
  //   return teeBoxes.find(tee => tee.id === selectedTee);
  // };

  // Helper function for getting hole distances - kept for future use

  // Render loading state
  if (loading) {
    return (
      <IonPage className="course-detail">
        <IonHeader className="green-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/courses" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="premium-content">
          <div className="loading-container">
            <IonSpinner className="premium-spinner" />
            <p style={{marginTop: '20px', fontSize: '16px', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase'}}>
              Loading Course
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Render error state
  if (error || !course) {
    return (
      <IonPage className="course-detail">
        <IonHeader className="green-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/courses" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="premium-content">
          <div className="error-container">
            <Trophy size={48} style={{color: '#ffd700', marginBottom: '20px'}} />
            <p style={{fontSize: '18px', marginBottom: '10px'}}>Error loading course details</p>
            <p style={{fontSize: '14px', opacity: 0.7}}>{error?.message || 'Course not found'}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const renderOverview = () => (
    <div className="content-container" style={{ paddingBottom: '60px' }}>
      {/* Course Info */}
      <div className="info-section">
        <h2 className="section-title">
          <Info size={20} />
          Course Information
        </h2>
        
        <div className="info-grid" style={{
          background: 'rgba(14, 30, 14, 0.3)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {course.designer && (
            <div className="info-item">
              <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Designer</span>
              <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>{course.designer}</span>
            </div>
          )}
          
          {course.designed_year && (
            <div className="info-item">
              <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Established</span>
              <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>{course.designed_year}</span>
            </div>
          )}
          
          {course.course_style && (
            <div className="info-item">
              <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Style</span>
              <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>{course.course_style}</span>
            </div>
          )}
          
          {course.status && (
            <div className="info-item">
              <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Status</span>
              <span className={`info-value ${course.status === 'open' ? 'status-active' : ''}`} style={{ fontWeight: '400', fontSize: '15px' }}>
                {course.status?.charAt(0).toUpperCase() + course.status?.slice(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Club Info */}
      {course.golf_clubs && (
        <div className="club-section">
          <div className="club-card" style={{
            background: 'rgba(14, 40, 14, 0.4)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px'
          }}>
            <div className="royal-badge" style={{
              background: 'rgba(255, 215, 0, 0.15)',
              color: '#ffd700',
              fontWeight: '400',
              fontSize: '11px',
              letterSpacing: '1px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              display: 'inline-block',
              marginBottom: '12px'
            }}>CLUB</div>
            <h3 style={{ fontWeight: '400', fontSize: '19px', letterSpacing: '0.5px' }}>{course.golf_clubs.name}</h3>
            
            {course.golf_clubs.address && (
              <div className="club-address" style={{ fontWeight: '400', opacity: 0.8 }}>
                <MapPin size={14} style={{display: 'inline', marginRight: '6px', opacity: 0.7 }} />
                {course.golf_clubs.address}
              </div>
            )}
            
            {course.golf_clubs.city && (
              <div className="club-city" style={{ fontWeight: '400', opacity: 0.7 }}>{course.golf_clubs.city}</div>
            )}
            
            <div className="club-actions">
              {course.golf_clubs.phone && (
                <a href={`tel:${course.golf_clubs.phone}`} className="action-button" style={{
                  background: 'rgba(14, 50, 14, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: '400',
                  fontSize: '14px',
                  borderRadius: '12px',
                  padding: '10px 20px'
                }}>
                  <Phone size={14} style={{ opacity: 0.9 }} />
                  Call
                </a>
              )}
              
              {course.golf_clubs.website && (
                <a 
                  href={course.golf_clubs.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-button"
                  style={{
                    background: 'rgba(14, 50, 14, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: '400',
                    fontSize: '14px',
                    borderRadius: '12px',
                    padding: '10px 20px'
                  }}
                >
                  <Globe size={14} style={{ opacity: 0.9 }} />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities && getAmenityList().length > 0 && (
        <div className="info-section">
          <h2 className="section-title">
            <Star size={20} />
            Amenities
          </h2>
          <div className="amenities-grid" style={{ gap: '12px' }}>
            {getAmenityList().map((amenity, index) => (
              <div key={index} className="amenity-card" style={{
                background: 'rgba(14, 35, 14, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '12px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="amenity-label" style={{
                  fontWeight: '400',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  letterSpacing: '0.2px'
                }}>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTeeBoxes = () => {
    // Ensure we have teeBoxes data
    if (!teeBoxes || teeBoxes.length === 0) {
      return (
        <div className="content-container" style={{ paddingBottom: '60px' }}>
          <div className="no-stats">
            <Target size={48} style={{color: 'rgba(255, 255, 255, 0.3)', marginBottom: '20px'}} />
            <p style={{fontSize: '18px', marginBottom: '10px'}}>No tee box data available</p>
            <p style={{fontSize: '14px', opacity: 0.7}}>
              Tee box information is not available for this course
            </p>
          </div>
        </div>
      );
    }

    const selectedTeeData = teeBoxes.find(t => t.id === selectedTee) || teeBoxes[0];
    
    return (
      <>
        {/* Tee Selector - Full Width */}
        <div style={{ 
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          padding: '12px 0',
          background: 'transparent'
        }}>
          <IonSegment 
            value={selectedTee?.toString()} 
            onIonChange={e => setSelectedTee(parseInt(e.detail.value as string))}
            className="premium-segment"
            style={{
              '--background': 'transparent',
              padding: '0 16px'
            }}
          >
            {teeBoxes.map((tee) => (
              <IonSegmentButton key={tee.id} value={tee.id.toString()}>
                <div style={{ 
                  fontSize: '12px',
                  fontWeight: '500',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {tee.name || tee.color}
                </div>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>

        {/* Hole by Hole Chart - Full Width */}
        {selectedTeeData && holeChartData.length > 0 && (
          <div 
            className="chart-section" 
            style={{
              margin: 0, 
              padding: '20px 0', 
              border: 'none !important',
              outline: 'none !important',
              boxShadow: 'none !important',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              WebkitAppearance: 'none',
              touchAction: 'manipulation'
            }}
            onTouchStart={(e) => e.preventDefault()}
            onFocus={(e) => e.target.blur()}
          >
            <h3 className="chart-title" style={{textAlign: 'center', marginBottom: '20px'}}>Hole Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={holeChartData} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="hole" 
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fontSize: 12 }}
                      domain={[0, 5]}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(26, 37, 47, 0.95)', 
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Handicap') return [`HCP: ${21 - Number(value)}`, 'Handicap'];
                        if (name === 'Distance (m)') return [`${value}m`, 'Distance'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    
                    {/* Handicap bars (inverted, in background) */}
                    <Bar 
                      yAxisId="left"
                      dataKey="handicap" 
                      fill="rgba(255, 215, 0, 0.15)" 
                      name="Handicap"
                      radius={[2, 2, 0, 0]}
                    />
                    
                    {/* Par line */}
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="par" 
                      stroke="#4ade80" 
                      strokeWidth={3}
                      name="Par"
                      dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                    />
                    
                    {/* Distance line */}
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="distance" 
                      stroke="#ffd700" 
                      strokeWidth={3}
                      name="Distance (m)"
                      dot={{ fill: '#ffd700', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tee Statistics */}
      {selectedTeeData && (
        <div className="content-container" style={{ paddingBottom: '60px' }}>
          <div className="info-section">
              <h2 className="section-title">
                <Info size={20} />
                Tee Statistics
              </h2>
              <div className="info-grid" style={{
                background: 'rgba(14, 30, 14, 0.3)',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div className="info-item">
                  <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Total Distance</span>
                  <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>
                    {selectedTeeData.total_meters || selectedTeeData.total_yards}
                    {selectedTeeData.total_meters ? 'm' : 'yds'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Course Par</span>
                  <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>{course.par}</span>
                </div>
                <div className="info-item">
                  <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Course Rating</span>
                  <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>{selectedTeeData.course_rating || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Slope Rating</span>
                  <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>{selectedTeeData.slope_rating || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Front 9 Rating</span>
                  <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>
                    {selectedTeeData.front_nine_rating && selectedTeeData.front_nine_slope 
                      ? `${selectedTeeData.front_nine_rating} / ${selectedTeeData.front_nine_slope}` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label" style={{ fontWeight: '400', fontSize: '11px', opacity: 0.6 }}>Back 9 Rating</span>
                  <span className="info-value" style={{ fontWeight: '400', fontSize: '15px' }}>
                    {selectedTeeData.back_nine_rating && selectedTeeData.back_nine_slope 
                      ? `${selectedTeeData.back_nine_rating} / ${selectedTeeData.back_nine_slope}` 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Holes List */}
            {holes && holes.length > 0 && (
              <div className="info-section" style={{ 
                margin: '0', 
                padding: '0',
                width: '100vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw'
              }}>
                <h2 className="section-title" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px 20px',
                  margin: '0'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={20} />
                    Hole by Hole
                  </span>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => setShowFriendsInfoModal(true)}
                    style={{
                      '--padding-start': '8px',
                      '--padding-end': '8px',
                      height: '28px'
                    }}
                  >
                    <IonIcon 
                      icon={informationCircleOutline} 
                      slot="icon-only" 
                      style={{ 
                        fontSize: '20px',
                        color: 'var(--ion-color-primary)'
                      }}
                    />
                  </IonButton>
                </h2>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(96, 165, 250, 0.1)',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  borderRadius: '8px',
                  margin: '12px 20px 12px 20px',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <span style={{ color: '#60a5fa', fontWeight: '500' }}>Fr±{handicapRange} Column:</span> Shows average scores from friends with handicap {userHandicap - handicapRange} to {userHandicap + handicapRange}. 
                  {Object.keys(friendsAverages).length === 0 
                    ? ' Data will appear as friends play this course/tee combination.'
                    : ' The small number indicates how many rounds contributed to each hole\'s average.'}
                </div>
                <div className="holes-list" style={{
                  background: 'transparent',
                  borderRadius: '0',
                  overflow: 'visible',
                  margin: '0',
                  padding: '0'
                }}>
                  {holes.map(hole => {
                    const distance = hole.hole_distances?.find((d: any) => d.tee_box_id === selectedTee);
                    const holeStat = holeStats.find(stat => stat.holeNumber === hole.hole_number);
                    
                    // Calculate colors for Best, Avg, and Friends Avg columns
                    const avgScore = holeStat?.averageScore || null;
                    const bestScore = holeStat?.bestScore || null;
                    const friendsData = friendsAverages[hole.hole_number];
                    const friendsAvg = friendsData?.average || null;
                    
                    // Find best and worst among Avg and Friends Avg
                    const scoresForComparison = [avgScore, friendsAvg].filter(s => s !== null);
                    const minScore = scoresForComparison.length > 0 ? Math.min(...scoresForComparison) : null;
                    const maxScore = scoresForComparison.length > 0 ? Math.max(...scoresForComparison) : null;
                    
                    // Determine colors for Avg column
                    let avgColor = 'rgba(255, 255, 255, 0.5)'; // default gray for no data
                    if (avgScore !== null && minScore !== null && maxScore !== null) {
                      if (scoresForComparison.length > 1 && minScore !== maxScore) {
                        avgColor = avgScore === minScore ? '#4ade80' : 'rgba(156, 163, 175, 0.9)'; // green if best, gray if worst
                      } else {
                        avgColor = 'rgba(255, 255, 255, 0.9)'; // neutral if only one score or all same
                      }
                    }
                    
                    // Determine colors for Friends Avg column
                    let friendsColor = 'rgba(255, 255, 255, 0.5)'; // default gray for no data
                    if (friendsAvg !== null && minScore !== null && maxScore !== null) {
                      if (scoresForComparison.length > 1 && minScore !== maxScore) {
                        friendsColor = friendsAvg === minScore ? '#4ade80' : 'rgba(156, 163, 175, 0.9)'; // green if best, gray if worst
                      } else {
                        friendsColor = '#60a5fa'; // blue if only one score or all same
                      }
                    }
                    
                    // Determine color for Best column (green only if 0.8 less than average)
                    let bestColor = 'rgba(255, 255, 255, 0.5)'; // default gray for no data
                    if (bestScore !== null) {
                      if (avgScore !== null && bestScore <= (avgScore - 0.8)) {
                        bestColor = '#4ade80'; // green if significantly better than average
                      } else {
                        bestColor = 'rgba(255, 255, 255, 0.9)'; // neutral white otherwise
                      }
                    }
                    
                    return (
                      <div key={hole.id} className="hole-row" style={{
                        background: 'rgba(14, 35, 14, 0.3)',
                        border: 'none',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '0',
                        padding: '14px 16px',
                        margin: '0',
                        width: '100%'
                      }}>
                        <div className="hole-number-cell" style={{ minWidth: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: `
                              radial-gradient(circle at 40% 40%, #ffffff, #f8f8f8 50%, #f0f0f0),
                              radial-gradient(circle at 20% 20%, transparent 3px, #f8f8f8 3px, #f8f8f8 4px, transparent 4px),
                              radial-gradient(circle at 60% 20%, transparent 3px, #f8f8f8 3px, #f8f8f8 4px, transparent 4px),
                              radial-gradient(circle at 40% 50%, transparent 3px, #f8f8f8 3px, #f8f8f8 4px, transparent 4px),
                              radial-gradient(circle at 80% 40%, transparent 3px, #f8f8f8 3px, #f8f8f8 4px, transparent 4px),
                              radial-gradient(circle at 20% 60%, transparent 3px, #f8f8f8 3px, #f8f8f8 4px, transparent 4px),
                              radial-gradient(circle at 60% 70%, transparent 3px, #f8f8f8 3px, #f8f8f8 4px, transparent 4px),
                              radial-gradient(circle at 30% 80%, transparent 3px, #f8f8f8 3px, #f8f8f8 4px, transparent 4px)
                            `.replace(/\s+/g, ' '),
                            backgroundSize: '100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px, 8px 8px, 8px 8px, 8px 8px',
                            backgroundPosition: 'center, 8px 8px, 24px 8px, 16px 16px, 28px 16px, 8px 24px, 24px 24px, 12px 28px',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -2px 2px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <span style={{ 
                              fontWeight: '700', 
                              color: '#0a2a0a',
                              fontSize: '14px',
                              textShadow: '0 1px 1px rgba(255, 255, 255, 0.9)',
                              zIndex: 2,
                              position: 'relative'
                            }}>{hole.hole_number}</span>
                            {/* Dimple pattern overlay */}
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '50%',
                              background: `radial-gradient(circle at 40% 40%, transparent 1px, rgba(0, 0, 0, 0.08) 1px, rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px),
                                         radial-gradient(circle at 60% 40%, transparent 1px, rgba(0, 0, 0, 0.08) 1px, rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px),
                                         radial-gradient(circle at 50% 50%, transparent 1px, rgba(0, 0, 0, 0.08) 1px, rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px),
                                         radial-gradient(circle at 40% 60%, transparent 1px, rgba(0, 0, 0, 0.08) 1px, rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px),
                                         radial-gradient(circle at 60% 60%, transparent 1px, rgba(0, 0, 0, 0.08) 1px, rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px)`,
                              backgroundSize: '4px 4px, 4px 4px, 4px 4px, 4px 4px, 4px 4px',
                              backgroundPosition: '0 0, 2px 0, 1px 2px, 0 2px, 2px 2px',
                              opacity: 0.7,
                              pointerEvents: 'none'
                            }} />
                          </div>
                        </div>
                        <div className="hole-stat">
                          <span className="hole-stat-label" style={{ fontWeight: '400', opacity: 0.6, fontSize: '11px' }}>Par</span>
                          <span className="hole-stat-value" style={{ fontWeight: '400', color: 'rgba(255, 255, 255, 0.9)' }}>{hole.par}</span>
                        </div>
                        <div className="hole-stat">
                          <span className="hole-stat-label" style={{ fontWeight: '400', opacity: 0.6, fontSize: '11px' }}>HCP</span>
                          <span className="hole-stat-value" style={{ fontWeight: '400', color: 'rgba(255, 255, 255, 0.9)' }}>{hole.handicap_index}</span>
                        </div>
                        <div className="hole-stat">
                          <span className="hole-stat-label" style={{ fontWeight: '400', opacity: 0.6, fontSize: '11px' }}>Distance</span>
                          <span className="hole-stat-value" style={{ fontWeight: '400', color: 'rgba(255, 255, 255, 0.9)' }}>
                            {distance?.meters ? `${distance.meters}m` : 
                             distance?.yards ? `${distance.yards}yds` : '-'}
                          </span>
                        </div>
                        <div className="hole-stat">
                          <span className="hole-stat-label" style={{ fontWeight: '400', opacity: 0.6, fontSize: '11px' }}>Best</span>
                          <span className="hole-stat-value" style={{ 
                            fontWeight: '400', 
                            color: bestColor
                          }}>
                            {holeStat?.bestScore || '-'}
                          </span>
                        </div>
                        <div className="hole-stat">
                          <span className="hole-stat-label" style={{ fontWeight: '400', opacity: 0.6, fontSize: '11px' }}>Avg</span>
                          <span className="hole-stat-value" style={{ 
                            fontWeight: '400', 
                            color: avgColor
                          }}>
                            {holeStat?.averageScore ? holeStat.averageScore.toFixed(1) : '-'}
                          </span>
                        </div>
                        <div className="hole-stat" title={`Average score of friends with handicap ±${handicapRange} from yours (${friendsData?.count || 0} rounds)`}>
                          <span className="hole-stat-label" style={{ fontWeight: '400', opacity: 0.6, fontSize: '11px' }}>
                            Fr±{handicapRange}
                          </span>
                          <span className="hole-stat-value" style={{ 
                            fontWeight: '400', 
                            color: friendsColor,
                            fontSize: '13px',
                            position: 'relative'
                          }}>
                            {friendsData ? (
                              <>
                                {friendsData.average.toFixed(1)}
                                <sub style={{ 
                                  fontSize: '9px', 
                                  opacity: 0.6,
                                  marginLeft: '1px',
                                  position: 'absolute',
                                  bottom: '-2px'
                                }}>
                                  {friendsData.count}
                                </sub>
                              </>
                            ) : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };


  const renderStats = () => (
    <>
      {/* Tee Filter - Full Width */}
      <div style={{ 
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        padding: '12px 0',
        background: 'transparent'
      }}>
        <IonSegment 
          value={selectedStatsTee === null ? 'all' : selectedStatsTee.toString()} 
          onIonChange={e => {
            const value = e.detail.value as string;
            setSelectedStatsTee(value === 'all' ? null : parseInt(value));
          }}
          className="premium-segment"
          style={{
            '--background': 'transparent',
            padding: '0 16px'
          }}
        >
          <IonSegmentButton value="all">
            <Target size={16} />
          </IonSegmentButton>
          {teeBoxes.map((tee) => (
            <IonSegmentButton key={tee.id} value={tee.id.toString()}>
              <div style={{ 
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {tee.name || tee.color}
              </div>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </div>

      <div className="content-container" style={{ paddingBottom: '60px' }}>

      {processedStats ? (
        <>
          {/* Summary Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <Target className="stat-icon" size={24} />
              <div className="stat-info">
                <span className="stat-value">{processedStats.totalRounds}</span>
                <span className="stat-label">Rounds Played</span>
              </div>
            </div>
            <div className="stat-card">
              <Flag className="stat-icon" size={24} />
              <div className="stat-info">
                <span className="stat-value">
                  {processedStats.averagePutts?.toFixed(1) || '-'}
                </span>
                <span className="stat-label">Avg Putts</span>
              </div>
            </div>
          </div>

          {/* Score Trend Chart */}
          {processedStats.recentRounds.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">Recent Rounds</h3>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={processedStats.recentRounds}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="round" stroke="rgba(255, 255, 255, 0.5)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(26, 37, 47, 0.95)', 
                      border: '1px solid rgba(255, 215, 0, 0.2)' 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="strokes" fill="#ffd700" name="Strokes" />
                  <Line type="monotone" dataKey="putts" stroke="#4ade80" name="Putts" strokeWidth={2} />
                  <ReferenceLine 
                    y={course.par} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    label={{ value: "Par", fill: "#ef4444" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Additional Stats Cards */}
          <div className="stats-grid" style={{ marginTop: '20px' }}>
            <div className="stat-card">
              <Trophy className="stat-icon" size={24} style={{ color: '#4ade80' }} />
              <div className="stat-info">
                <span className="stat-value" style={{ color: '#4ade80' }}>
                  {processedStats.bestScore || '-'}
                </span>
                <span className="stat-label">Best Score</span>
              </div>
            </div>
            <div className="stat-card">
              <TrendingUp className="stat-icon" size={24} style={{ color: '#ffd700' }} />
              <div className="stat-info">
                <span className="stat-value" style={{ color: '#ffd700' }}>
                  {processedStats.averageScore?.toFixed(1) || '-'}
                </span>
                <span className="stat-label">Average</span>
              </div>
            </div>
            <div className="stat-card">
              <BarChart3 className="stat-icon" size={24} style={{ color: '#ef4444' }} />
              <div className="stat-info">
                <span className="stat-value" style={{ color: '#ef4444' }}>
                  {processedStats.worstScore || '-'}
                </span>
                <span className="stat-label">Worst Score</span>
              </div>
            </div>
            <div className="stat-card">
              <Target className="stat-icon" size={24} style={{ color: processedStats.averageScore && processedStats.averageScore <= course.par ? '#4ade80' : '#ffd700' }} />
              <div className="stat-info">
                <span className="stat-value" style={{ 
                  color: processedStats.averageScore && processedStats.averageScore <= course.par ? '#4ade80' : '#ffd700' 
                }}>
                  {processedStats.averageScore 
                    ? `${processedStats.averageScore > course.par ? '+' : ''}${(processedStats.averageScore - course.par).toFixed(1)}`
                    : '-'}
                </span>
                <span className="stat-label">vs Par</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-stats">
          <Trophy size={48} style={{color: 'rgba(255, 255, 255, 0.3)', marginBottom: '20px'}} />
          <p style={{fontSize: '18px', marginBottom: '10px'}}>No stats available</p>
          <p style={{fontSize: '14px', opacity: 0.7}}>
            Play some rounds to see your statistics
          </p>
        </div>
      )}
      </div>
    </>
  );

  return (
    <IonPage className="course-detail">
      <IonHeader className="green-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/courses" />
          </IonButtons>
          <div className="course-header-title">{course?.name || 'Loading...'}</div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="premium-content">
        {/* Course Header - Always visible at top */}
        {course && (
          <div 
            className="course-header-section" 
            style={courseImage ? { backgroundImage: `url(${courseImage})` } : {}}
          >
            <div className="course-header-overlay" />
            <div className="course-header-content">
              <h1 className="course-title">{course.name}</h1>
              <div className="club-title">
                {course.golf_clubs?.name} • {course.golf_clubs?.city}
              </div>
              <div className="course-basic-stats" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                fontSize: '15px',
                fontWeight: '400'
              }}>
                <span>Par {course.par}</span>
                <span className="separator" style={{ opacity: 0.5 }}>•</span>
                <span>{course.holes} Holes</span>
                {course.total_meters && (
                  <>
                    <span className="separator" style={{ opacity: 0.5 }}>•</span>
                    <span>{course.total_meters}m</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Segment Control */}
        <div className="segment-container">
          <IonSegment 
            value={selectedSegment} 
            onIonChange={e => setSelectedSegment(e.detail.value as string)}
            className="premium-segment"
          >
            <IonSegmentButton value="overview">
              <Home size={18} />
            </IonSegmentButton>
            <IonSegmentButton value="tees">
              <Flag size={18} />
            </IonSegmentButton>
            <IonSegmentButton value="stats">
              <TrendingUp size={18} />
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Content based on segment */}
        <div className="detail-content">
          {selectedSegment === 'overview' && renderOverview()}
          {selectedSegment === 'tees' && renderTeeBoxes()}
          {selectedSegment === 'stats' && renderStats()}
        </div>
      </IonContent>

      {/* Friends Average Info Modal */}
      <IonModal 
        isOpen={showFriendsInfoModal} 
        onDidDismiss={() => setShowFriendsInfoModal(false)}
        className="premium-modal"
      >
        <IonHeader className="green-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => setShowFriendsInfoModal(false)}>Close</IonButton>
            </IonButtons>
            <div style={{ 
              textAlign: 'center', 
              fontSize: '17px', 
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              Friends Average Explained
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent className="premium-content">
          <div style={{ padding: '20px' }}>
            <div style={{
              background: 'rgba(96, 165, 250, 0.15)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                color: '#60a5fa', 
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Friends Average (Fr±{handicapRange})
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px',
                lineHeight: '1.5',
                color: 'rgba(255, 255, 255, 0.85)'
              }}>
                Shows the average score of your friends who have a similar skill level to you 
                on each hole of this course and tee. The range adjusts based on your handicap level.
              </p>
            </div>

            <IonList style={{ background: 'transparent' }}>
              <IonItem lines="none" style={{ '--background': 'transparent', '--color': 'rgba(255, 255, 255, 0.9)' }}>
                <IonLabel>
                  <h3 style={{ fontWeight: '600', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.95)' }}>Variable Range System</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.85)' }}>
                    The comparison range adjusts based on handicap level:
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <li><strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Pro (HC &lt; 5):</strong> ±2 range</li>
                      <li><strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Low (HC 5-9):</strong> ±3 range</li>
                      <li><strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Mid (HC 10-17):</strong> ±4 range</li>
                      <li><strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>High (HC 18-27):</strong> ±5 range</li>
                      <li><strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Very High (HC 28+):</strong> ±6 range</li>
                    </ul>
                  </div>
                </IonLabel>
              </IonItem>

              <IonItem lines="none" style={{ '--background': 'transparent', '--color': 'rgba(255, 255, 255, 0.9)' }}>
                <IonLabel>
                  <h3 style={{ fontWeight: '600', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.95)' }}>Why Variable Ranges?</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.4', color: 'rgba(255, 255, 255, 0.85)' }}>
                    Better players have more consistent scores, so a smaller comparison range is more meaningful. 
                    Higher handicap players have more variation, so a wider range provides better data coverage.
                  </p>
                </IonLabel>
              </IonItem>

              <IonItem lines="none" style={{ '--background': 'transparent', '--color': 'rgba(255, 255, 255, 0.9)' }}>
                <IonLabel>
                  <h3 style={{ fontWeight: '600', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.95)' }}>No data showing?</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.4', color: 'rgba(255, 255, 255, 0.85)' }}>
                    The column shows "-" when no friends within your handicap range have played 
                    this specific course and tee combination. Data will appear as more rounds are completed.
                  </p>
                </IonLabel>
              </IonItem>

              <IonItem lines="none" style={{ '--background': 'transparent', '--color': 'rgba(255, 255, 255, 0.9)' }}>
                <IonLabel>
                  <h3 style={{ fontWeight: '600', marginBottom: '4px', color: 'rgba(255, 255, 255, 0.95)' }}>Current Status</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.4', color: 'rgba(255, 255, 255, 0.85)' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Your handicap:</strong> {userHandicap}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Your category:</strong> {
                        userHandicap < 5 ? 'Pro' :
                        userHandicap < 10 ? 'Low Handicap' :
                        userHandicap < 18 ? 'Mid Handicap' :
                        userHandicap < 28 ? 'High Handicap' :
                        'Very High Handicap'
                      }
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Friend range:</strong> {userHandicap - handicapRange} to {userHandicap + handicapRange} handicap (±{handicapRange})
                    </div>
                    <div>
                      <strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Data available:</strong> {Object.keys(friendsAverages).length > 0 
                        ? `Data on ${Object.keys(friendsAverages).length} holes (subscript shows rounds per hole)`
                        : 'No data for this tee yet'}
                    </div>
                  </div>
                </IonLabel>
              </IonItem>
            </IonList>
          </div>
        </IonContent>
      </IonModal>

      {/* Styles are imported from extracted-styles.css */}
    </IonPage>
  );
};

export default CourseDetail;
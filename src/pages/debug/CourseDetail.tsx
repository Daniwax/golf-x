import React, { useEffect, useState, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonModal,
  IonTextarea
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { codeSlashOutline } from 'ionicons/icons';

interface CourseDetail {
  id: number;
  name: string;
  course_number: number;
  course_type: string;
  par: number;
  holes: number;
  designed_year: number;
  designer: string;
  course_style: string;
  latitude: number;
  longitude: number;
  status: string;
  club_id: number;
  golf_clubs: {
    name: string;
    address: string;
    city: string;
    website: string;
    phone: string;
    established_year: number;
    club_type: string;
    has_royal_prefix: boolean;
  };
}

interface TeeBox {
  id: number;
  course_id?: number;
  name: string;
  color: string;
  gender: string;
  total_yards: number;
  total_meters: number;
  course_rating: number;
  slope_rating: number;
  front_nine_rating: number;
  front_nine_slope: number;
  back_nine_rating: number;
  back_nine_slope: number;
  display_order: number;
}

interface Hole {
  id: number;
  hole_number: number;
  par: number;
  handicap_index: number;
  hole_distances: Array<{
    yards: number;
    meters: number;
    tee_boxes: {
      name: string;
      color: string;
    };
  }>;
}

interface Amenities {
  has_driving_range: boolean;
  has_putting_green: boolean;
  has_chipping_area: boolean;
  has_practice_bunker: boolean;
  has_pro_shop: boolean;
  has_restaurant: boolean;
  has_bar: boolean;
  has_cart_rental: boolean;
  has_club_rental: boolean;
  has_caddie_service: boolean;
  has_lessons: boolean;
  has_locker_room: boolean;
}

interface CourseImage {
  id: number;
  image_type: string;
  title: string;
  mime_type: string;
  image_data: string; // base64 encoded
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSegment, setSelectedSegment] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [teeBoxes, setTeeBoxes] = useState<TeeBox[]>([]);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [amenities, setAmenities] = useState<Amenities | null>(null);
  const [courseImage, setCourseImage] = useState<CourseImage | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Fetch course with club info
      const { data: courseData, error: courseError } = await supabase
        .from('golf_courses')
        .select(`
          *,
          golf_clubs (*)
        `)
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch tee boxes
      const { data: teeData, error: teeError } = await supabase
        .from('tee_boxes')
        .select('*')
        .eq('course_id', id)
        .order('display_order');

      if (teeError) throw teeError;
      setTeeBoxes(teeData || []);

      // Fetch holes with distances
      const { data: holesData, error: holesError } = await supabase
        .from('holes')
        .select(`
          *,
          hole_distances (
            yards,
            meters,
            tee_boxes (
              name,
              color
            )
          )
        `)
        .eq('course_id', id)
        .order('hole_number');

      if (holesError) throw holesError;
      setHoles(holesData || []);

      // Fetch amenities
      if (courseData?.club_id) {
        const { data: amenitiesData, error: amenitiesError } = await supabase
          .from('club_amenities')
          .select('*')
          .eq('club_id', courseData.club_id)
          .single();

        if (!amenitiesError) {
          setAmenities(amenitiesData);
        }
      }

      // Fetch course image (if available)
      const { data: imageData, error: imageError } = await supabase
        .from('course_images')
        .select('id, image_type, title, mime_type, image_data')
        .eq('course_id', id)
        .eq('image_type', 'aerial')
        .limit(1)
        .single();

      if (!imageError && imageData && imageData.image_data) {
        try {
          // Handle different image data formats
          let base64Image = '';
          
          // Log the first 50 characters of image data for debugging
          console.log('Image data preview:', imageData.image_data.substring(0, 50));
          
          if (imageData.image_data.startsWith('data:')) {
            // Already a data URL
            base64Image = imageData.image_data;
          } else if (imageData.image_data.startsWith('\\x')) {
            // Hex-encoded bytea from PostgreSQL
            // Remove the \x prefix and convert hex to base64
            const hexString = imageData.image_data.slice(2);
            const hexMatches = hexString.match(/.{1,2}/g);
            if (hexMatches && hexMatches.length < 1000000) { // Prevent processing huge images
              try {
                const bytes = new Uint8Array(hexMatches.map((byte: string) => parseInt(byte, 16)));
                // Process in chunks to avoid stack overflow
                let binaryString = '';
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                  const chunk = bytes.slice(i, i + chunkSize);
                  binaryString += String.fromCharCode(...chunk);
                }
                const base64String = btoa(binaryString);
                base64Image = `data:${imageData.mime_type || 'image/jpeg'};base64,${base64String}`;
              } catch (e) {
                console.warn('Failed to convert hex to base64:', e);
                // Don't try to use the raw hex data
                base64Image = '';
              }
            } else {
              console.warn('Image data too large or invalid, skipping');
              base64Image = '';
            }
          } else {
            // Assume it's already base64
            // Clean up any whitespace or newlines that might be in the base64 string
            const cleanBase64 = imageData.image_data.replace(/[\s\n\r]/g, '');
            base64Image = `data:${imageData.mime_type || 'image/jpeg'};base64,${cleanBase64}`;
          }
          
          // Only set course image if we have valid base64 data
          if (base64Image) {
            setCourseImage({
              ...imageData,
              image_data: base64Image
            });
          }
        } catch (error) {
          console.error('Error processing image data:', error);
          // Don't set the course image if there's an error
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course data';
      setError(errorMessage);
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const renderInfo = () => {
    if (!course) return null;

    // Check if we have a valid image from the database
    const hasValidImage = courseImage && courseImage.image_data;

    return (
      <div>
        {/* Course Image Card - Full width, 1:1 aspect ratio */}
        <IonCard style={{ margin: '0', borderRadius: '0' }}>
          <div style={{ 
            position: 'relative',
            width: '100%',
            paddingBottom: '100%', // 1:1 aspect ratio
            overflow: 'hidden',
            background: hasValidImage ? '#f4f5f8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            {hasValidImage ? (
              <img 
                src={courseImage.image_data} 
                alt={course.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.error('Image failed to load');
                  // Hide the broken image
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              // Standard gradient background when no image exists
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #3880ff 0%, #3171e0 50%, #2e58bf 100%)'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  opacity: 0.3
                }}>
                  ⛳
                </div>
              </div>
            )}
            {/* Overlay with course name */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white',
              padding: '20px',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{course.name}</h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                {course.golf_clubs.name} • {course.golf_clubs.city}
              </p>
            </div>
          </div>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Course Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h3>Course Name</h3>
                  <p>{course.name}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Golf Club</h3>
                  <p>{course.golf_clubs.name}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Type</h3>
                  <p>{course.course_type}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Par / Holes</h3>
                  <p>{course.par} / {course.holes}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Designer</h3>
                  <p>{course.designer || 'N/A'}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Year Designed</h3>
                  <p>{course.designed_year || 'N/A'}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Style</h3>
                  <p>{course.course_style || 'N/A'}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Status</h3>
                  <p>{course.status}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Club Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h3>Address</h3>
                  <p>{course.golf_clubs.address}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>City</h3>
                  <p>{course.golf_clubs.city}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Phone</h3>
                  <p>{course.golf_clubs.phone || 'N/A'}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Website</h3>
                  <p>{course.golf_clubs.website || 'N/A'}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Established</h3>
                  <p>{course.golf_clubs.established_year || 'N/A'}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h3>Type</h3>
                  <p>{course.golf_clubs.club_type}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
      </div>
    );
  };

  const renderTeeBoxes = () => {
    return (
      <div>
        {teeBoxes.map((teeBox) => (
          <IonCard key={teeBox.id}>
            <IonCardHeader>
              <IonCardTitle>
                <IonChip color={teeBox.color === 'white' ? 'light' : teeBox.color}>
                  {teeBox.name} Tees
                </IonChip>
                <IonChip>{teeBox.gender}</IonChip>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <strong>Distance:</strong> {teeBox.total_meters} meters
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="6">
                    <strong>Course Rating:</strong> {teeBox.course_rating}
                  </IonCol>
                  <IonCol size="6">
                    <strong>Slope Rating:</strong> {teeBox.slope_rating}
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="6">
                    <strong>Front 9:</strong> {teeBox.front_nine_rating} / {teeBox.front_nine_slope}
                  </IonCol>
                  <IonCol size="6">
                    <strong>Back 9:</strong> {teeBox.back_nine_rating} / {teeBox.back_nine_slope}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ))}
      </div>
    );
  };

  const renderHoles = () => {
    if (!course) return null;

    // Create a proper scorecard layout
    const renderScorecard = () => {
      const frontNine = holes.slice(0, 9);
      const backNine = holes.slice(9, 18);
      
      // Tee boxes are already filtered for this course
      const courseTeeBoxes = teeBoxes;

      return (
        <div>
          {/* Course Ratings Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Course Ratings</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ width: '100%' }}>
                <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#3880ff', color: 'white' }}>
                      <th style={{ padding: '4px', border: '1px solid #ddd', width: '15%', fontSize: '9px' }}>Tees</th>
                      <th style={{ padding: '2px', border: '1px solid #ddd', width: '12%', fontSize: '9px' }}>Meters</th>
                      <th style={{ padding: '2px', border: '1px solid #ddd', width: '10%', fontSize: '9px' }}>Vc</th>
                      <th style={{ padding: '2px', border: '1px solid #ddd', width: '10%', fontSize: '9px' }}>Vs</th>
                      <th style={{ padding: '2px', border: '1px solid #ddd', width: '15%', fontSize: '9px' }}>Front</th>
                      <th style={{ padding: '2px', border: '1px solid #ddd', width: '15%', fontSize: '9px' }}>Back</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseTeeBoxes.map((tee) => (
                      <tr key={tee.id}>
                        <td style={{ padding: '4px', border: '1px solid #ddd', fontSize: '8px' }}>
                          <span style={{ color: tee.color === 'white' ? '#888' : tee.color }}>{tee.name}</span>
                        </td>
                        <td style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9px' }}>{tee.total_meters}</td>
                        <td style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '9px' }}>
                          {tee.course_rating}
                        </td>
                        <td style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '9px' }}>
                          {tee.slope_rating}
                        </td>
                        <td style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontSize: '8px' }}>
                          {tee.front_nine_rating}/{tee.front_nine_slope}
                        </td>
                        <td style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontSize: '8px' }}>
                          {tee.back_nine_rating}/{tee.back_nine_slope}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Front Nine Scorecard */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Front Nine</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ width: '100%' }}>
                <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#3880ff', color: 'white' }}>
                      <th style={{ padding: '4px', border: '1px solid #ddd', width: '15%', fontSize: '9px' }}>Hole</th>
                      {frontNine.map(h => (
                        <th key={h.id} style={{ padding: '2px', border: '1px solid #ddd', width: '8%', fontSize: '10px' }}>
                          {h.hole_number}
                        </th>
                      ))}
                      <th style={{ padding: '4px', border: '1px solid #ddd', width: '13%', fontSize: '9px' }}>OUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Par Row */}
                    <tr style={{ backgroundColor: '#f4f5f8' }}>
                      <td style={{ padding: '4px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '9px' }}>PAR</td>
                      {frontNine.map(h => (
                        <td key={`par-${h.id}`} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                          {h.par}
                        </td>
                      ))}
                      <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                        {frontNine.reduce((sum, h) => sum + h.par, 0)}
                      </td>
                    </tr>
                    {/* Handicap Row */}
                    <tr>
                      <td style={{ padding: '4px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '9px' }}>Handicap</td>
                      {frontNine.map(h => (
                        <td key={`hcp-${h.id}`} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontSize: '10px' }}>
                          {h.handicap_index}
                        </td>
                      ))}
                      <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center', fontSize: '10px' }}>
                        {(frontNine.reduce((sum, h) => sum + h.handicap_index, 0) / frontNine.length).toFixed(1)}
                      </td>
                    </tr>
                    {/* Distance rows for each tee box with actual data */}
                    {courseTeeBoxes.map((tee) => {
                      // Calculate total for this tee box's front nine
                      let frontNineTotal = 0;
                      
                      return (
                        <tr key={`tee-${tee.id}`}>
                          <td style={{ padding: '4px', border: '1px solid #ddd', fontSize: '8px' }}>
                            <span style={{ color: tee.color === 'white' ? '#888' : tee.color }}>{tee.name}</span>
                          </td>
                          {frontNine.map(h => {
                            // Find the distance for this hole and tee box
                            const distance = h.hole_distances?.find((d) => 
                              d.tee_boxes?.name === tee.name
                            );
                            const meters = distance?.meters || 0;
                            frontNineTotal += meters;
                            
                            return (
                              <td key={`dist-${tee.id}-${h.id}`} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9px' }}>
                                {meters || '-'}
                              </td>
                            );
                          })}
                          <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                            {frontNineTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Back Nine Scorecard */}
          {backNine.length > 0 && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Back Nine</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ width: '100%' }}>
                  <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#3880ff', color: 'white' }}>
                        <th style={{ padding: '4px', border: '1px solid #ddd', width: '15%', fontSize: '9px' }}>Hole</th>
                        {backNine.map(h => (
                          <th key={h.id} style={{ padding: '2px', border: '1px solid #ddd', width: '8%', fontSize: '10px' }}>
                            {h.hole_number}
                          </th>
                        ))}
                        <th style={{ padding: '4px', border: '1px solid #ddd', width: '13%', fontSize: '9px' }}>IN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Par Row */}
                      <tr style={{ backgroundColor: '#f4f5f8' }}>
                        <td style={{ padding: '4px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '9px' }}>PAR</td>
                        {backNine.map(h => (
                          <td key={`par-${h.id}`} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                            {h.par}
                          </td>
                        ))}
                        <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                          {backNine.reduce((sum, h) => sum + h.par, 0)}
                        </td>
                      </tr>
                      {/* Handicap Row */}
                      <tr>
                        <td style={{ padding: '4px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '9px' }}>Handicap</td>
                        {backNine.map(h => (
                          <td key={`hcp-${h.id}`} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontSize: '10px' }}>
                            {h.handicap_index}
                          </td>
                        ))}
                        <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center', fontSize: '10px' }}>
                          {(backNine.reduce((sum, h) => sum + h.handicap_index, 0) / backNine.length).toFixed(1)}
                        </td>
                      </tr>
                      {/* Distance rows for each tee box with actual data */}
                      {courseTeeBoxes.map((tee) => {
                        // Calculate total for this tee box's back nine
                        let backNineTotal = 0;
                        
                        return (
                          <tr key={`tee-${tee.id}`}>
                            <td style={{ padding: '4px', border: '1px solid #ddd', fontSize: '8px' }}>
                              <span style={{ color: tee.color === 'white' ? '#888' : tee.color }}>{tee.name}</span>
                            </td>
                            {backNine.map(h => {
                              // Find the distance for this hole and tee box
                              const distance = h.hole_distances?.find((d) => 
                                d.tee_boxes?.name === tee.name
                              );
                              const meters = distance?.meters || 0;
                              backNineTotal += meters;
                              
                              return (
                                <td key={`dist-${tee.id}-${h.id}`} style={{ padding: '2px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9px' }}>
                                  {meters || '-'}
                                </td>
                              );
                            })}
                            <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                              {backNineTotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* Summary Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Summary</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="4">
                    <strong>Total Par:</strong> {holes.reduce((sum, h) => sum + h.par, 0)}
                  </IonCol>
                  <IonCol size="4">
                    <strong>Front Nine:</strong> {holes.slice(0, 9).reduce((sum, h) => sum + h.par, 0)}
                  </IonCol>
                  <IonCol size="4">
                    <strong>Back Nine:</strong> {holes.slice(9, 18).reduce((sum, h) => sum + h.par, 0)}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </div>
      );
    };

    return renderScorecard();
  };

  const renderAmenities = () => {
    if (!amenities) {
      return (
        <IonCard>
          <IonCardContent>
            <IonNote>No amenities data available</IonNote>
          </IonCardContent>
        </IonCard>
      );
    }

    const amenityList = [
      { label: 'Driving Range', value: amenities.has_driving_range },
      { label: 'Putting Green', value: amenities.has_putting_green },
      { label: 'Chipping Area', value: amenities.has_chipping_area },
      { label: 'Practice Bunker', value: amenities.has_practice_bunker },
      { label: 'Pro Shop', value: amenities.has_pro_shop },
      { label: 'Restaurant', value: amenities.has_restaurant },
      { label: 'Bar', value: amenities.has_bar },
      { label: 'Cart Rental', value: amenities.has_cart_rental },
      { label: 'Club Rental', value: amenities.has_club_rental },
      { label: 'Caddie Service', value: amenities.has_caddie_service },
      { label: 'Lessons', value: amenities.has_lessons },
      { label: 'Locker Room', value: amenities.has_locker_room },
    ];

    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Club Amenities</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {amenityList.map((amenity, index) => (
              <IonItem key={index}>
                <IonLabel>{amenity.label}</IonLabel>
                <IonChip color={amenity.value ? 'success' : 'medium'}>
                  {amenity.value ? 'Yes' : 'No'}
                </IonChip>
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>
    );
  };

  const getJsonData = () => {
    return JSON.stringify({
      course,
      teeBoxes,
      holes,
      amenities
    }, null, 2);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/debug/courses" />
          </IonButtons>
          <IonTitle>{course?.name || 'Course Details'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowJsonModal(true)}>
              <IonIcon icon={codeSlashOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <IonSpinner />
          </div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <IonNote color="danger">Error: {error}</IonNote>
          </div>
        ) : (
          <>
            <IonSegment value={selectedSegment} onIonChange={(e) => setSelectedSegment(e.detail.value as string)}>
              <IonSegmentButton value="info">
                <IonLabel>Info</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="tees">
                <IonLabel>Tees</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="holes">
                <IonLabel>Holes</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="amenities">
                <IonLabel>Amenities</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <div style={{ padding: '10px' }}>
              {selectedSegment === 'info' && renderInfo()}
              {selectedSegment === 'tees' && renderTeeBoxes()}
              {selectedSegment === 'holes' && renderHoles()}
              {selectedSegment === 'amenities' && renderAmenities()}
            </div>
          </>
        )}

        <IonModal isOpen={showJsonModal} onDidDismiss={() => setShowJsonModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Raw JSON Data</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowJsonModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonTextarea
              value={getJsonData()}
              readonly
              rows={30}
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default CourseDetail;
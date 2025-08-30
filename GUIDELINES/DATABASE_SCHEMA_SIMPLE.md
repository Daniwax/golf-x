# Database Schema - Compact Overview
*Scanned: 2025-08-30T01:29:21.967Z*

## Tables & Fields

### User & Auth

**profiles** [6 rows] (id: uuid, full_name: varchar, email: varchar, avatar_url: text, handicap: int, home_course: nullable, bio: nullable, created_at: timestamptz, updated_at: timestamptz, custom_avatar_url: nullable)

### Game Management

**games** [31 rows] (id: uuid, course_id: int, creator_user_id: uuid, game_description: nullable, scoring_format: varchar, weather_condition: varchar, status: varchar, created_at: timestamptz, started_at: nullable, completed_at: nullable, notes: nullable, notes_updated_by: nullable, notes_updated_at: nullable, handicap_type: varchar, scoring_method: varchar, num_holes: int)
  ↳ course_id → course
  ↳ creator_user_id → creatoruser

**game_participants** [54 rows] (id: uuid, game_id: uuid, user_id: uuid, tee_box_id: int, handicap_index: int, course_handicap: int, playing_handicap: int, match_handicap: int, total_strokes: nullable, total_putts: nullable, net_score: nullable, front_nine_strokes: nullable, back_nine_strokes: nullable)
  ↳ game_id → game
  ↳ user_id → user
  ↳ tee_box_id → teebox

**game_hole_scores** [350 rows] (id: uuid, game_id: uuid, user_id: uuid, hole_number: int, strokes: int, putts: int, hole_par: int, hole_handicap_strokes: int, net_score: int, score_vs_par: int, updated_at: timestamptz, player_match_par: int)
  ↳ game_id → game
  ↳ user_id → user

### Location Data

**countries** [1 rows] (id: int, code: varchar, code3: varchar, name: varchar, continent: varchar, created_at: timestamptz)

**regions** [1 rows] (id: int, country_id: int, code: varchar, name: varchar, type: varchar, created_at: timestamptz)
  ↳ country_id → country

### Golf Facilities

**golf_clubs** [1 rows] (id: int, external_id: uuid, slug: varchar, name: varchar, country_id: int, region_id: int, city: varchar, address: varchar, postal_code: nullable, latitude: decimal, longitude: decimal, established_year: int, designer: varchar, architect: nullable, club_type: varchar, has_royal_prefix: bool, website: varchar, phone: varchar, email: nullable, booking_url: nullable, data_source: varchar, source_updated_at: nullable, confidence_score: decimal, is_verified: bool, created_at: timestamptz, updated_at: timestamptz)
  ↳ external_id → external
  ↳ country_id → country
  ↳ region_id → region

**golf_courses** [5 rows] (id: int, club_id: int, external_id: nullable, name: varchar, course_number: int, course_type: varchar, par: int, holes: int, total_yardage: nullable, total_meters: nullable, designed_year: int, designer: varchar, course_style: varchar, latitude: decimal, longitude: decimal, altitude_meters: nullable, status: varchar, season_start_month: nullable, season_end_month: nullable, booking_url: nullable, scorecard_url: nullable, layout_map_url: nullable, created_at: timestamptz, updated_at: timestamptz)
  ↳ club_id → club
  ↳ external_id → external

### Course Details

**holes** [90 rows] (id: int, course_id: int, hole_number: int, hole_name: nullable, par: int, handicap_index: int, has_water: bool, has_bunkers: bool, dogleg_direction: nullable, notes: nullable, signature_hole: bool, created_at: timestamptz, updated_at: timestamptz)
  ↳ course_id → course

**tee_boxes** [20 rows] (id: int, course_id: int, name: varchar, color: varchar, color_hex: nullable, gender: varchar, total_yards: int, total_meters: int, course_rating: decimal, slope_rating: int, bogey_rating: nullable, front_nine_rating: decimal, front_nine_slope: int, front_nine_bogey: nullable, back_nine_rating: decimal, back_nine_slope: int, back_nine_bogey: nullable, display_order: int, is_default: bool, created_at: timestamptz, updated_at: timestamptz)
  ↳ course_id → course

**hole_distances** [360 rows] (id: int, hole_id: int, tee_box_id: int, yards: int, meters: int, yards_to_layup: nullable, yards_to_carry: nullable, created_at: timestamptz)
  ↳ hole_id → hole
  ↳ tee_box_id → teebox

### Media

**course_images** [9 rows] (id: int, course_id: int, hole_id: nullable, image_data: text, mime_type: varchar, file_size: int, image_type: text, title: varchar, description: nullable, width: nullable, height: nullable, display_order: int, is_primary: bool, is_thumbnail: bool, created_at: timestamptz)
  ↳ course_id → course
  ↳ hole_id → hole

### Amenities

**club_amenities** [1 rows] (id: int, club_id: int, has_driving_range: bool, has_putting_green: bool, has_chipping_area: bool, has_practice_bunker: bool, has_pro_shop: bool, has_restaurant: bool, has_bar: bool, has_accommodation: bool, has_cart_rental: bool, has_club_rental: bool, has_caddie_service: bool, has_lessons: bool, has_locker_room: bool, has_conference_facilities: bool, has_wedding_facilities: bool, notes: nullable, created_at: timestamptz, updated_at: timestamptz)
  ↳ club_id → club

## Key Relationships

- club_amenities.club_id → club
- course_images.course_id → course
- course_images.hole_id → hole
- game_hole_scores.game_id → game
- game_hole_scores.user_id → user
- game_participants.game_id → game
- game_participants.tee_box_id → teebox
- game_participants.user_id → user
- games.course_id → course
- games.creator_user_id → creatoruser
- golf_clubs.country_id → country
- golf_clubs.external_id → external
- golf_clubs.region_id → region
- golf_courses.club_id → club
- golf_courses.external_id → external
- hole_distances.hole_id → hole
- hole_distances.tee_box_id → teebox
- holes.course_id → course
- regions.country_id → country
- tee_boxes.course_id → course

## Domain Relationships
- 1 Country → N Regions
- 1 Region → N Golf Clubs
- 1 Golf Club → N Golf Courses
- 1 Golf Course → 18 Holes
- 1 Golf Course → N Tee Boxes (4-6)
- 1 Game → N Participants (2-6)
- 1 Game → N Hole Scores

## Security (RLS Policies)
- All tables have Row Level Security enabled
- Golf course data: Public SELECT
- Game data: Authenticated users only
- User can only modify own data

## Database Statistics

### Summary
- **Scan Date:** 30/8/2025, 3:29:21
- **Total Tables:** 13
- **Total Columns:** 190
- **Total Rows:** 929
- **Tables with Data:** 13
- **Empty Tables:** 0
- **Foreign Keys:** 20

### Table Details

| Table | Category | Columns | Rows | Status |
|-------|----------|---------|------|--------|
| hole_distances | Course Details | 8 | 360 | 🟢 Active |
| game_hole_scores | Game Management | 12 | 350 | 🟢 Active |
| holes | Course Details | 13 | 90 | 🟢 Active |
| game_participants | Game Management | 13 | 54 | 🟢 Active |
| games | Game Management | 16 | 31 | 🟢 Active |
| tee_boxes | Course Details | 21 | 20 | 🟢 Active |
| course_images | Media | 15 | 9 | 🟢 Active |
| profiles | User & Auth | 10 | 6 | 🟢 Active |
| golf_courses | Golf Facilities | 24 | 5 | 🟢 Active |
| countries | Location Data | 6 | 1 | 🟢 Active |
| regions | Location Data | 6 | 1 | 🟢 Active |
| golf_clubs | Golf Facilities | 26 | 1 | 🟢 Active |
| club_amenities | Amenities | 20 | 1 | 🟢 Active |

### Largest Tables (by row count)
1. **hole_distances** - 360 rows
2. **game_hole_scores** - 350 rows
3. **holes** - 90 rows
4. **game_participants** - 54 rows
5. **games** - 31 rows

### Development Status
- **Golf Course Data:** Fully populated (courses, holes, tee boxes)
- **Game System:** Schema ready, awaiting implementation
- **User System:** Schema ready, awaiting users

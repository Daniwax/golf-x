# Database Schema - Compact Overview

## Tables & Relations

### countries (id, code, code3, name, continent)
↓
### regions (id, country_id→countries, code, name, type)
↓
### golf_clubs (id, external_id, slug, name, country_id→countries, region_id→regions, city, address, postal_code, lat, lng, established_year, designer, club_type, has_royal_prefix, website, phone, email, booking_url, data_source, confidence_score, logo_image, main_image, main_image_mime)
↓
### golf_courses (id, club_id→golf_clubs, external_id, name, course_number, course_type, par, holes, total_yardage, total_meters, designed_year, designer, course_style, lat, lng, altitude_meters, status, season_start_month, season_end_month, booking_url, scorecard_url, layout_map_url, course_image, course_image_mime, layout_image, layout_image_mime)
↓ ↓
### tee_boxes (id, course_id→golf_courses, name, color, color_hex, gender, total_yards, total_meters, course_rating, slope_rating, bogey_rating, front_nine_rating, front_nine_slope, back_nine_rating, back_nine_slope, display_order, is_default)
### holes (id, course_id→golf_courses, hole_number, hole_name, par, handicap_index, has_water, has_bunkers, dogleg_direction, notes, signature_hole)
↓
### hole_distances (id, hole_id→holes, tee_box_id→tee_boxes, yards, meters, yards_to_layup, yards_to_carry)

### club_amenities (id, club_id→golf_clubs, has_driving_range, has_putting_green, has_chipping_area, has_practice_bunker, has_pro_shop, has_restaurant, has_bar, has_accommodation, has_cart_rental, has_club_rental, has_caddie_service, has_lessons, has_locker_room, has_conference_facilities, has_wedding_facilities, notes)

### course_images (id, course_id→golf_courses, hole_id→holes, image_data, mime_type, file_size, image_type, title, description, width, height, display_order, is_primary, is_thumbnail)

## Key Relationships
- 1 Country → N Regions
- 1 Region → N Clubs
- 1 Club → N Courses (La Moraleja has 4+1)
- 1 Course → N Tee Boxes (5-6 per course)
- 1 Course → N Holes (18 or 9)
- 1 Hole → N Hole Distances (1 per tee box)
- N:N Holes ↔ Tee Boxes (via hole_distances)

## Views
- course_summary: Aggregated course data with club/location
- hole_yardages: Pivot table of hole distances by tee color

## Functions
- get_course_details(course_id): Full course data as JSON
- search_courses(search_term): Search by name/location
- get_image_base64(image_id): Convert bytea to base64
- get_course_images(course_id): All images for a course

## RLS Policies
- All tables: Public SELECT
- Write: Admin only (not yet implemented)
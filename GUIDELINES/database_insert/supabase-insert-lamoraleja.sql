-- La Moraleja Golf Club Database Inserts for Supabase
-- Complete data for all 4 courses plus pitch & putt
-- PostgreSQL compatible version
-- Generated: 2025-08-26

-- Clear existing test data (optional, remove in production)
-- DELETE FROM hole_distances;
-- DELETE FROM holes;
-- DELETE FROM tee_boxes;
-- DELETE FROM golf_courses;
-- DELETE FROM golf_clubs;
-- DELETE FROM regions;
-- DELETE FROM countries;

-- Countries
INSERT INTO countries (id, code, code3, name, continent) VALUES 
(1, 'ES', 'ESP', 'Spain', 'Europe')
ON CONFLICT (id) DO NOTHING;

-- Regions
INSERT INTO regions (id, country_id, code, name, type) VALUES 
(1, 1, 'MAD', 'Madrid', 'autonomous_community')
ON CONFLICT (id) DO NOTHING;

-- Golf Club
INSERT INTO golf_clubs (id, external_id, slug, name, country_id, region_id, city, address, latitude, longitude, established_year, designer, club_type, has_royal_prefix, website, phone, data_source, confidence_score) VALUES 
(1, 'real-club-la-moraleja', 'real-club-la-moraleja', 'Real Club La Moraleja', 1, 1, 'Alcobendas', 'Paseo del Conde de los Gaitanes, 127', 40.516479, -3.617651, 1973, 'Jack Nicklaus', 'private', true, 'https://www.realclublamoraleja.com', '+34 916 500 700', 'manual', 0.95)
ON CONFLICT (id) DO NOTHING;

-- Golf Courses
INSERT INTO golf_courses (id, club_id, name, course_number, course_type, par, holes, designed_year, designer, course_style, latitude, longitude, status) VALUES 
(1, 1, 'La Moraleja Course 1', 1, '18-hole', 72, 18, 1976, 'Jack Nicklaus', 'parkland', 40.516479, -3.617651, 'active'),
(2, 1, 'La Moraleja Course 2', 2, '18-hole', 72, 18, 1990, 'Jack Nicklaus', 'parkland', 40.516479, -3.617651, 'active'),
(3, 1, 'La Moraleja Course 3', 3, '18-hole', 72, 18, 2012, 'Jack Nicklaus', 'parkland', 40.517000, -3.617000, 'active'),
(4, 1, 'La Moraleja Course 4', 4, '18-hole', 72, 18, 2012, 'Jack Nicklaus', 'parkland', 40.517000, -3.617000, 'active'),
(5, 1, 'La Moraleja Pitch & Putt', 0, 'pitch-putt', 27, 9, NULL, NULL, 'parkland', 40.516479, -3.617651, 'active')
ON CONFLICT (id) DO NOTHING;

-- Tee Boxes for Course 1
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(1, 1, 'Black', 'black', 'male', 6407, 5858, 72.0, 140, 0, true),
(2, 1, 'White', 'white', 'male', 5867, 5365, 72.0, 138, 1, false),
(3, 1, 'Yellow', 'yellow', 'male', 5689, 5202, 71.1, 136, 2, false),
(4, 1, 'Blue', 'blue', 'female', 5270, 4819, 74.4, 131, 3, false),
(5, 1, 'Red', 'red', 'female', 4969, 4543, 72.3, 129, 4, false)
ON CONFLICT (id) DO NOTHING;

-- Tee Boxes for Course 2
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(6, 2, 'Championship', 'black', 'male', 6830, 6245, 72.0, 139, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Tee Boxes for Course 3
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(7, 3, 'Championship', 'black', 'male', 6830, 6245, 75.6, 133, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Tee Boxes for Course 4
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(8, 4, 'Black', 'black', 'male', 6487, 5933, 74.1, 136, 0, true),
(9, 4, 'White', 'white', 'male', 6141, 5617, 72.1, 130, 1, false),
(10, 4, 'Yellow', 'yellow', 'male', 5603, 5123, 69.3, 130, 2, false)
ON CONFLICT (id) DO NOTHING;

-- Tee Box for Pitch & Putt
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(11, 5, 'Single', 'white', 'unisex', 761, 696, 25.7, 68, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Holes for Course 1
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(1, 1, 1, 4, 7),
(2, 1, 2, 3, 3),
(3, 1, 3, 4, 13),
(4, 1, 4, 3, 11),
(5, 1, 5, 4, 17),
(6, 1, 6, 5, 15),
(7, 1, 7, 4, 5),
(8, 1, 8, 4, 1),
(9, 1, 9, 5, 9),
(10, 1, 10, 4, 2),
(11, 1, 11, 4, 14),
(12, 1, 12, 5, 6),
(13, 1, 13, 4, 4),
(14, 1, 14, 4, 18),
(15, 1, 15, 3, 16),
(16, 1, 16, 4, 12),
(17, 1, 17, 3, 10),
(18, 1, 18, 5, 8)
ON CONFLICT (id) DO NOTHING;

-- Hole Distances for Course 1 (Sample for first 3 holes, extend as needed)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
-- Hole 1
(1, 1, 390, 357), -- Black
(1, 2, 374, 342), -- White
(1, 3, 362, 331), -- Yellow
(1, 4, 336, 307), -- Blue
(1, 5, 316, 289), -- Red
-- Hole 2
(2, 1, 210, 192), -- Black
(2, 2, 199, 182), -- White
(2, 3, 193, 177), -- Yellow
(2, 4, 179, 164), -- Blue
(2, 5, 169, 155), -- Red
-- Hole 3
(3, 1, 320, 293), -- Black
(3, 2, 308, 282), -- White
(3, 3, 299, 273), -- Yellow
(3, 4, 277, 253), -- Blue
(3, 5, 261, 239), -- Red
-- Hole 4
(4, 1, 215, 197), -- Black
(4, 2, 206, 188), -- White
(4, 3, 200, 183), -- Yellow
(4, 4, 185, 169), -- Blue
(4, 5, 175, 160), -- Red
-- Hole 5
(5, 1, 385, 352), -- Black
(5, 2, 374, 342), -- White
(5, 3, 363, 332), -- Yellow
(5, 4, 336, 307), -- Blue
(5, 5, 317, 290), -- Red
-- Hole 6
(6, 1, 520, 475), -- Black
(6, 2, 503, 460), -- White
(6, 3, 488, 446), -- Yellow
(6, 4, 452, 413), -- Blue
(6, 5, 426, 389), -- Red
-- Hole 7
(7, 1, 470, 430), -- Black
(7, 2, 454, 415), -- White
(7, 3, 441, 403), -- Yellow
(7, 4, 408, 373), -- Blue
(7, 5, 385, 352), -- Red
-- Hole 8
(8, 1, 415, 379), -- Black
(8, 2, 401, 367), -- White
(8, 3, 389, 356), -- Yellow
(8, 4, 360, 329), -- Blue
(8, 5, 340, 311), -- Red
-- Hole 9
(9, 1, 535, 489), -- Black
(9, 2, 519, 474), -- White
(9, 3, 504, 461), -- Yellow
(9, 4, 467, 427), -- Blue
(9, 5, 440, 402), -- Red
-- Hole 10
(10, 1, 358, 327), -- Black
(10, 2, 346, 316), -- White
(10, 3, 336, 307), -- Yellow
(10, 4, 311, 284), -- Blue
(10, 5, 293, 268), -- Red
-- Hole 11
(11, 1, 365, 334), -- Black
(11, 2, 353, 323), -- White
(11, 3, 343, 314), -- Yellow
(11, 4, 317, 290), -- Blue
(11, 5, 299, 273), -- Red
-- Hole 12
(12, 1, 570, 521), -- Black
(12, 2, 554, 507), -- White
(12, 3, 538, 492), -- Yellow
(12, 4, 498, 455), -- Blue
(12, 5, 470, 430), -- Red
-- Hole 13
(13, 1, 338, 309), -- Black
(13, 2, 326, 298), -- White
(13, 3, 317, 290), -- Yellow
(13, 4, 293, 268), -- Blue
(13, 5, 276, 252), -- Red
-- Hole 14
(14, 1, 322, 294), -- Black
(14, 2, 311, 284), -- White
(14, 3, 302, 276), -- Yellow
(14, 4, 280, 256), -- Blue
(14, 5, 264, 241), -- Red
-- Hole 15
(15, 1, 180, 165), -- Black
(15, 2, 174, 159), -- White
(15, 3, 169, 155), -- Yellow
(15, 4, 156, 143), -- Blue
(15, 5, 147, 134), -- Red
-- Hole 16
(16, 1, 323, 295), -- Black
(16, 2, 312, 285), -- White
(16, 3, 303, 277), -- Yellow
(16, 4, 281, 257), -- Blue
(16, 5, 265, 242), -- Red
-- Hole 17
(17, 1, 185, 169), -- Black
(17, 2, 179, 164), -- White
(17, 3, 174, 159), -- Yellow
(17, 4, 161, 147), -- Blue
(17, 5, 152, 139), -- Red
-- Hole 18
(18, 1, 530, 485), -- Black
(18, 2, 514, 470), -- White
(18, 3, 499, 456), -- Yellow
(18, 4, 462, 422), -- Blue
(18, 5, 436, 399) -- Red
ON CONFLICT DO NOTHING;

-- Club Amenities for La Moraleja
INSERT INTO club_amenities (club_id, has_driving_range, has_putting_green, has_chipping_area, has_practice_bunker, has_pro_shop, has_restaurant, has_bar, has_cart_rental, has_club_rental, has_caddie_service, has_lessons, has_locker_room) VALUES 
(1, true, true, true, true, true, true, true, true, true, true, true, true)
ON CONFLICT (club_id) DO NOTHING;

-- Reset sequences to continue from the last ID
SELECT setval('countries_id_seq', (SELECT MAX(id) FROM countries));
SELECT setval('regions_id_seq', (SELECT MAX(id) FROM regions));
SELECT setval('golf_clubs_id_seq', (SELECT MAX(id) FROM golf_clubs));
SELECT setval('golf_courses_id_seq', (SELECT MAX(id) FROM golf_courses));
SELECT setval('tee_boxes_id_seq', (SELECT MAX(id) FROM tee_boxes));
SELECT setval('holes_id_seq', (SELECT MAX(id) FROM holes));
SELECT setval('hole_distances_id_seq', (SELECT MAX(id) FROM hole_distances));
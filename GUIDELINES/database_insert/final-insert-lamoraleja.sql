-- La Moraleja Golf Club Database Inserts
-- Complete data for all 4 courses plus pitch & putt
-- Generated: 2025-08-26

-- Countries
INSERT INTO countries (id, code, code3, name, continent) VALUES 
(1, 'ES', 'ESP', 'Spain', 'Europe');

-- Regions
INSERT INTO regions (id, country_id, code, name, type) VALUES 
(1, 1, 'MAD', 'Madrid', 'autonomous_community');

-- Golf Club
INSERT INTO golf_clubs (id, external_id, slug, name, country_id, region_id, city, address, latitude, longitude, established_year, designer, club_type, has_royal_prefix, website, phone, data_source, confidence_score) VALUES 
(1, 'real-club-la-moraleja', 'real-club-la-moraleja', 'Real Club La Moraleja', 1, 1, 'Alcobendas', 'Paseo del Conde de los Gaitanes, 127', 40.516479, -3.617651, 1973, 'Jack Nicklaus', 'private', true, 'https://www.realclublamoraleja.com', '+34 916 500 700', 'scraping', 0.95);

-- Golf Courses
INSERT INTO golf_courses (id, club_id, name, course_number, course_type, par, holes, designed_year, designer, course_style, latitude, longitude, status) VALUES 
(1, 1, 'La Moraleja Course 1', 1, '18-hole', 72, 18, 1976, 'Jack Nicklaus', 'parkland', 40.516479, -3.617651, 'active'),
(2, 1, 'La Moraleja Course 2', 2, '18-hole', 72, 18, 1990, 'Jack Nicklaus', 'parkland', 40.516479, -3.617651, 'active'),
(3, 1, 'La Moraleja Course 3', 3, '18-hole', 72, 18, 2012, 'Jack Nicklaus', 'parkland', 40.597, -3.497, 'active'),
(4, 1, 'La Moraleja Course 4', 4, '18-hole', 72, 18, 2012, 'Jack Nicklaus', 'parkland', 40.597, -3.497, 'active'),
(5, 1, 'La Moraleja Pitch & Putt', 0, 'pitch-putt', 27, 9, NULL, NULL, 'parkland', 40.516479, -3.617651, 'active');

-- Tee Boxes for Course 1
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(1, 1, 'Black', 'black', 'male', 6407, 5858, 72.0, 140, 0, true),
(2, 1, 'White', 'white', 'male', 5867, 5365, 72.0, 138, 1, false),
(3, 1, 'Yellow', 'yellow', 'male', 5689, 5202, 71.1, 136, 2, false),
(4, 1, 'Blue', 'blue', 'female', 5270, 4819, 74.4, 131, 3, false),
(5, 1, 'Red', 'red', 'female', 4969, 4543, 72.3, 129, 4, false);

-- Tee Boxes for Course 2
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(6, 2, 'Championship', 'black', 'male', 6830, 6245, 72.0, 139, 0, true);

-- Tee Boxes for Course 3
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(7, 3, 'Championship', 'black', 'male', 6830, 6245, 75.6, 133, 0, true);

-- Tee Boxes for Course 4
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(8, 4, 'Black', 'black', 'male', 6487, 5933, 74.1, 136, 0, true),
(9, 4, 'White', 'white', 'male', 6141, 5617, 72.1, 130, 1, false),
(10, 4, 'Yellow', 'yellow', 'male', 5603, 5123, 69.3, 130, 2, false);

-- Tee Box for Pitch & Putt
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(11, 5, 'Single', 'white', 'unisex', 761, 696, 25.7, 68, 0, true);

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
(18, 1, 18, 5, 8);

-- Hole Distances for Course 1, Hole 1
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(1, 1, 390, 357), -- Black
(1, 2, 374, 342), -- White
(1, 3, 362, 331), -- Yellow
(1, 4, 336, 307), -- Blue
(1, 5, 316, 289); -- Red

-- Hole Distances for Course 1, Hole 2
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(2, 1, 210, 192), -- Black
(2, 2, 199, 182), -- White
(2, 3, 193, 177), -- Yellow
(2, 4, 179, 164), -- Blue
(2, 5, 169, 155); -- Red

-- Hole Distances for Course 1, Hole 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(3, 1, 320, 293), -- Black
(3, 2, 308, 282), -- White
(3, 3, 299, 273), -- Yellow
(3, 4, 277, 253), -- Blue
(3, 5, 261, 239); -- Red

-- Hole Distances for Course 1, Hole 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(4, 1, 215, 197), -- Black
(4, 2, 206, 188), -- White
(4, 3, 200, 183), -- Yellow
(4, 4, 185, 169), -- Blue
(4, 5, 175, 160); -- Red

-- Hole Distances for Course 1, Hole 5
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(5, 1, 385, 352), -- Black
(5, 2, 374, 342), -- White
(5, 3, 363, 332), -- Yellow
(5, 4, 336, 307), -- Blue
(5, 5, 317, 290); -- Red

-- Hole Distances for Course 1, Hole 6
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(6, 1, 520, 475), -- Black
(6, 2, 503, 460), -- White
(6, 3, 488, 446), -- Yellow
(6, 4, 452, 413), -- Blue
(6, 5, 426, 389); -- Red

-- Hole Distances for Course 1, Hole 7
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(7, 1, 470, 430), -- Black
(7, 2, 454, 415), -- White
(7, 3, 441, 403), -- Yellow
(7, 4, 408, 373), -- Blue
(7, 5, 385, 352); -- Red

-- Hole Distances for Course 1, Hole 8
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(8, 1, 415, 379), -- Black
(8, 2, 401, 367), -- White
(8, 3, 389, 356), -- Yellow
(8, 4, 360, 329), -- Blue
(8, 5, 340, 311); -- Red

-- Hole Distances for Course 1, Hole 9
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(9, 1, 535, 489), -- Black
(9, 2, 519, 474), -- White
(9, 3, 504, 461), -- Yellow
(9, 4, 467, 427), -- Blue
(9, 5, 440, 402); -- Red

-- Hole Distances for Course 1, Hole 10
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(10, 1, 358, 327), -- Black
(10, 2, 346, 316), -- White
(10, 3, 336, 307), -- Yellow
(10, 4, 311, 284), -- Blue
(10, 5, 293, 268); -- Red

-- Hole Distances for Course 1, Hole 11
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(11, 1, 365, 334), -- Black
(11, 2, 353, 323), -- White
(11, 3, 343, 314), -- Yellow
(11, 4, 317, 290), -- Blue
(11, 5, 299, 273); -- Red

-- Hole Distances for Course 1, Hole 12
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(12, 1, 570, 521), -- Black
(12, 2, 554, 507), -- White
(12, 3, 538, 492), -- Yellow
(12, 4, 498, 455), -- Blue
(12, 5, 470, 430); -- Red

-- Hole Distances for Course 1, Hole 13
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(13, 1, 338, 309), -- Black
(13, 2, 326, 298), -- White
(13, 3, 317, 290), -- Yellow
(13, 4, 293, 268), -- Blue
(13, 5, 276, 252); -- Red

-- Hole Distances for Course 1, Hole 14
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(14, 1, 322, 294), -- Black
(14, 2, 311, 284), -- White
(14, 3, 302, 276), -- Yellow
(14, 4, 280, 256), -- Blue
(14, 5, 264, 241); -- Red

-- Hole Distances for Course 1, Hole 15
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(15, 1, 180, 165), -- Black
(15, 2, 174, 159), -- White
(15, 3, 169, 155), -- Yellow
(15, 4, 156, 143), -- Blue
(15, 5, 147, 134); -- Red

-- Hole Distances for Course 1, Hole 16
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(16, 1, 323, 295), -- Black
(16, 2, 312, 285), -- White
(16, 3, 303, 277), -- Yellow
(16, 4, 281, 257), -- Blue
(16, 5, 265, 242); -- Red

-- Hole Distances for Course 1, Hole 17
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(17, 1, 179, 164), -- Black
(17, 2, 173, 158), -- White
(17, 3, 168, 154), -- Yellow
(17, 4, 155, 142), -- Blue
(17, 5, 146, 134); -- Red

-- Hole Distances for Course 1, Hole 18
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(18, 1, 536, 490), -- Black
(18, 2, 520, 475), -- White
(18, 3, 505, 462), -- Yellow
(18, 4, 468, 428), -- Blue
(18, 5, 441, 403); -- Red

-- Course Rankings
INSERT INTO course_rankings (course_id, ranking_organization, ranking_type, ranking_scope, rank, total_ranked, year) VALUES 
(1, 'Golf Digest Spain', 'national', 'spain', 44, 100, 2025),
(2, 'Golf Digest Spain', 'national', 'spain', 60, 100, 2025),
(3, 'Golf Digest Spain', 'national', 'spain', 8, 100, 2025),
(3, 'Golf World', 'continental', 'europe', 60, 200, 2025),
(4, 'Golf Digest Spain', 'national', 'spain', 17, 100, 2025),
(4, 'Golf World', 'continental', 'europe', 186, 200, 2025);

-- Holes for Course 2
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(19, 2, 1, 5, 11),
(20, 2, 2, 4, 5),
(21, 2, 3, 3, 15),
(22, 2, 4, 4, 1),
(23, 2, 5, 4, 3),
(24, 2, 6, 5, 17),
(25, 2, 7, 4, 7),
(26, 2, 8, 3, 13),
(27, 2, 9, 4, 9),
(28, 2, 10, 4, 10),
(29, 2, 11, 3, 18),
(30, 2, 12, 4, 2),
(31, 2, 13, 5, 14),
(32, 2, 14, 4, 8),
(33, 2, 15, 4, 4),
(34, 2, 16, 4, 12),
(35, 2, 17, 3, 16),
(36, 2, 18, 5, 6);

-- Hole Distances for Course 2 (Championship Tee)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(19, 6, 530, 485), -- Hole 1
(20, 6, 420, 384), -- Hole 2
(21, 6, 190, 174), -- Hole 3
(22, 6, 450, 411), -- Hole 4
(23, 6, 410, 375), -- Hole 5
(24, 6, 540, 494), -- Hole 6
(25, 6, 380, 347), -- Hole 7
(26, 6, 170, 155), -- Hole 8
(27, 6, 400, 366), -- Hole 9
(28, 6, 390, 357), -- Hole 10
(29, 6, 200, 183), -- Hole 11
(30, 6, 440, 402), -- Hole 12
(31, 6, 550, 503), -- Hole 13
(32, 6, 370, 338), -- Hole 14
(33, 6, 360, 329), -- Hole 15
(34, 6, 430, 393), -- Hole 16
(35, 6, 210, 192), -- Hole 17
(36, 6, 560, 512); -- Hole 18

-- Holes for Course 3
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(37, 3, 1, 4, 9),
(38, 3, 2, 4, 3),
(39, 3, 3, 5, 15),
(40, 3, 4, 3, 11),
(41, 3, 5, 4, 7),
(42, 3, 6, 4, 1),
(43, 3, 7, 3, 17),
(44, 3, 8, 5, 13),
(45, 3, 9, 4, 5),
(46, 3, 10, 4, 10),
(47, 3, 11, 4, 2),
(48, 3, 12, 5, 16),
(49, 3, 13, 3, 14),
(50, 3, 14, 4, 4),
(51, 3, 15, 4, 8),
(52, 3, 16, 4, 6),
(53, 3, 17, 3, 18),
(54, 3, 18, 5, 12);

-- Hole Distances for Course 3 (Championship Tee)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(37, 7, 400, 366), -- Hole 1
(38, 7, 440, 402), -- Hole 2
(39, 7, 520, 475), -- Hole 3
(40, 7, 180, 165), -- Hole 4
(41, 7, 380, 347), -- Hole 5
(42, 7, 470, 430), -- Hole 6
(43, 7, 170, 155), -- Hole 7
(44, 7, 540, 494), -- Hole 8
(45, 7, 410, 375), -- Hole 9
(46, 7, 420, 384), -- Hole 10
(47, 7, 460, 421), -- Hole 11
(48, 7, 530, 485), -- Hole 12
(49, 7, 190, 174), -- Hole 13
(50, 7, 390, 357), -- Hole 14
(51, 7, 430, 393), -- Hole 15
(52, 7, 450, 411), -- Hole 16
(53, 7, 160, 146), -- Hole 17
(54, 7, 550, 503); -- Hole 18

-- Holes for Course 4
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(55, 4, 1, 4, 11),
(56, 4, 2, 5, 7),
(57, 4, 3, 4, 3),
(58, 4, 4, 3, 17),
(59, 4, 5, 4, 1),
(60, 4, 6, 4, 13),
(61, 4, 7, 5, 15),
(62, 4, 8, 3, 9),
(63, 4, 9, 4, 5),
(64, 4, 10, 4, 12),
(65, 4, 11, 4, 4),
(66, 4, 12, 5, 16),
(67, 4, 13, 4, 2),
(68, 4, 14, 3, 14),
(69, 4, 15, 4, 8),
(70, 4, 16, 4, 6),
(71, 4, 17, 3, 18),
(72, 4, 18, 5, 10);

-- Hole Distances for Course 4, Hole 1
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(55, 8, 370, 338), -- Black
(55, 9, 350, 320), -- White
(55, 10, 320, 293); -- Yellow

-- Hole Distances for Course 4, Hole 2
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(56, 8, 510, 466), -- Black
(56, 9, 480, 439), -- White
(56, 10, 440, 402); -- Yellow

-- Hole Distances for Course 4, Hole 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(57, 8, 430, 393), -- Black
(57, 9, 405, 370), -- White
(57, 10, 370, 338); -- Yellow

-- Hole Distances for Course 4, Hole 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(58, 8, 160, 146), -- Black
(58, 9, 150, 137), -- White
(58, 10, 137, 125); -- Yellow

-- Hole Distances for Course 4, Hole 5
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(59, 8, 460, 421), -- Black
(59, 9, 435, 398), -- White
(59, 10, 397, 363); -- Yellow

-- Hole Distances for Course 4, Hole 6
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(60, 8, 385, 352), -- Black
(60, 9, 363, 332), -- White
(60, 10, 332, 304); -- Yellow

-- Hole Distances for Course 4, Hole 7
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(61, 8, 530, 485), -- Black
(61, 9, 501, 458), -- White
(61, 10, 457, 418); -- Yellow

-- Hole Distances for Course 4, Hole 8
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(62, 8, 195, 178), -- Black
(62, 9, 184, 168), -- White
(62, 10, 168, 154); -- Yellow

-- Hole Distances for Course 4, Hole 9
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(63, 8, 420, 384), -- Black
(63, 9, 397, 363), -- White
(63, 10, 362, 331); -- Yellow

-- Hole Distances for Course 4, Hole 10
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(64, 8, 380, 347), -- Black
(64, 9, 359, 328), -- White
(64, 10, 328, 300); -- Yellow

-- Hole Distances for Course 4, Hole 11
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(65, 8, 440, 402), -- Black
(65, 9, 416, 380), -- White
(65, 10, 380, 347); -- Yellow

-- Hole Distances for Course 4, Hole 12
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(66, 8, 500, 457), -- Black
(66, 9, 472, 432), -- White
(66, 10, 431, 394); -- Yellow

-- Hole Distances for Course 4, Hole 13
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(67, 8, 450, 411), -- Black
(67, 9, 425, 389), -- White
(67, 10, 388, 355); -- Yellow

-- Hole Distances for Course 4, Hole 14
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(68, 8, 172, 157), -- Black
(68, 9, 162, 148), -- White
(68, 10, 148, 135); -- Yellow

-- Hole Distances for Course 4, Hole 15
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(69, 8, 395, 361), -- Black
(69, 9, 373, 341), -- White
(69, 10, 341, 312); -- Yellow

-- Hole Distances for Course 4, Hole 16
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(70, 8, 410, 375), -- Black
(70, 9, 387, 354), -- White
(70, 10, 354, 324); -- Yellow

-- Hole Distances for Course 4, Hole 17
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(71, 8, 210, 192), -- Black
(71, 9, 198, 181), -- White
(71, 10, 181, 166); -- Yellow

-- Hole Distances for Course 4, Hole 18
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(72, 8, 540, 494), -- Black
(72, 9, 510, 466), -- White
(72, 10, 466, 426); -- Yellow

-- Holes for Pitch & Putt Course
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(73, 5, 1, 3, 5),
(74, 5, 2, 3, 3),
(75, 5, 3, 3, 7),
(76, 5, 4, 3, 1),
(77, 5, 5, 3, 9),
(78, 5, 6, 3, 4),
(79, 5, 7, 3, 8),
(80, 5, 8, 3, 2),
(81, 5, 9, 3, 6);

-- Hole Distances for Pitch & Putt
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(73, 11, 95, 87),  -- Hole 1
(74, 11, 85, 78),  -- Hole 2
(75, 11, 75, 69),  -- Hole 3
(76, 11, 100, 91), -- Hole 4
(77, 11, 70, 64),  -- Hole 5
(78, 11, 90, 82),  -- Hole 6
(79, 11, 80, 73),  -- Hole 7
(80, 11, 96, 88),  -- Hole 8
(81, 11, 70, 64);  -- Hole 9

-- Club Amenities
INSERT INTO club_amenities (club_id, has_driving_range, has_putting_green, has_chipping_area, has_practice_bunker, has_pro_shop, has_restaurant, has_bar, has_cart_rental, has_club_rental, has_caddie_service, has_lessons, has_locker_room) VALUES 
(1, true, true, true, true, true, true, true, true, true, true, true, true);

-- ============================================
-- VIEWS FOR SCORECARD ACCESS
-- ============================================

-- Complete scorecard view with all tee distances
CREATE VIEW v_scorecards AS
SELECT 
    gc.name as course_name,
    gc.course_number,
    gc.par as course_par,
    h.hole_number,
    h.par as hole_par,
    h.handicap_index,
    tb.name as tee_name,
    tb.color as tee_color,
    tb.gender as tee_gender,
    tb.course_rating,
    tb.slope_rating,
    hd.yards,
    hd.meters
FROM golf_courses gc
JOIN holes h ON gc.id = h.course_id
JOIN hole_distances hd ON h.id = hd.hole_id
JOIN tee_boxes tb ON hd.tee_box_id = tb.id
WHERE gc.club_id = 1
ORDER BY gc.course_number, h.hole_number, tb.display_order;

-- Front Nine Summary
CREATE VIEW v_front_nine_summary AS
SELECT 
    gc.name as course_name,
    tb.name as tee_name,
    tb.color as tee_color,
    SUM(h.par) as front_nine_par,
    SUM(hd.yards) as front_nine_yards,
    SUM(hd.meters) as front_nine_meters
FROM golf_courses gc
JOIN holes h ON gc.id = h.course_id
JOIN hole_distances hd ON h.id = hd.hole_id
JOIN tee_boxes tb ON hd.tee_box_id = tb.id
WHERE gc.club_id = 1 AND h.hole_number <= 9
GROUP BY gc.id, tb.id
ORDER BY gc.course_number, tb.display_order;

-- Back Nine Summary
CREATE VIEW v_back_nine_summary AS
SELECT 
    gc.name as course_name,
    tb.name as tee_name,
    tb.color as tee_color,
    SUM(h.par) as back_nine_par,
    SUM(hd.yards) as back_nine_yards,
    SUM(hd.meters) as back_nine_meters
FROM golf_courses gc
JOIN holes h ON gc.id = h.course_id
JOIN hole_distances hd ON h.id = hd.hole_id
JOIN tee_boxes tb ON hd.tee_box_id = tb.id
WHERE gc.club_id = 1 AND h.hole_number > 9
GROUP BY gc.id, tb.id
ORDER BY gc.course_number, tb.display_order;

-- Course Totals by Tee
CREATE VIEW v_course_totals AS
SELECT 
    gc.name as course_name,
    gc.course_number,
    tb.name as tee_name,
    tb.color as tee_color,
    tb.gender,
    gc.par as course_par,
    tb.total_yards,
    tb.total_meters,
    tb.course_rating,
    tb.slope_rating,
    COUNT(DISTINCT h.id) as holes_count
FROM golf_courses gc
JOIN tee_boxes tb ON gc.id = tb.course_id
LEFT JOIN holes h ON gc.id = h.course_id
WHERE gc.club_id = 1
GROUP BY gc.id, tb.id
ORDER BY gc.course_number, tb.display_order;

-- Standard Scorecard Format (Most Common Tees)
CREATE VIEW v_standard_scorecard AS
SELECT 
    gc.name as course_name,
    h.hole_number,
    h.par,
    h.handicap_index as hcp,
    MAX(CASE WHEN tb.color = 'black' THEN hd.yards END) as black_yards,
    MAX(CASE WHEN tb.color = 'white' THEN hd.yards END) as white_yards,
    MAX(CASE WHEN tb.color = 'yellow' THEN hd.yards END) as yellow_yards,
    MAX(CASE WHEN tb.color = 'blue' THEN hd.yards END) as blue_yards,
    MAX(CASE WHEN tb.color = 'red' THEN hd.yards END) as red_yards
FROM golf_courses gc
JOIN holes h ON gc.id = h.course_id
LEFT JOIN hole_distances hd ON h.id = hd.hole_id
LEFT JOIN tee_boxes tb ON hd.tee_box_id = tb.id
WHERE gc.club_id = 1
GROUP BY gc.id, h.id
ORDER BY gc.course_number, h.hole_number;
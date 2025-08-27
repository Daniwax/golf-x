-- Tee Boxes Table Inserts
-- Table: tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, front_nine_rating, front_nine_slope, back_nine_rating, back_nine_slope, display_order, is_default)

-- Course 1 Tee Boxes - Data from official scorecard
-- Note: Missing Black tees data - will need to be updated when available
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, front_nine_rating, front_nine_slope, back_nine_rating, back_nine_slope, display_order, is_default) VALUES 
-- White Tees (Blancas)
(1, 1, 'White', 'white', 'male', 6455, 5898, 71.6, 142, 36.2, 147, 35.4, 138, 0, true),
-- Yellow Tees (Amarillas) 
(2, 1, 'Yellow', 'yellow', 'male', 6232, 5701, 70.5, 140, 35.8, 145, 34.7, 135, 1, false),
-- Blue Tees (Azules) - Ladies
(3, 1, 'Blue', 'blue', 'female', 5601, 5122, 67.4, 123, 34.1, 123, 33.3, 124, 2, false),
-- Red Tees (Rojas) - Ladies
(4, 1, 'Red', 'red', 'female', 5305, 4851, 65.9, 119, 33.5, 120, 32.4, 117, 3, false)
ON CONFLICT (id) DO NOTHING;

-- Course 2 Tee Boxes
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(6, 2, 'Championship', 'black', 'male', 6830, 6245, 72.0, 139, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Course 3 Tee Boxes
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(7, 3, 'Championship', 'black', 'male', 6830, 6245, 75.6, 133, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Course 4 Tee Boxes
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(8, 4, 'Black', 'black', 'male', 6487, 5933, 74.1, 136, 0, true),
(9, 4, 'White', 'white', 'male', 6141, 5617, 72.1, 130, 1, false),
(10, 4, 'Yellow', 'yellow', 'male', 5603, 5123, 69.3, 130, 2, false)
ON CONFLICT (id) DO NOTHING;

-- Pitch & Putt Tee Box
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(11, 5, 'Single', 'white', 'unisex', 761, 696, 25.7, 68, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('tee_boxes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM tee_boxes));
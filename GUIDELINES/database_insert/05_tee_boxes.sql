-- Tee Boxes Table Inserts
-- Table: tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default)

-- Course 1 Tee Boxes
INSERT INTO tee_boxes (id, course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(1, 1, 'Black', 'black', 'male', 6407, 5858, 72.0, 140, 0, true),
(2, 1, 'White', 'white', 'male', 5867, 5365, 72.0, 138, 1, false),
(3, 1, 'Yellow', 'yellow', 'male', 5689, 5202, 71.1, 136, 2, false),
(4, 1, 'Blue', 'blue', 'female', 5270, 4819, 74.4, 131, 3, false),
(5, 1, 'Red', 'red', 'female', 4969, 4543, 72.3, 129, 4, false)
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
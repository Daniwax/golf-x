-- La Moraleja Complete Scorecard Data
-- All 4 courses with full hole details
-- Generated: 2025-08-26

-- ==================================================
-- COURSE 2 - COMPLETE SCORECARD
-- ==================================================

-- Update Course 2 total yardages
UPDATE golf_courses SET total_yardage = 6390, total_meters = 5841 WHERE id = 2;

-- Update Tee Boxes for Course 2 (replacing generic one)
DELETE FROM tee_boxes WHERE course_id = 2;
INSERT INTO tee_boxes (course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(2, 'Blanco', 'white', 'male', 6390, 5841, 72.0, 139, 0, true),
(2, 'Amarillas', 'yellow', 'male', 5909, 5403, 70.1, 135, 1, false),
(2, 'Azul', 'blue', 'female', 5450, 4983, 73.8, 132, 2, false),
(2, 'Rojas', 'red', 'female', 5149, 4708, 71.9, 128, 3, false);

-- Holes for Course 2
INSERT INTO holes (course_id, hole_number, par, handicap_index) VALUES 
(2, 1, 4, 5),
(2, 2, 4, 9),
(2, 3, 4, 15),
(2, 4, 3, 13),
(2, 5, 4, 3),
(2, 6, 5, 1),
(2, 7, 3, 7),
(2, 8, 5, 11),
(2, 9, 4, 17),
(2, 10, 4, 6),
(2, 11, 4, 10),
(2, 12, 3, 16),
(2, 13, 4, 14),
(2, 14, 5, 4),
(2, 15, 4, 2),
(2, 16, 4, 8),
(2, 17, 3, 18),
(2, 18, 5, 12);

-- Hole Distances for Course 2 (White/Blanco tees shown, others follow similar pattern)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
-- Front Nine
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 1), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 371, 339),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 2), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 357, 326),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 3), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 328, 300),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 4), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 158, 144),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 5), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 380, 347),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 6), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 526, 481),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 7), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 212, 194),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 8), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 491, 449),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 9), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 377, 345),
-- Back Nine
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 10), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 385, 352),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 11), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 362, 331),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 12), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 190, 174),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 13), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 358, 327),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 14), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 512, 468),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 15), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 401, 366),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 16), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 372, 340),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 17), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 185, 169),
((SELECT id FROM holes WHERE course_id = 2 AND hole_number = 18), (SELECT id FROM tee_boxes WHERE course_id = 2 AND color = 'white'), 525, 480);

-- ==================================================
-- COURSE 3 - COMPLETE SCORECARD
-- ==================================================

-- Update Course 3 total yardages
UPDATE golf_courses SET total_yardage = 6830, total_meters = 6245 WHERE id = 3;

-- Update Tee Boxes for Course 3
DELETE FROM tee_boxes WHERE course_id = 3;
INSERT INTO tee_boxes (course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(3, 'Negras', 'black', 'male', 6830, 6245, 75.6, 133, 0, true),
(3, 'Blancas', 'white', 'male', 6440, 5888, 73.2, 130, 1, false),
(3, 'Amarillas', 'yellow', 'male', 5932, 5424, 70.8, 127, 2, false),
(3, 'Azules', 'blue', 'female', 5241, 4792, 74.2, 128, 3, false),
(3, 'Rojas', 'red', 'female', 4635, 4238, 71.5, 124, 4, false);

-- Holes for Course 3
INSERT INTO holes (course_id, hole_number, par, handicap_index) VALUES 
(3, 1, 4, 11),
(3, 2, 5, 9),
(3, 3, 4, 1),
(3, 4, 3, 17),
(3, 5, 5, 18),
(3, 6, 4, 12),
(3, 7, 3, 13),
(3, 8, 4, 14),
(3, 9, 4, 7),
(3, 10, 4, 16),
(3, 11, 3, 5),
(3, 12, 4, 4),
(3, 13, 5, 6),
(3, 14, 4, 2),
(3, 15, 5, 8),
(3, 16, 3, 15),
(3, 17, 4, 10),
(3, 18, 4, 3);

-- Hole Distances for Course 3 (Black/Negras tees)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
-- Front Nine
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 1), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 384, 351),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 2), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 527, 482),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 3), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 441, 403),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 4), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 186, 170),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 5), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 508, 464),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 6), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 422, 386),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 7), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 175, 160),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 8), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 322, 294),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 9), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 408, 373),
-- Back Nine
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 10), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 370, 338),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 11), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 178, 163),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 12), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 450, 411),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 13), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 558, 510),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 14), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 449, 411),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 15), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 488, 446),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 16), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 215, 197),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 17), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 343, 314),
((SELECT id FROM holes WHERE course_id = 3 AND hole_number = 18), (SELECT id FROM tee_boxes WHERE course_id = 3 AND color = 'black'), 406, 371);

-- ==================================================
-- COURSE 4 - COMPLETE SCORECARD
-- ==================================================

-- Update Course 4 total yardages (already correct)
UPDATE golf_courses SET total_yardage = 6487, total_meters = 5933 WHERE id = 4;

-- Update Tee Boxes for Course 4 (refining existing)
DELETE FROM tee_boxes WHERE course_id = 4;
INSERT INTO tee_boxes (course_id, name, color, gender, total_yards, total_meters, course_rating, slope_rating, display_order, is_default) VALUES 
(4, 'Negras', 'black', 'male', 6487, 5933, 74.1, 136, 0, true),
(4, 'Blancas', 'white', 'male', 6141, 5615, 72.1, 130, 1, false),
(4, 'Amarillas', 'yellow', 'male', 5603, 5123, 69.3, 130, 2, false),
(4, 'Azules', 'blue', 'female', 4982, 4556, 72.8, 128, 3, false),
(4, 'Rojas', 'red', 'female', 4507, 4121, 70.2, 124, 4, false);

-- Holes for Course 4
INSERT INTO holes (course_id, hole_number, par, handicap_index) VALUES 
(4, 1, 4, 7),
(4, 2, 4, 13),
(4, 3, 5, 10),
(4, 4, 4, 15),
(4, 5, 5, 5),
(4, 6, 4, 4),
(4, 7, 3, 12),
(4, 8, 4, 1),
(4, 9, 3, 17),
(4, 10, 5, 11),
(4, 11, 5, 14),
(4, 12, 4, 3),
(4, 13, 4, 6),
(4, 14, 3, 9),
(4, 15, 4, 16),
(4, 16, 3, 18),
(4, 17, 4, 8),
(4, 18, 4, 2);

-- Hole Distances for Course 4 (Black/Negras tees)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
-- Front Nine
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 1), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 394, 360),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 2), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 289, 264),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 3), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 467, 427),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 4), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 347, 317),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 5), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 566, 517),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 6), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 356, 325),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 7), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 111, 101),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 8), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 436, 399),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 9), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 196, 179),
-- Back Nine
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 10), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 523, 478),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 11), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 526, 481),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 12), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 407, 372),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 13), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 428, 391),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 14), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 228, 209),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 15), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 301, 275),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 16), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 166, 152),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 17), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 360, 329),
((SELECT id FROM holes WHERE course_id = 4 AND hole_number = 18), (SELECT id FROM tee_boxes WHERE course_id = 4 AND color = 'black'), 386, 353);

-- ==================================================
-- SCORECARD VIEWS FOR EASY ACCESS
-- ==================================================

CREATE VIEW scorecard_course_1 AS
SELECT 
    h.hole_number,
    h.par,
    h.handicap_index as SI,
    MAX(CASE WHEN t.color = 'black' THEN hd.yards END) as black_yards,
    MAX(CASE WHEN t.color = 'white' THEN hd.yards END) as white_yards,
    MAX(CASE WHEN t.color = 'yellow' THEN hd.yards END) as yellow_yards,
    MAX(CASE WHEN t.color = 'blue' THEN hd.yards END) as blue_yards,
    MAX(CASE WHEN t.color = 'red' THEN hd.yards END) as red_yards
FROM holes h
LEFT JOIN hole_distances hd ON h.id = hd.hole_id
LEFT JOIN tee_boxes t ON hd.tee_box_id = t.id
WHERE h.course_id = 1
GROUP BY h.hole_number
ORDER BY h.hole_number;

CREATE VIEW scorecard_course_2 AS
SELECT 
    h.hole_number,
    h.par,
    h.handicap_index as SI,
    MAX(CASE WHEN t.color = 'white' THEN hd.yards END) as white_yards,
    MAX(CASE WHEN t.color = 'yellow' THEN hd.yards END) as yellow_yards,
    MAX(CASE WHEN t.color = 'blue' THEN hd.yards END) as blue_yards,
    MAX(CASE WHEN t.color = 'red' THEN hd.yards END) as red_yards
FROM holes h
LEFT JOIN hole_distances hd ON h.id = hd.hole_id
LEFT JOIN tee_boxes t ON hd.tee_box_id = t.id
WHERE h.course_id = 2
GROUP BY h.hole_number
ORDER BY h.hole_number;

CREATE VIEW scorecard_course_3 AS
SELECT 
    h.hole_number,
    h.par,
    h.handicap_index as SI,
    MAX(CASE WHEN t.color = 'black' THEN hd.yards END) as black_yards,
    MAX(CASE WHEN t.color = 'white' THEN hd.yards END) as white_yards,
    MAX(CASE WHEN t.color = 'yellow' THEN hd.yards END) as yellow_yards,
    MAX(CASE WHEN t.color = 'blue' THEN hd.yards END) as blue_yards,
    MAX(CASE WHEN t.color = 'red' THEN hd.yards END) as red_yards
FROM holes h
LEFT JOIN hole_distances hd ON h.id = hd.hole_id
LEFT JOIN tee_boxes t ON hd.tee_box_id = t.id
WHERE h.course_id = 3
GROUP BY h.hole_number
ORDER BY h.hole_number;

CREATE VIEW scorecard_course_4 AS
SELECT 
    h.hole_number,
    h.par,
    h.handicap_index as SI,
    MAX(CASE WHEN t.color = 'black' THEN hd.yards END) as black_yards,
    MAX(CASE WHEN t.color = 'white' THEN hd.yards END) as white_yards,
    MAX(CASE WHEN t.color = 'yellow' THEN hd.yards END) as yellow_yards,
    MAX(CASE WHEN t.color = 'blue' THEN hd.yards END) as blue_yards,
    MAX(CASE WHEN t.color = 'red' THEN hd.yards END) as red_yards
FROM holes h
LEFT JOIN hole_distances hd ON h.id = hd.hole_id
LEFT JOIN tee_boxes t ON hd.tee_box_id = t.id
WHERE h.course_id = 4
GROUP BY h.hole_number
ORDER BY h.hole_number;

-- Summary view for all courses
CREATE VIEW course_scorecards_summary AS
SELECT 
    c.name as course_name,
    c.par,
    COUNT(DISTINCT h.id) as holes,
    COUNT(DISTINCT t.id) as tee_options,
    MIN(t.total_yards) as shortest_tees,
    MAX(t.total_yards) as longest_tees,
    MIN(t.course_rating) as easiest_rating,
    MAX(t.course_rating) as hardest_rating,
    MIN(t.slope_rating) as min_slope,
    MAX(t.slope_rating) as max_slope
FROM golf_courses c
JOIN holes h ON c.id = h.course_id
JOIN tee_boxes t ON c.id = t.course_id
WHERE c.club_id = 1
GROUP BY c.id;
-- Holes Table Inserts
-- Table: holes (id, course_id, hole_number, par, handicap_index)

-- Course 1 Holes (18 holes)
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

-- Note: Course 2, 3, and 4 holes need to be added when data is available
-- Pitch & Putt (Course 5) holes need to be added when data is available

-- Reset sequence
SELECT setval('holes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM holes));
-- Holes Table Inserts for Course 3
-- Table: holes (id, course_id, hole_number, par, handicap_index)

-- Course 3 Holes (18 holes) - IDs 37-54
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(37, 3, 1, 4, 11),
(38, 3, 2, 5, 6),
(39, 3, 3, 4, 1),
(40, 3, 4, 3, 17),
(41, 3, 5, 5, 18),
(42, 3, 6, 4, 12),
(43, 3, 7, 3, 13),
(44, 3, 8, 4, 14),
(45, 3, 9, 4, 7),
(46, 3, 10, 4, 16),
(47, 3, 11, 3, 5),
(48, 3, 12, 4, 4),
(49, 3, 13, 5, 9),
(50, 3, 14, 4, 2),
(51, 3, 15, 5, 8),
(52, 3, 16, 3, 15),
(53, 3, 17, 4, 10),
(54, 3, 18, 4, 3)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('holes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM holes));
-- Holes Table Inserts for Course 2
-- Table: holes (id, course_id, hole_number, par, handicap_index)

-- Course 2 Holes (18 holes) - IDs 19-36
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(19, 2, 1, 4, 4),
(20, 2, 2, 4, 12),
(21, 2, 3, 4, 14),
(22, 2, 4, 3, 5),
(23, 2, 5, 4, 6),
(24, 2, 6, 5, 3),
(25, 2, 7, 3, 10),
(26, 2, 8, 5, 9),
(27, 2, 9, 4, 16),
(28, 2, 10, 4, 17),
(29, 2, 11, 5, 11),
(30, 2, 12, 4, 8),
(31, 2, 13, 3, 18),
(32, 2, 14, 4, 13),
(33, 2, 15, 4, 2),
(34, 2, 16, 5, 7),
(35, 2, 17, 3, 15),
(36, 2, 18, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('holes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM holes));
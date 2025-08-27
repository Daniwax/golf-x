-- Holes Table Inserts for Course 4
-- Table: holes (id, course_id, hole_number, par, handicap_index)

-- Course 4 Holes (18 holes) - IDs 55-72
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(55, 4, 1, 4, 7),
(56, 4, 2, 4, 13),
(57, 4, 3, 5, 10),
(58, 4, 4, 4, 15),
(59, 4, 5, 5, 5),
(60, 4, 6, 4, 4),
(61, 4, 7, 3, 12),
(62, 4, 8, 4, 1),
(63, 4, 9, 3, 17),
(64, 4, 10, 5, 11),
(65, 4, 11, 5, 14),
(66, 4, 12, 4, 3),
(67, 4, 13, 4, 6),
(68, 4, 14, 3, 9),
(69, 4, 15, 4, 16),
(70, 4, 16, 3, 18),
(71, 4, 17, 4, 8),
(72, 4, 18, 4, 2)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('holes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM holes));
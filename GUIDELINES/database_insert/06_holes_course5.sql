-- Holes Table Inserts for Course 5 (Pitch & Putt)
-- Table: holes (id, course_id, hole_number, par, handicap_index)

-- Course 5 Pitch & Putt Holes (18 holes) - IDs 73-90
INSERT INTO holes (id, course_id, hole_number, par, handicap_index) VALUES 
(73, 5, 1, 3, 11),
(74, 5, 2, 3, 5),
(75, 5, 3, 3, 15),
(76, 5, 4, 3, 3),
(77, 5, 5, 3, 9),
(78, 5, 6, 3, 17),
(79, 5, 7, 3, 13),
(80, 5, 8, 3, 7),
(81, 5, 9, 3, 1),
(82, 5, 10, 3, 12),
(83, 5, 11, 3, 6),
(84, 5, 12, 3, 16),
(85, 5, 13, 3, 4),
(86, 5, 14, 3, 10),
(87, 5, 15, 3, 18),
(88, 5, 16, 3, 14),
(89, 5, 17, 3, 8),
(90, 5, 18, 3, 2)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('holes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM holes));
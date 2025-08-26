-- Hole Distances Table Inserts
-- Table: hole_distances (id, hole_id, tee_box_id, yards, meters)
-- Course 1 Only - Complete 18 holes x 5 tee boxes

-- Hole 1
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(1, 1, 390, 357), -- Black
(1, 2, 374, 342), -- White
(1, 3, 362, 331), -- Yellow
(1, 4, 336, 307), -- Blue
(1, 5, 316, 289); -- Red

-- Hole 2
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(2, 1, 210, 192),
(2, 2, 199, 182),
(2, 3, 193, 177),
(2, 4, 179, 164),
(2, 5, 169, 155);

-- Hole 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(3, 1, 320, 293),
(3, 2, 308, 282),
(3, 3, 299, 273),
(3, 4, 277, 253),
(3, 5, 261, 239);

-- Hole 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(4, 1, 215, 197),
(4, 2, 206, 188),
(4, 3, 200, 183),
(4, 4, 185, 169),
(4, 5, 175, 160);

-- Hole 5
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(5, 1, 385, 352),
(5, 2, 374, 342),
(5, 3, 363, 332),
(5, 4, 336, 307),
(5, 5, 317, 290);

-- Hole 6
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(6, 1, 520, 475),
(6, 2, 503, 460),
(6, 3, 488, 446),
(6, 4, 452, 413),
(6, 5, 426, 389);

-- Hole 7
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(7, 1, 470, 430),
(7, 2, 454, 415),
(7, 3, 441, 403),
(7, 4, 408, 373),
(7, 5, 385, 352);

-- Hole 8
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(8, 1, 415, 379),
(8, 2, 401, 367),
(8, 3, 389, 356),
(8, 4, 360, 329),
(8, 5, 340, 311);

-- Hole 9
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(9, 1, 535, 489),
(9, 2, 519, 474),
(9, 3, 504, 461),
(9, 4, 467, 427),
(9, 5, 440, 402);

-- Hole 10
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(10, 1, 358, 327),
(10, 2, 346, 316),
(10, 3, 336, 307),
(10, 4, 311, 284),
(10, 5, 293, 268);

-- Hole 11
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(11, 1, 365, 334),
(11, 2, 353, 323),
(11, 3, 343, 314),
(11, 4, 317, 290),
(11, 5, 299, 273);

-- Hole 12
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(12, 1, 570, 521),
(12, 2, 554, 507),
(12, 3, 538, 492),
(12, 4, 498, 455),
(12, 5, 470, 430);

-- Hole 13
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(13, 1, 338, 309),
(13, 2, 326, 298),
(13, 3, 317, 290),
(13, 4, 293, 268),
(13, 5, 276, 252);

-- Hole 14
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(14, 1, 322, 294),
(14, 2, 311, 284),
(14, 3, 302, 276),
(14, 4, 280, 256),
(14, 5, 264, 241);

-- Hole 15
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(15, 1, 180, 165),
(15, 2, 174, 159),
(15, 3, 169, 155),
(15, 4, 156, 143),
(15, 5, 147, 134);

-- Hole 16
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(16, 1, 323, 295),
(16, 2, 312, 285),
(16, 3, 303, 277),
(16, 4, 281, 257),
(16, 5, 265, 242);

-- Hole 17
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(17, 1, 185, 169),
(17, 2, 179, 164),
(17, 3, 174, 159),
(17, 4, 161, 147),
(17, 5, 152, 139);

-- Hole 18
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(18, 1, 530, 485),
(18, 2, 514, 470),
(18, 3, 499, 456),
(18, 4, 462, 422),
(18, 5, 436, 399);

-- Reset sequence
SELECT setval('hole_distances_id_seq', (SELECT COALESCE(MAX(id), 0) FROM hole_distances));
-- Hole Distances Table Inserts
-- Table: hole_distances (id, hole_id, tee_box_id, yards, meters)
-- Course 1 - Complete 18 holes x 4 tee boxes (White, Yellow, Blue, Red)
-- Data from official La Moraleja scorecard

-- Hole 1 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(1, 1, 374, 342), -- White
(1, 2, 370, 338), -- Yellow  
(1, 3, 301, 275), -- Blue
(1, 4, 286, 262); -- Red

-- Hole 2 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(2, 1, 194, 177), -- White
(2, 2, 186, 170), -- Yellow
(2, 3, 158, 145), -- Blue
(2, 4, 150, 137); -- Red

-- Hole 3 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(3, 1, 308, 282), -- White
(3, 2, 303, 277), -- Yellow
(3, 3, 251, 230), -- Blue
(3, 4, 250, 229); -- Red

-- Hole 4 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(4, 1, 206, 189), -- White
(4, 2, 191, 175), -- Yellow
(4, 3, 172, 157), -- Blue
(4, 4, 165, 151); -- Red

-- Hole 5 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(5, 1, 374, 342), -- White
(5, 2, 368, 337), -- Yellow
(5, 3, 320, 293), -- Blue
(5, 4, 318, 291); -- Red

-- Hole 6 - Par 5
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(6, 1, 494, 452), -- White
(6, 2, 487, 445), -- Yellow
(6, 3, 460, 421), -- Blue
(6, 4, 432, 395); -- Red

-- Hole 7 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(7, 1, 451, 413), -- White
(7, 2, 441, 403), -- Yellow
(7, 3, 399, 365), -- Blue
(7, 4, 388, 355); -- Red

-- Hole 8 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(8, 1, 404, 370), -- White
(8, 2, 394, 360), -- Yellow
(8, 3, 362, 331), -- Blue
(8, 4, 344, 315); -- Red

-- Hole 9 - Par 5
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(9, 1, 519, 475), -- White
(9, 2, 502, 459), -- Yellow
(9, 3, 443, 405), -- Blue
(9, 4, 419, 383); -- Red

-- Hole 10 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(10, 1, 387, 354), -- White
(10, 2, 361, 330), -- Yellow
(10, 3, 322, 295), -- Blue
(10, 4, 284, 260); -- Red

-- Hole 11 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(11, 1, 382, 350), -- White
(11, 2, 340, 311), -- Yellow
(11, 3, 335, 307), -- Blue
(11, 4, 309, 283); -- Red

-- Hole 12 - Par 5
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(12, 1, 554, 507), -- White
(12, 2, 547, 500), -- Yellow
(12, 3, 521, 477), -- Blue
(12, 4, 474, 434); -- Red

-- Hole 13 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(13, 1, 338, 309), -- White
(13, 2, 317, 290), -- Yellow
(13, 3, 276, 253), -- Blue
(13, 4, 267, 244); -- Red

-- Hole 14 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(14, 1, 311, 285), -- White
(14, 2, 308, 282), -- Yellow
(14, 3, 287, 263), -- Blue
(14, 4, 279, 255); -- Red

-- Hole 15 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(15, 1, 175, 160), -- White
(15, 2, 172, 157), -- Yellow
(15, 3, 132, 121), -- Blue
(15, 4, 125, 114); -- Red

-- Hole 16 - Par 4
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(16, 1, 312, 286), -- White
(16, 2, 306, 280), -- Yellow
(16, 3, 297, 272), -- Blue
(16, 4, 277, 254); -- Red

-- Hole 17 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(17, 1, 174, 159), -- White
(17, 2, 157, 144), -- Yellow
(17, 3, 143, 131), -- Blue
(17, 4, 122, 112); -- Red

-- Hole 18 - Par 5
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(18, 1, 487, 446), -- White
(18, 2, 484, 443), -- Yellow
(18, 3, 416, 381), -- Blue
(18, 4, 412, 377); -- Red

-- Reset sequence
SELECT setval('hole_distances_id_seq', (SELECT COALESCE(MAX(id), 0) FROM hole_distances));
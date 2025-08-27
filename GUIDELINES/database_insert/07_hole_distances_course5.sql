-- Hole Distances Table Inserts for Course 5 (Pitch & Putt)
-- Table: hole_distances (id, hole_id, tee_box_id, yards, meters)
-- Course 5 - Complete 18 holes x 1 tee box (Green)
-- Data from official La Moraleja Pitch & Putt scorecard
-- Note: Holes 10-18 repeat the same physical holes as 1-9

-- Hole 1 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(73, 14, 86, 79); -- Green

-- Hole 2 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(74, 14, 68, 62); -- Green

-- Hole 3 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(75, 14, 85, 78); -- Green

-- Hole 4 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(76, 14, 127, 116); -- Green

-- Hole 5 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(77, 14, 95, 87); -- Green

-- Hole 6 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(78, 14, 63, 58); -- Green

-- Hole 7 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(79, 14, 72, 66); -- Green

-- Hole 8 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(80, 14, 91, 83); -- Green

-- Hole 9 - Par 3
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(81, 14, 125, 114); -- Green

-- Hole 10 - Par 3 (Same as Hole 1)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(82, 14, 86, 79); -- Green

-- Hole 11 - Par 3 (Same as Hole 2)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(83, 14, 68, 62); -- Green

-- Hole 12 - Par 3 (Same as Hole 3)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(84, 14, 85, 78); -- Green

-- Hole 13 - Par 3 (Same as Hole 4)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(85, 14, 127, 116); -- Green

-- Hole 14 - Par 3 (Same as Hole 5)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(86, 14, 95, 87); -- Green

-- Hole 15 - Par 3 (Same as Hole 6)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(87, 14, 63, 58); -- Green

-- Hole 16 - Par 3 (Same as Hole 7)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(88, 14, 72, 66); -- Green

-- Hole 17 - Par 3 (Same as Hole 8)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(89, 14, 91, 83); -- Green

-- Hole 18 - Par 3 (Same as Hole 9)
INSERT INTO hole_distances (hole_id, tee_box_id, yards, meters) VALUES 
(90, 14, 125, 114); -- Green

-- Reset sequence
SELECT setval('hole_distances_id_seq', (SELECT COALESCE(MAX(id), 0) FROM hole_distances));
-- Master file to run all inserts in correct order
-- Run this file in Supabase SQL Editor to insert all data

-- 1. Reference Tables
\i 01_countries.sql
\i 02_regions.sql

-- 2. Main Entities
\i 03_golf_clubs.sql
\i 04_golf_courses.sql

-- 3. Course Details
\i 05_tee_boxes.sql
\i 06_holes.sql
\i 07_hole_distances.sql

-- 4. Supplementary Data
\i 08_club_amenities.sql

-- 5. Images (optional - only if images have been processed)
-- \i insert-images.sql

-- Note: If using Supabase SQL Editor, you may need to copy/paste each file's content
-- instead of using \i include statements
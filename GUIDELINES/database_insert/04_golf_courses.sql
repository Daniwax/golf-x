-- Golf Courses Table Inserts
-- Table: golf_courses (id, club_id, name, course_number, course_type, par, holes, designed_year, designer, course_style, latitude, longitude, status)

INSERT INTO golf_courses (
    id, 
    club_id, 
    name, 
    course_number, 
    course_type, 
    par, 
    holes, 
    designed_year, 
    designer, 
    course_style, 
    latitude, 
    longitude, 
    status
) VALUES 
(1, 1, 'La Moraleja Course 1', 1, '18-hole', 72, 18, 1976, 'Jack Nicklaus', 'parkland', 40.516479, -3.617651, 'active'),
(2, 1, 'La Moraleja Course 2', 2, '18-hole', 72, 18, 1990, 'Jack Nicklaus', 'parkland', 40.516479, -3.617651, 'active'),
(3, 1, 'La Moraleja Course 3', 3, '18-hole', 72, 18, 2012, 'Jack Nicklaus', 'parkland', 40.517000, -3.617000, 'active'),
(4, 1, 'La Moraleja Course 4', 4, '18-hole', 72, 18, 2012, 'Jack Nicklaus', 'parkland', 40.517000, -3.617000, 'active'),
(5, 1, 'La Moraleja Pitch & Putt', 0, 'pitch-putt', 27, 9, NULL, NULL, 'parkland', 40.516479, -3.617651, 'active')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('golf_courses_id_seq', (SELECT COALESCE(MAX(id), 0) FROM golf_courses));
-- Golf Application Database Schema for Supabase (PostgreSQL)
-- Adapted from MySQL schema for Golf X application
-- Created: 2025-08-26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. REFERENCE TABLES (Lookup/Static Data)
-- ============================================

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL, -- ISO 3166-1 alpha-2
    code3 VARCHAR(3),                -- ISO 3166-1 alpha-3
    name VARCHAR(100) NOT NULL,
    continent VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id),
    code VARCHAR(10),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- state, province, autonomous_community, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. MAIN ENTITIES
-- ============================================

CREATE TABLE IF NOT EXISTS golf_clubs (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE,
    slug VARCHAR(200) UNIQUE,
    name VARCHAR(200) NOT NULL,
    
    -- Location
    country_id INTEGER REFERENCES countries(id),
    region_id INTEGER REFERENCES regions(id),
    city VARCHAR(100),
    address VARCHAR(500),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Club Information
    established_year INTEGER,
    designer VARCHAR(200),
    architect VARCHAR(200),
    club_type VARCHAR(20) CHECK (club_type IN ('private', 'public', 'resort', 'semi-private')) DEFAULT 'public',
    has_royal_prefix BOOLEAN DEFAULT FALSE,
    
    -- Contact
    website VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(200),
    booking_url VARCHAR(500),
    
    -- Metadata
    data_source VARCHAR(100),
    source_updated_at TIMESTAMPTZ,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS golf_courses (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES golf_clubs(id) ON DELETE CASCADE,
    external_id VARCHAR(100),
    
    -- Course Information
    name VARCHAR(200) NOT NULL,
    course_number INTEGER,
    course_type VARCHAR(20) CHECK (course_type IN ('18-hole', '9-hole', 'pitch-putt', 'executive', 'championship')) DEFAULT '18-hole',
    
    -- Technical Data
    par INTEGER NOT NULL,
    holes INTEGER NOT NULL DEFAULT 18,
    total_yardage INTEGER,
    total_meters INTEGER,
    
    -- Design
    designed_year INTEGER,
    designer VARCHAR(200),
    course_style VARCHAR(20) CHECK (course_style IN ('parkland', 'links', 'desert', 'mountain', 'heathland', 'coastal')),
    
    -- Location (if different from club)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude_meters INTEGER,
    
    -- Status
    status VARCHAR(20) CHECK (status IN ('active', 'maintenance', 'seasonal', 'permanently_closed')) DEFAULT 'active',
    season_start_month INTEGER CHECK (season_start_month >= 1 AND season_start_month <= 12),
    season_end_month INTEGER CHECK (season_end_month >= 1 AND season_end_month <= 12),
    
    -- Metadata
    booking_url VARCHAR(500),
    scorecard_url VARCHAR(500),
    layout_map_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (club_id, course_number)
);

CREATE TABLE IF NOT EXISTS tee_boxes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Tee Information
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    color_hex VARCHAR(7),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unisex')) DEFAULT 'unisex',
    
    -- Distances
    total_yards INTEGER,
    total_meters INTEGER,
    
    -- Ratings (USGA/R&A System)
    course_rating DECIMAL(4,1),
    slope_rating INTEGER CHECK (slope_rating IS NULL OR (slope_rating >= 55 AND slope_rating <= 155)),
    bogey_rating DECIMAL(4,1),
    
    -- Nine-hole ratings
    front_nine_rating DECIMAL(4,1),  -- Vc (Course Value) for front nine
    front_nine_slope INTEGER,        -- Vs (Slope) for front nine
    front_nine_bogey DECIMAL(4,1),
    back_nine_rating DECIMAL(4,1),   -- Vc (Course Value) for back nine
    back_nine_slope INTEGER,         -- Vs (Slope) for back nine
    back_nine_bogey DECIMAL(4,1),
    
    -- Order
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Hole Information
    hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
    hole_name VARCHAR(100),
    par INTEGER NOT NULL CHECK (par >= 3 AND par <= 6),
    
    -- Handicap/Difficulty
    handicap_index INTEGER CHECK (handicap_index >= 1 AND handicap_index <= 18),
    
    -- Features
    has_water BOOLEAN DEFAULT FALSE,
    has_bunkers BOOLEAN DEFAULT FALSE,
    dogleg_direction VARCHAR(10) CHECK (dogleg_direction IN ('straight', 'left', 'right', 'double')),
    
    -- Description
    notes TEXT,
    signature_hole BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (course_id, hole_number)
);

CREATE TABLE IF NOT EXISTS hole_distances (
    id SERIAL PRIMARY KEY,
    hole_id INTEGER NOT NULL REFERENCES holes(id) ON DELETE CASCADE,
    tee_box_id INTEGER NOT NULL REFERENCES tee_boxes(id) ON DELETE CASCADE,
    
    -- Distances
    yards INTEGER,
    meters INTEGER,
    
    -- Additional measurements
    yards_to_layup INTEGER,
    yards_to_carry INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (hole_id, tee_box_id)
);

-- ============================================
-- 3. SUPPLEMENTARY DATA
-- ============================================

CREATE TABLE IF NOT EXISTS club_amenities (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES golf_clubs(id) ON DELETE CASCADE,
    
    -- Facilities
    has_driving_range BOOLEAN DEFAULT FALSE,
    has_putting_green BOOLEAN DEFAULT FALSE,
    has_chipping_area BOOLEAN DEFAULT FALSE,
    has_practice_bunker BOOLEAN DEFAULT FALSE,
    
    -- Services
    has_pro_shop BOOLEAN DEFAULT FALSE,
    has_restaurant BOOLEAN DEFAULT FALSE,
    has_bar BOOLEAN DEFAULT FALSE,
    has_accommodation BOOLEAN DEFAULT FALSE,
    
    -- Rentals
    has_cart_rental BOOLEAN DEFAULT FALSE,
    has_club_rental BOOLEAN DEFAULT FALSE,
    has_caddie_service BOOLEAN DEFAULT FALSE,
    has_lessons BOOLEAN DEFAULT FALSE,
    
    -- Other
    has_locker_room BOOLEAN DEFAULT FALSE,
    has_conference_facilities BOOLEAN DEFAULT FALSE,
    has_wedding_facilities BOOLEAN DEFAULT FALSE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (club_id)
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_clubs_location ON golf_clubs(country_id, region_id, city);
CREATE INDEX idx_clubs_geo ON golf_clubs(latitude, longitude);
CREATE INDEX idx_courses_club ON golf_courses(club_id);
CREATE INDEX idx_teeboxes_course ON tee_boxes(course_id);
CREATE INDEX idx_holes_course ON holes(course_id);
CREATE INDEX idx_hole_distances_lookup ON hole_distances(hole_id, tee_box_id);
CREATE INDEX idx_regions_country ON regions(country_id);

-- Create text search indexes
CREATE INDEX idx_clubs_name_search ON golf_clubs USING gin(to_tsvector('english', name));

-- ============================================
-- 5. VIEWS FOR COMMON QUERIES
-- ============================================

CREATE OR REPLACE VIEW course_summary AS
SELECT 
    c.id,
    c.name as course_name,
    c.par,
    c.holes,
    cl.name as club_name,
    cl.city,
    r.name as region,
    co.name as country,
    cl.latitude,
    cl.longitude,
    MIN(t.slope_rating) as min_slope,
    MAX(t.slope_rating) as max_slope,
    COUNT(DISTINCT t.id) as tee_box_count
FROM golf_courses c
JOIN golf_clubs cl ON c.club_id = cl.id
LEFT JOIN regions r ON cl.region_id = r.id
LEFT JOIN countries co ON cl.country_id = co.id
LEFT JOIN tee_boxes t ON t.course_id = c.id
GROUP BY c.id, c.name, c.par, c.holes, cl.name, cl.city, r.name, co.name, cl.latitude, cl.longitude;

CREATE OR REPLACE VIEW hole_yardages AS
SELECT 
    h.course_id,
    h.hole_number,
    h.par,
    h.handicap_index,
    MAX(CASE WHEN t.color = 'black' THEN hd.yards END) as black_yards,
    MAX(CASE WHEN t.color = 'blue' THEN hd.yards END) as blue_yards,
    MAX(CASE WHEN t.color = 'white' THEN hd.yards END) as white_yards,
    MAX(CASE WHEN t.color = 'yellow' THEN hd.yards END) as yellow_yards,
    MAX(CASE WHEN t.color = 'red' THEN hd.yards END) as red_yards
FROM holes h
LEFT JOIN hole_distances hd ON h.id = hd.hole_id
LEFT JOIN tee_boxes t ON hd.tee_box_id = t.id
GROUP BY h.id, h.course_id, h.hole_number, h.par, h.handicap_index;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_distances ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_amenities ENABLE ROW LEVEL SECURITY;

-- Public read access for all course data
CREATE POLICY "Public read access for countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Public read access for regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Public read access for clubs" ON golf_clubs FOR SELECT USING (true);
CREATE POLICY "Public read access for courses" ON golf_courses FOR SELECT USING (true);
CREATE POLICY "Public read access for tee boxes" ON tee_boxes FOR SELECT USING (true);
CREATE POLICY "Public read access for holes" ON holes FOR SELECT USING (true);
CREATE POLICY "Public read access for hole distances" ON hole_distances FOR SELECT USING (true);
CREATE POLICY "Public read access for amenities" ON club_amenities FOR SELECT USING (true);

-- Admin-only write access (requires service_role key or admin user)
-- These would be added based on your admin user setup

-- ============================================
-- 7. FUNCTIONS FOR DATA ACCESS
-- ============================================

-- Function to get course with all related data
CREATE OR REPLACE FUNCTION get_course_details(course_id_param INTEGER)
RETURNS TABLE (
    course_data JSON,
    tee_boxes JSON,
    holes JSON,
    hole_distances JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        row_to_json(c.*) as course_data,
        (
            SELECT json_agg(t.*)
            FROM tee_boxes t
            WHERE t.course_id = course_id_param
            ORDER BY t.display_order
        ) as tee_boxes,
        (
            SELECT json_agg(h.* ORDER BY h.hole_number)
            FROM holes h
            WHERE h.course_id = course_id_param
        ) as holes,
        (
            SELECT json_agg(
                json_build_object(
                    'hole_id', hd.hole_id,
                    'tee_box_id', hd.tee_box_id,
                    'yards', hd.yards,
                    'meters', hd.meters
                )
            )
            FROM hole_distances hd
            JOIN holes h ON hd.hole_id = h.id
            WHERE h.course_id = course_id_param
        ) as hole_distances
    FROM golf_courses c
    WHERE c.id = course_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search courses by name or location
CREATE OR REPLACE FUNCTION search_courses(search_term TEXT)
RETURNS TABLE (
    course_id INTEGER,
    course_name TEXT,
    club_name TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    par INTEGER,
    holes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gc.id,
        gc.name::TEXT,
        cl.name::TEXT,
        cl.city::TEXT,
        r.name::TEXT,
        co.name::TEXT,
        gc.par,
        gc.holes
    FROM golf_courses gc
    JOIN golf_clubs cl ON gc.club_id = cl.id
    LEFT JOIN regions r ON cl.region_id = r.id
    LEFT JOIN countries co ON cl.country_id = co.id
    WHERE 
        cl.name ILIKE '%' || search_term || '%' OR
        gc.name ILIKE '%' || search_term || '%' OR
        cl.city ILIKE '%' || search_term || '%' OR
        r.name ILIKE '%' || search_term || '%' OR
        co.name ILIKE '%' || search_term || '%'
    ORDER BY cl.name, gc.course_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
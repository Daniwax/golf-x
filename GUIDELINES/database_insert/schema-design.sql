-- Golf Application Database Schema
-- Optimized for friends golf app with course data
-- Created: 2025-08-25

-- ============================================
-- 1. REFERENCE TABLES (Lookup/Static Data)
-- ============================================

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL, -- ISO 3166-1 alpha-2
    code3 VARCHAR(3),                -- ISO 3166-1 alpha-3
    name VARCHAR(100) NOT NULL,
    continent VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id),
    code VARCHAR(10),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- state, province, autonomous_community, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_country (country_id)
);

-- ============================================
-- 2. MAIN ENTITIES
-- ============================================

CREATE TABLE golf_clubs (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE, -- ID from scraped source
    slug VARCHAR(200) UNIQUE,        -- URL-friendly identifier
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
    club_type ENUM('private', 'public', 'resort', 'semi-private') DEFAULT 'public',
    has_royal_prefix BOOLEAN DEFAULT FALSE,
    
    -- Contact
    website VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(200),
    booking_url VARCHAR(500),
    
    -- Metadata
    data_source VARCHAR(100),        -- golfify, 18birdies, manual, etc.
    source_updated_at TIMESTAMP,
    confidence_score DECIMAL(3,2),   -- 0.00 to 1.00
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_location (latitude, longitude),
    INDEX idx_country_region (country_id, region_id),
    INDEX idx_city (city),
    FULLTEXT KEY idx_name (name)
);

CREATE TABLE golf_courses (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES golf_clubs(id) ON DELETE CASCADE,
    external_id VARCHAR(100),
    
    -- Course Information
    name VARCHAR(200) NOT NULL,
    course_number INTEGER,            -- 1, 2, 3, 4 for multiple courses
    course_type ENUM('18-hole', '9-hole', 'pitch-putt', 'executive', 'championship') DEFAULT '18-hole',
    
    -- Technical Data
    par INTEGER NOT NULL,
    holes INTEGER NOT NULL DEFAULT 18,
    total_yardage INTEGER,
    total_meters INTEGER,
    
    -- Design
    designed_year INTEGER,
    designer VARCHAR(200),
    course_style ENUM('parkland', 'links', 'desert', 'mountain', 'heathland', 'coastal'),
    
    -- Location (if different from club)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude_meters INTEGER,
    
    -- Status
    status ENUM('active', 'maintenance', 'seasonal', 'permanently_closed') DEFAULT 'active',
    season_start_month INTEGER,       -- 1-12
    season_end_month INTEGER,         -- 1-12
    
    -- Metadata
    booking_url VARCHAR(500),
    scorecard_url VARCHAR(500),
    layout_map_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_club (club_id),
    INDEX idx_par_holes (par, holes),
    UNIQUE KEY unique_club_course (club_id, course_number)
);

CREATE TABLE tee_boxes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Tee Information
    name VARCHAR(50) NOT NULL,        -- Championship, Back, Middle, Forward
    color VARCHAR(20),                -- Black, Blue, White, Yellow, Red
    color_hex VARCHAR(7),              -- #000000
    gender ENUM('male', 'female', 'unisex') DEFAULT 'unisex',
    
    -- Distances
    total_yards INTEGER,
    total_meters INTEGER,
    
    -- Ratings (USGA/R&A System)
    course_rating DECIMAL(4,1),       -- e.g., 72.5
    slope_rating INTEGER,              -- 55-155 scale
    bogey_rating DECIMAL(4,1),
    
    -- Nine-hole ratings
    front_nine_rating DECIMAL(4,1),
    front_nine_slope INTEGER,
    front_nine_bogey DECIMAL(4,1),
    back_nine_rating DECIMAL(4,1),
    back_nine_slope INTEGER,
    back_nine_bogey DECIMAL(4,1),
    
    -- Order
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_course (course_id),
    INDEX idx_rating_slope (course_rating, slope_rating)
);

CREATE TABLE holes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Hole Information
    hole_number INTEGER NOT NULL,     -- 1-18
    hole_name VARCHAR(100),           -- Optional name like "Amen Corner"
    par INTEGER NOT NULL,              -- 3, 4, 5
    
    -- Handicap/Difficulty
    handicap_index INTEGER,            -- 1-18 (1 = hardest)
    
    -- Features
    has_water BOOLEAN DEFAULT FALSE,
    has_bunkers BOOLEAN DEFAULT FALSE,
    dogleg_direction ENUM('straight', 'left', 'right', 'double'),
    
    -- Description
    notes TEXT,
    signature_hole BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_course_hole (course_id, hole_number),
    UNIQUE KEY unique_course_hole (course_id, hole_number)
);

CREATE TABLE hole_distances (
    id SERIAL PRIMARY KEY,
    hole_id INTEGER NOT NULL REFERENCES holes(id) ON DELETE CASCADE,
    tee_box_id INTEGER NOT NULL REFERENCES tee_boxes(id) ON DELETE CASCADE,
    
    -- Distances
    yards INTEGER,
    meters INTEGER,
    
    -- Additional measurements
    yards_to_layup INTEGER,
    yards_to_carry INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_hole_tee (hole_id, tee_box_id),
    UNIQUE KEY unique_hole_tee (hole_id, tee_box_id)
);

-- ============================================
-- 3. SUPPLEMENTARY DATA
-- ============================================

CREATE TABLE course_rankings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    ranking_organization VARCHAR(100), -- Golf Digest, Golf Magazine, etc.
    ranking_type VARCHAR(50),         -- national, continental, world
    ranking_scope VARCHAR(50),        -- spain, europe, world
    rank INTEGER NOT NULL,
    total_ranked INTEGER,
    year INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_year (course_id, year),
    INDEX idx_rank (rank)
);

CREATE TABLE club_amenities (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_club (club_id)
);

-- ============================================
-- 4. USER-GENERATED DATA
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    handicap_index DECIMAL(3,1),
    home_course_id INTEGER REFERENCES golf_courses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scorecards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES golf_courses(id),
    tee_box_id INTEGER NOT NULL REFERENCES tee_boxes(id),
    
    -- Round Information
    date_played DATE NOT NULL,
    start_time TIME,
    weather_conditions VARCHAR(50),
    temperature_celsius INTEGER,
    wind_speed_kmh INTEGER,
    
    -- Scores
    total_strokes INTEGER,
    total_putts INTEGER,
    front_nine_strokes INTEGER,
    back_nine_strokes INTEGER,
    
    -- Stats
    fairways_hit INTEGER,
    fairways_possible INTEGER,
    greens_in_regulation INTEGER,
    
    -- Status
    is_tournament BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_date (user_id, date_played),
    INDEX idx_course (course_id)
);

CREATE TABLE hole_scores (
    id SERIAL PRIMARY KEY,
    scorecard_id INTEGER NOT NULL REFERENCES scorecards(id) ON DELETE CASCADE,
    hole_id INTEGER NOT NULL REFERENCES holes(id),
    
    -- Scoring
    strokes INTEGER NOT NULL,
    putts INTEGER,
    
    -- Stats
    fairway_hit BOOLEAN,
    green_in_regulation BOOLEAN,
    sand_saves INTEGER DEFAULT 0,
    penalty_strokes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_scorecard (scorecard_id),
    UNIQUE KEY unique_scorecard_hole (scorecard_id, hole_id)
);

-- ============================================
-- 5. DATA QUALITY & TRACKING
-- ============================================

CREATE TABLE data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('api', 'scraping', 'manual', 'user') NOT NULL,
    base_url VARCHAR(500),
    reliability_score DECIMAL(3,2), -- 0.00 to 1.00
    last_sync_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_sync_log (
    id SERIAL PRIMARY KEY,
    data_source_id INTEGER REFERENCES data_sources(id),
    entity_type VARCHAR(50),          -- club, course, tee_box, etc.
    entity_id INTEGER,
    action ENUM('create', 'update', 'delete', 'verify'),
    changes_json JSON,
    sync_status ENUM('success', 'failed', 'partial'),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_source_date (data_source_id, created_at),
    INDEX idx_entity (entity_type, entity_id)
);

-- ============================================
-- 6. VIEWS FOR COMMON QUERIES
-- ============================================

CREATE VIEW course_summary AS
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
GROUP BY c.id;

CREATE VIEW hole_yardages AS
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
GROUP BY h.id;

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_clubs_location ON golf_clubs(country_id, region_id, city);
CREATE INDEX idx_courses_club ON golf_courses(club_id);
CREATE INDEX idx_teeboxes_course ON tee_boxes(course_id);
CREATE INDEX idx_holes_course ON holes(course_id);
CREATE INDEX idx_hole_distances_lookup ON hole_distances(hole_id, tee_box_id);

-- Spatial index for geographic queries (if using PostGIS)
-- CREATE INDEX idx_clubs_geo ON golf_clubs USING GIST(ST_MakePoint(longitude, latitude));
-- CREATE INDEX idx_courses_geo ON golf_courses USING GIST(ST_MakePoint(longitude, latitude));
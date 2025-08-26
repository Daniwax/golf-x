-- Extended Golf Database Schema
-- Additional tables for comprehensive course data
-- Created: 2025-08-26

-- ============================================
-- EXTENDED COURSE DETAILS
-- ============================================

-- Detailed hole features beyond basic data
CREATE TABLE hole_features (
    id SERIAL PRIMARY KEY,
    hole_id INTEGER NOT NULL REFERENCES holes(id) ON DELETE CASCADE,
    
    -- Hazards
    water_hazards INTEGER DEFAULT 0,
    water_type VARCHAR(50), -- lake, creek, ocean, pond
    bunkers_count INTEGER DEFAULT 0,
    bunker_type VARCHAR(50), -- fairway, greenside, waste
    
    -- Green Details
    green_size_sqm INTEGER,
    green_shape VARCHAR(50), -- circular, oval, kidney, irregular
    green_tiers INTEGER DEFAULT 1,
    green_slope VARCHAR(50), -- back-to-front, left-to-right, etc
    
    -- Fairway
    fairway_width_avg INTEGER, -- yards
    fairway_width_landing INTEGER, -- yards at landing area
    landing_area_distance INTEGER, -- yards from tee
    
    -- Elevation
    tee_elevation INTEGER, -- meters above sea level
    green_elevation INTEGER, -- meters above sea level
    elevation_change INTEGER, -- meters difference
    
    -- Shape
    dogleg_angle INTEGER, -- degrees
    dogleg_distance INTEGER, -- yards to dogleg
    
    -- Carry distances
    forced_carry_tee INTEGER, -- yards
    forced_carry_approach INTEGER, -- yards
    
    -- Strategic elements
    risk_reward_rating INTEGER, -- 1-10 scale
    bailout_direction VARCHAR(50),
    ideal_shot_shape VARCHAR(50), -- draw, fade, straight
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_hole (hole_id)
);

-- Pricing structure with seasonal variations
CREATE TABLE pricing_schedules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Pricing details
    player_type VARCHAR(50), -- member, guest, visitor, junior, senior
    season VARCHAR(50), -- high, low, shoulder
    day_type VARCHAR(50), -- weekday, weekend, holiday
    time_slot VARCHAR(50), -- morning, afternoon, twilight
    
    -- Rates
    green_fee DECIMAL(10,2),
    cart_fee DECIMAL(10,2),
    caddie_fee DECIMAL(10,2),
    total_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Validity
    valid_from DATE,
    valid_to DATE,
    
    -- Conditions
    booking_window_days INTEGER, -- advance booking required
    min_players INTEGER,
    max_players INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_season (course_id, season),
    INDEX idx_valid_dates (valid_from, valid_to)
);

-- Real-time course conditions
CREATE TABLE course_conditions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Condition date/time
    condition_date DATE NOT NULL,
    condition_time TIME,
    
    -- Green conditions
    green_speed DECIMAL(3,1), -- stimpmeter reading
    green_firmness VARCHAR(50), -- soft, medium, firm
    
    -- Fairway/Rough
    fairway_condition VARCHAR(50), -- excellent, good, fair, poor
    fairway_firmness VARCHAR(50),
    rough_height_mm INTEGER,
    rough_density VARCHAR(50), -- light, medium, heavy
    
    -- Weather
    temperature_celsius INTEGER,
    wind_speed_kmh INTEGER,
    wind_direction VARCHAR(20),
    humidity_percent INTEGER,
    weather_conditions VARCHAR(100),
    
    -- Course status
    cart_path_only BOOLEAN DEFAULT FALSE,
    walking_allowed BOOLEAN DEFAULT TRUE,
    course_open BOOLEAN DEFAULT TRUE,
    
    -- Temporary changes
    temp_greens TEXT, -- JSON array of hole numbers
    temp_tees TEXT, -- JSON array of hole numbers
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_date (course_id, condition_date),
    UNIQUE KEY unique_daily (course_id, condition_date)
);

-- Media assets (photos, videos, documents)
CREATE TABLE course_media (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    hole_id INTEGER REFERENCES holes(id) ON DELETE CASCADE,
    
    -- Media details
    media_type ENUM('photo', 'video', 'panorama', '3d', 'document', 'yardage_book'),
    media_category VARCHAR(50), -- aerial, ground, green, tee, hazard
    
    -- File information
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size_kb INTEGER,
    
    -- Metadata
    title VARCHAR(200),
    description TEXT,
    photographer VARCHAR(100),
    taken_date DATE,
    
    -- Positioning
    view_angle VARCHAR(50), -- tee, fairway, approach, green, aerial
    season VARCHAR(20), -- spring, summer, fall, winter
    
    display_order INTEGER DEFAULT 0,
    is_signature BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_hole (course_id, hole_id),
    INDEX idx_media_type (media_type)
);

-- Tournament and competition history
CREATE TABLE tournament_history (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Event details
    event_name VARCHAR(200) NOT NULL,
    event_type VARCHAR(50), -- professional, amateur, club, charity
    tour VARCHAR(100), -- European Tour, Challenge Tour, etc
    
    -- Date and results
    year INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    
    -- Winners and scores
    winner_name VARCHAR(100),
    winner_score INTEGER, -- total strokes
    winner_score_relative INTEGER, -- relative to par (-10, +2, etc)
    
    -- Records
    course_record_broken BOOLEAN DEFAULT FALSE,
    attendance INTEGER,
    prize_money DECIMAL(12,2),
    prize_currency VARCHAR(3),
    
    -- Additional info
    playoff BOOLEAN DEFAULT FALSE,
    playoff_holes INTEGER,
    weather_conditions TEXT,
    notable_moments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_year (course_id, year),
    INDEX idx_event_name (event_name)
);

-- Practice facility details
CREATE TABLE practice_facilities (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES golf_clubs(id) ON DELETE CASCADE,
    
    -- Driving range
    range_length_yards INTEGER,
    range_width_yards INTEGER,
    range_tees_count INTEGER,
    range_tees_covered INTEGER,
    range_grass_tees BOOLEAN DEFAULT TRUE,
    range_mat_tees BOOLEAN DEFAULT TRUE,
    range_automated_tees BOOLEAN DEFAULT FALSE,
    range_targets TEXT, -- JSON array of target distances
    
    -- Short game area
    shortgame_area_sqm INTEGER,
    chipping_greens INTEGER,
    putting_greens INTEGER,
    practice_bunkers INTEGER,
    
    -- Technology
    has_trackman BOOLEAN DEFAULT FALSE,
    has_toptracer BOOLEAN DEFAULT FALSE,
    has_video_analysis BOOLEAN DEFAULT FALSE,
    has_sam_putt_lab BOOLEAN DEFAULT FALSE,
    
    -- Amenities
    has_club_fitting BOOLEAN DEFAULT FALSE,
    has_club_repair BOOLEAN DEFAULT FALSE,
    has_golf_lessons BOOLEAN DEFAULT FALSE,
    
    -- Hours and pricing
    range_hours_open TIME,
    range_hours_close TIME,
    range_balls_small_price DECIMAL(6,2),
    range_balls_medium_price DECIMAL(6,2),
    range_balls_large_price DECIMAL(6,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_club (club_id)
);

-- Dining and hospitality
CREATE TABLE dining_facilities (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES golf_clubs(id) ON DELETE CASCADE,
    
    -- Restaurant details
    name VARCHAR(100),
    facility_type VARCHAR(50), -- restaurant, bar, halfway_house, snack_bar
    
    -- Capacity and service
    seating_capacity INTEGER,
    private_rooms INTEGER,
    private_room_capacity INTEGER,
    
    -- Operating hours
    weekday_open TIME,
    weekday_close TIME,
    weekend_open TIME,
    weekend_close TIME,
    
    -- Menu and pricing
    cuisine_type VARCHAR(100),
    menu_url VARCHAR(500),
    avg_meal_price DECIMAL(6,2),
    
    -- Services
    breakfast_available BOOLEAN DEFAULT FALSE,
    lunch_available BOOLEAN DEFAULT TRUE,
    dinner_available BOOLEAN DEFAULT FALSE,
    bar_service BOOLEAN DEFAULT TRUE,
    
    -- Special features
    outdoor_seating BOOLEAN DEFAULT FALSE,
    course_view BOOLEAN DEFAULT FALSE,
    dress_code VARCHAR(50),
    reservations_required BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_club (club_id)
);

-- Membership information
CREATE TABLE membership_types (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES golf_clubs(id) ON DELETE CASCADE,
    
    -- Membership details
    membership_type VARCHAR(50), -- full, weekday, junior, corporate
    membership_name VARCHAR(100),
    
    -- Eligibility
    min_age INTEGER,
    max_age INTEGER,
    handicap_required BOOLEAN DEFAULT FALSE,
    max_handicap DECIMAL(3,1),
    residency_required BOOLEAN DEFAULT FALSE,
    
    -- Costs
    initiation_fee DECIMAL(10,2),
    annual_fee DECIMAL(10,2),
    monthly_fee DECIMAL(8,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Benefits
    unlimited_golf BOOLEAN DEFAULT TRUE,
    guest_rounds_included INTEGER,
    cart_included BOOLEAN DEFAULT FALSE,
    range_included BOOLEAN DEFAULT FALSE,
    
    -- Restrictions
    blackout_dates TEXT, -- JSON array
    advance_booking_days INTEGER,
    weekend_restrictions TEXT,
    
    -- Availability
    available_slots INTEGER,
    waiting_list BOOLEAN DEFAULT FALSE,
    waiting_list_time_months INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_club_type (club_id, membership_type)
);

-- Weather patterns and statistics
CREATE TABLE weather_statistics (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Time period
    month INTEGER NOT NULL, -- 1-12
    
    -- Temperature (Celsius)
    avg_temp_high DECIMAL(4,1),
    avg_temp_low DECIMAL(4,1),
    record_high DECIMAL(4,1),
    record_low DECIMAL(4,1),
    
    -- Precipitation
    avg_rainfall_mm DECIMAL(6,1),
    rainy_days INTEGER,
    
    -- Wind
    avg_wind_speed_kmh DECIMAL(4,1),
    prevailing_wind_direction VARCHAR(20),
    
    -- Sunshine
    avg_sunshine_hours DECIMAL(5,1),
    
    -- Playability
    frost_delay_likelihood INTEGER, -- percentage
    rain_closure_likelihood INTEGER, -- percentage
    optimal_playing_score INTEGER, -- 1-10 scale
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_month (course_id, month),
    UNIQUE KEY unique_course_month (course_id, month)
);

-- Course routing and navigation
CREATE TABLE course_routing (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Routing details
    from_hole INTEGER NOT NULL,
    to_hole INTEGER NOT NULL,
    
    -- Distances
    walking_distance_meters INTEGER,
    cart_path_distance_meters INTEGER,
    
    -- Features
    has_tunnel BOOLEAN DEFAULT FALSE,
    has_bridge BOOLEAN DEFAULT FALSE,
    has_road_crossing BOOLEAN DEFAULT FALSE,
    elevation_change_meters INTEGER,
    
    -- Amenities
    has_restroom BOOLEAN DEFAULT FALSE,
    has_water_station BOOLEAN DEFAULT FALSE,
    has_halfway_house BOOLEAN DEFAULT FALSE,
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_routing (course_id, from_hole, to_hole),
    UNIQUE KEY unique_routing (course_id, from_hole, to_hole)
);

-- Local rules and course policies
CREATE TABLE course_rules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    
    -- Rule details
    rule_category VARCHAR(50), -- local, dress_code, pace_of_play, etiquette
    rule_title VARCHAR(200),
    rule_description TEXT,
    
    -- Applicability
    applies_to VARCHAR(50), -- all, members, guests, tournaments
    effective_date DATE,
    
    -- Penalties
    penalty_strokes INTEGER,
    penalty_description TEXT,
    
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_category (course_id, rule_category)
);

-- ============================================
-- VIEWS FOR EXTENDED DATA
-- ============================================

-- Complete hole information view
CREATE VIEW v_hole_complete AS
SELECT 
    h.*,
    hf.water_hazards,
    hf.bunkers_count,
    hf.green_size_sqm,
    hf.fairway_width_avg,
    hf.elevation_change,
    hf.dogleg_angle,
    hf.risk_reward_rating
FROM holes h
LEFT JOIN hole_features hf ON h.id = hf.hole_id;

-- Current pricing view
CREATE VIEW v_current_pricing AS
SELECT *
FROM pricing_schedules
WHERE CURRENT_DATE BETWEEN valid_from AND valid_to
ORDER BY course_id, player_type, day_type;

-- Tournament summary view
CREATE VIEW v_tournament_summary AS
SELECT 
    c.name as course_name,
    COUNT(DISTINCT th.id) as total_tournaments,
    MIN(th.winner_score_relative) as course_record,
    AVG(th.winner_score) as avg_winning_score,
    MAX(th.prize_money) as highest_purse
FROM golf_courses c
LEFT JOIN tournament_history th ON c.id = th.course_id
GROUP BY c.id;
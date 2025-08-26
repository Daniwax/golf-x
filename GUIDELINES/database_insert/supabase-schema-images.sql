-- Image storage schema for Golf Courses
-- Store images directly in database as bytea (bytes)
-- Created: 2025-08-26

-- Add image columns to existing tables
ALTER TABLE golf_clubs ADD COLUMN IF NOT EXISTS logo_image BYTEA;
ALTER TABLE golf_clubs ADD COLUMN IF NOT EXISTS main_image BYTEA;
ALTER TABLE golf_clubs ADD COLUMN IF NOT EXISTS main_image_mime VARCHAR(50); -- image/jpeg, image/png, etc.

ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS course_image BYTEA;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS course_image_mime VARCHAR(50);
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS layout_image BYTEA;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS layout_image_mime VARCHAR(50);

-- Create a dedicated images table for multiple images per course/hole
CREATE TABLE IF NOT EXISTS course_images (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES golf_courses(id) ON DELETE CASCADE,
    hole_id INTEGER REFERENCES holes(id) ON DELETE CASCADE,
    
    -- Image data
    image_data BYTEA NOT NULL,
    mime_type VARCHAR(50) NOT NULL, -- image/jpeg, image/png, image/webp
    file_size INTEGER, -- size in bytes
    
    -- Metadata
    image_type VARCHAR(50), -- aerial, tee, green, fairway, clubhouse, scorecard
    title VARCHAR(200),
    description TEXT,
    width INTEGER,
    height INTEGER,
    
    -- Ordering and flags
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CHECK (course_id IS NOT NULL OR hole_id IS NOT NULL) -- Must belong to course or hole
);

CREATE INDEX idx_course_images_course ON course_images(course_id);
CREATE INDEX idx_course_images_hole ON course_images(hole_id);
CREATE INDEX idx_course_images_type ON course_images(image_type);

-- Enable RLS
ALTER TABLE course_images ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for course images" ON course_images FOR SELECT USING (true);

-- Function to convert image to base64 for frontend display
CREATE OR REPLACE FUNCTION get_image_base64(image_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT 
        'data:' || mime_type || ';base64,' || encode(image_data, 'base64')
    INTO result
    FROM course_images
    WHERE id = image_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all images for a course
CREATE OR REPLACE FUNCTION get_course_images(course_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    image_type VARCHAR,
    title VARCHAR,
    description TEXT,
    mime_type VARCHAR,
    file_size INTEGER,
    base64_data TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.image_type,
        ci.title,
        ci.description,
        ci.mime_type,
        ci.file_size,
        'data:' || ci.mime_type || ';base64,' || encode(ci.image_data, 'base64') as base64_data
    FROM course_images ci
    WHERE ci.course_id = course_id_param
    ORDER BY ci.display_order, ci.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to insert image from file path (for migration scripts)
-- Note: This is a placeholder - actual file reading needs to be done in application code
CREATE OR REPLACE FUNCTION insert_course_image(
    p_course_id INTEGER,
    p_hole_id INTEGER,
    p_image_type VARCHAR,
    p_title VARCHAR,
    p_mime_type VARCHAR,
    p_image_data BYTEA
)
RETURNS INTEGER AS $$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO course_images (
        course_id,
        hole_id,
        image_type,
        title,
        mime_type,
        image_data,
        file_size
    ) VALUES (
        p_course_id,
        p_hole_id,
        p_image_type,
        p_title,
        p_mime_type,
        p_image_data,
        octet_length(p_image_data)
    ) RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
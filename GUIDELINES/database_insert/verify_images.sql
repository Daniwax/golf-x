
-- Verify inserted images
SELECT 
    course_id,
    title,
    image_type,
    file_size,
    is_primary,
    created_at
FROM course_images
ORDER BY course_id;

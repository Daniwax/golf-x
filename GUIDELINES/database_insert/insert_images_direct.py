#!/usr/bin/env python3
"""
Direct image insertion into Supabase course_images table
Converts JPEG files to hex format for PostgreSQL bytea storage
"""

import os
import sys
from pathlib import Path

def convert_image_to_hex(image_path):
    """Read image and convert to hex string for PostgreSQL bytea"""
    with open(image_path, 'rb') as f:
        image_data = f.read()
    return image_data.hex(), len(image_data)

def generate_insert_sql(course_id, image_path):
    """Generate SQL insert statement for an image"""
    hex_data, file_size = convert_image_to_hex(image_path)
    
    sql = f"""
-- Insert aerial image for La Moraleja Course {course_id}
-- File: {image_path.name} ({file_size} bytes)
INSERT INTO course_images (
    course_id,
    hole_id,
    image_type,
    title,
    mime_type,
    image_data,
    file_size,
    is_primary,
    display_order,
    description
) VALUES (
    {course_id},
    NULL,
    'aerial',
    'La Moraleja Course {course_id} - Aerial View',
    'image/jpeg',
    '\\x{hex_data}'::bytea,
    {file_size},
    true,
    1,
    'Aerial view of La Moraleja Course {course_id}'
) ON CONFLICT DO NOTHING;
"""
    return sql

def main():
    # Define image mappings
    images = [
        (1, Path('../images/la-moraleja-1_aerial.jpg')),
        (2, Path('../images/la-moraleja-2_aerial.jpg')),
        (3, Path('../images/la-moraleja-3_aerial.jpg')),
        (4, Path('../images/la-moraleja-4_aerial.jpg'))
    ]
    
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    print("Generating SQL for image insertions...")
    print("-" * 50)
    
    all_sql = []
    
    for course_id, image_path in images:
        if not image_path.exists():
            print(f"[ERROR] Image not found: {image_path}")
            continue
        
        print(f"Processing: {image_path.name} for Course {course_id}")
        sql = generate_insert_sql(course_id, image_path)
        all_sql.append(sql)
        
        # Save individual SQL files (hex data is large)
        output_file = f"10_course{course_id}_image.sql"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(sql)
        print(f"  -> Saved to {output_file}")
    
    print("-" * 50)
    print(f"Generated {len(all_sql)} SQL files")
    print("\nTo insert images into database:")
    print("1. Run each SQL file through Supabase")
    print("2. Or use the Supabase MCP to execute them")
    
    # Also create a verification query
    verify_sql = """
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
"""
    
    with open('verify_images.sql', 'w') as f:
        f.write(verify_sql)
    
    print("\nVerification query saved to verify_images.sql")

if __name__ == "__main__":
    main()
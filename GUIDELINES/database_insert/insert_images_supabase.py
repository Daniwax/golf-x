#!/usr/bin/env python3
"""
Insert course images directly into Supabase using Python client
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
env_path = Path('D:/projects/repositories/golf-x/.env')
load_dotenv(env_path)

# Initialize Supabase client
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("[ERROR] Supabase credentials not found!")
    print(f"Checked .env at: {env_path}")
    sys.exit(1)

print(f"Connecting to Supabase...")
supabase: Client = create_client(url, key)

def insert_image_direct(course_id, image_path):
    """Insert image using direct SQL with hex encoding"""
    try:
        # Read image file
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Convert to hex
        hex_data = image_data.hex()
        file_size = len(image_data)
        
        print(f"  File size: {file_size} bytes")
        
        # Use raw SQL to insert with bytea
        sql = f"""
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
            decode('{hex_data}', 'hex'),
            {file_size},
            true,
            1,
            'Aerial view of La Moraleja Course {course_id}'
        ) ON CONFLICT DO NOTHING
        RETURNING id;
        """
        
        # Execute the SQL
        result = supabase.rpc('execute_sql', {'query': sql}).execute()
        print(f"  [OK] Inserted successfully")
        return True
        
    except Exception as e:
        # If execute_sql RPC doesn't exist, try direct table insert
        try:
            # Alternative: Use base64 encoding
            import base64
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Try to use the insert_course_image function we created earlier
            hex_data = image_data.hex()
            
            result = supabase.rpc('insert_course_image', {
                'p_course_id': course_id,
                'p_hole_id': None,
                'p_image_type': 'aerial',
                'p_title': f'La Moraleja Course {course_id} - Aerial View',
                'p_mime_type': 'image/jpeg',
                'p_image_data': f'\\x{hex_data}'
            }).execute()
            
            print(f"  [OK] Inserted via function")
            return True
            
        except Exception as e2:
            print(f"  [ERROR] Failed: {str(e2)[:100]}")
            return False

def main():
    print("=" * 60)
    print("INSERTING AERIAL IMAGES INTO SUPABASE")
    print("=" * 60)
    
    # Image mappings
    base_path = Path('D:/projects/repositories/golf-x/GUIDELINES/images')
    images = [
        (1, base_path / 'la-moraleja-1_aerial.jpg'),
        (2, base_path / 'la-moraleja-2_aerial.jpg'),
        (3, base_path / 'la-moraleja-3_aerial.jpg'),
        (4, base_path / 'la-moraleja-4_aerial.jpg')
    ]
    
    success = 0
    failed = 0
    
    for course_id, image_path in images:
        print(f"\nCourse {course_id}: {image_path.name}")
        
        if not image_path.exists():
            print(f"  [ERROR] File not found!")
            failed += 1
            continue
        
        # Check if already exists
        existing = supabase.table('course_images')\
            .select('id')\
            .eq('course_id', course_id)\
            .eq('image_type', 'aerial')\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            print(f"  [SKIP] Image already exists (ID: {existing.data[0]['id']})")
            continue
        
        # Insert the image
        if insert_image_direct(course_id, image_path):
            success += 1
        else:
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"RESULTS: {success} inserted, {failed} failed")
    
    # Verify what's in the database
    print("\nVerifying database contents...")
    result = supabase.table('course_images')\
        .select('course_id', 'title', 'file_size', 'created_at')\
        .order('course_id')\
        .execute()
    
    if result.data:
        print(f"\nTotal images in database: {len(result.data)}")
        for img in result.data:
            print(f"  Course {img['course_id']}: {img['file_size']:,} bytes - {img['title']}")
    else:
        print("No images found in database")

if __name__ == "__main__":
    main()
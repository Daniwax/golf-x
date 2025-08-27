"""
Insert course images into Supabase database
Reads JPEG files and inserts them as bytea data
"""

import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in environment variables")
    print("Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set")
    exit(1)

supabase: Client = create_client(url, key)

# Define image mappings
IMAGE_MAPPINGS = [
    {
        "file": "la-moraleja-1_aerial.jpg",
        "course_id": 1,
        "title": "La Moraleja Course 1 - Aerial View",
        "image_type": "aerial",
        "is_primary": True,
        "display_order": 1
    },
    {
        "file": "la-moraleja-2_aerial.jpg", 
        "course_id": 2,
        "title": "La Moraleja Course 2 - Aerial View",
        "image_type": "aerial",
        "is_primary": True,
        "display_order": 1
    },
    {
        "file": "la-moraleja-3_aerial.jpg",
        "course_id": 3,
        "title": "La Moraleja Course 3 - Aerial View",
        "image_type": "aerial",
        "is_primary": True,
        "display_order": 1
    },
    {
        "file": "la-moraleja-4_aerial.jpg",
        "course_id": 4,
        "title": "La Moraleja Course 4 - Aerial View",
        "image_type": "aerial",
        "is_primary": True,
        "display_order": 1
    }
]

def insert_image(image_path: Path, mapping: dict):
    """Insert a single image into the database"""
    try:
        # Read the image file
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Get file size
        file_size = len(image_data)
        
        # Convert to base64 for JSON transport
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Prepare the data
        data = {
            "course_id": mapping["course_id"],
            "hole_id": None,
            "image_type": mapping["image_type"],
            "title": mapping["title"],
            "mime_type": "image/jpeg",
            "image_data": image_base64,
            "file_size": file_size,
            "description": f"Aerial view of La Moraleja Course {mapping['course_id']}",
            "is_primary": mapping["is_primary"],
            "is_thumbnail": False,
            "display_order": mapping["display_order"]
        }
        
        # Insert using RPC function to handle bytea conversion
        result = supabase.rpc('insert_course_image', {
            'p_course_id': mapping["course_id"],
            'p_hole_id': None,
            'p_image_type': mapping["image_type"],
            'p_title': mapping["title"],
            'p_mime_type': 'image/jpeg',
            'p_image_data': f'\\x{image_data.hex()}'  # Convert to PostgreSQL bytea format
        }).execute()
        
        print(f"[OK] Inserted: {mapping['file']} for Course {mapping['course_id']}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to insert {mapping['file']}: {str(e)}")
        return False

def main():
    """Main function to insert all images"""
    print("Starting image insertion process...")
    print("-" * 50)
    
    # Get the images directory path
    base_dir = Path(__file__).parent.parent / "images"
    
    if not base_dir.exists():
        print(f"Error: Images directory not found at {base_dir}")
        return
    
    success_count = 0
    error_count = 0
    
    # Process each image
    for mapping in IMAGE_MAPPINGS:
        image_path = base_dir / mapping["file"]
        
        if not image_path.exists():
            print(f"[WARNING] Image not found: {image_path}")
            error_count += 1
            continue
        
        # Check if image already exists for this course
        existing = supabase.table('course_images').select('id').eq('course_id', mapping['course_id']).eq('image_type', 'aerial').execute()
        
        if existing.data and len(existing.data) > 0:
            print(f"[SKIP] Image already exists for Course {mapping['course_id']}")
            continue
        
        # Insert the image
        if insert_image(image_path, mapping):
            success_count += 1
        else:
            error_count += 1
    
    print("-" * 50)
    print(f"Process completed!")
    print(f"  Successfully inserted: {success_count}")
    print(f"  Errors: {error_count}")
    
    # Verify insertions
    print("\nVerifying insertions...")
    result = supabase.table('course_images').select('course_id', 'title', 'file_size').execute()
    
    if result.data:
        print(f"\nTotal images in database: {len(result.data)}")
        for img in result.data:
            print(f"  - Course {img['course_id']}: {img['title']} ({img['file_size']} bytes)")
    else:
        print("No images found in database")

if __name__ == "__main__":
    main()
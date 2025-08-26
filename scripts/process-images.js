/**
 * Script to process course images and convert them to base64 SQL inserts
 * Place images in: GUIDELINES/images/courses/
 * 
 * Naming convention:
 * - club_[clubId]_main.jpg - Main club image
 * - course_[courseId]_main.jpg - Main course image
 * - course_[courseId]_layout.jpg - Course layout
 * - course_[courseId]_hole_[holeNumber].jpg - Specific hole
 * - course_[courseId]_aerial.jpg - Aerial view
 * - course_[courseId]_clubhouse.jpg - Clubhouse
 * 
 * Run with: node scripts/process-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'GUIDELINES', 'images');
const OUTPUT_FILE = path.join(__dirname, '..', 'GUIDELINES', 'database_insert', 'insert-images.sql');

// Image type mapping based on filename patterns
const getImageType = (filename) => {
    if (filename.includes('_main')) return 'main';
    if (filename.includes('_layout')) return 'layout';
    if (filename.includes('_hole_')) return 'hole';
    if (filename.includes('_aerial')) return 'aerial';
    if (filename.includes('_clubhouse')) return 'clubhouse';
    if (filename.includes('_tee')) return 'tee';
    if (filename.includes('_green')) return 'green';
    if (filename.includes('_fairway')) return 'fairway';
    if (filename.includes('_scorecard')) return 'scorecard';
    return 'general';
};

// Get MIME type from file extension
const getMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.gif':
            return 'image/gif';
        default:
            return 'image/jpeg';
    }
};

// Parse filename to get IDs
const parseFilename = (filename) => {
    const result = {
        courseId: null,
        holeId: null,
        clubId: null,
        type: getImageType(filename),
        title: filename.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').replace(/-/g, ' ')
    };

    // Handle la-moraleja-X_aerial.jpg format
    const moralejaMatch = filename.match(/la-moraleja-(\d+)/);
    if (moralejaMatch) {
        result.courseId = parseInt(moralejaMatch[1]); // Courses 1-4
    }

    // Extract course ID (alternative format)
    const courseMatch = filename.match(/course_(\d+)/);
    if (courseMatch) {
        result.courseId = parseInt(courseMatch[1]);
    }

    // Extract club ID
    const clubMatch = filename.match(/club_(\d+)/);
    if (clubMatch) {
        result.clubId = parseInt(clubMatch[1]);
    }

    // Extract hole number (we'll need to convert to hole ID later)
    const holeMatch = filename.match(/hole_(\d+)/);
    if (holeMatch) {
        const holeNumber = parseInt(holeMatch[1]);
        // For Course 1, hole IDs are 1-18
        // This is a simple mapping - adjust based on your actual data
        if (result.courseId === 1) {
            result.holeId = holeNumber; // Holes 1-18 have IDs 1-18 for course 1
        }
    }

    return result;
};

// Process all images
const processImages = () => {
    // Create images directory if it doesn't exist
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
        console.log(`Created directory: ${IMAGES_DIR}`);
        console.log('Please add images to this directory with the naming convention described in the script.');
        return;
    }

    const files = fs.readdirSync(IMAGES_DIR);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

    if (imageFiles.length === 0) {
        console.log(`No images found in ${IMAGES_DIR}`);
        console.log('Please add images with naming convention like:');
        console.log('  - course_1_main.jpg');
        console.log('  - course_1_hole_1.jpg');
        console.log('  - course_1_aerial.jpg');
        return;
    }

    let sqlStatements = [
        '-- Golf Course Images Insert Statements',
        '-- Generated from images in GUIDELINES/images/courses/',
        `-- Generated: ${new Date().toISOString()}`,
        '',
        '-- Insert images into course_images table'
    ];

    imageFiles.forEach((filename, index) => {
        const filepath = path.join(IMAGES_DIR, filename);
        const fileBuffer = fs.readFileSync(filepath);
        const base64Data = fileBuffer.toString('base64');
        const fileSize = fileBuffer.length;
        const mimeType = getMimeType(filename);
        const parsed = parseFilename(filename);

        console.log(`Processing: ${filename} (${(fileSize / 1024).toFixed(2)} KB)`);

        // Generate SQL based on image type
        if (parsed.clubId) {
            // Update club table directly
            sqlStatements.push(`
-- Update club ${parsed.clubId} with main image
UPDATE golf_clubs 
SET main_image = decode('${base64Data}', 'base64'),
    main_image_mime = '${mimeType}'
WHERE id = ${parsed.clubId};`);
        } else if (parsed.courseId) {
            if (parsed.type === 'main' || parsed.type === 'layout') {
                // Update course table directly for main/layout images
                const column = parsed.type === 'main' ? 'course_image' : 'layout_image';
                const mimeColumn = parsed.type === 'main' ? 'course_image_mime' : 'layout_image_mime';
                sqlStatements.push(`
-- Update course ${parsed.courseId} with ${parsed.type} image
UPDATE golf_courses 
SET ${column} = decode('${base64Data}', 'base64'),
    ${mimeColumn} = '${mimeType}'
WHERE id = ${parsed.courseId};`);
            } else {
                // Insert into course_images table
                const holeIdValue = parsed.holeId ? parsed.holeId : 'NULL';
                const isPrimary = index === 0 ? 'true' : 'false'; // First image as primary
                
                sqlStatements.push(`
-- Insert ${parsed.type} image for course ${parsed.courseId}${parsed.holeId ? `, hole ${parsed.holeId}` : ''}
INSERT INTO course_images (
    course_id,
    hole_id,
    image_type,
    title,
    mime_type,
    image_data,
    file_size,
    is_primary,
    display_order
) VALUES (
    ${parsed.courseId},
    ${holeIdValue},
    '${parsed.type}',
    '${parsed.title}',
    '${mimeType}',
    decode('${base64Data}', 'base64'),
    ${fileSize},
    ${isPrimary},
    ${index}
);`);
            }
        }
    });

    // Write SQL file
    fs.writeFileSync(OUTPUT_FILE, sqlStatements.join('\n'));
    console.log(`\nGenerated SQL file: ${OUTPUT_FILE}`);
    console.log(`Processed ${imageFiles.length} images`);
    console.log('\nNote: Large images (>1MB) may cause issues. Consider resizing images to <500KB each.');
};

// Run the script
processImages();
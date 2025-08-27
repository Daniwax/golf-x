# Database Integrity Check Guidelines

## Purpose
This document outlines the systematic process to verify and ensure database integrity for the Golf X application, checking each table's schema and data completeness.

## Process Overview
Execute the following steps for each table in sequence. Do not proceed to the next table until the current table is fully verified and corrected.

## Table Processing Order
1. countries
2. regions  
3. golf_clubs
4. golf_courses
5. tee_boxes
6. holes
7. hole_distances
8. club_amenities
9. course_images

## Step-by-Step Process for Each Table

### Step 1: Check Table Schema and Data Incompletion
- Query Supabase directly using MCP to get current table schema
- Count existing records in the table
- Identify any missing or incomplete data

### Step 2: Schema Comparison and Update
- Compare actual Supabase schema with local schema file: `supabase-schema.sql`
- If differences found:
  - Update `supabase-schema.sql` with the real schema from Supabase
  - Document the differences
  - Commit the updated schema file

### Step 3: Execute SQL Insert Script
- Locate the appropriate SQL script for the table (e.g., `01_countries.sql`)
- Run the INSERT statements via Supabase MCP
- Handle any errors:
  - Duplicate key violations: Skip or update existing records
  - Foreign key violations: Ensure parent records exist
  - Data type mismatches: Correct the data format

### Step 4: Verify Data in Database
- Query the table to confirm records were inserted
- Validate:
  - Record count matches expectations
  - Required fields are populated
  - Foreign key relationships are intact
  - No duplicate records exist

### Step 5: Decision Point
- **5A. Success**: If data is correctly stored → Move to Step 1 with next table
- **5B. Issues Found**: If missing data or errors → Fix the SQL script and return to Step 3

## Error Handling Guidelines

### Common Issues and Solutions

#### Duplicate Key Violations
- Use `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE`
- Check for existing records before inserting

#### Foreign Key Violations
- Ensure parent tables are populated first
- Verify referenced IDs exist
- Follow the table processing order

#### Data Type Mismatches
- Check column types in Supabase
- Convert data formats as needed
- Update local schema to match

#### Sequence Issues
- Reset sequences after bulk inserts
- Use `SELECT setval()` to synchronize

## Verification Queries

### Basic Verification
```sql
-- Count records
SELECT COUNT(*) FROM table_name;

-- Check for nulls in required fields
SELECT * FROM table_name WHERE required_field IS NULL;

-- Verify foreign keys
SELECT t.* FROM table t
LEFT JOIN parent_table p ON t.parent_id = p.id
WHERE p.id IS NULL;
```

### Data Quality Checks
```sql
-- Check for duplicates
SELECT field, COUNT(*) 
FROM table_name 
GROUP BY field 
HAVING COUNT(*) > 1;

-- Verify data ranges
SELECT * FROM table_name 
WHERE numeric_field < min_value 
   OR numeric_field > max_value;
```

## Documentation Requirements

### For Each Table Processed
1. Initial state (record count, issues found)
2. Schema differences identified
3. Actions taken
4. Final state (record count, validation results)
5. Any remaining issues or notes

## Success Criteria
- All tables have correct schema in `supabase-schema.sql`
- All expected records are inserted
- No orphaned foreign keys
- No duplicate records
- All required fields populated
- Sequences properly synchronized

## Final Verification
After all tables processed:
1. Run comprehensive foreign key check
2. Verify all table counts
3. Test sample queries from application
4. Generate summary report

## Table Status Tracking

| Table | Schema Updated | Data Inserted | Verified | Notes |
|-------|---------------|---------------|----------|-------|
| countries | ⏳ | ⏳ | ⏳ | |
| regions | ⏳ | ⏳ | ⏳ | |
| golf_clubs | ⏳ | ⏳ | ⏳ | |
| golf_courses | ⏳ | ⏳ | ⏳ | |
| tee_boxes | ⏳ | ⏳ | ⏳ | |
| holes | ⏳ | ⏳ | ⏳ | |
| hole_distances | ⏳ | ⏳ | ⏳ | |
| club_amenities | ⏳ | ⏳ | ⏳ | |
| course_images | ⏳ | ⏳ | ⏳ | |

Legend: ✅ Complete | ❌ Failed | ⏳ Pending | 🔧 In Progress
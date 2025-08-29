# DATABASE DIAGNOSTIC REPORT
Generated: 2025-08-28T16:05:29.411Z
Tables Analyzed: 17

## EXECUTIVE SUMMARY

- Total Tables: 17
- Total Rows: 884
- Empty Tables: 3
- Tables with Issues: 0
- Tables with Warnings: 15
- Data Quality Score: 72/100 (GOOD)

---

## ALL PROBLEMS AND WARNINGS

### WARNINGS

#### Nullability Warnings
- **profiles**: Column 'home_course' is >50% NULL (6/6)
- **profiles**: Column 'bio' is >50% NULL (5/6)
- **games**: Column 'game_description' is >50% NULL (26/28)
- **games**: Column 'started_at' is >50% NULL (28/28)
- **games**: Column 'notes' is >50% NULL (28/28)
- **games**: Column 'notes_updated_by' is >50% NULL (28/28)
- **games**: Column 'notes_updated_at' is >50% NULL (28/28)
- **game_participants**: Column 'total_putts' is >50% NULL (31/47)
- **game_participants**: Column 'back_nine_strokes' is >50% NULL (33/47)
- **golf_clubs**: Column 'postal_code' is >50% NULL (1/1)
- **golf_clubs**: Column 'architect' is >50% NULL (1/1)
- **golf_clubs**: Column 'email' is >50% NULL (1/1)
- **golf_clubs**: Column 'booking_url' is >50% NULL (1/1)
- **golf_clubs**: Column 'source_updated_at' is >50% NULL (1/1)
- **golf_courses**: Column 'external_id' is >50% NULL (5/5)
- **golf_courses**: Column 'total_yardage' is >50% NULL (5/5)
- **golf_courses**: Column 'total_meters' is >50% NULL (5/5)
- **golf_courses**: Column 'altitude_meters' is >50% NULL (5/5)
- **golf_courses**: Column 'season_start_month' is >50% NULL (5/5)
- **golf_courses**: Column 'season_end_month' is >50% NULL (5/5)
- **golf_courses**: Column 'booking_url' is >50% NULL (5/5)
- **golf_courses**: Column 'scorecard_url' is >50% NULL (5/5)
- **golf_courses**: Column 'layout_map_url' is >50% NULL (5/5)
- **holes**: Column 'hole_name' is >50% NULL (90/90)
- **holes**: Column 'dogleg_direction' is >50% NULL (90/90)
- **holes**: Column 'notes' is >50% NULL (90/90)
- **tee_boxes**: Column 'color_hex' is >50% NULL (20/20)
- **tee_boxes**: Column 'bogey_rating' is >50% NULL (20/20)
- **tee_boxes**: Column 'front_nine_bogey' is >50% NULL (20/20)
- **tee_boxes**: Column 'back_nine_bogey' is >50% NULL (20/20)
- **hole_distances**: Column 'yards_to_layup' is >50% NULL (100/100)
- **hole_distances**: Column 'yards_to_carry' is >50% NULL (100/100)
- **club_amenities**: Column 'notes' is >50% NULL (1/1)
- **course_images**: Column 'hole_id' is >50% NULL (4/4)
- **course_images**: Column 'description' is >50% NULL (4/4)
- **course_images**: Column 'width' is >50% NULL (4/4)
- **course_images**: Column 'height' is >50% NULL (4/4)

#### Empty Table Warnings
- **game_invitations**: Table is empty - cannot perform data analysis
- **game_statistics**: Table is empty - cannot perform data analysis
- **user_statistics**: Table is empty - cannot perform data analysis

#### Test Data Warnings
- **countries**: Table has only 1 row - may be test data
- **regions**: Table has only 1 row - may be test data
- **golf_clubs**: Table has only 1 row - may be test data
- **club_amenities**: Table has only 1 row - may be test data

---

## DATA QUALITY SCORE DETAILS

**Overall Score: 72/100**

| Category | Score | Max |
|----------|-------|-----|
| Schema Completeness | 22 | 25 |
| Data Consistency | 25 | 25 |
| Nullability Health | 0 | 25 |
| Referential Integrity | 25 | 25 |

---

## TABLE DETAILS

### Table Overview

| Table | Rows | Status | Issues | Warnings |
|-------|------|--------|--------|----------|
| profiles | 6 | ACTIVE | - | 2 |
| friendships | 12 | ACTIVE | - | - |
| games | 28 | ACTIVE | - | 5 |
| game_participants | 47 | ACTIVE | - | 2 |
| game_hole_scores | 308 | ACTIVE | - | - |
| game_invitations | 0 | EMPTY | - | 1 |
| game_statistics | 0 | EMPTY | - | 1 |
| user_statistics | 0 | EMPTY | - | 1 |
| countries | 1 | ACTIVE | - | 1 |
| regions | 1 | ACTIVE | - | 1 |
| golf_clubs | 1 | ACTIVE | - | 6 |
| golf_courses | 5 | ACTIVE | - | 9 |
| holes | 90 | ACTIVE | - | 3 |
| tee_boxes | 20 | ACTIVE | - | 4 |
| hole_distances | 360 | ACTIVE | - | 2 |
| club_amenities | 1 | ACTIVE | - | 2 |
| course_images | 4 | ACTIVE | - | 4 |

---

## DETAILED COLUMN ANALYSIS

### profiles
*6 rows | Sample size: 6*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | uuid | No | 100% |  |
| full_name | varchar | No | 100% | Length: NaN-NaN (avg: 12) |
| email | varchar | No | 100% | Length: NaN-NaN (avg: 22) |
| avatar_url | varchar | No | 100% | Length: NaN-NaN (avg: 96) |
| handicap | integer | No | 83% | Range: 10-34 |
| home_course | null | Yes (6) | 0% |  |
| bio | null | Yes (5) | 17% |  |
| created_at | timestamp | No | 100% |  |
| updated_at | timestamp | No | 100% |  |

### friendships
*12 rows | Sample size: 12*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | uuid | No | 100% |  |
| requester_id | uuid | No | 50% |  |
| friend_id | uuid | No | 50% |  |
| status | varchar | No | 8% | Length: NaN-NaN (avg: 8) |
| created_at | timestamp | No | 50% |  |

**Foreign Keys:**
- requester_id → requester
- friend_id → friend

### games
*28 rows | Sample size: 28*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | uuid | No | 100% |  |
| course_id | integer | No | 11% | Range: 1-3 |
| creator_user_id | uuid | No | 14% |  |
| game_description | null | Yes (26) | 7% |  |
| scoring_format | varchar | No | 4% | Length: NaN-NaN (avg: 10) |
| weather_condition | varchar | No | 11% | Length: NaN-NaN (avg: 8) |
| status | varchar | No | 14% | Length: NaN-NaN (avg: 7) |
| created_at | timestamp | No | 100% |  |
| started_at | null | Yes (28) | 0% |  |
| completed_at | null | Yes (11) | 61% |  |
| notes | null | Yes (28) | 0% |  |
| notes_updated_by | null | Yes (28) | 0% |  |
| notes_updated_at | null | Yes (28) | 0% |  |

**Foreign Keys:**
- course_id → course
- creator_user_id → creator_user

### game_participants
*47 rows | Sample size: 47*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | uuid | No | 100% |  |
| game_id | uuid | No | 45% |  |
| user_id | uuid | No | 11% |  |
| tee_box_id | integer | No | 13% | Range: 2-18 |
| handicap_index | integer | No | 9% | Range: 20-34.6 |
| course_handicap | integer | No | 19% | Range: 23-42 |
| playing_handicap | integer | No | 19% | Range: 23-42 |
| match_handicap | integer | No | 19% | Range: 0-41, Zeros: 20 |
| total_strokes | null | Yes (17) | 45% |  |
| total_putts | null | Yes (31) | 19% |  |
| net_score | null | Yes (17) | 45% |  |
| front_nine_strokes | null | Yes (17) | 47% |  |
| back_nine_strokes | null | Yes (33) | 19% |  |
| holes_won | integer | No | 2% | Range: 0-0, Zeros: 47 |
| holes_lost | integer | No | 2% | Range: 0-0, Zeros: 47 |
| holes_halved | integer | No | 2% | Range: 0-0, Zeros: 47 |

**Foreign Keys:**
- game_id → game
- user_id → user
- tee_box_id → tee_box

### game_hole_scores
*308 rows | Sample size: 100*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | uuid | No | 100% |  |
| game_id | uuid | No | 3% |  |
| user_id | uuid | No | 2% |  |
| hole_number | integer | No | 18% | Range: 1-18 |
| strokes | integer | No | 4% | Range: 3-6 |
| putts | integer | No | 3% | Range: 0-2, Zeros: 98 |
| hole_par | integer | No | 3% | Range: 3-5 |
| hole_handicap_strokes | integer | No | 2% | Range: 0-1, Zeros: 64 |
| net_score | integer | No | 5% | Range: 2-6 |
| score_vs_par | integer | No | 5% | Range: -2-2, Zeros: 44, Negatives: 31 |
| updated_at | timestamp | No | 50% |  |

**Foreign Keys:**
- game_id → game
- user_id → user

### game_invitations
*0 rows | Sample size: 0*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| [No data for analysis] | unknown | No | - |  |

### game_statistics
*0 rows | Sample size: 0*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| [No data for analysis] | unknown | No | - |  |

### user_statistics
*0 rows | Sample size: 0*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| [No data for analysis] | unknown | No | - |  |

### countries
*1 rows | Sample size: 1*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-1 |
| code | varchar | No | 100% | Length: NaN-NaN (avg: 2) |
| code3 | varchar | No | 100% | Length: NaN-NaN (avg: 3) |
| name | varchar | No | 100% | Length: NaN-NaN (avg: 5) |
| continent | varchar | No | 100% | Length: NaN-NaN (avg: 6) |
| created_at | timestamp | No | 100% |  |

### regions
*1 rows | Sample size: 1*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-1 |
| country_id | integer | No | 100% | Range: 1-1 |
| code | varchar | No | 100% | Length: NaN-NaN (avg: 3) |
| name | varchar | No | 100% | Length: NaN-NaN (avg: 6) |
| type | varchar | No | 100% | Length: NaN-NaN (avg: 20) |
| created_at | timestamp | No | 100% |  |

**Foreign Keys:**
- country_id → country

### golf_clubs
*1 rows | Sample size: 1*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-1 |
| external_id | varchar | No | 100% | Length: NaN-NaN (avg: 21) |
| slug | varchar | No | 100% | Length: NaN-NaN (avg: 21) |
| name | varchar | No | 100% | Length: NaN-NaN (avg: 21) |
| country_id | integer | No | 100% | Range: 1-1 |
| region_id | integer | No | 100% | Range: 1-1 |
| city | varchar | No | 100% | Length: NaN-NaN (avg: 10) |
| address | varchar | No | 100% | Length: NaN-NaN (avg: 36) |
| postal_code | null | Yes (1) | 0% |  |
| latitude | decimal | No | 100% | Range: 40.516479-40.516479 |
| longitude | decimal | No | 100% | Range: -3.617651--3.617651, Negatives: 1 |
| established_year | integer | No | 100% | Range: 1973-1973 |
| designer | varchar | No | 100% | Length: NaN-NaN (avg: 13) |
| architect | null | Yes (1) | 0% |  |
| club_type | varchar | No | 100% | Length: NaN-NaN (avg: 7) |
| has_royal_prefix | boolean | No | 100% | T:1 / F:0 |
| website | varchar | No | 100% | Length: NaN-NaN (avg: 34) |
| phone | varchar | No | 100% | Length: NaN-NaN (avg: 15) |
| email | null | Yes (1) | 0% |  |
| booking_url | null | Yes (1) | 0% |  |
| data_source | varchar | No | 100% | Length: NaN-NaN (avg: 6) |
| source_updated_at | null | Yes (1) | 0% |  |
| confidence_score | decimal | No | 100% | Range: 0.95-0.95 |
| is_verified | boolean | No | 100% | T:0 / F:1 |
| created_at | timestamp | No | 100% |  |
| updated_at | timestamp | No | 100% |  |

**Foreign Keys:**
- external_id → external
- country_id → country
- region_id → region

### golf_courses
*5 rows | Sample size: 5*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-5 |
| club_id | integer | No | 20% | Range: 1-1 |
| external_id | null | Yes (5) | 0% |  |
| name | varchar | No | 100% | Length: NaN-NaN (avg: 21) |
| course_number | integer | No | 100% | Range: 0-4, Zeros: 1 |
| course_type | varchar | No | 40% | Length: NaN-NaN (avg: 8) |
| par | integer | No | 40% | Range: 54-72 |
| holes | integer | No | 20% | Range: 18-18 |
| total_yardage | null | Yes (5) | 0% |  |
| total_meters | null | Yes (5) | 0% |  |
| designed_year | integer | Yes (1) | 60% | Range: 1976-2012 |
| designer | varchar | Yes (1) | 20% | Length: NaN-NaN (avg: 13) |
| course_style | varchar | No | 20% | Length: NaN-NaN (avg: 8) |
| latitude | decimal | No | 40% | Range: 40.516479-40.517 |
| longitude | decimal | No | 40% | Range: -3.617651--3.617, Negatives: 5 |
| altitude_meters | null | Yes (5) | 0% |  |
| status | varchar | No | 20% | Length: NaN-NaN (avg: 6) |
| season_start_month | null | Yes (5) | 0% |  |
| season_end_month | null | Yes (5) | 0% |  |
| booking_url | null | Yes (5) | 0% |  |
| scorecard_url | null | Yes (5) | 0% |  |
| layout_map_url | null | Yes (5) | 0% |  |
| created_at | timestamp | No | 20% |  |
| updated_at | timestamp | No | 20% |  |

**Foreign Keys:**
- club_id → club
- external_id → external

### holes
*90 rows | Sample size: 90*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-90 |
| course_id | integer | No | 6% | Range: 1-5 |
| hole_number | integer | No | 20% | Range: 1-18 |
| hole_name | null | Yes (90) | 0% |  |
| par | integer | No | 3% | Range: 3-5 |
| handicap_index | integer | No | 20% | Range: 1-18 |
| has_water | boolean | No | 1% | T:0 / F:90 |
| has_bunkers | boolean | No | 1% | T:0 / F:90 |
| dogleg_direction | null | Yes (90) | 0% |  |
| notes | null | Yes (90) | 0% |  |
| signature_hole | boolean | No | 1% | T:0 / F:90 |
| created_at | timestamp | No | 2% |  |
| updated_at | timestamp | No | 2% |  |

**Foreign Keys:**
- course_id → course

### tee_boxes
*20 rows | Sample size: 20*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-20 |
| course_id | integer | No | 25% | Range: 1-5 |
| name | varchar | No | 35% | Length: NaN-NaN (avg: 5) |
| color | varchar | No | 35% | Length: NaN-NaN (avg: 5) |
| color_hex | null | Yes (20) | 0% |  |
| gender | varchar | No | 15% | Length: NaN-NaN (avg: 5) |
| total_yards | integer | No | 100% | Range: 1625-7471 |
| total_meters | integer | No | 100% | Range: 1486-6830 |
| course_rating | decimal | No | 100% | Range: 50.6-76.2 |
| slope_rating | integer | No | 75% | Range: 69-142 |
| bogey_rating | null | Yes (20) | 0% |  |
| front_nine_rating | decimal | No | 100% | Range: 25.3-37.9 |
| front_nine_slope | integer | No | 95% | Range: 69-147 |
| front_nine_bogey | null | Yes (20) | 0% |  |
| back_nine_rating | decimal | No | 95% | Range: 25.3-38.3 |
| back_nine_slope | integer | No | 90% | Range: 69-141 |
| back_nine_bogey | null | Yes (20) | 0% |  |
| display_order | integer | No | 25% | Range: 0-4, Zeros: 5 |
| is_default | boolean | No | 10% | T:5 / F:15 |
| created_at | timestamp | No | 5% |  |
| updated_at | timestamp | No | 5% |  |

**Foreign Keys:**
- course_id → course

### hole_distances
*360 rows | Sample size: 100*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 6-105 |
| hole_id | integer | No | 24% | Range: 1-24 |
| tee_box_id | integer | No | 9% | Range: 1-9 |
| yards | integer | No | 50% | Range: 80-579 |
| meters | integer | No | 50% | Range: 73-530 |
| yards_to_layup | null | Yes (100) | 0% |  |
| yards_to_carry | null | Yes (100) | 0% |  |
| created_at | timestamp | No | 2% |  |

**Foreign Keys:**
- hole_id → hole
- tee_box_id → tee_box

### club_amenities
*1 rows | Sample size: 1*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-1 |
| club_id | integer | No | 100% | Range: 1-1 |
| has_driving_range | boolean | No | 100% | T:1 / F:0 |
| has_putting_green | boolean | No | 100% | T:1 / F:0 |
| has_chipping_area | boolean | No | 100% | T:1 / F:0 |
| has_practice_bunker | boolean | No | 100% | T:1 / F:0 |
| has_pro_shop | boolean | No | 100% | T:1 / F:0 |
| has_restaurant | boolean | No | 100% | T:1 / F:0 |
| has_bar | boolean | No | 100% | T:1 / F:0 |
| has_accommodation | boolean | No | 100% | T:0 / F:1 |
| has_cart_rental | boolean | No | 100% | T:1 / F:0 |
| has_club_rental | boolean | No | 100% | T:1 / F:0 |
| has_caddie_service | boolean | No | 100% | T:1 / F:0 |
| has_lessons | boolean | No | 100% | T:1 / F:0 |
| has_locker_room | boolean | No | 100% | T:1 / F:0 |
| has_conference_facilities | boolean | No | 100% | T:0 / F:1 |
| has_wedding_facilities | boolean | No | 100% | T:0 / F:1 |
| notes | null | Yes (1) | 0% |  |
| created_at | timestamp | No | 100% |  |
| updated_at | timestamp | No | 100% |  |

**Foreign Keys:**
- club_id → club

### course_images
*4 rows | Sample size: 4*

| Column | Type | Nullable | Unique | Statistics |
|--------|------|----------|--------|------------|
| id | integer | No | 100% | Range: 1-4 |
| course_id | integer | No | 100% | Range: 1-4 |
| hole_id | null | Yes (4) | 0% |  |
| image_data | text | No | 100% | Length: NaN-NaN (avg: 439078) |
| mime_type | varchar | No | 25% | Length: NaN-NaN (avg: 10) |
| file_size | integer | No | 100% | Range: 113776-317351 |
| image_type | varchar | No | 25% | Length: NaN-NaN (avg: 6) |
| title | varchar | No | 100% | Length: NaN-NaN (avg: 34) |
| description | null | Yes (4) | 0% |  |
| width | null | Yes (4) | 0% |  |
| height | null | Yes (4) | 0% |  |
| display_order | integer | No | 25% | Range: 0-0, Zeros: 4 |
| is_primary | boolean | No | 25% | T:0 / F:4 |
| is_thumbnail | boolean | No | 25% | T:0 / F:4 |
| created_at | timestamp | No | 100% |  |

**Foreign Keys:**
- course_id → course
- hole_id → hole


# Feature: Golf Courses Data Management

## Overview
Comprehensive golf course data management system for Golf X app, allowing users to browse, search, and view detailed information about golf courses. Initially launching with La Moraleja Golf Club data, with the architecture designed to scale to thousands of courses worldwide.

## User Stories
- As a user, I want to browse golf courses to find where to play
- As a user, I want to view detailed course information including hole layouts and distances
- As a user, I want to see course ratings and slope for different tee boxes
- As a user, I want to access course scorecards for my rounds
- As a developer, I want a debug interface to verify course data integrity

## Technical Architecture

### Database Schema
The system uses a hierarchical structure:
- **Countries** → **Regions** → **Golf Clubs** → **Golf Courses** → **Tee Boxes** & **Holes** → **Hole Distances**

### Core Tables
1. **golf_clubs** - Club information (name, location, contact, amenities)
2. **golf_courses** - Individual courses within a club (can be multiple per club)
3. **tee_boxes** - Different tee positions with ratings/slope
4. **holes** - Individual hole information (par, handicap, features)
5. **hole_distances** - Distance from each tee box to each hole

### Data Source
- Initial data: La Moraleja Golf Club (Madrid, Spain)
  - 4 full 18-hole courses
  - 1 pitch & putt course
  - Complete scorecard data for all tee boxes
  - Course ratings and slope ratings

## Implementation Plan

### Phase 1: Database Setup ✅
- Create feature branch
- Analyze existing SQL schemas
- Adapt schema to current Supabase database
- Create necessary tables with RLS policies
- Insert La Moraleja test data

### Phase 2: Debug Interface
- Create `/debug/courses` route
- Build course list view showing:
  - Club name and location
  - Number of courses
  - Course types (18-hole, pitch-putt)
  - Basic statistics

### Phase 3: Course Detail View
- Create `/debug/course/:id` route
- Display comprehensive course information:
  - Course header (name, designer, year, style)
  - Tee box selector with ratings/slope
  - Interactive scorecard table
  - Hole-by-hole breakdown
  - Visual distance indicators

### Phase 4: User-Facing Features
- Add "Courses" tab to main navigation
- Create search/filter functionality
- Implement course favorites
- Add course to round tracking

## UI/UX Flow

```
Debug Tab
    ↓
Courses (List View)
    ├── Search/Filter Bar
    ├── Course Cards
    │   ├── Club Name
    │   ├── Location
    │   ├── Course Count
    │   └── Quick Stats
    └── Course Card (Click)
        ↓
Course Detail (Full Screen)
    ├── Header Section
    │   ├── Course Name
    │   ├── Club Name
    │   └── Location
    ├── Info Section
    │   ├── Designer
    │   ├── Year Built
    │   ├── Course Style
    │   └── Par/Holes
    ├── Tee Box Selector
    │   ├── Color/Name
    │   ├── Total Distance
    │   ├── Rating/Slope
    │   └── Gender
    └── Scorecard Section
        ├── Front Nine
        ├── Back Nine
        └── Totals
```

## Component Structure

### Pages
- `src/pages/debug/Courses.tsx` - Course list view
- `src/pages/debug/CourseDetail.tsx` - Individual course view

### Components
- `src/components/courses/CourseCard.tsx` - List item component
- `src/components/courses/TeeBoxSelector.tsx` - Tee selection widget
- `src/components/courses/Scorecard.tsx` - Interactive scorecard display
- `src/components/courses/HoleDetail.tsx` - Individual hole information

### API Functions
- `src/lib/courses.ts`
  - `getCourses()` - Fetch all courses with club data
  - `getCourseById(id)` - Get single course with all details
  - `getCourseScorecard(courseId, teeBoxId)` - Get scorecard data
  - `searchCourses(query, filters)` - Search functionality

## Database Migrations

### Required Tables
```sql
-- Core structure
CREATE TABLE countries
CREATE TABLE regions  
CREATE TABLE golf_clubs
CREATE TABLE golf_courses
CREATE TABLE tee_boxes
CREATE TABLE holes
CREATE TABLE hole_distances

-- Optional for future
CREATE TABLE club_amenities
CREATE TABLE course_rankings
CREATE TABLE course_conditions
```

### RLS Policies
- Public read access for all course data
- Admin-only write access
- User favorites require authentication

## Acceptance Criteria
- [ ] Database schema created and populated with La Moraleja data
- [ ] Debug courses list page displays all courses
- [ ] Course detail page shows complete scorecard
- [ ] Tee box selector updates distances dynamically
- [ ] Mobile-responsive design following iOS guidelines
- [ ] Performance: < 2s load time for course list
- [ ] Performance: < 1s for scorecard updates

## Future Enhancements
- Course photos and hole flyovers
- Weather conditions integration
- Green fee pricing
- Tee time booking integration
- User reviews and ratings
- Course comparison tool
- GPS/distance tracking during play
- Tournament history
- Practice facility details
- Course conditions updates

## Technical Considerations
- Data validation for scorecard integrity
- Efficient queries with proper indexes
- Caching strategy for course data
- Offline support for viewed courses
- Geolocation for nearby courses
- Internationalization for course names/descriptions

## Testing Requirements
- Unit tests for data transformation functions
- Integration tests for API endpoints
- E2E tests for user flows
- Performance tests for large datasets
- Mobile device testing (iOS/Android)
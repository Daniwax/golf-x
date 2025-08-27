# Golf Courses Debug Section Feature

## 📋 Overview
Add a "Courses" section to the Debug page that allows developers to view and verify all golf course data from the database, ensuring data integrity and correct relationships between tables.

## 🎯 Purpose
- Verify that course data is correctly stored in Supabase
- Debug data relationships between tables
- Provide a visual interface to inspect course information
- Test Supabase queries and data fetching

## 📱 User Flow

### Navigation Structure
```
Debug Page (/debug)
    └── Courses Section [Button/Link]
        └── Courses List Page (/debug/courses)
            └── Course Detail Page (/debug/courses/:id)
                ├── Course Info Tab
                ├── Tee Boxes Tab
                ├── Holes Tab
                └── Amenities Tab
```

## 🗂️ Database Schema Reference

### Tables and Relationships
```sql
golf_clubs (1)
    └── golf_courses (1:many)
        ├── tee_boxes (1:many)
        └── holes (1:many)
            └── hole_distances (many:many with tee_boxes)
    └── club_amenities (1:1)

countries (1) → regions (1:many)
    └── golf_clubs (many:1)
```

## 📄 Pages to Create

### 1. **Debug Page Update** (`src/pages/Debug.tsx`)
Add "Courses" button to existing debug sections:
```tsx
interface DebugSection {
  title: string;
  icon: string;
  route: string;
  description: string;
}

// Add to sections:
{
  title: "Courses",
  icon: golfOutline,
  route: "/debug/courses",
  description: "View golf courses data from database"
}
```

### 2. **Courses List Page** (`src/pages/debug/CoursesList.tsx`)

**Features:**
- Display all courses from database
- Show key info: Name, Par, Holes, Status
- Search/filter functionality
- Click to navigate to detail page

**Data to Fetch:**
```typescript
interface CourseListItem {
  id: number;
  name: string;
  club_name: string;
  par: number;
  holes: number;
  course_type: string;
  status: string;
}

// Supabase Query
const { data: courses } = await supabase
  .from('golf_courses')
  .select(`
    id,
    name,
    par,
    holes,
    course_type,
    status,
    golf_clubs (
      name
    )
  `)
  .order('course_number', { ascending: true });
```

**UI Layout:**
```
┌─────────────────────────────────┐
│ < Back   Golf Courses           │
├─────────────────────────────────┤
│ [Search Bar]                    │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ La Moraleja Course 1        │ │
│ │ Par 72 • 18 holes • Active  │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ La Moraleja Course 2        │ │
│ │ Par 72 • 18 holes • Active  │ │
│ └─────────────────────────────┘ │
│ ...                             │
└─────────────────────────────────┘
```

### 3. **Course Detail Page** (`src/pages/debug/CourseDetail.tsx`)

**Features:**
- Tab navigation for different data sections
- Display all related data from joined tables
- Raw JSON view option for debugging

**Tabs Structure:**

#### Tab 1: Course Info
```typescript
interface CourseInfo {
  id: number;
  name: string;
  club: {
    name: string;
    address: string;
    city: string;
    website: string;
    phone: string;
  };
  course_number: number;
  course_type: string;
  par: number;
  holes: number;
  designer: string;
  designed_year: number;
  course_style: string;
  latitude: number;
  longitude: number;
  status: string;
}
```

#### Tab 2: Tee Boxes
```typescript
interface TeeBox {
  id: number;
  name: string;
  color: string;
  gender: string;
  total_yards: number;
  total_meters: number;
  course_rating: number;
  slope_rating: number;
  front_nine_rating: number;
  back_nine_rating: number;
}
```

#### Tab 3: Holes
```typescript
interface Hole {
  hole_number: number;
  par: number;
  handicap_index: number;
  distances: {
    tee_name: string;
    yards: number;
    meters: number;
  }[];
}
```

#### Tab 4: Amenities
```typescript
interface Amenities {
  has_driving_range: boolean;
  has_putting_green: boolean;
  has_chipping_area: boolean;
  has_practice_bunker: boolean;
  has_pro_shop: boolean;
  has_restaurant: boolean;
  has_bar: boolean;
  has_cart_rental: boolean;
  has_club_rental: boolean;
  has_caddie_service: boolean;
  has_lessons: boolean;
  has_locker_room: boolean;
}
```

**UI Layout:**
```
┌─────────────────────────────────┐
│ < Back   La Moraleja Course 1   │
├─────────────────────────────────┤
│ [Info] [Tees] [Holes] [Amenities]│
├─────────────────────────────────┤
│                                 │
│ (Tab Content)                   │
│                                 │
├─────────────────────────────────┤
│ [View Raw JSON]                 │
└─────────────────────────────────┘
```

## 🔧 Implementation Details

### Routes to Add (`src/App.tsx`)
```tsx
// Add to routing configuration
<Route exact path="/debug/courses" component={CoursesList} />
<Route path="/debug/courses/:id" component={CourseDetail} />
```

### Supabase Queries

#### Get All Courses
```typescript
const fetchCourses = async () => {
  const { data, error } = await supabase
    .from('golf_courses')
    .select(`
      *,
      golf_clubs (
        name,
        city,
        club_type
      )
    `)
    .order('id', { ascending: true });
    
  return data;
};
```

#### Get Course with All Related Data
```typescript
const fetchCourseDetail = async (courseId: number) => {
  // Get course with club info
  const { data: course } = await supabase
    .from('golf_courses')
    .select(`
      *,
      golf_clubs (*)
    `)
    .eq('id', courseId)
    .single();
    
  // Get tee boxes
  const { data: teeBoxes } = await supabase
    .from('tee_boxes')
    .select('*')
    .eq('course_id', courseId)
    .order('display_order');
    
  // Get holes with distances
  const { data: holes } = await supabase
    .from('holes')
    .select(`
      *,
      hole_distances (
        *,
        tee_boxes (name, color)
      )
    `)
    .eq('course_id', courseId)
    .order('hole_number');
    
  // Get amenities
  const { data: amenities } = await supabase
    .from('club_amenities')
    .select('*')
    .eq('club_id', course.club_id)
    .single();
    
  return {
    course,
    teeBoxes,
    holes,
    amenities
  };
};
```

## 🎨 UI Components

### Course Card Component
```tsx
interface CourseCardProps {
  course: CourseListItem;
  onClick: () => void;
}

<IonCard onClick={onClick}>
  <IonCardHeader>
    <IonCardTitle>{course.name}</IonCardTitle>
    <IonCardSubtitle>
      {course.club_name}
    </IonCardSubtitle>
  </IonCardHeader>
  <IonCardContent>
    <IonChip color="primary">Par {course.par}</IonChip>
    <IonChip>{course.holes} holes</IonChip>
    <IonChip color={course.status === 'active' ? 'success' : 'medium'}>
      {course.status}
    </IonChip>
  </IonCardContent>
</IonCard>
```

### Data Display Component
```tsx
interface DataItemProps {
  label: string;
  value: any;
}

<IonItem>
  <IonLabel>
    <h3>{label}</h3>
    <p>{JSON.stringify(value, null, 2)}</p>
  </IonLabel>
</IonItem>
```

## ✅ Acceptance Criteria

- [ ] Debug page has "Courses" button that navigates to courses list
- [ ] Courses list shows all courses from database
- [ ] Each course is clickable and navigates to detail page
- [ ] Course detail page shows all tabs with correct data
- [ ] All Supabase queries work correctly
- [ ] Data relationships are properly displayed
- [ ] Raw JSON view is available for debugging
- [ ] Navigation works correctly (back buttons, etc.)
- [ ] Loading states are shown while fetching data
- [ ] Error handling for failed queries
- [ ] Empty states for missing data

## 📊 Data Verification Checklist

When viewing courses, verify:
- [ ] All 5 courses appear (4 regular + 1 pitch & putt)
- [ ] Par totals match expected values (72 for courses 1-4, 54 for P&P)
- [ ] Tee boxes show correct ratings and distances
- [ ] All 18 holes appear for each course (or 9 for P&P)
- [ ] Hole handicaps are 1-18 with no duplicates
- [ ] Club amenities are displayed correctly
- [ ] Course status shows as "active"

## 🚀 Future Enhancements

- Add edit functionality (for admin users)
- Export data to CSV/JSON
- Add data validation checks
- Show course images when available
- Add scorecard view
- Calculate course statistics
- Add map view with course location

## 📝 Notes

- This is a debug feature - not intended for end users
- Use Ionic components for consistent UI
- Follow existing app patterns for navigation
- Ensure proper TypeScript types for all data
- Consider adding this to admin section in future
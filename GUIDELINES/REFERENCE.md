# Golf X - Technical Reference

## Database Schema - Quick Overview

### Actual Tables in Production (13 tables, 139 columns)

#### User & Game Tables (Currently Empty)
- **profiles** - User profiles with handicap
- **games** - Game instances  
- **game_participants** - Players in games
- **game_hole_scores** - Individual hole scores

#### Golf Course Structure (With Data)
- **countries** (id, code, name, continent)
- **regions** (id, country_id→countries, code, name)  
- **golf_clubs** (id, name, city, lat/lng, website, phone)
- **golf_courses** (id, club_id→clubs, name, par, holes, yardage)

#### Course Details
- **holes** (id, course_id→courses, hole_number, par, handicap_index)
- **tee_boxes** (id, course_id→courses, color, rating, slope)
- **hole_distances** (hole_id→holes, tee_box_id→tee_boxes, yards)

#### Additional
- **course_images** (course_id, hole_id, image_data)
- **club_amenities** (club_id, facilities booleans)

### Key Relationships
- Country → Regions → Golf Clubs → Courses
- Course → 18 Holes + 4-6 Tee Boxes
- Hole ↔ Tee Box (via hole_distances)
- Game → Participants + Hole Scores

### Schema Documentation & Tools

#### Available Schema Files
- `GUIDELINES/DATABASE_SCHEMA.md` - Complete schema reference (manually maintained)
- `GUIDELINES/DATABASE_SCHEMA_SIMPLE.md` - Auto-generated compact overview with row counts
- `GUIDELINES/DATABASE_DIAGNOSTIC.md` - Auto-generated health check report

#### Database Scripts
```bash
# Generate compact schema overview
node GUIDELINES/scripts/schema_overview.mjs
# → Outputs: DATABASE_SCHEMA_SIMPLE.md

# Run comprehensive health check
node GUIDELINES/scripts/database_diagnostic.mjs  
# → Outputs: DATABASE_DIAGNOSTIC.md (report) + database_diagnostic.json (data)
```

**Diagnostic Features:**
- Data quality score (0-100)
- NULL pattern analysis (>50% warnings)
- Duplicate ID detection
- Numeric range analysis
- Test data identification
- Foreign key validation

---

## Environment Variables

### Required for Development
```env
# Supabase (client-side - must start with VITE_)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Optional for local Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Required in GitHub Secrets
```
VITE_SUPABASE_URL         # Supabase project URL
VITE_SUPABASE_ANON_KEY    # Supabase anonymous key
FLY_API_TOKEN_STAGING     # Fly.io staging deploy token
FLY_API_TOKEN             # Fly.io production deploy token
```

### Docker Build Args
Set in Dockerfile and passed via GitHub Actions:
```dockerfile
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
```

---

## API Patterns

### Supabase Client Usage

**Authentication:**
```typescript
import { supabase } from '../lib/supabase';

// Sign in with Google
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin }
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

**Database Queries:**
```typescript
// Fetch with relations
const { data, error } = await supabase
  .from('game_hole_scores')
  .select(`
    *,
    games (
      status,
      golf_courses (name)
    )
  `)
  .eq('user_id', userId)
  .eq('hole_number', holeNumber);

// Insert with RLS
const { error } = await supabase
  .from('game_hole_scores')
  .insert({
    game_id: gameId,
    user_id: userId,  // Must match auth.uid() due to RLS
    hole_number: 1,
    strokes: 5
  });
```

**Real-time Subscriptions:**
```typescript
const subscription = supabase
  .channel('game-scores')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'game_hole_scores' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();
```

---

## Common Patterns

### Handicap Calculations
```typescript
// Course Handicap
const courseHandicap = Math.round(
  handicapIndex * (slopeRating / 113) + (courseRating - par)
);

// Playing Handicap (95% for singles)
const playingHandicap = Math.round(courseHandicap * 0.95);

// Match Handicap (strokes received)
const matchHandicap = playingHandicap - lowestPlayingHandicap;
```

### Score Validation
```typescript
// Valid score range per hole
const MIN_SCORE = 0;  // For picked up
const MAX_SCORE = 25; // Reasonable maximum

// Valid handicap index range
const MIN_HANDICAP = 0.0;
const MAX_HANDICAP = 54.0;
```

### Error Handling
```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Database error:', error);
  // Show user-friendly message
  return [];
}
```

---

## Troubleshooting

### Common Issues

#### "placeholder.supabase.co" Error
**Cause:** Environment variables not loaded
**Fix:** 
1. Check `.env` file exists
2. Verify `VITE_` prefix on variables
3. Restart dev server
4. Check Docker build args in CI

#### RLS Policy Violation
**Error:** "new row violates row-level security policy"
**Fix:**
1. Check user is authenticated: `auth.uid()`
2. Verify policy conditions match
3. Test policy in Supabase dashboard

#### TypeScript Import Errors
**Common fixes:**
```typescript
// Import types explicitly
import type { RefresherEventDetail } from '@ionic/react';

// Use proper Supabase types
import type { Database } from '../lib/database.types';
```

#### Port 5173 Already in Use
```bash
# Windows
netstat -ano | findstr :5173
powershell -Command "Stop-Process -Id PID_NUMBER -Force"

# Mac/Linux
lsof -i :5173
kill -9 PID_NUMBER
```

### Debug Commands

```bash
# Check Supabase connection
npm run dev
# Open browser console:
console.log(import.meta.env.VITE_SUPABASE_URL)

# View Fly.io logs
flyctl logs --app golf-x-staging --since 10m

# Check GitHub Actions
# Visit: https://github.com/Daniwax/golf-x/actions

# Database migrations status
npx supabase db diff
npx supabase migration list
```

### Support Resources

- Ionic Docs: https://ionicframework.com/docs
- Supabase Docs: https://supabase.com/docs
- Fly.io Status: https://status.fly.io
- GitHub Actions Logs: Check workflow runs

---

## Security Checklist

- [ ] All tables have RLS enabled
- [ ] Policies use `auth.uid()` for user checks
- [ ] No secrets in code (use env vars)
- [ ] No `any` types exposing data
- [ ] Input validation on all forms
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Rate limiting on API calls
- [ ] HTTPS only in production

---
*For development workflow, see `DEVELOPMENT_GUIDE.md`*
*For quick overview, see `AGENT_QUICKSTART.md`*
# Golf X - Agent Quick Start Guide

## Project Overview
**Golf X** is a mobile-first golf tracking PWA that helps players monitor games, track statistics, and participate in tournaments.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Ionic 8 (iOS mode)
- Backend: Supabase (PostgreSQL + Auth + Realtime)
- Deployment: GitHub Actions → Fly.io (Staging/Production)
- Routing: React Router v5 (Ionic requirement - NOT outdated)

## Critical Requirements

### 1. Branch Management
```bash
# ALWAYS check current branch first
git branch --show-current

# NEVER work on develop/main directly
git checkout -b feature/your-feature

# ALL changes require Pull Request (except hotfixes - ask user)
```

### 2. Security - Supabase RLS
**EVERY new table MUST have Row Level Security:**
```sql
-- After creating ANY table:
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Add appropriate policies:
CREATE POLICY "policy_name" ON your_table
    FOR SELECT USING (auth.uid() IS NOT NULL);  -- Example: authenticated users
```

Common patterns:
- Public read: `FOR SELECT USING (true)`
- User owns record: `FOR ALL USING (auth.uid() = user_id)`
- Game participants: See `game_hole_scores` policies in migrations

### 3. Development Rules
- **TypeScript**: No `any` without justification
- **Mobile First**: Test at 375px viewport minimum
- **Port 5173 Only**: Kill existing process if blocked
- **Environment Variables**: VITE_ prefix required for client-side

### 4. Testing Before Push
```bash
npm run typecheck    # MUST pass
npm run lint         # MUST pass
npm run build        # MUST succeed
```

## Project Structure
```
golf-x/
├── src/
│   ├── pages/         # Route components
│   ├── components/    # Reusable components
│   ├── features/      # Feature modules
│   │   └── normal-game/
│   │       └── services/
│   └── lib/          # Utilities & hooks
│       ├── supabase.ts
│       └── useAuth.ts
├── supabase/
│   └── migrations/    # Database migrations
├── GUIDELINES/        # Documentation (PRIVATE - not in git)
│   ├── features/normal_game/
│   │   └── database_schema_used.md  # DB schema reference
│   └── ...
└── .github/workflows/ # CI/CD pipelines
```

## Database Schema
Schema documentation:
- `GUIDELINES/DATABASE_SCHEMA.md` - Complete schema reference (manually maintained)
- `GUIDELINES/DATABASE_SCHEMA_SIMPLE.md` - Auto-generated compact overview
- `GUIDELINES/DATABASE_DIAGNOSTIC.md` - Auto-generated health check report

Key tables:
- `profiles` - User profiles with handicap
- `games` - Game instances
- `game_participants` - Players in each game
- `game_hole_scores` - Individual hole scores

## Database Diagnostic Tools
Available scripts in `GUIDELINES/scripts/`:

### schema_overview.mjs
```bash
# Generate compact schema with row counts
node GUIDELINES/scripts/schema_overview.mjs
# Output: DATABASE_SCHEMA_SIMPLE.md
```

### database_diagnostic.mjs
```bash
# Run full database health check
node GUIDELINES/scripts/database_diagnostic.mjs
# Outputs: DATABASE_DIAGNOSTIC.md + database_diagnostic.json
```

Features:
- Detects duplicate IDs, NULL patterns, data anomalies
- Calculates data quality score (0-100)
- Groups warnings by category
- Uses service role key to bypass RLS

## Deployment Flow
```
feature → PR → develop → [auto-deploy staging] → PR → main → [auto-deploy production]
```

- **Staging**: golf-x-staging.fly.dev (automatic on develop merge)
- **Production**: golf-x.fly.dev (automatic on main merge)
- **User approval required** for all PR merges

## Common Issues & Solutions

### Port 5173 Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :5173
# Note the PID, then:
powershell -Command "Get-Process -Id PID_NUMBER | Stop-Process -Force"
```

### Environment Variables Not Working
- Must use `VITE_` prefix
- Check: `console.log(import.meta.env.VITE_SUPABASE_URL)`
- Never commit `.env` file

### TypeScript Errors
```bash
# Check specific file
npx tsc --noEmit src/pages/YourFile.tsx
```

### React Hooks Error
Call ALL hooks before ANY conditional returns:
```typescript
// CORRECT
const auth = useAuth();
if (!isConfigured) return <Error />;

// WRONG
if (!isConfigured) return <Error />;
const auth = useAuth(); // Never reached!
```

## Where to Find More

| Topic | Document |
|-------|----------|
| Development workflow | `DEVELOPMENT_GUIDE.md` |
| Deployment details | `DEVELOPMENT_GUIDE.md` (Part 2) |
| Database schema (full) | `DATABASE_SCHEMA.md` |
| Database schema (compact) | `DATABASE_SCHEMA_SIMPLE.md` |
| Database health report | `DATABASE_DIAGNOSTIC.md` |
| Database tools | `scripts/schema_overview.mjs`, `scripts/database_diagnostic.mjs` |
| API & Env vars | `REFERENCE.md` |
| Feature specs | `features/normal_game/feature_specification.md` |

## First Steps

1. **Setup Environment**
   ```bash
   npm ci
   cp .env.example .env  # Edit with Supabase credentials
   npm run dev           # Must use port 5173
   ```

2. **Verify Setup**
   - Open http://localhost:5173
   - Check browser console for errors
   - Try Google login

3. **Make Changes**
   ```bash
   git checkout -b feature/your-feature
   # ... make changes ...
   npm run typecheck && npm run lint
   git add . && git commit -m "feat: description"
   git push origin feature/your-feature
   # Create PR on GitHub
   ```

## Need Help?

- Check existing code patterns first
- Database issues: Check RLS policies
- Deployment issues: Check GitHub Actions logs
- Fly.io logs: `flyctl logs --app golf-x-staging`

---
*Last updated: 2025-01-28*
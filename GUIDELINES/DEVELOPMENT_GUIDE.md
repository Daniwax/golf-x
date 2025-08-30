# Golf X - Development & Deployment Guide

## Part 1: Development Workflow

### Feature Development Process

#### 1. Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/feature-name
git branch --show-current  # Verify you're on feature branch
```

Branch naming:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `hotfix/` - Emergency production fixes (can skip PR - ask user)

#### 2. Development Setup

**Local Environment:**
```bash
npm ci                    # Clean install dependencies
cp .env.example .env      # Setup environment variables
npm run dev               # Start dev server on port 5173
```

**Environment Variables (`.env`):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

#### 3. Code Standards

**TypeScript:**
- Avoid `any` - use proper types
- Import types from Ionic when needed
- Define interfaces for all props/data

**⚠️ CRITICAL: IonRadioGroup Bug in iOS Mode**
```typescript
// ❌ BROKEN - IonRadioGroup doesn't work properly in iOS mode
<IonRadioGroup value={value} onIonChange={e => setValue(e.detail.value)}>
  <IonItem>
    <IonLabel>Option</IonLabel>
    <IonRadio slot="end" value="option1" />
  </IonItem>
</IonRadioGroup>

// ✅ WORKAROUND - Use onClick on IonItem
<IonRadioGroup value={value}>
  <IonItem onClick={() => setValue('option1')}>
    <IonLabel>Option</IonLabel>
    <IonRadio slot="end" value="option1" />
  </IonItem>
</IonRadioGroup>
```
This is a known Ionic bug (GitHub #25695). Radio buttons in iOS mode don't register clicks properly when using standard onIonChange.

**Component Patterns:**
```typescript
// Use Ionic components
import { IonPage, IonContent } from '@ionic/react';

// Custom hooks go in lib/
import { useAuth } from '../lib/useAuth';

// Feature services in features/
import { holeStatsService } from '../features/normal-game/services/holeStatsService';
```

**Mobile-First:**
- Test at 375px minimum width
- Use Ionic CSS variables
- Pull-to-refresh on lists

#### 4. Pre-Commit Checklist

```bash
# 1. Quality checks
npm run typecheck         # No TypeScript errors
npm run lint              # No linting issues
npm run build             # Build succeeds

# 2. Security check
npm audit --audit-level=high

# 3. Test locally
npm run dev
# - Test your feature
# - Check mobile viewport
# - Verify auth flow works
```

#### 5. Creating Pull Request

**Push feature branch:**
```bash
git add .
git commit -m "feat: clear description"
git push origin feature/feature-name
```

**PR Description Template:**
```markdown
## Problem
What issue does this solve?

## Solution
How does it solve it?

## Changes
- [ ] Change 1
- [ ] Change 2

## Testing
1. How to test
2. Expected results

## Checklist
- [ ] TypeScript passes
- [ ] Linter passes
- [ ] Mobile responsive
- [ ] No console errors
```

---

## Part 2: Database Development

### Creating New Tables

**CRITICAL: Every table needs RLS:**
```sql
-- 1. Create table
CREATE TABLE your_table (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    -- other columns
);

-- 2. ALWAYS enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- 3. Add policies
CREATE POLICY "Users can view own records" ON your_table
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON your_table
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Migration Files

Location: `supabase/migrations/`

Naming: `YYYYMMDDHHMMSS_description.sql`

**Apply migration:**
```bash
npx supabase db push        # Apply to local
# Or use Supabase dashboard for remote
```

---

## Part 3: Deployment Process

### Deployment Pipeline
```
feature → PR → develop → [AUTO staging] → PR → main → [AUTO production]
```

### Stage 1: Feature to Develop

1. **Create PR** on GitHub
2. **Wait for user approval**
3. **User merges PR**
4. **Automatic deployment to staging** begins

### Stage 2: Staging Deployment (Automatic)

**Triggered by:** Push to `develop` branch

**GitHub Actions performs:**
1. TypeScript check
2. Lint check
3. Build application
4. Deploy to Fly.io staging

**Monitor deployment:**
- GitHub Actions: https://github.com/Daniwax/golf-x/actions
- Staging URL: https://golf-x-staging.fly.dev

**Verify staging:**
```bash
# Check deployment
curl -I https://golf-x-staging.fly.dev

# View logs if issues
flyctl logs --app golf-x-staging
```

### Stage 3: Production Deployment

1. **Test thoroughly on staging**
2. **Get user approval**: "Deploy to production"
3. **Create PR**: develop → main
4. **User merges PR**
5. **Automatic deployment to production**

**Production URL:** https://golf-x.fly.dev

---

## Part 4: Troubleshooting Deployments

### Build Fails in CI

**TypeScript errors:**
```bash
npm run typecheck  # Fix locally first
```

**Missing environment variables:**
- Check GitHub Secrets settings
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `FLY_API_TOKEN`

**Package issues:**
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: regenerate package-lock"
```

### App Crashes After Deploy

**Check logs:**
```bash
flyctl logs --app golf-x-staging --since 10m
flyctl status --app golf-x-staging
```

**Common issues:**
- Environment variables not passed to Docker
- Port binding issues
- Memory limits exceeded

### Emergency Rollback

**Immediate rollback (keeps app running):**
```bash
flyctl releases list --app golf-x
flyctl deploy --app golf-x --image <previous-image-id>
```

**Then fix in code:**
```bash
git checkout main
git revert HEAD
git push origin main
```

---

## Part 5: CI/CD Configuration

### GitHub Actions Workflows

**Staging** (`.github/workflows/staging.yml`):
- Trigger: Push to `develop`
- Deploy to: golf-x-staging.fly.dev

**Production** (`.github/workflows/deploy.yml`):
- Trigger: Push to `main`
- Deploy to: golf-x.fly.dev

### Fly.io Configuration

**Files:**
- `Dockerfile` - Build configuration
- `fly.toml` - Production config
- `fly.staging.toml` - Staging config

**Important:** Dockerfile contains ARG directives for env vars:
```dockerfile
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
```

---

## Daily Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Test production build
npm run preview         # Preview built app

# Quality checks
npm run typecheck       # TypeScript validation
npm run lint            # Code style check
npm run check:all       # Run all checks

# Dependencies
npm run check:security  # Security audit
npm run check:deps      # Find unused deps
npm run check:updates   # Check for updates

# Git workflow
git branch --show-current
git status
git pull origin develop
git checkout -b feature/name
git push origin feature/name
```

---

## Key Rules Summary

1. **Never** work directly on develop/main
2. **Always** enable RLS on new tables
3. **Always** run typecheck & lint before push
4. **Always** test on staging before production
5. **Always** get user approval for PRs
6. **Never** commit `.env` files
7. **Never** use port other than 5173 for dev

---
*For database schema and API reference, see `REFERENCE.md`*
# Development Authentication Bypass Implementation Guide

## Overview
This document outlines the implementation of a development-only authentication bypass for Golf X to enable testing without Google login.

## CRITICAL SAFETY REQUIREMENTS
- **MUST** only work in development environment
- **MUST** never activate in staging or production
- **MUST** be visually obvious when active
- **MUST** not contain any real user credentials

## Implementation Plan

### Step 1: Modify useAuth.ts
Location: `src/lib/useAuth.ts`

Add the following at the top of the useAuth function:

```typescript
// Development-only auth bypass
const DEV_AUTH_ENABLED = 
  import.meta.env.DEV && 
  import.meta.env.MODE === 'development' &&
  !window.location.hostname.includes('fly.dev') &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const mockDevUser = DEV_AUTH_ENABLED ? {
  id: 'dev-user-001',
  email: 'dev@localhost',
  user_metadata: {
    full_name: 'Development User',
    avatar_url: null
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z'
} : null;
```

### Step 2: Modify the useEffect Hook
In the same file, update the useEffect to check for dev mode:

```typescript
useEffect(() => {
  // Development bypass
  if (DEV_AUTH_ENABLED && window.location.search.includes('devAuth=true')) {
    setUser(mockDevUser as User);
    setSession({
      user: mockDevUser,
      access_token: 'dev-token',
      expires_at: Date.now() + 3600000
    } as Session);
    setLoading(false);
    
    // Show warning in console
    console.warn('⚠️ DEVELOPMENT AUTH BYPASS ACTIVE ⚠️');
    return;
  }
  
  // ... rest of existing auth code
}, []);
```

### Step 3: Add Visual Indicator Component
Create: `src/components/DevAuthWarning.tsx`

```typescript
import React from 'react';
import { IonChip } from '@ionic/react';

export const DevAuthWarning: React.FC = () => {
  const isDev = import.meta.env.DEV && window.location.search.includes('devAuth=true');
  
  if (!isDev) return null;
  
  return (
    <IonChip 
      color="danger" 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999
      }}
    >
      DEV AUTH ACTIVE
    </IonChip>
  );
};
```

### Step 4: Add Warning to App.tsx
Add the warning component to the main App component:

```typescript
import { DevAuthWarning } from './components/DevAuthWarning';

// In the render:
return (
  <IonApp>
    <DevAuthWarning />
    {/* rest of app */}
  </IonApp>
);
```

## Usage Instructions

### To Activate Dev Auth:
1. Ensure you're running locally with `npm run dev`
2. Navigate to: `http://localhost:5173?devAuth=true`
3. You should see:
   - "DEV AUTH ACTIVE" chip in top-right corner
   - Console warning message
   - Immediate access to all authenticated pages

### To Take Screenshots with Playwright:
```javascript
await page.goto('http://localhost:5173?devAuth=true');
await page.goto('http://localhost:5173/courses');
// Now can access any protected route
```

## Testing Checklist

- [ ] Works with `?devAuth=true` in URL
- [ ] Does NOT work without the parameter
- [ ] Shows visual warning chip
- [ ] Console warning appears
- [ ] Can access all protected routes
- [ ] Profile shows "Development User"
- [ ] Build for production removes all dev code
- [ ] Staging deployment doesn't allow bypass
- [ ] Production deployment doesn't allow bypass

## Rollback Instructions

If issues occur, simply:
1. Remove changes from `src/lib/useAuth.ts`
2. Delete `src/components/DevAuthWarning.tsx`
3. Remove import from `App.tsx`

## Security Verification

Before deploying to staging/production:
1. Run `npm run build`
2. Check that built files don't contain "DEV_AUTH_ENABLED"
3. Test staging URL without bypass working
4. Verify no console warnings in production

## Implementation Status

- [ ] Document created
- [ ] useAuth.ts modified
- [ ] DevAuthWarning component created
- [ ] App.tsx updated
- [ ] Local testing completed
- [ ] Build verification done
- [ ] Staging verification done

---
Created: 2025-01-28
Purpose: Enable development without authentication
Risk Level: Low (multiple safety checks)
# CI/CD Local Validation Guide

## Overview
This guide ensures your code passes GitHub Actions CI/CD checks BEFORE pushing to GitHub, preventing failed builds and broken deployments.

## Quick Start

### Before Every Push
```bash
npm run ci
```

This command runs the EXACT same checks as GitHub Actions:
1. TypeScript type checking (`tsc --noEmit`)
2. ESLint code quality (`eslint .`)
3. Build verification (optional)

## Available Commands

### Main Validation Commands
```bash
npm run ci          # Quick pre-push validation (recommended)
npm run ci:check    # Same as 'ci'
npm run pre-push    # Same as 'ci'
npm run ci:strict   # Strict version checking (advanced)
```

### Individual Checks
```bash
npm run typecheck   # TypeScript only
npm run lint        # ESLint only
npm run build       # Production build test
```

## What Gets Checked

### Critical Checks (Must Pass)
These checks run in GitHub Actions and MUST pass for CI/CD to succeed:

1. **TypeScript Check** (`npm run typecheck`)
   - Verifies all types are correct
   - No `any` types without proper typing
   - All imports resolve correctly

2. **ESLint Check** (`npm run lint`)
   - Code style consistency
   - React hooks rules
   - Import organization

### Non-Critical Checks
These help catch issues early but won't block CI/CD:

1. **Build Test** (`npm run build`)
   - Verifies production build works
   - Catches runtime issues
   - Bundle size validation

## CI/CD Pipeline Matching

### GitHub Actions Workflow
Our CI/CD runs these exact commands:
```yaml
steps:
  - npm ci          # Install exact dependencies
  - npm run typecheck   # Must pass
  - npm run lint        # Must pass
  - flyctl deploy       # Deploy if checks pass
```

### Local Validation Script
The `npm run ci` command replicates this exactly:
```javascript
1. Check environment (Node 20+, npm 9+)
2. Verify package-lock.json exists
3. Run: npm run typecheck
4. Run: npm run lint
5. Run: npm run build (optional)
```

## Version Requirements

### Minimum Versions (CI/CD uses latest)
- **Node.js**: 20.x or higher (CI uses latest stable)
- **npm**: 9.x or higher (comes with Node)
- **TypeScript**: ~5.8.3 (from package.json)
- **ESLint**: ^9.33.0 (from package.json)

### Check Your Versions
```bash
node --version    # Should be v20+ 
npm --version     # Should be 9+
npx tsc --version # Should match package.json
npx eslint --version # Should match package.json
```

## Common Issues & Solutions

### Issue: TypeScript Errors
```
error TS2448: Block-scoped variable used before declaration
```
**Solution**: Fix variable hoisting issues. Declare functions before use.

### Issue: ESLint Errors
```
error: 'any' type detected
```
**Solution**: Add proper TypeScript types. Import from '@ionic/react' when needed.

### Issue: npm ci Fails Locally
```
EPERM: operation not permitted
```
**Solution**: Close VS Code/editors, stop dev server, then retry.

### Issue: Build Fails But TypeScript Passes
```
tsc passes but vite build fails
```
**Solution**: Build has stricter settings. Fix all TypeScript errors.

## Workflow Best Practices

### 1. Before Starting Work
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

### 2. During Development
```bash
npm run dev         # Development server
npm run typecheck   # Check types frequently
npm run lint        # Check code style
```

### 3. Before Committing
```bash
npm run ci          # Run full validation
# Fix any errors
git add .
git commit -m "feat: your feature"
```

### 4. Before Pushing
```bash
npm run ci          # Final validation
git push origin feature/your-feature
```

### 5. After Pushing
- Create Pull Request on GitHub
- Watch GitHub Actions for CI/CD status
- Fix any issues if CI/CD fails

## Strict Mode (Advanced)

For exact version matching with CI/CD:
```bash
npm run ci:strict
```

This checks:
- Exact Node.js version compatibility
- Exact npm version compatibility
- Package-lock.json integrity
- All tool versions match

## Troubleshooting CI/CD Failures

### If CI/CD Fails on GitHub but Passes Locally

1. **Check Node Version**
   ```bash
   node --version
   ```
   CI uses Node 20+. Update if needed.

2. **Clean Install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run ci
   ```

3. **Check Environment Variables**
   CI has different env vars. Check `.env` vs GitHub Secrets.

4. **Review GitHub Actions Logs**
   - Go to Actions tab on GitHub
   - Click failed workflow
   - Read exact error message
   - Match command that failed

## Script Locations

All validation scripts are in `/scripts/`:
- `pre-push-check.js` - Main validation (simple)
- `validate-ci-strict.js` - Strict validation (advanced)
- `ci-check.js` - Wrapper script

## Integration with Git Hooks (Optional)

To automatically validate before push:
```bash
# Create git pre-push hook
echo 'npm run ci' > .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

## Summary

1. **Always run `npm run ci` before pushing**
2. **Fix all TypeScript and ESLint errors**
3. **Ensure package-lock.json is committed**
4. **Use Node 20+ for compatibility**
5. **Watch GitHub Actions after pushing**

Remember: If it fails locally, it WILL fail in CI/CD. If it passes locally with `npm run ci`, it should pass in GitHub Actions.
# Testing Best Practices for Golf X

## Overview
This guide provides best practices and common patterns for testing Golf X, complementing the Playwright guide with broader testing strategies.

## Development Authentication Testing

### When to Use Dev Auth Bypass
- **Local Development**: Testing protected routes without real authentication
- **Automated Testing**: Running Playwright or other automated tests
- **Screenshots**: Capturing UI states for documentation
- **Debugging**: Accessing user-specific features quickly

### When NOT to Use Dev Auth Bypass
- **Production Testing**: Never attempt in production
- **Security Testing**: Use real authentication flow
- **User Flow Testing**: Test actual login/signup process
- **Performance Testing**: May not reflect real auth overhead

## Testing Strategies by Feature

### 1. Course Features
```javascript
// Test Data Available
// Courses 1-5 are pre-populated with:
// - Course details (name, location, par)
// - 18 holes each with specific par values
// - Tee information (color, rating, slope)

// Example: Verify course data loads
await page.goto('http://localhost:5173?devAuth=true');
await page.goto('http://localhost:5173/course/1');
await page.waitForSelector('h1:has-text("Bally Golf Club")');
```

### 2. Game Creation Flow
```javascript
// Multi-step process testing
// Step 1: Create game
await page.goto('http://localhost:5173/game/create');
// Step 2: Add participants
await page.click('ion-button:has-text("Next")');
// Step 3: Configure players
// Step 4: Start game
```

### 3. Statistics Testing
```javascript
// Stats require existing game data
// Use dev auth to access, then verify:
// - Career statistics load
// - Hole statistics display
// - Charts render correctly
```

## Mobile Testing Considerations

### Viewport Sizes
```javascript
// Common mobile viewports for Golf X
const viewports = {
  'iPhone 12': { width: 375, height: 812 },
  'iPhone 14 Pro Max': { width: 428, height: 926 },
  'Samsung Galaxy S21': { width: 384, height: 854 },
  'iPad Mini': { width: 768, height: 1024 }
};
```

### Touch Interactions
```javascript
// Ionic swipe gestures
await page.touchscreen.tap(x, y);
await page.swipe({ from: {x: 100, y: 400}, to: {x: 300, y: 400} });

// Pull to refresh
await page.swipe({ from: {x: 200, y: 100}, to: {x: 200, y: 400} });
```

## Data Testing Patterns

### 1. Async Data Loading
```javascript
// Pattern: Wait for data indicators
await page.waitForSelector('ion-content');
await page.waitForSelector('.data-loaded'); // Custom indicator
await page.waitForFunction(() => {
  return document.querySelectorAll('ion-card').length > 0;
});
```

### 2. Empty State Testing
```javascript
// Test when no data exists
await page.goto('http://localhost:5173/stats');
await page.waitForSelector('.empty-state');
expect(await page.textContent('.empty-state')).toContain('No games played');
```

### 3. Error State Testing
```javascript
// Simulate network errors
await page.route('**/api/**', route => route.abort());
await page.goto('http://localhost:5173/courses');
await page.waitForSelector('.error-message');
```

## Component Testing Patterns

### Ionic Components
```javascript
// Ion-Select
await page.click('ion-select');
await page.click('ion-select-option:has-text("Option 1")');

// Ion-Toggle
await page.click('ion-toggle');
const isChecked = await page.isChecked('ion-toggle');

// Ion-Range
await page.fill('ion-range', '50');

// Ion-Datetime
await page.click('ion-datetime');
await page.click('.datetime-day:has-text("15")');
```

### Custom Components
```javascript
// Avatar Upload (with dev auth)
await page.setInputFiles('input[type="file"]', 'path/to/image.jpg');
await page.waitForSelector('.upload-success');

// Game Score Input
await page.fill('input[name="hole-1-score"]', '4');
await page.keyboard.press('Tab');
```

## Performance Testing Tips

### 1. Measure Load Times
```javascript
const startTime = Date.now();
await page.goto('http://localhost:5173/courses');
await page.waitForSelector('ion-card');
const loadTime = Date.now() - startTime;
console.log(`Page loaded in ${loadTime}ms`);
```

### 2. Check Bundle Size
```bash
npm run build
# Check dist folder size
# Main bundle should be < 500KB
```

### 3. Network Monitoring
```javascript
// Monitor API calls
page.on('request', request => {
  if (request.url().includes('/api/')) {
    console.log('API Call:', request.url());
  }
});
```

## Debugging Techniques

### 1. Visual Debugging
```javascript
// Slow down actions
await page.click('ion-button', { delay: 100 });

// Highlight elements
await page.evaluate(() => {
  document.querySelector('ion-button').style.border = '2px solid red';
});
```

### 2. Console Logging
```javascript
// Capture console messages
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

// Inject debug helpers
await page.evaluate(() => {
  window.DEBUG = true;
});
```

### 3. Network Debugging
```javascript
// Log all network requests
page.on('request', request => {
  console.log('>>', request.method(), request.url());
});

page.on('response', response => {
  console.log('<<', response.status(), response.url());
});
```

## Common Pitfalls to Avoid

### 1. Race Conditions
```javascript
// BAD: Assuming immediate render
await page.goto('http://localhost:5173/courses');
await page.click('ion-card'); // May fail

// GOOD: Wait for element
await page.goto('http://localhost:5173/courses');
await page.waitForSelector('ion-card');
await page.click('ion-card');
```

### 2. Hard-Coded Waits
```javascript
// BAD: Fixed timeout
await page.waitForTimeout(5000);

// GOOD: Wait for condition
await page.waitForSelector('.data-loaded', { timeout: 5000 });
```

### 3. Forgetting Mobile Context
```javascript
// BAD: Desktop assumptions
await page.hover('ion-button'); // No hover on mobile!

// GOOD: Mobile interactions
await page.tap('ion-button');
```

## Testing Checklist

### Before Testing
- [ ] Dev server running (`npm run dev`)
- [ ] Database accessible
- [ ] Test data available
- [ ] Mobile viewport set
- [ ] Dev auth enabled (if needed)

### During Testing
- [ ] Wait for async operations
- [ ] Handle loading states
- [ ] Check error scenarios
- [ ] Verify mobile interactions
- [ ] Capture screenshots for documentation

### After Testing
- [ ] Clear test data (if needed)
- [ boundary Clean up test artifacts
- [ ] Document any issues found
- [ ] Update test cases
- [ ] Commit test improvements

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Playwright Tests
  run: |
    npm ci
    npm run dev &
    sleep 5
    npx playwright test
  env:
    CI: true
```

### Pre-commit Testing
```bash
# Add to package.json scripts
"test:pre-commit": "playwright test --grep @critical"
```

## Security Testing Reminders

### Always Verify
1. Dev auth bypass NEVER works in production
2. RLS policies are enforced
3. API routes require authentication
4. Sensitive data is protected
5. CORS is properly configured

### Never Test in Production
- No dev auth attempts
- No automated testing
- No load testing
- No security scanning
- Use staging environment instead

---

**Created**: 2025-01-28
**Purpose**: Best practices for testing Golf X
**Audience**: Developers and QA agents
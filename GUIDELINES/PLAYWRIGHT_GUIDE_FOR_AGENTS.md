# Playwright Guide for Agents Testing Golf X

## Quick Start - Testing Golf X with Dev Auth

### Step 1: Enable Development Auth Bypass
```javascript
// Navigate to the app with dev auth enabled
await page.goto('http://localhost:5173?devAuth=true');

// You can now access ANY protected page directly!
await page.goto('http://localhost:5173/courses');
await page.goto('http://localhost:5173/stats');
await page.goto('http://localhost:5173/profile');
```

### Step 2: Mobile Viewport Setup
Golf X is mobile-first. Always set mobile viewport:
```javascript
// iPhone 12 Pro viewport (recommended)
await page.setViewportSize({ width: 375, height: 812 });

// Or use device emulation
const iPhone = playwright.devices['iPhone 12'];
await browser.newContext({
  ...iPhone,
  // Additional context options
});
```

## Complete Working Examples

### Example 1: Take Screenshot of Course Page
```javascript
// Full example that works
await page.goto('http://localhost:5173?devAuth=true');
await page.setViewportSize({ width: 375, height: 812 });
await page.goto('http://localhost:5173/course/1');

// Wait for content to load
await page.waitForSelector('ion-content', { timeout: 10000 });
await page.waitForTimeout(2000); // Let async data load

// Take screenshot
await page.screenshot({ 
  path: '<agent_name>_course-1.png',
  fullPage: false // Use false for viewport screenshot
});
```

### Example 2: Navigate and Interact
```javascript
// Navigate through the app
await page.goto('http://localhost:5173?devAuth=true');
await page.setViewportSize({ width: 375, height: 812 });

// Go to Profile
await page.goto('http://localhost:5173/profile');
await page.waitForSelector('ion-content');

// Click on Friends
await page.click('ion-item:has-text("Friends")');
await page.waitForURL('**/friends');

// Take screenshot
await page.screenshot({ path: 'friends-page.png' });
```

### Example 3: Scroll and Capture
```javascript
// Scroll down a page
await page.goto('http://localhost:5173?devAuth=true');
await page.goto('http://localhost:5173/course/1');
await page.waitForSelector('ion-content');

// Scroll down
await page.evaluate(() => {
  const content = document.querySelector('ion-content');
  if (content) {
    content.scrollToPoint(0, 500, 300);
  }
});

await page.waitForTimeout(500); // Wait for scroll animation
await page.screenshot({ path: 'course-scrolled.png' });
```

## Important Ionic-Specific Selectors

### Ionic Components
```javascript
// Wait for Ionic components
await page.waitForSelector('ion-content');
await page.waitForSelector('ion-header');
await page.waitForSelector('ion-tab-bar');

// Click Ionic items
await page.click('ion-button:has-text("Submit")');
await page.click('ion-item:has-text("Golf Courses")');
await page.click('ion-tab-button[tab="stats"]');

// Ionic inputs
await page.fill('ion-input[name="email"]', 'test@example.com');
await page.fill('ion-textarea', 'Some text');
```

### Golf X Specific Elements
```javascript
// Wait for course cards
await page.waitForSelector('ion-card');

// Wait for statistics
await page.waitForSelector('.stats-card');

// Wait for game elements
await page.waitForSelector('.hole-entry');
```

## Critical Best Practices

### 1. ALWAYS Use Dev Auth for Protected Routes
```javascript
// WRONG - Will redirect to login
await page.goto('http://localhost:5173/courses');

// CORRECT - Bypasses authentication
await page.goto('http://localhost:5173?devAuth=true');
await page.goto('http://localhost:5173/courses');
```

### 2. Wait for Async Data
```javascript
// Golf X loads data asynchronously
await page.goto('http://localhost:5173/course/1');
await page.waitForSelector('ion-content');
await page.waitForTimeout(2000); // IMPORTANT: Let data load
```

### 3. Handle Ionic Navigation
```javascript
// Ionic uses special routing
await page.waitForURL('**/friends'); // Use wildcard for Ionic URLs
await page.waitForSelector('ion-content'); // Wait for page transition
```

### 4. Mobile Gestures
```javascript
// Swipe in Ionic
await page.touchscreen.tap(100, 100);
await page.mouse.down();
await page.mouse.move(100, 300);
await page.mouse.up();
```

## Troubleshooting Common Issues

### Issue: "Cannot access page - redirects to login"
**Solution**: Make sure you navigate to `?devAuth=true` first
```javascript
await page.goto('http://localhost:5173?devAuth=true'); // REQUIRED FIRST
```

### Issue: "Element not found"
**Solution**: Wait for Ionic components and data
```javascript
await page.waitForSelector('ion-content', { timeout: 10000 });
await page.waitForTimeout(2000); // For async data
```

### Issue: "Screenshot is blank/white"
**Solution**: Wait for content to render
```javascript
await page.waitForSelector('ion-card'); // Wait for specific content
await page.waitForTimeout(1000); // Additional render time
```

### Issue: "Navigation doesn't work"
**Solution**: Use Ionic-aware navigation
```javascript
// Don't use page.click('a[href="/courses"]')
// Use:
await page.click('ion-item:has-text("Golf Courses")');
await page.waitForURL('**/courses');
```

## Testing Different Features

### Test Game Creation
```javascript
await page.goto('http://localhost:5173?devAuth=true');
await page.goto('http://localhost:5173/game/create');
await page.waitForSelector('ion-content');
// Continue with game creation steps...
```

### Test Statistics
```javascript
await page.goto('http://localhost:5173?devAuth=true');
await page.goto('http://localhost:5173/stats');
await page.waitForSelector('.stats-card');
await page.screenshot({ path: 'stats.png' });
```

### Test Profile Features
```javascript
await page.goto('http://localhost:5173?devAuth=true');
await page.goto('http://localhost:5173/profile');
await page.waitForSelector('ion-avatar');
// Test avatar, settings, etc.
```

## Security Reminders

### Dev Auth ONLY Works When:
1. Running locally (`npm run dev`)
2. URL includes `?devAuth=true`
3. Hostname is `localhost` or `127.0.0.1`
4. NOT in production build
5. NOT on any `*.fly.dev` domain

### Visual Indicators When Active:
- Red "DEV AUTH ACTIVE" chip in top-right
- Console warning message
- Mock user shows as "Development User"

## Complete Test Script Template

```javascript
const { chromium } = require('playwright');

async function testGolfX() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  const page = await context.newPage();
  
  try {
    // Enable dev auth
    await page.goto('http://localhost:5173?devAuth=true');
    
    // Test courses
    await page.goto('http://localhost:5173/courses');
    await page.waitForSelector('ion-content');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'courses-list.png' });
    
    // Test specific course
    await page.goto('http://localhost:5173/course/1');
    await page.waitForSelector('ion-card');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'course-detail.png' });
    
    // Scroll and capture
    await page.evaluate(() => {
      document.querySelector('ion-content')?.scrollToPoint(0, 500, 300);
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'course-scrolled.png' });
    
    console.log('Tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testGolfX();
```

## Quick Reference Commands

```javascript
// Most common operations for Golf X testing

// 1. Setup
await page.goto('http://localhost:5173?devAuth=true');
await page.setViewportSize({ width: 375, height: 812 });

// 2. Navigation
await page.goto('http://localhost:5173/courses');
await page.goto('http://localhost:5173/stats');
await page.goto('http://localhost:5173/profile');

// 3. Waits
await page.waitForSelector('ion-content');
await page.waitForTimeout(2000);
await page.waitForURL('**/courses');

// 4. Clicks
await page.click('ion-item:has-text("Golf Courses")');
await page.click('ion-tab-button[tab="stats"]');

// 5. Screenshots
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ path: 'full.png', fullPage: true });

// 6. Scroll
await page.evaluate(() => {
  document.querySelector('ion-content')?.scrollToPoint(0, 500, 300);
});
```

---

**Created**: 2025-01-28
**Purpose**: Guide for agents to test Golf X with Playwright
**Last Updated**: 2025-01-28
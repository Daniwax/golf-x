# Golf X Design Principles

## Core Philosophy
**Apple-inspired mobile-first design** with premium aesthetics and maximum content density.

## 🎨 Visual Design

### Color Palette
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Text on Gradient**: White with varying opacity
  - Primary text: `rgba(255,255,255,1)`
  - Secondary text: `rgba(255,255,255,0.8)`
  - Tertiary text: `rgba(255,255,255,0.7)`
- **Background**: Use Ionic CSS variables
  - Light: `var(--ion-color-step-50)`
  - Cards: `var(--ion-color-step-100)`

### Typography
- **Headers**: 
  - H1: `28px`, `font-weight: 700`, `letter-spacing: -0.5px`
  - H2: `18px`, `font-weight: 600`
  - H3: `16px`, `font-weight: 600`
- **Body**: `14-15px`, regular weight
- **Notes**: `12-13px`, use `IonNote` component
- **Font Family**: System default (San Francisco on iOS)

## 📱 Mobile Layout Principles

### Full-Width Design
```css
/* NO lateral margins on mobile */
margin: '0 0 16px 0'  /* Only bottom margin */
borderRadius: '0px'    /* No rounded corners on full-width cards */
padding: '0'           /* Container padding */
```

### Vertical Space Optimization
- **Minimize headers**: Remove unnecessary headers when possible
- **Compact spacing**: 
  - Between cards: `16px`
  - Internal padding: `16-20px`
- **No redundant information**: Every element must add value

### Card-Based Layout
```typescript
<IonCard style={{ 
  margin: '0 0 16px 0',
  borderRadius: '0px',
  boxShadow: 'none',
  borderBottom: '1px solid var(--ion-color-step-100)'
}}>
```

## 🎯 Component Patterns

### Profile/Header Cards
```typescript
// Gradient header card with decorative elements
<IonCard style={{ 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '0px',
  margin: '0 0 16px 0',
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Decorative circles */}
  <div style={{
    position: 'absolute',
    top: '-20px',
    right: '-20px',
    width: '80px',
    height: '80px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '50%'
  }} />
</IonCard>
```

### Navigation Items
```typescript
<IonItem button onClick={() => history.push('/route')}>
  <IonIcon icon={iconName} slot="start" color="primary" />
  <IonLabel>
    <h3>Title</h3>
    <p>Description</p>
  </IonLabel>
  <IonIcon icon={arrowForwardOutline} slot="end" color="medium" />
</IonItem>
```

### Loading States
```typescript
const [loading, setLoading] = useState(true);

// Prevent content flash
{loading ? (
  <div style={{
    height: '50vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <IonSpinner color="primary" />
  </div>
) : (
  // Content here
)}
```

## 🔧 Functional Patterns

### Form Editing
- **Inline editing**: Edit mode toggles within the same view
- **Glass morphism**: Use semi-transparent overlays for edit forms
```css
background: 'rgba(255,255,255,0.12)'
backdropFilter: 'blur(10px)'
```

### Data Management
- **Load on mount**: Fetch data in useEffect with proper loading states
- **Optimistic updates**: Show changes immediately, handle errors gracefully
- **Single source of truth**: Database fields map directly to UI state

### User Feedback
- **Toast notifications**: Success/error messages
- **Loading spinners**: During async operations
- **Disabled states**: Prevent double submissions

## 🚀 Performance Guidelines

### Image Optimization
- **Avatars**: Use initials instead of images when possible
- **Lazy loading**: Load images only when visible
- **Size constraints**: Fixed dimensions for predictable layouts

### State Management
- **Minimize re-renders**: Use proper React hooks and memoization
- **Batch updates**: Group related state changes
- **Avoid prop drilling**: Use context for deeply nested data

## 📐 Spacing System

### Standard Spacings
- **4px**: Minimum spacing between related elements
- **8px**: Small gap (icons from text)
- **12px**: Medium gap (between form fields)
- **16px**: Standard gap (between cards)
- **20px**: Large gap (section spacing)

### Padding Guidelines
- **Card content**: `20px` horizontal, `16-20px` vertical
- **List items**: Use default Ionic padding
- **Buttons**: `16px` horizontal minimum

## ✨ Interactive Elements

### Buttons
- **Primary action**: Gradient background or solid color
- **Secondary action**: Outline or clear style
- **Icon buttons**: 28-32px touch target minimum

### Cards
- **Clickable cards**: Add `button` prop and hover states
- **Visual feedback**: Subtle shadow or opacity change
- **Navigation hint**: Arrow icon on the right

## 🎭 Animation Guidelines

### Transitions
- **Duration**: 200-300ms for most transitions
- **Easing**: Use native iOS easing functions
- **Properties**: Transform and opacity preferred over layout changes

### Loading States
- **Skeleton screens**: For initial loads
- **Spinners**: For action feedback
- **Progress bars**: For multi-step processes

## 📝 Content Guidelines

### Text Hierarchy
1. **Primary info**: User's main data (name, score)
2. **Secondary info**: Supporting details (email, date)
3. **Tertiary info**: Additional context (descriptions)

### Empty States
- **Informative**: Explain why it's empty
- **Actionable**: Provide next steps
- **Visual**: Use icons or illustrations

## 🔒 Accessibility

### Touch Targets
- **Minimum size**: 44x44px for all interactive elements
- **Spacing**: 8px minimum between targets
- **Visual feedback**: Clear focus states

### Color Contrast
- **Text on gradient**: Ensure WCAG AA compliance
- **Interactive elements**: Clear visual distinction
- **Error states**: Use semantic colors

## 🏗️ Implementation Checklist

When creating a new page:
- [ ] Remove unnecessary headers
- [ ] Use full-width cards (no lateral margins)
- [ ] Apply gradient to primary card
- [ ] Add loading states for async data
- [ ] Include proper error handling
- [ ] Use consistent spacing (16px between cards)
- [ ] Add navigation arrows to clickable items
- [ ] Ensure 44px minimum touch targets
- [ ] Test on mobile viewport (no horizontal scroll)
- [ ] Verify save functionality works with database

## 📱 Responsive Breakpoints

While Golf X is mobile-first, consider tablet views:
- **Mobile**: 0-768px (primary target)
- **Tablet**: 768px-1024px (center content, add max-width)
- **Desktop**: 1024px+ (not prioritized, basic support)

## 🎯 Key Principles Summary

1. **Mobile-first**: Every pixel counts on mobile screens
2. **Content over chrome**: Minimize UI, maximize content
3. **Consistent patterns**: Reuse established components
4. **Premium feel**: Gradients, glass morphism, smooth transitions
5. **Fast feedback**: Loading states, optimistic updates
6. **Accessibility**: Large touch targets, clear visual hierarchy
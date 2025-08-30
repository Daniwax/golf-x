# Golf Club Scorecard Design System

## Overview
This document contains the complete design system for the golf club-style scorecard implemented in the GhostConfig component. This design transforms standard cards into authentic-looking golf club scorecards.

## Color Palette

```css
/* Primary Colors */
--golf-cream: #f8f6f0;        /* Main card background */
--golf-tan-border: #d4c4a0;   /* Borders and dividers */
--golf-green: #2a5434;         /* Primary green (headers, NET score) */
--golf-green-light: #3d7c47;  /* Lighter green for gradients */
--golf-gold: #b8860b;          /* Gold/bronze for GROSS score */
--golf-brown: #8b7355;         /* Muted brown for labels and secondary text */
```

## Typography

```css
/* Font Families */
--font-serif: 'Georgia, serif';  /* Main scorecard numbers */
--font-classic: 'serif';         /* Labels and headers */
--font-signature: '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive'; /* Signature style */
```

## Complete Golf Scorecard Component

### Main Card Container
```jsx
<div style={{
  background: '#f8f6f0',
  borderRadius: '8px',
  padding: '24px 20px 20px',
  margin: '16px 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  border: '1px solid #d4c4a0',
  position: 'relative',
  overflow: 'hidden'
}}>
```

### Green Header Bar (Top Decoration)
```jsx
<div style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '4px',
  background: 'linear-gradient(90deg, #2a5434 0%, #3d7c47 50%, #2a5434 100%)'
}} />
```

### Date Display (Top Right Corner)
```jsx
<div style={{ 
  position: 'absolute',
  top: '10px',
  right: '20px',
  fontSize: '10px', 
  color: '#8b7355',
  fontFamily: 'serif',
  fontStyle: 'italic'
}}>
  {new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })}
</div>
```

### Score Display Section

#### Container for Scores
```jsx
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-around',
  alignItems: 'flex-start',
  marginBottom: '16px',
  paddingTop: '8px'
}}>
```

#### NET Score (Large, Primary)
```jsx
<div style={{ textAlign: 'center' }}>
  <div style={{ 
    fontSize: '9px', 
    color: '#8b7355',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontFamily: 'serif'
  }}>
    NET
  </div>
  <div style={{ 
    fontSize: '48px', 
    fontWeight: '300',
    color: '#2a5434',
    lineHeight: '0.9',
    fontFamily: 'Georgia, serif'
  }}>
    {netScore > 0 ? '+' : ''}{netScore}
  </div>
</div>
```

#### Vertical Divider
```jsx
<div style={{
  width: '1px',
  height: '60px',
  background: 'linear-gradient(180deg, transparent, #d4c4a0, transparent)',
  margin: '0 20px'
}} />
```

#### GROSS Score (Total Strokes)
```jsx
<div style={{ textAlign: 'center' }}>
  <div style={{ 
    fontSize: '9px', 
    color: '#8b7355',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontFamily: 'serif'
  }}>
    GROSS
  </div>
  <div style={{ 
    fontSize: '36px', 
    fontWeight: '600',
    color: '#b8860b',
    lineHeight: '1',
    fontFamily: 'Georgia, serif'
  }}>
    {totalStrokes}
  </div>
</div>
```

### Signature Section

#### Container
```jsx
<div style={{ 
  borderTop: '1px solid #d4c4a0',
  paddingTop: '12px',
  marginTop: '8px',
  textAlign: 'center'
}}>
```

#### Signature-Style Name
```jsx
<div style={{ 
  fontFamily: '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive',
  fontSize: '18px',
  color: '#2a5434',
  marginBottom: '4px',
  transform: 'rotate(-1deg)',  /* Slight rotation for authenticity */
  display: 'inline-block'
}}>
  {playerName}
</div>
```

#### Signature Underline
```jsx
<div style={{
  width: '120px',
  height: '1px',
  background: '#8b7355',
  margin: '0 auto 8px',
  opacity: 0.5
}} />
```

#### Additional Details (Small Print)
```jsx
<div style={{ 
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
  fontSize: '9px',
  color: '#8b7355',
  fontFamily: 'serif',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}}>
  <span>18 HOLES</span>
  <span>•</span>
  <span>SUNNY</span>
</div>
```

#### Course Record Badge (Optional)
```jsx
<div style={{
  marginTop: '8px',
  display: 'inline-block',
  padding: '2px 12px',
  background: '#2a5434',
  color: '#f8f6f0',
  fontSize: '8px',
  fontFamily: 'serif',
  letterSpacing: '1px',
  borderRadius: '2px'
}}>
  COURSE RECORD
</div>
```

## Additional Golf-Style Elements

### Section Headers (Golf Club Style)
```jsx
<h3 style={{ 
  fontSize: '13px', 
  fontWeight: '600', 
  color: '#8b7355',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 8px 0',
  fontFamily: 'serif'
}}>
  SELECT TEE BOX
</h3>
```

### Golf Button Style
```jsx
<button style={{
  backgroundColor: '#2a5434',
  color: '#f8f6f0',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'serif',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  ':hover': {
    backgroundColor: '#3d7c47'
  }
}}>
  Continue
</button>
```

### Golf Input/Selection Box
```jsx
<div style={{
  backgroundColor: '#f8f6f0',
  border: '1px solid #d4c4a0',
  borderRadius: '4px',
  padding: '10px',
  fontFamily: 'serif',
  fontSize: '14px',
  color: '#2a5434'
}}>
  {/* Content */}
</div>
```

## Implementation Notes

### 1. Font Fallbacks
Always provide fallbacks for the signature font as it may not be available on all systems:
```css
fontFamily: '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive'
```

### 2. Color Consistency
Use the defined color palette throughout all golf-themed components for consistency.

### 3. Responsive Considerations
- The card maintains its proportions well on mobile devices
- Font sizes are carefully chosen to be readable but authentic
- The signature rotation (`transform: rotate(-1deg)`) adds authenticity without affecting layout

### 4. Accessibility
- Maintain sufficient color contrast (the green on cream provides good contrast)
- Keep font sizes readable (minimum 9px for small text)
- Use semantic HTML where possible

## How to Apply to Other Components

1. **Import the color palette** at the top of your component or create a shared styles file
2. **Use the golf-cream background** (#f8f6f0) for all card containers
3. **Apply the green header bar** to important sections
4. **Use serif fonts** for labels and headers
5. **Apply the signature font** for personalized elements
6. **Maintain the color hierarchy**: Green for primary, Gold for secondary, Brown for tertiary

## Example: Converting a Regular Card

### Before (Standard Ionic Card):
```jsx
<IonCard>
  <IonCardHeader>
    <IonCardTitle>Title</IonCardTitle>
  </IonCardHeader>
  <IonCardContent>
    Content here
  </IonCardContent>
</IonCard>
```

### After (Golf Club Style):
```jsx
<div style={{
  background: '#f8f6f0',
  borderRadius: '8px',
  padding: '24px 20px 20px',
  margin: '16px 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  border: '1px solid #d4c4a0',
  position: 'relative'
}}>
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #2a5434 0%, #3d7c47 50%, #2a5434 100%)'
  }} />
  
  <h3 style={{
    fontSize: '13px',
    fontWeight: '600',
    color: '#8b7355',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'serif',
    marginBottom: '16px'
  }}>
    Title
  </h3>
  
  <div style={{
    color: '#2a5434',
    fontFamily: 'Georgia, serif'
  }}>
    Content here
  </div>
</div>
```

## Preserved Original Code Location

The complete implementation can be found in:
- **File**: `src/features/normal-game/components/GhostConfig.tsx`
- **Lines**: Approximately 430-602
- **Component**: GhostConfig
- **Section**: Match summary card rendering
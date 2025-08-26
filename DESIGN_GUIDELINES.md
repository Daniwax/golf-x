# Golf X Design Guidelines

## iOS Design Principles

This app follows iOS design principles to ensure a native, intuitive user experience.

### Primary Reference
**Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/

## Key Design Principles

### 1. Visual Design
- **Clean and Minimalist**: Focus on content with minimal chrome
- **Consistent Spacing**: Use standard iOS spacing (8pt grid system)
- **Typography**: SF Pro Display/Text for iOS native feel
- **Colors**: Teal primary (#2DD4BF) with blue secondary (#0EA5E9)

### 2. Component Guidelines

#### Buttons
- Height: 56px for primary actions
- Border radius: 12px
- Font size: 17px
- Font weight: 600 (semibold)

#### Cards
- Background: Pure white in light mode, #2C2C2E in dark mode
- Border radius: 12px
- Subtle shadows for elevation

#### Text Hierarchy
- Title: 32px, weight 600
- Heading: 22px, weight 600  
- Body: 17px, weight 400
- Caption: 15px, weight 400
- Small: 12px, weight 400

### 3. Authentication Flow
- Single sign-on preferred (Google OAuth)
- Clean, centered layout
- App icon prominently displayed
- Minimal text, maximum clarity

### 4. Dark Mode Support
- Automatic switching based on system preference
- Proper contrast ratios maintained
- OLED-friendly dark backgrounds (#1C1C1E)

## Implementation Notes

### Ionic Configuration
```typescript
setupIonicReact({
  mode: 'ios' // Force iOS styling across all platforms
});
```

### CSS Variables
All colors and spacing defined in `src/theme/variables.css` for consistency.

### Component Library
Using Ionic React components with iOS mode for native feel:
- IonButton
- IonCard
- IonContent
- IonPage
- IonText

## Accessibility
- Minimum touch target: 44x44 points
- Proper color contrast (WCAG AA compliant)
- Clear visual hierarchy
- Descriptive labels and hints

## References
- [Apple HIG - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Apple HIG - SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)
- [Apple HIG - Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple HIG - Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Ionic iOS Mode](https://ionicframework.com/docs/theming/platform-styles)
# Phase 7: Enhanced Glassmorphism 🎨

## Overview

Phase 7 introduces a sophisticated glassmorphism design system with backdrop blur, translucent surfaces, depth layering, and shimmer effects. The implementation maintains $ave+'s calm, neutral aesthetic while adding visual depth and premium feel.

## Design Tokens

All glassmorphism tokens are defined in `src/index.css`:

```css
/* Phase 7: Enhanced Glassmorphism Tokens */
--glass-bg: hsla(var(--background), 0.7);              /* 70% opacity background */
--glass-bg-strong: hsla(var(--background), 0.85);      /* 85% opacity - more solid */
--glass-bg-subtle: hsla(var(--background), 0.5);       /* 50% opacity - more transparent */
--glass-bg-hover: hsla(var(--background), 0.75);       /* Hover state */

--glass-border: hsla(var(--foreground), 0.1);          /* 10% opacity border */
--glass-border-strong: hsla(var(--foreground), 0.15);  /* Stronger border */
--glass-border-subtle: hsla(var(--foreground), 0.05);  /* Subtle border */
--glass-border-hover: hsla(var(--foreground), 0.12);   /* Hover state */

--glass-shadow: 0 8px 32px 0 hsla(0, 0%, 0%, 0.12);
--glass-shadow-strong: 0 12px 48px 0 hsla(0, 0%, 0%, 0.18);
--glass-shadow-subtle: 0 4px 16px 0 hsla(0, 0%, 0%, 0.08);
--glass-shadow-elevated: 0 16px 64px 0 hsla(0, 0%, 0%, 0.15);
--glass-shadow-elevated-hover: 0 20px 80px 0 hsla(0, 0%, 0%, 0.2);
```

## Tailwind Utilities

Glassmorphism utilities are configured in `tailwind.config.ts`:

```typescript
// Colors
glass: {
  DEFAULT: "var(--glass-bg)",           // bg-glass
  strong: "var(--glass-bg-strong)",     // bg-glass-strong
  subtle: "var(--glass-bg-subtle)",     // bg-glass-subtle
  hover: "var(--glass-bg-hover)",       // bg-glass-hover
  border: "var(--glass-border)",        // border-glass-border
  "border-strong": "var(--glass-border-strong)",
  "border-subtle": "var(--glass-border-subtle)",
  "border-hover": "var(--glass-border-hover)",
}

// Backdrop Blur
backdropBlur: {
  glass: "12px",          // backdrop-blur-glass
  "glass-strong": "20px", // backdrop-blur-glass-strong
  "glass-subtle": "8px",  // backdrop-blur-glass-subtle
}

// Shadows
boxShadow: {
  glass: "var(--glass-shadow)",                       // shadow-glass
  "glass-strong": "var(--glass-shadow-strong)",       // shadow-glass-strong
  "glass-subtle": "var(--glass-shadow-subtle)",       // shadow-glass-subtle
  "glass-elevated": "var(--glass-shadow-elevated)",   // shadow-glass-elevated
  "glass-elevated-hover": "var(--glass-shadow-elevated-hover)",
}
```

## Components

### GlassCard (Enhanced)

The existing `GlassCard` component has been updated with glassmorphism tokens:

```tsx
import { GlassCard } from "@/components/ui/glass-card";

// Basic usage
<GlassCard>
  <h2>Card Title</h2>
  <p>Card content with glassmorphism effect</p>
</GlassCard>

// With 3D tilt (default)
<GlassCard enableTilt>
  Card with mouse-tracking 3D tilt effect
</GlassCard>

// With glow on hover
<GlassCard glowOnHover>
  Card with glowing shadow on hover
</GlassCard>

// Interactive (clickable)
<GlassCard onClick={() => console.log('clicked')}>
  Clickable glass card
</GlassCard>

// Disabled tilt (for reduced motion)
<GlassCard enableTilt={false}>
  Static glass card (respects user's motion preferences)
</GlassCard>
```

### GlassPanel (Utility Component)

A simpler panel component for layouts:

```tsx
import { GlassPanel } from "@/components/ui/glass-panel";

// Default (medium blur, medium opacity)
<GlassPanel>
  <p>Panel content</p>
</GlassPanel>

// Strong blur
<GlassPanel blur="xl" opacity="high">
  <p>Highly opaque panel with strong blur</p>
</GlassPanel>

// Subtle effect
<GlassPanel blur="sm" opacity="low">
  <p>Subtle glass effect</p>
</GlassPanel>

// Blur options: "sm" | "md" | "lg" | "xl"
// Opacity options: "low" | "medium" | "high"
```

## Usage Patterns

### 1. Standard Glass Card

```tsx
<div className="bg-glass border border-glass-border backdrop-blur-glass rounded-2xl p-6 shadow-glass">
  <h3>Standard Glass Card</h3>
  <p>70% opacity background, 12px blur</p>
</div>
```

### 2. Strong Glass (More Solid)

```tsx
<div className="bg-glass-strong border border-glass-border-strong backdrop-blur-glass-strong rounded-2xl p-6 shadow-glass-strong">
  <h3>Strong Glass Card</h3>
  <p>85% opacity, 20px blur - more opaque</p>
</div>
```

### 3. Subtle Glass (More Transparent)

```tsx
<div className="bg-glass-subtle border border-glass-border-subtle backdrop-blur-glass-subtle rounded-2xl p-6 shadow-glass-subtle">
  <h3>Subtle Glass Card</h3>
  <p>50% opacity, 8px blur - more see-through</p>
</div>
```

### 4. Elevated Glass (Floating Effect)

```tsx
<div className="bg-glass border border-glass-border backdrop-blur-glass rounded-2xl p-6 shadow-glass-elevated hover:shadow-glass-elevated-hover transition-shadow duration-300">
  <h3>Elevated Glass Card</h3>
  <p>Deeper shadow creates floating effect</p>
</div>
```

### 5. Interactive Glass

```tsx
<button className="bg-glass border border-glass-border backdrop-blur-glass rounded-2xl px-6 py-3 shadow-glass hover:bg-glass-hover hover:border-glass-border-hover hover:shadow-glass-elevated transition-all duration-300 active:scale-95">
  Interactive Glass Button
</button>
```

## Depth Layers

Create visual hierarchy with z-index and shadow depth:

```tsx
{/* Background layer - depth 1 */}
<div className="relative z-[1] bg-glass-subtle backdrop-blur-glass-subtle shadow-glass-subtle">
  Background content
</div>

{/* Content layer - depth 2 */}
<div className="relative z-[2] bg-glass backdrop-blur-glass shadow-glass">
  Main content
</div>

{/* Elevated layer - depth 3 */}
<div className="relative z-[3] bg-glass-strong backdrop-blur-glass-strong shadow-glass-elevated">
  Important content
</div>

{/* Modal layer - depth 4 */}
<div className="relative z-[4] bg-glass-strong backdrop-blur-glass-strong shadow-glass-elevated">
  Modal or overlay
</div>
```

## Accessibility

### Contrast Requirements

Glassmorphism must maintain WCAG AA contrast ratios:

- **Text on glass**: Use `foreground` color (black) on glass backgrounds
- **Borders**: Use sufficient opacity (≥10%) for visibility
- **Interactive states**: Ensure hover/focus states are clearly visible

### Reduced Motion

The `GlassCard` component respects `prefers-reduced-motion`:

```tsx
// Automatically disables 3D tilt for users who prefer reduced motion
const prefersReducedMotion = useReducedMotion();

// Tilt effects are disabled when prefersReducedMotion is true
```

### Screen Reader Support

Glass effects are purely visual and don't affect screen reader functionality. Ensure:
- Proper semantic HTML
- Sufficient text contrast
- Focus indicators remain visible

## Performance

### Optimization Tips

1. **Limit Blur Usage**: Backdrop blur is GPU-intensive. Use sparingly on mobile.

```tsx
// Good: Apply blur only to specific elements
<div className="backdrop-blur-glass">...</div>

// Avoid: Blurring entire viewport
<div className="fixed inset-0 backdrop-blur-glass">...</div>
```

2. **Use `will-change` Carefully**: Only for frequently animated elements

```tsx
<div className="backdrop-blur-glass will-change-transform">
  Frequently animated content
</div>
```

3. **Reduce Blur on Mobile**: Use conditional classes

```tsx
<div className="backdrop-blur-glass md:backdrop-blur-glass-strong">
  Lighter blur on mobile
</div>
```

## Design Guidelines

### When to Use Glass

✅ **Good Uses:**
- Dashboard cards (financial data, insights)
- Modals and overlays
- Navigation panels
- Floating action buttons
- Tooltips and popovers

❌ **Avoid:**
- Form inputs (use solid backgrounds)
- Text-heavy content (reduces readability)
- Entire page backgrounds (performance)
- Critical CTAs (use solid colors)

### Layering Best Practices

```tsx
{/* Background: Subtle glass for ambient depth */}
<div className="bg-glass-subtle backdrop-blur-glass-subtle">
  
  {/* Mid-layer: Standard glass for main content */}
  <div className="bg-glass backdrop-blur-glass shadow-glass">
    
    {/* Foreground: Strong glass for emphasis */}
    <div className="bg-glass-strong backdrop-blur-glass-strong shadow-glass-elevated">
      Important content
    </div>
  </div>
</div>
```

## Migration Guide

### Updating Existing Cards

**Before:**
```tsx
<Card className="bg-card border">
  Content
</Card>
```

**After:**
```tsx
<GlassCard>
  Content
</GlassCard>

// OR with Tailwind classes
<Card className="bg-glass border-glass-border backdrop-blur-glass shadow-glass">
  Content
</Card>
```

### Converting Modals

**Before:**
```tsx
<Dialog>
  <DialogContent className="bg-background">
    Modal content
  </DialogContent>
</Dialog>
```

**After:**
```tsx
<Dialog>
  <DialogContent className="bg-glass-strong backdrop-blur-glass-strong border-glass-border-strong shadow-glass-elevated">
    Modal content
  </DialogContent>
</Dialog>
```

## Examples

### Dashboard Card

```tsx
<GlassCard className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Total Balance</h3>
    <span className="text-2xl font-bold">$12,450</span>
  </div>
  <p className="text-sm text-muted-foreground">
    +2.5% from last month
  </p>
</GlassCard>
```

### Floating Action Menu

```tsx
<GlassPanel blur="lg" opacity="high" className="fixed bottom-6 right-6 p-4">
  <div className="flex flex-col gap-3">
    <button className="p-3 rounded-xl hover:bg-glass-hover transition-colors">
      Add Transaction
    </button>
    <button className="p-3 rounded-xl hover:bg-glass-hover transition-colors">
      Create Goal
    </button>
  </div>
</GlassPanel>
```

### Modal Overlay

```tsx
<div className="fixed inset-0 bg-background/60 backdrop-blur-md z-50">
  <div className="flex items-center justify-center min-h-screen p-4">
    <GlassCard className="max-w-lg w-full p-8">
      <h2 className="text-2xl font-bold mb-4">Confirm Action</h2>
      <p className="text-muted-foreground mb-6">
        Are you sure you want to proceed?
      </p>
      <div className="flex gap-3 justify-end">
        <button className="px-4 py-2 rounded-xl bg-glass hover:bg-glass-hover">
          Cancel
        </button>
        <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground">
          Confirm
        </button>
      </div>
    </GlassCard>
  </div>
</div>
```

## Browser Support

Glassmorphism relies on:
- `backdrop-filter: blur()` - Supported in all modern browsers
- `hsla()` colors - Universal support
- CSS variables - Universal support

### Fallbacks

For older browsers without backdrop-filter support:

```css
@supports not (backdrop-filter: blur(12px)) {
  .bg-glass {
    background: hsl(var(--background));
    opacity: 0.95;
  }
}
```

## Future Enhancements

### Phase 8: Dynamic Glass (Planned)
- Blur intensity based on scroll position
- Adaptive opacity based on time of day
- Animated grain texture overlay

### Phase 9: Glass Presets (Planned)
- One-line presets: `glass-card-primary`, `glass-panel-secondary`
- Theme-specific glass variants
- Seasonal glass effects

## Troubleshooting

### Issue: Text is hard to read on glass

**Solution:** Use stronger opacity or add text shadows
```tsx
<div className="bg-glass-strong backdrop-blur-glass-strong">
  <p className="text-foreground drop-shadow-sm">Readable text</p>
</div>
```

### Issue: Performance lag on mobile

**Solution:** Reduce blur or use conditional rendering
```tsx
<div className="backdrop-blur-glass-subtle md:backdrop-blur-glass">
  Content
</div>
```

### Issue: Glass effect not visible

**Solution:** Ensure there's content behind the glass
```tsx
{/* Background needed for glass to show */}
<div className="bg-gradient-to-br from-primary/10 to-accent/10 min-h-screen">
  <GlassCard>
    Now the glass effect is visible
  </GlassCard>
</div>
```

## Conclusion

Phase 7's glassmorphism system adds visual depth and premium feel to $ave+ while maintaining performance and accessibility. The token-based approach ensures consistency across the app and makes future updates simple.

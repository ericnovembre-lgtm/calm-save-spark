# $ave+ Animated Icons System - Quick Start Guide

## 🚀 What You Got

A complete animated icon system adapted for your Vite + React + TypeScript stack with:

- ✨ **Smart animation preferences** (respects `prefers-reduced-motion` + user choice)
- 🎯 **Progressive fallbacks** (APNG → GIF → PNG → SVG → Emoji)
- ♿ **Accessibility first** (proper ARIA labels)
- 🔄 **Cross-tab sync** (preferences sync across browser tabs)
- 📦 **Tree-shakeable** (only import what you need)

## 📁 Files Created

```
src/
├── hooks/
│   └── useAnimationPreference.ts      # Animation preference hook
├── components/
│   └── icons/
│       ├── SaveplusAnimIcon.tsx       # Main icon component
│       ├── saveplus_anim_map.ts       # Icon registry
│       ├── AnimationPreferenceToggle.tsx  # Settings toggle
│       ├── index.ts                   # Centralized exports
│       └── README.md                  # Detailed documentation
├── pages/
│   └── IconDemo.tsx                   # Live demo page
└── App.tsx                            # Updated with /icon-demo route

ANIMATED_ICONS_GUIDE.md                # This file
```

## 🎨 View the Demo

Visit: **[http://localhost:5173/icon-demo](http://localhost:5173/icon-demo)**

The demo page shows:
- All available icons
- Size examples
- Variant demonstrations
- Code snippets
- Live usage examples

## 🏃‍♂️ Quick Start

### 1. Basic Usage

```tsx
import { SaveplusAnimIcon } from '@/components/icons';

// Simple animated icon
<SaveplusAnimIcon icon="piggy-bank" size={32} />
```

### 2. Add Animation Toggle to Settings

```tsx
import { AnimationPreferenceToggle } from '@/components/icons/AnimationPreferenceToggle';

// In your settings page
<AnimationPreferenceToggle />
```

### 3. Use in Components

```tsx
// Feature card
<div className="feature">
  <SaveplusAnimIcon icon="rocket" size={48} decorative />
  <h3>Track Progress</h3>
  <p>Watch your savings grow</p>
</div>
```

## 📦 Available Icons

Currently registered (ready to use):
- `piggy-bank` - Savings piggy bank 🐷
- `money-growth` - Money growing 📈
- `coin-stack` - Stacking coins 💰
- `wallet` - Wallet 👛
- `target` - Goal target 🎯
- `rocket` - Growth rocket 🚀
- `sparkles` - Sparkles ✨
- `shield` - Security shield 🛡️
- `chart-up` - Chart trending up 📊
- `lightbulb` - Idea lightbulb 💡

## ➕ Adding New Icons

### Step 1: Create Assets

Prepare your icon in these formats (at least GIF + PNG):
- **APNG** (optional, best quality)
- **GIF** (recommended, widely supported)
- **PNG** (required, static fallback)
- **SVG** (optional, vector fallback)

### Step 2: Add to Public Directory

```
public/
└── icons/
    └── saveplus/
        ├── my-icon.gif
        ├── my-icon-static.png
        └── my-icon.svg
```

### Step 3: Register in Map

Edit `src/components/icons/saveplus_anim_map.ts`:

```ts
export const saveplusAnimMap: Record<string, IconDefinition> = {
  // ... existing icons ...
  
  'my-icon': {
    id: 'my-icon',
    label: 'My awesome icon',
    assets: {
      gif: '/icons/saveplus/my-icon.gif',
      png: '/icons/saveplus/my-icon-static.png',
      svg: '/icons/saveplus/my-icon.svg',
      emoji: '🎨'  // Fallback emoji
    }
  }
};
```

### Step 4: Use It

```tsx
<SaveplusAnimIcon icon="my-icon" size={40} />
```

## 🎛️ API Reference

### Component Props

```tsx
<SaveplusAnimIcon
  icon="piggy-bank"       // Required: Icon ID from registry
  size={32}               // Optional: Size in pixels (default: 24)
  decorative={false}      // Optional: Hide from screen readers
  label="Custom label"    // Optional: Override default label
  forceStatic={false}     // Optional: Always use static version
  className="..."         // Optional: Additional CSS classes
  onError={() => {}}      // Optional: Error callback
/>
```

### Hook

```tsx
import { useAnimationPreference } from '@/hooks/useAnimationPreference';

const shouldAnimate = useAnimationPreference();
// Returns true if animations enabled, false otherwise
```

### Utilities

```tsx
import { 
  setAnimationPreference,      // Set user preference
  getAnimationPreference,      // Get current preference
  getIconDefinition,           // Get icon details
  getAvailableIcons,           // List all icon IDs
  hasIcon                      // Check if icon exists
} from '@/components/icons';

// Enable/disable animations
setAnimationPreference(true);

// Get current setting
const isEnabled = getAnimationPreference();

// Check icon existence
if (hasIcon('rocket')) {
  // render icon
}
```

## 🎯 Common Use Cases

### Feature List

```tsx
const features = [
  { icon: 'target', title: 'Set Goals' },
  { icon: 'rocket', title: 'Track Progress' },
  { icon: 'shield', title: 'Stay Secure' }
];

<ul>
  {features.map(f => (
    <li key={f.icon} className="flex items-center gap-3">
      <SaveplusAnimIcon icon={f.icon} size={24} decorative />
      <span>{f.title}</span>
    </li>
  ))}
</ul>
```

### Hero Section

```tsx
<section className="hero">
  <SaveplusAnimIcon 
    icon="piggy-bank" 
    size={80}
    label="Start saving today"
  />
  <h1>Save Smarter with $ave+</h1>
</section>
```

### Settings Page

```tsx
<div className="settings">
  <h2>Preferences</h2>
  <AnimationPreferenceToggle />
</div>
```

### Loading States

```tsx
{isLoading ? (
  <SaveplusAnimIcon icon="sparkles" size={32} decorative />
) : (
  <YourContent />
)}
```

## ♿ Accessibility

### Screen Reader Labels

```tsx
// Announced to screen readers
<SaveplusAnimIcon 
  icon="target" 
  label="Complete your savings goal" 
/>

// Hidden from screen readers (decorative only)
<SaveplusAnimIcon 
  icon="sparkles" 
  decorative 
/>
```

### Motion Preferences

The system automatically respects:
1. **System setting**: `prefers-reduced-motion: reduce`
2. **User preference**: Stored in localStorage

Both must allow animations for them to play.

## 🔧 Advanced

### Conditional Rendering

```tsx
const shouldAnimate = useAnimationPreference();

{shouldAnimate ? (
  <MotionDiv />
) : (
  <StaticDiv />
)}
```

### Custom Animation Logic

```tsx
import { useAnimationPreference } from '@/hooks/useAnimationPreference';

function MyComponent() {
  const shouldAnimate = useAnimationPreference();
  
  return (
    <div className={shouldAnimate ? 'animate-class' : 'static-class'}>
      {/* content */}
    </div>
  );
}
```

### Error Handling

```tsx
<SaveplusAnimIcon
  icon="rocket"
  onError={() => {
    console.log('Asset failed to load, using fallback');
  }}
/>
```

## 🐛 Troubleshooting

### Icons Not Loading

1. Check asset paths in `saveplus_anim_map.ts`
2. Verify files exist in `public/icons/saveplus/`
3. Check browser console for 404 errors

### Animations Not Playing

1. Check system accessibility settings (Settings → Accessibility → Reduce Motion)
2. Verify user hasn't disabled via toggle
3. Try different browsers (APNG support varies)

### Console Warnings

```
Icon "xyz" not found in saveplus_anim_map
```
→ Add the icon to the registry or check spelling

```
Failed to load asset #0 for icon "abc"
```
→ Check file paths and ensure assets exist

## 📚 Learn More

- Full documentation: `src/components/icons/README.md`
- Live demo: `/icon-demo`
- TypeScript types: See component files for full type definitions

## 🎁 What's Next?

1. **Add your own icons** - Follow the "Adding New Icons" guide above
2. **Customize the toggle** - Style `AnimationPreferenceToggle` to match your design
3. **Create icon variants** - Build specialized versions for specific use cases
4. **Add to Settings** - Include the animation toggle in your settings page

---

**Note**: This system was adapted from Base44 for your Vite + React + TypeScript stack. All Next.js-specific code has been converted to work with your current setup.

Happy icon-ing! ✨

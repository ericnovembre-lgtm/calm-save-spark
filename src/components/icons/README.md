# $ave+ Animated Icons System

A robust, accessible, and performance-optimized animated icon system for the $ave+ application.

## Features

- ✨ **Smart Animation Control**: Respects both system `prefers-reduced-motion` and user preferences
- 🎯 **Progressive Fallbacks**: APNG → GIF → PNG → SVG → Emoji
- ♿ **Accessibility First**: Proper ARIA labels and decorative icon support
- 🔄 **Cross-Tab Sync**: User preferences sync across browser tabs
- 🚀 **SSR Safe**: No hydration errors or server-side crashes
- 📦 **Tree-Shakeable**: Import only what you need
- 🎨 **Theme Aware**: Works seamlessly with light/dark modes

## Quick Start

### Basic Usage

```tsx
import { SaveplusAnimIcon } from '@/components/icons';

// Simple usage
<SaveplusAnimIcon icon="piggy-bank" size={32} />

// With custom label
<SaveplusAnimIcon 
  icon="rocket" 
  size={48} 
  label="Launch your savings goals" 
/>

// Decorative (hidden from screen readers)
<SaveplusAnimIcon icon="sparkles" decorative />

// Force static (never animated)
<SaveplusAnimIcon icon="target" forceStatic />
```

### Animation Preference Toggle

```tsx
import { AnimationPreferenceToggle } from '@/components/icons/AnimationPreferenceToggle';

// Full version with description
<AnimationPreferenceToggle />

// Compact version for menus
<AnimationPreferenceToggleCompact />
```

## Available Icons

Current icon registry includes:

| Icon ID | Label | Formats |
|---------|-------|---------|
| `piggy-bank` | Savings piggy bank | APNG, GIF, PNG |
| `money-growth` | Money growing | APNG, GIF, PNG |
| `coin-stack` | Stacking coins | APNG, GIF, PNG |
| `wallet` | Wallet | GIF, PNG |
| `target` | Goal target | GIF, PNG |
| `rocket` | Growth rocket | GIF, PNG |
| `sparkles` | Sparkles | GIF, PNG |
| `shield` | Security shield | GIF, PNG |
| `chart-up` | Chart trending up | GIF, PNG |
| `lightbulb` | Idea lightbulb | GIF, PNG |

## Adding New Icons

### 1. Prepare Assets

Create your animated icon in multiple formats:

- **APNG** (best quality, alpha support) - optional
- **GIF** (wide support, good compression) - recommended
- **PNG** (static fallback) - required
- **SVG** (vector fallback) - optional
- **Emoji** (ultimate fallback) - required

### 2. Add to Public Directory

```
public/
└── icons/
    └── saveplus/
        ├── my-icon.apng
        ├── my-icon.gif
        ├── my-icon-static.png
        └── my-icon.svg
```

### 3. Register in Icon Map

Edit `src/components/icons/saveplus_anim_map.ts`:

```ts
export const saveplusAnimMap: Record<string, IconDefinition> = {
  // ... existing icons
  'my-icon': {
    id: 'my-icon',
    label: 'My awesome icon',
    assets: {
      apng: '/icons/saveplus/my-icon.apng',
      gif: '/icons/saveplus/my-icon.gif',
      png: '/icons/saveplus/my-icon-static.png',
      svg: '/icons/saveplus/my-icon.svg',
      emoji: '🎨'
    }
  }
};
```

### 4. Use Your Icon

```tsx
<SaveplusAnimIcon icon="my-icon" size={40} />
```

## API Reference

### `<SaveplusAnimIcon>`

Main animated icon component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | **required** | Icon ID from registry |
| `size` | `number` | `24` | Size in pixels |
| `decorative` | `boolean` | `false` | Hide from screen readers |
| `label` | `string` | `undefined` | Custom accessible label |
| `forceStatic` | `boolean` | `false` | Always use static version |
| `className` | `string` | `undefined` | Additional CSS classes |
| `onError` | `() => void` | `undefined` | Callback on load error |

All standard `<img>` props are also supported.

#### Variants

```tsx
// Decorative (auto-sets decorative=true)
<SaveplusAnimIconDecorative icon="sparkles" />

// Static (auto-sets forceStatic=true)
<SaveplusAnimIconStatic icon="piggy-bank" />
```

### `useAnimationPreference()`

Hook that returns whether animations should be enabled.

```tsx
const isAnimationEnabled = useAnimationPreference();
```

Returns `boolean`:
- `true` if animations should play
- `false` if user or system prefers reduced motion
- `true` during SSR/initial render (avoids hydration issues)

### Utility Functions

```tsx
import { 
  setAnimationPreference,
  getAnimationPreference,
  getIconDefinition,
  getAvailableIcons,
  hasIcon
} from '@/components/icons';

// Set user preference
setAnimationPreference(false); // Disable animations

// Get current preference
const enabled = getAnimationPreference(); // boolean

// Get icon details
const icon = getIconDefinition('piggy-bank');

// List all icons
const allIcons = getAvailableIcons(); // string[]

// Check if icon exists
if (hasIcon('rocket')) {
  // render icon
}
```

## How It Works

### Animation Resolution

The system uses a multi-layered approach:

1. **System Preference**: Checks `prefers-reduced-motion` media query
2. **User Preference**: Checks `localStorage['animatedIcons']`
3. **Final Decision**: Animations enabled if BOTH allow

```
shouldAnimate = !systemPreferReduced && userWantsAnimation
```

### Asset Fallback Chain

When rendering, the component tries assets in order:

**Animated Mode** (if animations enabled):
1. APNG (if available)
2. GIF (if available)
3. PNG (static fallback)
4. SVG (vector fallback)
5. Emoji (ultimate fallback)

**Static Mode** (if animations disabled):
1. PNG (static)
2. SVG (vector)
3. Emoji (ultimate fallback)

If an asset fails to load, the component automatically tries the next format.

### Cross-Tab Sync

User preferences are automatically synchronized across browser tabs using the `storage` event:

```ts
// In Tab 1
setAnimationPreference(false);

// Tab 2 automatically updates via storage event listener
```

## Accessibility

### Screen Reader Support

```tsx
// Informative icon (announced to screen readers)
<SaveplusAnimIcon 
  icon="target" 
  label="Savings goal completed" 
/>
// Screen reader: "Savings goal completed"

// Decorative icon (hidden from screen readers)
<SaveplusAnimIcon 
  icon="sparkles" 
  decorative 
/>
// Screen reader: (silent)
```

### Motion Sensitivity

The system respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* System automatically uses static assets */
}
```

Users can also manually disable animations via the toggle component.

## Performance

### Bundle Size

- **Icon Component**: ~2KB gzipped
- **Animation Hook**: ~1KB gzipped
- **Icon Registry**: ~1KB gzipped (grows with icon count)

### Loading Strategy

- Assets load on-demand (not bundled)
- Failed assets trigger immediate fallback
- No loading spinners needed (emoji fallback is instant)

### Optimization Tips

1. **Use WebP for GIFs**: Smaller file sizes, better compression
2. **Optimize APNG**: Use tools like `apngopt` to reduce size
3. **Lazy Load Icons**: Only render visible icons
4. **Preload Critical Icons**: Add `<link rel="preload">` for hero icons

```tsx
// In your <head>
<link 
  rel="preload" 
  as="image" 
  href="/icons/saveplus/piggy-bank.gif" 
/>
```

## Examples

### Hero Section

```tsx
<section className="hero">
  <SaveplusAnimIcon 
    icon="piggy-bank" 
    size={80}
    className="mb-4"
  />
  <h1>Start Saving Today</h1>
</section>
```

### Feature List

```tsx
const features = [
  { icon: 'target', title: 'Set Goals' },
  { icon: 'rocket', title: 'Track Progress' },
  { icon: 'shield', title: 'Stay Secure' }
];

<ul>
  {features.map(f => (
    <li key={f.icon}>
      <SaveplusAnimIcon icon={f.icon} size={24} decorative />
      <span>{f.title}</span>
    </li>
  ))}
</ul>
```

### Settings Page

```tsx
<section className="settings">
  <h2>Preferences</h2>
  <AnimationPreferenceToggle />
</section>
```

### Conditional Rendering

```tsx
const shouldAnimate = useAnimationPreference();

{shouldAnimate ? (
  <SaveplusAnimIcon icon="sparkles" />
) : (
  <SaveplusAnimIconStatic icon="sparkles" />
)}
```

## Troubleshooting

### Icons Not Loading

1. Check asset paths in `saveplus_anim_map.ts`
2. Verify files exist in `public/icons/saveplus/`
3. Check browser console for 404 errors

### Animations Not Playing

1. Check system accessibility settings
2. Verify user hasn't disabled via toggle
3. Test in different browsers (APNG support varies)

### Hydration Errors

The component is designed to avoid these, but if you encounter issues:

```tsx
// Wrap in client-only component
'use client'; // If using Next.js App Router

// Or use dynamic import in Vite
const SaveplusAnimIcon = lazy(() => import('@/components/icons'));
```

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| GIF | ✅ | ✅ | ✅ | ✅ |
| PNG | ✅ | ✅ | ✅ | ✅ |
| SVG | ✅ | ✅ | ✅ | ✅ |
| APNG | ✅ | ✅ | ✅ | ✅ |
| `prefers-reduced-motion` | ✅ | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ |

## License

Part of the $ave+ application. All rights reserved.

# $ave+ Theme System - Implementation Guide

## 🎨 What You Got

A complete theme management system adapted from Base44 for your Vite + React + TypeScript stack with:

- ✨ **System theme detection** (respects `prefers-color-scheme`)
- 💾 **Persistent preferences** (localStorage)
- 🔄 **Real-time OS theme changes** (listens to system preference changes)
- 🚀 **SSR-safe** (no flash of unstyled content)
- ♿ **Accessible** (proper ARIA labels on toggle)

## 📁 Files Created/Updated

```
src/
├── lib/
│   └── theme.ts                        # Theme utilities and helpers
├── components/
│   ├── ThemeProvider.tsx               # Updated provider with system support
│   └── ThemeToggle.tsx                 # Updated toggle with dropdown
index.html                              # Added theme script in <head>
src/App.tsx                             # Updated storage key
```

## 🎯 How It Works

### Theme Resolution

The system supports three theme values:
- `'light'` - Force light mode
- `'dark'` - Force dark mode  
- `'system'` - Follow OS preference

**Resolution Priority:**
1. User's persisted choice (`localStorage['saveplus_theme']`)
2. System preference (`prefers-color-scheme: dark`)
3. Default: `'system'`

### Preventing Flash of Unstyled Content

A script in `index.html` applies the theme **before** React loads:

```html
<script>
  (function() {
    const stored = localStorage.getItem('saveplus_theme');
    const theme = stored || 'system';
    
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) document.documentElement.classList.add('dark');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### CSS Variables

Your existing color tokens in `src/index.css`:

```css
:root {
  --color-bg: #F8F6F0;      /* off-white */
  --color-text: #000000;    /* black */
  --color-accent: #E9DFCE;  /* light beige */
  --color-muted: #6F6F6F;
  --color-border: #E6E0D5;
  --color-surface: #FFFFFF;
}

.dark {
  --color-bg: #000000;
  --color-text: #F8F6F0;
  --color-accent: #BBAE96;
  --color-muted: #B5B5B5;
  --color-border: #2A2A2A;
  --color-surface: #0F0F0F;
}
```

## 🚀 Usage

### Basic Hook Usage

```tsx
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // Current setting ('light' | 'dark' | 'system')
  console.log(theme);
  
  // Actual applied theme ('light' | 'dark')
  console.log(resolvedTheme);
  
  // Change theme
  setTheme('dark');
  setTheme('system');
}
```

### Theme Toggle Components

#### Full Toggle (with System option)

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

// Dropdown with Light, Dark, and System options
<ThemeToggle />
```

#### Simple Toggle (Light/Dark only)

```tsx
import { SimpleThemeToggle } from '@/components/ThemeToggle';

// Simple button that toggles between light and dark
<SimpleThemeToggle />
```

### Theme Utilities

```tsx
import {
  getSystemTheme,
  resolveTheme,
  applyTheme,
  listenOSChange
} from '@/lib/theme';

// Get OS theme
const osTheme = getSystemTheme(); // 'light' | 'dark'

// Resolve 'system' to actual theme
const resolved = resolveTheme('system'); // 'light' | 'dark'

// Apply theme manually
applyTheme('dark');

// Listen to OS changes
const cleanup = listenOSChange((isDark) => {
  console.log('OS theme changed:', isDark ? 'dark' : 'light');
});

// Cleanup when done
cleanup();
```

## 🎛️ Configuration

### Change Default Theme

In `src/App.tsx`:

```tsx
<ThemeProvider defaultTheme="system" storageKey="saveplus_theme">
  <App />
</ThemeProvider>
```

Options:
- `defaultTheme`: `'light' | 'dark' | 'system'` (default: `'system'`)
- `storageKey`: localStorage key (default: `'saveplus_theme'`)

### Add Theme Toggle to Layout

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

// In your header/nav
<header>
  <nav>
    <Logo />
    <ThemeToggle />
  </nav>
</header>
```

## 🎨 Styling Tips

### Use Theme-Aware Colors

Always use CSS variables instead of hardcoded colors:

```tsx
// ❌ Bad - hardcoded colors
<div className="bg-white text-black">

// ✅ Good - semantic tokens
<div className="bg-[var(--color-bg)] text-[var(--color-text)]">

// ✅ Best - Tailwind aliases (if configured)
<div className="bg-background text-foreground">
```

### Conditional Rendering

```tsx
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { resolvedTheme } = useTheme();
  
  return (
    <div>
      {resolvedTheme === 'dark' ? (
        <DarkModeChart />
      ) : (
        <LightModeChart />
      )}
    </div>
  );
}
```

### Dark Mode Classes

Tailwind's dark mode works automatically:

```tsx
<div className="bg-white dark:bg-black">
  <p className="text-gray-900 dark:text-gray-100">
    This text adapts to theme
  </p>
</div>
```

## 🔧 Advanced

### Custom Theme Detection

```tsx
import { useEffect, useState } from 'react';
import { getSystemTheme, listenOSChange } from '@/lib/theme';

function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState(getSystemTheme());
  
  useEffect(() => {
    const cleanup = listenOSChange((isDark) => {
      setSystemTheme(isDark ? 'dark' : 'light');
    });
    return cleanup;
  }, []);
  
  return systemTheme;
}
```

### Theme Sync Across Tabs

The system automatically syncs theme changes across browser tabs using localStorage events. No additional configuration needed!

### Testing Themes

```tsx
// Force light mode for testing
localStorage.setItem('saveplus_theme', 'light');
location.reload();

// Force dark mode
localStorage.setItem('saveplus_theme', 'dark');
location.reload();

// Test system preference
localStorage.setItem('saveplus_theme', 'system');
location.reload();
```

## 🎭 Theme Context API

### ThemeProviderState

```ts
interface ThemeProviderState {
  /** Current theme setting: 'light', 'dark', or 'system' */
  theme: 'light' | 'dark' | 'system';
  
  /** Resolved theme (actual applied theme): 'light' or 'dark' */
  resolvedTheme: 'light' | 'dark';
  
  /** Set the theme */
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}
```

## 📱 Mobile Considerations

The theme toggle dropdown is fully responsive and works well on mobile devices. The simple toggle is recommended for mobile-first designs:

```tsx
// Desktop - full dropdown
<div className="hidden md:block">
  <ThemeToggle />
</div>

// Mobile - simple toggle
<div className="md:hidden">
  <SimpleThemeToggle />
</div>
```

## 🐛 Troubleshooting

### Theme not persisting

1. Check localStorage is accessible: `localStorage.getItem('saveplus_theme')`
2. Verify storage key matches in App.tsx and theme.ts
3. Check browser privacy settings (some browsers block localStorage)

### Flash of wrong theme

1. Ensure theme script is in `index.html` **before** React loads
2. Script should be in `<head>`, not `<body>`
3. Verify no CSS conflicts override the `.dark` class

### System theme not updating

1. Check OS/browser supports `prefers-color-scheme`
2. Test with DevTools: Settings → Rendering → Emulate CSS media
3. Verify theme is set to `'system'`, not hardcoded

### Dark mode colors not applying

1. Verify `.dark` class is on `<html>` element
2. Check CSS variables are defined for `.dark` in index.css
3. Ensure components use semantic tokens, not hardcoded colors

## 🎯 Next Steps

1. ✅ **Add theme toggle to header** - Place `<ThemeToggle />` in your nav
2. ✅ **Update color usage** - Replace hardcoded colors with tokens
3. ✅ **Test system theme** - Change OS dark mode and verify it updates
4. ✅ **Add to settings page** - Include theme preferences in user settings

---

**Note**: This system was adapted from Base44 for your Vite + React + TypeScript stack. All functionality has been converted to work without Next.js dependencies.

Enjoy your new theme system! 🌓

# $ave+ Welcome Page Guide

## Overview

The Welcome page (`src/pages/Welcome.tsx`) is the main landing page for $ave+, showcasing features, statistics, and providing multiple call-to-action paths for users.

## Architecture

### Route
- **Path**: `/welcome`
- **Layout**: Full-page layout (no AppLayout wrapper)
- **Access**: Public (no authentication required)

### Key Components

#### 1. Hero Section
- `<WelcomeHero />` - Main headline and primary CTA
- `<LottieHero />` - Animated hero illustration (`/animations/saveplus-hero.json`)
- Parallax effects (disabled with `prefers-reduced-motion`)

#### 2. Feature Showcase
- `<FeatureCarousel />` - Interactive carousel of product features
- `<FeatureDetailModal />` - Expandable feature details
- 7 core features: Smart Pots, Automations, Card, Insights, Rewards, AI Coach, Security

#### 3. Statistics
- `<StatCard />` components showing:
  - 4.25% APY Rate
  - 50K+ Happy Users
  - $2.1M+ Saved Together
  - 99.9% Uptime

#### 4. Search & Navigation
- `<SearchBarHinted />` - Quick navigation search bar
- Keyboard shortcuts (Cmd+K)
- Accessible with ARIA labels

#### 5. Call-to-Action
- `<SecureOnboardingCTA />` - Primary conversion point
- Links to `/onboarding` for new users
- Links to `/dashboard` for returning users

#### 6. Floating Widgets
- `<SaveplusCoachWidget />` - AI coaching insights
- `<SaveplusUIAssistantFAB />` - Quick help access

## Design System

### Color Palette (Neutral)
All colors use CSS variables for automatic dark mode:

```css
/* Light mode */
--color-bg: #F8F6F0;      /* Off-white background */
--color-text: #000000;    /* Black text */
--color-accent: #E9DFCE;  /* Light beige accent */
--color-border: #E6E0D5;  /* Subtle borders */
--color-muted: #6F6F6F;   /* Muted text */

/* Dark mode (.dark) */
--color-bg: #000000;      /* Black background */
--color-text: #F8F6F0;    /* Off-white text */
--color-accent: #BBAE96;  /* Darker beige accent */
```

### Typography
- **Headings**: Bold, tracking-tight
- **Body**: Base size with muted-foreground for secondary text
- **CTA Buttons**: High contrast with primary color

### Spacing
- Container: `max-w-7xl mx-auto`
- Sections: `py-16 md:py-24` for generous vertical spacing
- Grid layouts: Responsive with mobile-first approach

## Accessibility

### Motion Preferences
```typescript
const prefersReducedMotion = useReducedMotion();

// Disable parallax
const parallaxY = prefersReducedMotion 
  ? 0 
  : useTransform(scrollYProgress, [0, 1], [0, -100]);

// Disable mouse tracking
useEffect(() => {
  if (prefersReducedMotion) return;
  // ... mouse tracking logic
}, [prefersReducedMotion]);
```

### ARIA Labels
- Search: `aria-label="Quick search"`
- Navigation: `role="navigation"`
- Modals: `role="dialog" aria-modal="true"`
- Buttons: Descriptive labels for screen readers

### Keyboard Navigation
- Tab through all interactive elements
- Enter to activate buttons/links
- Escape to close modals
- Arrow keys in carousel/search

## Analytics Integration

### Page View Tracking
```typescript
useEffect(() => {
  trackPageView('Welcome');
}, []);
```

### Event Tracking
- Feature clicks
- CTA button clicks
- Modal opens/closes
- Search interactions

All events sent to:
1. PostHog (if configured via `VITE_POSTHOG_KEY`)
2. Supabase edge function (`/functions/v1/analytics`)

## Performance Optimizations

### Code Splitting
- Lazy load Lottie animations
- Defer non-critical components
- Dynamic imports for heavy libraries

### Image Optimization
- Use WebP format when possible
- Lazy loading with `loading="lazy"`
- Responsive images with srcset

### Bundle Size
- Target: <250KB main bundle
- Tree-shaking enabled
- Remove unused dependencies

### Core Web Vitals Targets
- **FCP** (First Contentful Paint): <1.8s
- **LCP** (Largest Contentful Paint): <2.5s
- **TTI** (Time to Interactive): <3.8s
- **CLS** (Cumulative Layout Shift): <0.1

## SEO Optimization

### Meta Tags
```html
<title>Welcome to $ave+ | Smart Savings Platform</title>
<meta name="description" content="Save while you spend with $ave+. Automated savings, smart goals, and AI-powered insights to help you reach your financial goals faster." />
<meta name="keywords" content="savings, financial goals, automated savings, smart pots, financial planning" />
```

### Semantic HTML
```html
<header> - Page header with logo and nav
<main> - Primary content
<section> - Feature sections with headings
<article> - Feature cards
<footer> - Links and copyright
```

### Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "$ave+",
  "description": "Smart savings platform",
  "applicationCategory": "FinanceApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

## Responsive Breakpoints

```typescript
// From src/lib/constants.ts
BREAKPOINTS = {
  xs: 320,   // Mobile portrait
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
  '2xl': 1536 // Extra large
}
```

### Mobile-First Approach
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

## Authentication Awareness

### Check User Status
```typescript
import { getClientUser } from '@/lib/user';

const user = await getClientUser();
if (user) {
  // Show "Go to Dashboard"
} else {
  // Show "Get Started"
}
```

### Protected Actions
- Dashboard access requires login
- Settings require authentication
- Onboarding available to all

## Testing Checklist

### Visual Testing
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Mobile responsive (320px+)
- [ ] Tablet responsive (768px+)
- [ ] Desktop responsive (1024px+)

### Accessibility Testing
- [ ] Screen reader navigation works
- [ ] Keyboard-only navigation works
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Reduced motion respected

### Performance Testing
- [ ] Lighthouse score >90
- [ ] FCP <1.8s
- [ ] LCP <2.5s
- [ ] No layout shifts (CLS <0.1)

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

## Common Issues & Solutions

### Issue: Animations too fast
**Solution**: Adjust `ANIMATION_DURATION` in `src/lib/constants.ts`

### Issue: Colors not matching design
**Solution**: Update CSS variables in `src/index.css` `:root` section

### Issue: Modal not closing
**Solution**: Check `isModalOpen` state and `onClose` handler

### Issue: Analytics not tracking
**Solution**: Verify `VITE_POSTHOG_KEY` is set or check Supabase edge function logs

## Future Enhancements

### Planned Features
- [ ] A/B testing for CTAs
- [ ] Video testimonials
- [ ] Interactive demo/sandbox
- [ ] Localization (i18n)
- [ ] Social proof widgets

### Performance Improvements
- [ ] Implement service worker for offline support
- [ ] Add progressive image loading
- [ ] Enable HTTP/2 server push
- [ ] Optimize font loading

## Resources

- [Lovable Documentation](https://docs.lovable.dev)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

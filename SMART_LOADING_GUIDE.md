# Smart Content Loading & Component Tracking Guide

This guide explains the smart content prioritization and component tracking features implemented in $ave+.

## Overview

The application now uses intelligent content loading strategies to optimize perceived performance and provides real-time debugging tools for monitoring component behavior.

## Features

### 1. Smart Content Prioritization

Content is loaded based on viewport position and importance using the `PriorityLoader` component.

#### Priority Levels

- **Critical**: Loads immediately (above-the-fold hero content)
- **High**: Loads immediately (important above-the-fold content)
- **Medium**: Loads when approaching viewport (~400px margin)
- **Low**: Loads when entering viewport (~100px margin)

#### Usage

```tsx
import { PriorityLoader } from '@/components/performance/PriorityLoader';

// Hero section - loads immediately
<PriorityLoader priority="critical" minHeight="600px">
  <HeroSection />
</PriorityLoader>

// Features - loads immediately
<PriorityLoader priority="high" minHeight="600px">
  <FeaturesSection />
</PriorityLoader>

// Stats - loads when approaching viewport
<PriorityLoader priority="medium" minHeight="500px">
  <StatsSection />
</PriorityLoader>

// Below-the-fold content - loads when visible
<PriorityLoader priority="low" minHeight="600px">
  <SavingsPlayground />
</PriorityLoader>
```

#### Benefits

- **Faster initial page load**: Critical content loads first
- **Better perceived performance**: Users see important content immediately
- **Reduced bandwidth usage**: Non-critical content only loads when needed
- **Improved SEO**: Search engines see content loading efficiently

### 2. Component Tracking System

Real-time monitoring of component mount and render performance.

#### Component Tracking Hook

```tsx
import { useComponentTracking } from '@/hooks/useComponentTracking';

function MyComponent() {
  // Track this component's performance
  const { renderCount, mountTime } = useComponentTracking('MyComponent');
  
  return <div>Rendered {renderCount} times</div>;
}
```

#### Tracked Metrics

- **Mount time**: When component first mounted
- **Render time**: Time taken for each render
- **Render count**: Number of times component has rendered
- **Mount status**: Whether component is currently mounted
- **Last render timestamp**: When component last rendered

#### Tracked Lazy Component

Wrapper for lazy-loaded components that automatically tracks performance:

```tsx
import { TrackedLazyComponent } from '@/components/performance/TrackedLazyComponent';

<TrackedLazyComponent componentName="MyLazyComponent" minHeight="400px">
  <LazyLoadedComponent />
</TrackedLazyComponent>
```

### 3. Visual Debug Overlay

A floating overlay that displays component performance metrics in real-time.

#### Features

- **Live component list**: Shows all mounted components
- **Performance metrics**: Displays render times and counts
- **Color-coded indicators**: Red for slow (>100ms), yellow for moderate (>50ms), green for fast
- **Multiple sort options**: Sort by name, render time, or render count
- **Summary statistics**: Shows mounted count, average render time, and total components
- **Minimizable interface**: Collapses to save screen space

#### Access

The Component Tracking Overlay is automatically enabled in development mode. Look for the activity icon (📊) in the bottom right corner of the screen.

#### Controls

- **Name button**: Sort components alphabetically
- **Time button**: Sort by render time (slowest first)
- **Count button**: Sort by render count (most renders first)
- **Minimize button**: Collapse to save space
- **Close button**: Hide overlay

#### Reading Metrics

Each component card shows:
- ✅ Green checkmark: Component is mounted
- ❌ Gray X: Component is unmounted
- **Badge color**:
  - Red: Render time > 100ms (needs optimization)
  - Default: Render time > 50ms (acceptable)
  - Secondary: Render time < 50ms (optimal)
- **Render count**: Number of times component has rendered
- **Last render time**: When component last rendered

## Performance Best Practices

### 1. Use Appropriate Priority Levels

```tsx
// ✅ Good - Critical content above the fold
<PriorityLoader priority="critical">
  <Hero />
</PriorityLoader>

// ❌ Bad - Non-critical content marked as critical
<PriorityLoader priority="critical">
  <Footer />
</PriorityLoader>
```

### 2. Set Realistic minHeight

```tsx
// ✅ Good - Accurate height prevents layout shift
<PriorityLoader minHeight="600px">
  <Component /> {/* Actually ~600px tall */}
</PriorityLoader>

// ❌ Bad - Wrong height causes layout shift
<PriorityLoader minHeight="200px">
  <Component /> {/* Actually 800px tall */}
</PriorityLoader>
```

### 3. Monitor Component Performance

- Watch for components with >100ms render times
- Investigate components that re-render excessively
- Use React.memo() for expensive components
- Optimize heavy computations with useMemo/useCallback

### 4. Lazy Load Heavy Components

```tsx
// ✅ Good - Heavy component is lazy loaded
const HeavyChart = lazy(() => import('./HeavyChart'));

<TrackedLazyComponent componentName="HeavyChart">
  <HeavyChart data={data} />
</TrackedLazyComponent>

// ❌ Bad - Heavy component loads immediately
import HeavyChart from './HeavyChart';
<HeavyChart data={data} />
```

## Example Implementation

See `src/pages/Welcome.tsx` for a complete example of:
- Hero section with critical priority
- Features section with high priority
- Stats section with medium priority
- Below-the-fold content with low priority
- Comprehensive component tracking

## Troubleshooting

### Component not loading

1. Check priority level is appropriate
2. Verify minHeight is reasonable
3. Look for console errors
4. Check Component Tracking Overlay for mount status

### Slow performance

1. Open Component Tracking Overlay
2. Sort by render time
3. Identify components with >100ms render time
4. Optimize those components first

### Layout shifts

1. Ensure minHeight matches actual content height
2. Use skeleton loaders that match content dimensions
3. Reserve space for images with aspect ratios

## API Reference

### useComponentTracking(componentName: string)

Tracks component mount and render performance.

**Returns:**
- `renderCount`: Number of times component has rendered
- `mountTime`: Timestamp when component first mounted

### useIntersectionPriority(ref, options)

Determines if content should load based on viewport position.

**Options:**
- `threshold`: Intersection threshold (default: 0)
- `rootMargin`: Margin around viewport (default: '0px')
- `priority`: 'critical' | 'high' | 'medium' | 'low'

**Returns:**
- `shouldLoad`: Whether content should be loaded
- `isVisible`: Whether content is currently visible

### PriorityLoader Props

- `children`: Content to load
- `priority`: 'critical' | 'high' | 'medium' | 'low' (default: 'medium')
- `fallback`: Custom loading fallback
- `minHeight`: Minimum height for placeholder
- `className`: Additional CSS classes

### TrackedLazyComponent Props

- `children`: Lazy-loaded content
- `componentName`: Name for tracking
- `fallback`: Custom loading fallback
- `minHeight`: Minimum height for placeholder

## Related Documentation

- [Performance Monitoring Dashboard](./PERFORMANCE_FEATURES_COMPLETE.md)
- [Web Vitals Features](./WEB_VITALS_FEATURES.md)
- [Bundle Optimization](./BUNDLE_OPTIMIZATION_GUIDE.md)

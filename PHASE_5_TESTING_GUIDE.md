# Phase 5: Testing & Validation Guide

## Performance Testing

### Target Metrics
- **LCP (Largest Contentful Paint)**: < 2.5s
- **INP (Interaction to Next Paint)**: < 200ms  
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTFB (Time to First Byte)**: < 600ms

### How to Test Performance

#### 1. Chrome DevTools Performance Panel
```
1. Open Chrome DevTools (F12)
2. Go to "Performance" tab
3. Click "Record" (Ctrl+E)
4. Refresh the page
5. Let it load completely
6. Stop recording
7. Analyze the timeline for:
   - Long tasks (>50ms)
   - Layout shifts
   - Paint events
   - JavaScript execution time
```

#### 2. Lighthouse CI
```
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - Performance ✓
   - Accessibility ✓
   - Best Practices ✓
   - SEO ✓
4. Select "Mobile" or "Desktop"
5. Click "Analyze page load"
6. Review scores and recommendations
```

#### 3. WebPageTest (https://webpagetest.org)
```
1. Enter your deployed URL
2. Select test location close to your target users
3. Choose connection speed: "Slow 3G" or "Fast 3G"
4. Run test
5. Review:
   - Waterfall chart
   - Core Web Vitals
   - Filmstrip view
   - Optimization suggestions
```

#### 4. Chrome User Experience Report (CrUX)
```
Available in PageSpeed Insights:
https://pagespeed.web.dev/

Enter your URL and check:
- Field Data (real user metrics)
- Origin Summary
- Core Web Vitals assessment
```

### Performance Monitoring Setup

The app already has performance monitoring via:
- `useWebVitals` hook in Landing.tsx
- `PerformanceBudgetMonitor` component (dev mode)
- Web Vitals tracking for LCP, FCP, CLS, INP, TTFB

**To view live metrics:**
1. Open browser console (F12)
2. Look for "Web Vitals" logs
3. Check the performance budget monitor (visible in dev mode)

### Testing on Slow Connections

#### Chrome DevTools Network Throttling
```
1. Open DevTools (F12)
2. Go to "Network" tab
3. Click throttling dropdown (currently "No throttling")
4. Select "Slow 3G" or "Fast 3G"
5. Reload page and observe loading behavior
```

#### Lighthouse Mobile Simulation
- Automatically tests on simulated mobile 4G connection
- More realistic than desktop testing

---

## Cross-Browser Testing

### Required Browsers
- ✅ Chrome 90+ (main development browser)
- ✅ Safari 14+ (WebGL, WebKit-specific issues)
- ✅ Firefox 88+ (Lazy loading, Intersection Observer)
- ✅ Edge 90+ (Chromium-based)

### Safari-Specific Tests

**WebGL/Three.js Compatibility:**
```javascript
// Financial3DUniverse component uses:
// - @react-three/fiber
// - @react-three/drei
// - three.js

Known Safari Issues:
- WebGL context limits (check for multiple canvases)
- Pointer lock API differences
- Performance on older Macs
```

**Test in Safari:**
1. Check 3D scene renders correctly
2. Verify controls work (orbit, zoom)
3. Test on actual Mac/iOS device if possible
4. Check console for WebGL errors

**iOS Safari Gotchas:**
- Viewport height (vh units) behave differently
- Touch event handling
- Lazy loading with Intersection Observer

### Firefox-Specific Tests

**Lazy Loading:**
```javascript
// Test these components load correctly:
// - LazyAISavingsSimulator
// - LazyInteractiveTimeline
// - LazyPlatformOverview
// - etc.
```

**Known Firefox Issues:**
- Slight differences in Intersection Observer timing
- CSS grid/flexbox edge cases
- Font rendering differences

### Mobile Device Testing

**Actual Device Testing (Recommended):**
1. **iOS Safari** (iPhone 12+, iPad Pro)
   - 3D effects should be disabled (useIsMobile hook)
   - Touch interactions smooth
   - No layout jumps on scroll

2. **Android Chrome** (Pixel, Samsung)
   - Reduced particle counts (80% reduction)
   - Simplified hero section
   - Fast page loads

**Browser Stack / Sauce Labs:**
- Paid services for testing on real devices
- Alternative: Use Chrome DevTools device emulation

---

## Accessibility Audit

### Lighthouse Accessibility Score
```
Target: 95+ / 100

Run Lighthouse with Accessibility category enabled
Check for:
- ARIA attributes properly used
- Color contrast ratios (4.5:1 minimum)
- Form labels and inputs
- Keyboard navigation
- Screen reader compatibility
```

### Manual Keyboard Navigation Test
```
1. Close mouse/trackpad, use only keyboard
2. Test landing page navigation:
   - Tab through all interactive elements
   - Focus indicators visible? (outline rings)
   - Skip to content link works? (Tab from top)
   - All buttons/links reachable?
   - Modal/dialog trap focus correctly?

3. Shortcuts to test:
   - Tab: Move forward
   - Shift+Tab: Move backward
   - Enter/Space: Activate buttons
   - Escape: Close modals
   - Arrow keys: Navigate within components
```

### Screen Reader Testing

**NVDA (Windows - Free):**
```
1. Download from https://www.nvaccess.org/
2. Install and start NVDA
3. Navigate landing page with keyboard
4. Listen for:
   - Proper heading hierarchy (H1 → H2 → H3)
   - Alt text on images
   - Button/link labels
   - Live region announcements
   - Skip to content link
```

**VoiceOver (macOS/iOS - Built-in):**
```
macOS:
- Cmd+F5 to toggle VoiceOver
- VO+A to start reading
- VO+Right Arrow to navigate

iOS:
- Settings > Accessibility > VoiceOver
- Triple-click home/side button to toggle
```

**JAWS (Windows - Trial available):**
- Most popular enterprise screen reader
- 40-minute trial mode

### Color Contrast Checker
```
Tools:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect > Accessibility pane
- Stark plugin for Figma/Chrome

Check:
- Text on background (4.5:1 minimum)
- Accent colors vs background (3:1 minimum for UI components)
- Link colors vs surrounding text
```

### ARIA Validation
```
Browser extensions:
- WAVE (Web Accessibility Evaluation Tool)
- axe DevTools
- Accessibility Insights

Check for:
- Proper role attributes
- aria-label where needed
- aria-live for dynamic content
- aria-hidden for decorative elements
- No ARIA errors in console
```

---

## Built-in Testing Utilities

### Accessibility Test Panel (Dev Mode)
The app now includes an **A11y Tests** button in the bottom-right corner (development only) that provides:

✅ **Automated checks for:**
- Skip to content link presence
- Main landmark with proper ID
- H1 heading count (should be 1)
- Images with alt text
- Buttons with accessible labels
- Form inputs with labels
- Focusable elements count
- ARIA live regions

**How to use:**
1. Look for "A11y Tests" button in bottom-right
2. Click to open panel
3. Review check results (errors, warnings, successes)
4. Fix any errors or warnings shown
5. Re-run to verify fixes

### Performance Budget Monitor (Dev Mode)
Already built-in, tracks:
- LCP, INP, CLS, FCP, TTFB
- Shows violations in real-time
- Console logs with details

---

## Automated Testing Checklist

### Before Launch
- [ ] Lighthouse Performance Score: 90+
- [ ] Lighthouse Accessibility Score: 95+
- [ ] LCP < 2.5s on mobile
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] No console errors or warnings
- [ ] Safari desktop + iOS tested
- [ ] Firefox tested
- [ ] Android Chrome tested
- [ ] Keyboard navigation works
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] Color contrast passes WCAG AA
- [ ] Skip to content link works
- [ ] All animations respect prefers-reduced-motion
- [ ] A11y Tests panel shows no errors

### Performance Testing Tools Summary

| Tool | Purpose | Link |
|------|---------|------|
| Lighthouse | Overall performance + accessibility | Chrome DevTools |
| WebPageTest | Detailed waterfall, slow connection | https://webpagetest.org |
| PageSpeed Insights | Real-world user data (CrUX) | https://pagespeed.web.dev |
| Chrome DevTools | CPU throttling, network throttling | Browser built-in |
| Web Vitals Extension | Live Core Web Vitals | Chrome Web Store |

### Accessibility Testing Tools Summary

| Tool | Purpose | Link |
|------|---------|------|
| A11y Tests Panel | Quick automated checks (built-in) | Bottom-right button (dev mode) |
| WAVE | Visual accessibility errors | https://wave.webaim.org |
| axe DevTools | Automated ARIA/accessibility audit | Chrome/Firefox extension |
| NVDA | Free screen reader testing | https://www.nvaccess.org |
| VoiceOver | macOS/iOS screen reader | Built into Apple devices |
| Color Contrast Checker | WCAG contrast validation | https://webaim.org/resources/contrastchecker |

---

## Expected Improvements

### Before Optimization
- LCP: ~4-6s (Hero loads slowly, 3D blocks paint)
- INP: ~300-500ms (Heavy animations, large JS bundles)
- CLS: ~0.15-0.3 (Lazy-loaded content shifts layout)
- Accessibility: ~75-85 (Missing ARIA, keyboard navigation issues)

### After Phase 1-4 Optimizations (Target)
- LCP: ~1.8-2.5s ✅ (Critical content prioritized, lazy loading)
- INP: ~100-200ms ✅ (Reduced animations, code splitting)
- CLS: <0.1 ✅ (Skeletons, reserved space, no layout shifts)
- Accessibility: 95+ ✅ (Skip links, ARIA, keyboard nav, reduced motion)

---

## Next Steps After Testing

1. **Run Lighthouse** on deployed site (not localhost)
   - Test both mobile and desktop
   - Document baseline metrics
   - Compare with targets

2. **Test on actual devices** (borrow phones if needed)
   - iPhone (Safari)
   - Android (Chrome)
   - Check 3D disabled, particles reduced

3. **Run screen reader** through critical user flows
   - Landing page
   - Onboarding flow
   - Key features

4. **Use A11y Tests panel** to quickly identify issues
   - Fix all errors
   - Address warnings
   - Re-test to verify

5. **Review and fix** any accessibility violations
   - Check color contrast
   - Verify keyboard nav
   - Test skip links

6. **Re-test** and compare metrics
   - Document improvements
   - Identify remaining bottlenecks

The performance monitoring and accessibility testing are already built in - check your browser console for Web Vitals logs and the bottom-right corner for the A11y Tests button!

---

## Common Issues & Solutions

### Performance Issues
**Problem:** LCP still > 2.5s
- Check if 3D components loading early (should be lazy)
- Verify hero image optimized
- Test with network throttling

**Problem:** Large bundle size
- Run bundle analyzer: `npm run build`
- Look for heavy dependencies
- Consider replacing with lighter alternatives

### Accessibility Issues
**Problem:** Keyboard focus not visible
- Check focus-visible styles in accessibility.css
- Verify not being overridden

**Problem:** Screen reader not announcing changes
- Check aria-live regions
- Verify live region helpers used correctly

**Problem:** Skip to content not working
- Verify #main-content ID exists
- Check skip link href matches

---

## Support Resources

- **Lighthouse Docs**: https://developer.chrome.com/docs/lighthouse
- **Web Vitals**: https://web.dev/vitals/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WebAIM**: https://webaim.org/

Need help? The performance monitor and A11y test panel are your first stop for quick diagnostics!

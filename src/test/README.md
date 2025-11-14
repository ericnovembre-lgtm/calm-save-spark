# Testing Guide for $ave+ Section Components

## Overview

Comprehensive unit tests for Welcome page section components using Vitest and React Testing Library.

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

Each section component has a dedicated test file:

- `WelcomeHeroSection.test.tsx` - Hero section with Lottie animation
- `WelcomeFeaturesSection.test.tsx` - Features grid and journey timeline
- `WelcomeStatsSection.test.tsx` - Statistics cards and live ticker
- `WelcomeCTASection.test.tsx` - Call-to-action section

## Test Coverage

Each test suite includes:

### 1. **Rendering Tests**
- Component renders without errors
- Child components render correctly
- Snapshot testing for regression detection

### 2. **Layout & Structure Tests**
- Responsive grid layouts
- Proper CSS classes applied
- Semantic HTML structure

### 3. **User Interaction Tests**
- Click handlers work correctly
- Double-click events (easter eggs)
- Pull-to-refresh functionality
- Keyboard navigation

### 4. **Accessibility Tests**
- ARIA attributes present
- Semantic HTML usage
- Keyboard navigation support
- Screen reader compatibility
- Proper heading hierarchy

### 5. **Animation Tests**
- Framer Motion animations configured
- Viewport intersection behavior
- Reduced motion preferences respected
- Staggered animation timing

### 6. **Props Validation Tests**
- Required props handled correctly
- Optional props work as expected
- Edge cases (null, undefined, extreme values)

### 7. **Performance Tests**
- Lazy loading implemented
- Error boundaries in place
- Priority loading configured
- Component tracking enabled

## Mock Strategy

All heavy dependencies are mocked:
- `framer-motion` - Simplified to static divs
- Child components - Replaced with test doubles
- Performance utilities - Pass-through implementations
- Hooks - Return predictable values

## Adding New Tests

When adding new section components:

1. Create test file: `__tests__/YourSection.test.tsx`
2. Follow existing test structure
3. Include all 7 test categories
4. Run tests and verify 100% coverage
5. Update this README with new test info

## CI/CD Integration

Tests run automatically on:
- Pre-commit hooks
- Pull request checks
- Production deployments

## Troubleshooting

If tests fail:
1. Check mock implementations match actual component APIs
2. Verify imports use correct paths
3. Ensure test environment setup is correct
4. Check for async timing issues (use `waitFor`)

## Best Practices

- ✅ Test behavior, not implementation
- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Mock external dependencies
- ✅ Keep tests isolated and independent
- ✅ Use descriptive test names
- ✅ Group related tests with describe blocks
- ✅ Aim for 80%+ code coverage

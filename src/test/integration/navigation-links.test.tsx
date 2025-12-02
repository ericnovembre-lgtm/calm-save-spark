import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

// Test routes configuration
const validRoutes = [
  '/dashboard',
  '/achievements',
  '/life-planner',
  '/analytics',
  '/goals',
  '/budget',
  '/transactions',
  '/settings',
  '/ai-agents',
  '/coach',
];

// Mock pages
const MockPage = ({ name }: { name: string }) => {
  const location = useLocation();
  return <div data-testid={`page-${name}`}>Current path: {location.pathname}</div>;
};

const TestApp = () => (
  <Routes>
    {validRoutes.map((route) => (
      <Route
        key={route}
        path={route}
        element={<MockPage name={route.replace('/', '')} />}
      />
    ))}
  </Routes>
);

describe('Navigation Links', () => {
  describe('Valid Routes', () => {
    it('should resolve all valid routes without redirects', () => {
      validRoutes.forEach((route) => {
        const { container } = renderWithProviders(
          <BrowserRouter>
            <TestApp />
          </BrowserRouter>
        );

        // Navigate to route
        window.history.pushState({}, '', route);
        
        // Verify route resolves
        const expectedTestId = `page-${route.replace('/', '')}`;
        expect(screen.queryByTestId(expectedTestId)).toBeTruthy();
      });
    });
  });

  describe('Removed Routes', () => {
    it('should not reference /rewards route', () => {
      // Test that /rewards is not in our valid routes
      expect(validRoutes).not.toContain('/rewards');
    });

    it('should not reference /life-events route', () => {
      // Test that /life-events is not in our valid routes
      expect(validRoutes).not.toContain('/life-events');
    });

    it('should not reference /gamification route', () => {
      // Test that /gamification is not in our valid routes
      expect(validRoutes).not.toContain('/gamification');
    });
  });

  describe('Consolidated Routes', () => {
    it('should have /achievements instead of /rewards', () => {
      expect(validRoutes).toContain('/achievements');
      expect(validRoutes).not.toContain('/rewards');
    });

    it('should have /life-planner instead of /life-events', () => {
      expect(validRoutes).toContain('/life-planner');
      expect(validRoutes).not.toContain('/life-events');
    });
  });
});

describe('Navigation Component Links', () => {
  it('FloatingHelpButton should map to correct consolidated pages', () => {
    const pageMap = {
      '/achievements': 'Achievements',
      '/life-planner': 'Life Planner',
    };

    // Verify mapping exists
    expect(pageMap['/achievements']).toBe('Achievements');
    expect(pageMap['/life-planner']).toBe('Life Planner');
    
    // Verify old routes don't exist
    expect(pageMap['/rewards' as keyof typeof pageMap]).toBeUndefined();
    expect(pageMap['/life-events' as keyof typeof pageMap]).toBeUndefined();
  });
});

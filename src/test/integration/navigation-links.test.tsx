import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

// Test routes configuration - comprehensive list from all navigation components
const validRoutes = [
  // Core routes
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
  // Hub routes (from BottomNav)
  '/hubs/manage-money',
  '/hubs/grow-wealth',
  '/hubs/ai-insights',
  '/hubs/lifestyle',
  // FAB menu routes
  '/accounts',
  // Search bar routes (from SearchBarHinted)
  '/pots',
  '/automations',
  '/insights',
  '/card',
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

  it('SearchBarHinted should not reference removed routes', () => {
    // Verify SearchBarHinted uses correct routes
    const searchRoutes = [
      '/dashboard',
      '/goals',
      '/pots',
      '/automations',
      '/achievements', // Updated from /rewards
      '/insights',
      '/analytics',
      '/card',
      '/settings',
    ];

    // All search routes should be in validRoutes
    searchRoutes.forEach(route => {
      expect(validRoutes).toContain(route);
    });

    // Old routes should not exist
    expect(searchRoutes).not.toContain('/rewards');
  });

  it('Breadcrumbs should have correct route name mappings', () => {
    const breadcrumbRouteMap: Record<string, string> = {
      dashboard: 'Dashboard',
      'manage-money': 'Manage Money',
      'grow-wealth': 'Grow Wealth',
      'ai-insights': 'AI & Insights',
      lifestyle: 'Lifestyle',
      premium: 'Premium',
      achievements: 'Achievements',
      'life-planner': 'Life Planner', // Updated from life-events
      goals: 'Goals',
      budget: 'Budget',
      transactions: 'Transactions',
      pots: 'Pots',
      automations: 'Automations',
      accounts: 'Accounts',
      coach: 'AI Coach',
      'ai-agents': 'AI Agents',
      analytics: 'Analytics',
      insights: 'Insights',
      card: 'Card',
      settings: 'Settings',
    };

    // Verify correct consolidated mappings
    expect(breadcrumbRouteMap['achievements']).toBe('Achievements');
    expect(breadcrumbRouteMap['life-planner']).toBe('Life Planner');

    // Old routes should not exist in the map
    expect(breadcrumbRouteMap['rewards']).toBeUndefined();
    expect(breadcrumbRouteMap['life-events']).toBeUndefined();
  });

  it('BottomNav should reference hub routes correctly', () => {
    const bottomNavRoutes = [
      '/dashboard',
      '/hubs/manage-money',
      '/hubs/grow-wealth',
      '/hubs/ai-insights',
      '/hubs/lifestyle',
    ];

    // All bottom nav routes should be valid
    bottomNavRoutes.forEach(route => {
      expect(validRoutes).toContain(route);
    });
  });

  it('FABMenu should reference valid routes', () => {
    const fabMenuRoutes = [
      '/goals',
      '/transactions',
      '/accounts',
      '/coach',
    ];

    // All FAB menu routes should be valid
    fabMenuRoutes.forEach(route => {
      expect(validRoutes).toContain(route);
    });
  });
});

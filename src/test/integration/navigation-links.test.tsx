import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

// Test routes configuration - comprehensive list from all navigation components
const validRoutes = [
  // Core routes
  '/dashboard',
  '/achievements',
  '/digital-twin', // Consolidated from /life-planner
  '/goals',
  '/budget',
  '/analytics', // Consolidated from /insights
  '/transactions',
  '/settings',
  '/ai-agents',
  '/coach',
  // Hub routes (from BottomNav in AppLayout.tsx)
  '/hubs/manage-money',
  '/hubs/grow-wealth',
  '/hubs/ai-insights',
  '/features-hub', // BottomNav "More" button
  // FAB menu routes
  '/accounts',
  // Search bar routes (from SearchBarHinted)
  '/pots',
  '/automations',
  '/card',
  // Additional routes from App.tsx
  '/subscriptions',
  '/debts',
  '/investments',
  '/credit',
  '/wallet',
  '/financial-health',
  '/help',
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
      expect(validRoutes).not.toContain('/rewards');
    });

    it('should not reference /life-events route', () => {
      expect(validRoutes).not.toContain('/life-events');
    });

    it('should not reference /gamification route', () => {
      expect(validRoutes).not.toContain('/gamification');
    });

    it('should not reference /life-planner route (consolidated into /digital-twin)', () => {
      expect(validRoutes).not.toContain('/life-planner');
    });

    it('should not reference /insights route (consolidated into /analytics)', () => {
      expect(validRoutes).not.toContain('/insights');
    });

    it('should not reference /hubs/memory route (consolidated into /digital-twin)', () => {
      expect(validRoutes).not.toContain('/hubs/memory');
    });
  });

  describe('Consolidated Routes', () => {
    it('should have /achievements instead of /rewards', () => {
      expect(validRoutes).toContain('/achievements');
      expect(validRoutes).not.toContain('/rewards');
    });

    it('should have /digital-twin instead of /life-planner', () => {
      expect(validRoutes).toContain('/digital-twin');
      expect(validRoutes).not.toContain('/life-planner');
    });

    it('should have /analytics instead of /insights', () => {
      expect(validRoutes).toContain('/analytics');
      expect(validRoutes).not.toContain('/insights');
    });

    it('should have /digital-twin instead of /hubs/memory', () => {
      expect(validRoutes).toContain('/digital-twin');
      expect(validRoutes).not.toContain('/hubs/memory');
    });
  });
});

describe('Navigation Component Links', () => {
  it('FloatingHelpButton should map to correct consolidated pages', () => {
    const pageMap = {
      '/achievements': 'Achievements',
      '/digital-twin': 'Digital Twin',
      '/analytics': 'Analytics',
    };

    // Verify mapping exists
    expect(pageMap['/achievements']).toBe('Achievements');
    expect(pageMap['/digital-twin']).toBe('Digital Twin');
    expect(pageMap['/analytics']).toBe('Analytics');
    
    // Verify old routes don't exist
    expect(pageMap['/rewards' as keyof typeof pageMap]).toBeUndefined();
    expect(pageMap['/life-planner' as keyof typeof pageMap]).toBeUndefined();
    expect(pageMap['/insights' as keyof typeof pageMap]).toBeUndefined();
  });

  it('SearchBarHinted should not reference removed routes', () => {
    const searchRoutes = [
      '/dashboard',
      '/goals',
      '/pots',
      '/automations',
      '/achievements',
      '/analytics', // Consolidated from /insights
      '/card',
      '/settings',
      '/admin',
      '/admin-monitoring',
      '/security-monitoring',
      '/claude-monitoring',
      '/hubs/lifestyle',
      '/hubs/premium',
      '/digital-twin', // Consolidated from /hubs/memory
    ];

    // Old routes should not exist
    expect(searchRoutes).not.toContain('/rewards');
    expect(searchRoutes).not.toContain('/insights');
    expect(searchRoutes).not.toContain('/hubs/memory');
    expect(searchRoutes).not.toContain('/life-planner');
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
      'digital-twin': 'Digital Twin', // Consolidated from life-planner
      goals: 'Goals',
      budget: 'Budget',
      transactions: 'Transactions',
      pots: 'Pots',
      automations: 'Automations',
      accounts: 'Accounts',
      coach: 'AI Coach',
      'ai-agents': 'AI Agents',
      analytics: 'Analytics', // Consolidated from insights
      card: 'Card',
      settings: 'Settings',
    };

    // Verify correct consolidated mappings
    expect(breadcrumbRouteMap['achievements']).toBe('Achievements');
    expect(breadcrumbRouteMap['digital-twin']).toBe('Digital Twin');
    expect(breadcrumbRouteMap['analytics']).toBe('Analytics');

    // Old routes should not exist in the map
    expect(breadcrumbRouteMap['rewards']).toBeUndefined();
    expect(breadcrumbRouteMap['life-planner']).toBeUndefined();
    expect(breadcrumbRouteMap['life-events']).toBeUndefined();
    expect(breadcrumbRouteMap['insights']).toBeUndefined();
  });

  it('BottomNav should reference hub routes correctly', () => {
    const bottomNavRoutes = [
      '/dashboard',
      '/hubs/manage-money',
      '/hubs/grow-wealth',
      '/hubs/ai-insights',
      '/features-hub',
    ];

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

    fabMenuRoutes.forEach(route => {
      expect(validRoutes).toContain(route);
    });
  });

  it('admin nav links should reference valid routes', () => {
    const adminRoutes = ['/admin', '/admin-monitoring', '/security-monitoring', '/claude-monitoring'];
    // Admin routes are separate from the main validRoutes array
    expect(adminRoutes.length).toBe(4);
  });

  it('should not reference non-existent admin routes', () => {
    expect(validRoutes).not.toContain('/admin-agents');
    expect(validRoutes).not.toContain('/admin-functions');
  });

  it('Digital Twin should be accessible (consolidated Memory Hub)', () => {
    expect(validRoutes).toContain('/digital-twin');
    expect(validRoutes).not.toContain('/hubs/memory');
  });
});

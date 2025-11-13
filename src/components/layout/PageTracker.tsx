import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecentPages } from '@/hooks/useRecentPages';

/**
 * PageTracker - Global component that tracks page visits
 * Automatically populates recent pages history for 404 page enhancement
 */
export function PageTracker() {
  const location = useLocation();
  const { addPage } = useRecentPages();

  useEffect(() => {
    // Don't track 404 pages or auth pages
    if (location.pathname === '*' || location.pathname.startsWith('/auth')) {
      return;
    }

    // Map paths to readable titles
    const pathTitleMap: Record<string, string> = {
      '/': 'Home',
      '/welcome': 'Welcome',
      '/dashboard': 'Dashboard',
      '/goals': 'Goals',
      '/transactions': 'Transactions',
      '/budget': 'Budget',
      '/insights': 'Insights',
      '/settings': 'Settings',
      '/help': 'Help Center',
      '/coach': 'AI Coach',
      '/automations': 'Automations',
      '/pots': 'Pots',
      '/achievements': 'Achievements',
      '/analytics': 'Analytics',
      '/credit': 'Credit Score',
      '/investments': 'Investments',
      '/debts': 'Debts',
      '/subscriptions': 'Subscriptions',
      '/financial-health': 'Financial Health',
      '/pricing': 'Pricing',
      '/social': 'Social',
      '/leaderboard': 'Leaderboard',
      '/family': 'Family',
      '/student': 'Student',
      '/business': 'Business',
      '/sustainability': 'Sustainability',
      '/literacy': 'Financial Literacy',
      '/integrations': 'Integrations',
      '/bill-negotiation': 'Bill Negotiation',
      '/admin': 'Admin',
      '/whitelabel': 'White Label',
    };

    const title = pathTitleMap[location.pathname] || 'Page';
    
    // Add page to recent history
    addPage(location.pathname, title);
  }, [location.pathname, addPage]);

  return null;
}

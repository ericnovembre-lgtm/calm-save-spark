import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecentPages } from '@/hooks/useRecentPages';
import { trackPageViewToDb } from '@/lib/page-tracker';

/**
 * PageTracker - Global component that tracks page visits
 * - Populates recent pages history for 404 page enhancement
 * - Tracks page views to database for analytics
 */
export function PageTracker() {
  const location = useLocation();
  const { addPage } = useRecentPages();
  const isTracking = useRef(false);

  useEffect(() => {
    // Prevent duplicate tracking
    if (isTracking.current) return;
    
    // Don't track 404 pages
    if (location.pathname === '*') {
      return;
    }

    // Map paths to readable titles
    const pathTitleMap: Record<string, string> = {
      '/': 'Home',
      '/dashboard': 'Dashboard',
      '/goals': 'Goals',
      '/transactions': 'Transactions',
      '/budget': 'Budget',
      '/settings': 'Settings',
      '/digital-twin': 'Digital Twin',
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
      '/business-os': 'Business OS',
      '/sustainability': 'Sustainability',
      '/literacy': 'Financial Literacy',
      '/integrations': 'Integrations',
      '/bill-negotiation': 'Bill Negotiation',
      '/admin': 'Admin',
      '/whitelabel': 'White Label',
      '/guardian': 'Guardian Security',
      '/ai-agents': 'AI Agents',
      '/wallet': 'Wallet',
      '/card': 'Card',
      '/accounts': 'Accounts',
      '/lifesim': 'LifeSim',
      '/security-settings': 'Security Settings',
      '/changelog': 'Changelog',
      '/search': 'Search',
      '/sitemap': 'Sitemap',
      '/page-analytics': 'Page Analytics',
    };

    const title = pathTitleMap[location.pathname] || 'Page';
    
    // Track page view
    isTracking.current = true;
    try {
      // Add to recent pages (session storage)
      addPage(location.pathname, title);
      
      // Track to database for analytics
      trackPageViewToDb(location.pathname, title);
    } catch (error) {
      console.error('PageTracker error:', error);
    } finally {
      // Reset tracking flag after a short delay
      setTimeout(() => {
        isTracking.current = false;
      }, 100);
    }
  }, [location.pathname, addPage]);

  return null;
}

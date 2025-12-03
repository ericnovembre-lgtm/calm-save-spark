import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalAI } from '@/contexts/GlobalAIContext';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/goals': 'Goals',
  '/pots': 'Pots',
  '/transactions': 'Transactions',
  '/automation': 'Automation',
  '/digital-twin': 'Digital Twin',
  '/hubs/ai-insights': 'AI Insights',
  '/budget': 'Budget',
  '/cards': 'Cards',
  '/investments': 'Investments',
  '/settings': 'Settings',
  '/analytics': 'Analytics',
  '/business-os': 'Business OS',
};

export function usePageContext(additionalData?: any) {
  const location = useLocation();
  const { setPageContext } = useGlobalAI();

  useEffect(() => {
    const route = location.pathname;
    const title = routeTitles[route] || 'Page';
    
    setPageContext({
      route,
      title,
      data: additionalData,
    });
  }, [location.pathname, additionalData, setPageContext]);
}

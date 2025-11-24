import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ACCOUNTS, DEMO_LIQUIDITY_DATA, DEMO_FORECAST, DEMO_INVESTMENT_ACCOUNTS, DEMO_PORTFOLIO_HOLDINGS } from '@/lib/demo-data';

export const useDemoAccounts = () => {
  const { isDemoMode } = useDemoMode();

  return {
    accounts: isDemoMode ? DEMO_ACCOUNTS : null,
    liquidity: isDemoMode ? DEMO_LIQUIDITY_DATA : null,
    forecast: isDemoMode ? DEMO_FORECAST : null,
    investmentAccounts: isDemoMode ? DEMO_INVESTMENT_ACCOUNTS : null,
    portfolioHoldings: isDemoMode ? DEMO_PORTFOLIO_HOLDINGS : null,
    isDemoMode,
  };
};

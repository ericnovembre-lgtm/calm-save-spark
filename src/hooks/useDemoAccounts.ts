import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ACCOUNTS, DEMO_LIQUIDITY_DATA, DEMO_FORECAST } from '@/lib/demo-data';

export const useDemoAccounts = () => {
  const { isDemoMode } = useDemoMode();

  return {
    accounts: isDemoMode ? DEMO_ACCOUNTS : null,
    liquidity: isDemoMode ? DEMO_LIQUIDITY_DATA : null,
    forecast: isDemoMode ? DEMO_FORECAST : null,
    isDemoMode,
  };
};

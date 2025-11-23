import type { Database } from '@/integrations/supabase/types';

type ConnectedAccount = Database['public']['Tables']['connected_accounts']['Row'];

export const DEMO_ACCOUNTS: Partial<ConnectedAccount>[] = [
  {
    id: 'demo-checking-1',
    institution_name: 'Demo Bank',
    account_type: 'checking',
    account_mask: '1234',
    current_balance: 3247.82,
    balance: 3247.82,
    currency: 'USD',
    apy: 0.01,
    nickname: 'Main Checking 💳',
    last_synced: new Date().toISOString(),
    user_id: 'demo-user',
    created_at: new Date().toISOString(),
    sync_status: 'active',
  },
  {
    id: 'demo-savings-1',
    institution_name: 'Demo Bank',
    account_type: 'savings',
    account_mask: '5678',
    current_balance: 12450.00,
    balance: 12450.00,
    currency: 'USD',
    apy: 4.5,
    nickname: 'Emergency Fund 🛡️',
    last_synced: new Date().toISOString(),
    user_id: 'demo-user',
    created_at: new Date().toISOString(),
    sync_status: 'active',
  },
  {
    id: 'demo-credit-1',
    institution_name: 'Demo Credit Union',
    account_type: 'credit_card',
    account_mask: '9012',
    current_balance: -847.23,
    balance: -847.23,
    currency: 'USD',
    apy: 0,
    last_synced: new Date().toISOString(),
    user_id: 'demo-user',
    created_at: new Date().toISOString(),
    sync_status: 'active',
  },
  {
    id: 'demo-investment-1',
    institution_name: 'Demo Investments',
    account_type: 'investment',
    account_mask: '3456',
    current_balance: 25678.94,
    balance: 25678.94,
    currency: 'USD',
    apy: 8.2,
    nickname: 'Retirement 401k 📈',
    last_synced: new Date().toISOString(),
    user_id: 'demo-user',
    created_at: new Date().toISOString(),
    sync_status: 'active',
  },
];

export const DEMO_LIQUIDITY_DATA = {
  totalCash: 15697.82,
  upcomingBills: 1280.50,
  safeToSpend: 14417.32,
  dailySpendAvg: 87.40,
  runway: 165,
};

export const DEMO_FORECAST = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  
  // Simulate some variation in safe to spend
  const baseAmount = 14417.32;
  const variation = Math.sin(i / 10) * 2000;
  const bills = [1, 15].includes(date.getDate()) ? -500 : 0;
  const income = [1, 15].includes(date.getDate()) ? 3000 : 0;
  
  return {
    date: date.toISOString().split('T')[0],
    safeToSpend: Math.max(0, baseAmount + variation + (bills * i / 90) + (income * i / 90)),
    expectedSpending: 87.40,
    bills: [1, 15].includes(date.getDate()) ? 500 : 0,
    income: [1, 15].includes(date.getDate()) ? 3000 : 0,
  };
});

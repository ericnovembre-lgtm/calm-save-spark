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

export const DEMO_INVESTMENT_ACCOUNTS = [
  {
    id: 'demo-brokerage-1',
    user_id: 'demo-user',
    account_name: 'Fidelity Individual',
    account_type: 'brokerage',
    total_value: 45678.50,
    cost_basis: 38500.00,
    institution_name: 'Fidelity Investments',
    gains_losses: 7178.50,
    holdings: [],
    last_synced: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-crypto-1',
    user_id: 'demo-user',
    account_name: 'Coinbase Crypto',
    account_type: 'crypto',
    total_value: 12340.75,
    cost_basis: 15000.00,
    institution_name: 'Coinbase',
    gains_losses: -2659.25,
    holdings: [],
    last_synced: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-401k-1',
    user_id: 'demo-user',
    account_name: 'Retirement 401k',
    account_type: 'retirement',
    total_value: 67890.00,
    cost_basis: 55000.00,
    institution_name: 'Vanguard',
    gains_losses: 12890.00,
    holdings: [],
    last_synced: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-bonds-1',
    user_id: 'demo-user',
    account_name: 'Treasury Direct',
    account_type: 'bonds',
    total_value: 10000.00,
    cost_basis: 9500.00,
    institution_name: 'TreasuryDirect',
    gains_losses: 500.00,
    holdings: [],
    last_synced: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_PORTFOLIO_HOLDINGS = [
  {
    id: 'demo-holding-1',
    user_id: 'demo-user',
    account_id: 'demo-brokerage-1',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    shares: 25,
    price: 124.50,
    change: 3.2,
    change_percent: 3.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-holding-2',
    user_id: 'demo-user',
    account_id: 'demo-brokerage-1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    price: 189.45,
    change: -0.8,
    change_percent: -0.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-holding-3',
    user_id: 'demo-user',
    account_id: 'demo-crypto-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    shares: 0.15,
    price: 67000,
    change: 2.5,
    change_percent: 2.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-holding-4',
    user_id: 'demo-user',
    account_id: 'demo-brokerage-1',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 30,
    price: 248.50,
    change: -1.5,
    change_percent: -1.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-holding-5',
    user_id: 'demo-user',
    account_id: 'demo-brokerage-1',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 40,
    price: 378.20,
    change: 1.2,
    change_percent: 1.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-holding-6',
    user_id: 'demo-user',
    account_id: 'demo-crypto-1',
    symbol: 'ETH',
    name: 'Ethereum',
    shares: 2.5,
    price: 3450,
    change: 1.8,
    change_percent: 1.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-holding-7',
    user_id: 'demo-user',
    account_id: 'demo-401k-1',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    shares: 100,
    price: 478.90,
    change: 0.5,
    change_percent: 0.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-holding-8',
    user_id: 'demo-user',
    account_id: 'demo-401k-1',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    shares: 50,
    price: 445.30,
    change: 0.9,
    change_percent: 0.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export interface DemoMerchantLocation {
  merchant: string;
  lat: number;
  lon: number;
  city: string | null;
  state: string | null;
  totalSpent: number;
  transactionCount: number;
  category: string | null;
  lastTransaction: Date;
}

export const DEMO_MERCHANT_LOCATIONS: DemoMerchantLocation[] = [
  {
    merchant: 'Starbucks Reserve',
    lat: 40.7484,
    lon: -73.9857,
    city: 'New York',
    state: 'NY',
    totalSpent: 87.50,
    transactionCount: 12,
    category: 'Food & Dining',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    merchant: 'Target',
    lat: 34.0522,
    lon: -118.2437,
    city: 'Los Angeles',
    state: 'CA',
    totalSpent: 245.99,
    transactionCount: 5,
    category: 'Shopping',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    merchant: 'Whole Foods Market',
    lat: 41.8781,
    lon: -87.6298,
    city: 'Chicago',
    state: 'IL',
    totalSpent: 342.18,
    transactionCount: 8,
    category: 'Groceries',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    merchant: 'Delta Airlines',
    lat: 33.6407,
    lon: -84.4277,
    city: 'Atlanta',
    state: 'GA',
    totalSpent: 1289.00,
    transactionCount: 2,
    category: 'Travel',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
  {
    merchant: 'AMC Theater',
    lat: 30.2672,
    lon: -97.7431,
    city: 'Austin',
    state: 'TX',
    totalSpent: 64.50,
    transactionCount: 3,
    category: 'Entertainment',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    merchant: 'Shake Shack',
    lat: 25.7617,
    lon: -80.1918,
    city: 'Miami',
    state: 'FL',
    totalSpent: 48.25,
    transactionCount: 4,
    category: 'Food & Dining',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  },
  {
    merchant: 'Apple Store',
    lat: 37.7749,
    lon: -122.4194,
    city: 'San Francisco',
    state: 'CA',
    totalSpent: 1499.00,
    transactionCount: 1,
    category: 'Shopping',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
  },
  {
    merchant: 'Trader Joe\'s',
    lat: 39.7392,
    lon: -104.9903,
    city: 'Denver',
    state: 'CO',
    totalSpent: 156.78,
    transactionCount: 6,
    category: 'Groceries',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    merchant: 'Chipotle Mexican Grill',
    lat: 47.6062,
    lon: -122.3321,
    city: 'Seattle',
    state: 'WA',
    totalSpent: 93.42,
    transactionCount: 7,
    category: 'Food & Dining',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    merchant: 'REI Co-op',
    lat: 45.5152,
    lon: -122.6784,
    city: 'Portland',
    state: 'OR',
    totalSpent: 287.50,
    transactionCount: 2,
    category: 'Shopping',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  },
];

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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 2),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 6),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 12),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    merchant: "Trader Joe's",
    lat: 39.7392,
    lon: -104.9903,
    city: 'Denver',
    state: 'CO',
    totalSpent: 156.78,
    transactionCount: 6,
    category: 'Groceries',
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 4),
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
    lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
];

// International demo locations for globe visualization
export interface GlobalDemoLocation {
  id: string;
  merchant: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  totalSpent: number;
  transactionCount: number;
  category: string;
  lastTransaction: Date;
}

export const DEMO_GLOBAL_LOCATIONS: GlobalDemoLocation[] = [
  // North America
  { id: '1', merchant: 'Starbucks Reserve', lat: 40.7484, lon: -73.9857, city: 'New York', country: 'USA', totalSpent: 287.50, transactionCount: 12, category: 'Food & Dining', lastTransaction: new Date() },
  { id: '2', merchant: 'Apple Store', lat: 37.7749, lon: -122.4194, city: 'San Francisco', country: 'USA', totalSpent: 2499.00, transactionCount: 2, category: 'Shopping', lastTransaction: new Date() },
  { id: '3', merchant: 'Delta Airlines', lat: 33.6407, lon: -84.4277, city: 'Atlanta', country: 'USA', totalSpent: 1289.00, transactionCount: 3, category: 'Travel', lastTransaction: new Date() },
  { id: '4', merchant: 'Four Seasons', lat: 19.4326, lon: -99.1332, city: 'Mexico City', country: 'Mexico', totalSpent: 890.00, transactionCount: 1, category: 'Travel', lastTransaction: new Date() },
  { id: '5', merchant: 'CN Tower Restaurant', lat: 43.6426, lon: -79.3871, city: 'Toronto', country: 'Canada', totalSpent: 245.00, transactionCount: 1, category: 'Food & Dining', lastTransaction: new Date() },
  
  // Europe
  { id: '6', merchant: 'Harrods', lat: 51.4994, lon: -0.1634, city: 'London', country: 'UK', totalSpent: 1850.00, transactionCount: 4, category: 'Shopping', lastTransaction: new Date() },
  { id: '7', merchant: 'Galeries Lafayette', lat: 48.8738, lon: 2.3320, city: 'Paris', country: 'France', totalSpent: 1245.00, transactionCount: 3, category: 'Shopping', lastTransaction: new Date() },
  { id: '8', merchant: 'Ritz Carlton', lat: 52.5200, lon: 13.4050, city: 'Berlin', country: 'Germany', totalSpent: 678.00, transactionCount: 2, category: 'Travel', lastTransaction: new Date() },
  { id: '9', merchant: 'La Scala', lat: 45.4654, lon: 9.1859, city: 'Milan', country: 'Italy', totalSpent: 350.00, transactionCount: 2, category: 'Entertainment', lastTransaction: new Date() },
  { id: '10', merchant: 'El Corte Inglés', lat: 40.4168, lon: -3.7038, city: 'Madrid', country: 'Spain', totalSpent: 567.00, transactionCount: 3, category: 'Shopping', lastTransaction: new Date() },
  
  // Asia
  { id: '11', merchant: 'Tsukiji Market', lat: 35.6762, lon: 139.6503, city: 'Tokyo', country: 'Japan', totalSpent: 425.00, transactionCount: 5, category: 'Food & Dining', lastTransaction: new Date() },
  { id: '12', merchant: 'Marina Bay Sands', lat: 1.2838, lon: 103.8591, city: 'Singapore', country: 'Singapore', totalSpent: 1890.00, transactionCount: 2, category: 'Travel', lastTransaction: new Date() },
  { id: '13', merchant: 'IFC Mall', lat: 22.2855, lon: 114.1577, city: 'Hong Kong', country: 'China', totalSpent: 2340.00, transactionCount: 4, category: 'Shopping', lastTransaction: new Date() },
  { id: '14', merchant: 'Burj Khalifa', lat: 25.1972, lon: 55.2744, city: 'Dubai', country: 'UAE', totalSpent: 1567.00, transactionCount: 3, category: 'Entertainment', lastTransaction: new Date() },
  { id: '15', merchant: 'Taj Mahal Palace', lat: 18.9220, lon: 72.8347, city: 'Mumbai', country: 'India', totalSpent: 890.00, transactionCount: 2, category: 'Travel', lastTransaction: new Date() },
  
  // Oceania
  { id: '16', merchant: 'Sydney Opera House', lat: -33.8568, lon: 151.2153, city: 'Sydney', country: 'Australia', totalSpent: 456.00, transactionCount: 2, category: 'Entertainment', lastTransaction: new Date() },
  { id: '17', merchant: 'Sky Tower', lat: -36.8485, lon: 174.7633, city: 'Auckland', country: 'New Zealand', totalSpent: 234.00, transactionCount: 1, category: 'Entertainment', lastTransaction: new Date() },
  
  // South America
  { id: '18', merchant: 'Copacabana Palace', lat: -22.9068, lon: -43.1729, city: 'Rio de Janeiro', country: 'Brazil', totalSpent: 1234.00, transactionCount: 2, category: 'Travel', lastTransaction: new Date() },
  { id: '19', merchant: 'Palermo Soho', lat: -34.6037, lon: -58.3816, city: 'Buenos Aires', country: 'Argentina', totalSpent: 567.00, transactionCount: 3, category: 'Shopping', lastTransaction: new Date() },
  
  // Africa
  { id: '20', merchant: 'V&A Waterfront', lat: -33.9025, lon: 18.4241, city: 'Cape Town', country: 'South Africa', totalSpent: 345.00, transactionCount: 2, category: 'Shopping', lastTransaction: new Date() },
];

import { supabase } from "@/integrations/supabase/client";

export interface ExchangeRate {
  base_currency: string;
  target_currency: string;
  rate: number;
  fetched_at: string;
}

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
];

export async function fetchExchangeRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<number> {
  if (baseCurrency === targetCurrency) return 1;

  // Try to get cached rate from database (less than 1 hour old)
  const { data: cachedRate } = await supabase
    .from('exchange_rates')
    .select('rate, fetched_at')
    .eq('base_currency', baseCurrency)
    .eq('target_currency', targetCurrency)
    .single();

  if (cachedRate) {
    const fetchedAt = new Date(cachedRate.fetched_at);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (fetchedAt > hourAgo) {
      return cachedRate.rate;
    }
  }

  // Fetch fresh rate from edge function
  const { data, error } = await supabase.functions.invoke('fetch-exchange-rates', {
    body: { base: baseCurrency, target: targetCurrency }
  });

  if (error) {
    console.error('Error fetching exchange rate:', error);
    return cachedRate?.rate || 1; // Fallback to cached or 1:1
  }

  return data?.rate || 1;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

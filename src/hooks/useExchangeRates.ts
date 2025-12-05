import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORTED_CURRENCIES, formatCurrency, getCurrencySymbol } from "@/lib/exchangeRates";

export interface ExchangeRateData {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  fetchedAt: string;
  change24h?: number;
}

export interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  baseCurrency: string;
  targetCurrency: string;
}

export function useExchangeRates(baseCurrency: string = 'USD') {
  const queryClient = useQueryClient;

  // Fetch all rates for a base currency
  const ratesQuery = useQuery({
    queryKey: ['exchange-rates', baseCurrency],
    queryFn: async (): Promise<ExchangeRateData[]> => {
      const { data: cachedRates, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('base_currency', baseCurrency);

      if (error) throw error;

      // Filter for rates less than 1 hour old
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const validRates = (cachedRates || []).filter(rate => {
        const fetchedAt = new Date(rate.fetched_at);
        return fetchedAt > hourAgo;
      });

      // If we have valid cached rates, return them
      if (validRates.length > 0) {
        return validRates.map(rate => ({
          baseCurrency: rate.base_currency,
          targetCurrency: rate.target_currency,
          rate: rate.rate,
          fetchedAt: rate.fetched_at,
        }));
      }

      // Fetch fresh rates for all supported currencies
      const targetCurrencies = SUPPORTED_CURRENCIES
        .filter(c => c.code !== baseCurrency)
        .map(c => c.code);

      const { data, error: fetchError } = await supabase.functions.invoke('fetch-exchange-rates', {
        body: { base: baseCurrency, targets: targetCurrencies }
      });

      if (fetchError) {
        console.error('Error fetching exchange rates:', fetchError);
        return [];
      }

      return (data?.rates || []).map((rate: any) => ({
        baseCurrency: rate.base_currency || baseCurrency,
        targetCurrency: rate.target_currency,
        rate: rate.rate,
        fetchedAt: rate.fetched_at || new Date().toISOString(),
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  // Get single rate between two currencies
  const getRate = useQuery({
    queryKey: ['exchange-rate-single', baseCurrency],
    queryFn: async () => {
      // This is handled by ratesQuery
      return null;
    },
    enabled: false,
  });

  // Convert amount between currencies
  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): ConversionResult | null => {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        rate: 1,
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
      };
    }

    const rates = ratesQuery.data || [];
    
    // Try direct rate
    let rate = rates.find(
      r => r.baseCurrency === fromCurrency && r.targetCurrency === toCurrency
    );

    if (rate) {
      return {
        originalAmount: amount,
        convertedAmount: amount * rate.rate,
        rate: rate.rate,
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
      };
    }

    // Try inverse rate
    const inverseRate = rates.find(
      r => r.baseCurrency === toCurrency && r.targetCurrency === fromCurrency
    );

    if (inverseRate) {
      const calculatedRate = 1 / inverseRate.rate;
      return {
        originalAmount: amount,
        convertedAmount: amount * calculatedRate,
        rate: calculatedRate,
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
      };
    }

    // Try cross-rate via USD
    if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
      const fromToUsd = rates.find(
        r => r.baseCurrency === fromCurrency && r.targetCurrency === 'USD'
      ) || rates.find(
        r => r.baseCurrency === 'USD' && r.targetCurrency === fromCurrency
      );

      const usdToTarget = rates.find(
        r => r.baseCurrency === 'USD' && r.targetCurrency === toCurrency
      ) || rates.find(
        r => r.baseCurrency === toCurrency && r.targetCurrency === 'USD'
      );

      if (fromToUsd && usdToTarget) {
        const rate1 = fromToUsd.baseCurrency === fromCurrency 
          ? fromToUsd.rate 
          : 1 / fromToUsd.rate;
        const rate2 = usdToTarget.baseCurrency === 'USD'
          ? usdToTarget.rate
          : 1 / usdToTarget.rate;
        const crossRate = rate1 * rate2;

        return {
          originalAmount: amount,
          convertedAmount: amount * crossRate,
          rate: crossRate,
          baseCurrency: fromCurrency,
          targetCurrency: toCurrency,
        };
      }
    }

    return null;
  };

  // Refresh rates
  const refreshRates = useMutation({
    mutationFn: async () => {
      const targetCurrencies = SUPPORTED_CURRENCIES
        .filter(c => c.code !== baseCurrency)
        .map(c => c.code);

      const { data, error } = await supabase.functions.invoke('fetch-exchange-rates', {
        body: { base: baseCurrency, targets: targetCurrencies, forceRefresh: true }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient().invalidateQueries({ queryKey: ['exchange-rates'] });
    },
  });

  // Get formatted currency display
  const formatAmount = (amount: number, currencyCode: string): string => {
    return formatCurrency(amount, currencyCode);
  };

  // Get symbol for currency
  const getSymbol = (currencyCode: string): string => {
    return getCurrencySymbol(currencyCode);
  };

  return {
    rates: ratesQuery.data || [],
    isLoading: ratesQuery.isLoading,
    isError: ratesQuery.isError,
    error: ratesQuery.error,
    convertCurrency,
    refreshRates: refreshRates.mutate,
    isRefreshing: refreshRates.isPending,
    formatAmount,
    getSymbol,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
}

export { SUPPORTED_CURRENCIES, formatCurrency, getCurrencySymbol };

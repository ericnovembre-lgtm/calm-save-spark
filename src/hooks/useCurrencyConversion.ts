import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCurrencyConversion = (amount: number, fromCurrency: string = 'USD') => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_currency')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const targetCurrency = profile?.preferred_currency || 'USD';

  const { data: exchangeRate } = useQuery({
    queryKey: ['exchange-rate', fromCurrency, targetCurrency],
    queryFn: async () => {
      if (fromCurrency === targetCurrency) return { rate: 1 };
      
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('base_currency', fromCurrency)
        .eq('target_currency', targetCurrency)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // If no exchange rate found, default to 1:1
        console.warn('Exchange rate not found, using 1:1 rate');
        return { rate: 1 };
      }
      return data;
    },
    enabled: fromCurrency !== targetCurrency && !!targetCurrency,
  });

  const convertedAmount = amount * (exchangeRate?.rate || 1);
  const rate = exchangeRate?.rate || 1;

  return {
    convertedAmount,
    targetCurrency,
    rate,
    isConverted: fromCurrency !== targetCurrency,
  };
};

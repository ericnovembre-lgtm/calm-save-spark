import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCurrencyConversion = (amount: number, fromCurrency: string = 'USD') => {
  // For now, return USD without conversion since preferred_currency column doesn't exist yet
  // This can be enhanced once the database schema is updated
  
  const targetCurrency = 'USD';
  const convertedAmount = amount;
  const rate = 1;

  return {
    convertedAmount,
    targetCurrency,
    rate,
    isConverted: false,
  };
};

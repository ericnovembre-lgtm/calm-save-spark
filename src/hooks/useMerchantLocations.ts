import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_MERCHANT_LOCATIONS } from '@/lib/demo-data';

export interface MerchantLocation {
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

interface UseMerchantLocationsParams {
  cardId?: string;
  dateRange?: { start: Date; end: Date };
  categories?: string[];
  minAmount?: number;
}

export function useMerchantLocations({
  cardId,
  dateRange = {
    start: new Date(new Date().setDate(1)), // Start of month
    end: new Date(),
  },
  categories,
  minAmount,
}: UseMerchantLocationsParams) {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['merchant-locations', cardId, dateRange, categories, minAmount, isDemoMode],
    queryFn: async (): Promise<MerchantLocation[]> => {
      // Return demo data in demo mode
      if (isDemoMode) {
        let demoLocations = [...DEMO_MERCHANT_LOCATIONS];

        // Apply category filter
        if (categories && categories.length > 0) {
          demoLocations = demoLocations.filter(loc => 
            categories.includes(loc.category || 'Other')
          );
        }

        // Apply minimum amount filter
        if (minAmount) {
          demoLocations = demoLocations.filter(loc => 
            loc.totalSpent >= minAmount
          );
        }

        return demoLocations;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('card_transactions')
        .select('*')
        .eq('user_id', user.id)
        .not('merchant_lat', 'is', null)
        .not('merchant_lon', 'is', null)
        .gte('transaction_date', dateRange.start.toISOString())
        .lte('transaction_date', dateRange.end.toISOString());

      if (cardId && cardId !== 'demo') {
        query = query.eq('card_id', cardId);
      }

      if (minAmount) {
        query = query.gte('amount_cents', minAmount * 100);
      }

      const { data: transactions, error } = await query;
      if (error) throw error;

      // Filter by categories if provided
      let filteredTxs = transactions;
      if (categories && categories.length > 0) {
        filteredTxs = transactions.filter(tx => 
          categories.includes(tx.ai_category || 'Other')
        );
      }

      // Aggregate by location
      const locationMap = new Map<string, MerchantLocation>();

      filteredTxs.forEach(tx => {
        const key = `${tx.merchant_lat},${tx.merchant_lon}`;
        const existing = locationMap.get(key);
        const amount = Math.abs(tx.amount_cents) / 100;

        if (existing) {
          existing.totalSpent += amount;
          existing.transactionCount += 1;
          existing.lastTransaction = new Date(
            Math.max(existing.lastTransaction.getTime(), new Date(tx.transaction_date).getTime())
          );
        } else {
          locationMap.set(key, {
            merchant: tx.ai_merchant_name || tx.merchant_name || 'Unknown',
            lat: tx.merchant_lat!,
            lon: tx.merchant_lon!,
            city: tx.merchant_city,
            state: tx.merchant_state,
            totalSpent: amount,
            transactionCount: 1,
            category: tx.ai_category,
            lastTransaction: new Date(tx.transaction_date),
          });
        }
      });

      return Array.from(locationMap.values());
    },
    enabled: !!cardId,
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GlobalTransactionLocation {
  id: string;
  merchant: string;
  lat: number;
  lon: number;
  city: string | null;
  country: string;
  totalSpent: number;
  transactionCount: number;
  category: string | null;
  lastTransaction: Date;
}

// International demo locations for impressive globe visualization
export const DEMO_GLOBAL_LOCATIONS: GlobalTransactionLocation[] = [
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

export function useGlobalTransactionLocations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['global-transaction-locations', user?.id],
    queryFn: async (): Promise<GlobalTransactionLocation[]> => {
      if (!user?.id) {
        // Return demo data for unauthenticated users
        return DEMO_GLOBAL_LOCATIONS;
      }

      // Try to fetch real transaction data with locations
      const { data: transactions, error } = await supabase
        .from('card_transactions')
        .select('*')
        .eq('user_id', user.id)
        .not('merchant_lat', 'is', null)
        .not('merchant_lon', 'is', null);

      if (error) {
        console.error('Error fetching transaction locations:', error);
        return DEMO_GLOBAL_LOCATIONS;
      }

      if (!transactions || transactions.length === 0) {
        return DEMO_GLOBAL_LOCATIONS;
      }

      // Group transactions by merchant location
      const locationMap = new Map<string, GlobalTransactionLocation>();

      transactions.forEach((tx) => {
        const key = `${tx.merchant_lat}-${tx.merchant_lon}`;
        const existing = locationMap.get(key);
        const txAmount = tx.amount_cents ? tx.amount_cents / 100 : 0;

        if (existing) {
          existing.totalSpent += Math.abs(txAmount);
          existing.transactionCount += 1;
          if (new Date(tx.transaction_date) > existing.lastTransaction) {
            existing.lastTransaction = new Date(tx.transaction_date);
          }
        } else {
          locationMap.set(key, {
            id: tx.id,
            merchant: tx.merchant_name || tx.ai_merchant_name || 'Unknown',
            lat: tx.merchant_lat!,
            lon: tx.merchant_lon!,
            city: tx.merchant_city || null,
            country: tx.merchant_country || 'Unknown',
            totalSpent: Math.abs(txAmount),
            transactionCount: 1,
            category: tx.ai_category || null,
            lastTransaction: new Date(tx.transaction_date),
          });
        }
      });

      const locations = Array.from(locationMap.values());
      
      // If no real locations, return demo data
      return locations.length > 0 ? locations : DEMO_GLOBAL_LOCATIONS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logConnectionSevered } from '@/lib/security-logger';

export interface ConnectedIntegration {
  id: string;
  name: string;
  provider: 'plaid' | 'bookkeeping' | 'other';
  icon: string;
  permissions: string[];
  connectedAt: string;
  lastAccess: string;
  status: string;
  aiWarning?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

// Map provider names to icons
const providerIcons: Record<string, string> = {
  plaid: '🏦',
  quickbooks: '📊',
  xero: '📗',
  stripe: '💳',
  default: '🔗',
};

// Map Plaid scopes to readable permissions
const plaidPermissions = [
  'read_transactions',
  'view_balance',
  'account_info',
  'identity_verification',
];

// Map bookkeeping scopes to permissions
function parseBookkeepingScopes(scopes: string[] | null): string[] {
  if (!scopes || scopes.length === 0) {
    return ['basic_access'];
  }
  return scopes.map(scope => scope.replace(/_/g, ' '));
}

export function useConnectedIntegrations() {
  return useQuery({
    queryKey: ['connected-integrations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const integrations: ConnectedIntegration[] = [];

      // Fetch Plaid items
      const { data: plaidItems } = await supabase
        .from('plaid_items')
        .select('*')
        .eq('user_id', session.user.id);

      if (plaidItems) {
        plaidItems.forEach((item: any) => {
          integrations.push({
            id: item.id,
            name: item.institution_name || 'Bank Connection',
            provider: 'plaid',
            icon: providerIcons.plaid,
            permissions: plaidPermissions,
            connectedAt: item.created_at,
            lastAccess: item.last_synced_at || item.created_at,
            status: item.status || 'active',
          });
        });
      }

      // Fetch bookkeeping integrations
      const { data: bookkeepingItems } = await supabase
        .from('bookkeeping_integrations')
        .select('*')
        .eq('user_id', session.user.id);

      if (bookkeepingItems) {
        bookkeepingItems.forEach((item: any) => {
          integrations.push({
            id: item.id,
            name: item.provider === 'quickbooks' ? 'QuickBooks' : 
                  item.provider === 'xero' ? 'Xero' : item.provider,
            provider: 'bookkeeping',
            icon: providerIcons[item.provider] || providerIcons.default,
            permissions: parseBookkeepingScopes(item.scopes),
            connectedAt: item.created_at,
            lastAccess: item.last_sync_at || item.created_at,
            status: item.sync_status || 'active',
          });
        });
      }

      return integrations;
    },
    staleTime: 60_000, // 1 minute
  });
}

export function useSeverIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, provider, name }: { id: string; provider: string; name?: string }) => {
      if (provider === 'plaid') {
        const { error } = await supabase
          .from('plaid_items')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else if (provider === 'bookkeeping') {
        const { error } = await supabase
          .from('bookkeeping_integrations')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      return { id, name };
    },
    onSuccess: ({ name }) => {
      queryClient.invalidateQueries({ queryKey: ['connected-integrations'] });
      if (name) logConnectionSevered(name);
    },
  });
}

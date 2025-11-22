import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Shield, RefreshCw, Unlink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatDistanceToNow } from 'date-fns';

interface PlaidItem {
  id: string;
  institution_name: string | null;
  item_id: string;
  access_token: string;
  created_at: string | null;
  updated_at: string | null;
  institution_id: string | null;
  institution_logo: string | null;
  status: string | null;
  user_id: string;
  error_code: string | null;
  consent_expiration_time: string | null;
  webhook_url: string | null;
  update_type: string | null;
}

interface PermissionSummary {
  summary: string;
  risk_level: 'high' | 'standard' | 'limited';
  concerns: string[];
  permissions: string[];
}

export function ConnectedAppsPrivacy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setConnectedApps } = useSettingsStore();
  const [summaries, setSummaries] = useState<Record<string, PermissionSummary>>({});

  const { data: plaidItems, isLoading } = useQuery({
    queryKey: ['plaid-items'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('plaid_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlaidItem[];
    },
  });

  // Fetch permission summaries for each connected app
  useEffect(() => {
    if (!plaidItems || plaidItems.length === 0) return;

    const fetchSummaries = async () => {
      for (const item of plaidItems) {
        try {
          const { data, error } = await supabase.functions.invoke('summarize-app-permissions', {
            body: { appId: item.id },
          });

          if (error) throw error;
          if (data) {
            setSummaries(prev => ({ ...prev, [item.id]: data }));
          }
        } catch (error) {
          console.error(`Failed to fetch summary for ${item.institution_name}:`, error);
        }
      }
    };

    fetchSummaries();
  }, [plaidItems]);

  // Update Zustand store with connected apps
  useEffect(() => {
    if (!plaidItems) return;
    
    const apps = plaidItems.map(item => ({
      id: item.id,
      name: item.institution_name || 'Unknown Bank',
      provider: 'Plaid',
      connected_at: item.created_at || new Date().toISOString(),
      last_synced: item.updated_at || item.created_at || new Date().toISOString(),
      permissions: summaries[item.id]?.permissions || [],
      privacy_summary: summaries[item.id]?.summary,
      risk_level: summaries[item.id]?.risk_level,
    }));

    setConnectedApps(apps);
  }, [plaidItems, summaries, setConnectedApps]);

  const disconnectMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('plaid_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plaid-items'] });
      toast({
        title: 'App disconnected',
        description: 'Your bank account has been disconnected successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Disconnection failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect app',
        variant: 'destructive',
      });
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // Trigger Plaid sync via edge function
      const { error } = await supabase.functions.invoke('plaid-sync-transactions', {
        body: { itemId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plaid-items'] });
      toast({
        title: 'Sync started',
        description: 'Refreshing your transaction data...',
      });
    },
    onError: (error) => {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync data',
        variant: 'destructive',
      });
    },
  });

  const getRiskBadge = (risk: 'high' | 'standard' | 'limited') => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />High Access</Badge>;
      case 'standard':
        return <Badge variant="outline" className="gap-1 border-warning text-warning"><Shield className="w-3 h-3" />Standard</Badge>;
      case 'limited':
        return <Badge variant="outline" className="gap-1 border-success text-success"><CheckCircle className="w-3 h-3" />Limited</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Apps & Permissions</CardTitle>
          <CardDescription>Manage your connected accounts and their access levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Apps & Permissions</CardTitle>
        <CardDescription>
          AI-powered privacy analysis of your connected accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plaidItems && plaidItems.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No connected accounts yet</p>
            <Button variant="outline" className="mt-4">
              + Connect New Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {plaidItems?.map((item, index) => {
              const summary = summaries[item.id];
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.institution_name || 'Unknown Bank'}</h3>
                        {summary && getRiskBadge(summary.risk_level)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">via Plaid</p>
                    </div>
                  </div>

                  {summary ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {summary.summary}
                      </p>
                      
                      {summary.concerns.length > 0 && (
                        <div className="bg-warning/10 border border-warning/20 rounded p-2">
                          <p className="text-xs font-medium text-warning mb-1">Privacy Concerns:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {summary.concerns.map((concern, i) => (
                              <li key={i}>• {concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analyzing permissions...
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Connected: {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : 'Unknown'}</p>
                      {item.updated_at && (
                        <p>Last synced: {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshMutation.mutate(item.id)}
                        disabled={refreshMutation.isPending}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Sync
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectMutation.mutate(item.id)}
                        disabled={disconnectMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Unlink className="w-3 h-3 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <Button variant="outline" className="w-full">
              + Connect New Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

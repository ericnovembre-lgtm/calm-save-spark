import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Link2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function OpenBankingSetup() {
  const { data: integrations, refetch } = useQuery({
    queryKey: ['open-banking-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('integration_type', 'open_banking')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const syncData = async (integrationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('sync-open-banking', {
        body: { integrationId }
      });

      if (error) throw error;

      toast.success("Open Banking data synced successfully");
      refetch();
    } catch (error: any) {
      toast.error(`Failed to sync: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Open Banking API</h3>
              <p className="text-sm text-muted-foreground">
                Connect directly to your bank for real-time data
              </p>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm">
              Open Banking allows secure, direct access to your financial institutions. 
              Sync accounts, transactions, and balances in real-time.
            </p>
          </div>
        </div>
      </Card>

      {integrations && integrations.length > 0 ? (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Connected Banks</h4>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{integration.provider_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {integration.last_synced 
                        ? `Last synced: ${new Date(integration.last_synced).toLocaleString()}`
                        : 'Never synced'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                    {integration.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => syncData(integration.id)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-4">No Open Banking connections yet</p>
            <Button>
              <Link2 className="w-4 h-4 mr-2" />
              Connect Bank
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
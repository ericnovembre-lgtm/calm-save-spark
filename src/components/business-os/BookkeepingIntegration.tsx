import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, CheckCircle, XCircle, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PROVIDERS = [
  { id: "quickbooks", name: "QuickBooks Online", logo: "📊" },
  { id: "xero", name: "Xero", logo: "📈" },
  { id: "wave", name: "Wave Accounting", logo: "🌊" },
];

export function BookkeepingIntegration() {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState<string | null>(null);

  const { data: integrations } = useQuery({
    queryKey: ["bookkeeping-integrations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bookkeeping_integrations" as any)
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const connectProvider = useMutation({
    mutationFn: async (provider: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // In production, this would redirect to OAuth flow
      const { data, error } = await supabase
        .from("bookkeeping_integrations" as any)
        .insert({
          user_id: user.id,
          provider,
          sync_status: "active",
          sync_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, provider) => {
      queryClient.invalidateQueries({ queryKey: ["bookkeeping-integrations"] });
      toast.success(`Connected to ${provider}!`);
      setConnecting(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to connect: ${error.message}`);
      setConnecting(null);
    },
  });

  const disconnectProvider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookkeeping_integrations" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookkeeping-integrations"] });
      toast.success("Disconnected successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });

  const syncNow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookkeeping_integrations" as any)
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookkeeping-integrations"] });
      toast.success("Sync initiated");
    },
  });

  const isConnected = (providerId: string) => {
    return integrations?.some((i: any) => i.provider === providerId && i.sync_status === "active");
  };

  const getIntegration = (providerId: string) => {
    return integrations?.find((i: any) => i.provider === providerId);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Connect your bookkeeping software to automatically sync income, expenses, and generate accurate tax projections.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {PROVIDERS.map((provider) => {
          const integration = getIntegration(provider.id);
          const connected = isConnected(provider.id);

          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{provider.logo}</span>
                    <div>
                      <CardTitle>{provider.name}</CardTitle>
                      <CardDescription>
                        {connected ? "Connected and syncing" : "Not connected"}
                      </CardDescription>
                    </div>
                  </div>
                  {connected ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Available</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {connected && integration ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">
                          {integration.last_sync_at
                            ? new Date(integration.last_sync_at).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sync Frequency</p>
                        <p className="font-medium capitalize">{integration.sync_frequency}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncNow.mutate(integration.id)}
                        disabled={syncNow.isPending}
                      >
                        Sync Now
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => disconnectProvider.mutate(integration.id)}
                        disabled={disconnectProvider.isPending}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setConnecting(provider.id);
                      connectProvider.mutate(provider.id);
                    }}
                    disabled={connecting === provider.id}
                    className="w-full"
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {connecting === provider.id ? "Connecting..." : `Connect ${provider.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

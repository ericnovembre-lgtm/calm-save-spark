import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Key, Copy, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function APIKeyManagement({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    key_name: "",
    expires_in_days: "365",
  });
  const [newKey, setNewKey] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_api_keys')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const generateKey = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase.functions.invoke('generate-api-key', {
        body: {
          organization_id: organizationId,
          key_name: data.key_name,
          expires_in_days: parseInt(data.expires_in_days),
        },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', organizationId] });
      setNewKey(data.api_key_display);
      toast.success("API key generated successfully");
      setFormData({ key_name: "", expires_in_days: "365" });
    },
    onError: (error: any) => {
      toast.error(`Failed to generate API key: ${error.message}`);
    },
  });

  const deleteKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('organization_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', organizationId] });
      toast.success("API key deleted");
    },
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Generate API keys to integrate $ave+ into your applications
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              generateKey.mutate(formData);
            }} className="space-y-4">
              <div>
                <Label htmlFor="key_name">Key Name *</Label>
                <Input
                  id="key_name"
                  value={formData.key_name}
                  onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                  placeholder="Production API Key"
                  required
                />
              </div>

              <div>
                <Label htmlFor="expires_in_days">Expires In (days)</Label>
                <Input
                  id="expires_in_days"
                  type="number"
                  value={formData.expires_in_days}
                  onChange={(e) => setFormData({ ...formData, expires_in_days: e.target.value })}
                  min="1"
                  max="3650"
                />
              </div>

              <Button type="submit" disabled={generateKey.isPending}>
                {generateKey.isPending ? "Generating..." : "Generate Key"}
              </Button>
            </form>

            {newKey && (
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <p className="text-sm font-semibold mb-2">Your new API key (save it now):</p>
                <div className="flex gap-2">
                  <Input value={newKey} readOnly className="font-mono text-xs" />
                  <Button size="icon" variant="outline" onClick={() => copyKey(newKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This key will not be shown again. Store it securely.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading API keys...</p>
          </Card>
        ) : apiKeys?.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No API keys yet. Generate your first key to get started.</p>
          </Card>
        ) : (
          apiKeys?.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{key.key_name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {key.api_key.substring(0, 20)}...{key.api_key.substring(key.api_key.length - 4)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {key.expires_at && (
                        <Badge variant="outline">
                          Expires: {format(new Date(key.expires_at), 'MMM d, yyyy')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteKey.mutate(key.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

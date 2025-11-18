import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, RefreshCw, Trash2, Calendar, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecurringBudgetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecurringBudgetManager({ isOpen, onClose }: RecurringBudgetManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch recurring configs
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['recurring_budget_configs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('recurring_budget_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('next_creation_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isOpen,
  });

  // Fetch templates for dropdown
  const { data: templates = [] } = useQuery({
    queryKey: ['budget_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  // Create recurring config
  const createConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('recurring_budget_configs')
        .insert([{ ...configData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_budget_configs'] });
      toast.success('Recurring budget created!');
      setShowCreateForm(false);
    },
    onError: (error) => {
      console.error('Error creating recurring config:', error);
      toast.error('Failed to create recurring budget');
    }
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('recurring_budget_configs')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_budget_configs'] });
      toast.success('Recurring budget updated');
    },
  });

  // Delete config
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_budget_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_budget_configs'] });
      toast.success('Recurring budget deleted');
    },
  });

  const handleCreateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedTemplate = templates.find(t => t.id === formData.get('template_id'));
    
    createConfigMutation.mutate({
      template_id: formData.get('template_id') || null,
      frequency: formData.get('frequency'),
      budget_name_template: formData.get('budget_name_template'),
      total_limit: parseFloat(formData.get('total_limit') as string),
      currency: formData.get('currency'),
      category_limits: selectedTemplate?.category_percentages || {},
      next_creation_date: formData.get('next_creation_date'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Recurring Budget Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Recurring Budget
            </Button>
          )}

          {showCreateForm && (
            <Card className="p-4">
              <form onSubmit={handleCreateConfig} className="space-y-4">
                <div>
                  <Label htmlFor="budget_name_template">Budget Name Template</Label>
                  <Input
                    id="budget_name_template"
                    name="budget_name_template"
                    placeholder="e.g., Monthly Budget {month} {year}"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{month}'} and {'{year}'} as placeholders
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select name="frequency" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="next_creation_date">Next Creation Date</Label>
                    <Input
                      id="next_creation_date"
                      name="next_creation_date"
                      type="date"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_limit">Total Budget Limit</Label>
                    <Input
                      id="total_limit"
                      name="total_limit"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="template_id">Base Template (Optional)</Label>
                  <Select name="template_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createConfigMutation.isPending}>
                    {createConfigMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {configs.map((config) => (
                <Card key={config.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{config.budget_name_template}</h3>
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={() => toggleActiveMutation.mutate({ id: config.id, isActive: config.is_active })}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Frequency: {config.frequency}</p>
                        <p>Limit: {config.currency} {config.total_limit}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next creation: {new Date(config.next_creation_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteConfigMutation.mutate(config.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {configs.length === 0 && !isLoading && (
                <Card className="p-8 text-center">
                  <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recurring budgets configured</p>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

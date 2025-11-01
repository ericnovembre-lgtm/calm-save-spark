import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Zap, Power, PowerOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

const Automations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    rule_type: "round_up",
    percentage: "10",
    amount: "50"
  });

  const { data: rules, isLoading } = useQuery({
    queryKey: ['automation_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: typeof newRule) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const actionConfig = rule.rule_type === 'percentage_save' 
        ? { percentage: parseFloat(rule.percentage) }
        : { amount: parseFloat(rule.amount) };

      const { error } = await supabase
        .from('automation_rules')
        .insert([{
          user_id: user.id,
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          action_config: actionConfig
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation_rules'] });
      toast({ title: "Automation rule created!" });
      setIsDialogOpen(false);
      setNewRule({ rule_name: "", rule_type: "round_up", percentage: "10", amount: "50" });
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation_rules'] });
      toast({ title: "Rule status updated" });
    }
  });

  const handleCreateRule = () => {
    if (!newRule.rule_name) {
      toast({ title: "Please enter a rule name", variant: "destructive" });
      return;
    }
    createRuleMutation.mutate(newRule);
  };

  const getRuleDescription = (rule: any) => {
    switch (rule.rule_type) {
      case 'round_up':
        return 'Rounds up transactions to nearest dollar';
      case 'percentage_save':
        return `Saves ${rule.action_config?.percentage || 10}% of each transaction`;
      case 'scheduled_transfer':
        return `Transfers $${rule.action_config?.amount || 0} on schedule`;
      default:
        return 'Automated savings rule';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Automation Rules</h1>
            <p className="text-muted-foreground">Set up automatic savings rules</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
                <DialogDescription>
                  Automate your savings with smart rules
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="Round Up Savings"
                    value={newRule.rule_name}
                    onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rule-type">Rule Type</Label>
                  <Select 
                    value={newRule.rule_type} 
                    onValueChange={(value) => setNewRule({ ...newRule, rule_type: value })}
                  >
                    <SelectTrigger id="rule-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_up">Round Up</SelectItem>
                      <SelectItem value="percentage_save">Percentage Save</SelectItem>
                      <SelectItem value="scheduled_transfer">Scheduled Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newRule.rule_type === 'percentage_save' && (
                  <div>
                    <Label htmlFor="percentage">Percentage (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      value={newRule.percentage}
                      onChange={(e) => setNewRule({ ...newRule, percentage: e.target.value })}
                    />
                  </div>
                )}
                
                {newRule.rule_type === 'scheduled_transfer' && (
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newRule.amount}
                      onChange={(e) => setNewRule({ ...newRule, amount: e.target.value })}
                    />
                  </div>
                )}
                
                <Button onClick={handleCreateRule} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading rules...</div>
        ) : rules && rules.length > 0 ? (
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <Zap className={`w-5 h-5 ${rule.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <CardTitle>{rule.rule_name}</CardTitle>
                      <CardDescription>{getRuleDescription(rule)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRuleMutation.mutate({ id: rule.id, isActive: rule.is_active })}
                    />
                    {rule.is_active ? (
                      <Power className="w-4 h-4 text-primary" />
                    ) : (
                      <PowerOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Automation Rules</h3>
              <p className="text-muted-foreground mb-6">
                Create your first automation rule to save effortlessly
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Automations;
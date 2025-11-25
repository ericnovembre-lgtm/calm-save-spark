import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpendRules } from '@/hooks/useSpendRules';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Percent, DollarSign, ArrowUpCircle, Trash2, Pause, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface SpendRulesEngineProps {
  cardId: string;
}

export function SpendRulesEngine({ cardId }: SpendRulesEngineProps) {
  const { rules, createRule, deleteRule, toggleRule, isCreating } = useSpendRules(cardId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch goals
  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('goals').select('*').eq('user_id', user.id);
      return data || [];
    }
  });

  // Fetch pots
  const { data: pots = [] } = useQuery({
    queryKey: ['pots'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('pots').select('*').eq('user_id', user.id);
      return data || [];
    }
  });

  const [ruleType, setRuleType] = useState<'percentage' | 'flat_amount' | 'round_up'>('percentage');
  const [ruleName, setRuleName] = useState('');
  const [ruleValue, setRuleValue] = useState('');
  const [destinationType, setDestinationType] = useState<'goal' | 'pot'>('goal');
  const [destinationId, setDestinationId] = useState('');

  const handleCreateRule = async () => {
    if (!ruleName || !ruleValue || !destinationId) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await createRule({
      user_id: user.id,
      card_id: cardId,
      rule_name: ruleName,
      rule_type: ruleType,
      rule_value: parseFloat(ruleValue),
      destination_goal_id: destinationType === 'goal' ? destinationId : null,
      destination_pot_id: destinationType === 'pot' ? destinationId : null,
      is_active: true,
    });

    setRuleName('');
    setRuleValue('');
    setDestinationId('');
    setIsDialogOpen(false);
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'flat_amount':
        return <DollarSign className="w-4 h-4" />;
      case 'round_up':
        return <ArrowUpCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatRuleValue = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}% per transaction`;
      case 'flat_amount':
        return `$${value.toFixed(2)} per transaction`;
      case 'round_up':
        return 'Round up to nearest dollar';
      default:
        return `$${value.toFixed(2)}`;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Save-While-You-Spend Rules</h3>
          <p className="text-sm text-muted-foreground mt-1">Automatically save with every purchase</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Savings Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  placeholder="e.g., Coffee Round-Up"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select value={ruleType} onValueChange={(v: any) => setRuleType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="flat_amount">Flat Amount</SelectItem>
                    <SelectItem value="round_up">Round Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ruleType !== 'round_up' && (
                <div className="space-y-2">
                  <Label>
                    {ruleType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                  </Label>
                  <Input
                    type="number"
                    step={ruleType === 'percentage' ? '0.1' : '0.01'}
                    placeholder={ruleType === 'percentage' ? '5' : '1.00'}
                    value={ruleValue}
                    onChange={(e) => setRuleValue(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Save To</Label>
                <Select value={destinationType} onValueChange={(v: any) => setDestinationType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goal">Goal</SelectItem>
                    <SelectItem value="pot">Pot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destination</Label>
                <Select value={destinationId} onValueChange={setDestinationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationType === 'goal' ? (
                      goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.name}
                        </SelectItem>
                      ))
                    ) : (
                      pots.map((pot) => (
                        <SelectItem key={pot.id} value={pot.id}>
                          {pot.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleCreateRule}
                disabled={isCreating || !ruleName || (!ruleValue && ruleType !== 'round_up') || !destinationId}
              >
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No active rules yet</p>
          <p className="text-sm mt-1">Create your first rule to start saving automatically</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-4 ${!rule.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getRuleIcon(rule.rule_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{rule.rule_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatRuleValue(rule.rule_type, rule.rule_value)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Saved: ${rule.total_saved.toFixed(2)} • Triggered {rule.times_triggered}x
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRule(rule.id, !rule.is_active)}
                    >
                      {rule.is_active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MandateConfigProps {
  existingMandate?: any;
}

export function MandateConfig({ existingMandate }: MandateConfigProps) {
  const queryClient = useQueryClient();
  const [riskTolerance, setRiskTolerance] = useState(existingMandate?.risk_tolerance || 'moderate');
  const [rebalancingThreshold, setRebalancingThreshold] = useState(existingMandate?.rebalancing_threshold || 5);
  const [autoRebalance, setAutoRebalance] = useState(existingMandate?.auto_rebalance_enabled ?? false);
  const [tlhEnabled, setTlhEnabled] = useState(existingMandate?.tax_loss_harvest_enabled ?? true);
  const [minHarvestAmount, setMinHarvestAmount] = useState(existingMandate?.min_harvest_amount || 100);

  const saveMandate = useMutation({
    mutationFn: async () => {
      const mandateData = {
        target_allocation: { stocks: 60, bonds: 30, cash: 10 }, // Default allocation
        risk_tolerance: riskTolerance,
        rebalancing_threshold: rebalancingThreshold,
        tax_loss_harvest_enabled: tlhEnabled,
        min_harvest_amount: minHarvestAmount,
        auto_rebalance_enabled: autoRebalance,
      };

      const { error } = await supabase
        .from('investment_mandates')
        .upsert(mandateData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-mandate'] });
      toast.success('Investment mandate saved successfully');
    },
    onError: () => {
      toast.error('Failed to save investment mandate');
    },
  });

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Investment Mandate Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure how the autonomous investment manager should handle your portfolio
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label>Risk Tolerance</Label>
          <Select value={riskTolerance} onValueChange={setRiskTolerance}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Determines asset allocation and investment strategy
          </p>
        </div>

        <div>
          <Label>Rebalancing Threshold: {rebalancingThreshold}%</Label>
          <Slider
            value={[rebalancingThreshold]}
            onValueChange={([value]) => setRebalancingThreshold(value)}
            min={1}
            max={15}
            step={0.5}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Portfolio will rebalance when allocation drifts beyond this threshold
          </p>
        </div>

        <div>
          <Label>Minimum Tax-Loss Harvest Amount: ${minHarvestAmount}</Label>
          <Slider
            value={[minHarvestAmount]}
            onValueChange={([value]) => setMinHarvestAmount(value)}
            min={50}
            max={1000}
            step={50}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Only harvest losses above this threshold to avoid excessive trading
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <Label>Automatic Rebalancing</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Allow agent to automatically execute rebalancing trades
            </p>
          </div>
          <Switch checked={autoRebalance} onCheckedChange={setAutoRebalance} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <Label>Tax-Loss Harvesting</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically harvest losses for tax optimization
            </p>
          </div>
          <Switch checked={tlhEnabled} onCheckedChange={setTlhEnabled} />
        </div>
      </div>

      <Button 
        onClick={() => saveMandate.mutate()} 
        disabled={saveMandate.isPending}
        className="w-full"
      >
        {saveMandate.isPending ? 'Saving...' : 'Save Configuration'}
      </Button>
    </Card>
  );
}

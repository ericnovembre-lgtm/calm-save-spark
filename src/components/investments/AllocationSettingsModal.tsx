import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface AllocationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentAllocation: Record<string, number>;
}

const ASSET_CLASSES = [
  { key: 'brokerage', label: 'Stocks/Brokerage', color: 'bg-blue-500' },
  { key: 'bond', label: 'Bonds/Fixed Income', color: 'bg-green-500' },
  { key: 'crypto', label: 'Cryptocurrency', color: 'bg-orange-500' },
  { key: 'cash', label: 'Cash/Savings', color: 'bg-gray-500' },
];

export function AllocationSettingsModal({
  open,
  onOpenChange,
  userId,
  currentAllocation,
}: AllocationSettingsModalProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>({
    brokerage: 60,
    bond: 30,
    crypto: 0,
    cash: 10,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current target allocation from preferences
    const loadPreferences = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('portfolio_allocation_target')
        .eq('user_id', userId)
        .single();

      if (data?.portfolio_allocation_target) {
        const target = data.portfolio_allocation_target as Record<string, number>;
        setAllocations(target);
      }
    };

    if (open) {
      loadPreferences();
    }
  }, [userId, open]);

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const isValid = Math.abs(totalAllocation - 100) < 0.01;

  const handleSliderChange = (key: string, value: number[]) => {
    setAllocations(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSave = async () => {
    if (!isValid) {
      toast.error('Total allocation must equal 100%');
      return;
    }

    setIsSaving(true);
    try {
      // Normalize to ensure exact 100%
      const normalized = { ...allocations };
      const diff = 100 - totalAllocation;
      normalized.brokerage += diff;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          portfolio_allocation_target: normalized,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Target allocation saved successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving allocation:', error);
      toast.error('Failed to save target allocation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Portfolio Target Allocation
          </DialogTitle>
          <DialogDescription>
            Set your desired asset allocation percentages. The system will alert you when your portfolio drifts more than 5% from these targets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current vs Target Comparison */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Current Portfolio Allocation</p>
            <div className="flex gap-2 h-8">
              {ASSET_CLASSES.map(asset => {
                const current = currentAllocation[asset.key] || 0;
                return (
                  <div
                    key={asset.key}
                    className={`${asset.color} flex items-center justify-center text-white text-xs font-mono transition-all`}
                    style={{ width: `${current}%` }}
                    title={`${asset.label}: ${current.toFixed(1)}%`}
                  >
                    {current >= 10 && `${current.toFixed(0)}%`}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Allocation Sliders */}
          <div className="space-y-4">
            {ASSET_CLASSES.map(asset => (
              <div key={asset.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={asset.key} className="text-sm font-medium">
                    {asset.label}
                  </Label>
                  <span className="text-sm font-mono tabular-nums">
                    {allocations[asset.key].toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    id={asset.key}
                    min={0}
                    max={100}
                    step={0.5}
                    value={[allocations[asset.key]]}
                    onValueChange={(value) => handleSliderChange(asset.key, value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={allocations[asset.key]}
                    onChange={(e) => setAllocations(prev => ({ ...prev, [asset.key]: parseFloat(e.target.value) || 0 }))}
                    className="w-20 text-right"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total Validation */}
          <div className={`p-4 rounded-lg border ${isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Allocation:</span>
              <span className={`text-lg font-mono tabular-nums font-bold ${isValid ? 'text-green-500' : 'text-red-500'}`}>
                {totalAllocation.toFixed(1)}%
              </span>
            </div>
            {!isValid && (
              <p className="text-xs text-red-500 mt-1">
                Total must equal 100%. Current difference: {(totalAllocation - 100).toFixed(1)}%
              </p>
            )}
          </div>

          {/* Preview Target Allocation Bar */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Target Allocation Preview</p>
            <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
              {ASSET_CLASSES.map(asset => (
                <motion.div
                  key={asset.key}
                  className={`${asset.color} flex items-center justify-center text-white text-xs font-mono`}
                  initial={{ width: 0 }}
                  animate={{ width: `${allocations[asset.key]}%` }}
                  transition={{ duration: 0.3 }}
                  title={`${asset.label}: ${allocations[asset.key].toFixed(1)}%`}
                >
                  {allocations[asset.key] >= 10 && `${allocations[asset.key].toFixed(0)}%`}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Target Allocation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
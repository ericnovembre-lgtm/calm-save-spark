import { useState } from 'react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Blocks, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { haptics } from '@/lib/haptics';
import { useAutomationSounds } from '@/hooks/useAutomationSounds';

interface Block {
  id: string;
  type: string;
  category: 'trigger' | 'condition' | 'action';
  label: string;
}

interface LogicBlockBuilderMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const BLOCK_TEMPLATES: Block[] = [
  { id: 'trigger-1', type: 'transaction_detected', category: 'trigger', label: 'When Transaction Detected' },
  { id: 'trigger-2', type: 'date_reached', category: 'trigger', label: 'When Date Reached' },
  { id: 'condition-1', type: 'amount_above', category: 'condition', label: 'Amount Above $X' },
  { id: 'condition-2', type: 'category_matches', category: 'condition', label: 'Category Matches' },
  { id: 'action-1', type: 'transfer', category: 'action', label: 'Transfer to Savings' },
  { id: 'action-2', type: 'notify', category: 'action', label: 'Send Notification' },
];

export function LogicBlockBuilderMobile({ open, onOpenChange, onSave }: LogicBlockBuilderMobileProps) {
  const [ruleName, setRuleName] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<Block[]>([]);
  const [step, setStep] = useState<'trigger' | 'condition' | 'action'>('trigger');
  const { toast } = useToast();
  const sounds = useAutomationSounds();

  const handleSelectBlock = (block: Block) => {
    haptics.select();
    sounds.playBlockConnected();
    
    setSelectedBlocks(prev => [...prev, { ...block, id: `${block.id}-${Date.now()}` }]);
    
    // Auto-progress to next step
    if (block.category === 'trigger') {
      setStep('condition');
    } else if (block.category === 'condition') {
      setStep('action');
    }
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      toast({ title: 'Error', description: 'Please enter a rule name', variant: 'destructive' });
      return;
    }

    if (selectedBlocks.length < 2) {
      toast({ title: 'Error', description: 'Add at least a trigger and action', variant: 'destructive' });
      return;
    }

    try {
      haptics.formSuccess();
      sounds.playRecipeActivated();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('automation_rules').insert([{
        user_id: user.id,
        rule_name: ruleName,
        rule_type: 'advanced_logic_mobile',
        is_active: true,
        metadata: {
          blocks: selectedBlocks as any,
          created_on_mobile: true,
        },
      }]);

      toast({ title: 'Success', description: 'Automation rule created!' });
      onSave();
      onOpenChange(false);
      
      // Reset
      setRuleName('');
      setSelectedBlocks([]);
      setStep('trigger');
    } catch (error) {
      haptics.validationError();
      toast({ title: 'Error', description: 'Failed to save rule', variant: 'destructive' });
    }
  };

  const availableBlocks = BLOCK_TEMPLATES.filter(b => b.category === step);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-background rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Blocks className="w-6 h-6 text-circuit-accent" />
                <Drawer.Title className="text-lg font-semibold">
                  Build Automation Rule
                </Drawer.Title>
              </div>

              {/* Rule Name */}
              <div className="mb-6">
                <Input
                  placeholder="Enter rule name..."
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className={`flex-1 h-1 rounded ${step === 'trigger' ? 'bg-circuit-accent' : 'bg-muted'}`} />
                <div className={`flex-1 h-1 rounded mx-2 ${step === 'condition' ? 'bg-circuit-accent' : 'bg-muted'}`} />
                <div className={`flex-1 h-1 rounded ${step === 'action' ? 'bg-circuit-accent' : 'bg-muted'}`} />
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {step === 'trigger' && 'Select a trigger to start'}
                {step === 'condition' && 'Add conditions (optional)'}
                {step === 'action' && 'Choose what action to take'}
              </p>

              {/* Selected Blocks Preview */}
              {selectedBlocks.length > 0 && (
                <div className="mb-6 space-y-2">
                  {selectedBlocks.map((block, idx) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-circuit-bg/30 border border-circuit-line/20"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{block.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Block Selection */}
              <div className="space-y-3">
                {availableBlocks.map((block) => (
                  <Button
                    key={block.id}
                    onClick={() => handleSelectBlock(block)}
                    variant="outline"
                    className="w-full justify-start h-auto py-4 border-circuit-line/20 hover:border-circuit-line/40"
                  >
                    <Plus className="w-4 h-4 mr-3 text-circuit-accent" />
                    <span className="font-medium">{block.label}</span>
                  </Button>
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-6 flex gap-3">
                {step !== 'trigger' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (step === 'action') setStep('condition');
                      else if (step === 'condition') setStep('trigger');
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                {step === 'condition' && (
                  <Button
                    onClick={() => setStep('action')}
                    className="flex-1"
                  >
                    Skip Conditions
                  </Button>
                )}
                
                {step === 'action' && (
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-circuit-accent hover:bg-circuit-accent/90"
                  >
                    Save Rule
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

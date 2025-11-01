import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap } from 'lucide-react';
import { useFeatureLimits } from '@/hooks/useFeatureLimits';
import { LimitIndicator } from '@/components/LimitIndicator';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { useToast } from '@/hooks/use-toast';
import { FeatureGate } from '@/components/FeatureGate';

export default function Automations() {
  const { toast } = useToast();
  const { automationRules, canCreate, getUpgradeMessage } = useFeatureLimits();

  const handleCreateRule = () => {
    if (!canCreate('automationRules')) {
      toast({
        title: 'Limit Reached',
        description: getUpgradeMessage('automationRules'),
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Coming Soon',
      description: 'Automation rule creation will be implemented next',
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Automation Rules</h1>
              <p className="text-muted-foreground">
                Set up automatic savings rules and round-ups
              </p>
            </div>
            <FeatureGate 
              feature="has_advanced_automation"
              fallback={
                <Button disabled size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  New Rule
                </Button>
              }
            >
              <Button 
                onClick={handleCreateRule}
                disabled={!canCreate('automationRules')}
                size="lg"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                New Rule
              </Button>
            </FeatureGate>
          </div>

          {/* Limit Indicator */}
          <FeatureGate 
            feature="has_advanced_automation"
            fallback={
              <UpgradePrompt
                feature="Automation Rules"
                message="Upgrade to unlock custom automation rules and advanced savings features"
                suggestedAmount={3}
                compact
              />
            }
          >
            <Card className="bg-accent/20">
              <CardContent className="p-4">
                <LimitIndicator
                  current={automationRules.current}
                  max={automationRules.max}
                  label="Automation Rules"
                  showUpgrade={true}
                />
              </CardContent>
            </Card>
          </FeatureGate>
        </div>

        {/* Content */}
        <FeatureGate 
          feature="has_advanced_automation"
          fallback={
            <UpgradePrompt
              feature="Advanced Automation"
              message="Create custom automation rules to supercharge your savings. Set up recurring transfers, conditional rules, and more."
              suggestedAmount={3}
            />
          }
        >
          <Card className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No automation rules yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create rules to automatically save money based on your spending
                </p>
                <Button onClick={handleCreateRule} disabled={!canCreate('automationRules')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Rule
                </Button>
              </div>
            </div>
          </Card>

          {/* Upgrade Prompt if at limit */}
          {!canCreate('automationRules') && automationRules.max > 0 && (
            <div className="mt-8">
              <UpgradePrompt
                feature="More Automation Rules"
                message={getUpgradeMessage('automationRules')}
                suggestedAmount={automationRules.max < 5 ? 7 : 10}
              />
            </div>
          )}
        </FeatureGate>
      </div>
    </AppLayout>
  );
}

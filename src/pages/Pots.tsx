import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';
import { useFeatureLimits } from '@/hooks/useFeatureLimits';
import { LimitIndicator } from '@/components/LimitIndicator';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { useToast } from '@/hooks/use-toast';

export default function Pots() {
  const { toast } = useToast();
  const { pots, canCreate, getUpgradeMessage } = useFeatureLimits();

  const handleCreatePot = () => {
    if (!canCreate('pots')) {
      toast({
        title: 'Limit Reached',
        description: getUpgradeMessage('pots'),
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Coming Soon',
      description: 'Pot creation will be implemented next',
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Smart Pots</h1>
              <p className="text-muted-foreground">
                Organize your savings into categorized pots
              </p>
            </div>
            <Button 
              onClick={handleCreatePot}
              disabled={!canCreate('pots')}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Pot
            </Button>
          </div>

          {/* Limit Indicator */}
          <Card className="bg-accent/20">
            <CardContent className="p-4">
              <LimitIndicator
                current={pots.current}
                max={pots.max}
                label="Smart Pots"
                showUpgrade={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No pots yet</h3>
              <p className="text-muted-foreground mb-4">
                Create smart pots to organize your savings by category
              </p>
              <Button onClick={handleCreatePot} disabled={!canCreate('pots')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Pot
              </Button>
            </div>
          </div>
        </Card>

        {/* Upgrade Prompt if at limit */}
        {!canCreate('pots') && (
          <div className="mt-8">
            <UpgradePrompt
              feature="More Smart Pots"
              message={getUpgradeMessage('pots')}
              suggestedAmount={pots.max < 10 ? 2 : pots.max < 15 ? 6 : 10}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/stores/settingsStore';

export function SpendingPersona() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { spendingPersona, setSpendingPersona } = useSettingsStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('generate-spending-persona', {});

      if (response.error) throw response.error;

      const { persona } = response.data;
      setSpendingPersona(persona);

      toast({
        title: 'Persona generated',
        description: 'Your financial identity has been updated.',
      });
    } catch (error) {
      console.error('Error generating persona:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate persona. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Auto-generate on first load if not present
    if (!spendingPersona) {
      handleGenerate();
    }
  }, []);

  const getPersonaIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Conservative Saver': '🧘',
      'Growth Investor': '📈',
      'Debt Crusher': '💪',
      'Side Hustler': '🚀',
      'Family Planner': '👨‍👩‍👧‍👦',
    };
    return icons[type] || '💼';
  };

  if (!spendingPersona && !isGenerating) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Your Financial Identity
        </CardTitle>
        <CardDescription>
          AI-generated persona based on your behavior and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing your financial profile...</p>
          </div>
        ) : spendingPersona ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-6 rounded-lg border bg-gradient-to-br from-accent/5 to-accent/10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{getPersonaIcon(spendingPersona.type)}</span>
                <div>
                  <h3 className="text-xl font-semibold">{spendingPersona.type}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {spendingPersona.description}
              </p>
            </div>

            {spendingPersona.optimizations && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Dashboard optimizations:</p>
                <ul className="space-y-1 text-muted-foreground">
                  {spendingPersona.optimizations.show_savings && (
                    <li>• Savings goals (visible)</li>
                  )}
                  {spendingPersona.optimizations.show_investments && (
                    <li>• Investment tracking (highlighted)</li>
                  )}
                  {spendingPersona.optimizations.show_debt && (
                    <li>• Debt management (priority)</li>
                  )}
                  {!spendingPersona.optimizations.show_crypto && (
                    <li>• Crypto & alternatives (hidden)</li>
                  )}
                </ul>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Persona
            </Button>
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}

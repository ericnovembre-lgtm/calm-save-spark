import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, X } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export function NaturalLanguageNotifications() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { notificationRules, updateNotificationRules } = useSettingsStore();
  const { toast } = useToast();

  const examples = [
    "Only notify me if I'm about to overdraft",
    "Important bills over $200 only",
    "Everything except marketing emails",
  ];

  const handleParse = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('parse-notification-rules', {
        body: { prompt },
      });

      if (response.error) throw response.error;

      const { rules } = response.data;
      updateNotificationRules(rules);

      toast({
        title: 'Notification preferences updated',
        description: 'Your AI-parsed preferences have been applied.',
      });
    } catch (error) {
      console.error('Error parsing notification rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to parse notification preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Tell me how you want to be notified
        </CardTitle>
        <CardDescription>
          Describe your notification preferences in plain English
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="e.g., Only notify me about important bills over $100..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex flex-wrap gap-2">
            {examples.map((example, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={handleParse} disabled={isLoading || !prompt.trim()}>
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? 'Parsing...' : 'Parse & Apply'}
        </Button>

        {Object.keys(notificationRules).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 p-4 border rounded-lg bg-muted/50"
          >
            <p className="text-sm font-medium">Parsed Rules:</p>
            <div className="space-y-1 text-sm">
              <RuleItem label="Overdraft alerts" enabled={notificationRules.notify_overdraft} />
              <RuleItem 
                label="Bill threshold" 
                enabled={notificationRules.bill_threshold > 0}
                value={notificationRules.bill_threshold > 0 ? `$${notificationRules.bill_threshold}+` : undefined}
              />
              <RuleItem label="Marketing emails" enabled={notificationRules.notify_marketing} />
              <RuleItem label="Goal reminders" enabled={notificationRules.notify_goals} />
              <RuleItem label="Achievements" enabled={notificationRules.notify_achievements} />
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function RuleItem({ label, enabled, value }: { label: string; enabled: boolean; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className="text-foreground">
        {label}: {value || (enabled ? 'ON' : 'OFF')}
      </span>
    </div>
  );
}

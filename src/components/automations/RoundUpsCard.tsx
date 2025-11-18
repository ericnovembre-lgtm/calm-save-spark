import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Repeat, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoundUpsCardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  linkedAccount?: {
    name: string;
    last4: string;
  };
  recentSavings?: number;
}

export function RoundUpsCard({ 
  enabled, 
  onToggle, 
  linkedAccount = { name: 'Chase Checking', last4: '4321' },
  recentSavings = 5.82 
}: RoundUpsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Repeat className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Round-ups</CardTitle>
            <CardDescription>
              Automatically save spare change from purchases
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Enable Round-ups</h3>
            <p className="text-sm text-muted-foreground">
              Round up each transaction to the nearest dollar
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            aria-label="Toggle round-ups"
          />
        </div>

        <motion.div 
          className="p-4 rounded-lg bg-muted/50 space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Linked Account:</span>
            <span className="font-medium text-foreground">
              {linkedAccount.name} (...{linkedAccount.last4})
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Last 7 Days:
            </span>
            <span className="font-semibold text-green-600">
              ${recentSavings.toFixed(2)} saved
            </span>
          </div>
        </motion.div>

        {enabled && (
          <motion.p 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            💡 Tip: Round-ups are processed daily and transferred to your default savings goal
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}

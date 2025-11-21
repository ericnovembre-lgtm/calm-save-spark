import { motion } from 'framer-motion';
import { Brain, Check, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  suggestedCategory: string;
  confidence: number;
}

export function CategoryClassifier() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Starbucks Coffee',
      amount: 5.50,
      suggestedCategory: 'Food & Dining',
      confidence: 0.95
    },
    {
      id: '2',
      description: 'Shell Gas Station',
      amount: 45.00,
      suggestedCategory: 'Transportation',
      confidence: 0.92
    }
  ]);

  const [accuracy, setAccuracy] = useState(89);

  const acceptCategory = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setAccuracy(prev => Math.min(prev + 0.5, 99));
    toast.success('Category confirmed - AI learning improved!');
  };

  const rejectCategory = (id: string) => {
    toast.info('Category rejected - AI will learn from this');
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">AI Classifier</h3>
            <p className="text-sm text-muted-foreground">Auto-categorize transactions</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <p className="text-foreground font-medium">All categorized!</p>
          <p className="text-sm text-muted-foreground">No pending classifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-accent/50 border border-border rounded-2xl p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-foreground">{tx.description}</p>
                  <p className="text-2xl font-bold text-primary">${tx.amount.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => acceptCategory(tx.id)}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => rejectCategory(tx.id)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Suggested Category</span>
                  <span className="font-medium text-foreground">{tx.suggestedCategory}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tx.confidence * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {(tx.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

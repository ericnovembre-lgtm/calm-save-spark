import { motion } from 'framer-motion';
import { Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CategoryAnalytics {
  category: string;
  transactionCount: number;
  totalAmount: number;
  avgConfidence: number;
}

interface CategoryOverviewProps {
  categories: CategoryAnalytics[];
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-orange-500',
  'Shopping': 'bg-pink-500',
  'Transportation': 'bg-blue-500',
  'Entertainment': 'bg-purple-500',
  'Bills & Utilities': 'bg-red-500',
  'Health': 'bg-green-500',
  'Travel': 'bg-cyan-500',
  'Income': 'bg-emerald-500',
  'Uncategorized': 'bg-muted',
};

export function CategoryOverview({ categories, onCategorySelect, selectedCategory }: CategoryOverviewProps) {
  const totalTransactions = categories.reduce((sum, c) => sum + c.transactionCount, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => {
        const percentage = totalTransactions > 0 
          ? (category.transactionCount / totalTransactions) * 100 
          : 0;
        const colorClass = categoryColors[category.category] || 'bg-muted';
        const isSelected = selectedCategory === category.category;

        return (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => onCategorySelect?.(category.category)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', colorClass)} />
                    <span className="font-medium text-sm">{category.category}</span>
                  </div>
                  <Tag className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">
                      ${category.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {category.transactionCount} transactions
                    </span>
                  </div>

                  <Progress value={percentage} className="h-1.5" />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% of total</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{(category.avgConfidence * 100).toFixed(0)}% AI confidence</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

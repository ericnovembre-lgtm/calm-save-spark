import { motion } from 'framer-motion';
import { Brain, Target, Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SearchResultCardProps {
  score: number;
  category: string;
  content: string;
  timestamp: number;
}

const categoryIcons: Record<string, any> = {
  goal: Target,
  preference: MessageSquare,
  insight: Lightbulb,
  decision: TrendingUp,
  pattern: Brain,
};

const categoryColors: Record<string, string> = {
  goal: 'bg-primary/10 text-primary',
  preference: 'bg-secondary/10 text-secondary',
  insight: 'bg-accent/10 text-accent',
  decision: 'bg-muted/10 text-muted-foreground',
  pattern: 'bg-primary/10 text-primary',
};

export function SearchResultCard({ score, category, content, timestamp }: SearchResultCardProps) {
  const Icon = categoryIcons[category] || Brain;
  const percentage = Math.round(score * 100);
  const date = new Date(timestamp * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={categoryColors[category] || categoryColors.pattern}>
              <Icon className="h-3 w-3 mr-1" />
              {category}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {percentage}% match
            </span>
          </div>

          <Progress value={percentage} className="h-1" />

          <p className="text-foreground leading-relaxed">{content}</p>

          <time className="text-xs text-muted-foreground block">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Award, Brain } from 'lucide-react';
import { SocialSecurityAnalysis } from '@/hooks/useRetirementPlanner';

interface SocialSecurityOptimizerProps {
  analysis?: SocialSecurityAnalysis;
  isLoading?: boolean;
}

export function SocialSecurityOptimizer({ analysis, isLoading }: SocialSecurityOptimizerProps) {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Calculate your retirement plan to see Social Security optimization</p>
      </Card>
    );
  }

  const claimingAges = [
    { age: 62, benefit: analysis.benefitAt62, lifetimeValue: analysis.lifetimeValueAt62 },
    { age: 67, benefit: analysis.benefitAt67, lifetimeValue: analysis.lifetimeValueAt67 },
    { age: 70, benefit: analysis.benefitAt70, lifetimeValue: analysis.lifetimeValueAt70 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Social Security Optimization</h3>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <Brain className="w-3 h-3 mr-1" />
          AI Analysis
        </Badge>
      </div>

      {/* Claiming Age Comparison */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {claimingAges.map((option, index) => (
          <motion.div
            key={option.age}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`p-4 text-center transition-all ${
                analysis.optimalClaimingAge === option.age
                  ? 'bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 ring-2 ring-primary/20'
                  : 'bg-muted/30'
              }`}
            >
              {analysis.optimalClaimingAge === option.age && (
                <Badge className="mb-2 bg-primary text-primary-foreground">
                  <Award className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              )}
              <p className="text-3xl font-bold">{option.age}</p>
              <p className="text-xs text-muted-foreground mt-1">Claiming Age</p>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">Monthly Benefit</p>
                <p className="text-xl font-semibold text-green-500">
                  ${option.benefit.toLocaleString()}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Lifetime Value</p>
                <p className="text-sm font-medium">
                  ${(option.lifetimeValue / 1000).toFixed(0)}K
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Breakeven Analysis */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Breakeven: 62 vs 67</span>
          </div>
          <p className="text-2xl font-bold">Age {analysis.breakEvenAge62vs67}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Delaying to 67 pays off if you live past this age
          </p>
        </Card>

        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Breakeven: 67 vs 70</span>
          </div>
          <p className="text-2xl font-bold">Age {analysis.breakEvenAge67vs70}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Delaying to 70 pays off if you live past this age
          </p>
        </Card>
      </div>

      {/* AI Recommendation */}
      <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-amber-500/5 border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium">AI Recommendation</p>
            <p className="text-sm text-muted-foreground mt-1">{analysis.recommendation}</p>
          </div>
        </div>
      </Card>
    </Card>
  );
}

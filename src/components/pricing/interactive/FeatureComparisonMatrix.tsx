import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PRICING_TIERS } from '@/components/pricing/TierBadge';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const FEATURES = [
  { name: 'Savings Goals', category: 'Goals', tiers: [true, true, true, true, true] },
  { name: 'Unlimited Goals', category: 'Goals', tiers: [false, false, true, true, true] },
  { name: 'Goal Milestones', category: 'Goals', tiers: [false, true, true, true, true] },
  { name: 'Auto-Save Rules', category: 'Automation', tiers: [true, true, true, true, true] },
  { name: 'Smart Transfers', category: 'Automation', tiers: [false, true, true, true, true] },
  { name: 'AI Recommendations', category: 'AI', tiers: [false, false, true, true, true] },
  { name: 'AI Forecasting', category: 'AI', tiers: [false, false, false, true, true] },
  { name: 'Budget Tracking', category: 'Analytics', tiers: [true, true, true, true, true] },
  { name: 'Advanced Analytics', category: 'Analytics', tiers: [false, false, true, true, true] },
  { name: 'Priority Support', category: 'Support', tiers: [false, false, true, true, true] },
];

export function FeatureComparisonMatrix() {
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(FEATURES.map(f => f.category)));
  
  const filteredFeatures = FEATURES.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-border"
    >
      <h3 className="text-2xl font-bold text-foreground mb-6">Feature Comparison</h3>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            <Filter className="w-4 h-4 mr-2" />
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Feature</th>
              {PRICING_TIERS.map(tier => (
                <th key={tier.name} className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredFeatures.map((feature, idx) => (
                <motion.tr
                  key={feature.name}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-foreground">{feature.name}</td>
                  {feature.tiers.map((available, tierIdx) => (
                    <td key={tierIdx} className="text-center py-3 px-4">
                      {available ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

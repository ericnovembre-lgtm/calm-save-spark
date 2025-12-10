import { motion } from 'framer-motion';
import { Target, PiggyBank, Star, CheckCircle } from 'lucide-react';
import { useWishlistStats } from '@/hooks/useWishlist';

export function WishlistStats() {
  const { data: stats, isLoading } = useWishlistStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Items',
      value: stats.totalItems,
      icon: Target,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'Total Saved',
      value: `$${stats.totalSaved.toFixed(0)}`,
      icon: PiggyBank,
      color: 'text-green-500 bg-green-500/10',
    },
    {
      label: 'High Priority',
      value: stats.highPriorityCount,
      icon: Star,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Purchased',
      value: stats.purchasedCount,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-copilot-id="wishlist-stats">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-xl border border-border/50 bg-card p-4"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
            <stat.icon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

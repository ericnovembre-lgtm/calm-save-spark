import { motion } from 'framer-motion';
import { Plus, RefreshCw, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function WealthQuickActions() {
  const prefersReducedMotion = useReducedMotion();

  const actions = [
    {
      icon: Plus,
      label: 'Add to Goal',
      path: '/goals',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: RefreshCw,
      label: 'Check Score',
      path: '/credit',
      color: 'from-purple-500/20 to-pink-500/20',
    },
    {
      icon: PieChart,
      label: 'Portfolio',
      path: '/investments',
      color: 'from-green-500/20 to-emerald-500/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" />
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={action.path} to={action.path}>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`h-auto py-3 px-4 bg-gradient-to-br ${action.color} border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all relative overflow-hidden group`}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
                    initial={{ x: "-100%" }}
                    whileHover={prefersReducedMotion ? {} : { x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="relative z-10 flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </div>
                </Button>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

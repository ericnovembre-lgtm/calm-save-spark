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
      className="flex flex-wrap gap-3 justify-center md:justify-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
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
                className={`h-auto py-3 px-4 bg-gradient-to-br ${action.color} border-primary/20 hover:border-primary/40`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}

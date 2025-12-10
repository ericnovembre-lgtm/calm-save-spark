import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SplitGroup } from '@/hooks/useSplitGroups';

interface SplitGroupCardProps {
  group: SplitGroup;
  index: number;
}

export function SplitGroupCard({ group, index }: SplitGroupCardProps) {
  const memberCount = group.members?.length || 0;
  const balance = group.your_balance || 0;
  const isOwed = balance > 0;
  const isOwing = balance < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/expense-split/${group.id}`}
        className="block rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all"
        data-copilot-id={`split-group-${group.id}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${group.color}20` }}
            >
              {group.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{group.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {group.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-1">{group.description}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Total expenses</p>
            <p className="font-semibold">${(group.total_expenses || 0).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Your balance</p>
            <p className={`font-semibold ${
              isOwed ? 'text-green-600' : isOwing ? 'text-red-500' : 'text-foreground'
            }`}>
              {isOwed && '+'}${Math.abs(balance).toFixed(2)}
              {isOwed && <span className="text-xs ml-1">owed to you</span>}
              {isOwing && <span className="text-xs ml-1">you owe</span>}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

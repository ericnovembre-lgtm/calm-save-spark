import { motion } from 'framer-motion';
import { Users, MessageCircle, TrendingUp, Clock } from 'lucide-react';

interface ForumStatsProps {
  totalMembers: number;
  totalPosts: number;
  activeToday: number;
  postsThisWeek: number;
}

export function ForumStats({ 
  totalMembers = 2400, 
  totalPosts = 847, 
  activeToday = 128, 
  postsThisWeek = 54 
}: Partial<ForumStatsProps>) {
  const stats = [
    {
      icon: Users,
      label: 'Members',
      value: totalMembers.toLocaleString(),
      trend: '+12%',
      color: 'text-blue-500',
    },
    {
      icon: MessageCircle,
      label: 'Total Posts',
      value: totalPosts.toLocaleString(),
      trend: '+8%',
      color: 'text-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Active Today',
      value: activeToday.toString(),
      color: 'text-amber-500',
    },
    {
      icon: Clock,
      label: 'Posts This Week',
      value: postsThisWeek.toString(),
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <h3 className="font-semibold mb-4">Community Stats</h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stat.value}</span>
                {stat.trend && (
                  <span className="text-xs text-green-500">{stat.trend}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

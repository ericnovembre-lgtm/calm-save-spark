import { motion } from 'framer-motion';
import { Activity, DollarSign, Target, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'contribution' | 'share' | 'milestone' | 'join';
  message: string;
  timestamp: string;
  amount?: number;
}

// This would come from a real-time activity feed
const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'contribution',
    message: 'Sarah contributed to "Family Vacation"',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    amount: 50,
  },
  {
    id: '2',
    type: 'join',
    message: 'Mike accepted your goal invitation',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    type: 'milestone',
    message: '"Emergency Fund" reached 50%!',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    type: 'share',
    message: 'You shared "Home Down Payment" with Lisa',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
];

const iconMap = {
  contribution: DollarSign,
  share: Users,
  milestone: Target,
  join: Users,
};

const colorMap = {
  contribution: 'text-green-500 bg-green-500/10',
  share: 'text-blue-500 bg-blue-500/10',
  milestone: 'text-amber-500 bg-amber-500/10',
  join: 'text-purple-500 bg-purple-500/10',
};

export function SharedGoalActivity() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>

      {mockActivity.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockActivity.map((item, index) => {
            const Icon = iconMap[item.type];
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className={`p-2 rounded-lg ${colorMap[item.type]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {item.message}
                    {item.amount && (
                      <span className="font-semibold text-green-500 ml-1">
                        +${item.amount}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

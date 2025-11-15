import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface GoalAnalyticsProps {
  goals: any[];
}

export const GoalAnalytics = ({ goals }: GoalAnalyticsProps) => {
  const totalSaved = goals.reduce((sum, goal) => sum + parseFloat(String(goal.current_amount || 0)), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + parseFloat(String(goal.target_amount || 0)), 0);
  const averageProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => {
        const progress = (parseFloat(String(goal.current_amount || 0)) / parseFloat(String(goal.target_amount || 1))) * 100;
        return sum + progress;
      }, 0) / goals.length 
    : 0;

  const goalsNearCompletion = goals.filter(goal => {
    const progress = (parseFloat(String(goal.current_amount || 0)) / parseFloat(String(goal.target_amount || 1))) * 100;
    return progress >= 80 && progress < 100;
  }).length;

  const stats = [
    {
      title: "Total Saved",
      value: `$${totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: `of $${totalTarget.toLocaleString()} target`,
      color: "text-primary",
    },
    {
      title: "Average Progress",
      value: `${averageProgress.toFixed(1)}%`,
      icon: TrendingUp,
      description: "across all goals",
      color: "text-accent",
    },
    {
      title: "Active Goals",
      value: goals.length.toString(),
      icon: Target,
      description: "being tracked",
      color: "text-foreground",
    },
    {
      title: "Near Completion",
      value: goalsNearCompletion.toString(),
      icon: Calendar,
      description: "80%+ complete",
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

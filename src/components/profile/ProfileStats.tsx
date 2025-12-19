import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/hooks/useProfile";
import { format } from "date-fns";

interface ProfileStatsProps {
  profile: UserProfile;
}

export const ProfileStats = ({ profile }: ProfileStatsProps) => {
  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), "MMM d, yyyy")
    : "Unknown";

  const stats = [
    {
      icon: Flame,
      label: "Current Streak",
      value: profile.current_streak ?? 0,
      suffix: "days",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Trophy,
      label: "Longest Streak",
      value: profile.longest_streak ?? 0,
      suffix: "days",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: memberSince,
      suffix: "",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: CheckCircle2,
      label: "Onboarding",
      value: profile.onboarding_completed ? "Complete" : "Incomplete",
      suffix: "",
      color: profile.onboarding_completed ? "text-green-500" : "text-muted-foreground",
      bgColor: profile.onboarding_completed ? "bg-green-500/10" : "bg-muted",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Account Stats</CardTitle>
          <CardDescription>
            Your savings journey at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 * index }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
              >
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {stat.value} {stat.suffix}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

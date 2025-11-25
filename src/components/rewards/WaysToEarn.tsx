import { Card } from "@/components/ui/card";
import { Sparkles, Target, Users, MapPin, TrendingUp, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const earningMethods = [
  {
    icon: Target,
    title: "Complete Achievements",
    description: "Unlock badges by reaching savings milestones and maintaining streaks",
    points: "10-200 pts",
    color: "text-yellow-500",
  },
  {
    icon: Sparkles,
    title: "Finish Questlines",
    description: "Follow multi-step journeys for bigger rewards and special medallions",
    points: "200-500 pts",
    color: "text-purple-500",
  },
  {
    icon: MapPin,
    title: "Visit Partner Locations",
    description: "Shop at reward boosters for multiplied points and exclusive bonuses",
    points: "1.5-3x multiplier",
    color: "text-blue-500",
  },
  {
    icon: Users,
    title: "Collaborate on Goals",
    description: "Team up with family or friends for shared challenges and joint rewards",
    points: "50-150 pts",
    color: "text-green-500",
  },
  {
    icon: TrendingUp,
    title: "Maintain Streaks",
    description: "Build momentum with daily actions for increasing multipliers",
    points: "Up to 2x",
    color: "text-orange-500",
  },
  {
    icon: Gift,
    title: "Seasonal Events",
    description: "Participate in limited-time challenges for exclusive rewards",
    points: "Varies",
    color: "text-pink-500",
  },
];

export function WaysToEarn() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Ways to Earn Rewards</h2>
        <p className="text-sm text-muted-foreground">
          Multiple paths to accumulate points and unlock exclusive benefits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {earningMethods.map((method, index) => {
          const Icon = method.icon;

          return (
            <motion.div
              key={method.title}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${method.color}`} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      <Sparkles className="w-3 h-3" />
                      {method.points}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

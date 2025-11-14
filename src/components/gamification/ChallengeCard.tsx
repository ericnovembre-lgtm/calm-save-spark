import { motion } from "framer-motion";
import { Trophy, Users, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly';
  target: number;
  current: number;
  reward: string;
  participants: number;
  endsAt: Date;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: () => void;
}

export function ChallengeCard({ challenge, onJoin }: ChallengeCardProps) {
  const progress = (challenge.current / challenge.target) * 100;
  const timeLeft = Math.ceil((challenge.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm border-primary/20 opacity-80 saturate-80">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">{challenge.name}</h3>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
            </div>
            <Badge variant={challenge.type === 'weekly' ? 'default' : 'secondary'}>
              {challenge.type}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">
                ${challenge.current.toLocaleString()} / ${challenge.target.toLocaleString()}
              </span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Progress value={progress} className="h-3" />
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{challenge.participants}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{timeLeft}d left</span>
            </div>
          </div>

          {/* Reward */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
            <p className="text-sm font-medium text-foreground mb-1">🎁 Reward</p>
            <p className="text-sm text-muted-foreground">{challenge.reward}</p>
          </div>

          {/* Action */}
          {onJoin && (
            <Button className="w-full" onClick={onJoin}>
              Join Challenge
            </Button>
          )}

          {/* Urgency Animation */}
          {timeLeft <= 3 && (
            <motion.div
              className="absolute top-4 right-4"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <div className="w-3 h-3 rounded-full bg-orange-500" />
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

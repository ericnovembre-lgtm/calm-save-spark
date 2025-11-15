import { motion } from "framer-motion";
import { User, TrendingUp, TrendingDown } from "lucide-react";

interface TwinAvatarProps {
  age: number;
  lifeStage: string;
  netWorth: number;
}

export function TwinAvatar({ age, lifeStage, netWorth }: TwinAvatarProps) {
  const getAvatarColor = () => {
    if (netWorth > 1000000) return "from-success/20 to-success/5";
    if (netWorth > 100000) return "from-primary/20 to-primary/5";
    return "from-muted/20 to-muted/5";
  };

  const getHealthIndicator = () => {
    if (netWorth > 500000) return { icon: TrendingUp, color: "text-success" };
    if (netWorth > 0) return { icon: TrendingUp, color: "text-primary" };
    return { icon: TrendingDown, color: "text-destructive" };
  };

  const HealthIcon = getHealthIndicator().icon;

  return (
    <div className="relative">
      {/* Glowing Avatar */}
      <motion.div
        className={`relative w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${getAvatarColor()} 
                    flex items-center justify-center overflow-hidden`}
        animate={{
          boxShadow: [
            "0 0 20px rgba(var(--primary), 0.3)",
            "0 0 40px rgba(var(--primary), 0.5)",
            "0 0 20px rgba(var(--primary), 0.3)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Avatar Circle */}
        <motion.div
          className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <User className="h-16 w-16 text-primary" />
        </motion.div>

        {/* Orbiting Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/40"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              rotate: [0, 360],
              x: [0, Math.cos((i * Math.PI * 2) / 3) * 80],
              y: [0, Math.sin((i * Math.PI * 2) / 3) * 80],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.8,
            }}
          />
        ))}
      </motion.div>

      {/* Info Badge */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-background border rounded-full px-4 py-2 shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <HealthIcon className={`h-4 w-4 ${getHealthIndicator().color}`} />
          <span className="text-sm font-medium">Age {age}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-sm capitalize">{lifeStage.replace('-', ' ')}</span>
        </div>
      </motion.div>
    </div>
  );
}

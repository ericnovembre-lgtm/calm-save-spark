import { motion } from "framer-motion";
import { useState } from "react";
import { SaveplusAnimIcon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingIcon {
  name: string;
  tip: string;
  position: string;
  duration: number;
  delay: number;
}

const icons: FloatingIcon[] = [
  { 
    name: "piggy-bank", 
    tip: "Start with just $5/day = $1,825/year!", 
    position: "top-10 left-[10%]",
    duration: 3,
    delay: 0
  },
  { 
    name: "chart", 
    tip: "Track your progress with real-time insights", 
    position: "top-32 right-[15%]",
    duration: 3.5,
    delay: 0.2
  },
  { 
    name: "target", 
    tip: "Set goals and watch your savings grow", 
    position: "top-48 left-[5%]",
    duration: 4,
    delay: 0.4
  },
  { 
    name: "money", 
    tip: "Automate your savings effortlessly", 
    position: "top-20 right-[8%]",
    duration: 3.8,
    delay: 0.6
  },
  { 
    name: "shield", 
    tip: "Your money is secure with bank-level encryption", 
    position: "top-64 right-[20%]",
    duration: 3.2,
    delay: 0.8
  },
  { 
    name: "trophy", 
    tip: "Earn achievements as you save", 
    position: "top-56 left-[18%]",
    duration: 3.6,
    delay: 1
  },
];

export const FloatingIcons = () => {
  const prefersReducedMotion = useReducedMotion();
  const [clickedIcons, setClickedIcons] = useState<Set<string>>(new Set());

  const handleIconClick = (iconName: string) => {
    setClickedIcons(prev => new Set(prev).add(iconName));
    setTimeout(() => {
      setClickedIcons(prev => {
        const next = new Set(prev);
        next.delete(iconName);
        return next;
      });
    }, 1000);
  };

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {icons.map((icon, i) => (
          <motion.div
            key={icon.name}
            className={`absolute ${icon.position} pointer-events-auto`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1],
              scale: clickedIcons.has(icon.name) ? [1, 1.3, 1] : 1,
              y: clickedIcons.has(icon.name) ? 0 : [0, -20, 0],
              rotate: clickedIcons.has(icon.name) ? [0, 360] : [-5, 5, -5],
            }}
            transition={{
              opacity: { duration: 0.5, delay: icon.delay },
              scale: clickedIcons.has(icon.name) ? { duration: 0.6 } : undefined,
              y: {
                duration: icon.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: icon.delay,
              },
              rotate: clickedIcons.has(icon.name) 
                ? { duration: 0.6 } 
                : {
                    duration: icon.duration + 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: icon.delay,
                  },
            }}
            whileHover={{ 
              scale: 1.1,
              y: 0,
            }}
            onClick={() => handleIconClick(icon.name)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer bg-background/80 backdrop-blur-sm rounded-2xl p-4 shadow-[var(--shadow-soft)] border border-border/20 hover:border-border/40 transition-colors">
                  <SaveplusAnimIcon 
                    name={icon.name as any} 
                    size={32}
                    className="text-accent"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">{icon.tip}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
};

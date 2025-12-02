import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  DollarSign, 
  User, 
  Calendar, 
  Clock, 
  BarChart3, 
  MessageSquare,
  TrendingUp,
  Layers,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MinimapSection {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const DESKTOP_SECTIONS: MinimapSection[] = [
  { id: 'header-section', label: 'Digital Twin', icon: Sparkles, color: 'cyan' },
  { id: 'net-worth-section', label: 'Net Worth', icon: DollarSign, color: 'green' },
  { id: 'avatar-section', label: 'Avatar', icon: User, color: 'violet' },
  { id: 'events-section', label: 'Life Events', icon: Calendar, color: 'amber' },
  { id: 'timeline-section', label: 'Timeline', icon: Clock, color: 'cyan' },
  { id: 'projections-section', label: 'Projections', icon: BarChart3, color: 'violet' },
  { id: 'chat-section', label: 'Chat', icon: MessageSquare, color: 'pink' },
];

export const MOBILE_SECTIONS: MinimapSection[] = [
  { id: 'financial-status-section', label: 'Financial Status', icon: TrendingUp, color: 'green' },
  { id: 'twin-avatar-section', label: 'Your Digital Twin', icon: User, color: 'violet' },
  { id: 'life-events-section', label: 'Life Events', icon: Layers, color: 'amber' },
  { id: 'timeline-section', label: 'Timeline', icon: Clock, color: 'cyan' },
  { id: 'projections-section', label: 'Projections', icon: BarChart3, color: 'violet' },
];

interface DigitalTwinMinimapProps {
  sections?: MinimapSection[];
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

const colorMap: Record<string, { active: string; glow: string }> = {
  cyan: { active: 'bg-cyan-500', glow: 'shadow-cyan-500/50' },
  green: { active: 'bg-green-500', glow: 'shadow-green-500/50' },
  violet: { active: 'bg-violet-500', glow: 'shadow-violet-500/50' },
  amber: { active: 'bg-amber-500', glow: 'shadow-amber-500/50' },
  pink: { active: 'bg-pink-500', glow: 'shadow-pink-500/50' },
};

export function DigitalTwinMinimap({
  sections,
  activeSection,
  onSectionClick,
  className
}: DigitalTwinMinimapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoCollapseTimer, setAutoCollapseTimer] = useState<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const displaySections = sections || (isMobile ? MOBILE_SECTIONS : DESKTOP_SECTIONS);

  // Auto-collapse on mobile after selection
  useEffect(() => {
    if (isMobile && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
      setAutoCollapseTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isExpanded, activeSection]);

  const handleSectionClick = (sectionId: string) => {
    if (!prefersReducedMotion) {
      haptics.buttonPress();
      soundEffects.click();
    }
    onSectionClick(sectionId);
    
    // Auto-collapse on mobile after selection
    if (isMobile) {
      setTimeout(() => setIsExpanded(false), 200);
    }
  };

  const handleToggle = () => {
    if (isMobile) {
      if (!prefersReducedMotion) {
        haptics.buttonPress();
        soundEffects.click();
      }
      setIsExpanded(!isExpanded);
    }
  };

  const activeIndex = displaySections.findIndex(s => s.id === activeSection);
  const progress = activeIndex >= 0 ? (activeIndex / (displaySections.length - 1)) * 100 : 0;

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div
        className={cn(
          "fixed z-50",
          isMobile ? "left-3 top-1/2 -translate-y-1/2" : "right-4 top-1/2 -translate-y-1/2",
          className
        )}
        initial={{ opacity: 0, x: isMobile ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className={cn(
            "backdrop-blur-xl bg-slate-950/90 border border-cyan-500/20 rounded-2xl overflow-hidden",
            "shadow-lg shadow-black/50"
          )}
          animate={{
            width: isExpanded ? (isMobile ? 150 : 180) : (isMobile ? 40 : 48)
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => !isMobile && setIsExpanded(true)}
          onMouseLeave={() => !isMobile && setIsExpanded(false)}
        >
          {/* Progress track */}
          <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-white/10 rounded-full">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyan-500 to-violet-500 rounded-full"
              style={{ height: `${progress}%` }}
              animate={{ height: `${progress}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            />
          </div>

          {/* Section items */}
          <nav 
            role="navigation" 
            aria-label="Page sections"
            className="py-3 px-2 space-y-1"
          >
            {displaySections.map((section, index) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;
              const colors = colorMap[section.color] || colorMap.cyan;

              return (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleSectionClick(section.id)}
                      onTap={isMobile ? handleToggle : undefined}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                        isActive 
                          ? "bg-white/10" 
                          : "hover:bg-white/5"
                      )}
                      aria-label={`Navigate to ${section.label}`}
                      aria-current={isActive ? 'true' : undefined}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    >
                      {/* Indicator dot */}
                      <div className="relative flex-shrink-0">
                        <motion.div
                          className={cn(
                            "w-3 h-3 rounded-full transition-all",
                            isActive ? colors.active : "bg-white/20"
                          )}
                          animate={isActive && !prefersReducedMotion ? {
                            boxShadow: [
                              `0 0 0 0 ${colors.glow}`,
                              `0 0 8px 2px ${colors.glow}`,
                              `0 0 0 0 ${colors.glow}`
                            ]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </div>

                      {/* Icon */}
                      <Icon 
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors",
                          isActive ? "text-white" : "text-white/50"
                        )} 
                      />

                      {/* Label */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                            className={cn(
                              "text-xs font-mono whitespace-nowrap transition-colors",
                              isActive ? "text-white" : "text-white/50"
                            )}
                          >
                            {section.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent 
                      side={isMobile ? "right" : "left"}
                      className="bg-slate-950/95 border-cyan-500/20 text-white text-xs font-mono"
                    >
                      {section.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Mobile expand indicator */}
          {isMobile && !isExpanded && (
            <motion.div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/20 rounded-full"
              animate={!prefersReducedMotion ? {
                opacity: [0.3, 0.6, 0.3]
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, DollarSign, Target, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LiquidFillProgress } from "./LiquidFillProgress";
import { PotBackgroundImage } from "./PotBackgroundImage";
import { GradientKey } from "@/lib/pot-gradients";
import confetti from "canvas-confetti";
import { haptics } from "@/lib/haptics";
import { format, addMonths } from "date-fns";

interface Pot {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number | null;
  target_date: string | null;
  notes: string | null;
  color: GradientKey | string;
  image_url?: string | null;
}

interface PotsGlassCardProps {
  pot: Pot;
  onEdit: (pot: Pot) => void;
  onDelete: (pot: Pot) => void;
  registerDropZone?: (id: string, element: HTMLElement) => void;
  unregisterDropZone?: (id: string) => void;
  hoveredZone?: string | null;
  monthlyPace?: number;
  projectedDate?: Date | null;
}

export const PotsGlassCard = ({ 
  pot, 
  onEdit, 
  onDelete,
  registerDropZone,
  unregisterDropZone,
  hoveredZone,
  monthlyPace = 0,
  projectedDate
}: PotsGlassCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  
  const progress = pot.target_amount 
    ? Math.min((pot.current_amount / pot.target_amount) * 100, 100)
    : 0;
    
  const isComplete = pot.target_amount && pot.current_amount >= pot.target_amount;
  
  // Register drop zone for impulse save
  useEffect(() => {
    if (dropZoneRef.current && registerDropZone) {
      registerDropZone(pot.id, dropZoneRef.current);
      return () => unregisterDropZone?.(pot.id);
    }
  }, [pot.id, registerDropZone, unregisterDropZone]);
  
  // Trigger shake animation when hovered
  useEffect(() => {
    if (hoveredZone === pot.id && !prefersReducedMotion) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [hoveredZone, pot.id, prefersReducedMotion]);
  
  // Confetti celebration on completion
  useEffect(() => {
    if (isComplete && !hasTriggeredConfetti && cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          x: (cardRect.left + cardRect.width / 2) / window.innerWidth,
          y: (cardRect.top + cardRect.height / 2) / window.innerHeight
        },
        colors: ['#8B5CF6', '#06B6D4', '#F59E0B'],
        startVelocity: 30,
        decay: 0.9
      });
      
      haptics.achievementUnlocked();
      setHasTriggeredConfetti(true);
    }
  }, [isComplete, hasTriggeredConfetti]);
  
  return (
    <motion.div
      ref={cardRef}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, rotateY: 2 }}
    >
      <motion.div
        ref={dropZoneRef}
        className="relative overflow-hidden rounded-3xl h-full flex flex-col"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        animate={
          shouldShake
            ? {
                x: [0, -4, 4, -4, 4, 0],
                boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)",
                scale: 1.05,
                borderColor: "rgba(139, 92, 246, 0.8)",
                transition: { duration: 0.4 }
              }
            : hoveredZone === pot.id
            ? {
                boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)",
                scale: 1.05,
                borderColor: "rgba(139, 92, 246, 0.8)"
              }
            : {}
        }
        transition={{ duration: 0.2 }}
      >
        {/* Background image with unblur effect */}
        <PotBackgroundImage imageUrl={pot.image_url || undefined} progress={progress} />
        
        {/* Liquid fill progress */}
        <LiquidFillProgress progress={progress} gradientKey={pot.color} />
        
        {/* Content layer */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header with actions */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <h3 className="text-xl font-bold text-foreground flex-1 truncate">
              {pot.name}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(pot)}
                className="h-8 w-8 hover:bg-background/20 text-foreground"
                aria-label={`Edit ${pot.name}`}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(pot)}
                className="h-8 w-8 hover:bg-destructive/20 text-destructive"
                aria-label={`Delete ${pot.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Notes */}
          {pot.notes && (
            <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
              {pot.notes}
            </p>
          )}
          
          {/* Balance */}
          <div className="flex items-center gap-2 text-sm mb-2">
            <DollarSign className="w-4 h-4 text-foreground/60" />
            <span className="text-foreground/70">Balance: </span>
            <span className="font-medium text-foreground">
              ${pot.current_amount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
          
          {/* Target */}
          {pot.target_amount && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <Target className="w-4 h-4 text-foreground/60" />
              <span className="text-foreground/70">Target: </span>
              <span className="font-medium text-foreground">
                ${pot.target_amount.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          )}
          
          {/* Time-Travel Projection */}
          {projectedDate && monthlyPace > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-background/20 backdrop-blur"
            >
              <p className="text-xs text-foreground/80 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                At your current pace (${monthlyPace.toFixed(0)}/mo), you'll own this by{' '}
                <span className="font-medium text-primary">
                  {format(projectedDate, 'MMMM do, yyyy')}
                </span>
              </p>
            </motion.div>
          )}
          
          {/* Progress bar (simple fallback) */}
          {pot.target_amount && (
            <div className="mt-auto pt-4">
              <div className="flex justify-between text-xs text-foreground/60 mb-1">
                <span>{progress.toFixed(0)}% complete</span>
                <span>
                  ${(pot.target_amount - pot.current_amount).toLocaleString('en-US', { 
                    minimumFractionDigits: 2 
                  })} remaining
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Victory overlay */}
        {isComplete && (
          <motion.div
            className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center">
              <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">Goal Achieved!</p>
              <p className="text-sm text-foreground/70">You did it! 🎉</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

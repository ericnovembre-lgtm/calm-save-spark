import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, useSpring, useTransform } from "framer-motion";
import { MoreVertical, Edit, Trash2, TrendingUp, TrendingDown, AlertCircle, Zap, ArrowRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BudgetProgressLiquid } from "./BudgetProgressLiquid";
import { CategoryIcon } from "./CategoryIcon";
import { fadeInUp, cardHover } from "@/lib/motion-variants";
import { AnimatedCounter } from "@/components/onboarding/AnimatedCounter";
import { ScanLineOverlay } from "./advanced/ScanLineOverlay";
import { soundEffects } from "@/lib/sound-effects";
import { DailyPaceCalculator } from "./DailyPaceCalculator";
import { haptics } from "@/lib/haptics";
import { useState, useEffect } from 'react';

type Priority = 'hero' | 'large' | 'normal';

interface BudgetCardProps {
  budget: {
    id: string;
    name: string;
    total_limit: number;
    period: string;
    is_active: boolean;
    category_limits: Record<string, number>;
  };
  spending?: {
    spent_amount: number;
    transaction_count: number;
  };
  categoryData?: {
    code: string;
    name: string;
    icon: string;
    color: string;
  };
  onEdit?: (updates?: any) => void;
  onDelete?: () => Promise<void>;
  size?: Priority;
  isOptimistic?: boolean;
  dragState?: {
    sourceBudgetId: string;
    isDragging: boolean;
  } | null;
  dropZoneState?: {
    isHovered: boolean;
    isValid: boolean;
  };
  onDragStart?: (element: HTMLElement) => void;
  onDragMove?: (x: number, y: number, cursorX: number, cursorY: number) => void;
  onDragEnd?: (cursorX: number, cursorY: number) => void;
}

export function BudgetCard({ 
  budget, 
  spending, 
  categoryData, 
  onEdit, 
  onDelete, 
  size = 'normal', 
  isOptimistic = false,
  dragState,
  dropZoneState,
  onDragStart,
  onDragMove,
  onDragEnd
}: BudgetCardProps) {
  const [showCoverOptions, setShowCoverOptions] = useState(false);
  const [cardElement, setCardElement] = useState<HTMLElement | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const spentAmount = spending?.spent_amount || 0;
  const totalLimit = parseFloat(String(budget.total_limit));
  const percentage = totalLimit > 0 ? (spentAmount / totalLimit) * 100 : 0;
  const remaining = totalLimit - spentAmount;
  
  const isOverBudget = percentage >= 100;
  const isNearLimit = percentage >= 80;
  const isSafe = percentage < 80;
  const isPriority = size === 'hero' || size === 'large';
  
  const isDraggingThis = dragState?.sourceBudgetId === budget.id;
  const isBeingDraggedOver = dropZoneState?.isHovered && dragState?.sourceBudgetId !== budget.id;
  const isValidDropTarget = dropZoneState?.isValid && isBeingDraggedOver;

  // Elastic spring animation for progress
  const springPercentage = useSpring(percentage, {
    stiffness: 100,
    damping: 15,
    mass: 0.5
  });

  // Glow intensity based on percentage
  const glowIntensity = useTransform(
    springPercentage,
    [80, 100],
    [0, 1]
  );

  // Haptic feedback on threshold cross
  useEffect(() => {
    if (percentage >= 80 && percentage < 81) {
      haptics.vibrate('medium');
    }
  }, [percentage]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (remaining <= 0 || !onDragStart || !cardElement) return;
    e.preventDefault();
    onDragStart(cardElement);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState?.isDragging || !onDragMove) return;
    onDragMove(e.clientX, e.clientY, e.clientX, e.clientY);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!dragState?.isDragging || !onDragEnd) return;
    onDragEnd(e.clientX, e.clientY);
  };

  // Touch drag handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (remaining <= 0 || !onDragStart || !cardElement) return;
    
    const timer = setTimeout(() => {
      haptics.buttonPress();
      onDragStart(cardElement);
    }, 500); // Long press
    
    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragState?.isDragging || !onDragMove) return;
    const touch = e.touches[0];
    onDragMove(touch.clientX, touch.clientY, touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (!dragState?.isDragging || !onDragEnd) return;
    const touch = e.changedTouches[0];
    onDragEnd(touch.clientX, touch.clientY);
  };

  // Event listeners
  useEffect(() => {
    if (dragState?.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragState?.isDragging]);

  // Determine card state styling
  const cardStateClass = isValidDropTarget
    ? 'bg-emerald-500/20 border-emerald-500/50'
    : isBeingDraggedOver && !dropZoneState?.isValid
    ? 'bg-rose-500/20 border-rose-500/50'
    : isOverBudget
    ? 'bg-rose-500/10 border-rose-500/30'
    : isNearLimit
    ? 'bg-amber-500/10 border-amber-500/30'
    : 'bg-emerald-500/10 border-emerald-500/30';

  const glowClass = isValidDropTarget
    ? 'drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]'
    : isOverBudget
    ? 'drop-shadow-[0_0_20px_rgba(248,113,113,0.6)]'
    : isNearLimit
    ? 'drop-shadow-[0_0_12px_rgba(251,146,60,0.4)]'
    : '';

  return (
    <motion.div
      id={`budget-card-${budget.id}`}
      ref={setCardElement}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      layout
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ touchAction: remaining > 0 ? 'none' : 'auto' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <motion.div
        animate={
          isBeingDraggedOver && !dropZoneState?.isValid
            ? { x: [-5, 5, -5, 5, 0], rotate: [-2, 2, -2, 2, 0] }
            : isOverBudget 
            ? { scale: [1, 1.02, 1] } 
            : {}
        }
        transition={{ 
          repeat: isOverBudget ? Infinity : 0, 
          duration: isBeingDraggedOver ? 0.3 : 2 
        }}
      >
      <Card className={`
        relative p-6 hover:shadow-lg transition-all duration-500 backdrop-blur-sm overflow-hidden group
        ${cardStateClass}
        ${size === 'hero' ? 'border-2 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border'}
        ${size === 'large' ? 'border-2' : ''}
        ${isOptimistic ? 'opacity-60 pointer-events-none' : ''}
        ${isDraggingThis ? 'opacity-30' : ''}
        ${remaining > 0 && !dragState ? 'cursor-grab' : ''}
        ${isDraggingThis ? 'cursor-grabbing' : ''}
        ${glowClass}
      `}>
        {size === 'hero' && (
          <motion.div 
            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Zap className="w-3 h-3" />
            ATTENTION NEEDED
          </motion.div>
        )}
        <ScanLineOverlay intensity={size === 'hero' ? 'high' : 'low'} />
        
        {/* Optimistic Loading Indicator */}
        {isOptimistic && (
          <motion.div 
            className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
              />
              Processing...
            </div>
          </motion.div>
        )}
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <CategoryIcon 
              icon={categoryData?.icon || 'target'} 
              color={categoryData?.color || 'hsl(var(--primary))'} 
            />
            <div>
              <h4 className="font-semibold text-foreground">{budget.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {budget.is_active && <Badge variant="default">Active</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  soundEffects.click();
                  onEdit?.();
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Budget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  soundEffects.warning();
                  onDelete?.();
                }} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Budget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center justify-center mb-6">
          <BudgetProgressLiquid 
            percentage={percentage} 
            size={120}
            strokeWidth={8}
          />
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Spent</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-foreground">$</span>
              <AnimatedCounter 
                value={spentAmount} 
                className="text-lg font-bold text-foreground font-mono tabular-nums"
                decimals={2}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <div className="flex items-center justify-end gap-1">
              <span className={`text-lg font-bold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                $
              </span>
              <AnimatedCounter 
                value={Math.abs(remaining)} 
                className={`text-lg font-bold font-mono tabular-nums ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}
                decimals={2}
              />
            </div>
          </div>
        </div>

        {/* Daily Pace Calculator */}
        <DailyPaceCalculator
          budgetId={budget.id}
          totalLimit={totalLimit}
          spentAmount={spentAmount}
          periodStart={new Date().toISOString()}
          periodEnd={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()}
        />

        {/* Status Indicator with Cover Button */}
        {isOverBudget ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <p className="text-sm text-rose-500 font-medium">
                ${Math.abs(remaining).toFixed(2)} over budget
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
              onClick={() => setShowCoverOptions(!showCoverOptions)}
            >
              <ArrowRight className="w-4 h-4" />
              Cover this?
            </Button>
          </div>
        ) : isNearLimit ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/20 border border-amber-500/40">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-500 font-medium">
                {(100 - percentage).toFixed(0)}% remaining
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <Button
                variant="outline"
                className="w-full gap-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                onClick={() => setShowCoverOptions(!showCoverOptions)}
              >
                <ArrowRight className="w-4 h-4" />
                Need more funds?
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
            <TrendingDown className="h-4 w-4 text-emerald-500" />
            <p className="text-sm text-emerald-500 font-medium">
              On track - {spending?.transaction_count || 0} transactions
            </p>
          </div>
        )}
      </Card>
      </motion.div>
    </motion.div>
  );
}

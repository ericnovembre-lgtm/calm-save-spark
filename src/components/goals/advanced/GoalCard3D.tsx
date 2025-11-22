import { motion } from 'framer-motion';
import { use3DTilt } from '@/hooks/use3DTilt';
import { LottieGoalIcon } from './LottieGoalIcon';
import { FluidProgressRing } from '../visualization/FluidProgressRing';
import { DragToSaveZone } from '../DragToSaveZone';
import { card3D } from '@/lib/motion-variants-advanced';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GoalActionsMenu } from '../GoalActionsMenu';
import { useGoalVisual } from '@/hooks/useGoalVisual';

interface GoalCard3DProps {
  id: string;
  name: string;
  current: number;
  target: number;
  icon?: string;
  deadline?: string;
  onClick?: () => void;
  onContribute?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePause?: () => void;
  isPaused?: boolean;
  isDragHovered?: boolean;
  onRegisterDropZone?: (id: string, element: HTMLElement) => void;
  onUnregisterDropZone?: (id: string) => void;
}

/**
 * Premium 3D Goal Card with parallax tilt effect
 */
export const GoalCard3D = ({
  id,
  name,
  current,
  target,
  icon,
  deadline,
  onClick,
  onContribute,
  onEdit,
  onDelete,
  onTogglePause,
  isPaused = false,
  isDragHovered = false,
  onRegisterDropZone,
  onUnregisterDropZone
}: GoalCard3DProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { tiltStyle, handleMouseMove, handleMouseLeave } = use3DTilt({
    maxTilt: 10,
    scale: 1.03
  });
  const { imageUrl, isLoading: visualLoading } = useGoalVisual({ goalName: name, enabled: true });

  const progress = Math.min((current / target) * 100, 100);

  return (
    <motion.div
      variants={card3D}
      initial="rest"
      whileHover={prefersReducedMotion ? undefined : "hover"}
      whileTap={prefersReducedMotion ? undefined : "tap"}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {/* Glassmorphism card */}
      <div className="
        relative overflow-hidden rounded-3xl
        bg-gradient-to-br from-card/90 to-card/70
        backdrop-blur-xl border border-border/50
        shadow-lg hover:shadow-2xl
        transition-shadow duration-500
      ">
        {/* AI-generated background visual */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          </div>
        )}

        {/* Background glow */}
        <div className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-500
          bg-gradient-to-br from-primary/10 to-transparent
        " />

        {/* Drag-to-save drop zone */}
        {onRegisterDropZone && onUnregisterDropZone && (
          <DragToSaveZone
            goalId={id}
            goalName={name}
            isHovered={isDragHovered}
            onRegister={onRegisterDropZone}
            onUnregister={onUnregisterDropZone}
          />
        )}

        {/* Content */}
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {name}
              </h3>
              {deadline && (
                <p className="text-sm text-muted-foreground">
                  Due {new Date(deadline).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex items-start gap-2">
              <LottieGoalIcon 
                goalType={icon}
                size={56}
                animate={false}
              />
              {(onContribute || onEdit || onDelete || onTogglePause) && (
                <GoalActionsMenu
                  goalId={id}
                  goalName={name}
                  isPaused={isPaused}
                  onContribute={onContribute || (() => {})}
                  onEdit={onEdit || (() => {})}
                  onDelete={onDelete || (() => {})}
                  onTogglePause={onTogglePause || (() => {})}
                />
              )}
            </div>
          </div>

          {/* Fluid Progress Ring */}
          <div className="flex justify-center">
            <FluidProgressRing
              progress={progress}
              size={160}
              strokeWidth={12}
            />
          </div>

          {/* Amount Display */}
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-foreground">
              ${current.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              of ${target.toLocaleString()} goal
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>

        {/* Shine effect */}
        <div className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-700 pointer-events-none
          bg-gradient-to-r from-transparent via-white/5 to-transparent
          translate-x-[-100%] group-hover:translate-x-[100%]
          transition-transform duration-1000
        " />
      </div>
    </motion.div>
  );
};

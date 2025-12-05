import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBudgetPresence, BudgetPresence } from "@/hooks/useBudgetPresence";
import { cn } from "@/lib/utils";

interface BudgetPresenceBarProps {
  budgetId: string;
  className?: string;
  compact?: boolean;
}

export const BudgetPresenceBar: React.FC<BudgetPresenceBarProps> = ({
  budgetId,
  className,
  compact = false,
}) => {
  const { viewers, isLoading } = useBudgetPresence(budgetId);

  if (isLoading || viewers.length === 0) {
    return null;
  }

  const maxVisible = compact ? 3 : 5;
  const visibleViewers = viewers.slice(0, maxVisible);
  const remainingCount = viewers.length - maxVisible;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-primary/5 border border-primary/10",
          className
        )}
      >
        <div className="flex items-center gap-1 text-primary">
          <Eye className="h-3.5 w-3.5" />
          {!compact && (
            <span className="text-xs font-medium">
              {viewers.length} viewing
            </span>
          )}
        </div>

        <div className="flex -space-x-2">
          <AnimatePresence mode="popLayout">
            {visibleViewers.map((viewer) => (
              <ViewerAvatar key={viewer.user_id} viewer={viewer} />
            ))}
          </AnimatePresence>

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative z-10"
                >
                  <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{remainingCount}
                    </span>
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {viewers.slice(maxVisible).map((v) => (
                    <div key={v.user_id} className="text-xs">
                      {v.user?.full_name || "Unknown"}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

interface ViewerAvatarProps {
  viewer: BudgetPresence;
}

const ViewerAvatar: React.FC<ViewerAvatarProps> = ({ viewer }) => {
  const initials = viewer.user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const actionLabel = viewer.cursor_position?.action;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scale: 0, x: -10 }}
          animate={{ scale: 1, x: 0 }}
          exit={{ scale: 0, x: -10 }}
          className="relative"
        >
          <Avatar className="h-7 w-7 border-2 border-background">
            <AvatarImage src={viewer.user?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Activity indicator */}
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border border-background"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <div className="font-medium">{viewer.user?.full_name || "Unknown"}</div>
        {actionLabel && (
          <div className="text-muted-foreground">
            Currently: {actionLabel}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Floating presence indicator for use in page headers
 */
export const FloatingPresenceIndicator: React.FC<{
  budgetId: string;
}> = ({ budgetId }) => {
  const { viewers } = useBudgetPresence(budgetId);

  if (viewers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-20 right-4 z-40"
    >
      <BudgetPresenceBar budgetId={budgetId} compact />
    </motion.div>
  );
};

/**
 * Inline presence list for sidebar/panel use
 */
export const PresenceList: React.FC<{
  budgetId: string;
  className?: string;
}> = ({ budgetId, className }) => {
  const { viewers, allPresence, currentUserId } = useBudgetPresence(budgetId);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Who's here ({allPresence.length})</span>
      </div>

      <div className="space-y-1">
        {allPresence.map((presence) => {
          const isCurrentUser = presence.user_id === currentUserId;
          const initials = presence.user?.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "?";

          return (
            <motion.div
              key={presence.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg",
                isCurrentUser ? "bg-primary/5" : "bg-muted/50"
              )}
            >
              <div className="relative">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={presence.user?.avatar_url} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {presence.user?.full_name || "Unknown"}
                  {isCurrentUser && (
                    <span className="text-muted-foreground ml-1">(you)</span>
                  )}
                </div>
                {presence.cursor_position?.action && (
                  <div className="text-xs text-muted-foreground truncate">
                    {presence.cursor_position.action}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

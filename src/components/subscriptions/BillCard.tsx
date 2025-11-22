import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Pause, Play, Settings, AlertTriangle, MoreVertical, Trash2, Sparkles } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MerchantLogo } from './MerchantLogo';
import { ZombieBadge } from './ZombieBadge';
import { NegotiationScriptModal } from './NegotiationScriptModal';

interface BillCardProps {
  subscription: {
    id: string;
    merchant: string;
    amount: number;
    frequency: string;
    next_expected_date: string;
    last_charge_date?: string;
    category?: string;
    status?: string;
    confidence?: number;
    confirmed?: boolean;
    zombie_score?: number;
    last_usage_date?: string;
    user_id?: string;
  };
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BillCard({ subscription, onTogglePause, onDelete }: BillCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  
  const isOverdue = new Date(subscription.next_expected_date) < new Date();
  const isPaused = subscription.status === 'paused';
  const hasLowConfidence = (subscription.confidence || 1) < 0.8;

  const getStatusColor = () => {
    if (isPaused) return "bg-muted/50";
    if (isOverdue) return "border-l-4 border-destructive";
    return "";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border bg-card p-4 shadow-sm ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <MerchantLogo merchant={subscription.merchant} size="md" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {subscription.merchant}
              </h3>
              {subscription.zombie_score && subscription.zombie_score > 70 && (
                <ZombieBadge 
                  zombieScore={subscription.zombie_score} 
                  daysSinceLastUsage={subscription.last_usage_date 
                    ? Math.floor((Date.now() - new Date(subscription.last_usage_date).getTime()) / (1000 * 60 * 60 * 24))
                    : undefined
                  }
                />
              )}
              {isPaused && (
                <Badge variant="secondary" className="text-xs">Paused</Badge>
              )}
              {!subscription.confirmed && (
                <Badge variant="outline" className="text-xs">Unconfirmed</Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                ${Number(subscription.amount).toFixed(2)}
              </span>
              <span className="capitalize">{subscription.frequency}</span>
              <span>
                {format(new Date(subscription.next_expected_date), 'MMM d, yyyy')}
              </span>
            </div>
            
            {isOverdue && (
              <p className="text-destructive text-sm mt-1 font-medium">
                Overdue by {formatDistanceToNow(new Date(subscription.next_expected_date))}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Number(subscription.amount) > 50 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNegotiationModal(true)}
              className="h-8 px-2"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Negotiate
            </Button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTogglePause(subscription.id)}
            className={`rounded-lg p-2 transition-colors ${
              isPaused 
                ? 'hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400' 
                : 'hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400'
            }`}
            aria-label={isPaused ? "Resume subscription" : "Pause subscription"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </motion.button>

          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(subscription.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AnimatePresence>
        {hasLowConfidence && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Low confidence ({Math.round((subscription.confidence || 0) * 100)}%) - please verify this bill pattern
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NegotiationScriptModal
        subscription={subscription}
        open={showNegotiationModal}
        onOpenChange={setShowNegotiationModal}
      />
    </motion.div>
  );
}

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Trash2, DollarSign, ChevronDown, Sparkles } from "lucide-react";
import { MerchantLogo } from "./MerchantLogo";
import { AIConfidenceIndicator } from "./AIConfidenceIndicator";
import { EnrichmentReviewDialog } from "./EnrichmentReviewDialog";
import { TransactionDetective } from "./TransactionDetective";
import { RecurringBadge } from "./RecurringBadge";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryIcon, getCategoryColor } from "@/lib/category-icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATION_DURATION } from "@/lib/animation-constants";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  merchant: string | null;
  description: string | null;
  amount: number | string;
  transaction_date: string;
  category: string;
  enrichment_metadata?: any;
  recurring_metadata?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    confidence: number;
    next_expected?: string;
  };
  connected_accounts?: {
    institution_name: string;
  } | null;
}

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const amount = parseFloat(String(transaction.amount));
  const metadata = transaction.enrichment_metadata as { 
    ai_cleaned?: boolean; 
    confidence?: number; 
    original_merchant?: string;
    processing?: boolean;
  } | undefined;
  const isAIEnriched = metadata?.ai_cleaned;
  const confidence = metadata?.confidence || 0;
  const isProcessing = metadata?.processing || false;
  const recurringInfo = transaction.recurring_metadata;
  
  // Swipe gesture state
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(239, 68, 68, 0.1)', 'transparent', 'rgba(34, 197, 94, 0.1)']
  );
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const depositOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  
  const CategoryIcon = getCategoryIcon(transaction.category);
  const categoryColor = getCategoryColor(transaction.category);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x < 0) {
        // Swiped left - delete action
        console.log('Delete transaction:', transaction.id);
      } else {
        // Swiped right - quick deposit to goal
        console.log('Quick deposit from transaction:', transaction.id);
      }
    }
    x.set(0);
  };

  return (
    <>
      <div className="relative">
        {/* Swipe action backgrounds */}
        <motion.div 
          className="absolute inset-0 rounded-lg flex items-center justify-between px-6"
          style={{ background }}
        >
          <motion.div style={{ opacity: deleteOpacity }} className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Delete</span>
          </motion.div>
          <motion.div style={{ opacity: depositOpacity }} className="flex items-center gap-2 text-green-600">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Save to Goal</span>
          </motion.div>
        </motion.div>

        {/* Main card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            duration: ANIMATION_DURATION.fast / 1000 
          }}
          className="relative"
        >
          <GlassCard className={cn(
            "mb-2 p-4",
            isExpanded ? "cursor-default" : "cursor-grab active:cursor-grabbing",
            isProcessing && "relative overflow-hidden"
          )}>
            {/* Processing shimmer overlay */}
            {isProcessing && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
                animate={{
                  translateX: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}

            <div 
              className="flex items-start gap-3 cursor-pointer"
              onClick={() => !isExpanded && setIsExpanded(true)}
            >
              <MerchantLogo 
                merchant={transaction.merchant || 'Unknown'} 
                size="md"
                showSkeleton={isProcessing}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-foreground truncate">
                    {transaction.merchant || 'Unknown Merchant'}
                  </p>
                  {isProcessing ? (
                    <Badge variant="secondary" className="gap-1 text-xs animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      Categorizing...
                    </Badge>
                  ) : (
                    <>
                      {isAIEnriched && confidence > 0.7 && (
                        <AIConfidenceIndicator
                          confidence={confidence}
                          originalMerchant={metadata?.original_merchant}
                          cleanedName={transaction.merchant || 'Unknown'}
                          onReview={() => setShowReviewDialog(true)}
                        />
                      )}
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs shrink-0 gap-1 border",
                          categoryColor
                        )}
                      >
                        <CategoryIcon className="w-3 h-3" />
                        {transaction.category}
                      </Badge>
                      {recurringInfo && (
                        <RecurringBadge
                          frequency={recurringInfo.frequency}
                          confidence={recurringInfo.confidence}
                          nextExpected={recurringInfo.next_expected}
                        />
                      )}
                    </>
                  )}
                </div>
              
                {transaction.description && (
                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {transaction.description}
                  </p>
                )}
              
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                  </span>
                  {transaction.connected_accounts?.institution_name && (
                    <span className="truncate">{transaction.connected_accounts.institution_name}</span>
                  )}
                </div>
              </div>
              
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <p className={`font-bold text-lg ${
                    amount < 0 ? 'text-destructive' : 'text-success'
                  }`}>
                    {amount < 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </Button>
              </div>
            </div>

            {/* Expanded Detective Section */}
            <AnimatePresence>
              {isExpanded && (
                <TransactionDetective
                  transactionId={transaction.id}
                  merchant={transaction.merchant || 'Unknown'}
                  amount={amount}
                  category={transaction.category}
                />
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      </div>

      <EnrichmentReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        transaction={transaction}
      />
    </>
  );
}

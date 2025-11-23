import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TransactionDetective } from './TransactionDetective';
import { MerchantLogo } from './MerchantLogo';
import { SmartBadges } from './SmartBadges';
import { QuickActions } from './QuickActions';
import { TransactionSplitDialog } from './TransactionSplitDialog';
import { RecategorizeDialog } from './RecategorizeDialog';
import { AddNoteDialog } from './AddNoteDialog';
import { useHighSpendingDetection } from '@/hooks/useHighSpendingDetection';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
  anomaly?: {
    anomalyType: string;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
    suggestedAction: string;
  };
}

export function TransactionCard({ transaction, anomaly }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [isRecategorizeDialogOpen, setIsRecategorizeDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string>();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  const amount = parseFloat(transaction.amount as any);
  const isDebit = amount < 0;
  const merchant = transaction.merchant || 'Unknown Merchant';
  const category = transaction.category || 'Uncategorized';
  const description = transaction.description || '';
  const date = format(new Date(transaction.transaction_date), 'MMM dd, yyyy');
  const bankName = transaction.connected_accounts?.institution_name || 'Bank';

  // AI Enrichment status
  const isAIEnriched = transaction.enrichment_metadata?.enriched_merchant || 
                       transaction.enrichment_metadata?.ai_category;
  const confidence = (transaction.enrichment_metadata?.confidence || 0) as number;
  const isProcessing = transaction.enrichment_metadata?.needs_enrichment === true;

  // Recurring detection
  const isRecurring = !!transaction.recurring_metadata?.frequency;
  const recurringInfo = transaction.recurring_metadata;

  // High spending detection
  const { isHighSpending } = useHighSpendingDetection(
    merchant,
    amount,
    userId
  );

  // Quick action handlers
  const handleCategorize = () => {
    setIsRecategorizeDialogOpen(true);
  };

  const handleAddNote = () => {
    setIsAddNoteDialogOpen(true);
  };

  const handleSplit = () => {
    setIsSplitDialogOpen(true);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={prefersReducedMotion ? {} : { 
        y: -4,
        boxShadow: 'var(--glass-shadow-elevated)',
        transition: { duration: 0.2 }
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        'group relative bg-glass backdrop-blur-glass rounded-2xl p-4',
        'shadow-glass cursor-pointer',
        'hover:bg-glass-hover',
        'transition-all duration-300',
        anomaly ? cn(
          "border-2",
          anomaly.severity === 'high' && "border-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.3)]",
          anomaly.severity === 'medium' && "border-warning shadow-[0_0_15px_hsl(var(--warning)/0.2)]",
          anomaly.severity === 'low' && "border-muted"
        ) : "border border-glass-border hover:border-glass-border-hover"
      )}
    >
      {/* Anomaly Alert Badge (top-right) */}
      {anomaly && (
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            variant="destructive" 
            className={cn(
              "text-xs gap-1",
              anomaly.severity === 'high' && "animate-pulse"
            )}
          >
            ⚠️ Anomaly
          </Badge>
        </div>
      )}

      {/* Top Row: Logo + Merchant + Amount */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <MerchantLogo merchant={merchant} size="lg" />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate mb-0.5">
              {merchant}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="text-right">
            <div className={cn(
              'text-2xl font-bold tabular-nums',
              isDebit ? 'text-destructive' : 'text-success'
            )}>
              {isDebit ? '-' : '+'}${Math.abs(amount).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
          </div>
          
          <motion.button
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="p-1 hover:bg-secondary/20 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Badge Row with Anomaly */}
      <div className="flex flex-wrap gap-2 mb-3">
        {anomaly && (
          <Badge
            variant="destructive"
            className="gap-1 text-xs"
          >
            {anomaly.explanation}
          </Badge>
        )}
        <SmartBadges
          category={category}
          isAIEnriched={isAIEnriched}
          confidence={confidence}
          isRecurring={isRecurring}
          recurringInfo={recurringInfo as any}
          isHighSpending={isHighSpending}
          isProcessing={isProcessing}
        />
      </div>

      {/* Metadata Row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        <span>{bankName}</span>
      </div>

      {/* Quick Actions - Hover Reveal */}
      <QuickActions
        onViewDetails={() => setIsExpanded(!isExpanded)}
        onCategorize={handleCategorize}
        onAddNote={handleAddNote}
        onSplit={handleSplit}
        isExpanded={isExpanded}
      />

      {/* Expanded Detective View */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-glass-border"
        >
          <TransactionDetective
            transactionId={transaction.id}
            merchant={merchant}
            amount={amount}
            category={category}
            isExpanded={isExpanded}
            anomaly={anomaly}
          />
        </motion.div>
      )}
      
      <TransactionSplitDialog
        transaction={{
          id: transaction.id,
          merchant: transaction.merchant,
          description: transaction.description,
          amount: typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount as string),
          transaction_date: transaction.transaction_date,
          category: transaction.category,
        }}
        isOpen={isSplitDialogOpen}
        onClose={() => setIsSplitDialogOpen(false)}
      />

      <RecategorizeDialog
        transaction={{
          id: transaction.id,
          merchant: merchant,
          category: category,
          amount: amount,
          description: description,
        }}
        isOpen={isRecategorizeDialogOpen}
        onClose={() => setIsRecategorizeDialogOpen(false)}
      />

      <AddNoteDialog
        transaction={{
          id: transaction.id,
          merchant: merchant,
          category: category,
          amount: amount,
          description: description,
          tags: (transaction as any).tags,
        }}
        isOpen={isAddNoteDialogOpen}
        onClose={() => setIsAddNoteDialogOpen(false)}
      />
    </motion.div>
  );
}
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TransactionDetective } from './TransactionDetective';
import { MerchantLogo } from './MerchantLogo';
import { SmartBadges } from './SmartBadges';
import { QuickActions } from './QuickActions';
import { useHighSpendingDetection } from '@/hooks/useHighSpendingDetection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [userId, setUserId] = useState<string>();
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

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
    toast({ title: 'Categorize transaction', description: 'Feature coming soon!' });
  };

  const handleAddNote = () => {
    toast({ title: 'Add note', description: 'Feature coming soon!' });
  };

  const handleSplit = () => {
    toast({ title: 'Split transaction', description: 'Feature coming soon!' });
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
        'group relative bg-glass border border-glass-border rounded-2xl p-4',
        'backdrop-blur-glass shadow-glass cursor-pointer',
        'hover:bg-glass-hover hover:border-glass-border-hover',
        'transition-all duration-300'
      )}
    >
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

      {/* Badge Row */}
      <SmartBadges
        category={category}
        isAIEnriched={isAIEnriched}
        confidence={confidence}
        isRecurring={isRecurring}
        recurringInfo={recurringInfo as any}
        isHighSpending={isHighSpending}
        isProcessing={isProcessing}
        className="mb-3"
      />

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
          />
        </motion.div>
      )}
    </motion.div>
  );
}
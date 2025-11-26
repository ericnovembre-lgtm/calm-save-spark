import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Filter, Search, RefreshCw, Receipt, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCardTransactionEnrichment } from '@/hooks/useCardTransactionEnrichment';
import { TransactionDisputeDialog } from '@/components/card/TransactionDisputeDialog';
import type { Database } from '@/integrations/supabase/types';

type CardTransaction = Database['public']['Tables']['card_transactions']['Row'];

interface EnhancedCardTransactionListProps {
  transactions: CardTransaction[];
  isLoading?: boolean;
}

const categoryColors: Record<string, string> = {
  'Dining': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  'Shopping': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  'Groceries': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Transportation': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  'Entertainment': 'bg-pink-500/20 text-pink-700 border-pink-500/30',
  'Travel': 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
  'Health': 'bg-red-500/20 text-red-700 border-red-500/30',
  'Bills': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Gas': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  'Other': 'bg-muted text-muted-foreground border-border',
};

const categoryIcons: Record<string, string> = {
  'Dining': '🍽️',
  'Shopping': '🛍️',
  'Groceries': '🛒',
  'Transportation': '🚗',
  'Entertainment': '🎬',
  'Travel': '✈️',
  'Health': '⚕️',
  'Bills': '📄',
  'Gas': '⛽',
  'Other': '💳',
};

export function EnhancedCardTransactionList({ transactions, isLoading }: EnhancedCardTransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [disputeTransaction, setDisputeTransaction] = useState<CardTransaction | null>(null);
  const { enrich, batchEnrich, isEnriching, isBatchEnriching } = useCardTransactionEnrichment();

  const pendingTransactions = transactions.filter(tx => tx.enrichment_status === 'pending');
  const categories = Array.from(new Set(transactions.map(tx => tx.ai_category).filter(Boolean)));

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchQuery || 
      (tx.ai_merchant_name || tx.merchant_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || tx.ai_category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleBatchEnrich = () => {
    const toEnrich = pendingTransactions.map(tx => ({
      id: tx.id,
      merchant: tx.merchant_name || '',
    }));
    batchEnrich(toEnrich);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header with search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transactions</h3>
          {pendingTransactions.length > 0 && (
            <Button
              onClick={handleBatchEnrich}
              disabled={isBatchEnriching}
              size="sm"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isBatchEnriching ? 'Enriching...' : `Enrich ${pendingTransactions.length} pending`}
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => category && (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-1"
              >
                {categoryIcons[category] || '💳'}
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                {/* Icon/Category */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {categoryIcons[tx.ai_category || 'Other'] || '💳'}
                </div>

                {/* Merchant & Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {tx.ai_merchant_name || tx.merchant_name}
                    </p>
                    {tx.enrichment_status === 'completed' && tx.ai_confidence && tx.ai_confidence > 0.8 && (
                      <Sparkles className="w-3 h-3 text-violet-500" />
                    )}
                    {tx.receipt_image_path && (
                      <Receipt className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : 'N/A'}
                    </p>
                    {tx.ai_category && (
                      <Badge variant="outline" className={`text-xs ${categoryColors[tx.ai_category] || categoryColors.Other}`}>
                        {tx.ai_category}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="text-right space-y-1">
                  <p className={`font-semibold ${tx.amount_cents < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.amount_cents < 0 ? '-' : '+'}${(Math.abs(tx.amount_cents) / 100).toFixed(2)}
                  </p>
                  
                  <div className="flex gap-1">
                    {tx.enrichment_status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => enrich({ transactionId: tx.id, rawMerchant: tx.merchant_name || '' })}
                        disabled={isEnriching}
                        className="h-6 text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Enrich
                      </Button>
                    )}
                    
                    {tx.amount_cents < 0 && !tx.dispute_status && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDisputeTransaction(tx)}
                        className="h-6 text-xs text-orange-600 hover:text-orange-700"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Dispute
                      </Button>
                    )}
                    
                    {tx.dispute_status && (
                      <Badge variant="outline" className="text-xs">
                        {tx.dispute_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Dispute Dialog */}
      {disputeTransaction && (
        <TransactionDisputeDialog
          transaction={disputeTransaction}
          open={!!disputeTransaction}
          onOpenChange={(open) => !open && setDisputeTransaction(null)}
        />
      )}
    </Card>
  );
}

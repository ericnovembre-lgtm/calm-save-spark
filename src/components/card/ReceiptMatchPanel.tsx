import { motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCardReceiptMatching } from '@/hooks/useCardReceiptMatching';

interface ReceiptMatchPanelProps {
  matchResult: {
    matched: boolean;
    transaction?: any;
    candidates?: Array<{
      transaction: any;
      confidence: number;
      matchDetails: {
        merchantMatch: number;
        amountMatch: number;
        dateMatch: number;
      };
    }>;
    extractedData: {
      merchant: string;
      amount: number;
      date: string;
      items?: Array<{ name: string; price: number }>;
    };
  };
  onClose: () => void;
}

export function ReceiptMatchPanel({ matchResult, onClose }: ReceiptMatchPanelProps) {
  const { linkManually, verifyReceipt } = useCardReceiptMatching();

  const handleLinkToTransaction = (transactionId: string) => {
    linkManually({
      transactionId,
      imagePath: matchResult.transaction?.receipt_image_path || '',
      extractedData: matchResult.extractedData
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Receipt Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  {matchResult.matched ? 'Automatically matched' : 'Select matching transaction'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Extracted Data */}
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="text-sm font-semibold mb-3">Extracted Information</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Merchant</p>
                <p className="font-medium">{matchResult.extractedData.merchant}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="font-medium">${matchResult.extractedData.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="font-medium">
                  {new Date(matchResult.extractedData.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Auto-matched Transaction */}
          {matchResult.matched && matchResult.transaction && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold">Matched Transaction</h4>
                <Badge variant="outline" className="ml-auto text-green-600 border-green-600/30">
                  {(matchResult.transaction.receipt_match_confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
              <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {matchResult.transaction.ai_merchant_name || matchResult.transaction.merchant_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(matchResult.transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-lg">
                    ${(Math.abs(matchResult.transaction.amount_cents) / 100).toFixed(2)}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Candidate Matches */}
          {!matchResult.matched && matchResult.candidates && matchResult.candidates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-semibold">Potential Matches</h4>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {matchResult.candidates.map((candidate, index) => (
                    <Card
                      key={candidate.transaction.id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleLinkToTransaction(candidate.transaction.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium">
                            {candidate.transaction.ai_merchant_name || candidate.transaction.merchant_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(candidate.transaction.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(Math.abs(candidate.transaction.amount_cents) / 100).toFixed(2)}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              candidate.confidence > 0.7
                                ? 'text-green-600 border-green-600/30'
                                : candidate.confidence > 0.5
                                ? 'text-amber-600 border-amber-600/30'
                                : 'text-muted-foreground'
                            }
                          >
                            {(candidate.confidence * 100).toFixed(0)}% match
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">
                          Merchant: {(candidate.matchDetails.merchantMatch * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline">
                          Amount: {(candidate.matchDetails.amountMatch * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline">
                          Date: {(candidate.matchDetails.dateMatch * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* No Matches */}
          {!matchResult.matched && (!matchResult.candidates || matchResult.candidates.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No matching transactions found</p>
              <p className="text-sm mt-1">
                The receipt might be from a different time period or account
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
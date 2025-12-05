import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceTransaction } from '@/hooks/useVoiceTransaction';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { haptics } from '@/lib/haptics';
import { toast } from 'sonner';

export function VoiceTransactionButton() {
  const { 
    isListening, 
    isProcessing, 
    transcript, 
    parsedTransaction,
    isSupported,
    startListening, 
    stopListening,
    processVoiceInput,
    reset 
  } = useVoiceTransaction();
  
  const { addToQueue, isOnline } = useOfflineQueue();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isSupported) return null;

  const handlePress = async () => {
    haptics.buttonPress();
    
    if (isListening) {
      stopListening();
      const parsed = await processVoiceInput();
      if (parsed) {
        setShowConfirm(true);
      }
    } else {
      startListening();
    }
  };

  const handleConfirm = async () => {
    if (!parsedTransaction) return;
    
    haptics.formSuccess();
    
    await addToQueue({
      amount: -Math.abs(parsedTransaction.amount),
      merchant: parsedTransaction.merchant,
      category: parsedTransaction.category || 'Uncategorized',
      transaction_date: parsedTransaction.transaction_date
    });
    
    toast.success(isOnline ? 'Transaction saved!' : 'Transaction queued');
    setShowConfirm(false);
    reset();
  };

  const handleCancel = () => {
    haptics.buttonPress();
    setShowConfirm(false);
    reset();
  };

  return (
    <>
      {/* Main Voice Button */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        className="relative"
      >
        <Button
          size="icon"
          onClick={handlePress}
          disabled={isProcessing}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all",
            isListening 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {/* Listening Animation */}
        {isListening && (
          <>
            <motion.span
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-destructive"
            />
            <motion.span
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              className="absolute inset-0 rounded-full bg-destructive"
            />
          </>
        )}
      </motion.div>

      {/* Transcript Overlay */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-36 left-4 right-4 z-50"
          >
            <div className="bg-card/95 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">I heard:</p>
              <p className="text-foreground font-medium">{transcript}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && parsedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-3xl shadow-2xl p-6"
            >
              <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
              
              <h3 className="text-lg font-semibold mb-4">Confirm Transaction</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-xl">
                    ${Math.abs(parsedTransaction.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant</span>
                  <span className="font-medium">{parsedTransaction.merchant}</span>
                </div>
                {parsedTransaction.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{parsedTransaction.category}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className={cn(
                    parsedTransaction.confidence > 0.8 ? 'text-emerald-500' : 'text-amber-500'
                  )}>
                    {Math.round(parsedTransaction.confidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

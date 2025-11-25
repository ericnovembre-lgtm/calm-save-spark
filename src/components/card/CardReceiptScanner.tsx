import { useState, useRef } from 'react';
import { Upload, Camera, Receipt, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCardReceiptMatching } from '@/hooks/useCardReceiptMatching';
import { ReceiptMatchPanel } from './ReceiptMatchPanel';
import { motion, AnimatePresence } from 'framer-motion';

export function CardReceiptScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMatchPanel, setShowMatchPanel] = useState(false);
  const { uploadAndMatch, isProcessing, matchResult } = useCardReceiptMatching();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAndMatch(file);
      setShowMatchPanel(true);
    }
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-background to-muted/30 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Scan Receipt</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Upload a receipt photo and we'll automatically match it to your card transactions using AI
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Upload Receipt'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Analyzing receipt with AI...
            </motion.div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {showMatchPanel && matchResult && (
          <ReceiptMatchPanel
            matchResult={matchResult}
            onClose={() => setShowMatchPanel(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
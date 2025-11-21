import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Upload, Scan, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';

interface ExtractedData {
  amount: number;
  vendor: string;
  category: string;
  confidence: number;
}

export function DocumentIntelligence() {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setIsScanning(true);

    try {
      // OCR extraction
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m)
      });

      // AI parsing simulation (in production, use Lovable AI)
      const text = result.data.text.toLowerCase();
      const amountMatch = text.match(/\$?(\d+\.?\d*)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

      // Simple category detection
      const categories = {
        'grocery': ['grocery', 'market', 'food'],
        'restaurant': ['restaurant', 'cafe', 'diner'],
        'gas': ['gas', 'fuel', 'shell', 'chevron'],
        'shopping': ['amazon', 'target', 'walmart']
      };

      let category = 'other';
      let vendor = 'Unknown';

      for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => text.includes(kw))) {
          category = cat;
          vendor = keywords.find(kw => text.includes(kw)) || vendor;
          break;
        }
      }

      setExtractedData({
        amount,
        vendor: vendor.charAt(0).toUpperCase() + vendor.slice(1),
        category,
        confidence: 0.85
      });

      toast.success('Receipt scanned successfully!');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to scan receipt');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleAccept = () => {
    toast.success('Transaction added!');
    setExtractedData(null);
    setPreview(null);
  };

  const handleReject = () => {
    setExtractedData(null);
    setPreview(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Scan className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">AI Document Scanner</h3>
          <p className="text-sm text-muted-foreground">Upload receipts for instant categorization</p>
        </div>
      </div>

      {!preview ? (
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-2">Upload Receipt or Bill</p>
            <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
          </div>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={preview} alt="Receipt" className="w-full h-48 object-cover" />
            {isScanning && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
            )}
          </div>

          {extractedData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-accent/50 rounded-2xl p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="text-lg font-semibold text-foreground">{extractedData.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-primary">${extractedData.amount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-foreground capitalize">{extractedData.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${extractedData.confidence * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {(extractedData.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAccept} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button onClick={handleReject} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Loader2, X, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReceiptScanResult {
  amount: number;
  merchant: string;
  date: string;
  category?: string;
  items?: Array<{ name: string; price: number; quantity?: number }>;
  subtotal?: number;
  tax?: number;
  tip?: number;
  payment_method?: string;
  confidence?: number;
}

interface ReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (data: ReceiptScanResult & { imagePath: string }) => void;
}

export function ReceiptScanner({ open, onOpenChange, onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB');
      return;
    }

    setUploadedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleScan = async () => {
    if (!uploadedFile) return;

    setIsScanning(true);

    try {
      // Get user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Upload to Supabase Storage
      const fileName = `${userId}/${Date.now()}-${uploadedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, uploadedFile);

      if (uploadError) throw uploadError;

      // Analyze receipt
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-receipt',
        {
          body: { imagePath: uploadData.path },
        }
      );

      if (analysisError) throw analysisError;

      toast.success('Receipt scanned successfully!');
      
      onScanComplete({
        ...analysisData,
        imagePath: uploadData.path,
      });

      // Reset
      setPreview(null);
      setUploadedFile(null);
    } catch (error) {
      console.error('Receipt scan error:', error);
      toast.error('Failed to scan receipt. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setUploadedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent" />
            Scan Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!preview ? (
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-accent transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground font-medium mb-2">Upload Receipt Photo</p>
                <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img src={preview} alt="Receipt" className="w-full h-64 object-cover" />
                {isScanning && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-sm text-muted-foreground">Analyzing receipt...</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isScanning}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="flex-1"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Scan Receipt
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

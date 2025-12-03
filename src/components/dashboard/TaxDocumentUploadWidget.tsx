import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ModelAttributionBadge } from '@/components/tax/ModelAttributionBadge';
import { ConfidenceGauge } from '@/components/tax/ConfidenceGauge';
import { cn } from '@/lib/utils';

interface UploadResult {
  documentType: string;
  modelUsed: string;
  confidence: number;
  extractedData: Record<string, any>;
}

export function TaxDocumentUploadWidget() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);

  const processDocument = async (file: File) => {
    setIsUploading(true);
    setProcessingStatus('uploading');
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tax-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      clearInterval(progressInterval);
      setUploadProgress(100);
      setProcessingStatus('processing');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('tax-documents')
        .getPublicUrl(fileName);

      // Process with GPT-5
      const { data, error } = await supabase.functions.invoke('process-tax-document', {
        body: {
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          fileType: file.type,
        },
      });

      if (error) throw error;

      // Save to database
      const parsedData = data.extractedData || {};
      await supabase.from('tax_documents').insert({
        user_id: user.id,
        document_type: data.documentType || 'unknown',
        tax_year: parsedData.tax_year || new Date().getFullYear(),
        file_url: urlData.publicUrl,
        storage_path: fileName,
        processing_status: 'completed',
        parsed_data: {
          ...parsedData,
          model_used: data.modelUsed || 'gpt-5',
          confidence: data.confidence || 85,
          processed_at: new Date().toISOString(),
        },
      });

      setLastResult({
        documentType: data.documentType || 'tax_document',
        modelUsed: data.modelUsed || 'gpt-5',
        confidence: data.confidence || 85,
        extractedData: parsedData,
      });
      setProcessingStatus('complete');
      toast.success('Document analyzed successfully');

    } catch (error: any) {
      console.error('Upload error:', error);
      setProcessingStatus('error');
      toast.error('Failed to process document', { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processDocument(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const resetWidget = () => {
    setProcessingStatus('idle');
    setLastResult(null);
    setUploadProgress(0);
  };

  // Format key extracted values
  const getKeyValues = () => {
    if (!lastResult?.extractedData) return [];
    const { extractedData } = lastResult;
    const keyFields = ['wages', 'federal_income_tax', 'employer_name', 'tax_year', 'total_income', 'dividends'];
    return Object.entries(extractedData)
      .filter(([key]) => keyFields.some(f => key.toLowerCase().includes(f)))
      .slice(0, 3);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Tax Documents
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/tax-analysis')}
            className="text-xs"
          >
            View All
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {processingStatus === 'idle' && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                {...getRootProps()}
                className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className={cn(
                "w-8 h-8 mx-auto mb-3 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Drop your document here' : 'Drop W-2, 1099, or tax documents'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, PNG, JPG • GPT-5 powered analysis
              </p>
              </div>
            </motion.div>
          )}

          {(processingStatus === 'uploading' || processingStatus === 'processing') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center space-y-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 mx-auto"
                >
                  <Loader2 className="w-12 h-12 text-primary" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {processingStatus === 'uploading' ? 'Uploading document...' : 'Analyzing with GPT-5...'}
                </p>
                {processingStatus === 'uploading' && (
                  <Progress value={uploadProgress} className="h-1.5" />
                )}
                {processingStatus === 'processing' && (
                  <p className="text-xs text-muted-foreground">
                    Extracting fields and validating data
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {processingStatus === 'complete' && lastResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {lastResult.documentType.replace(/_/g, ' ')}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={resetWidget} className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <ModelAttributionBadge model={lastResult.modelUsed} size="sm" />
                <ConfidenceGauge confidence={lastResult.confidence} size="sm" />
              </div>

              {getKeyValues().length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {getKeyValues().map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-medium text-foreground">
                        {typeof value === 'number' 
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                          : String(value)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/tax-analysis')}
              >
                View Full Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {processingStatus === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center space-y-3"
            >
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-sm text-destructive font-medium">Failed to process document</p>
              <Button variant="outline" size="sm" onClick={resetWidget}>
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

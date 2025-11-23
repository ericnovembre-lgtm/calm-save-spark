import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, TrendingDown, Target, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBillScanner } from "@/hooks/useBillScanner";
import { ScanningAnimation } from "./ScanningAnimation";
import { cn } from "@/lib/utils";

interface BillScannerProps {
  onScanComplete?: (analysis: any) => void;
}

export function BillScanner({ onScanComplete }: BillScannerProps) {
  const { scanBill, generateRandomBill, isScanning, analysis, clearAnalysis } = useBillScanner();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      scanBill(acceptedFiles[0]);
    }
  }, [scanBill]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <GlassPanel 
        {...getRootProps()} 
        className={cn(
          "p-8 cursor-pointer transition-all",
          isDragActive && "border-accent/50 bg-accent/5"
        )}
      >
        <input {...getInputProps()} />
        
        {isScanning ? (
          <div className="space-y-4">
            <ScanningAnimation />
            <div className="text-center">
              <p className="text-foreground text-sm">
                {analysis ? 'Analyzing document...' : 'Generating scenario...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis ? 'AI is extracting negotiation leverage points' : 'AI is creating realistic bill with hidden fees'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <motion.div
              animate={{
                y: isDragActive ? -10 : 0,
                scale: isDragActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="inline-block p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/20"
            >
              <Upload className="w-12 h-12 text-foreground/60" />
            </motion.div>
            
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Upload Your Bill
              </h3>
              <p className="text-muted-foreground text-sm">
                Drop your PDF bill here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: 5MB
              </p>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassPanel variant="strong" className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-foreground/60" />
                    <h3 className="text-2xl font-bold text-foreground">{analysis.provider}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analysis complete • Opportunities detected
                  </p>
                </div>
                <Badge variant="outline" className="text-lg">
                  ${analysis.amount.toFixed(2)}/mo
                </Badge>
              </div>

              {/* Negotiation Power Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-foreground/60" />
                    Negotiation Power Score
                  </span>
                  <span className="text-lg text-foreground">{analysis.negotiation_score}%</span>
                </div>
                <Progress 
                  value={analysis.negotiation_score} 
                  className="h-2"
                />
              </div>

              {/* Bloat Items */}
              {analysis.bloat_items && analysis.bloat_items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-success" />
                    Removable Fees Detected
                  </h4>
                  <div className="space-y-2">
                    {analysis.bloat_items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-xl"
                      >
                        <span className="text-sm text-foreground">{item.name}</span>
                        <Badge variant="outline" className="border-success/50 text-success">
                          ${item.amount}/mo
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leverage Points */}
              {analysis.leverage_points && analysis.leverage_points.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Your Leverage Points
                  </h4>
                  <div className="space-y-2">
                    {analysis.leverage_points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => onScanComplete?.(analysis)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Generate Script
                </Button>
                <Button 
                  onClick={clearAnalysis}
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* OR Divider */}
      {!analysis && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Generate Sample Bill Button */}
          <Button
            onClick={generateRandomBill}
            variant="outline"
            className="w-full"
            disabled={isScanning}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Sample Bill (AI Demo)
          </Button>
        </>
      )}
    </div>
  );
}

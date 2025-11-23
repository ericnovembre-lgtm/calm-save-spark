import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, TrendingDown, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBillScanner } from "@/hooks/useBillScanner";
import { ScanningAnimation } from "./ScanningAnimation";

interface BillScannerProps {
  onScanComplete?: (analysis: any) => void;
}

export function BillScanner({ onScanComplete }: BillScannerProps) {
  const { scanBill, isScanning, analysis, clearAnalysis } = useBillScanner();

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
      <Card 
        {...getRootProps()} 
        className={`p-8 cursor-pointer transition-all border-2 ${
          isDragActive 
            ? 'border-cyan-400 bg-cyan-950/20' 
            : 'border-slate-700 hover:border-cyan-500/50 bg-slate-900'
        }`}
      >
        <input {...getInputProps()} />
        
        {isScanning ? (
          <div className="space-y-4">
            <ScanningAnimation />
            <div className="text-center">
              <p className="text-cyan-400 font-mono text-sm animate-pulse">
                ANALYZING CONTRACT TERMS...
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
              className="inline-block p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
            >
              <Upload className="w-12 h-12 text-cyan-400" />
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
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-slate-900 border-cyan-500/30 relative overflow-hidden">
            {/* Tactical Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50" />

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="h-px bg-cyan-400 mb-3" />
              ))}
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-2xl font-bold text-foreground">{analysis.provider}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    TARGET ACQUIRED • ANALYSIS COMPLETE
                  </p>
                </div>
                <Badge variant="outline" className="text-lg font-mono border-cyan-500 text-cyan-400">
                  ${analysis.amount.toFixed(2)}/mo
                </Badge>
              </div>

              {/* Negotiation Power Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    NEGOTIATION POWER SCORE
                  </span>
                  <span className="text-lg font-mono text-cyan-400">{analysis.negotiation_score}%</span>
                </div>
                <Progress 
                  value={analysis.negotiation_score} 
                  className="h-2 bg-slate-800"
                />
              </div>

              {/* Bloat Items */}
              {analysis.bloat_items && analysis.bloat_items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    REMOVABLE FEES DETECTED
                  </h4>
                  <div className="space-y-2">
                    {analysis.bloat_items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                      >
                        <span className="text-sm text-foreground">{item.name}</span>
                        <Badge variant="outline" className="border-emerald-500 text-emerald-400 font-mono">
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
                    TACTICAL ADVANTAGES
                  </h4>
                  <div className="space-y-2">
                    {analysis.leverage_points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" />
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
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  Generate Battle Plan
                </Button>
                <Button 
                  onClick={clearAnalysis}
                  variant="outline"
                  className="border-slate-600"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

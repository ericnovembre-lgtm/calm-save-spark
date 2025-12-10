import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface ImportWizardProps {
  onImportComplete: (data: any[]) => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export function ImportWizard({ onImportComplete }: ImportWizardProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (csvFile) {
      setFile(csvFile);
      parseCSV(csvFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const data = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

    setParsedData(data);
    setStep('preview');
  };

  const startImport = async () => {
    setStep('importing');
    
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    onImportComplete(parsedData);
    setStep('complete');
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'upload' && (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop your CSV file here' : 'Drag & drop a CSV file'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports CSV exports from major banks
            </p>
          </div>
        )}

        {step === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {parsedData.length} transactions found
                </p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {Object.keys(parsedData[0] || {}).slice(0, 4).map((key) => (
                        <th key={key} className="text-left p-2 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).slice(0, 4).map((val, j) => (
                          <td key={j} className="p-2 truncate max-w-[150px]">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground bg-muted/50">
                  + {parsedData.length - 10} more rows
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">
                Cancel
              </Button>
              <Button onClick={startImport} className="flex-1">
                Import {parsedData.length} Transactions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'importing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div>
              <p className="font-medium mb-2">Importing transactions...</p>
              <Progress value={progress} className="max-w-xs mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round((progress / 100) * parsedData.length)} of {parsedData.length}
              </p>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-medium">Import Complete!</p>
              <p className="text-muted-foreground">
                Successfully imported {parsedData.length} transactions
              </p>
            </div>
            <Button onClick={reset}>Import More</Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

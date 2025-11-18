import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExportService } from '@/lib/export-service';
import { FileUp, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface ImportCSVDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportedBudget {
  name: string;
  period: string;
  limit: number;
  category_limits?: Record<string, number>;
}

export function ImportCSVDialog({ isOpen, onClose, onImportComplete }: ImportCSVDialogProps) {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const validateBudgetData = (row: any): ImportedBudget | null => {
    try {
      // Validate required fields
      if (!row.name || !row.period || !row.limit) {
        throw new Error('Missing required fields: name, period, or limit');
      }

      // Validate period
      const validPeriods = ['weekly', 'monthly', 'annual'];
      if (!validPeriods.includes(row.period.toLowerCase())) {
        throw new Error(`Invalid period: ${row.period}. Must be weekly, monthly, or annual`);
      }

      // Validate limit is a number
      const limit = parseFloat(row.limit);
      if (isNaN(limit) || limit <= 0) {
        throw new Error('Limit must be a positive number');
      }

      return {
        name: row.name.trim(),
        period: row.period.toLowerCase(),
        limit,
        category_limits: {},
      };
    } catch (error) {
      return null;
    }
  };

  const importBudgets = async (budgets: ImportedBudget[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const budget of budgets) {
      try {
        const { error } = await supabase
          .from('user_budgets')
          .insert({
            user_id: user.id,
            name: budget.name,
            period: budget.period,
            total_limit: budget.limit,
            category_limits: budget.category_limits || {},
          });

        if (error) throw error;
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push(`Failed to import "${budget.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { successCount, failedCount, errors };
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    try {
      // Parse CSV
      const data = await ExportService.parseCSV(file);
      
      if (data.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Validate and transform data
      const validBudgets: ImportedBudget[] = [];
      const validationErrors: string[] = [];

      data.forEach((row, index) => {
        const budget = validateBudgetData(row);
        if (budget) {
          validBudgets.push(budget);
        } else {
          validationErrors.push(`Row ${index + 2}: Invalid data format`);
        }
      });

      if (validBudgets.length === 0) {
        throw new Error('No valid budget data found in CSV');
      }

      // Import to database
      const result = await importBudgets(validBudgets);

      setImportStatus({
        success: result.successCount,
        failed: result.failedCount,
        errors: [...validationErrors, ...result.errors],
      });

      if (result.successCount > 0) {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${result.successCount} budget(s)`,
        });
        onImportComplete();
      }

      if (result.failedCount > 0 || validationErrors.length > 0) {
        toast({
          title: 'Import Completed with Errors',
          description: `${result.failedCount} budget(s) failed to import`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import CSV',
        variant: 'destructive',
      });
      setImportStatus({
        success: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    disabled: isImporting,
  });

  const handleClose = () => {
    setImportStatus(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Budgets from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            } ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <FileUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            {isImporting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Importing budgets...</p>
              </div>
            ) : isDragActive ? (
              <p className="text-sm">Drop CSV file here...</p>
            ) : (
              <div>
                <p className="text-sm font-medium mb-1">
                  Drop CSV file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Import budget data from a CSV file
                </p>
              </div>
            )}
          </div>

          {/* Import Status */}
          {importStatus && (
            <div className="space-y-2">
              {importStatus.success > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {importStatus.success} budget(s)
                  </AlertDescription>
                </Alert>
              )}
              
              {importStatus.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="mb-2">
                      {importStatus.failed > 0 && `${importStatus.failed} budget(s) failed to import:`}
                    </div>
                    <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {importStatus.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                      {importStatus.errors.length > 5 && (
                        <li>• ... and {importStatus.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* CSV Format Guide */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium mb-2">Required CSV Format:</p>
            <code className="text-xs text-muted-foreground block mb-2">
              Name, Period, Limit
            </code>
            <p className="text-xs text-muted-foreground mb-2">Example:</p>
            <code className="text-xs text-muted-foreground block">
              Monthly Budget, monthly, 5000<br />
              Weekly Groceries, weekly, 300<br />
              Annual Savings, annual, 50000
            </code>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

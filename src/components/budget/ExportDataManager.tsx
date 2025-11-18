import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ExportService } from '@/lib/export-service';
import {
  FileDown,
  FileUp,
  FileText,
  Table,
  Archive,
  Printer,
  FileJson,
  Loader2,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ExportDataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: any[];
  transactions?: any[];
  spending: Record<string, any>;
  categories?: any[];
  onImportComplete?: (data: any[]) => void;
}

export function ExportDataManager({
  isOpen,
  onClose,
  budgets,
  transactions = [],
  spending,
  categories = [],
  onImportComplete,
}: ExportDataManagerProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportBudgetsCSV = () => {
    setIsExporting(true);
    try {
      ExportService.exportBudgetsToCSV(budgets, spending);
      toast({
        title: 'Export Successful',
        description: 'Budgets have been exported to CSV',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export budgets',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTransactionsCSV = () => {
    if (transactions.length === 0) {
      toast({
        title: 'No Data',
        description: 'No transactions available to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      ExportService.exportTransactionsToCSV(transactions);
      toast({
        title: 'Export Successful',
        description: 'Transactions have been exported to CSV',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export transactions',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAnalyticsCSV = () => {
    setIsExporting(true);
    try {
      ExportService.exportAnalyticsToCSV(budgets, spending, categories);
      toast({
        title: 'Export Successful',
        description: 'Analytics data has been exported to CSV',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export analytics',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      ExportService.generatePDFReport({
        budgets,
        transactions,
        spending,
        categories,
      });
      toast({
        title: 'PDF Generated',
        description: 'Budget report has been generated',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBackup = () => {
    setIsExporting(true);
    try {
      ExportService.exportFullBackup({
        budgets,
        transactions,
        categories,
      });
      toast({
        title: 'Backup Created',
        description: 'Full account backup has been created',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: error instanceof Error ? error.message : 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow pop-ups.');
      }

      const html = ExportService.generatePrintView({
        budgets,
        transactions,
        spending,
        categories,
      });

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };

      toast({
        title: 'Print View Ready',
        description: 'Opening print preview...',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Print Failed',
        description: error instanceof Error ? error.message : 'Failed to generate print view',
        variant: 'destructive',
      });
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await ExportService.parseCSV(file);
      
      toast({
        title: 'Import Successful',
        description: `Imported ${data.length} rows from CSV`,
      });

      onImportComplete?.(data);
      onClose();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to parse CSV file',
        variant: 'destructive',
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
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export & Data Management</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">CSV Exports</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Export data for analysis in spreadsheet applications
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={handleExportBudgetsCSV}
                    disabled={isExporting || budgets.length === 0}
                    variant="outline"
                    className="justify-start gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Table className="w-4 h-4" />
                    )}
                    Export Budgets CSV
                  </Button>
                  <Button
                    onClick={handleExportTransactionsCSV}
                    disabled={isExporting || transactions.length === 0}
                    variant="outline"
                    className="justify-start gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    Export Transactions CSV
                  </Button>
                  <Button
                    onClick={handleExportAnalyticsCSV}
                    disabled={isExporting || budgets.length === 0}
                    variant="outline"
                    className="justify-start gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Export Analytics CSV
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-medium">PDF Report</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Generate a professional report with charts and tables
                </p>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting || budgets.length === 0}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  Generate PDF Report
                </Button>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-medium">Print View</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Open print-optimized budget report
                </p>
                <Button
                  onClick={handlePrint}
                  disabled={budgets.length === 0}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Open Print View
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Import from CSV</Label>
              <p className="text-xs text-muted-foreground mb-4">
                Import budget data from a CSV file
              </p>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                {isImporting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm">Importing...</p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-sm">Drop CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Drop CSV file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports budget data in CSV format
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium mb-2">Expected CSV Format:</p>
                <code className="text-xs text-muted-foreground block">
                  Name, Period, Limit, Spent, Remaining, Usage %, Created
                </code>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Full Account Backup</Label>
              <p className="text-xs text-muted-foreground mb-4">
                Export all your data including budgets, transactions, and settings
              </p>

              <Button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="w-full gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Create Full Backup
                  </>
                )}
              </Button>

              <div className="mt-6 p-4 border rounded-lg bg-card">
                <div className="flex items-start gap-3">
                  <FileJson className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Backup Contents</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• All budgets and spending data</li>
                      <li>• Transaction history</li>
                      <li>• Category configurations</li>
                      <li>• Goals and pots (if available)</li>
                      <li>• Account preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Backup files are in JSON format and can be stored securely
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileDown, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ExportService } from '@/lib/export-service';
import { useToast } from '@/hooks/use-toast';

interface Column {
  id: string;
  label: string;
  required?: boolean;
  default?: boolean;
}

const EXPORTABLE_COLUMNS: Column[] = [
  { id: 'transaction_date', label: 'Date', required: true, default: true },
  { id: 'merchant', label: 'Merchant', required: true, default: true },
  { id: 'amount', label: 'Amount', required: true, default: true },
  { id: 'category', label: 'Category', default: true },
  { id: 'description', label: 'Description', default: true },
  { id: 'account', label: 'Account', default: false },
  { id: 'recurring', label: 'Recurring', default: false },
  { id: 'confidence', label: 'AI Confidence', default: false },
  { id: 'enriched', label: 'AI Enriched', default: false },
];

interface ExportTransactionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: any[];
  filters?: any;
}

export function ExportTransactionsDialog({
  isOpen,
  onClose,
  transactions,
  filters,
}: ExportTransactionsDialogProps) {
  const { toast } = useToast();
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    EXPORTABLE_COLUMNS.filter(c => c.required || c.default).map(c => c.id)
  );
  const [filename, setFilename] = useState(`transactions-${format(new Date(), 'yyyy-MM-dd')}`);
  const [isExporting, setIsExporting] = useState(false);

  const toggleColumn = (columnId: string) => {
    const column = EXPORTABLE_COLUMNS.find(c => c.id === columnId);
    if (column?.required) return;

    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportTransactionsToCSVCustom(
        transactions,
        selectedColumns,
        `${filename}.csv`
      );
      toast({
        title: 'Export successful',
        description: `${transactions.length} transactions exported to CSV`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportTransactionsToPDF(
        transactions,
        selectedColumns,
        filters,
        `${filename}.pdf`
      );
      toast({
        title: 'Export successful',
        description: `${transactions.length} transactions exported to PDF`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const previewData = transactions.slice(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Export Transactions</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="csv" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">CSV Export</TabsTrigger>
            <TabsTrigger value="pdf">PDF Report</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Select Columns</h3>
              <div className="grid grid-cols-2 gap-3">
                {EXPORTABLE_COLUMNS.map(column => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.id}
                      checked={selectedColumns.includes(column.id)}
                      onCheckedChange={() => toggleColumn(column.id)}
                      disabled={column.required}
                    />
                    <Label
                      htmlFor={column.id}
                      className={column.required ? 'text-muted-foreground' : 'cursor-pointer'}
                    >
                      {column.label}
                      {column.required && ' *'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Preview (first 5 of {transactions.length} transactions)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {selectedColumns.map(colId => (
                        <th key={colId} className="text-left p-2">
                          {EXPORTABLE_COLUMNS.find(c => c.id === colId)?.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((tx, idx) => (
                      <tr key={idx} className="border-b">
                        {selectedColumns.map(colId => (
                          <td key={colId} className="p-2">
                            {colId === 'transaction_date' && format(new Date(tx.transaction_date), 'yyyy-MM-dd')}
                            {colId === 'merchant' && (tx.merchant || 'Unknown')}
                            {colId === 'amount' && `$${Math.abs(tx.amount).toFixed(2)}`}
                            {colId === 'category' && tx.category}
                            {colId === 'description' && tx.description}
                            {colId === 'account' && (tx.connected_accounts?.institution_name || 'N/A')}
                            {colId === 'recurring' && (tx.recurring_metadata ? 'Yes' : 'No')}
                            {colId === 'confidence' && (tx.enrichment_metadata?.confidence || 'N/A')}
                            {colId === 'enriched' && (tx.enrichment_metadata ? 'Yes' : 'No')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button onClick={handleExportCSV} disabled={isExporting} className="w-full">
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export to CSV
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Select Columns</h3>
              <div className="grid grid-cols-2 gap-3">
                {EXPORTABLE_COLUMNS.map(column => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pdf-${column.id}`}
                      checked={selectedColumns.includes(column.id)}
                      onCheckedChange={() => toggleColumn(column.id)}
                      disabled={column.required}
                    />
                    <Label
                      htmlFor={`pdf-${column.id}`}
                      className={column.required ? 'text-muted-foreground' : 'cursor-pointer'}
                    >
                      {column.label}
                      {column.required && ' *'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="pdf-filename">Filename</Label>
              <Input
                id="pdf-filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Report will include:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Summary statistics (total expenses, income, net)</li>
                <li>• Transaction table with selected columns</li>
                <li>• Applied filters (if any)</li>
                <li>• Page numbers and timestamp</li>
              </ul>
            </div>

            <Button onClick={handleExportPDF} disabled={isExporting} className="w-full">
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

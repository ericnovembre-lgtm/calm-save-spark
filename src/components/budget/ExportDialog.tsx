import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { format } from "date-fns";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: any[];
  spending: Record<string, any>;
}

export function ExportDialog({ isOpen, onClose, budgets, spending }: ExportDialogProps) {
  const exportToCSV = () => {
    const csvData = budgets.map(budget => {
      const spend = spending[budget.id];
      return {
        name: budget.name,
        period: budget.period,
        limit: budget.total_limit.toFixed(2),
        spent: (spend?.spent_amount || 0).toFixed(2),
        remaining: (budget.total_limit - (spend?.spent_amount || 0)).toFixed(2),
      };
    });

    const csv = [
      ['Name', 'Period', 'Limit', 'Spent', 'Remaining'],
      ...csvData.map(row => [row.name, row.period, row.limit, row.spent, row.remaining])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Export Budget Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Export your budget data to CSV format for further analysis.
          </p>
          
          <Button onClick={exportToCSV} className="w-full gap-2">
            <FileDown className="w-4 h-4" />
            Download CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

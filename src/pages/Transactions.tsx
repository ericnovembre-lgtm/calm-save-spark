import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";

export default function Transactions() {
  const handleAddTransaction = () => {
    toast.info('Manual transaction entry coming soon!');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon!');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Transactions</h1>
            <p className="text-muted-foreground">Track and manage all your expenses</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddTransaction}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        <TransactionList />
      </div>
    </AppLayout>
  );
}

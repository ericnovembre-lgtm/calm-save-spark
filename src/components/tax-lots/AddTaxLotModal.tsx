import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { CreateTaxLotInput } from "@/hooks/useTaxLots";

interface AddTaxLotModalProps {
  onAddLot: (input: CreateTaxLotInput) => void;
  isAdding: boolean;
}

export function AddTaxLotModal({ onAddLot, isAdding }: AddTaxLotModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    purchase_price: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
    account_name: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddLot({
      symbol: formData.symbol.toUpperCase(),
      quantity: parseFloat(formData.quantity),
      purchase_price: parseFloat(formData.purchase_price),
      purchase_date: formData.purchase_date,
      account_name: formData.account_name || undefined,
      notes: formData.notes || undefined,
    });
    
    setOpen(false);
    setFormData({
      symbol: '',
      quantity: '',
      purchase_price: '',
      purchase_date: format(new Date(), 'yyyy-MM-dd'),
      account_name: '',
      notes: '',
    });
  };

  const costBasis = formData.quantity && formData.purchase_price 
    ? parseFloat(formData.quantity) * parseFloat(formData.purchase_price)
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Tax Lot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tax Lot</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="AAPL"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              required
              className="uppercase"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Shares</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.0001"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Purchase Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                value={formData.purchase_price}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                required
              />
            </div>
          </div>
          
          {costBasis > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cost Basis</p>
              <p className="text-xl font-bold text-foreground">${costBasis.toLocaleString()}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="date">Purchase Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account">Account (Optional)</Label>
            <Input
              id="account"
              placeholder="e.g., Fidelity Brokerage"
              value={formData.account_name}
              onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Tax Lot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

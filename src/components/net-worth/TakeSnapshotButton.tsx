import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Loader2 } from 'lucide-react';
import { AssetBreakdown, LiabilityBreakdown } from '@/hooks/useNetWorthSnapshots';

interface TakeSnapshotButtonProps {
  onSnapshot: (data: {
    total_assets: number;
    total_liabilities: number;
    asset_breakdown?: AssetBreakdown;
    liability_breakdown?: LiabilityBreakdown;
    notes?: string;
    snapshot_type: 'manual';
  }) => void;
  isLoading?: boolean;
  defaultAssets?: number;
  defaultLiabilities?: number;
}

export function TakeSnapshotButton({ 
  onSnapshot, 
  isLoading,
  defaultAssets = 0,
  defaultLiabilities = 0 
}: TakeSnapshotButtonProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState({
    cash: '',
    savings: '',
    investments: '',
    property: '',
    vehicles: '',
    other: '',
  });
  const [liabilities, setLiabilities] = useState({
    credit_cards: '',
    mortgages: '',
    student_loans: '',
    car_loans: '',
    personal_loans: '',
    other: '',
  });
  const [notes, setNotes] = useState('');

  const totalAssets = Object.values(assets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleSubmit = () => {
    const assetBreakdown: AssetBreakdown = {};
    const liabilityBreakdown: LiabilityBreakdown = {};

    Object.entries(assets).forEach(([key, val]) => {
      const num = parseFloat(val);
      if (num > 0) assetBreakdown[key as keyof AssetBreakdown] = num;
    });

    Object.entries(liabilities).forEach(([key, val]) => {
      const num = parseFloat(val);
      if (num > 0) liabilityBreakdown[key as keyof LiabilityBreakdown] = num;
    });

    onSnapshot({
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      asset_breakdown: assetBreakdown,
      liability_breakdown: liabilityBreakdown,
      notes: notes || undefined,
      snapshot_type: 'manual',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-copilot-id="take-snapshot-button">
          <Camera className="w-4 h-4 mr-2" />
          Take Snapshot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Net Worth Snapshot</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assets Section */}
          <div>
            <h3 className="font-medium text-green-500 mb-3">Assets</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(assets).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`asset-${key}`} className="text-xs capitalize">
                    {key.replace('_', ' ')}
                  </Label>
                  <Input
                    id={`asset-${key}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setAssets(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="0.00"
                    className="h-9"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-green-500 mt-2">
              Total Assets: ${totalAssets.toLocaleString()}
            </p>
          </div>

          {/* Liabilities Section */}
          <div>
            <h3 className="font-medium text-red-500 mb-3">Liabilities</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(liabilities).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`liability-${key}`} className="text-xs capitalize">
                    {key.replace('_', ' ')}
                  </Label>
                  <Input
                    id={`liability-${key}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setLiabilities(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="0.00"
                    className="h-9"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-red-500 mt-2">
              Total Liabilities: ${totalLiabilities.toLocaleString()}
            </p>
          </div>

          {/* Net Worth Preview */}
          <div className={`p-4 rounded-lg ${netWorth >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border`}>
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${netWorth.toLocaleString()}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this snapshot..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || totalAssets === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Snapshot'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

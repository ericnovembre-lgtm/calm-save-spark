import { format } from 'date-fns';
import { Bill } from '@/hooks/useBillCalendar';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Calendar, Clock, DollarSign, Bell, CreditCard, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillDetailPopoverProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayNow: (bill: Bill) => void;
  onSetReminder: (bill: Bill) => void;
}

export function BillDetailPopover({ 
  bill, 
  open, 
  onOpenChange, 
  onPayNow, 
  onSetReminder 
}: BillDetailPopoverProps) {
  if (!bill) return null;
  
  const statusColors = {
    overdue: 'text-destructive bg-destructive/10',
    due_today: 'text-orange-600 bg-orange-500/10',
    upcoming: 'text-muted-foreground bg-muted',
    paid: 'text-emerald-600 bg-emerald-500/10',
  };
  
  const statusLabels = {
    overdue: 'Overdue',
    due_today: 'Due Today',
    upcoming: 'Upcoming',
    paid: 'Paid',
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{bill.merchant}</DialogTitle>
          <DialogDescription>
            {bill.category || 'Subscription'} • {bill.frequency || 'Monthly'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              statusColors[bill.status]
            )}>
              {statusLabels[bill.status]}
            </span>
          </div>
          
          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-foreground">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold">${bill.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-3 text-foreground">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Due {format(bill.dueDate, 'MMMM d, yyyy')}</span>
            </div>
            
            {bill.frequency && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>Billed {bill.frequency.toLowerCase()}</span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => onPayNow(bill)}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => onSetReminder(bill)}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full"
              asChild
            >
              <a href={`/subscriptions`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Subscription
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

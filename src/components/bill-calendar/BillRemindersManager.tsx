import { useState } from 'react';
import { Bill } from '@/hooks/useBillCalendar';
import { useBillReminders } from '@/hooks/useBillReminders';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bell, Check } from 'lucide-react';

interface BillRemindersManagerProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reminderOptions = [
  { value: '1', label: '1 day before' },
  { value: '3', label: '3 days before' },
  { value: '7', label: '1 week before' },
  { value: '14', label: '2 weeks before' },
];

export function BillRemindersManager({ bill, open, onOpenChange }: BillRemindersManagerProps) {
  const { setReminder } = useBillReminders();
  const [selectedDays, setSelectedDays] = useState('3');
  const [isSuccess, setIsSuccess] = useState(false);
  
  if (!bill) return null;
  
  const handleSave = async () => {
    await setReminder.mutateAsync({
      subscriptionId: bill.id,
      daysBefore: parseInt(selectedDays),
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onOpenChange(false);
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Set Reminder
          </DialogTitle>
          <DialogDescription>
            Get notified before {bill.merchant} is due
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-foreground font-medium">Reminder Set!</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll be notified {selectedDays} day{selectedDays !== '1' ? 's' : ''} before
            </p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <Label className="text-sm font-medium mb-4 block">
                Remind me:
              </Label>
              
              <RadioGroup
                value={selectedDays}
                onValueChange={setSelectedDays}
                className="space-y-3"
              >
                {reminderOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={`reminder-${option.value}`} />
                    <Label 
                      htmlFor={`reminder-${option.value}`}
                      className="text-foreground cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={setReminder.isPending}>
                {setReminder.isPending ? 'Saving...' : 'Save Reminder'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface Subscription {
  id: string;
  merchant: string;
  amount: number;
  frequency: string;
  next_expected_date: string;
  status?: string;
}

interface CalendarExportProps {
  subscriptions: Subscription[];
}

export function CalendarExport({ subscriptions }: CalendarExportProps) {
  const getRecurrenceRule = (frequency: string): string => {
    switch (frequency.toLowerCase()) {
      case 'weekly':
        return 'RRULE:FREQ=WEEKLY;COUNT=52';
      case 'monthly':
        return 'RRULE:FREQ=MONTHLY;COUNT=12';
      case 'yearly':
      case 'annual':
        return 'RRULE:FREQ=YEARLY;COUNT=5';
      default:
        return 'RRULE:FREQ=MONTHLY;COUNT=12';
    }
  };

  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICS = () => {
    const activeBills = subscriptions.filter(s => s.status !== 'paused');
    
    if (activeBills.length === 0) {
      toast.error('No active subscriptions to export');
      return;
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SavePlus//Bills Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:SavePlus Bills',
      'X-WR-TIMEZONE:UTC'
    ];

    activeBills.forEach(bill => {
      const dueDate = new Date(bill.next_expected_date);
      const dtStart = formatDateForICS(dueDate);
      const amount = Number(bill.amount).toFixed(2);
      
      // Reminder 1 day before
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:bill-${bill.id}@saveplus.app`,
        `DTSTART:${dtStart}`,
        `SUMMARY:${bill.merchant} - $${amount}`,
        `DESCRIPTION:${bill.frequency} bill payment due`,
        `STATUS:CONFIRMED`,
        `SEQUENCE:0`,
        `TRANSP:TRANSPARENT`,
        getRecurrenceRule(bill.frequency),
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${bill.merchant} payment due tomorrow`,
        'END:VALARM',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saveplus-bills-${format(new Date(), 'yyyy-MM-dd')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${activeBills.length} bills to calendar`);
  };

  return (
    <Button
      onClick={generateICS}
      variant="outline"
      size="default"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export Calendar
    </Button>
  );
}

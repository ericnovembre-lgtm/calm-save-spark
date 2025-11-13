import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const scheduledTransferSchema = z.object({
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  potId: z.string().min(1, { message: "Please select a goal" }),
  frequency: z.enum(["weekly", "monthly"], { message: "Please select frequency" }),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(28).optional(),
});

export const ScheduledTransferDialog = () => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPotId, setSelectedPotId] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [dayOfWeek, setDayOfWeek] = useState("1"); // Monday default
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const queryClient = useQueryClient();

  const { data: pots, isLoading } = useQuery({
    queryKey: ['pots-for-scheduled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pots')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (values: {
      potId: string;
      amount: number;
      frequency: "weekly" | "monthly";
      dayOfWeek?: number;
      dayOfMonth?: number;
    }) => {
      // Calculate next transfer date
      const now = new Date();
      const nextDate = new Date();

      if (values.frequency === 'weekly') {
        const currentDay = now.getDay();
        const targetDay = values.dayOfWeek!;
        const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
        nextDate.setDate(now.getDate() + daysUntilNext);
      } else {
        const targetDay = values.dayOfMonth!;
        nextDate.setDate(targetDay);
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
      }

      nextDate.setHours(9, 0, 0, 0); // Set to 9 AM

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('scheduled_transfers')
        .insert({
          user_id: user.id,
          pot_id: values.potId,
          amount: values.amount,
          frequency: values.frequency,
          day_of_week: values.dayOfWeek,
          day_of_month: values.dayOfMonth,
          next_transfer_date: nextDate.toISOString(),
        });

      if (error) throw error;

      // Trigger achievement check for scheduled transfer creation
      try {
        await supabase.functions.invoke('check-achievements', {
          body: {
            userId: user.id,
            eventType: 'scheduled_transfer_created',
            eventData: { amount: values.amount, frequency: values.frequency }
          }
        });
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transfers'] });
      toast.success("Scheduled transfer created!", {
        description: `$${amount} will be transferred ${frequency}`,
      });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create scheduled transfer", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setAmount("");
    setSelectedPotId("");
    setFrequency("monthly");
    setDayOfWeek("1");
    setDayOfMonth("1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = scheduledTransferSchema.safeParse({
      amount: parseFloat(amount),
      potId: selectedPotId,
      frequency,
      dayOfWeek: frequency === "weekly" ? parseInt(dayOfWeek) : undefined,
      dayOfMonth: frequency === "monthly" ? parseInt(dayOfMonth) : undefined,
    });

    if (!validation.success) {
      toast.error("Invalid input", {
        description: validation.error.errors[0].message,
      });
      return;
    }

    scheduleMutation.mutate({
      potId: selectedPotId,
      amount: parseFloat(amount),
      frequency,
      dayOfWeek: frequency === "weekly" ? parseInt(dayOfWeek) : undefined,
      dayOfMonth: frequency === "monthly" ? parseInt(dayOfMonth) : undefined,
    });
  };

  const weekDays = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Recurring Transfer</DialogTitle>
          <DialogDescription>
            Set up automatic contributions to your savings goals
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Select Goal</Label>
            <Select value={selectedPotId} onValueChange={setSelectedPotId} required>
              <SelectTrigger id="goal">
                <SelectValue placeholder="Choose a goal" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading goals...</SelectItem>
                ) : pots && pots.length > 0 ? (
                  pots.map((pot) => (
                    <SelectItem key={pot.id} value={pot.id}>
                      {pot.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No goals available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as "weekly" | "monthly")} required>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "weekly" ? (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Day of Month</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth} required>
                <SelectTrigger id="dayOfMonth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Days 1-28 available (to ensure compatibility with all months)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={scheduleMutation.isPending || !amount || !selectedPotId}
            >
              {scheduleMutation.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
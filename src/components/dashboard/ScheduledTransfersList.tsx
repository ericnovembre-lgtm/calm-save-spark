import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const ScheduledTransfersList = () => {
  const queryClient = useQueryClient();

  const { data: scheduledTransfers, isLoading } = useQuery({
    queryKey: ['scheduled-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_transfers')
        .select(`
          *,
          pots:pot_id (
            name,
            icon
          )
        `)
        .order('next_transfer_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('scheduled_transfers')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transfers'] });
      toast.success("Schedule updated");
    },
    onError: (error) => {
      toast.error("Failed to update schedule", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_transfers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transfers'] });
      toast.success("Scheduled transfer deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete schedule", {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Transfers</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!scheduledTransfers || scheduledTransfers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Transfers</CardTitle>
          <CardDescription>No scheduled transfers yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create a scheduled transfer to automatically contribute to your goals
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDayLabel = (transfer: any) => {
    if (transfer.frequency === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[transfer.day_of_week];
    } else {
      return `Day ${transfer.day_of_month}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Transfers</CardTitle>
        <CardDescription>Manage your automatic contributions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduledTransfers.map((transfer) => {
          const pot = transfer.pots as any;
          return (
            <div
              key={transfer.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{pot?.name}</h4>
                  <Badge variant={transfer.is_active ? "default" : "secondary"}>
                    {transfer.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${parseFloat(String(transfer.amount)).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {transfer.frequency === 'weekly' ? 'Weekly' : 'Monthly'} • {getDayLabel(transfer)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Next transfer: {format(new Date(transfer.next_transfer_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={transfer.is_active}
                  onCheckedChange={() => toggleMutation.mutate({ id: transfer.id, isActive: transfer.is_active })}
                  disabled={toggleMutation.isPending}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(transfer.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
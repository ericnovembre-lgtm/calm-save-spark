import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export const TransferHistory = () => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['transfer-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_history')
        .select(`
          *,
          pots:pot_id (
            name,
            icon
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transfers</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transfers</CardTitle>
          <CardDescription>No transfer history yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your transfer history will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'default';
      case 'scheduled': return 'secondary';
      case 'automated': return 'outline';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transfers</CardTitle>
        <CardDescription>Your latest transfer activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((transfer) => {
          const pot = transfer.pots as any;
          return (
            <div
              key={transfer.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{pot?.name || 'Unknown Goal'}</h4>
                    <Badge variant={getTypeColor(transfer.transfer_type)} className="text-xs">
                      {transfer.transfer_type}
                    </Badge>
                    {transfer.status !== 'completed' && (
                      <Badge variant={getStatusColor(transfer.status)} className="text-xs">
                        {transfer.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(transfer.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                  {transfer.error_message && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {transfer.error_message}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transfer.status === 'failed' ? 'text-destructive' : 'text-foreground'}`}>
                  ${parseFloat(String(transfer.amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
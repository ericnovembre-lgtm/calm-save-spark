import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { TrendingUp, Plus, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STREAM_TYPES = [
  { value: "client_project", label: "Client Projects" },
  { value: "subscription", label: "Subscriptions" },
  { value: "product_sales", label: "Product Sales" },
  { value: "affiliate", label: "Affiliate Income" },
  { value: "royalty", label: "Royalties" },
];

export function IncomeStreams() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    stream_name: "",
    stream_type: "",
    platform: "",
    average_monthly_revenue: "",
  });

  const { data: streams } = useQuery({
    queryKey: ["income-streams"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("business_income_streams" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("average_monthly_revenue", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createStream = useMutation({
    mutationFn: async (stream: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("business_income_streams" as any)
        .insert({
          user_id: user.id,
          ...stream,
          average_monthly_revenue: parseFloat(stream.average_monthly_revenue),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-streams"] });
      toast.success("Income stream added!");
      setDialogOpen(false);
      setFormData({ stream_name: "", stream_type: "", platform: "", average_monthly_revenue: "" });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add stream: ${error.message}`);
    },
  });

  const toggleStream = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("business_income_streams" as any)
        .update({ is_active: !is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-streams"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStream.mutate(formData);
  };

  const totalMonthlyRevenue = streams?.reduce(
    (sum: number, stream: any) => sum + (stream.is_active ? (stream.average_monthly_revenue || 0) : 0),
    0
  ) || 0;

  const activeStreams = streams?.filter((s: any) => s.is_active)?.length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Income Streams Overview
              </CardTitle>
              <CardDescription>Track all your revenue sources in one place</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stream
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Income Stream</DialogTitle>
                  <DialogDescription>Track a new source of business income</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stream_name">Stream Name</Label>
                    <Input
                      id="stream_name"
                      placeholder="e.g., Consulting Services"
                      value={formData.stream_name}
                      onChange={(e) => setFormData({ ...formData, stream_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream_type">Stream Type</Label>
                    <Select
                      value={formData.stream_type}
                      onValueChange={(value) => setFormData({ ...formData, stream_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {STREAM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform (Optional)</Label>
                    <Input
                      id="platform"
                      placeholder="e.g., Upwork, Stripe"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revenue">Average Monthly Revenue ($)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      placeholder="5000"
                      value={formData.average_monthly_revenue}
                      onChange={(e) => setFormData({ ...formData, average_monthly_revenue: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createStream.isPending}>
                    {createStream.isPending ? "Adding..." : "Add Income Stream"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Streams</p>
              <p className="text-3xl font-bold">{activeStreams}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-600">${totalMonthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {streams && streams.length > 0 ? (
          streams.map((stream: any) => (
            <Card key={stream.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{stream.stream_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {STREAM_TYPES.find((t) => t.value === stream.stream_type)?.label || stream.stream_type}
                      </Badge>
                      {stream.platform && (
                        <span className="text-xs text-muted-foreground">via {stream.platform}</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={stream.is_active ? "default" : "secondary"}>
                    {stream.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">${stream.average_monthly_revenue?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStream.mutate({ id: stream.id, is_active: stream.is_active })}
                  >
                    {stream.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No income streams yet</p>
              <p className="text-sm text-muted-foreground">
                Add your revenue sources to track income and improve tax projections
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

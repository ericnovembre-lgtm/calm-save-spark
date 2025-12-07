import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Snowflake, Calendar, Shield } from "lucide-react";
import { format, addDays } from "date-fns";

export function StreakFreezeManager() {
  const [freezeDays, setFreezeDays] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory } = useQuery({
    queryKey: ["streak-freeze-inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("streak_freeze_inventory")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Create initial inventory if it doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from("streak_freeze_inventory")
          .insert({ user_id: user.id, freeze_days_available: 0, freeze_days_used: 0 })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData;
      }

      if (error) throw error;
      return data;
    },
  });

  const { data: activeFreeze } = useQuery({
    queryKey: ["active-freeze"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("streak_freeze_usage")
        .select("*")
        .eq("user_id", user.id)
        .gte("freeze_end_date", new Date().toISOString())
        .order("freeze_end_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const activateFreezeMutation = useMutation({
    mutationFn: async (days: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!inventory || inventory.freeze_days_available < days) {
        throw new Error("Not enough freeze days available");
      }

      // Create freeze usage record
      const freezeStart = new Date();
      const freezeEnd = addDays(freezeStart, days);

      const { error: usageError } = await supabase
        .from("streak_freeze_usage")
        .insert({
          user_id: user.id,
          freeze_start_date: freezeStart.toISOString(),
          freeze_end_date: freezeEnd.toISOString(),
        });

      if (usageError) throw usageError;

      // Update inventory
      const { error: inventoryError } = await supabase
        .from("streak_freeze_inventory")
        .update({
          freeze_days_available: inventory.freeze_days_available - days,
          freeze_days_used: inventory.freeze_days_used + days,
        })
        .eq("user_id", user.id);

      if (inventoryError) throw inventoryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak-freeze-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["active-freeze"] });
      toast({
        title: "Streak Freeze Activated",
        description: `Your streak is now protected for ${freezeDays} day${freezeDays > 1 ? 's' : ''}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const purchaseFreezeMutation = useMutation({
    mutationFn: async (days: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Simulate purchase - in production, integrate with Stripe
      const { error } = await supabase
        .from("streak_freeze_inventory")
        .update({
          freeze_days_available: (inventory?.freeze_days_available || 0) + days,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, days) => {
      queryClient.invalidateQueries({ queryKey: ["streak-freeze-inventory"] });
      toast({
        title: "Freeze Days Purchased",
        description: `You now have ${days} additional freeze day${days > 1 ? 's' : ''}!`,
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-amber-500" />
            Streak Freeze
          </CardTitle>
          <CardDescription>
            Protect your streak during planned absences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {inventory?.freeze_days_available || 0}
              </div>
              <div className="text-xs text-muted-foreground">freeze days</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Used</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {inventory?.freeze_days_used || 0}
              </div>
              <div className="text-xs text-muted-foreground">total days</div>
            </div>
          </div>

          {activeFreeze && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Snowflake className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-foreground">Active Freeze</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your streak is protected until{" "}
                <strong className="text-foreground">
                  {format(new Date(activeFreeze.freeze_end_date), "MMM d, yyyy 'at' h:mm a")}
                </strong>
              </p>
            </div>
          )}

          {!activeFreeze && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="freeze-days">Activate Freeze</Label>
                <div className="flex gap-2">
                  <Input
                    id="freeze-days"
                    type="number"
                    min="1"
                    max={inventory?.freeze_days_available || 0}
                    value={freezeDays}
                    onChange={(e) => setFreezeDays(parseInt(e.target.value) || 1)}
                    disabled={!inventory || inventory.freeze_days_available === 0}
                  />
                  <Button
                    onClick={() => activateFreezeMutation.mutate(freezeDays)}
                    disabled={
                      !inventory ||
                      inventory.freeze_days_available < freezeDays ||
                      activateFreezeMutation.isPending
                    }
                  >
                    Activate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use freeze days to protect your streak during planned breaks
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Get More Freeze Days</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => purchaseFreezeMutation.mutate(1)}
                    disabled={purchaseFreezeMutation.isPending}
                  >
                    +1 Day ($0.99)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => purchaseFreezeMutation.mutate(3)}
                    disabled={purchaseFreezeMutation.isPending}
                  >
                    +3 Days ($2.49)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => purchaseFreezeMutation.mutate(7)}
                    disabled={purchaseFreezeMutation.isPending}
                  >
                    +7 Days ($4.99)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Or earn freeze days by completing challenges and reaching milestones
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

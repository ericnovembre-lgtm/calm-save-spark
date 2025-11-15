import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function SyntheticPaycheck() {
  const queryClient = useQueryClient();

  const { data: paychecks, isLoading } = useQuery({
    queryKey: ["synthetic-paychecks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("synthetic_paychecks" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as any[];
    },
  });

  const calculatePaycheck = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("business-tax-calculator", {
        body: { action: "calculate_paycheck", user_id: user.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["synthetic-paychecks"] });
      toast.success("Paycheck calculated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to calculate paycheck: ${error.message}`);
    },
  });

  const latestPaycheck = paychecks?.[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Synthetic Paycheck
          </CardTitle>
          <CardDescription>
            Convert irregular freelance income into a predictable, steady paycheck with automatic tax withholding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestPaycheck ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Gross Income</p>
                  <p className="text-3xl font-bold">${(latestPaycheck as any).total_income?.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Net Paycheck</p>
                  <p className="text-3xl font-bold text-green-600">${(latestPaycheck as any).net_paycheck?.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Federal Withholding</span>
                  <span className="font-medium">${(latestPaycheck as any).withholding_federal?.toLocaleString()}</span>
                </div>
                <Progress value={((latestPaycheck as any).withholding_federal / (latestPaycheck as any).total_income) * 100} />

                <div className="flex justify-between text-sm">
                  <span>State Withholding</span>
                  <span className="font-medium">${(latestPaycheck as any).withholding_state?.toLocaleString()}</span>
                </div>
                <Progress value={((latestPaycheck as any).withholding_state / (latestPaycheck as any).total_income) * 100} />

                <div className="flex justify-between text-sm">
                  <span>FICA (Social Security & Medicare)</span>
                  <span className="font-medium">${(latestPaycheck as any).withholding_fica?.toLocaleString()}</span>
                </div>
                <Progress value={((latestPaycheck as any).withholding_fica / (latestPaycheck as any).total_income) * 100} />
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Period: {new Date((latestPaycheck as any).period_start).toLocaleDateString()} - {new Date((latestPaycheck as any).period_end).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Method: {(latestPaycheck as any).calculation_method?.replace('_', ' ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No paycheck calculated yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Click below to generate your first synthetic paycheck based on recent income
              </p>
            </div>
          )}

          <Button
            onClick={() => calculatePaycheck.mutate()}
            disabled={calculatePaycheck.isPending}
            className="w-full mt-4"
          >
            {calculatePaycheck.isPending ? "Calculating..." : "Recalculate Paycheck"}
          </Button>
        </CardContent>
      </Card>

      {paychecks && paychecks.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Previous synthetic paychecks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paychecks.slice(1).map((paycheck: any) => (
                <div key={paycheck.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">${paycheck.net_paycheck?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(paycheck.period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${paycheck.total_income?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Gross</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

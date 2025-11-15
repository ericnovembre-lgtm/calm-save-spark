import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calculator, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function TaxProjections() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);

  const { data: projections } = useQuery({
    queryKey: ["tax-projections", currentYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quarterly_tax_projections" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("tax_year", currentYear)
        .order("quarter", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const generateProjections = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("business-tax-calculator", {
        body: { action: "project_quarterly_taxes", user_id: user.id, tax_year: currentYear },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-projections"] });
      toast.success("Quarterly tax projections updated!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate projections: ${error.message}`);
    },
  });

  const getQuarterStatus = (quarter: number, paymentStatus: string) => {
    if (quarter < currentQuarter) {
      return paymentStatus === "paid" ? "paid" : "overdue";
    } else if (quarter === currentQuarter) {
      return "due";
    }
    return "upcoming";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      paid: { variant: "default", icon: CheckCircle },
      due: { variant: "secondary", icon: Clock },
      overdue: { variant: "destructive", icon: AlertCircle },
      upcoming: { variant: "outline", icon: Clock },
    };

    const config = variants[status] || variants.upcoming;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const totalAnnualTax = projections?.reduce((sum: number, p: any) => sum + (p.total_estimated_tax || 0), 0) || 0;
  const totalPaid = projections?.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {currentYear} Tax Summary
          </CardTitle>
          <CardDescription>
            Projected quarterly tax obligations based on your business income and expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Estimated</p>
                <p className="text-2xl font-bold">${totalAnnualTax.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-orange-600">${(totalAnnualTax - totalPaid).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Annual Progress</span>
                <span>{Math.round((totalPaid / totalAnnualTax) * 100)}%</span>
              </div>
              <Progress value={(totalPaid / totalAnnualTax) * 100} />
            </div>

            <Button
              onClick={() => generateProjections.mutate()}
              disabled={generateProjections.isPending}
              variant="outline"
              className="w-full"
            >
              {generateProjections.isPending ? "Recalculating..." : "Recalculate Projections"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {projections && projections.length > 0 ? (
          projections.map((projection: any) => {
            const status = getQuarterStatus(projection.quarter, projection.payment_status);
            return (
              <Card key={projection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Q{projection.quarter} {currentYear}</CardTitle>
                    {getStatusBadge(status)}
                  </div>
                  <CardDescription>
                    Due: {new Date(projection.due_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Projected Income</p>
                        <p className="text-lg font-semibold">${projection.projected_income?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Projected Expenses</p>
                        <p className="text-lg font-semibold">${projection.projected_expenses?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Federal Tax</span>
                        <span className="font-medium">${projection.estimated_tax_federal?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>State Tax</span>
                        <span className="font-medium">${projection.estimated_tax_state?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Self-Employment Tax</span>
                        <span className="font-medium">${projection.estimated_tax_self_employment?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total Estimated</span>
                        <span>${projection.total_estimated_tax?.toLocaleString()}</span>
                      </div>
                      {projection.amount_paid > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Amount Paid</span>
                          <span className="font-medium">${projection.amount_paid?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No tax projections yet</p>
              <Button onClick={() => generateProjections.mutate()} disabled={generateProjections.isPending}>
                {generateProjections.isPending ? "Generating..." : "Generate Tax Projections"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

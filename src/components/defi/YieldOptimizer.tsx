import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function YieldOptimizer() {
  const { data: opportunities, refetch } = useQuery({
    queryKey: ["yield-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("defi-yield-optimizer");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Yield Optimization Opportunities</CardTitle>
              <CardDescription>Autonomous scanning of DeFi protocols for better APY</CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline">Scan Now</Button>
          </div>
        </CardHeader>
        <CardContent>
          {opportunities?.opportunities?.length > 0 ? (
            <div className="space-y-4">
              {opportunities.opportunities.map((opp: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{opp.asset}</Badge>
                      <span className="text-sm text-muted-foreground">{opp.action}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <TrendingUp className="h-4 w-4" />
                      +{opp.apy_improvement?.toFixed(2)}% APY
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{opp.current_protocol || "New"}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{opp.target_protocol}</span>
                    </div>
                    {opp.estimated_annual_gain && (
                      <span className="text-green-600">+${opp.estimated_annual_gain.toFixed(2)}/year</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No optimization opportunities found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

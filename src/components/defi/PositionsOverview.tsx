import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function PositionsOverview() {
  const { data: positions } = useQuery({
    queryKey: ["defi-positions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("defi_positions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("current_value_usd", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const totalValue = positions?.reduce((sum: number, p: any) => sum + (p.current_value_usd || 0), 0) || 0;
  const avgAPY = positions?.length
    ? positions.reduce((sum: number, p: any) => sum + (p.apy || 0), 0) / positions.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Portfolio Value</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Positions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{positions?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average APY</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{avgAPY.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {positions && positions.length > 0 ? (
          positions.map((position: any) => (
            <Card key={position.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {position.asset_symbol}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{position.protocol}</Badge>
                      <span className="text-xs">{position.position_type}</span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${position.current_value_usd?.toLocaleString()}</p>
                    {position.apy && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {position.apy}% APY
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{Number(position.quantity).toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Price</span>
                    <span className="font-medium">${Number(position.current_price).toFixed(2)}</span>
                  </div>
                  {position.health_factor && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Health Factor</span>
                        <span className={position.health_factor < 1.5 ? "text-red-600 font-medium" : "font-medium"}>
                          {position.health_factor.toFixed(2)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min((position.health_factor / 3) * 100, 100)}
                        className={position.health_factor < 1.5 ? "bg-red-100" : ""}
                      />
                    </div>
                  )}
                  {position.auto_managed && (
                    <Badge variant="secondary" className="w-fit">Autonomously Managed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No DeFi positions yet</p>
              <p className="text-sm text-muted-foreground">
                Connect your wallet and protocols to start tracking positions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

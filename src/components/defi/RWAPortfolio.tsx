import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RWAPortfolio() {
  const { data: holdings } = useQuery({
    queryKey: ["rwa-holdings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("rwa_holdings" as any)
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const totalValue = holdings?.reduce((sum: number, h: any) => sum + (h.current_value_usd || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Total RWA Portfolio Value</CardTitle>
          <CardDescription>Tokenized real-world assets</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
        </CardContent>
      </Card>

      {holdings && holdings.length > 0 ? (
        holdings.map((holding: any) => (
          <Card key={holding.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5" />
                    {holding.asset_name}
                  </CardTitle>
                  <CardDescription className="flex gap-2 mt-1">
                    <Badge variant="outline">{holding.token_symbol}</Badge>
                    <Badge variant="secondary">{holding.asset_type}</Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${holding.current_value_usd?.toLocaleString()}</p>
                  {holding.yield_rate && (
                    <p className="text-sm text-green-600">{holding.yield_rate}% yield</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Issuer</p>
                  <p className="font-medium">{holding.issuer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Liquidity</p>
                  <p className="font-medium capitalize">{holding.liquidity_rating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Landmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No RWA holdings yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

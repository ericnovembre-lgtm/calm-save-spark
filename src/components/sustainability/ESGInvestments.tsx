import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, TrendingUp, Leaf, Users, Shield } from "lucide-react";

export function ESGInvestments() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    investment_name: "",
    ticker_symbol: "",
    amount: "",
    esg_score: "",
    environmental_score: "",
    social_score: "",
    governance_score: "",
  });

  const queryClient = useQueryClient();

  const { data: investments, isLoading } = useQuery({
    queryKey: ['esg-investments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_investments')
        .select('*')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addInvestment = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('esg_investments')
        .insert({
          investment_name: data.investment_name,
          ticker_symbol: data.ticker_symbol,
          amount: parseFloat(data.amount),
          esg_score: data.esg_score ? parseFloat(data.esg_score) : null,
          environmental_score: data.environmental_score ? parseFloat(data.environmental_score) : null,
          social_score: data.social_score ? parseFloat(data.social_score) : null,
          governance_score: data.governance_score ? parseFloat(data.governance_score) : null,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['esg-investments'] });
      toast.success("ESG investment added successfully");
      setOpen(false);
      setFormData({
        investment_name: "",
        ticker_symbol: "",
        amount: "",
        esg_score: "",
        environmental_score: "",
        social_score: "",
        governance_score: "",
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to add investment: ${error.message}`);
    },
  });

  const totalInvested = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0) || 0;
  const avgESGScore = investments?.length 
    ? investments.reduce((sum, inv) => sum + (parseFloat(inv.esg_score?.toString() || '0')), 0) / investments.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total ESG Invested</p>
          <p className="text-3xl font-bold">${totalInvested.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Average ESG Score</p>
          <p className="text-3xl font-bold">{avgESGScore.toFixed(1)}/100</p>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add ESG Investment</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              addInvestment.mutate(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investment_name">Investment Name *</Label>
                  <Input
                    id="investment_name"
                    value={formData.investment_name}
                    onChange={(e) => setFormData({ ...formData, investment_name: e.target.value })}
                    placeholder="Green Energy Fund"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ticker_symbol">Ticker Symbol</Label>
                  <Input
                    id="ticker_symbol"
                    value={formData.ticker_symbol}
                    onChange={(e) => setFormData({ ...formData, ticker_symbol: e.target.value })}
                    placeholder="GREENFUND"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount Invested *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="esg_score">Overall ESG Score (0-100)</Label>
                  <Input
                    id="esg_score"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.esg_score}
                    onChange={(e) => setFormData({ ...formData, esg_score: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="environmental_score">Environmental Score</Label>
                  <Input
                    id="environmental_score"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.environmental_score}
                    onChange={(e) => setFormData({ ...formData, environmental_score: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="social_score">Social Score</Label>
                  <Input
                    id="social_score"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.social_score}
                    onChange={(e) => setFormData({ ...formData, social_score: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="governance_score">Governance Score</Label>
                  <Input
                    id="governance_score"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.governance_score}
                    onChange={(e) => setFormData({ ...formData, governance_score: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={addInvestment.isPending}>
                {addInvestment.isPending ? "Adding..." : "Add Investment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading investments...</p>
          </Card>
        ) : investments?.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No ESG investments yet. Add your first investment to track your impact!
            </p>
          </Card>
        ) : (
          investments?.map((investment) => (
            <Card key={investment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{investment.investment_name}</h3>
                    {investment.ticker_symbol && (
                      <p className="text-sm text-muted-foreground">{investment.ticker_symbol}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {investment.esg_score && (
                        <Badge variant="default">
                          ESG: {parseFloat(investment.esg_score.toString()).toFixed(1)}
                        </Badge>
                      )}
                      {investment.environmental_score && (
                        <Badge variant="secondary">
                          <Leaf className="w-3 h-3 mr-1" />
                          E: {parseFloat(investment.environmental_score.toString()).toFixed(1)}
                        </Badge>
                      )}
                      {investment.social_score && (
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          S: {parseFloat(investment.social_score.toString()).toFixed(1)}
                        </Badge>
                      )}
                      {investment.governance_score && (
                        <Badge variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          G: {parseFloat(investment.governance_score.toString()).toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${parseFloat(investment.amount.toString()).toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

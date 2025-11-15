import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PortfolioAllocation } from "@/components/investments/PortfolioAllocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import { SyncStatusBadge } from "@/components/ui/SyncStatusBadge";
import { EmotionDetectionBar } from "@/components/guardian/EmotionDetectionBar";
import { InterventionModal } from "@/components/guardian/InterventionModal";

export default function Investments() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [interventionData, setInterventionData] = useState<any>(null);
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_type: 'brokerage',
    total_value: 0,
    cost_basis: 0,
  });

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['investment_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-investments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_accounts'] });
      toast.success('Investments synced successfully');
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check for emotional trading before large investments
      if (newAccount.total_value > 5000) {
        const { data: sentimentData, error: sentimentError } = await supabase.functions.invoke(
          'sentiment-analyzer',
          {
            body: {
              context: { marketVolatility: 'normal' },
              transactionData: {
                proposedAmount: newAccount.total_value,
                portfolioValue: totalValue,
                asset: newAccount.account_name,
                recentTransactions: accounts || [],
              },
            },
          }
        );

        if (!sentimentError && sentimentData?.shouldIntervene) {
          const { data: interventionResult } = await supabase.functions.invoke(
            'guardian-intervene',
            {
              body: {
                emotionId: sentimentData.emotionId,
                transactionData: {
                  proposedAmount: newAccount.total_value,
                  asset: newAccount.account_name,
                  emotion: sentimentData.emotion,
                },
              },
            }
          );

          if (interventionResult?.intervention) {
            setInterventionData({
              ...interventionResult.intervention,
              emotion: sentimentData.emotion,
              confidence: sentimentData.confidence,
            });
            throw new Error('INTERVENTION_REQUIRED');
          }
        }
      }

      const { error } = await supabase
        .from('investment_accounts')
        .insert([{
          ...newAccount,
          user_id: user.id,
          gains_losses: newAccount.total_value - newAccount.cost_basis
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_accounts'] });
      setIsAddDialogOpen(false);
      setNewAccount({
        account_name: '',
        account_type: 'brokerage',
        total_value: 0,
        cost_basis: 0,
      });
      toast.success('Investment account added');
    },
    onError: (error: any) => {
      if (error.message === 'INTERVENTION_REQUIRED') {
        setIsAddDialogOpen(false);
      } else {
        toast.error('Failed to add account');
      }
    },
  });

  useEffect(() => {
    const checkCoolingOff = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: activeSession } = await supabase
        .from('cooling_off_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('early_exit_requested', null)
        .gt('end_time', new Date().toISOString())
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (activeSession) {
        navigate('/cooling-off');
      }
    };

    checkCoolingOff();
  }, [navigate]);

  const totalValue = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.total_value)), 0) || 0;
  const totalCostBasis = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.cost_basis || 0)), 0) || 0;
  const totalGains = totalValue - totalCostBasis;
  const gainsPercent = totalCostBasis > 0 ? (totalGains / totalCostBasis) * 100 : 0;

  if (isLoading) return <LoadingState />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <EmotionDetectionBar />

        <InterventionModal
          open={!!interventionData}
          onOpenChange={(open) => !open && setInterventionData(null)}
          emotion={interventionData?.emotion || ''}
          confidence={interventionData?.confidence || 0}
          arguments={interventionData?.arguments || []}
          onPause={() => {
            navigate('/cooling-off');
            setInterventionData(null);
          }}
          onContinue={() => {
            setInterventionData(null);
            setIsAddDialogOpen(true);
          }}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Investments</h1>
            <p className="text-muted-foreground">Track your investment portfolio performance</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Investment Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Account Name</Label>
                    <Input
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                      placeholder="My 401k, Robinhood, etc."
                    />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Select value={newAccount.account_type} onValueChange={(v) => setNewAccount({ ...newAccount, account_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brokerage">Brokerage</SelectItem>
                        <SelectItem value="401k">401(k)</SelectItem>
                        <SelectItem value="ira">IRA</SelectItem>
                        <SelectItem value="roth_ira">Roth IRA</SelectItem>
                        <SelectItem value="stocks">Stocks</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current Value</Label>
                    <Input
                      type="number"
                      value={newAccount.total_value}
                      onChange={(e) => setNewAccount({ ...newAccount, total_value: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Cost Basis (Amount Invested)</Label>
                    <Input
                      type="number"
                      value={newAccount.cost_basis}
                      onChange={(e) => setNewAccount({ ...newAccount, cost_basis: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button 
                    onClick={() => addAccountMutation.mutate()}
                    disabled={addAccountMutation.isPending || !newAccount.account_name}
                    className="w-full"
                  >
                    Add Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Gains/Losses</p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${totalGains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalGains >= 0 ? '+' : ''}${totalGains.toFixed(2)}
              </p>
              {totalGains >= 0 ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Return on Investment</p>
            <p className={`text-3xl font-bold ${gainsPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {gainsPercent >= 0 ? '+' : ''}{gainsPercent.toFixed(2)}%
            </p>
          </Card>
        </div>

        {accounts && accounts.length > 0 && (
          <PortfolioAllocation accounts={accounts} />
        )}

        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">Investment Accounts</h3>
          {accounts?.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No investment accounts yet</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first account to start tracking</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {accounts?.map((account) => {
                const gains = parseFloat(String(account.gains_losses)) || 0;
                const gainsPercent = parseFloat(String(account.cost_basis)) > 0 
                  ? (gains / parseFloat(String(account.cost_basis))) * 100 
                  : 0;

                return (
                  <Card key={account.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{account.account_name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {account.account_type.replace('_', ' ')}
                        </p>
                      </div>
                      {gains >= 0 ? 
                        <TrendingUp className="w-5 h-5 text-green-500" /> : 
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      }
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Value</span>
                        <span className="font-semibold text-foreground">${parseFloat(String(account.total_value)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cost Basis</span>
                        <span className="font-semibold text-foreground">${parseFloat(String(account.cost_basis || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gains/Losses</span>
                        <span className={`font-semibold ${gains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {gains >= 0 ? '+' : ''}${gains.toFixed(2)} ({gainsPercent >= 0 ? '+' : ''}{gainsPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <SyncStatusBadge 
                        lastSynced={account.last_synced}
                        isSyncing={syncMutation.isPending}
                        syncType="investment"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

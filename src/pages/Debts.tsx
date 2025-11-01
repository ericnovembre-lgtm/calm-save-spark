import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { DebtPayoffChart } from "@/components/debt/DebtPayoffChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calculator, Trash2 } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

export default function Debts() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [extraPayment, setExtraPayment] = useState(0);

  const [newDebt, setNewDebt] = useState({
    debt_name: '',
    debt_type: 'credit_card',
    principal_amount: 0,
    current_balance: 0,
    interest_rate: 0,
    minimum_payment: 0,
  });

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('interest_rate', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: simulation, isLoading: simLoading } = useQuery({
    queryKey: ['debt_simulation', strategy, extraPayment],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debt-payoff-simulator`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ strategy, extraPayment })
        }
      );

      if (!response.ok) throw new Error('Simulation failed');
      return response.json();
    },
    enabled: !!debts && debts.length > 0
  });

  const addDebtMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('debts')
        .insert([{
          ...newDebt,
          user_id: user.id,
          payoff_strategy: strategy
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      setIsAddDialogOpen(false);
      setNewDebt({
        debt_name: '',
        debt_type: 'credit_card',
        principal_amount: 0,
        current_balance: 0,
        interest_rate: 0,
        minimum_payment: 0,
      });
      toast.success('Debt added successfully');
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt_simulation'] });
      toast.success('Debt removed');
    },
  });

  const totalDebt = debts?.reduce((sum, d) => sum + parseFloat(String(d.current_balance)), 0) || 0;
  const avgInterest = debts?.length 
    ? debts.reduce((sum, d) => sum + parseFloat(String(d.interest_rate)), 0) / debts.length 
    : 0;

  if (isLoading) return <LoadingState />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Debt Tracker</h1>
            <p className="text-muted-foreground">Manage and pay off your debts strategically</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Debt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Debt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Debt Name</Label>
                  <Input
                    value={newDebt.debt_name}
                    onChange={(e) => setNewDebt({ ...newDebt, debt_name: e.target.value })}
                    placeholder="Credit Card, Student Loan, etc."
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newDebt.debt_type} onValueChange={(v) => setNewDebt({ ...newDebt, debt_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="student_loan">Student Loan</SelectItem>
                      <SelectItem value="mortgage">Mortgage</SelectItem>
                      <SelectItem value="personal_loan">Personal Loan</SelectItem>
                      <SelectItem value="auto_loan">Auto Loan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Balance</Label>
                    <Input
                      type="number"
                      value={newDebt.current_balance}
                      onChange={(e) => setNewDebt({ ...newDebt, current_balance: parseFloat(e.target.value), principal_amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newDebt.interest_rate}
                      onChange={(e) => setNewDebt({ ...newDebt, interest_rate: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Minimum Payment</Label>
                  <Input
                    type="number"
                    value={newDebt.minimum_payment}
                    onChange={(e) => setNewDebt({ ...newDebt, minimum_payment: parseFloat(e.target.value) })}
                  />
                </div>
                <Button 
                  onClick={() => addDebtMutation.mutate()}
                  disabled={addDebtMutation.isPending || !newDebt.debt_name}
                  className="w-full"
                >
                  Add Debt
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Debt</p>
            <p className="text-3xl font-bold text-foreground">${totalDebt.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Avg Interest Rate</p>
            <p className="text-3xl font-bold text-foreground">{avgInterest.toFixed(2)}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Debts</p>
            <p className="text-3xl font-bold text-foreground">{debts?.length || 0}</p>
          </Card>
        </div>

        {debts && debts.length > 0 && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Payoff Strategy</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div>
                  <Label>Strategy</Label>
                  <Select value={strategy} onValueChange={(v: any) => setStrategy(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">Avalanche (Highest Interest First)</SelectItem>
                      <SelectItem value="snowball">Snowball (Smallest Balance First)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Extra Monthly Payment</Label>
                  <Input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {simulation && !simLoading && (
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Time to Payoff</p>
                    <p className="text-xl font-bold text-foreground">{simulation.summary.years_to_payoff} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="text-xl font-bold text-foreground">${simulation.summary.total_interest_paid?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-xl font-bold text-foreground">${simulation.summary.total_paid?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="text-xl font-bold text-foreground">
                      ${(debts.reduce((sum, d) => sum + parseFloat(String(d.minimum_payment)), 0) + extraPayment).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {simulation && !simLoading && (
              <DebtPayoffChart simulation={simulation.simulation} strategy={strategy} />
            )}
          </>
        )}

        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">Your Debts</h3>
          {debts?.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No debts tracked yet</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first debt to start tracking</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {debts?.map((debt) => (
                <Card key={debt.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{debt.debt_name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent capitalize">
                          {debt.debt_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Balance</p>
                          <p className="font-semibold text-foreground">${parseFloat(String(debt.current_balance)).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Interest Rate</p>
                          <p className="font-semibold text-foreground">{debt.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Min Payment</p>
                          <p className="font-semibold text-foreground">${parseFloat(String(debt.minimum_payment)).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDebtMutation.mutate(debt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

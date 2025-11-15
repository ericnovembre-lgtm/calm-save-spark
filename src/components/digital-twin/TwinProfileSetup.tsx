import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TwinProfileSetupProps {
  onComplete: () => void;
}

export function TwinProfileSetup({ onComplete }: TwinProfileSetupProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    age: 30,
    annualIncome: 75000,
    annualExpenses: 60000,
    netWorth: 50000,
    savings: 25000,
    debt: 0,
    lifeStage: 'early-career',
    riskTolerance: 'moderate',
  });

  const createProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('digital_twin_profiles')
        .upsert({
          user_id: user.id,
          current_state: {
            age: data.age,
            annualIncome: data.annualIncome,
            annualExpenses: data.annualExpenses,
            netWorth: data.netWorth,
            savings: data.savings,
            debt: data.debt,
          },
          life_stage: data.lifeStage,
          risk_tolerance: data.riskTolerance,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-twin-profile'] });
      toast.success('Your Digital Twin has been created!');
      onComplete();
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast.error('Failed to create Digital Twin profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile.mutate(formData);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create Your Digital Twin</h2>
        <p className="text-muted-foreground mt-2">
          Tell us about your current financial situation to build your personalized twin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              min={18}
              max={100}
            />
          </div>

          <div>
            <Label htmlFor="lifeStage">Life Stage</Label>
            <Select
              value={formData.lifeStage}
              onValueChange={(value) => setFormData({ ...formData, lifeStage: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="graduate">Recent Graduate</SelectItem>
                <SelectItem value="early-career">Early Career</SelectItem>
                <SelectItem value="mid-career">Mid Career</SelectItem>
                <SelectItem value="senior-career">Senior Career</SelectItem>
                <SelectItem value="pre-retirement">Pre-Retirement</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="income">Annual Income</Label>
            <Input
              id="income"
              type="number"
              value={formData.annualIncome}
              onChange={(e) => setFormData({ ...formData, annualIncome: parseFloat(e.target.value) })}
              min={0}
              step={1000}
            />
          </div>

          <div>
            <Label htmlFor="expenses">Annual Expenses</Label>
            <Input
              id="expenses"
              type="number"
              value={formData.annualExpenses}
              onChange={(e) => setFormData({ ...formData, annualExpenses: parseFloat(e.target.value) })}
              min={0}
              step={1000}
            />
          </div>

          <div>
            <Label htmlFor="netWorth">Net Worth</Label>
            <Input
              id="netWorth"
              type="number"
              value={formData.netWorth}
              onChange={(e) => setFormData({ ...formData, netWorth: parseFloat(e.target.value) })}
              step={1000}
            />
          </div>

          <div>
            <Label htmlFor="savings">Total Savings</Label>
            <Input
              id="savings"
              type="number"
              value={formData.savings}
              onChange={(e) => setFormData({ ...formData, savings: parseFloat(e.target.value) })}
              min={0}
              step={1000}
            />
          </div>

          <div>
            <Label htmlFor="debt">Total Debt</Label>
            <Input
              id="debt"
              type="number"
              value={formData.debt}
              onChange={(e) => setFormData({ ...formData, debt: parseFloat(e.target.value) })}
              min={0}
              step={1000}
            />
          </div>

          <div>
            <Label htmlFor="riskTolerance">Risk Tolerance</Label>
            <Select
              value={formData.riskTolerance}
              onValueChange={(value) => setFormData({ ...formData, riskTolerance: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={createProfile.isPending}
        >
          {createProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Your Twin...
            </>
          ) : (
            'Create Digital Twin'
          )}
        </Button>
      </form>
    </Card>
  );
}

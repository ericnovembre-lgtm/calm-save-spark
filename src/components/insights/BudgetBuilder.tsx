import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const BudgetBuilder = () => {
  const queryClient = useQueryClient();
  const [budgetName, setBudgetName] = useState("");
  const [period, setPeriod] = useState<"monthly" | "weekly" | "annual">("monthly");
  const [totalLimit, setTotalLimit] = useState(3000);
  const [categories, setCategories] = useState<{ [key: string]: number }>({
    "Housing": 30,
    "Food": 15,
    "Transportation": 10,
    "Entertainment": 10,
    "Savings": 20,
    "Other": 15
  });

  const { data: templates } = useQuery({
    queryKey: ['budget_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_templates')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const categoryLimits: { [key: string]: number } = {};
      Object.keys(categories).forEach(cat => {
        categoryLimits[cat] = (totalLimit * categories[cat]) / 100;
      });

      const { error } = await supabase
        .from('user_budgets')
        .insert([{
          user_id: user.id,
          name: budgetName || 'My Budget',
          period,
          total_limit: totalLimit,
          category_limits: categoryLimits,
          is_active: true
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_budgets'] });
      toast.success('Budget created successfully!');
      setBudgetName("");
    },
  });

  const loadTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      const percentages = template.category_percentages as { [key: string]: number };
      setCategories(percentages);
      toast.success(`Loaded ${template.name} template`);
    }
  };

  const addCategory = () => {
    const newCat = `Category ${Object.keys(categories).length + 1}`;
    setCategories({ ...categories, [newCat]: 5 });
  };

  const removeCategory = (cat: string) => {
    const newCategories = { ...categories };
    delete newCategories[cat];
    setCategories(newCategories);
  };

  const updateCategory = (oldName: string, newName: string) => {
    const newCategories = { ...categories };
    newCategories[newName] = newCategories[oldName];
    delete newCategories[oldName];
    setCategories(newCategories);
  };

  const totalPercentage = Object.values(categories).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Create Your Budget</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <Label>Budget Name</Label>
            <Input
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder="My Monthly Budget"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Period</Label>
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Total Limit</Label>
              <Input
                type="number"
                value={totalLimit}
                onChange={(e) => setTotalLimit(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label>Load Template (Optional)</Label>
            <Select onValueChange={loadTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Categories ({totalPercentage.toFixed(0)}% allocated)</Label>
            <Button size="sm" variant="outline" onClick={addCategory}>
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </div>

          {totalPercentage !== 100 && (
            <p className="text-sm text-yellow-500">
              Total should equal 100%. Currently: {totalPercentage.toFixed(0)}%
            </p>
          )}

          {Object.keys(categories).map(cat => (
            <div key={cat} className="space-y-2">
              <div className="flex items-center justify-between">
                <Input
                  value={cat}
                  onChange={(e) => updateCategory(cat, e.target.value)}
                  className="w-40"
                />
                <div className="flex items-center gap-2 flex-1 mx-4">
                  <Slider
                    value={[categories[cat]]}
                    onValueChange={([value]) => setCategories({ ...categories, [cat]: value })}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">
                    {categories[cat]}%
                  </span>
                  <span className="text-sm text-muted-foreground w-20 text-right">
                    ${((totalLimit * categories[cat]) / 100).toFixed(0)}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeCategory(cat)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-6"
          onClick={() => createBudgetMutation.mutate()}
          disabled={createBudgetMutation.isPending || totalPercentage !== 100}
        >
          Create Budget
        </Button>
      </Card>
    </div>
  );
};

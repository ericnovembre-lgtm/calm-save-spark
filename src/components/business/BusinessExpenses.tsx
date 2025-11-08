import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Receipt, Sparkles } from "lucide-react";
import { format } from "date-fns";

const TAX_CATEGORIES = [
  "office_supplies", "equipment", "travel", "meals", "utilities",
  "rent", "insurance", "professional_services", "marketing",
  "software", "payroll", "other"
];

export function BusinessExpenses({ businessProfileId }: { businessProfileId: string }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    tax_category: "",
    tax_deductible: false,
    expense_date: new Date().toISOString().split('T')[0],
    vendor_id: "",
  });
  const [aiCategorizing, setAiCategorizing] = useState(false);

  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['business-expenses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('business_expenses')
        .select('*, vendors(vendor_name)')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const categorizeWithAI = async () => {
    if (!formData.description || !formData.amount) {
      toast.error("Please enter description and amount first");
      return;
    }

    setAiCategorizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('categorize-business-expense', {
        body: {
          description: formData.description,
          amount: formData.amount,
        },
      });

      if (error) throw error;

      setFormData({
        ...formData,
        tax_category: data.category,
        tax_deductible: data.tax_deductible,
      });
      toast.success("Expense categorized by AI");
    } catch (error: any) {
      toast.error(`AI categorization failed: ${error.message}`);
    } finally {
      setAiCategorizing(false);
    }
  };

  const createExpense = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('business_expenses')
        .insert({
          business_profile_id: businessProfileId,
          amount: parseFloat(data.amount),
          description: data.description,
          category: data.category,
          tax_category: data.tax_category as any || null,
          tax_deductible: data.tax_deductible,
          expense_date: data.expense_date,
          vendor_id: data.vendor_id || null,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['business-stats'] });
      toast.success("Expense added successfully");
      setOpen(false);
      setFormData({
        amount: "",
        description: "",
        category: "",
        tax_category: "",
        tax_deductible: false,
        expense_date: new Date().toISOString().split('T')[0],
        vendor_id: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to add expense: ${error.message}`);
    },
  });

  const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0) || 0;
  const deductibleExpenses = expenses?.filter(e => e.tax_deductible).reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Tax Deductible</p>
            <p className="text-2xl font-bold text-green-600">${deductibleExpenses.toFixed(2)}</p>
          </Card>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Business Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createExpense.mutate(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
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
                  <Label htmlFor="expense_date">Date *</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vendor_id">Vendor</Label>
                  <Select value={formData.vendor_id} onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Office Supplies"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="tax_category">Tax Category</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={categorizeWithAI}
                      disabled={aiCategorizing}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {aiCategorizing ? "Categorizing..." : "AI Categorize"}
                    </Button>
                  </div>
                  <Select value={formData.tax_category} onValueChange={(value) => setFormData({ ...formData, tax_category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.tax_deductible}
                      onChange={(e) => setFormData({ ...formData, tax_deductible: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Tax Deductible</span>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={createExpense.isPending}>
                {createExpense.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading expenses...</p>
          </Card>
        ) : expenses?.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No expenses yet. Add your first expense to get started.</p>
          </Card>
        ) : (
          expenses?.map((expense) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{expense.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {expense.vendors?.vendor_name || 'No vendor'} • {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {expense.tax_category && (
                        <Badge variant="secondary">
                          {expense.tax_category.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      {expense.tax_deductible && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Tax Deductible
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${parseFloat(expense.amount.toString()).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{expense.currency}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

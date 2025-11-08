import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Plus, Award, BookOpen, DollarSign, TrendingDown } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

export default function Student() {
  const queryClient = useQueryClient();
  const [addScholarshipOpen, setAddScholarshipOpen] = useState(false);
  const [addLoanOpen, setAddLoanOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .single();
      
      return data;
    },
  });

  const { data: scholarships } = useQuery({
    queryKey: ['scholarships'],
    queryFn: async () => {
      const { data } = await supabase
        .from('scholarships')
        .select('*')
        .order('award_date', { ascending: false });
      
      return data || [];
    },
  });

  const { data: loans } = useQuery({
    queryKey: ['student-loans'],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_loans')
        .select('*')
        .order('created_at', { ascending: false });
      
      return data || [];
    },
  });

  const { data: budgetTemplates } = useQuery({
    queryKey: ['student-budget-templates'],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_budget_templates')
        .select('*');
      
      return data || [];
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('student_profiles')
        .insert([{ user_id: user.id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Student profile created!');
    },
  });

  const addScholarshipMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('scholarships')
        .insert([{ ...data, user_id: user.id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      setAddScholarshipOpen(false);
      toast.success('Scholarship added!');
    },
    onError: () => {
      toast.error('Failed to add scholarship');
    },
  });

  const addLoanMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('student_loans')
        .insert([{ ...data, user_id: user.id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-loans'] });
      setAddLoanOpen(false);
      toast.success('Loan added!');
    },
    onError: () => {
      toast.error('Failed to add loan');
    },
  });

  if (profileLoading) return <LoadingState />;

  const totalScholarships = scholarships?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
  const totalLoans = loans?.reduce((sum, l) => sum + Number(l.current_balance), 0) || 0;
  const avgInterestRate = loans?.length 
    ? loans.reduce((sum, l) => sum + Number(l.interest_rate), 0) / loans.length 
    : 0;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Student Hub
            </h1>
            <p className="text-muted-foreground">
              Manage scholarships, loans, and student budgets
            </p>
          </div>

          {!profile && (
            <Button onClick={() => createProfileMutation.mutate()}>
              <GraduationCap className="w-4 h-4 mr-2" />
              Activate Student Mode
            </Button>
          )}
        </div>

        {!profile ? (
          <Card className="p-12 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Activate Student Features</h3>
            <p className="text-muted-foreground mb-4">
              Create a student profile to access scholarships, loan tracking, and student budgets
            </p>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Award className="w-10 h-10 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ${totalScholarships.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Scholarships</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-10 h-10 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ${totalLoans.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Loans</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-10 h-10 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {avgInterestRate.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Interest Rate</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="scholarships" className="space-y-4">
              <TabsList>
                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                <TabsTrigger value="loans">Loans</TabsTrigger>
                <TabsTrigger value="budgets">Budget Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="scholarships" className="space-y-3">
                <div className="flex justify-end mb-4">
                  <Dialog open={addScholarshipOpen} onOpenChange={setAddScholarshipOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Scholarship
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Scholarship</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        addScholarshipMutation.mutate({
                          name: formData.get('name'),
                          provider: formData.get('provider'),
                          amount: parseFloat(formData.get('amount') as string),
                          status: 'awarded',
                        });
                      }} className="space-y-4">
                        <div>
                          <Label>Scholarship Name</Label>
                          <Input name="name" required />
                        </div>
                        <div>
                          <Label>Provider</Label>
                          <Input name="provider" />
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <Input name="amount" type="number" step="0.01" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={addScholarshipMutation.isPending}>
                          Add Scholarship
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {scholarships?.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No scholarships added yet. Track your awards here.
                    </p>
                  </Card>
                ) : (
                  scholarships?.map((scholarship) => (
                    <Card key={scholarship.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {scholarship.name}
                          </h3>
                          {scholarship.provider && (
                            <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
                          )}
                          <Badge variant="secondary" className="mt-2">
                            {scholarship.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${Number(scholarship.amount).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="loans" className="space-y-3">
                <div className="flex justify-end mb-4">
                  <Dialog open={addLoanOpen} onOpenChange={setAddLoanOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Loan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Student Loan</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const principal = parseFloat(formData.get('principal') as string);
                        addLoanMutation.mutate({
                          loan_name: formData.get('loan_name'),
                          lender: formData.get('lender'),
                          principal_amount: principal,
                          current_balance: principal,
                          interest_rate: parseFloat(formData.get('interest_rate') as string),
                          status: 'in_school',
                        });
                      }} className="space-y-4">
                        <div>
                          <Label>Loan Name</Label>
                          <Input name="loan_name" required />
                        </div>
                        <div>
                          <Label>Lender</Label>
                          <Input name="lender" />
                        </div>
                        <div>
                          <Label>Principal Amount</Label>
                          <Input name="principal" type="number" step="0.01" required />
                        </div>
                        <div>
                          <Label>Interest Rate (%)</Label>
                          <Input name="interest_rate" type="number" step="0.01" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={addLoanMutation.isPending}>
                          Add Loan
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {loans?.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No student loans tracked yet.
                    </p>
                  </Card>
                ) : (
                  loans?.map((loan) => (
                    <Card key={loan.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {loan.loan_name}
                          </h3>
                          {loan.lender && (
                            <p className="text-sm text-muted-foreground">{loan.lender}</p>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {loan.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            ${Number(loan.current_balance).toFixed(0)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Number(loan.interest_rate).toFixed(2)}% APR
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Repayment Progress</span>
                          <span className="font-medium text-foreground">
                            {((1 - Number(loan.current_balance) / Number(loan.principal_amount)) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={(1 - Number(loan.current_balance) / Number(loan.principal_amount)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="budgets" className="space-y-3">
                {budgetTemplates?.map((template) => {
                  const allocations = template.category_allocations as any;
                  return (
                    <Card key={template.id} className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="text-xl font-bold text-foreground mt-2">
                          ${Number(template.total_budget).toFixed(0)}/month
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(allocations).map(([category, percent]: [string, any]) => (
                          <div key={category} className="bg-muted/30 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground capitalize mb-1">
                              {category.replace('_', ' ')}
                            </div>
                            <div className="font-semibold text-foreground">{percent}%</div>
                            <div className="text-xs text-muted-foreground">
                              ${((Number(template.total_budget) * percent) / 100).toFixed(0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
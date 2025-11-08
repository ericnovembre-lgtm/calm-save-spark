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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UsersRound, Plus, DollarSign, TrendingUp, Users } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

export default function Family() {
  const queryClient = useQueryClient();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"parent" | "child" | "partner">("partner");

  const { data: myGroups, isLoading } = useQuery({
    queryKey: ['family-groups'],
    queryFn: async () => {
      const { data: memberships } = await supabase
        .from('family_members')
        .select('family_group_id, role, family_groups(*)')
        .order('joined_at', { ascending: false });
      
      return memberships?.map(m => ({
        ...m.family_groups,
        myRole: m.role,
      })) || [];
    },
  });

  const { data: groupMembers } = useQuery<Array<{
    id: string;
    role: 'parent' | 'child' | 'partner';
    joined_at: string;
    user_id: string;
    profile?: { id: string; full_name: string | null; email: string | null };
  }>>({
    queryKey: ['family-members', myGroups?.[0]?.id],
    queryFn: async () => {
      if (!myGroups?.[0]?.id) return [];
      
      const { data } = await supabase
        .from('family_members')
        .select('id, role, joined_at, user_id')
        .eq('family_group_id', myGroups[0].id);
      
      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        // Merge data
        return data.map(member => ({
          ...member,
          profile: profiles?.find(p => p.id === member.user_id),
        }));
      }
      
      return data || [];
    },
    enabled: !!myGroups?.[0]?.id,
  });

  const { data: familyBudgets } = useQuery({
    queryKey: ['family-budgets', myGroups?.[0]?.id],
    queryFn: async () => {
      if (!myGroups?.[0]?.id) return [];
      
      const { data } = await supabase
        .from('family_budgets')
        .select('*')
        .eq('family_group_id', myGroups[0].id)
        .eq('is_active', true);
      
      return data || [];
    },
    enabled: !!myGroups?.[0]?.id,
  });

  const { data: familyExpenses } = useQuery<Array<{
    id: string;
    family_group_id: string;
    user_id: string;
    amount: number;
    category: string;
    description: string;
    expense_date: string;
    created_at: string;
    profile?: { id: string; full_name: string | null };
  }>>({
    queryKey: ['family-expenses', myGroups?.[0]?.id],
    queryFn: async () => {
      if (!myGroups?.[0]?.id) return [];
      
      const { data } = await supabase
        .from('family_expenses')
        .select('*')
        .eq('family_group_id', myGroups[0].id)
        .order('expense_date', { ascending: false })
        .limit(10);
      
      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(e => e.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        // Merge data
        return data.map(expense => ({
          ...expense,
          profile: profiles?.find(p => p.id === expense.user_id),
        }));
      }
      
      return data || [];
    },
    enabled: !!myGroups?.[0]?.id,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: group, error: groupError } = await supabase
        .from('family_groups')
        .insert([{ name, created_by: user.id }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as parent
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_group_id: group.id,
          user_id: user.id,
          role: 'parent',
          permissions: { can_view: true, can_edit: true, can_delete: true },
        }]);

      if (memberError) throw memberError;
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      setCreateGroupOpen(false);
      setNewGroupName("");
      toast.success('Family group created successfully!');
    },
    onError: () => {
      toast.error('Failed to create family group');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!myGroups?.[0]?.id) throw new Error('No family group');

      // Find user by email
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!profiles) throw new Error('User not found');

      const { error } = await supabase
        .from('family_members')
        .insert([{
          family_group_id: myGroups[0].id,
          user_id: profiles.id,
          role: role as 'parent' | 'child' | 'partner',
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setAddMemberOpen(false);
      setNewMemberEmail("");
      toast.success('Family member added!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add family member');
    },
  });

  if (isLoading) return <LoadingState />;

  const currentGroup = myGroups?.[0];
  const totalBudget = familyBudgets?.reduce((sum, b) => sum + Number(b.total_limit), 0) || 0;
  const totalExpenses = familyExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Family Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage shared budgets and household finances
            </p>
          </div>

          {!currentGroup ? (
            <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Family Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Family Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Group Name</Label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="The Smith Family"
                    />
                  </div>
                  <Button
                    onClick={() => createGroupMutation.mutate(newGroupName)}
                    disabled={!newGroupName || createGroupMutation.isPending}
                    className="w-full"
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="member@example.com"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={newMemberRole} onValueChange={(v: any) => setNewMemberRole(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => addMemberMutation.mutate({ email: newMemberEmail, role: newMemberRole })}
                    disabled={!newMemberEmail || addMemberMutation.isPending}
                    className="w-full"
                  >
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!currentGroup ? (
          <Card className="p-12 text-center">
            <UsersRound className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Family Group Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a family group to start tracking shared expenses and budgets
            </p>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-10 h-10 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {groupMembers?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Family Members</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-10 h-10 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ${totalBudget.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-10 h-10 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ${totalExpenses.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="members" className="space-y-4">
              <TabsList>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="budgets">Budgets</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-3">
                {groupMembers?.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {member.profile?.full_name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.profile?.email || 'No email'}
                        </p>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="budgets" className="space-y-3">
                {familyBudgets?.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No family budgets yet. Parents can create shared budgets.
                    </p>
                  </Card>
                ) : (
                  familyBudgets?.map((budget) => (
                    <Card key={budget.id} className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{budget.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            ${Number(budget.total_limit).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="expenses" className="space-y-3">
                {familyExpenses?.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No expenses tracked yet. Start adding family expenses.
                    </p>
                  </Card>
                ) : (
                  familyExpenses?.map((expense) => (
                    <Card key={expense.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{expense.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              by {expense.profile?.full_name || 'Unknown'}
                            </span>
                          </div>
                          {expense.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {expense.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          ${Number(expense.amount).toFixed(2)}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
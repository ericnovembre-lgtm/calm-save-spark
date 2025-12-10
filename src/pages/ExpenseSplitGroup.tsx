import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users, UserPlus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseList } from '@/components/expense-split/ExpenseList';
import { AddExpenseModal } from '@/components/expense-split/AddExpenseModal';
import { useSplitGroup, useSplitExpenses } from '@/hooks/useSplitGroups';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpenseSplitGroup() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const [showAddExpense, setShowAddExpense] = useState(false);

  const { data: group, isLoading: groupLoading } = useSplitGroup(groupId);
  const { data: expenses, isLoading: expensesLoading } = useSplitExpenses(groupId);

  const isLoading = groupLoading || expensesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-24 bg-muted rounded-xl animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Group not found</p>
          <Link to="/expense-split">
            <Button className="mt-4">Back to Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24" data-copilot-id="expense-split-group-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link 
          to="/expense-split" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>

        {/* Group Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${group.color}20` }}
            >
              {group.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{group.members?.length || 0} members</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/50 bg-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Members</h2>
            <Button variant="ghost" size="sm">
              <UserPlus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.members?.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                  {(member.nickname || member.email || 'U')[0].toUpperCase()}
                </div>
                <span>{member.nickname || member.email || 'Member'}</span>
                {member.user_id === user?.id && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Add Expense Button */}
        <Button onClick={() => setShowAddExpense(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>

        {/* Expenses List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Expenses</h2>
            <span className="text-sm text-muted-foreground">
              {expenses?.length || 0} total
            </span>
          </div>
          <ExpenseList expenses={expenses || []} currentUserId={user?.id} />
        </div>
      </div>

      {group.members && (
        <AddExpenseModal
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          groupId={group.id}
          members={group.members}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplitGroupCard } from '@/components/expense-split/SplitGroupCard';
import { CreateGroupModal } from '@/components/expense-split/CreateGroupModal';
import { useSplitGroups } from '@/hooks/useSplitGroups';

export default function ExpenseSplit() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: groups, isLoading } = useSplitGroups();

  // Calculate total balances
  const totalOwed = groups?.reduce((sum, g) => sum + Math.max(0, g.your_balance || 0), 0) || 0;
  const totalOwing = groups?.reduce((sum, g) => sum + Math.abs(Math.min(0, g.your_balance || 0)), 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-12 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24" data-copilot-id="expense-split-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Expense Split
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Split bills with friends and roommates
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Group
          </Button>
        </motion.div>

        {/* Balance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeftRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">You are owed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${totalOwed.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeftRight className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">You owe</span>
            </div>
            <p className="text-2xl font-bold text-red-500">${totalOwing.toFixed(2)}</p>
          </div>
        </motion.div>

        {/* Groups List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Groups</h2>
          {groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group, index) => (
                <SplitGroupCard key={group.id} group={group} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 rounded-xl border border-dashed border-border"
            >
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No groups yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                Create a group to start splitting expenses
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

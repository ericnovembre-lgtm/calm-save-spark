import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BackupData {
  transactions: any[];
  goals: any[];
  budgets: any[];
  debts: any[];
  pots: any[];
  exportedAt: string;
}

export function useDataPortability() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const createFullBackup = useMutation({
    mutationFn: async (): Promise<BackupData> => {
      if (!userId) throw new Error('Not authenticated');

      // Fetch all user data in parallel
      const [transactions, goals, budgets, debts, pots] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('user_budgets').select('*').eq('user_id', userId),
        supabase.from('debts').select('*').eq('user_id', userId),
        supabase.from('pots').select('*').eq('user_id', userId),
      ]);

      const backup: BackupData = {
        transactions: transactions.data || [],
        goals: goals.data || [],
        budgets: budgets.data || [],
        debts: debts.data || [],
        pots: pots.data || [],
        exportedAt: new Date().toISOString(),
      };

      // Create downloadable JSON
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `saveplus-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return backup;
    },
    onSuccess: () => {
      toast.success('Backup downloaded successfully');
    },
    onError: () => {
      toast.error('Failed to create backup');
    },
  });

  const restoreFromBackup = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error('Not authenticated');

      const content = await file.text();
      const backup: BackupData = JSON.parse(content);

      // Validate backup structure
      if (!backup.exportedAt || !backup.transactions) {
        throw new Error('Invalid backup file format');
      }

      // Restore data (with user_id override for security)
      let restored = 0;

      if (backup.transactions.length > 0) {
        const { error } = await supabase
          .from('transactions')
          .upsert(backup.transactions.map(t => ({ ...t, user_id: userId })));
        if (!error) restored += backup.transactions.length;
      }

      if (backup.goals.length > 0) {
        const { error } = await supabase
          .from('goals')
          .upsert(backup.goals.map(g => ({ ...g, user_id: userId })));
        if (!error) restored += backup.goals.length;
      }

      return { restored, backup };
    },
    onSuccess: ({ restored }) => {
      toast.success(`Restored ${restored} records from backup`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to restore backup');
    },
  });

  return {
    createFullBackup,
    restoreFromBackup,
    isBackingUp: createFullBackup.isPending,
    isRestoring: restoreFromBackup.isPending,
  };
}

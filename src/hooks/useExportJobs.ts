import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, subMonths } from 'date-fns';

export interface ExportJob {
  id: string;
  user_id: string;
  export_type: string;
  format: string;
  status: string;
  date_range_start: string | null;
  date_range_end: string | null;
  filters: any;
  file_url: string | null;
  file_size: number | null;
  created_at: string;
  expires_at: string | null;
}

interface CreateExportInput {
  export_type: string;
  format: string;
  date_range_start?: string;
  date_range_end?: string;
  filters?: any;
}

export function useExportJobs() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['export-jobs', userId],
    queryFn: async (): Promise<ExportJob[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const createExport = useMutation({
    mutationFn: async (input: CreateExportInput) => {
      if (!userId) throw new Error('Not authenticated');

      // Create export job
      const { data: job, error } = await supabase
        .from('export_jobs')
        .insert({
          user_id: userId,
          ...input,
          status: 'processing',
        })
        .select()
        .single();

      if (error) throw error;

      // Generate export based on type
      const dateStart = input.date_range_start || format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      const dateEnd = input.date_range_end || format(new Date(), 'yyyy-MM-dd');

      let exportData: any[] = [];

      if (input.export_type === 'transactions') {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', dateStart)
          .lte('transaction_date', dateEnd)
          .order('transaction_date', { ascending: false });

        exportData = transactions || [];
      }

      // Generate CSV content
      if (exportData.length > 0 && input.format === 'csv') {
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => 
          Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        
        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        // Update job with file info
        await supabase
          .from('export_jobs')
          .update({
            status: 'completed',
            file_url: url,
            file_size: csv.length,
          })
          .eq('id', job.id);
      }

      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
      toast.success('Export created');
    },
    onError: () => {
      toast.error('Failed to create export');
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('export_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
      toast.success('Export deleted');
    },
  });

  return {
    jobs: jobs || [],
    isLoading,
    createExport,
    deleteJob,
  };
}

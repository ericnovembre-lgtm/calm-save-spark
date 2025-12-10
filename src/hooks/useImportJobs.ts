import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ImportJob {
  id: string;
  user_id: string;
  job_type: string;
  status: string;
  file_name: string | null;
  file_size: number | null;
  total_rows: number | null;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  error_log: any[];
  mapping_config: any;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface CreateImportInput {
  job_type: string;
  file_name: string;
  file_size?: number;
  total_rows?: number;
  mapping_config?: any;
}

export function useImportJobs() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['import-jobs', userId],
    queryFn: async (): Promise<ImportJob[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []).map(job => ({
        ...job,
        error_log: Array.isArray(job.error_log) ? job.error_log : []
      }));
    },
    enabled: !!userId,
  });

  const createJob = useMutation({
    mutationFn: async (input: CreateImportInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('import_jobs')
        .insert({
          user_id: userId,
          ...input,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
    },
  });

  const updateJob = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ImportJob> & { id: string }) => {
      const { data, error } = await supabase
        .from('import_jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('import_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      toast.success('Import job deleted');
    },
  });

  return {
    jobs: jobs || [],
    isLoading,
    createJob,
    updateJob,
    deleteJob,
  };
}

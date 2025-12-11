/**
 * Trigger.dev Background Jobs Client
 * 
 * Provides job submission and status tracking for long-running AI tasks
 */

import { supabase } from '@/integrations/supabase/client';

const PROJECT_ID = import.meta.env.VITE_TRIGGER_PROJECT_ID || 'proj_uagtulyzkhbvrbvrtzlb';

export type JobType = 
  | 'monte-carlo-simulation'
  | 'batch-categorization'
  | 'financial-report'
  | 'portfolio-optimization'
  | 'debt-analysis'
  | 'tax-document-processing';

export interface JobPayload {
  type: JobType;
  data: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, unknown>;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit a background job to Trigger.dev via edge function
 */
export async function submitJob(payload: JobPayload): Promise<{ jobId: string }> {
  const { data, error } = await supabase.functions.invoke('trigger-job', {
    body: {
      action: 'submit',
      payload,
    },
  });

  if (error) {
    throw new Error(`Failed to submit job: ${error.message}`);
  }

  return { jobId: data.jobId };
}

/**
 * Get the status of a background job
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const { data, error } = await supabase.functions.invoke('trigger-job', {
    body: {
      action: 'status',
      jobId,
    },
  });

  if (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }

  return data.status;
}

/**
 * Cancel a running job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('trigger-job', {
    body: {
      action: 'cancel',
      jobId,
    },
  });

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }
}

/**
 * Get project ID for debugging/display
 */
export function getProjectId(): string {
  return PROJECT_ID;
}

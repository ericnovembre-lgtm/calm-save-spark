import { useState, useCallback, useEffect, useRef } from 'react';
import { submitJob, getJobStatus, cancelJob, type JobPayload, type JobStatus } from '@/lib/trigger';

interface UseTriggerJobOptions {
  pollInterval?: number;
  onComplete?: (result: unknown) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for submitting and tracking Trigger.dev background jobs
 */
export function useTriggerJob(options: UseTriggerJobOptions = {}) {
  const { pollInterval = 2000, onComplete, onError } = options;
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const submit = useCallback(async (payload: JobPayload) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { jobId: newJobId } = await submitJob(payload);
      setJobId(newJobId);
      return newJobId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit job';
      setError(message);
      onError?.(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [onError]);

  const cancel = useCallback(async () => {
    if (!jobId) return;
    
    try {
      await cancelJob(jobId);
      setJobId(null);
      setStatus(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel job';
      setError(message);
    }
  }, [jobId]);

  const reset = useCallback(() => {
    setJobId(null);
    setStatus(null);
    setError(null);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Poll for status updates when job is active
  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const newStatus = await getJobStatus(jobId);
        setStatus(newStatus);

        if (newStatus.status === 'completed') {
          onComplete?.(newStatus.result);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } else if (newStatus.status === 'failed') {
          onError?.(newStatus.error || 'Job failed');
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
      }
    };

    // Initial poll
    poll();

    // Set up polling interval
    pollRef.current = setInterval(poll, pollInterval);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [jobId, pollInterval, onComplete, onError]);

  return {
    jobId,
    status,
    isSubmitting,
    isRunning: status?.status === 'running' || status?.status === 'pending',
    isComplete: status?.status === 'completed',
    isFailed: status?.status === 'failed',
    progress: status?.progress,
    result: status?.result,
    error,
    submit,
    cancel,
    reset,
  };
}

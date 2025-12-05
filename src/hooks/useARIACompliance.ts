import { useState, useEffect, useCallback, useRef } from 'react';
import { runFullAudit, runQuickAudit, type AuditResult, type AuditSummary } from '@/lib/aria-audit';

type Severity = 'error' | 'warning' | 'info';

interface UseARIAComplianceOptions {
  /** Whether to run checks automatically */
  autoCheck?: boolean;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Minimum severity to report */
  minSeverity?: Severity;
  /** Use quick audit (critical errors only) */
  quickMode?: boolean;
}

interface UseARIAComplianceReturn {
  /** Audit summary with all results */
  summary: AuditSummary | null;
  /** List of failed audit results */
  issues: AuditResult[];
  /** Whether a check is currently running */
  isChecking: boolean;
  /** Last check timestamp */
  lastChecked: Date | null;
  /** Compliance score (0-100) */
  score: number;
  /** Run accessibility check manually */
  runCheck: () => void;
  /** Clear all issues */
  clearIssues: () => void;
  /** Get issues by severity */
  getIssuesBySeverity: (severity: Severity) => AuditResult[];
  /** Count of issues by severity */
  issueCounts: Record<Severity, number>;
}

/**
 * Hook for real-time ARIA compliance checking.
 * Runs accessibility audits on the DOM and reports issues.
 */
export function useARIACompliance({
  autoCheck = false,
  debounceMs = 1000,
  minSeverity = 'info',
  quickMode = false,
}: UseARIAComplianceOptions = {}): UseARIAComplianceReturn {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout>>();
  const observerRef = useRef<MutationObserver>();

  const severityOrder: Severity[] = ['info', 'warning', 'error'];
  const minSeverityIndex = severityOrder.indexOf(minSeverity);

  const filterResults = useCallback((results: AuditResult[]) => {
    return results.filter(result => {
      if (result.passed) return false;
      const resultSeverityIndex = severityOrder.indexOf(result.severity);
      return resultSeverityIndex >= minSeverityIndex;
    });
  }, [minSeverityIndex]);

  const runCheck = useCallback(() => {
    setIsChecking(true);
    
    // Run checks asynchronously to not block UI
    requestAnimationFrame(() => {
      const auditSummary = quickMode ? runQuickAudit() : runFullAudit();
      setSummary(auditSummary);
      setLastChecked(new Date());
      setIsChecking(false);
    });
  }, [quickMode]);

  const debouncedCheck = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(runCheck, debounceMs);
  }, [runCheck, debounceMs]);

  const clearIssues = useCallback(() => {
    setSummary(null);
    setLastChecked(null);
  }, []);

  const issues = summary ? filterResults(summary.results) : [];

  const getIssuesBySeverity = useCallback((severity: Severity) => {
    return issues.filter(issue => issue.severity === severity);
  }, [issues]);

  const score = summary?.score ?? 100;

  // Issue counts by severity
  const issueCounts: Record<Severity, number> = {
    info: getIssuesBySeverity('info').length,
    warning: getIssuesBySeverity('warning').length,
    error: getIssuesBySeverity('error').length,
  };

  // Set up auto-checking with MutationObserver
  useEffect(() => {
    if (!autoCheck) return;

    // Initial check
    runCheck();

    // Set up observer for DOM changes
    observerRef.current = new MutationObserver(() => {
      debouncedCheck();
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'tabindex'],
    });

    return () => {
      observerRef.current?.disconnect();
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [autoCheck, runCheck, debouncedCheck]);

  return {
    summary,
    issues,
    isChecking,
    lastChecked,
    score,
    runCheck,
    clearIssues,
    getIssuesBySeverity,
    issueCounts,
  };
}

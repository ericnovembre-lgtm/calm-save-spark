/**
 * Accessibility Testing Utilities
 * Phase 9: CI/CD Integration
 */

import { runFullAudit, runQuickAudit, type AuditResult, type AuditSummary } from '@/lib/aria-audit';

export const WCAG_LEVELS = {
  A: ['wcag2a', 'wcag21a'],
  AA: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  AAA: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'],
} as const;

export function runAccessibilityAudit(quick = false): AuditSummary {
  return quick ? runQuickAudit() : runFullAudit();
}

export function checkAuditPasses(summary: AuditSummary, minScore = 80): boolean {
  return summary.score >= minScore;
}

export function getViolationsBySeverity(
  results: AuditResult[],
  severity: 'error' | 'warning' | 'info'
): AuditResult[] {
  return results.filter((r) => !r.passed && r.severity === severity);
}

export function formatViolationsForCI(summary: AuditSummary): string {
  const failed = summary.results.filter((r) => !r.passed);
  if (failed.length === 0) return '✅ No accessibility violations found';

  return failed.map((v, i) => 
    `${i + 1}. [${v.severity.toUpperCase()}] ${v.name}\n   WCAG: ${v.wcagCriteria || 'N/A'}`
  ).join('\n');
}

export function generateCIReport(summary: AuditSummary): object {
  return {
    timestamp: new Date().toISOString(),
    score: summary.score,
    totalChecks: summary.totalChecks,
    passed: summary.passed,
    failed: summary.failed,
  };
}

export type { AuditResult, AuditSummary };

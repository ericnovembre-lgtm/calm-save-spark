import { useMemo } from 'react';

/**
 * Hook to generate speakable text summaries from component data
 * Formats financial data and content for natural voice synthesis
 */
export function useSpeakableText() {
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} million dollars`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)} thousand dollars`;
    }
    return `${amount.toFixed(0)} dollars`;
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(0)} percent`;
  };

  const formatScore = (score: number): string => {
    const rating = 
      score >= 80 ? 'excellent' :
      score >= 60 ? 'good' :
      score >= 40 ? 'fair' : 'needs improvement';
    return `${score} out of 100, rated ${rating}`;
  };

  return useMemo(() => ({
    formatCurrency,
    formatPercent,
    formatScore,
    
    // Generate insight summary
    generateInsightSummary: (text: string, actionLabel?: string) => {
      let summary = `AI Insight: ${text}`;
      if (actionLabel) {
        summary += ` You can ${actionLabel.toLowerCase()} to take action.`;
      }
      return summary;
    },

    // Generate nudge summary
    generateNudgeSummary: (message: string, nudgeType: string) => {
      return `Important notification: ${message}. This is a ${nudgeType.replace('_', ' ')} alert.`;
    },

    // Generate actions summary
    generateActionsSummary: (actions: Array<{ label: string; savings?: number }>) => {
      if (actions.length === 0) return 'No smart actions available at this time.';
      
      let summary = `You have ${actions.length} smart action${actions.length > 1 ? 's' : ''} available. `;
      actions.forEach((action, index) => {
        summary += `${index + 1}. ${action.label}`;
        if (action.savings) {
          summary += `, which could save you ${formatCurrency(action.savings)} per month`;
        }
        summary += '. ';
      });
      return summary;
    },

    // Generate health score summary
    generateHealthSummary: (
      compositeScore: number,
      creditScore: number,
      savingsRate: number,
      debtToIncome: number
    ) => {
      return `Your financial health score is ${formatScore(compositeScore)}. ` +
        `Your credit score is ${creditScore}. ` +
        `You're saving ${formatPercent(savingsRate)} of your income. ` +
        `Your debt to income ratio is ${formatPercent(debtToIncome)}.`;
    },

    // Generate report summary
    generateReportSummary: (
      reportMonth: string,
      sectionsCount: number
    ) => {
      return `Monthly financial report for ${reportMonth}. ` +
        `This report includes ${sectionsCount} section${sectionsCount > 1 ? 's' : ''}.`;
    },
  }), []);
}

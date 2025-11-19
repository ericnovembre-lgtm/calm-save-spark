/**
 * Web Worker for Heavy Calculations
 * Phase 6: Advanced Performance Features
 * 
 * Offloads CPU-intensive calculations to background thread
 * to keep UI responsive
 */

interface WorkerMessage {
  type: string;
  data: any;
  id: string;
}

interface WorkerResponse {
  type: 'RESULT' | 'ERROR';
  result?: any;
  error?: string;
  id: string;
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data, id } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'CALCULATE_FINANCIAL_HEALTH':
        result = calculateFinancialHealth(data);
        break;
        
      case 'CALCULATE_DEBT_PAYOFF':
        result = calculateDebtPayoff(data);
        break;
        
      case 'CALCULATE_GOAL_PROJECTIONS':
        result = calculateGoalProjections(data);
        break;
        
      case 'ANALYZE_SPENDING_PATTERNS':
        result = analyzeSpendingPatterns(data);
        break;
        
      default:
        throw new Error(`Unknown calculation type: ${type}`);
    }
    
    const response: WorkerResponse = {
      type: 'RESULT',
      result,
      id,
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      id,
    };
    
    self.postMessage(response);
  }
});

/**
 * Calculate financial health score based on multiple factors
 */
function calculateFinancialHealth(data: {
  income: number;
  expenses: number;
  savings: number;
  debts: number;
  emergencyFund: number;
}): { score: number; factors: Record<string, number> } {
  const { income, expenses, savings, debts, emergencyFund } = data;
  
  // Calculate individual factors (0-100)
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const debtToIncomeRatio = income > 0 ? 100 - (debts / income) * 100 : 0;
  const expenseRatio = income > 0 ? 100 - (expenses / income) * 100 : 0;
  const emergencyFundScore = Math.min((emergencyFund / (expenses * 6)) * 100, 100);
  
  // Weighted average
  const score = Math.round(
    savingsRate * 0.3 +
    debtToIncomeRatio * 0.3 +
    expenseRatio * 0.2 +
    emergencyFundScore * 0.2
  );
  
  return {
    score: Math.max(0, Math.min(100, score)),
    factors: {
      savingsRate: Math.round(savingsRate),
      debtToIncomeRatio: Math.round(debtToIncomeRatio),
      expenseRatio: Math.round(expenseRatio),
      emergencyFundScore: Math.round(emergencyFundScore),
    },
  };
}

/**
 * Calculate debt payoff timeline using avalanche method
 */
function calculateDebtPayoff(data: {
  debts: Array<{ balance: number; interestRate: number; minPayment: number }>;
  extraPayment: number;
}): { months: number; totalInterest: number; schedule: any[] } {
  const { debts, extraPayment } = data;
  const schedule: any[] = [];
  let remainingDebts = debts.map(d => ({ ...d }));
  let month = 0;
  let totalInterest = 0;
  
  while (remainingDebts.some(d => d.balance > 0) && month < 600) {
    month++;
    
    // Sort by interest rate (highest first)
    remainingDebts.sort((a, b) => b.interestRate - a.interestRate);
    
    // Calculate interest and minimum payments
    remainingDebts.forEach(debt => {
      if (debt.balance > 0) {
        const interest = (debt.balance * debt.interestRate) / 12 / 100;
        totalInterest += interest;
        debt.balance += interest;
        debt.balance -= debt.minPayment;
      }
    });
    
    // Apply extra payment to highest interest debt
    let remainingExtra = extraPayment;
    for (const debt of remainingDebts) {
      if (debt.balance > 0 && remainingExtra > 0) {
        const payment = Math.min(remainingExtra, debt.balance);
        debt.balance -= payment;
        remainingExtra -= payment;
        if (remainingExtra <= 0) break;
      }
    }
    
    // Remove paid off debts
    remainingDebts = remainingDebts.filter(d => d.balance > 0);
    
    schedule.push({
      month,
      remainingDebt: remainingDebts.reduce((sum, d) => sum + d.balance, 0),
      totalInterest: Math.round(totalInterest),
    });
  }
  
  return {
    months: month,
    totalInterest: Math.round(totalInterest),
    schedule: schedule.filter((_, i) => i % 6 === 0), // Sample every 6 months
  };
}

/**
 * Calculate goal projections with compound interest
 */
function calculateGoalProjections(data: {
  currentAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  interestRate: number;
}): { months: number; projectedAmount: number; timeline: any[] } {
  const { currentAmount, targetAmount, monthlyContribution, interestRate } = data;
  const timeline: any[] = [];
  let amount = currentAmount;
  let month = 0;
  
  while (amount < targetAmount && month < 600) {
    month++;
    amount += monthlyContribution;
    amount += (amount * interestRate) / 12 / 100;
    
    if (month % 3 === 0) {
      timeline.push({
        month,
        amount: Math.round(amount),
        contributed: Math.round(currentAmount + monthlyContribution * month),
      });
    }
  }
  
  return {
    months: month,
    projectedAmount: Math.round(amount),
    timeline,
  };
}

/**
 * Analyze spending patterns for insights
 */
function analyzeSpendingPatterns(data: {
  transactions: Array<{ amount: number; category: string; date: string }>;
}): { categoryTotals: Record<string, number>; trends: any[] } {
  const { transactions } = data;
  const categoryTotals: Record<string, number> = {};
  const monthlyTotals: Record<string, number> = {};
  
  transactions.forEach(tx => {
    // Category totals
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    
    // Monthly totals
    const month = tx.date.substring(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
  });
  
  const trends = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total: Math.round(total) }));
  
  return {
    categoryTotals: Object.fromEntries(
      Object.entries(categoryTotals).map(([k, v]) => [k, Math.round(v)])
    ),
    trends,
  };
}

// Export type for TypeScript
export {};

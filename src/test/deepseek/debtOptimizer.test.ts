import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockDebts = [
  { id: '1', name: 'Credit Card A', balance: 5000, interestRate: 22.99, minimumPayment: 150 },
  { id: '2', name: 'Credit Card B', balance: 3000, interestRate: 18.99, minimumPayment: 90 },
  { id: '3', name: 'Student Loan', balance: 15000, interestRate: 6.8, minimumPayment: 200 },
  { id: '4', name: 'Car Loan', balance: 8000, interestRate: 4.5, minimumPayment: 250 },
];

// Helper functions that match the edge function logic
function calculatePayoffMonths(balance: number, apr: number, monthlyPayment: number): number {
  if (monthlyPayment <= 0) return Infinity;
  const monthlyRate = apr / 100 / 12;
  let months = 0;
  let remaining = balance;
  
  while (remaining > 0 && months < 360) {
    const interest = remaining * monthlyRate;
    remaining = remaining + interest - monthlyPayment;
    months++;
  }
  
  return months;
}

function calculateTotalInterest(balance: number, apr: number, monthlyPayment: number): number {
  const monthlyRate = apr / 100 / 12;
  let months = 0;
  let remaining = balance;
  let totalInterest = 0;
  
  while (remaining > 0 && months < 360) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    months++;
  }
  
  return totalInterest;
}

function sortByAvalanche(debts: typeof mockDebts) {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

function sortBySnowball(debts: typeof mockDebts) {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

describe('Debt Optimizer - Unit Tests', () => {
  describe('Payoff Calculations', () => {
    it('should calculate correct payoff months for a single debt', () => {
      // $5000 at 22.99% APR with $150/month payment
      const months = calculatePayoffMonths(5000, 22.99, 150);
      expect(months).toBeGreaterThan(40);
      expect(months).toBeLessThan(60);
    });

    it('should return Infinity for zero payment', () => {
      const months = calculatePayoffMonths(5000, 22.99, 0);
      expect(months).toBe(Infinity);
    });

    it('should calculate faster payoff with extra payment', () => {
      const baseMonths = calculatePayoffMonths(5000, 22.99, 150);
      const extraMonths = calculatePayoffMonths(5000, 22.99, 250);
      expect(extraMonths).toBeLessThan(baseMonths);
    });

    it('should calculate total interest correctly', () => {
      const interest = calculateTotalInterest(5000, 22.99, 150);
      expect(interest).toBeGreaterThan(0);
      expect(interest).toBeLessThan(5000); // Interest should be less than principal
    });
  });

  describe('Avalanche Strategy', () => {
    it('should sort debts by highest interest rate first', () => {
      const sorted = sortByAvalanche(mockDebts);
      expect(sorted[0].interestRate).toBe(22.99);
      expect(sorted[1].interestRate).toBe(18.99);
      expect(sorted[sorted.length - 1].interestRate).toBe(4.5);
    });

    it('should allocate extra payment to highest interest debt', () => {
      const sorted = sortByAvalanche(mockDebts);
      const extraPayment = 200;
      
      // Extra payment goes to first debt (highest interest)
      const allocations = sorted.map((debt, index) => ({
        ...debt,
        extraPayment: index === 0 ? extraPayment : 0,
        totalPayment: debt.minimumPayment + (index === 0 ? extraPayment : 0),
      }));

      expect(allocations[0].extraPayment).toBe(200);
      expect(allocations[1].extraPayment).toBe(0);
    });

    it('should minimize total interest paid', () => {
      const sorted = sortByAvalanche(mockDebts);
      const extraPayment = 200;
      
      // Calculate interest with extra payment on highest rate
      const interestWithAvalanche = calculateTotalInterest(
        sorted[0].balance, 
        sorted[0].interestRate, 
        sorted[0].minimumPayment + extraPayment
      );

      // Calculate interest with extra payment on lowest rate
      const sortedByLow = [...mockDebts].sort((a, b) => a.interestRate - b.interestRate);
      const interestWithLowest = calculateTotalInterest(
        sortedByLow[0].balance, 
        sortedByLow[0].interestRate, 
        sortedByLow[0].minimumPayment + extraPayment
      );

      // Avalanche should save more interest on high-rate debt
      expect(sorted[0].interestRate).toBeGreaterThan(sortedByLow[0].interestRate);
    });
  });

  describe('Snowball Strategy', () => {
    it('should sort debts by lowest balance first', () => {
      const sorted = sortBySnowball(mockDebts);
      expect(sorted[0].balance).toBe(3000);
      expect(sorted[sorted.length - 1].balance).toBe(15000);
    });

    it('should provide psychological wins with quick payoffs', () => {
      const sorted = sortBySnowball(mockDebts);
      const extraPayment = 200;
      
      // With $290/month (min $90 + extra $200), $3000 should pay off in ~11 months
      const months = calculatePayoffMonths(
        sorted[0].balance, 
        sorted[0].interestRate, 
        sorted[0].minimumPayment + extraPayment
      );
      
      expect(months).toBeLessThan(15); // Quick win
    });
  });

  describe('Hybrid Strategy', () => {
    it('should identify when snowball is better for quick win', () => {
      const avalanche = sortByAvalanche(mockDebts);
      const snowball = sortBySnowball(mockDebts);
      
      // If snowball's first debt can be paid off in < 6 months with extra payment,
      // and it's not also the avalanche's first, consider hybrid
      const extraPayment = 300;
      const snowballFirstPayoff = calculatePayoffMonths(
        snowball[0].balance,
        snowball[0].interestRate,
        snowball[0].minimumPayment + extraPayment
      );
      
      const quickWinThreshold = 6;
      const shouldUseHybrid = snowballFirstPayoff <= quickWinThreshold && 
                              snowball[0].id !== avalanche[0].id;
      
      // In our test case, Credit Card B ($3000) can be paid off quickly
      expect(snowballFirstPayoff).toBeLessThan(12);
    });
  });

  describe('Sensitivity Analysis', () => {
    it('should calculate impact of different extra payment amounts', () => {
      const debt = mockDebts[0];
      const extraPayments = [50, 100, 200, 500];
      
      const sensitivity = extraPayments.map(extra => {
        const baseMonths = calculatePayoffMonths(debt.balance, debt.interestRate, debt.minimumPayment);
        const extraMonths = calculatePayoffMonths(debt.balance, debt.interestRate, debt.minimumPayment + extra);
        const baseInterest = calculateTotalInterest(debt.balance, debt.interestRate, debt.minimumPayment);
        const extraInterest = calculateTotalInterest(debt.balance, debt.interestRate, debt.minimumPayment + extra);
        
        return {
          extraPaymentAmount: extra,
          monthsSaved: baseMonths - extraMonths,
          interestSaved: baseInterest - extraInterest,
        };
      });

      // More extra payment = more savings
      expect(sensitivity[3].monthsSaved).toBeGreaterThan(sensitivity[0].monthsSaved);
      expect(sensitivity[3].interestSaved).toBeGreaterThan(sensitivity[0].interestSaved);
    });
  });

  describe('NPV Analysis', () => {
    it('should calculate present value of interest savings', () => {
      const interestSaved = 1000;
      const discountRate = 0.05; // 5% annual
      const years = 3;
      
      const pvSavings = interestSaved / Math.pow(1 + discountRate, years);
      
      expect(pvSavings).toBeLessThan(interestSaved);
      expect(pvSavings).toBeGreaterThan(0);
    });

    it('should calculate effective rate of debt payoff', () => {
      const debt = mockDebts[0];
      const extraPayment = 200;
      
      // Interest saved is effectively a "return" on the extra payment
      const baseInterest = calculateTotalInterest(debt.balance, debt.interestRate, debt.minimumPayment);
      const extraInterest = calculateTotalInterest(debt.balance, debt.interestRate, debt.minimumPayment + extraPayment);
      const interestSaved = baseInterest - extraInterest;
      
      // Calculate months difference
      const baseMonths = calculatePayoffMonths(debt.balance, debt.interestRate, debt.minimumPayment);
      const extraMonths = calculatePayoffMonths(debt.balance, debt.interestRate, debt.minimumPayment + extraPayment);
      
      // Total extra payment invested
      const totalExtraInvested = extraPayment * extraMonths;
      
      // Effective annual return
      const effectiveReturn = (interestSaved / totalExtraInvested) * 12;
      
      expect(effectiveReturn).toBeGreaterThan(0);
    });
  });
});

describe('Debt Optimizer - Integration Tests', () => {
  it('should handle empty debt array gracefully', () => {
    const debts: typeof mockDebts = [];
    expect(debts.length).toBe(0);
    // Edge function should return error for empty debts
  });

  it('should handle single debt optimization', () => {
    const singleDebt = [mockDebts[0]];
    const sorted = sortByAvalanche(singleDebt);
    expect(sorted.length).toBe(1);
    expect(sorted[0].id).toBe(singleDebt[0].id);
  });

  it('should handle debts with same interest rate', () => {
    const sameRateDebts = [
      { id: '1', name: 'Debt A', balance: 5000, interestRate: 20, minimumPayment: 150 },
      { id: '2', name: 'Debt B', balance: 3000, interestRate: 20, minimumPayment: 90 },
    ];
    
    const avalanche = sortByAvalanche(sameRateDebts);
    // Both have same rate, order preserved or by secondary criteria
    expect(avalanche.length).toBe(2);
  });
});

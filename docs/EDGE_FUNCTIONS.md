# Next-Gen Edge Functions Guide

Complete guide to $ave+'s autonomous backend services.

---

## 📖 Quick Reference

| Function | Purpose | Call Frequency | Avg Response Time |
|----------|---------|----------------|-------------------|
| **investment-manager** | Portfolio optimization | Daily | 200-500ms |
| **liability-agent** | Loan refinancing detection | Daily | 300-800ms |
| **life-event-orchestrator** | Life milestone automation | On-demand | 1-3s |
| **business-tax-calculator** | Tax planning for freelancers | Monthly/Quarterly | 100-300ms |
| **defi-yield-optimizer** | DeFi yield farming | Every 4-24 hours | 200-500ms |

---

## 🎯 Investment Manager

### Overview
Autonomous 24/7 portfolio management with tax-loss harvesting and automatic rebalancing.

### When to Call
- **Daily**: During market close for daily optimization
- **On-demand**: After significant market movements
- **Event-driven**: When user makes manual trades

### Request Format
```typescript
const { data, error } = await supabase.functions.invoke('investment-manager', {
  body: {} // No parameters needed
});
```

### Response Schema
```typescript
{
  taxLossOpportunities: Array<{
    symbol: string;        // e.g., "VTSAX"
    loss: number;          // Unrealized loss amount
    savings: number;       // Potential tax savings (loss × 30%)
  }>;
  rebalancingActions: Array<{
    action: 'buy' | 'sell'; // Rebalancing action
    assetType: string;      // e.g., "stocks", "bonds"
    amount: number;         // Dollar amount to trade
    reason: string;         // Explanation
  }>;
  recommendations: Array<{
    type: string;           // Category of recommendation
    message: string;        // Human-readable guidance
    timestamp: string;      // ISO datetime
  }>;
}
```

### Configuration
Configured via `investment_mandates` table:
- `target_allocation`: Desired asset mix (JSON)
- `rebalancing_threshold`: % drift before rebalancing (default: 5%)
- `tax_loss_harvest_enabled`: Enable TLH (boolean)
- `min_harvest_amount`: Minimum loss to harvest (default: $100)

### Example Use Case
User has 70% stocks, 30% bonds target. Portfolio drifts to 85% stocks, 15% bonds due to market gains. Function detects 15% drift > 5% threshold and generates sell orders to rebalance.

---

## 🧭 Life Event Orchestrator

### Overview
Intelligent automation for major life milestones with financial impact analysis and task delegation.

### Supported Events
- **home_purchase**: Down payment planning, mortgage analysis
- **new_child**: Childcare budgeting, education planning
- **marriage**: Joint finances, tax optimization
- **career_change**: Income transition modeling
- **retirement**: Distribution strategy, healthcare planning

### Actions

#### Analyze Financial Impact
```typescript
const { data } = await supabase.functions.invoke('life-event-orchestrator', {
  body: {
    action: 'analyze_financial_impact',
    executionId: 'uuid-of-active-execution'
  }
});

// Response
{
  execution: { /* event details */ },
  financialImpact: {
    projectedOutcomes: [...],    // Monte Carlo simulation results
    riskMetrics: { ... }          // Risk analysis
  },
  recommendations: [
    "Review emergency fund for increased expenses",
    "Adjust savings goals timeline"
  ]
}
```

#### Automate Task
```typescript
const { data } = await supabase.functions.invoke('life-event-orchestrator', {
  body: {
    action: 'automate_task',
    taskId: 'uuid-of-task'
  }
});

// Response
{
  success: true,
  message: 'Task automated successfully'
}
```

### Integration with Digital Twin
Uses `digital-twin-simulate` function to run 100 Monte Carlo simulations modeling the event's impact over 10 years.

### Task Automation
Marks tasks as automated and assigns to orchestrator agent for autonomous execution of:
- Document collection
- Notification sending
- Financial adjustments
- Timeline management

---

## 💰 Proactive Liability Agent

### Overview
24/7 market rate monitoring to automatically detect loan refinancing opportunities.

### Supported Loan Types
- **Mortgages**: 30-year fixed
- **Auto Loans**: Used vehicle financing
- **Student Loans**: Fixed-rate federal/private

### Recommendation Tiers

| Tier | Net Savings | Break-even | Status |
|------|------------|------------|---------|
| **Strongly Recommended** | >$10,000 | <24 months | ⭐⭐⭐ |
| **Recommended** | >$5,000 | <36 months | ⭐⭐ |
| **Consider** | >$2,000 | <60 months | ⭐ |

### Calculation Methodology

1. **Current Cost**: Calculate total interest using existing rate and term
2. **New Cost**: Calculate total interest using market rate
3. **Closing Costs**: Estimate at 2% of loan balance
4. **Net Savings**: Current cost - New cost - Closing costs
5. **Break-even**: Closing costs / Monthly savings

### Request Format
```typescript
const { data } = await supabase.functions.invoke('liability-agent', {
  body: {} // Automatically scans all user debts
});
```

### Response Schema
```typescript
{
  opportunities: Array<{
    debt_id: string;
    loan_type: string;
    current_rate: number;              // As decimal (e.g., 0.055 = 5.5%)
    current_balance: number;
    current_monthly_payment: number;
    available_rate: number;            // Best market rate found
    projected_monthly_payment: number;
    monthly_savings: number;
    net_savings: number;               // After closing costs
    break_even_months: number;
    closing_costs: number;
    recommendation: 'strongly_recommended' | 'recommended' | 'consider';
    confidence_score: number;          // 0-1 confidence in recommendation
  }>;
  total_potential_savings: number;
  scan_timestamp: string;
}
```

### Market Rate Data
Pulls from `market_loan_rates` table, which should be updated daily via external rate feeds.

---

## 🧑‍💼 Business Tax Calculator

### Overview
Tax planning toolkit for freelancers, contractors, and Business-of-One operators.

### Actions

#### Calculate Synthetic Paycheck
Smooths irregular income into predictable paychecks.

```typescript
const { data } = await supabase.functions.invoke('business-tax-calculator', {
  body: {
    action: 'calculate_paycheck'
  }
});

// Response
{
  paycheck: {
    period_start: '2025-10-15',
    period_end: '2025-11-15',
    total_income: 8500.00,
    withholding_federal: 1870.00,
    withholding_state: 425.00,
    withholding_fica: 1300.50,
    net_paycheck: 4904.50,
    calculation_method: 'rolling_average',
    income_sources: [...]
  }
}
```

#### Project Quarterly Taxes
Estimates tax payments for the entire year.

```typescript
const { data } = await supabase.functions.invoke('business-tax-calculator', {
  body: {
    action: 'project_quarterly_taxes',
    tax_year: 2025
  }
});

// Response
{
  projections: [
    {
      quarter: 1,
      due_date: '2025-04-15',
      estimated_income: 37500,
      estimated_expenses: 11250,
      federal_tax: 5775,
      state_tax: 1312.50,
      self_employment_tax: 4014.38,
      total_tax_due: 11101.88
    },
    // ... Q2, Q3, Q4
  ],
  annual_totals: {
    income: 150000,
    expenses: 45000,
    total_tax: 44407.50,
    effective_rate: 29.6
  }
}
```

#### Optimize S-Corp Split
Calculates optimal salary/distribution ratio.

```typescript
const { data } = await supabase.functions.invoke('business-tax-calculator', {
  body: {
    action: 'optimize_scorp_split',
    annual_revenue: 150000
  }
});

// Response
{
  optimization: {
    annual_revenue: 150000,
    recommended_salary: 50000,      // 33% of revenue
    recommended_distributions: 100000,
    salary_tax: 11325,              // Payroll taxes on salary
    distribution_tax: 0,            // No FICA on distributions
    total_tax: 11325,
    savings_vs_all_salary: 11572.50,
    effective_rate: 20.66
  }
}
```

### Tax Rate Assumptions
- Federal: 22% marginal rate
- State: 5% (varies by state)
- Self-Employment: 15.3% (Social Security + Medicare)
- S-Corp Payroll: 7.65% each employer/employee

**Note**: Calculations are estimates. Users should consult a CPA.

---

## ⛓️ DeFi Yield Optimizer

### Overview
Autonomous yield farming optimization across DeFi lending protocols.

### How It Works
1. Fetches user's active yield strategies
2. Retrieves current DeFi positions
3. Compares current yields vs available yields
4. Identifies opportunities exceeding thresholds
5. Sorts by estimated annual gain
6. Returns top 10 recommendations

### Request Format
```typescript
const { data } = await supabase.functions.invoke('defi-yield-optimizer', {
  body: {} // Analyzes all active strategies
});
```

### Response Schema
```typescript
{
  opportunities: Array<{
    strategy_id: string;
    action: 'rebalance' | 'enter_position';
    
    // For rebalance actions
    current_protocol?: string;      // e.g., "aave"
    current_apy?: number;           // Current yield %
    
    // For all actions
    target_protocol: string;        // e.g., "compound"
    asset: string;                  // e.g., "USDC"
    target_apy: number;             // Target yield %
    apy_improvement?: number;       // % improvement
    estimated_annual_gain?: number; // Dollar gain estimate
    risk_level: 'low' | 'medium' | 'high';
  }>;
  total_opportunities: number;
  scan_timestamp: string;
}
```

### Configuration
Set via `yield_strategies` table:
- `target_apy_min`: Minimum acceptable APY
- `rebalance_threshold`: Minimum APY improvement to rebalance
- `target_protocols`: Protocols to search (array)
- `risk_level`: Risk tolerance
- `auto_execute`: Enable autonomous rebalancing

### Protocol Yields (Current Mock Data)
- **Aave**: USDC 3.5%, DAI 4.2%, USDT 3.8%
- **Compound**: USDC 2.9%, DAI 3.1%, USDT 2.7%

**Production**: Replace with real-time protocol APIs.

### Risk Levels
- **Low**: Established protocols, major stablecoins only
- **Medium**: Vetted protocols, diversified assets
- **High**: Newer protocols, higher-yield opportunities

---

## 🔗 Function Dependencies

### Cross-Function Calls

Some functions call other functions:

```typescript
// Life Event Orchestrator → Digital Twin Simulate
const { data } = await supabaseClient.functions.invoke('digital-twin-simulate', {
  body: {
    parameters: { ... },
    monteCarloRuns: 100
  }
});
```

### Shared Utilities

Common code can be placed in `_shared/` directory and imported:

```typescript
import { formatCurrency } from "../_shared/utils.ts";
```

---

## 🚨 Error Handling

All functions use consistent error handling:

```typescript
try {
  // Function logic
} catch (error) {
  console.error('Error in function-name:', error);
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
```

### Common Error Codes
- **401**: Authentication required
- **403**: Insufficient permissions
- **400**: Invalid request parameters
- **404**: Resource not found
- **500**: Internal server error
- **503**: Service temporarily unavailable

---

## 📈 Performance Metrics

Target SLOs for all functions:

- **Availability**: 99.9% uptime
- **Response Time**: p50 <500ms, p99 <2s
- **Error Rate**: <1% of requests
- **Cold Start**: <200ms

Monitor via Lovable Cloud → Backend → Functions → Metrics

---

## 🔒 Security Checklist

- [x] JWT authentication required
- [x] User-scoped database queries
- [x] RLS policies enforced
- [x] No secrets in code (use environment variables)
- [x] Input validation
- [x] Error message sanitization
- [x] CORS headers properly configured
- [x] No direct SQL execution

---

## 🎓 Best Practices

1. **Idempotency**: Functions should produce same result for same input
2. **Logging**: Log key operations for debugging
3. **Timeouts**: Handle long-running operations gracefully
4. **Rate Limiting**: Respect external API limits
5. **Error Recovery**: Graceful degradation when services fail
6. **Monitoring**: Track success/failure rates
7. **Documentation**: Keep inline docs updated

---

## 📞 Support

For issues or questions:
- Check function logs first
- Review this documentation
- Check database table schemas
- Verify RLS policies
- Test with simplified inputs

---

**Version**: 1.0.0  
**Last Updated**: November 15, 2025  
**Maintained By**: $ave+ Engineering Team

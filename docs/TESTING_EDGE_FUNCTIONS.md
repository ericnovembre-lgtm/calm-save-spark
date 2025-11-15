# Testing Next-Gen Edge Functions

Guide for testing and verifying the 5 core autonomous backend services.

---

## ✅ Deployment Status

All functions successfully deployed:
- ✅ **investment-manager** 
- ✅ **life-event-orchestrator**
- ✅ **liability-agent**
- ✅ **business-tax-calculator**
- ✅ **defi-yield-optimizer**

**Deployment Time**: November 15, 2025  
**Status**: Active and ready for testing

---

## 🧪 Testing Checklist

### Prerequisites
1. User must be authenticated
2. Required database tables must exist
3. Test data should be seeded for meaningful results

---

## 1️⃣ Investment Manager

### Test Setup
```typescript
// 1. Create an investment mandate
const { data: mandate } = await supabase
  .from('investment_mandates')
  .insert({
    target_allocation: {
      stocks: 60,
      bonds: 30,
      real_estate: 10
    },
    rebalancing_threshold: 5,
    tax_loss_harvest_enabled: true,
    min_harvest_amount: 100,
    auto_rebalance_enabled: true
  })
  .select()
  .single();

// 2. Add some portfolio holdings
await supabase.from('portfolio_holdings').insert([
  {
    symbol: 'VTSAX',
    asset_type: 'stocks',
    quantity: 100,
    cost_basis: 10000,
    market_value: 8500, // Unrealized loss
    unrealized_gain_loss: -1500
  },
  {
    symbol: 'BND',
    asset_type: 'bonds',
    quantity: 50,
    cost_basis: 5000,
    market_value: 2000, // Underweight
    unrealized_gain_loss: -3000
  }
]);
```

### Test Execution
```typescript
const { data, error } = await supabase.functions.invoke('investment-manager');

console.log('Tax-Loss Opportunities:', data.taxLossOpportunities);
console.log('Rebalancing Actions:', data.rebalancingActions);
console.log('Recommendations:', data.recommendations);
```

### Expected Results
- Should detect VTSAX tax-loss harvesting opportunity ($450 savings)
- Should detect bond underweight and recommend rebalancing
- Should generate buy recommendations for bonds

---

## 2️⃣ Life Event Orchestrator

### Test Setup
```typescript
// 1. Create a playbook
const { data: playbook } = await supabase
  .from('life_event_playbooks')
  .insert({
    event_type: 'home_purchase',
    playbook_name: 'First Home Purchase',
    estimated_duration_days: 90
  })
  .select()
  .single();

// 2. Create an execution
const { data: execution } = await supabase
  .from('life_event_executions')
  .insert({
    playbook_id: playbook.id,
    estimated_cost: 50000,
    status: 'active'
  })
  .select()
  .single();
```

### Test Execution
```typescript
// Analyze financial impact
const { data, error } = await supabase.functions.invoke('life-event-orchestrator', {
  body: {
    action: 'analyze_financial_impact',
    executionId: execution.id
  }
});

console.log('Financial Impact:', data.financialImpact);
console.log('Recommendations:', data.recommendations);
```

### Expected Results
- Should run Digital Twin simulation
- Should project 10-year financial impact
- Should provide 3+ recommendations

---

## 3️⃣ Proactive Liability Agent

### Test Setup
```typescript
// 1. Add market rates
await supabase.from('market_loan_rates').insert([
  {
    loan_type: 'mortgage_30yr',
    rate: 4.25,
    provider: 'Market Average',
    rate_date: new Date().toISOString()
  },
  {
    loan_type: 'auto_used',
    rate: 5.5,
    provider: 'Market Average',
    rate_date: new Date().toISOString()
  }
]);

// 2. Add user debts
await supabase.from('debts').insert([
  {
    debt_name: 'Primary Mortgage',
    debt_type: 'mortgage',
    principal_amount: 300000,
    current_balance: 280000,
    interest_rate: 5.5, // Higher than market
    minimum_payment: 1500
  }
]);
```

### Test Execution
```typescript
const { data, error } = await supabase.functions.invoke('liability-agent');

console.log('Opportunities Found:', data.opportunities.length);
console.log('Total Savings:', data.total_potential_savings);
console.log('First Opportunity:', data.opportunities[0]);
```

### Expected Results
- Should detect refinancing opportunity (5.5% → 4.25%)
- Should calculate significant savings
- Should mark as "strongly_recommended"

---

## 4️⃣ Business Tax Calculator

### Test Setup
```typescript
// Add business income streams
await supabase.from('business_income_streams').insert([
  {
    stream_name: 'Freelance Design',
    stream_type: 'services',
    average_monthly_revenue: 5000,
    is_active: true
  },
  {
    stream_name: 'Consulting',
    stream_type: 'services',
    average_monthly_revenue: 3500,
    is_active: true
  }
]);
```

### Test Execution - Paycheck
```typescript
const { data, error } = await supabase.functions.invoke('business-tax-calculator', {
  body: {
    action: 'calculate_paycheck'
  }
});

console.log('Synthetic Paycheck:', data.paycheck);
console.log('Net Pay:', data.paycheck.net_paycheck);
```

### Test Execution - Quarterly Taxes
```typescript
const { data, error } = await supabase.functions.invoke('business-tax-calculator', {
  body: {
    action: 'project_quarterly_taxes',
    tax_year: 2025
  }
});

console.log('Q1-Q4 Projections:', data.projections);
console.log('Annual Tax:', data.annual_totals.total_tax);
```

### Test Execution - S-Corp Optimization
```typescript
const { data, error } = await supabase.functions.invoke('business-tax-calculator', {
  body: {
    action: 'optimize_scorp_split',
    annual_revenue: 150000
  }
});

console.log('Recommended Salary:', data.optimization.recommended_salary);
console.log('Tax Savings:', data.optimization.savings_vs_all_salary);
```

### Expected Results
- **Paycheck**: Should generate synthetic paycheck with proper withholdings
- **Quarterly**: Should project 4 quarters with tax estimates
- **S-Corp**: Should recommend ~$50k salary for $150k revenue

---

## 5️⃣ DeFi Yield Optimizer

### Test Setup
```typescript
// 1. Create yield strategy
await supabase.from('yield_strategies').insert({
  strategy_name: 'Stablecoin Optimizer',
  target_apy_min: 3.0,
  rebalance_threshold: 1.0,
  target_protocols: ['aave', 'compound'],
  risk_level: 'low',
  is_active: true,
  auto_execute: true
});

// 2. Add current position (optional - for rebalancing test)
await supabase.from('defi_positions').insert({
  protocol: 'aave',
  position_type: 'lending',
  asset_symbol: 'USDC',
  quantity: 10000,
  current_value_usd: 10000,
  apy: 2.5, // Below threshold
  chain: 'ethereum'
});
```

### Test Execution
```typescript
const { data, error } = await supabase.functions.invoke('defi-yield-optimizer');

console.log('Opportunities:', data.opportunities);
console.log('Top Opportunity:', data.opportunities[0]);
console.log('Estimated Gains:', data.opportunities[0]?.estimated_annual_gain);
```

### Expected Results
- Should detect USDC rebalancing opportunity (2.5% → 3.5%)
- Should identify DAI new position opportunity (4.2% APY)
- Should sort by estimated annual gain

---

## 🔍 Debugging Tips

### Check Function Logs
```
Lovable Cloud → Backend → Functions → [Function Name] → Logs
```

Look for:
- `booted` messages (successful deployment)
- `Error in function-name:` messages (runtime errors)
- Custom log messages from `console.log()`

### Common Issues

**"Not authenticated" Error**
- Ensure user is logged in
- Check Authorization header contains valid JWT
- Verify token hasn't expired

**"No data found" Responses**
- Check if required database records exist
- Verify user_id matches authenticated user
- Check RLS policies allow access

**Timeout Errors**
- Check for slow database queries
- Add indexes to commonly queried columns
- Consider reducing Monte Carlo simulation runs

**Type Errors**
- Ensure database types match code expectations
- Add type assertions where needed: `as any`
- Check for null/undefined values

---

## 📊 Success Metrics

After deployment, monitor these metrics:

- **Invocation Count**: How many times functions are called
- **Error Rate**: Should be <1%
- **Average Duration**: Should match target response times
- **User Satisfaction**: Are recommendations being acted upon?

---

## 🚀 Next Steps

1. **Seed Test Data**: Add realistic test data to database
2. **Run Test Suite**: Execute all test scenarios above
3. **Monitor Logs**: Watch for errors or warnings
4. **Iterate**: Fix any issues found during testing
5. **Enable Automation**: Turn on auto-execute features
6. **Monitor Production**: Track performance and errors

---

## 📝 Notes

- Functions are deployed to Lovable Cloud (Supabase Edge Functions)
- All functions enforce user authentication and RLS policies
- Market data (rates, yields) currently uses mock data
- Production deployment should integrate real-time data feeds
- Consider rate limiting for high-frequency calls
- Monitor costs as function usage scales

---

**Testing Status**: ✅ All functions deployed successfully  
**Last Verified**: November 15, 2025  
**Test Coverage**: Core scenarios documented above

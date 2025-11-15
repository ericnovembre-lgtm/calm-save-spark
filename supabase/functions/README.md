# Edge Functions Documentation

This directory contains all backend serverless functions for the $ave+ platform. Functions are deployed automatically and run on Deno runtime.

## 🎯 Next-Gen Feature Functions

### Investment Manager
**Path**: `/investment-manager`  
**Auth**: Required  
**Purpose**: 24/7 autonomous portfolio optimization

Provides tax-loss harvesting, automatic rebalancing, and investment recommendations based on user-defined mandates.

**Key Features**:
- Tax-loss harvesting detection (>$100 minimum)
- Portfolio rebalancing with configurable thresholds
- Multi-asset class support (stocks, bonds, real estate, crypto)

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('investment-manager', {
  body: {} // Analyzes current user portfolio
});
```

**Response**: Tax opportunities, rebalancing actions, and recommendations

---

### Life Event Orchestrator
**Path**: `/life-event-orchestrator`  
**Auth**: Required  
**Purpose**: Automated workflows for major life milestones

Coordinates complex multi-step processes for events like home buying, marriage, new children, career changes.

**Supported Actions**:
- `analyze_financial_impact`: Runs Digital Twin simulations
- `automate_task`: Delegates tasks to AI agents

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('life-event-orchestrator', {
  body: {
    action: 'analyze_financial_impact',
    executionId: 'uuid-of-active-event'
  }
});
```

**Supported Events**: home_purchase, new_child, marriage, career_change, retirement

---

### Proactive Liability Agent
**Path**: `/liability-agent`  
**Auth**: Required  
**Purpose**: 24/7 loan refinancing opportunity detection

Monitors market rates and automatically identifies refinancing opportunities for mortgages, auto loans, and student loans.

**Minimum Savings Criteria**:
- Rate improvement: ≥0.5%
- Break-even period: <60 months
- Net savings > closing costs

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('liability-agent', {
  body: {} // Scans all user loans
});
```

**Response**: Refinancing opportunities with savings calculations and recommendations

---

### Business Tax Calculator
**Path**: `/business-tax-calculator`  
**Auth**: Required  
**Purpose**: Tax planning and paycheck synthesis for freelancers

Generates synthetic paychecks from irregular income and projects quarterly tax payments.

**Supported Actions**:
- `calculate_paycheck`: Create synthetic paycheck from income streams
- `project_quarterly_taxes`: Estimate Q1-Q4 tax payments
- `optimize_scorp_split`: Calculate optimal salary/distribution for S-Corps

**Tax Rates Used**:
- Federal: 22% effective
- State: 5% average
- Self-Employment: 15.3%

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('business-tax-calculator', {
  body: {
    action: 'calculate_paycheck'
  }
});
```

---

### DeFi Yield Optimizer
**Path**: `/defi-yield-optimizer`  
**Auth**: Required  
**Purpose**: Autonomous yield farming across DeFi protocols

Monitors yields on Aave, Compound, and other protocols to identify optimal allocation strategies.

**Supported Protocols**:
- Aave (lending/borrowing)
- Compound (money markets)

**Supported Assets**:
- USDC, DAI, USDT (stablecoins)

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('defi-yield-optimizer', {
  body: {} // Scans all active strategies
});
```

**Response**: Top 10 yield opportunities sorted by estimated annual gain

---

## 🔐 Security & Authentication

All Next-Gen functions require JWT authentication via the Authorization header.

**Standard Headers**:
```typescript
{
  'Authorization': 'Bearer <supabase-jwt-token>',
  'Content-Type': 'application/json',
  'apikey': '<supabase-anon-key>'
}
```

**RLS Enforcement**: All database operations respect Row Level Security policies.

---

## 📊 Monitoring & Logs

Check function logs:
```bash
# In Lovable Cloud UI
Cloud → Backend → Functions → [Select Function] → Logs
```

**Log Levels**:
- `info`: Normal operations
- `warn`: Recoverable issues
- `error`: Critical failures

---

## 🚀 Deployment

Functions deploy automatically when code is updated. No manual deployment needed.

**Deployment Time**: ~30-60 seconds after code changes

---

## 🧪 Testing

Test functions via the Lovable Cloud UI or programmatically:

```typescript
// Test in development
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* test payload */ }
});

console.log('Response:', data);
console.log('Error:', error);
```

---

## 📝 Function Conventions

All functions follow these standards:

1. **CORS Headers**: Always include for browser compatibility
2. **OPTIONS Handler**: Support preflight requests
3. **Error Handling**: Try-catch with detailed error messages
4. **Logging**: Console.log for debugging and monitoring
5. **User Scope**: Always filter by authenticated user
6. **Type Safety**: Use TypeScript types where possible

---

## 🔄 Common Patterns

### Authentication Check
```typescript
const { data: { user } } = await supabaseClient.auth.getUser();
if (!user) throw new Error('Not authenticated');
```

### Database Query with RLS
```typescript
const { data, error } = await supabaseClient
  .from('table_name')
  .select('*')
  .eq('user_id', user.id); // RLS ensures user only sees own data
```

### Error Response
```typescript
return new Response(
  JSON.stringify({ error: error.message }),
  { 
    status: 500, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  }
);
```

---

## 🎯 Performance Best Practices

1. **Batch Database Operations**: Minimize round-trips
2. **Use Indexes**: Ensure queries use proper indexes
3. **Cache External API Calls**: Store frequently accessed data
4. **Limit Result Sets**: Use `.limit()` on queries
5. **Monitor Execution Time**: Target <1s response time

---

## 🛠️ Development Workflow

1. **Create Function**: Add new directory in `supabase/functions/`
2. **Write Code**: Implement in `index.ts`
3. **Test Locally**: Use Lovable preview environment
4. **Deploy**: Automatic on code save
5. **Monitor**: Check logs for errors
6. **Iterate**: Update and redeploy as needed

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Runtime Docs](https://deno.land/manual)
- [$ave+ Architecture Guide](../../docs/ARCHITECTURE.md)
- [API Reference](../../docs/API.md)

---

## 🆘 Troubleshooting

**Function not responding?**
1. Check logs for errors
2. Verify authentication headers
3. Ensure database tables exist
4. Check RLS policies

**Slow performance?**
1. Add database indexes
2. Reduce query complexity
3. Cache external API responses
4. Consider background processing

**Type errors?**
1. Ensure Supabase types are up to date
2. Use explicit type casting where needed
3. Check for null/undefined handling

---

**Last Updated**: 2025-11-15  
**Functions Count**: 70+  
**Next-Gen Features**: 5 core functions documented above

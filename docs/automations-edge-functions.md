# Automations Edge Functions

## Overview
This document details the backend edge functions that power the $ave+ Automations feature.

---

## Functions

### 1. process-automation

**Purpose:** Processes individual automation executions (manually triggered or transaction-based).

**Path:** `supabase/functions/process-automation/index.ts`

**Trigger:** Invoked when:
- User makes a purchase (for round-up automations)
- Manual execution requested
- Called by `process-scheduled-automations`

**Input Schema:**
```typescript
{
  ruleId: string (UUID),      // Automation rule ID
  transactionAmount: number   // Transaction amount (for round-ups/percentage)
}
```

**Validation:**
- `ruleId` must be valid UUID
- `transactionAmount` must be positive number
- `transactionAmount` max: 1,000,000
- Rule must belong to authenticated user
- Rule must be active

**Execution Flow:**
1. Authenticate user
2. Enforce rate limiting
3. Validate input
4. Fetch automation rule (with user verification)
5. Calculate savings amount based on rule type:
   - **round_up:** `Math.ceil(amount) - amount`
   - **percentage_save:** `amount * percentage / 100`
   - **scheduled_transfer:** Fixed amount from config
6. Validate calculated amount
7. Apply transfer to target (goal or pot)
8. Calculate next run date (if scheduled):
   - Daily: +1 day
   - Weekly: +7 days
   - Bi-weekly: +14 days
   - Monthly: +1 month
9. Update automation rule:
   - `last_run_date`
   - `next_run_date`
   - `run_count` (increment)
10. Log execution to `automation_execution_log`
11. Return success response

**Response:**
```typescript
{
  success: true,
  amount_saved: number,
  rule_type: string,
  next_run_date?: string (ISO 8601)
}
```

**Error Handling:**
- Validation errors → 400 with details
- Authentication errors → 401
- Rule not found → 404
- Rate limit exceeded → 429
- Database errors → 500
- All errors logged to `automation_execution_log`

**Rate Limiting:**
- Uses shared rate limiter from `_shared/rate-limiter.ts`
- Default: 100 requests per hour per user

---

### 2. process-scheduled-automations

**Purpose:** Batch processes all scheduled automations that are due to run.

**Path:** `supabase/functions/process-scheduled-automations/index.ts`

**Trigger:** Cron job (runs daily at midnight UTC)

**Cron Setup:**
```sql
SELECT cron.schedule(
  'process-scheduled-automations-daily',
  '0 0 * * *',  -- Every day at midnight
  $$
  SELECT net.http_post(
    url:='https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/process-scheduled-automations',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

**Authentication:** Uses service role key (bypasses RLS for system operations)

**Execution Flow:**
1. Query for due automations:
   ```sql
   SELECT * FROM automation_rules
   WHERE rule_type = 'scheduled_transfer'
     AND is_active = true
     AND next_run_date <= NOW()
     AND next_run_date IS NOT NULL
   ```
2. For each automation:
   - Extract configuration
   - Validate target and amount
   - Apply transfer to goal/pot
   - Calculate next run date
   - Update automation rule
   - Log execution result
3. Handle failures gracefully (continue processing others)
4. Return summary statistics

**Response:**
```typescript
{
  success: true,
  processed: number,       // Total automations processed
  succeeded: number,       // Successful executions
  failed: number,          // Failed executions
  results: Array<{
    automation_id: string,
    status: 'success' | 'failed',
    amount?: number,
    error?: string
  }>
}
```

**Error Handling:**
- Individual automation failures don't stop batch
- All errors logged to `automation_execution_log`
- Summary includes success/failure counts
- Console logging for monitoring

**Logging:**
```typescript
console.log('[Scheduled Automations] Starting...');
console.log(`[Scheduled Automations] Found ${count} automations`);
console.log(`[Scheduled Automations] ✅ Processed ${name} - $${amount}`);
console.error(`[Scheduled Automations] ❌ Failed ${name}:`, error);
console.log(`[Scheduled Automations] Complete: ${succeeded} succeeded, ${failed} failed`);
```

---

## Database Interactions

### Tables Used

**automation_rules:**
- Read: Fetch active automations
- Write: Update `last_run_date`, `next_run_date`, `run_count`

**automation_execution_log:**
- Write: Log all execution attempts (success/failure)

**goals:**
- Write: Increment `current_amount` when target_type = 'goal'

**pots:**
- Write: Increment `current_amount` when target_type = 'pot'

### RLS Policies
- `process-automation`: Enforces user_id check via `auth.uid()`
- `process-scheduled-automations`: Uses service role (bypasses RLS)

---

## Monitoring & Debugging

### View Logs
```bash
# Real-time logs for individual processing
supabase functions logs process-automation --follow

# Cron job logs
supabase functions logs process-scheduled-automations --follow
```

### Key Metrics to Monitor
1. **Execution success rate:** Should be >95%
2. **Average processing time:** Should be <2 seconds per automation
3. **Rate limit violations:** Should be minimal
4. **Error patterns:** Group by error type

### Common Issues

**Issue:** Automation not running on schedule
- **Check:** Cron job is active: `SELECT * FROM cron.job WHERE jobname = 'process-scheduled-automations-daily';`
- **Check:** Function logs for errors
- **Check:** `next_run_date` is in the past

**Issue:** Incorrect amount transferred
- **Check:** `action_config` structure
- **Check:** Calculation logic for rule type
- **Check:** Database constraints

**Issue:** Next run date not updating
- **Check:** Frequency value is valid
- **Check:** Update query succeeded
- **Check:** Date calculation logic

---

## Security Considerations

### Authentication
- User-triggered functions require valid JWT
- Cron function uses service role key (internal only)

### Authorization
- All user data access verified via `user_id = auth.uid()`
- RLS policies enforce data isolation
- Service role limited to system operations

### Rate Limiting
- Prevents abuse of process-automation endpoint
- Configurable per-function limits
- IP-based blocking for repeated violations

### Input Validation
- Zod schemas enforce strict types
- Amount limits prevent overflow
- UUID validation prevents injection

### Error Handling
- Never expose internal details
- Log sensitive errors server-side only
- Return generic messages to client

---

## Performance Optimization

### Query Optimization
- Indexes on: `user_id`, `is_active`, `next_run_date`, `rule_type`
- Batch operations for multiple automations
- Connection pooling via Supabase client

### Caching
- No caching needed (data must be fresh)
- Rate limiter uses in-memory cache

### Scalability
- Horizontal scaling via Deno Deploy
- Database connection pooling
- Async processing for batch operations

---

## Testing

### Unit Tests
See `docs/automations-testing.md` for full test suite.

### Manual Testing

**Test process-automation:**
```bash
curl -X POST \
  'https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/process-automation' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "ruleId": "UUID_HERE",
    "transactionAmount": 25.50
  }'
```

**Test process-scheduled-automations:**
```bash
curl -X POST \
  'https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/process-scheduled-automations' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

---

## Deployment

### Automatic Deployment
Edge functions deploy automatically with code changes.

### Manual Deployment
```bash
supabase functions deploy process-automation
supabase functions deploy process-scheduled-automations
```

### Environment Variables
Required secrets (auto-configured):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Future Enhancements

1. **Retry Logic:** Auto-retry failed transfers with exponential backoff
2. **Batch Processing:** Process multiple automations in parallel
3. **Smart Scheduling:** Optimize run times based on user patterns
4. **Notifications:** Alert users of successful/failed transfers
5. **Advanced Rules:** Multi-condition triggers, dynamic amounts
6. **Analytics:** Track savings patterns, optimize recommendations

---

## Contact

For technical questions:
- Backend team: backend@saveplus.app
- Documentation: /docs/automations.md
- Testing guide: /docs/automations-testing.md

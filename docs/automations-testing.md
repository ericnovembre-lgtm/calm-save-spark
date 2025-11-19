# Automations Testing Guide

## Overview
This guide covers testing procedures for the $ave+ Automations feature, including manual testing, automated tests, and debugging.

---

## Automated Tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test useAutomations.test.ts
```

### Test Coverage

**Unit Tests:**
- `src/hooks/__tests__/useAutomations.test.ts` - Tests the automations hook
  - Fetching automations
  - Creating automations
  - Updating automations
  - Deleting automations
  - Toggling automation status
  - Calculating monthly totals

**Component Tests:**
- `src/components/automations/__tests__/AutomationCard.test.tsx` - Tests automation cards
  - Rendering scheduled automations
  - Rendering round-up automations
  - Toggle interactions
  - Edit/delete actions
  - Badge displays (Active/Paused)

---

## Manual Testing Checklist

### 1. Creating Automations

**Scheduled Transfers:**
- [ ] Click "Add Automation" button
- [ ] Fill in automation name (e.g., "Weekly Savings")
- [ ] Select frequency (daily/weekly/bi-weekly/monthly)
- [ ] Set start date
- [ ] Enter amount (test with $5, $50, $500)
- [ ] Add optional notes
- [ ] Click "Create Automation"
- [ ] Verify toast success message
- [ ] Verify automation appears in list
- [ ] Verify statistics update correctly

**Round-ups:**
- [ ] Toggle "Enable Round-ups" switch
- [ ] Verify round-ups card appears
- [ ] Verify explanation text is clear
- [ ] Verify automatic transaction rounding

### 2. Editing Automations

- [ ] Click menu (three dots) on automation card
- [ ] Click "Edit"
- [ ] Modify name, amount, frequency, or notes
- [ ] Click "Save Changes"
- [ ] Verify toast success message
- [ ] Verify changes appear immediately
- [ ] Verify statistics update if amount changed

### 3. Toggling Automations

- [ ] Toggle automation switch from Active → Paused
- [ ] Verify "Paused" badge appears
- [ ] Verify toast message "Automation paused"
- [ ] Toggle back from Paused → Active
- [ ] Verify "Active" badge appears
- [ ] Verify toast message "Automation resumed"
- [ ] Verify statistics update correctly

### 4. Deleting Automations

- [ ] Click menu on automation card
- [ ] Click "Delete"
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" - verify nothing happens
- [ ] Click "Delete" again
- [ ] Click "Confirm" in dialog
- [ ] Verify toast success message
- [ ] Verify automation removed from list
- [ ] Verify statistics update

### 5. Navigation & Promotion

**From Dashboard:**
- [ ] Verify automation promotion card visible
- [ ] Click "Set Up Automations" button
- [ ] Verify navigates to /automations

**From Goals:**
- [ ] Verify automation promotion card visible (when goals exist)
- [ ] Click button → verify navigation

**From Budget:**
- [ ] Verify automation promotion card visible
- [ ] Verify navigation works

**From Debts:**
- [ ] Verify automation promotion card visible
- [ ] Verify navigation works

**From Pots:**
- [ ] Verify automation promotion card visible
- [ ] Verify navigation works

### 6. Statistics Dashboard

- [ ] Create multiple automations with different frequencies
- [ ] Verify "Active Automations" count is correct
- [ ] Verify "Scheduled This Month" shows only active scheduled automations
- [ ] Verify "Est. Monthly Savings" calculation:
  - Monthly automations: count once
  - Weekly automations: count × 4
  - Bi-weekly automations: count × 2
  - Daily automations: count × 30
- [ ] Pause an automation → verify stats update
- [ ] Delete an automation → verify stats update

### 7. Safety Rules

- [ ] Verify "Low Balance Protection" card is visible
- [ ] Read explanation text
- [ ] Note: Implementation is placeholder (future feature)

### 8. Edge Cases

**Empty States:**
- [ ] With no automations, verify empty state message
- [ ] Verify "Add Automation" button is prominent

**Validation:**
- [ ] Try creating automation with empty name → verify error
- [ ] Try creating automation with $0 amount → verify error
- [ ] Try creating automation with negative amount → verify error
- [ ] Try creating automation with past start date → verify handling

**Loading States:**
- [ ] Verify skeleton loading appears while fetching
- [ ] Verify smooth transition to content

**Error Handling:**
- [ ] Simulate network error (disable network in DevTools)
- [ ] Verify error toast appears
- [ ] Verify retry mechanism works

---

## Edge Function Testing

### Testing process-automation

**Setup:**
```bash
# View logs
supabase functions logs process-automation
```

**Manual Test:**
1. Create a scheduled automation through UI
2. Call the edge function with test data:
```typescript
const { data, error } = await supabase.functions.invoke('process-automation', {
  body: {
    ruleId: 'your-automation-id',
    transactionAmount: 100
  }
});
```
3. Verify response contains:
   - `success: true`
   - `amount_saved` (correct calculation)
   - `next_run_date` (correctly incremented)
4. Check database:
   - `automation_execution_log` has new entry
   - `automation_rules` has updated `last_run_date`, `next_run_date`, `run_count`
   - Target goal/pot has increased `current_amount`

### Testing process-scheduled-automations

**Setup Cron:**
```sql
-- Set up cron job (runs daily at midnight)
SELECT cron.schedule(
  'process-scheduled-automations-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url:='https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/process-scheduled-automations',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbnBqZ2VsenNtY2lkd3J3YmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODE0MTEsImV4cCI6MjA3NzI1NzQxMX0.x6_XHaj_xM-OpJvynD2O6TurM3nA9-7xcB3B0krC3sM"}'::jsonb
  ) as request_id;
  $$
);
```

**Manual Test:**
1. Create automations with `next_run_date` in the past
2. Invoke function manually:
```typescript
const { data, error } = await supabase.functions.invoke('process-scheduled-automations');
```
3. Verify response:
   - `processed` count matches due automations
   - `succeeded` count shows successful executions
   - `results` array contains details
4. Check database:
   - All due automations have updated `next_run_date`
   - Execution logs created
   - Target accounts have correct balances

**View Logs:**
```bash
supabase functions logs process-scheduled-automations
```

---

## Analytics Testing

### Events to Verify

1. **automation_created**
   - Fires when: New automation created
   - Properties: `frequency`, `amount`

2. **automation_updated**
   - Fires when: Automation edited
   - Properties: none

3. **automation_deleted**
   - Fires when: Automation deleted
   - Properties: none

4. **automation_toggled**
   - Fires when: Automation paused/resumed
   - Properties: `new_status` ('active' or 'paused')

**Verification:**
- Check browser console for `[Analytics]` logs
- Verify events appear in analytics dashboard
- Verify properties are correct

---

## Performance Testing

### Metrics to Monitor

1. **Page Load Time:**
   - Target: < 2 seconds
   - Test with 0, 5, 20, 50 automations

2. **Interaction Response:**
   - Toggle: < 200ms
   - Create: < 1 second
   - Delete: < 500ms

3. **Statistics Calculation:**
   - Should be instant (memoized)
   - Test with 50+ automations

### Tools
- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse audit

---

## Accessibility Testing

### Checklist

- [ ] All buttons have clear labels
- [ ] Switch controls announce state (on/off)
- [ ] Modal dialogs trap focus
- [ ] Form inputs have proper labels
- [ ] Error messages are announced
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works:
  - Tab through all interactive elements
  - Enter/Space activate buttons
  - Escape closes modals
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)

---

## Debugging Tips

### Common Issues

**Automations not appearing:**
1. Check network tab for failed requests
2. Verify user is authenticated
3. Check Supabase RLS policies
4. Verify database connection

**Statistics incorrect:**
1. Log `automations` array in hook
2. Check filtering logic for `is_active`
3. Verify `action_config.amount` exists
4. Check frequency multipliers

**Toggle not working:**
1. Check network request succeeds
2. Verify `queryClient.invalidateQueries` called
3. Check for race conditions
4. Verify optimistic updates

**Edge function failures:**
1. Check function logs: `supabase functions logs`
2. Verify secrets are configured
3. Check database permissions
4. Test with curl/Postman
5. Review error logging in function

### Debug Logging

Add to `useAutomations.ts`:
```typescript
console.log('[Automations Debug]', {
  automations,
  scheduledAutomations,
  activeCount,
  estimatedMonthlyTotal,
});
```

---

## Continuous Integration

### Pre-Commit Checks
```bash
npm run lint
npm test
npm run build
```

### CI Pipeline
1. Run all tests
2. Check coverage thresholds (≥80%)
3. Run E2E tests
4. Build production bundle
5. Deploy edge functions

---

## Contact

For issues or questions:
- In-app chat support
- Email: support@saveplus.app
- Documentation: /docs/automations.md

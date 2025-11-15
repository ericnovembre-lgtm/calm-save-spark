# Testing Guide - $ave+ Next-Gen Features

## End-to-End User Flow Testing

### 1. LifeSim Game Session Flow

**Objective**: Test complete financial life simulation gameplay

#### Setup
1. Navigate to `/lifesim` from Features Hub
2. Verify the page loads without errors

#### Test Steps
1. **Start New Game**
   - Click "Start New Simulation" button
   - Enter session name (e.g., "My Financial Journey")
   - Set starting age (22-30)
   - Set target retirement age (55-70)
   - Click "Start Simulation"
   - ✅ Verify game session created successfully

2. **Play Game Turns**
   - View the Financial Dashboard showing:
     - Annual Income
     - Annual Expenses
     - Savings Rate
     - Total Debt
   - Review the Decision Card presented
   - Select one of 3 choices for the life decision
   - ✅ Verify financial metrics update based on choice
   - ✅ Verify age advances by 1 year
   - ✅ Verify life event is recorded

3. **View Statistics**
   - Switch to "Statistics" tab
   - ✅ Verify line chart shows net worth progression
   - ✅ Verify decision breakdown by category
   - ✅ Verify recent decisions list displays

4. **Session History**
   - Switch to "Session History" tab
   - ✅ Verify all game sessions are listed
   - ✅ Verify status badges (Active/Completed/Failed)
   - ✅ Verify progress percentages
   - Click on a previous session
   - ✅ Verify it loads that session's data

**Expected Outcomes**:
- No console errors
- Smooth state transitions
- Accurate financial calculations
- Data persists between page refreshes

---

### 2. Investment Mandate Configuration Flow

**Objective**: Test investment mandate setup and management

#### Setup
1. Navigate to `/investment-manager` from Features Hub
2. Verify the page loads with mandate configuration form

#### Test Steps
1. **Configure Mandate**
   - Select Risk Tolerance: Conservative/Moderate/Aggressive
   - Set Rebalancing Threshold (1-10%)
   - Toggle "Automatic Rebalancing" on
   - Toggle "Tax-Loss Harvesting" on
   - Set Minimum Harvest Amount ($1000-$10000)
   - Click "Save Configuration"
   - ✅ Verify success toast appears
   - ✅ Verify configuration saved to database

2. **Update Mandate**
   - Change risk tolerance to different level
   - Adjust rebalancing threshold
   - Click "Save Configuration"
   - ✅ Verify update success toast
   - Refresh page
   - ✅ Verify updated values persist

3. **View Active Mandates**
   - Navigate to mandate history (if implemented)
   - ✅ Verify all mandates are listed
   - ✅ Verify active mandate is clearly marked

**Expected Outcomes**:
- Form validation works correctly
- Mandate saves successfully
- Updates persist across sessions
- No database errors

---

### 3. Life Event Playbook Flow

**Objective**: Test life event automation and task management

#### Setup
1. Navigate to `/life-events` from Features Hub
2. Verify dashboard loads with metrics

#### Test Steps
1. **Browse Available Playbooks**
   - Switch to "Playbook Library" tab
   - ✅ Verify playbooks are displayed (Marriage, Home Purchase, New Child, etc.)
   - Review playbook details
   - ✅ Verify task counts and estimated timelines

2. **Start a Playbook Execution**
   - Click "Start Playbook" on a life event (e.g., Home Purchase)
   - Enter required details:
     - Target date
     - Estimated cost
     - Additional notes
   - Click "Begin"
   - ✅ Verify execution created successfully
   - ✅ Verify it appears in "Active Events" tab

3. **Work Through Tasks**
   - Switch to "Task Dashboard" tab
   - View pending tasks for the active execution
   - Complete a task by checking it off
   - ✅ Verify task marked as complete
   - ✅ Verify progress bar updates
   - Add notes to a task
   - ✅ Verify notes saved

4. **Analyze Financial Impact**
   - Return to "Active Events" tab
   - Click "Analyze Financial Impact" button
   - ✅ Verify edge function executes
   - ✅ Verify Monte Carlo simulation results display
   - ✅ Verify recommendations are shown

5. **Automate a Task**
   - Select a task in Task Dashboard
   - Click "Automate This Task"
   - ✅ Verify task status changes to "automated"
   - ✅ Verify assigned agent is set

**Expected Outcomes**:
- Playbooks load correctly
- Executions create and track properly
- Tasks can be completed
- Financial impact analysis runs
- Automation works as expected

---

### 4. Refinancing Opportunities Flow

**Objective**: Test proactive refinancing detection and tracking

#### Setup
1. Navigate to `/refinancing-hub` from Features Hub
2. Verify dashboard loads with opportunities

#### Test Steps
1. **View Opportunities Dashboard**
   - ✅ Verify summary cards display:
     - Active Opportunities count
     - Total Potential Savings
     - Average Savings Per Loan
   - ✅ Verify opportunities list shows detected loans

2. **Review Opportunity Details**
   - Click on an opportunity card
   - ✅ Verify detailed information:
     - Current loan terms
     - Recommended new terms
     - Estimated savings breakdown
     - Monthly vs. lifetime savings
   - ✅ Verify confidence score displayed

3. **Monitor Market Rates**
   - Switch to "Market Rates" tab
   - ✅ Verify rate chart displays current rates
   - ✅ Verify rate trends over time
   - ✅ Verify rate comparison by loan type

4. **Set Rate Alert**
   - Switch to "Rate Alerts" tab
   - Create new alert:
     - Select loan type
     - Set target rate threshold
     - Enable notifications
   - Click "Create Alert"
   - ✅ Verify alert saved
   - ✅ Verify alert appears in alerts list

5. **Review History**
   - Switch to "History" tab
   - ✅ Verify past refinancing actions logged
   - ✅ Verify actual savings tracked

**Expected Outcomes**:
- Opportunities detected and displayed
- Calculations are accurate
- Alerts can be created
- History tracked properly

---

## Cross-Feature Integration Tests

### 1. Digital Twin + Life Event Integration
- Create a Life Event execution
- Trigger financial impact analysis
- ✅ Verify Digital Twin profile data is used
- ✅ Verify simulation runs with user's actual financial state

### 2. Investment Manager + Refinancing Integration
- Configure investment mandate
- View refinancing opportunities
- ✅ Verify debt optimization considers investment strategy
- ✅ Verify risk tolerance affects recommendations

### 3. LifeSim + Life Event Integration
- Play LifeSim game
- Trigger major life event (marriage, home purchase)
- ✅ Verify corresponding playbook is suggested
- ✅ Verify game state informs playbook parameters

---

## Performance Testing

### Load Time Benchmarks
- **Features Hub**: Should load < 1s
- **LifeSim Dashboard**: Should load < 2s
- **Investment Manager**: Should load < 1.5s
- **Life Events**: Should load < 2s
- **Refinancing Hub**: Should load < 1.5s

### Database Query Performance
- All queries should complete < 500ms
- Complex aggregations < 1s
- Edge function calls < 3s

---

## Security Testing

### RLS Policy Verification
1. Create two test users
2. Have each create data in various tables
3. ✅ Verify users cannot see each other's data
4. ✅ Verify no unauthorized access possible

### Authentication Testing
1. Test protected routes without login
2. ✅ Verify redirect to login
3. Test with expired session
4. ✅ Verify proper re-authentication

---

## Error Handling Testing

### Network Errors
1. Disable internet connection
2. Trigger various actions
3. ✅ Verify user-friendly error messages
4. ✅ Verify no console errors break the app

### Invalid Input
1. Submit forms with invalid data
2. ✅ Verify validation messages
3. ✅ Verify form doesn't submit

### Edge Function Errors
1. Trigger edge function with invalid parameters
2. ✅ Verify graceful error handling
3. ✅ Verify user notified appropriately

---

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Chrome
- ✅ Mobile Safari

---

## Accessibility Testing

- ✅ Keyboard navigation works
- ✅ Screen reader announces properly
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA
- ✅ Form labels associated correctly

---

## Regression Testing Checklist

After each deployment, verify:
- [ ] All existing features still work
- [ ] No broken navigation links
- [ ] Database migrations applied successfully
- [ ] Edge functions deployed correctly
- [ ] No console errors on any page
- [ ] Authentication flow intact
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] Real-time updates work (if applicable)

---

## Bug Reporting Template

When filing bugs, include:
1. **Feature**: Which feature is affected
2. **Steps to Reproduce**: Exact steps to trigger the bug
3. **Expected Result**: What should happen
4. **Actual Result**: What actually happens
5. **Environment**: Browser, OS, device
6. **Console Errors**: Any errors from dev console
7. **Screenshots**: Visual evidence of the issue
8. **User Impact**: Severity (Critical/High/Medium/Low)

# Bills & Subscriptions System - Developer Documentation

## Architecture Overview

The Bills & Subscriptions feature provides automatic detection and management of recurring payments. It uses transaction pattern analysis to identify subscriptions and provides a comprehensive UI for tracking and managing them.

### Components
- **Frontend**: React components in `src/components/subscriptions/`
- **Backend**: Supabase database + Edge Functions
- **Detection Logic**: Pattern matching algorithm in `detect-subscriptions` edge function
- **State Management**: React Query for caching and mutations

## Database Schema

### detected_subscriptions

Main table storing detected subscription information.

```sql
CREATE TABLE public.detected_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  merchant TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'annual'
  last_charge_date TIMESTAMPTZ,
  next_expected_date TIMESTAMPTZ NOT NULL,
  category TEXT,
  confirmed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- 'active', 'paused'
  confidence NUMERIC DEFAULT 1.0, -- 0.0 to 1.0
  paused_at TIMESTAMPTZ,
  paused_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
- `idx_subscriptions_user_date` on `(user_id, next_expected_date)`
- `idx_subscriptions_status` on `(status)`

**RLS Policies**:
- Users can only view/modify their own subscriptions
- Based on `auth.uid() = user_id`

### subscription_events

Tracks history of subscription changes for audit trail.

```sql
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID NOT NULL REFERENCES detected_subscriptions(id),
  event_type TEXT NOT NULL, -- 'detected', 'paused', 'resumed', 'cancelled', etc.
  amount_cents BIGINT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Detection Algorithm

### Pattern Matching Process

1. **Fetch Transactions**: Query last 90 days of user transactions
2. **Group by Merchant**: Aggregate transactions by merchant name
3. **Identify Patterns**: Look for merchants with 2+ transactions
4. **Validate Similarity**: Check if amounts are within 10% variance
5. **Calculate Frequency**: Determine payment cadence (weekly/monthly/annual)
6. **Score Confidence**: Assign confidence based on multiple factors
7. **Create Subscription**: Insert new record if not already detected

### Confidence Scoring

Confidence is calculated based on:

```typescript
const calculateConfidence = (txCount, amountVariance, freqConsistency) => {
  let confidence = 0.5; // Base
  
  // Transaction count factor
  if (txCount >= 5) confidence += 0.3;
  else if (txCount >= 3) confidence += 0.2;
  else confidence += 0.1;
  
  // Amount variance factor
  if (amountVariance < 0.05) confidence += 0.15;
  else if (amountVariance < 0.1) confidence += 0.1;
  
  // Frequency consistency factor
  if (freqConsistency > 0.9) confidence += 0.15;
  else if (freqConsistency > 0.7) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
};
```

**Factors**:
- **Transaction Count**: More transactions = higher confidence
- **Amount Variance**: Less variance = higher confidence  
- **Frequency Consistency**: Regular intervals = higher confidence

### Frequency Detection

```typescript
const daysBetween = (lastDate - firstDate) / (transactions.length - 1);

if (daysBetween < 10) frequency = 'weekly';
else if (daysBetween > 300) frequency = 'annual';
else frequency = 'monthly';
```

## Custom Hooks

### useSubscriptions

Main hook for subscription data and mutations.

```typescript
import { useSubscriptions } from '@/hooks/useSubscriptions';

const {
  subscriptions,      // All subscriptions
  activeBills,        // Active only
  pausedBills,        // Paused only
  upcomingBills,      // Due in next 7 days
  overdueBills,       // Past due date
  monthlyTotal,       // Sum of monthly subscriptions
  isLoading,
  togglePause,        // Function to pause/resume
  deleteSubscription  // Function to delete
} = useSubscriptions();
```

**Computed Values**:
- `activeBills`: Filters `status !== 'paused'`
- `upcomingBills`: Filters `next_expected_date` within 7 days
- `overdueBills`: Filters `next_expected_date < now()`
- `monthlyTotal`: Sums amounts where `frequency === 'monthly'`

## Edge Functions

### detect-subscriptions

**Path**: `supabase/functions/detect-subscriptions/index.ts`

**Purpose**: Scans transaction history to detect recurring payments

**Endpoint**: `POST /functions/v1/detect-subscriptions`

**Authentication**: Requires valid JWT token

**Request Body**: None (uses authenticated user from token)

**Response**:
```json
{
  "success": true,
  "subscriptions_detected": 5,
  "subscriptions": [
    {
      "merchant": "Netflix",
      "amount": 15.99,
      "frequency": "monthly",
      "confidence": 0.95,
      "next_expected_date": "2025-12-01T00:00:00Z"
    }
  ]
}
```

**Error Response**:
```json
{
  "error": "Error message"
}
```

### Algorithm Steps

1. Authenticate user from JWT token
2. Query `transactions` table for last 90 days
3. Group transactions by `merchant`
4. For each merchant with 2+ transactions:
   - Calculate amount variance
   - Calculate frequency consistency
   - Compute confidence score
   - Check if already detected
   - Insert new subscription if not exists
5. Return count and details of new detections

## Components

### BillCard

**Purpose**: Display individual subscription with controls

**Props**:
```typescript
interface BillCardProps {
  subscription: Subscription;
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Features**:
- Shows merchant, amount, frequency, next date
- Pause/Resume button with icon animation
- Overdue indicator (red border)
- Low confidence warning banner
- Delete option in dropdown menu
- Smooth Framer Motion animations

### CalendarExport

**Purpose**: Generate and download .ics calendar file

**Props**:
```typescript
interface CalendarExportProps {
  subscriptions: Subscription[];
}
```

**How It Works**:
1. Filters out paused subscriptions
2. Generates iCalendar (RFC 5545) format
3. Creates recurring events (RRULE)
4. Adds 1-day-before reminders (VALARM)
5. Downloads as `.ics` file via Blob API

**iCalendar Format**:
```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:bill-{id}@saveplus.app
DTSTART:20251201T120000Z
SUMMARY:Netflix - $15.99
DESCRIPTION:monthly bill payment due
RRULE:FREQ=MONTHLY;COUNT=12
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Netflix payment due tomorrow
END:VALARM
END:VEVENT
END:VCALENDAR
```

### UpcomingBillsSection

**Purpose**: Collapsible section showing bills due within 7 days

**Props**:
```typescript
interface UpcomingBillsSectionProps {
  bills: Subscription[];
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Features**:
- Collapsible with animated chevron
- Filters bills with `next_expected_date <= now + 7 days`
- Shows count in header
- Renders `BillCard` for each upcoming bill

## Testing

### Integration Tests

**File**: `src/pages/__tests__/Subscriptions.integration.test.tsx`

**Test Coverage**:
- ✅ Renders empty state with scan CTA
- ✅ Displays active subscriptions correctly
- ✅ Shows "Due This Week" section for upcoming bills
- ✅ Highlights overdue bills with red border
- ✅ Displays low confidence warnings
- ✅ Pauses subscription on button click
- ✅ Resumes paused subscription
- ✅ Deletes subscription with confirmation
- ✅ Exports calendar successfully
- ✅ Detects subscriptions via edge function

### Component Tests

**BillCard Tests**:
```typescript
describe('BillCard', () => {
  it('renders subscription details', () => {
    // Merchant name, amount, frequency visible
  });
  
  it('shows overdue indicator when past due', () => {
    // Red border and "Overdue by X" text
  });
  
  it('displays low confidence warning', () => {
    // Yellow banner with percentage
  });
  
  it('toggles pause state on click', () => {
    // Calls onTogglePause with ID
  });
});
```

**CalendarExport Tests**:
```typescript
describe('CalendarExport', () => {
  it('generates valid ICS file', () => {
    // Contains VCALENDAR and VEVENT
  });
  
  it('excludes paused subscriptions', () => {
    // Only exports active bills
  });
  
  it('creates recurring events with RRULE', () => {
    // Proper frequency rules
  });
});
```

## Performance Optimizations

### React Query Caching

```typescript
queryClient.setQueryDefaults(['subscriptions'], {
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 30, // 30 minutes
});
```

### Computed Values Memoization

All computed values (`activeBills`, `upcomingBills`, etc.) are recalculated only when `subscriptions` array changes.

### Animation Performance

- Uses GPU-accelerated properties (`transform`, `opacity`)
- Respects `prefers-reduced-motion` media query
- Debounces rapid state changes

## Security Considerations

### Row-Level Security

All queries filtered by `auth.uid()`:

```sql
CREATE POLICY "Users view own subscriptions"
  ON detected_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### Edge Function Authentication

```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_ANON_KEY'),
  {
    global: {
      headers: {
        Authorization: req.headers.get('Authorization')!
      }
    }
  }
);

const { data: { user } } = await supabaseClient.auth.getUser();
if (!user) throw new Error('Not authenticated');
```

### Data Privacy

- Never log sensitive subscription data
- Sanitize merchant names before export
- Encrypt calendar files (HTTPS only)
- Auto-logout after 30 minutes of inactivity

## Troubleshooting

### Subscription Not Detected

**Possible Causes**:
1. Less than 2 transactions with merchant
2. Amount variance > 10%
3. Transactions older than 90 days
4. Different merchant names for same service

**Solution**:
- Check `transactions` table for correct data
- Verify merchant name consistency
- Run manual detection with longer lookback period

### Low Confidence Scores

**Causes**:
- Only 2-3 transactions detected
- Large amount variance
- Irregular payment dates

**Solution**:
- Wait for more transactions
- Manually verify and confirm subscription
- Consider allowing manual entry

### Calendar Export Not Working

**Debug Steps**:
1. Check browser console for errors
2. Verify `subscriptions` array not empty
3. Test ICS file syntax with online validator
4. Try different calendar app (compatibility issue)

## Future Enhancements

1. **Manual Entry**: Allow users to manually add subscriptions
2. **Amount History**: Track amount changes over time
3. **Cancellation Assistant**: Guide users through canceling unwanted services
4. **Price Alerts**: Notify when subscription amount increases
5. **Bulk Actions**: Pause/resume multiple subscriptions at once
6. **Merchant Logos**: Fetch and display merchant logos
7. **Category Breakdown**: Group subscriptions by type (streaming, utilities, etc.)
8. **Spending Insights**: "You spend X% on subscriptions"

---

## API Reference

### Subscription Type

```typescript
interface Subscription {
  id: string;
  user_id: string;
  merchant: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'annual';
  next_expected_date: string;
  last_charge_date?: string;
  category?: string;
  status?: 'active' | 'paused';
  confidence?: number; // 0.0 to 1.0
  confirmed?: boolean;
  paused_at?: string;
  paused_reason?: string;
  created_at?: string;
}
```

### useSubscriptions Hook

```typescript
function useSubscriptions(): {
  subscriptions: Subscription[];
  activeBills: Subscription[];
  pausedBills: Subscription[];
  upcomingBills: Subscription[];
  overdueBills: Subscription[];
  monthlyTotal: number;
  isLoading: boolean;
  error: Error | null;
  togglePause: (id: string) => void;
  deleteSubscription: (id: string) => void;
  isTogglingPause: boolean;
  isDeleting: boolean;
}
```

---

*For questions or contributions, contact the development team.*

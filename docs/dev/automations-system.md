# Automations System - Developer Documentation

## Architecture Overview

The Automations system provides users with automated savings features including scheduled deposits, round-ups, and safety rules. It's built on React Query for state management, Supabase for backend, and follows the $ave+ design system.

---

## Database Schema

### `automation_rules` Table

```sql
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'scheduled_transfer', 'round_up', etc.
  frequency TEXT CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
  start_date DATE,
  next_run_date TIMESTAMPTZ,
  last_run_date TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  action_config JSONB, -- { amount: number }
  trigger_condition JSONB, -- For safety rules
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automation_rules_user_active ON automation_rules(user_id, is_active);
CREATE INDEX idx_automation_rules_next_run ON automation_rules(next_run_date) WHERE is_active = true;
```

### `automation_execution_log` Table

Tracks execution history for analytics and debugging:

```sql
CREATE TABLE public.automation_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('success', 'failed', 'skipped')),
  amount_transferred NUMERIC(10, 2),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### `automation_settings` Table

User-level settings:

```sql
CREATE TABLE public.automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  round_up_enabled BOOLEAN DEFAULT false,
  auto_save_enabled BOOLEAN DEFAULT false,
  scheduled_transfer_frequency TEXT,
  scheduled_transfer_amount NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Components

### Core Components

#### `src/components/automations/AutomationCard.tsx`

Displays a single automation with actions.

**Props:**
```typescript
interface AutomationCardProps {
  automation: {
    id: string;
    rule_name: string;
    frequency: string;
    start_date: string;
    next_run_date?: string;
    is_active: boolean;
    action_config: { amount: number };
    notes?: string;
  };
  onEdit: (automation: any) => void;
  onDelete: (automation: any) => void;
  onToggle: (id: string, isActive: boolean) => void;
}
```

**Features:**
- Status badge (Active/Paused)
- Amount, frequency, and next run date display
- Edit, delete, and toggle actions
- Smooth hover animations
- Accessible ARIA labels

#### `src/components/automations/AutomationFormModal.tsx`

Form modal for creating/editing automations.

**Props:**
```typescript
interface AutomationFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    rule_name: string;
    frequency: string;
    start_date: string;
    action_config: { amount: number };
    notes?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}
```

**Validation:**
- Rule name required
- Amount must be > 0
- Start date must be today or future
- Real-time error display
- Prevents duplicate submissions

#### `src/components/automations/RoundUpsCard.tsx`

Displays round-ups feature with toggle.

**Props:**
```typescript
interface RoundUpsCardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  linkedAccount?: { name: string; last4: string };
  recentSavings?: number;
}
```

#### `src/components/automations/SafetyRulesCard.tsx`

Configure minimum balance protection.

**Props:**
```typescript
interface SafetyRulesCardProps {
  minBalance: number;
  onUpdate: (minBalance: number) => Promise<void>;
}
```

**Features:**
- Inline editing
- Validation (min $50)
- Visual feedback
- Keyboard accessible

#### `src/components/shared/ConfirmDialog.tsx`

Reusable confirmation dialog.

**Props:**
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}
```

---

## Custom Hooks

### `useAutomations`

Central hook for all automation CRUD operations.

**Location:** `src/hooks/useAutomations.ts`

**Returns:**
```typescript
{
  // Data
  automations: Automation[];
  scheduledAutomations: Automation[];
  roundUpAutomations: Automation[];
  activeCount: number;
  totalMonthlyAmount: number;
  estimatedMonthlyTotal: number;
  isLoading: boolean;
  
  // Methods
  create: (data: AutomationFormData) => Promise<void>;
  update: (data: AutomationFormData) => Promise<void>;
  delete: (id: string) => Promise<void>;
  toggle: ({ id, isActive }: { id: string; isActive: boolean }) => Promise<void>;
  
  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
}
```

**Usage:**
```typescript
import { useAutomations } from '@/hooks/useAutomations';

function MyComponent() {
  const {
    scheduledAutomations,
    activeCount,
    create,
    update,
    delete: deleteAutomation,
    toggle,
  } = useAutomations();
  
  // Create automation
  await create({
    rule_name: 'Weekly Savings',
    frequency: 'weekly',
    start_date: '2025-12-01',
    action_config: { amount: 50 },
    notes: 'Save for vacation',
  });
  
  // Toggle automation
  await toggle({ id: automation.id, isActive: automation.is_active });
}
```

---

## Analytics Events

Track user behavior for product insights:

```typescript
// Page view
trackEvent('page_view', { page: 'automations' });

// Automation created
trackEvent('automation_created', {
  frequency: 'weekly',
  amount: 50,
});

// Automation toggled
trackEvent('automation_toggled', {
  new_status: 'active', // or 'paused'
});

// Automation updated
trackEvent('automation_updated', {});

// Automation deleted
trackEvent('automation_deleted', {
  name: 'Weekly Savings',
});

// Round-ups toggled
trackEvent('round_ups_toggled', {
  enabled: true,
});

// Safety rule updated
trackEvent('safety_rule_updated', {
  min_balance: 200,
});
```

---

## Navigation Integration

Automation cards are integrated into related pages to drive discovery:

### Debts Page (`src/pages/Debts.tsx`)

Added after summary cards in Overview tab around line 190:
```tsx
<Card className="p-6 border-2 border-accent/50">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-xl bg-accent/10">
        <Timer className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Automate Debt Payments</h3>
        <p className="text-sm text-muted-foreground">
          Set up recurring payments to eliminate debt faster
        </p>
      </div>
    </div>
    <Button onClick={() => navigate('/automations')} variant="outline">
      Set Up <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </div>
</Card>
```

### Goals, Pots, Budget Pages

Similar cards added to each page with contextual copy.

---

## Testing

### Component Tests

**AutomationCard:**
```typescript
describe('AutomationCard', () => {
  it('renders automation details', () => {
    // Test rendering
  });
  
  it('calls onEdit when edit button clicked', () => {
    // Test edit action
  });
  
  it('calls onToggle when toggle button clicked', () => {
    // Test toggle action
  });
  
  it('shows correct badge for active/paused status', () => {
    // Test status display
  });
});
```

**AutomationFormModal:**
```typescript
describe('AutomationFormModal', () => {
  it('validates required fields', () => {
    // Test validation
  });
  
  it('submits form with valid data', () => {
    // Test submission
  });
  
  it('shows errors for invalid amounts', () => {
    // Test error display
  });
  
  it('prevents future date validation error', () => {
    // Test date validation
  });
});
```

### Integration Tests

**Automations Page:**
```typescript
describe('Automations Page', () => {
  it('displays empty state when no automations', () => {
    // Test empty state
  });
  
  it('creates new automation', async () => {
    // Test creation flow
  });
  
  it('edits existing automation', async () => {
    // Test edit flow
  });
  
  it('deletes automation with confirmation', async () => {
    // Test delete flow
  });
  
  it('toggles automation active status', async () => {
    // Test toggle
  });
  
  it('tracks analytics events', () => {
    // Test analytics
  });
});
```

---

## Performance Considerations

### Query Optimization

- **React Query caching**: 5-minute stale time for automation lists
- **Selective refetching**: Only invalidate specific query keys
- **Parallel mutations**: Multiple updates processed concurrently

### Database Indexes

- `idx_automation_rules_user_active`: Fast user-specific active automations lookup
- `idx_automation_rules_next_run`: Efficient scheduling queries
- `idx_automation_log_rule`: Quick execution history retrieval

### Bundle Size

- Lazy-loaded analytics module
- Tree-shakeable utility functions
- Minimal external dependencies

---

## Security

### RLS Policies

```sql
-- Users can only view their own automations
CREATE POLICY "Users view own automations"
  ON automation_rules FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create their own automations
CREATE POLICY "Users create own automations"
  ON automation_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own automations
CREATE POLICY "Users update own automations"
  ON automation_rules FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own automations
CREATE POLICY "Users delete own automations"
  ON automation_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Execution logs
CREATE POLICY "Users view own execution logs"
  ON automation_execution_log FOR SELECT
  USING (auth.uid() = user_id);
```

### Input Validation

- Server-side validation via Supabase CHECK constraints
- Client-side validation via Zod schemas
- SQL injection prevention via parameterized queries
- XSS prevention via React's built-in escaping

### Amount Limits

- Maximum automation amount: $10,000
- Minimum amount: $0.01
- Safety rule minimum: $50

---

## Future Enhancements

### Phase 1 (Q1 2026)
- [ ] Goal-specific automations
- [ ] Conditional rules ("If balance > $X, save $Y")
- [ ] Multiple linked accounts
- [ ] Bulk pause/resume

### Phase 2 (Q2 2026)
- [ ] AI-powered amount suggestions
- [ ] Smart scheduling based on cash flow
- [ ] Performance dashboard
- [ ] Automation templates

### Phase 3 (Q3 2026)
- [ ] Auto-invest integration
- [ ] Round-up multipliers (2x, 3x spare change)
- [ ] Custom frequency (every N days)
- [ ] Vacation mode

---

## Troubleshooting

### Common Issues

**Automation doesn't execute:**
1. Check `is_active` status
2. Verify `next_run_date` is set
3. Check execution logs for errors
4. Ensure user has sufficient balance

**Toggle doesn't update UI:**
1. Verify React Query cache invalidation
2. Check network tab for API errors
3. Ensure optimistic updates are configured

**Form validation errors:**
1. Check Zod schema matches backend constraints
2. Verify error messages are user-friendly
3. Test edge cases (boundary values, etc.)

---

## API Reference

### Create Automation

```typescript
POST /automation_rules
{
  user_id: UUID,
  rule_name: string,
  rule_type: 'scheduled_transfer',
  frequency: 'weekly' | 'bi-weekly' | 'monthly',
  start_date: DATE,
  action_config: { amount: number },
  notes?: string,
  is_active: boolean
}
```

### Update Automation

```typescript
PATCH /automation_rules/:id
{
  rule_name?: string,
  frequency?: string,
  start_date?: DATE,
  action_config?: { amount: number },
  notes?: string
}
```

### Delete Automation

```typescript
DELETE /automation_rules/:id
```

### Toggle Automation

```typescript
PATCH /automation_rules/:id
{
  is_active: boolean
}
```

---

## Contributing

### Code Style

- Follow $ave+ TypeScript conventions
- Use semantic tokens for colors
- Write accessible components (ARIA labels)
- Add JSDoc comments for complex functions
- Keep functions under 50 lines

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Analytics events tracked
- [ ] Documentation updated
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Responsive design verified

---

*Last Updated: November 2025*
*Maintained by: $ave+ Engineering Team*

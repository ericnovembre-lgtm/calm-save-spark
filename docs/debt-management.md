# Debt Management Feature Documentation

## Overview

The Debt Management feature provides comprehensive tools for tracking, analyzing, and strategizing debt payoff in the $ave+ application. It includes interactive simulators, analytics, progress tracking, and AI-powered coaching.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [API Integration](#api-integration)
4. [Database Schema](#database-schema)
5. [User Workflows](#user-workflows)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Component Structure

```
src/
├── components/
│   └── debt/
│       ├── DebtCard.tsx                 # Individual debt display
│       ├── CreateDebtModal.tsx          # Add/edit debt form
│       ├── PayoffSimulator.tsx          # Strategy comparison
│       ├── DebtAnalytics.tsx            # Charts and insights
│       ├── PayoffTimeline.tsx           # Progress visualization
│       ├── ContextualCoachTip.tsx       # AI tips
│       └── DebtPayoffChart.tsx          # Recharts visualization
├── hooks/
│   ├── useDebts.ts                      # Debt CRUD operations
│   ├── useDebtPayments.ts               # Payment tracking
│   └── useDebtSimulation.ts             # Payoff calculations
└── pages/
    └── Debts.tsx                         # Main page with tabs
```

### Data Flow

```
User Action → React Component → Custom Hook → Supabase Client → Database
                     ↓
                React Query (caching + optimistic updates)
                     ↓
                UI Update
```

---

## Components

### 1. DebtCard

**Purpose:** Display individual debt with progress and quick actions

**Props:**
```typescript
interface DebtCardProps {
  debt: Debt;
  payments: DebtPayment[];
  onUpdate: (updates: Partial<Debt>) => void;
  onDelete: () => void;
  onEdit: () => void;
}
```

**Features:**
- Progress bar showing % paid off
- Debt type badge (color-coded)
- Interest rate, minimum payment, actual payment
- Expandable payment history (last 3 payments)
- Edit and delete actions
- Hover animations with Framer Motion

**Styling:**
- Uses `Card` component from shadcn/ui
- Semantic tokens: `background`, `foreground`, `border`, `primary`
- Responsive hover effects with shadow elevation

---

### 2. CreateDebtModal

**Purpose:** Form for adding or editing debts

**Props:**
```typescript
interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  debt?: Debt | null;
}
```

**Form Fields:**
- Debt name (required)
- Debt type (select: credit_card, student_loan, etc.)
- Current balance (required)
- Original balance (optional, defaults to current balance)
- Interest rate (%)
- Minimum payment
- Actual payment (defaults to minimum)
- Payoff strategy (avalanche/snowball)

**Validation:**
- Name must not be empty
- Balance must be positive number
- All numeric fields parsed as floats

---

### 3. PayoffSimulator

**Purpose:** Compare Avalanche vs Snowball strategies

**Features:**
- Side-by-side comparison cards
- Extra payment slider (0-1000)
- Real-time calculation via edge function
- Display: time to payoff, total interest, total paid
- Chart visualization of debt reduction over time

**Edge Function Integration:**
```typescript
const response = await fetch(
  `${VITE_SUPABASE_URL}/functions/v1/debt-payoff-simulator`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ strategy: 'avalanche', extraPayment: 100 })
  }
);
```

---

### 4. DebtAnalytics

**Purpose:** Visual insights into debt composition and payment history

**Charts:**
- **Pie Chart:** Debt by type (uses Recharts)
- **Area Chart:** Payment history over time (last 12 payments)

**Metrics:**
- Total paid across all debts
- Estimated interest paid (calculated from current balances)
- Number of debt types

**Design:**
- Uses HSL color palette from design tokens
- Respects `prefers-reduced-motion`
- Responsive chart containers

---

### 5. PayoffTimeline

**Purpose:** Visual journey to debt freedom

**Features:**
- Progress bar showing % complete
- Milestone markers: 25%, 50%, 75%, 100%
- Animated checkmarks for completed milestones
- Individual debt progress bars
- Celebratory messaging

**Calculations:**
```typescript
const totalOriginal = debts.reduce((sum, d) => sum + Number(d.original_balance || d.current_balance), 0);
const totalCurrent = debts.reduce((sum, d) => sum + Number(d.current_balance), 0);
const totalPaid = totalOriginal - totalCurrent;
const progressPercent = (totalPaid / totalOriginal) * 100;
```

---

### 6. ContextualCoachTip

**Purpose:** AI-powered contextual guidance

**Tip Categories:**
- **Strategy:** High interest rate alerts
- **Motivation:** Near-payoff encouragement
- **Optimization:** Payment suggestions
- **Celebration:** Progress recognition

**Tip Generation Logic:**
```typescript
// High interest rate tip
if (debt.interest_rate > 20) {
  return { category: 'strategy', message: '...' }
}

// Near payoff tip
if (progress > 80 && balance < 1000) {
  return { category: 'motivation', message: '...' }
}

// Extra payment celebration
if (actual_payment > minimum_payment) {
  return { category: 'celebration', message: '...' }
}
```

---

## API Integration

### Custom Hooks

#### useDebts()

```typescript
const {
  debts,           // Array of Debt objects
  isLoading,       // Loading state
  error,           // Error object
  addDebt,         // (data) => void
  updateDebt,      // ({ id, updates }) => void
  deleteDebt,      // (id) => void
} = useDebts();
```

**Queries:**
- Fetches debts with `status='active'`
- Orders by `interest_rate` descending
- Filters by authenticated user ID

**Mutations:**
- Invalidates `['debts']` and `['debt_simulation']` queries on success
- Shows toast notifications for user feedback

---

#### useDebtPayments(debtId?)

```typescript
const {
  payments,        // Array of DebtPayment objects
  isLoading,
  error,
  addPayment,      // (data) => void
} = useDebtPayments(debtId);
```

**Features:**
- Optional filtering by `debtId`
- Joins with `debts` table to get debt name
- Orders by `payment_date` descending

---

## Database Schema

### debts Table

**Columns:**
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key, indexed)
- `debt_name`: TEXT (required)
- `debt_type`: TEXT (enum: credit_card, student_loan, mortgage, etc.)
- `current_balance`: NUMERIC (required)
- `original_balance`: NUMERIC (for progress tracking)
- `interest_rate`: NUMERIC (annual %)
- `minimum_payment`: NUMERIC
- `actual_payment`: NUMERIC (user's actual monthly payment)
- `payoff_strategy`: TEXT (avalanche/snowball)
- `principal_amount`: NUMERIC
- `status`: TEXT (enum: active, closed, paid_off) **NEW**
- `created_at`: TIMESTAMP WITH TIME ZONE
- `target_payoff_date`: TIMESTAMP WITH TIME ZONE

**Indexes:**
- `idx_debts_status` on `status`
- `idx_debts_user_status` on `(user_id, status)`

**RLS Policies:**
- Users can SELECT, INSERT, UPDATE, DELETE their own debts
- Row-level security enabled
- Policy: `auth.uid() = user_id`

---

### debt_payment_history Table

**Columns:**
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `debt_id`: UUID (foreign key → debts.id)
- `amount`: NUMERIC (required)
- `payment_date`: TIMESTAMP WITH TIME ZONE (required)
- `payment_method`: TEXT
- `notes`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

**RLS Policies:**
- Users can SELECT, INSERT their own payments
- Policy: `auth.uid() = user_id`

---

## User Workflows

### 1. Add New Debt

```
User clicks "Add Debt" 
  → CreateDebtModal opens 
  → User fills form 
  → User clicks "Add Debt" 
  → useDebts().addDebt() called 
  → Supabase INSERT 
  → React Query invalidates cache 
  → UI updates with new debt card
```

### 2. Simulate Payoff Strategy

```
User navigates to "Payoff Simulator" tab 
  → PayoffSimulator component loads 
  → User adjusts "Extra Payment" slider 
  → useQuery fetches simulation from edge function 
  → Results displayed in comparison cards 
  → Chart visualizes debt reduction timeline
```

### 3. Track Payment

```
User clicks "Record Payment" on DebtCard (future feature)
  → Payment modal opens 
  → User enters amount and date 
  → useDebtPayments().addPayment() called 
  → Supabase INSERT 
  → Debt balance updated 
  → Payment appears in "Recent Payments"
```

### 4. Delete Debt

```
User clicks delete icon on DebtCard 
  → Confirmation dialog appears 
  → User confirms 
  → useDebts().deleteDebt() called 
  → Supabase UPDATE (status='closed') 
  → React Query invalidates cache 
  → Debt card removed from UI
```

---

## Testing

### Integration Tests

**File:** `src/pages/__tests__/Debts.integration.test.tsx`

**Coverage:**
- ✅ Page rendering with header and summary cards
- ✅ Empty state display when no debts
- ✅ Tab navigation (Overview, Simulator, Analytics, Timeline)
- ✅ Debt CRUD operations (create, update, delete)
- ✅ Summary calculations (total debt, avg interest, extra payment)
- ✅ Help panel toggle
- ✅ Accessibility (ARIA labels, keyboard navigation)

**Running Tests:**
```bash
npm run test -- Debts.integration.test.tsx
```

---

### Manual Testing Checklist

#### Functionality
- [ ] Create new debt with all fields
- [ ] Edit existing debt
- [ ] Delete debt with confirmation
- [ ] Switch between all tabs
- [ ] Adjust extra payment slider in simulator
- [ ] View charts in analytics tab
- [ ] Check milestone progress in timeline tab

#### UI/UX
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Dark mode compatibility
- [ ] Modal overlay works correctly
- [ ] Progress bars animate smoothly
- [ ] Hover effects on debt cards
- [ ] Empty state displays correctly

#### Accessibility
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader announces actions
- [ ] Focus management in modals
- [ ] ARIA labels on icon buttons
- [ ] Color contrast meets WCAG 2.1 AA

---

## Troubleshooting

### Common Issues

#### 1. Debts not loading

**Symptoms:** Empty state shows even with debts in database

**Causes:**
- RLS policies blocking query
- User not authenticated
- Status filter excluding active debts

**Solution:**
```typescript
// Check RLS policies in Supabase dashboard
// Verify user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Check status field in database
SELECT * FROM debts WHERE user_id = '...' AND status = 'active';
```

---

#### 2. Simulator not returning data

**Symptoms:** Loading spinner never resolves, no comparison cards

**Causes:**
- Edge function not deployed
- Incorrect API endpoint
- Session token expired

**Solution:**
```typescript
// Check edge function deployment
// Verify environment variables
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);

// Test edge function directly
curl -X POST \
  https://[PROJECT_REF].supabase.co/functions/v1/debt-payoff-simulator \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"strategy":"avalanche","extraPayment":100}'
```

---

#### 3. Charts not rendering

**Symptoms:** Blank space where chart should be

**Causes:**
- Missing Recharts dependency
- Invalid data format
- Container size not set

**Solution:**
```bash
# Ensure Recharts is installed
npm list recharts

# Check data format
console.log('Chart data:', paymentHistory);

# Verify ResponsiveContainer has height
<ResponsiveContainer width="100%" height={300}>
```

---

#### 4. Progress bar not animating

**Symptoms:** Progress bar appears instantly without animation

**Causes:**
- `prefers-reduced-motion` enabled
- Framer Motion not installed
- Initial/animate props missing

**Solution:**
```typescript
// Check user's motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Add animation props to motion.div
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.8, ease: 'easeOut' }}
>
```

---

## Performance Optimization

### Current Optimizations

1. **React Query Caching:**
   - Debts cached for 5 minutes
   - Simulations cached by strategy + extraPayment
   - Stale-while-revalidate pattern

2. **Lazy Loading:**
   - Charts only render when tab is active
   - `DebtPayoffChart` uses code splitting

3. **Memoization:**
   - Summary calculations memoized with `useMemo`
   - Expensive filters cached

### Future Improvements

- [ ] Virtualize debt list for users with 50+ debts
- [ ] Debounce extra payment slider (500ms)
- [ ] Add loading skeletons for charts
- [ ] Implement infinite scroll for payment history

---

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast
- ✅ Text: 4.5:1 minimum contrast
- ✅ UI components: 3:1 minimum contrast
- ✅ Focus indicators: 3:1 minimum contrast

#### Keyboard Navigation
- ✅ Tab order follows logical flow
- ✅ Enter/Space activate buttons
- ✅ Escape closes modals
- ✅ Arrow keys navigate slider

#### Screen Readers
- ✅ ARIA labels on icon-only buttons
- ✅ Live regions announce toast notifications
- ✅ Progress bars have aria-valuenow
- ✅ Modals trap focus and have aria-describedby

#### Motion
- ✅ Respects `prefers-reduced-motion`
- ✅ Animations can be disabled
- ✅ No auto-playing animations

---

## Design System Integration

### $ave+ Theme Tokens

```css
/* Colors */
--background: hsl(45, 29%, 97%)      /* #faf8f2 off-white */
--foreground: hsl(0, 0%, 4%)         /* #0a0a0a black */
--accent: hsl(40, 27%, 70%)          /* #d6c8a2 light beige */
--primary: hsl(var(--primary))       /* Defined in tailwind.config.ts */
--secondary: hsl(var(--secondary))
--muted: hsl(var(--muted))
--border: hsl(var(--border))

/* Spacing */
--spacing-4: 16px
--spacing-6: 24px

/* Border Radius */
--radius: 16px
--radius-lg: 24px

/* Shadows */
box-shadow: 0 4px 12px -4px hsl(var(--primary) / 0.1)

/* Transitions */
transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1)
```

---

## Contributing

### Code Style

- Use TypeScript for all new files
- Follow existing file structure
- Use semantic HTML (`<Card>` not `<div className="card">`)
- Prefer composition over prop drilling
- Extract reusable logic into custom hooks

### Commit Guidelines

```
feat(debt): add payment recording feature
fix(debt): correct progress bar calculation
docs(debt): update API integration section
test(debt): add tests for PayoffSimulator
```

### Pull Request Checklist

- [ ] All tests pass (`npm run test`)
- [ ] Code follows style guide
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Accessibility verified with screen reader

---

## License

MIT License - see LICENSE file for details

## Contact

For questions or issues, contact the $ave+ development team.

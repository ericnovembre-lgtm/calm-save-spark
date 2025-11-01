# Pay What You Want Subscription System

## Overview
This document describes the implementation of the flexible $1-$15/month subscription system for $ave+.

## Architecture

### Database Schema

#### `user_subscriptions`
Stores user subscription data:
- `subscription_amount`: Numeric value between 0-15
- `billing_interval`: 'monthly' or 'annual'
- `status`: 'active', 'canceled', 'past_due', 'trialing'
- `stripe_customer_id` & `stripe_subscription_id`: Payment integration
- `trial_end_date`: 14-day free trial tracking

#### `feature_access`
Cached computed features per user:
- `features`: JSONB object containing all feature flags and limits
- Auto-updated via trigger when subscription changes

#### `subscription_history`
Audit trail of all subscription changes:
- `previous_amount` & `new_amount`
- `change_reason`: Why the subscription changed
- Timestamp tracking

#### `user_roles`
Role-based access control:
- Enum type: 'admin' | 'user'
- Separate table for security (prevents privilege escalation)
- Used with `has_role()` security definer function

### Database Functions

#### `compute_user_features(sub_amount numeric)`
- Pure function that calculates features based on amount
- Returns JSONB with all feature flags and limits
- Progressive unlocking: each $1 adds features

#### `update_feature_access()`
- Trigger function on `user_subscriptions` changes
- Automatically recomputes and caches features
- Ensures feature access is always in sync

#### `log_subscription_change()`
- Audit trigger for subscription modifications
- Creates history records automatically

#### `has_role(_user_id uuid, _role app_role)`
- Security definer function for RLS policies
- Prevents recursive RLS checks
- Used in admin-only policies

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can view/update own subscriptions
- Admins can view all subscriptions (for support)
- Feature access is read-only (computed server-side)
- Subscription history is append-only

## Feature Unlocking Map

| Price | Features |
|-------|----------|
| $0    | 3 goals, 5 pots, 3.5% APY, basic automation |
| $1    | 5 goals, 3.75% APY |
| $2    | 10 pots, spending insights |
| $3    | 7 goals, 2 automation rules |
| $4    | 4.0% APY, export transactions |
| $5    | 10 goals, AI savings tips |
| $6    | 15 pots, analytics dashboard |
| $7    | 5 automation rules, advanced automation |
| $8    | Priority support, weekly reports |
| $9    | Unlimited goals, 4.15% APY |
| $10   | Unlimited pots, AI coach (10 chats/mo) |
| $11   | Virtual card, 1% cashback |
| $12   | Advanced AI insights, predictive analytics |
| $13   | Physical card, 1.5% cashback |
| $14   | Phone support, early access |
| $15   | 4.25% APY, unlimited AI, 2% cashback, API access |

## Frontend Implementation

### Hooks

#### `useFeatureAccess()`
- Fetches user's current features from `feature_access` table
- Subscribes to real-time updates
- Returns features, loading state, and subscription amount
- Provides default free tier when not authenticated

#### `useFeatureLimits()`
- Combines `useFeatureAccess` with actual usage counts
- Fetches current goals, pots, automation rules from database
- Calculates remaining capacity
- Provides `canCreate()` helpers
- Generates contextual upgrade messages

#### `useSubscriptionValidation()`
- Security validation for subscription changes
- Prevents invalid amounts (must be 0-15)
- Checks if downgrade would violate current usage
- Rate limits subscription changes (max 1 per 10 days)

### Components

#### `<FeatureGate>`
- Conditionally renders content based on feature access
- Shows upgrade prompt when feature is locked
- Used to protect premium features

#### `<UpgradePrompt>`
- Beautiful upgrade call-to-action
- Shows suggested pricing tier
- Displays features that would be unlocked
- Tracks analytics on view and click

#### `<LimitIndicator>`
- Progress bar showing usage vs limit
- Displays "Unlimited" for max tiers
- Warning when approaching limit
- Inline upgrade button

#### `<LoadingState>`
- Skeleton loading states
- Multiple variants: page, card, list, inline
- Consistent loading UX across app

#### `<ErrorBoundary>`
- Catches React errors gracefully
- Logs to analytics
- Provides recovery options
- Shows error details in development

### Pages

#### `/pricing`
- Interactive slider ($0-$15)
- Real-time feature preview
- Annual/monthly toggle (15% discount)
- Quick select buttons
- Comparison cards (current/selected/max)
- FAQ accordion
- Full analytics tracking

#### `/checkout`
- Order summary with features
- Trust indicators (security badges)
- Stripe integration ready
- Trial information
- Upgrade prompt component

#### `/subscription`
- Subscription management dashboard
- Change plan with slider
- View current features
- Billing history
- Next billing date
- Cancel/reactivate options

#### `/goals`, `/pots`, `/automations`
- Feature-specific pages with limits
- Limit indicators at top
- Create buttons with validation
- Upgrade prompts when at limit
- Empty states with CTAs

## Analytics Tracking

All subscription events are tracked via `trackSubscriptionEvent`:

### Pricing Interactions
- `subscription_slider_interaction`: Slider movements
- `subscription_quick_select`: Quick amount buttons
- `subscription_billing_toggle`: Annual/monthly switch
- `subscription_page_viewed`: Pricing page views

### Checkout Flow
- `subscription_checkout_started`: User begins checkout
- `subscription_checkout_completed`: Successful payment
- `subscription_checkout_abandoned`: User leaves checkout

### Subscription Lifecycle
- `subscription_created`: New subscription
- `subscription_upgraded`: Increase amount
- `subscription_downgraded`: Decrease amount
- `subscription_canceled`: Cancellation

### Feature Gates
- `feature_limit_reached`: User hits limit
- `upgrade_prompt_shown`: Prompt displayed
- `upgrade_prompt_clicked`: User clicks upgrade
- `premium_feature_used`: Premium feature usage

### Trials
- `trial_started`: Free trial begins
- `trial_ending_reminder`: Trial ending soon
- `trial_converted`: Trial → paid
- `trial_canceled`: Trial canceled

## Security Considerations

### Server-Side Validation
- Never trust client-side feature checks
- Always validate via RLS policies
- Use `feature_access` table as source of truth
- Validate subscription amounts server-side

### Rate Limiting
- Max 1 subscription change per 10 days
- Tracked in localStorage (client) and should be enforced server-side
- Prevents subscription abuse

### Downgrade Protection
- Check current usage before allowing downgrade
- Prevent users from being locked out of content
- Show clear error messages

### Role-Based Access
- Admin features use `has_role()` security definer
- Separate `user_roles` table prevents privilege escalation
- RLS policies enforce role checks

## Performance Optimizations

### Memoization
- Callbacks memoized with `useCallback`
- Prevents unnecessary re-renders
- Slider changes throttled

### Real-Time Updates
- Supabase real-time for feature access
- Only updates when subscription changes
- Efficient channel management

### Caching
- `feature_access` table caches computed features
- Avoids recomputing on every request
- Automatically invalidated via triggers

### Loading States
- Skeleton loaders prevent layout shifts
- Progressive enhancement
- Optimistic UI updates

## Error Handling

### Error Boundary
- Top-level error catching
- Graceful degradation
- Error reporting to analytics
- Recovery options

### Form Validation
- Client-side validation for UX
- Server-side validation for security
- Clear error messages
- Inline validation feedback

### Edge Cases
- Unauthenticated users → free tier
- Missing subscription → create default
- Invalid amounts → reject with error
- Database errors → fallback to defaults

## Testing Checklist

### Functional Tests
- [ ] Can create subscription at each tier ($0-$15)
- [ ] Features unlock correctly at each tier
- [ ] Upgrade immediately grants access
- [ ] Downgrade respects current billing period
- [ ] Cannot downgrade below current usage
- [ ] Limit indicators show correct values
- [ ] Feature gates block/allow correctly
- [ ] Upgrade prompts show at limits
- [ ] Analytics events fire correctly

### Security Tests
- [ ] RLS policies enforce access control
- [ ] Cannot access other users' subscriptions
- [ ] Cannot manipulate feature_access directly
- [ ] Admin-only features require admin role
- [ ] Invalid amounts rejected server-side
- [ ] Rate limiting prevents abuse

### Edge Cases
- [ ] Unauthenticated user experience
- [ ] First subscription creation
- [ ] Subscription with usage (goals/pots)
- [ ] Network errors during checkout
- [ ] Concurrent subscription changes
- [ ] Expired trials
- [ ] Past due payments

### UX Tests
- [ ] Loading states show properly
- [ ] Error messages are clear
- [ ] Animations respect reduced motion
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

## Deployment Checklist

### Database
- [ ] Run migration to create tables
- [ ] Verify RLS policies active
- [ ] Test database functions
- [ ] Check triggers fire correctly

### Frontend
- [ ] Error boundary wraps app
- [ ] Analytics configured
- [ ] Feature flags set
- [ ] Environment variables set

### Stripe Integration
- [ ] Enable Stripe in Lovable
- [ ] Configure webhook endpoint
- [ ] Test checkout flow
- [ ] Verify payment capture
- [ ] Test subscription updates

### Monitoring
- [ ] Analytics dashboard set up
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Database query optimization

## Future Enhancements

### Phase 5 Improvements
- [ ] Custom subscription amounts (beyond $1 increments)
- [ ] Team/family plans
- [ ] Gift subscriptions
- [ ] Referral discounts
- [ ] Seasonal promotions
- [ ] Usage-based pricing (pay for what you use)
- [ ] Add-on features (à la carte)

### Advanced Features
- [ ] Subscription pause/resume
- [ ] Payment method management in-app
- [ ] Invoice downloads
- [ ] Tax handling (international)
- [ ] Multiple payment methods
- [ ] Billing address management

### Analytics Dashboard
- [ ] Subscription distribution chart
- [ ] Conversion funnel visualization
- [ ] Churn prediction
- [ ] Revenue forecasting
- [ ] Feature usage heatmap
- [ ] Cohort analysis

## Support & Troubleshooting

### Common Issues

**User can't access feature they paid for:**
1. Check `feature_access` table - may need manual refresh
2. Verify subscription status is 'active'
3. Check RLS policies on feature tables
4. Look for errors in browser console

**Subscription change not reflected:**
1. Check `subscription_history` for change record
2. Verify trigger fired (`update_feature_access`)
3. Check `feature_access.computed_at` timestamp
4. Refresh user's feature cache

**Downgrade blocked:**
1. Check current usage (goals, pots, rules)
2. Compare to new tier limits
3. Guide user to reduce usage first
4. Show clear error message

**Analytics not tracking:**
1. Verify PostHog configured
2. Check browser console for errors
3. Test with PostHog debug mode
4. Verify event payload structure

### Debug Tools

```typescript
// Check user's current features
const { data } = await supabase
  .from('feature_access')
  .select('*')
  .eq('user_id', userId)
  .single();
console.log('Features:', data.features);

// Force recompute features
const { data: sub } = await supabase
  .from('user_subscriptions')
  .select('subscription_amount')
  .eq('user_id', userId)
  .single();

const { data: recomputed } = await supabase
  .rpc('compute_user_features', { sub_amount: sub.subscription_amount });
console.log('Recomputed:', recomputed);
```

## Contact

For questions or issues:
- Check this documentation first
- Review analytics for user behavior insights
- Check Supabase logs for backend errors
- Contact development team with specifics

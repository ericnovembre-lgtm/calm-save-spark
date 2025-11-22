# Phase 5: Database Schema Additions 🗄️

## Overview
Comprehensive database schema enhancements to support AI-powered transaction insights, user tagging, pattern detection, and smart alerts.

## New Tables

### 1. transaction_insights
**Purpose:** Store AI-generated insights about spending patterns and financial behavior.

**Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- insight_type: TEXT (type of insight)
- title: TEXT (insight headline)
- description: TEXT (detailed explanation)
- data: JSONB (supporting data)
- priority: TEXT (low, medium, high, critical)
- status: TEXT (active, dismissed, acted_on)
- acted_on_at: TIMESTAMPTZ
- dismissed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Insight Types:**
- `overspending`: User is exceeding budget in a category
- `savings_opportunity`: Detected opportunity to save money
- `recurring_charge`: New recurring charge detected
- `unusual_activity`: Unusual spending pattern
- `category_trend`: Spending trend in a category

**Use Cases:**
- Display actionable insights on dashboard
- Notify users of important financial patterns
- Track whether users act on insights

**Indexes:**
- `idx_transaction_insights_user_status`: Fast filtering by user and status
- `idx_transaction_insights_type`: Query by insight type

**RLS Policies:**
- Users can view/update their own insights
- System can insert insights for users

---

### 2. transaction_tags
**Purpose:** Allow users to create custom tags for organizing transactions.

**Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- tag_name: TEXT (unique per user)
- color: TEXT (hex color for tag)
- created_at: TIMESTAMPTZ
```

**Use Cases:**
- Custom transaction organization (e.g., "Business Trip", "Wedding")
- Multi-dimensional categorization beyond default categories
- Personal financial tracking systems

**Constraints:**
- `unique_user_tag`: Prevents duplicate tag names per user

**RLS Policies:**
- Full CRUD access for users' own tags

---

### 3. transaction_tag_assignments
**Purpose:** Junction table linking transactions to tags (many-to-many).

**Schema:**
```sql
- id: UUID (primary key)
- transaction_id: UUID (foreign key to transactions)
- tag_id: UUID (foreign key to transaction_tags)
- assigned_at: TIMESTAMPTZ
- assigned_by: UUID (foreign key to auth.users)
```

**Use Cases:**
- Apply multiple tags to a single transaction
- Track who assigned tags (for shared budgets)
- Query transactions by tag

**Constraints:**
- `unique_transaction_tag`: Prevents duplicate tag assignments

**Indexes:**
- `idx_transaction_tag_assignments_transaction`: Fast transaction → tags lookup
- `idx_transaction_tag_assignments_tag`: Fast tag → transactions lookup

**RLS Policies:**
- Users can view/modify tag assignments on their transactions

---

### 4. spending_patterns
**Purpose:** Track recurring spending patterns detected by AI.

**Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- pattern_type: TEXT (recurring, seasonal, unusual, trend)
- merchant: TEXT (optional merchant name)
- category: TEXT (optional category)
- frequency: TEXT (e.g., "monthly", "weekly")
- average_amount: DECIMAL(10, 2)
- confidence_score: DECIMAL(3, 2)
- first_detected_at: TIMESTAMPTZ
- last_occurrence_at: TIMESTAMPTZ
- occurrence_count: INTEGER
- metadata: JSONB
- is_active: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Pattern Types:**
- `recurring`: Regular charges (subscriptions, rent)
- `seasonal`: Patterns tied to time of year
- `unusual`: Anomalous spending behavior
- `trend`: Increasing/decreasing spending trends

**Use Cases:**
- Detect subscription services
- Identify seasonal spending patterns (e.g., holiday shopping)
- Alert on unusual spending
- Forecast future spending

**Indexes:**
- `idx_spending_patterns_user_active`: Query active patterns by type

**RLS Policies:**
- Users can view and manage their own patterns

---

### 5. merchant_category_mappings
**Purpose:** Store AI-learned merchant to category mappings.

**Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (nullable - global mappings)
- merchant_name: TEXT
- category: TEXT
- confidence_score: DECIMAL(3, 2)
- times_applied: INTEGER
- is_user_confirmed: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Use Cases:**
- Auto-categorize new transactions from known merchants
- Learn from user categorization corrections
- Share category mappings across users (global)
- Improve categorization accuracy over time

**Constraints:**
- `unique_user_merchant_category`: One mapping per user-merchant combo

**Indexes:**
- `idx_merchant_category_mappings_merchant`: Fast merchant lookup
- `idx_merchant_category_mappings_user`: User-specific mappings

**RLS Policies:**
- Users can view global and their own mappings
- Users can create/update their own mappings

---

### 6. smart_alerts
**Purpose:** Store AI-generated alerts about spending anomalies and opportunities.

**Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- alert_type: TEXT (budget_risk, unusual_spending, etc.)
- severity: TEXT (info, warning, critical)
- title: TEXT
- message: TEXT
- data: JSONB (supporting data)
- is_read: BOOLEAN
- is_dismissed: BOOLEAN
- action_taken: BOOLEAN
- created_at: TIMESTAMPTZ
- read_at: TIMESTAMPTZ
- dismissed_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
```

**Alert Types:**
- `budget_risk`: Approaching or exceeding budget
- `unusual_spending`: Spending anomaly detected
- `duplicate_charge`: Potential duplicate transaction
- `subscription_increase`: Subscription price increase
- `savings_opportunity`: Opportunity to save money

**Severity Levels:**
- `info`: Informational, no action required
- `warning`: Attention recommended
- `critical`: Immediate action recommended

**Use Cases:**
- Real-time spending notifications
- Budget alerts
- Fraud detection assistance
- Savings recommendations

**Indexes:**
- `idx_smart_alerts_user_unread`: Fast unread alerts query
- `idx_smart_alerts_expires`: Cleanup expired alerts

**RLS Policies:**
- Users can view and update their own alerts
- System can insert alerts for users

---

## Data Flow

### Insight Generation Flow
```
1. Transaction synced/enriched
   ↓
2. Pattern detection algorithms run
   ↓
3. Insights generated and stored in transaction_insights
   ↓
4. User notified via smart_alerts (if critical)
   ↓
5. User views insights on dashboard
   ↓
6. User acts on or dismisses insight
```

### Tag Assignment Flow
```
1. User creates tag (transaction_tags)
   ↓
2. User assigns tag to transaction (transaction_tag_assignments)
   ↓
3. Tag visible on transaction card
   ↓
4. User can filter transactions by tag
```

### Pattern Detection Flow
```
1. Transaction data analyzed periodically
   ↓
2. Patterns detected via AI/algorithms
   ↓
3. Pattern stored in spending_patterns
   ↓
4. Insight generated if pattern is noteworthy
   ↓
5. User notified via smart_alerts
```

## Performance Considerations

### Indexes
All tables have appropriate indexes for:
- User-scoped queries
- Time-based queries
- Status filtering
- Foreign key relationships

### Partitioning (Future)
Consider partitioning large tables:
- `transaction_insights` by created_at (monthly)
- `smart_alerts` by created_at (monthly)
- Archive old data after 2 years

### Query Optimization
- Use compound indexes for common filter combinations
- Leverage JSONB indexes for metadata queries
- Regular VACUUM ANALYZE on high-write tables

## Security

### Row Level Security
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- System/service role can insert on behalf of users
- No cross-user data leakage

### Data Privacy
- All tables respect CASCADE DELETE from auth.users
- Sensitive data stored in JSONB fields
- No PII in alert messages (use IDs/references)

## Migration Notes

### Backward Compatibility
- All new tables are additive (no schema changes to existing tables)
- Existing functionality unaffected
- Can be rolled back safely if needed

### Data Population
After migration:
1. Run insight generation for recent transactions
2. Detect and populate spending patterns
3. Generate merchant category mappings from existing data

## Future Enhancements

### Planned Additions
- `transaction_notes`: User notes on transactions
- `budget_forecasts`: AI-generated budget predictions
- `goal_recommendations`: AI-suggested savings goals
- `transaction_splits`: Split transactions across categories

### Analytics Tables
- `daily_spending_summary`: Aggregated daily spending
- `category_trends`: Pre-computed category trends
- `merchant_analytics`: Merchant spending analytics

## Next Steps

Ready for **Phase 6: AI Insights Engine** 🧠 to populate and utilize these new tables!

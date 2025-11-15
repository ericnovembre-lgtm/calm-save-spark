# Multi-Agent Production Monitoring System

## Overview
A complete production-grade multi-agent infrastructure system for $ave+ with three specialized AI agents:

- **🛡️ Athena (UI/UX Guardian)**: GitHub Action that analyzes PRs for bundle size, accessibility, and design compliance
- **👁️ Aegis (SRE Observer)**: Monitors Web Vitals, edge functions, and detects SLO breaches every 5 minutes
- **🔧 Hephaestus (Backend Fixer)**: AI-powered incident responder that diagnoses issues and applies automated fixes

## Implementation Status

### ✅ Phase 1: Database Foundation (Complete)
- Created tables: `performance_metrics`, `slo_breaches`, `incident_logs`, `admin_notifications`
- RLS policies configured (admin-only access)
- 7-day data retention with automated cleanup (runs daily at 2 AM)

### ✅ Phase 2: Athena - UI/UX Guardian (Complete)
- **Location**: `.github/workflows/athena-guardian.yml`
- **Triggers**: On all pull requests
- **Checks**:
  - Bundle size delta (warns if >50KB increase)
  - Lighthouse CI scores
  - Accessibility with axe-core
  - Design system compliance (detects hardcoded colors)
- **Behavior**: Posts comment on PR with warnings but **does not block merges**

### ✅ Phase 3: Aegis - SRE Observer (Complete)
- **Location**: `supabase/functions/aegis-monitor/index.ts`
- **Schedule**: Every 5 minutes (via cron job)
- **Monitors**:
  - Web Vitals: LCP, INP (from analytics_events table)
  - Edge function error rates
- **Actions**:
  - Stores metrics in `performance_metrics` table
  - Detects SLO breaches
  - Triggers Hephaestus for critical breaches

### ✅ Phase 4: Hephaestus - Backend Fixer (Complete)
- **Location**: `supabase/functions/hephaestus-fixer/index.ts`
- **Triggers**: Automatically by Aegis when SLO breaches detected
- **Uses**: Lovable AI (Gemini 2.5 Flash) for diagnosis
- **Actions**:
  1. AI-powered root cause analysis
  2. Applies automated fixes (currently logs and alerts)
  3. Creates incident log
  4. Sends admin notification (in-app + email)
- **Email Alerts**: `supabase/functions/send-hephaestus-alert/index.ts`

### ✅ Phase 5: Admin Notification Center (Complete)
- **Location**: `src/components/admin/AdminNotificationCenter.tsx`
- **Features**:
  - Real-time notification feed
  - Unread count badge
  - Mark as read / mark all read
  - Severity indicators (critical, warning, info)
  - Shows AI diagnosis and fix results

## Configuration

### Cron Jobs
Two scheduled jobs are configured:
1. **Aegis Monitoring**: Runs every 5 minutes
2. **Data Cleanup**: Runs daily at 2 AM (deletes data older than 7 days)

### Edge Functions
All functions configured in `supabase/config.toml`:
- `aegis-monitor`: verify_jwt = false (triggered by cron)
- `hephaestus-fixer`: verify_jwt = false (triggered by Aegis)
- `send-hephaestus-alert`: verify_jwt = false (internal only)

### Secrets Required
- ✅ `LOVABLE_API_KEY` - Already configured
- ✅ `RESEND_API_KEY` - Already configured

## Performance Budgets

### Runtime Budgets (monitored by Aegis)
- **LCP**: 2500ms error / 2000ms warning
- **INP**: 200ms error / 100ms warning

### CI Budgets (enforced by Athena)
- **Bundle Size Delta**: >50KB triggers critical warning
- **Lighthouse**: Minimum 90 Performance / 95 Accessibility
- **Accessibility**: Any new WCAG AA errors = warning
- **Design System**: Direct color usage = warning

## Usage

### For Developers
1. **Create PR**: Athena will automatically analyze and comment
2. **Review warnings**: Check bundle size, accessibility, design system issues
3. **Merge freely**: Athena warns but doesn't block

### For Admins
1. **Monitor Dashboard**: Add `<AdminNotificationCenter />` to your admin page
2. **Check Notifications**: View real-time alerts from Hephaestus
3. **Review Incidents**: Click notifications to see AI diagnosis and fixes applied

### Testing

#### Test Athena (GitHub Action)
```bash
# Create a test PR with large bundle increase
# Athena will post a comment with warnings
```

#### Test Aegis (Manual)
```bash
# Trigger Aegis manually
curl -X POST https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/aegis-monitor \
  -H "Authorization: Bearer YOUR_KEY"
```

#### Test Hephaestus
```sql
-- Create a test breach
INSERT INTO slo_breaches (
  breach_type, severity, metric_name,
  current_value, threshold_value, metadata
) VALUES (
  'performance', 'critical', 'LCP',
  3000, 2500, '{"sample_size": 10}'::jsonb
);

-- Then invoke Hephaestus
SELECT net.http_post(
  url:='https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/hephaestus-fixer',
  body:='{"breach": {"id": "BREACH_ID", "severity": "critical", "metric_name": "LCP", "current_value": 3000, "threshold_value": 2500}}'::jsonb
);
```

## Data Flow

```
[Web Vitals] → [analytics_events] → [Aegis] → [performance_metrics]
                                              ↓
                                     [SLO breach detected]
                                              ↓
                                        [Hephaestus]
                                              ↓
                        [AI Diagnosis] → [Fix Applied] → [Incident Log]
                                              ↓
                                   [Admin Notification + Email]
```

## Integration Example

Add the notification center to your admin dashboard:

```tsx
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1>Admin Dashboard</h1>
      <AdminNotificationCenter />
      {/* Other admin components */}
    </div>
  );
}
```

## Monitoring & Alerts

### Alert Destinations
- ✅ **In-app**: Via AdminNotificationCenter component
- ✅ **Email**: Sent to all admin users via Resend

### Data Retention
- **7 days**: Automatic cleanup of old metrics and resolved incidents
- **Configurable**: Edit `cleanup_old_monitoring_data()` function to change retention period

## Future Enhancements
- Add Slack webhook integration
- Implement auto-scaling for edge functions
- Add predictive alerting based on trends
- Expand automated fixes (currently mostly alerting)
- Add dashboard for performance trends visualization

## Troubleshooting

### Aegis not running
Check cron job status in Supabase dashboard

### Email alerts not sending
Verify RESEND_API_KEY is configured and domain is verified

### Notifications not showing
Ensure user has 'admin' role in `user_roles` table

## Security
- All monitoring tables have RLS enabled
- Only users with 'admin' role can view monitoring data
- Edge functions use service role for internal operations

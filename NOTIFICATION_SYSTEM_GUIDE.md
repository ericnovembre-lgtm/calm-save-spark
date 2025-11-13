# Email Notification System Guide

## Overview
The $ave+ email notification system allows the platform to automatically send email notifications to users for important events like challenge completions, referral rewards, and milestone achievements.

## Architecture

### 1. Notification Queue Table
All notifications are queued in the `notification_queue` table before being sent:
- `user_id`: The recipient user
- `notification_type`: Type of notification (challenge_completion, referral_reward, milestone_achievement, goal_milestone)
- `subject`: Email subject line
- `content`: JSON data with notification details
- `status`: pending, sent, or failed
- `sent_at`: Timestamp when email was sent

### 2. Edge Function
The `send-notification-email` edge function processes queued notifications:
- Fetches pending notifications from the queue
- Retrieves user email from profiles
- Builds HTML email content based on notification type
- Sends emails via Resend
- Updates notification status

### 3. Cron Job
A cron job runs every 5 minutes to automatically process pending notifications.

## Usage

### Queue a Notification

```typescript
import { 
  queueChallengeCompletionNotification,
  queueReferralRewardNotification,
  queueMilestoneNotification,
  queueGoalMilestoneNotification
} from "@/lib/notification-helpers";

// Challenge completion
await queueChallengeCompletionNotification(
  userId,
  "30-Day Savings Streak",
  100
);

// Referral reward
await queueReferralRewardNotification(userId, 25);

// Milestone achievement
await queueMilestoneNotification(
  userId,
  "First Goal Created",
  "You've created your first savings goal!"
);

// Goal milestone (25%, 50%, 75%, 100%)
await queueGoalMilestoneNotification(
  userId,
  "Emergency Fund",
  500,  // current amount
  1000, // target amount
  50    // progress percentage
);
```

### Notification Types

#### 1. Challenge Completion
Sent when a user completes a community challenge.

**Content:**
- `challenge_name`: Name of the completed challenge
- `reward_points`: Points earned

#### 2. Referral Reward
Sent when a referral is approved and the user earns a reward.

**Content:**
- `reward_amount`: Dollar amount earned

#### 3. Milestone Achievement
Sent for general milestones (first goal, first pot, account connected, etc.).

**Content:**
- `milestone_name`: Title of the milestone
- `milestone_description`: Description of what was achieved

#### 4. Goal Milestone
Sent when a user reaches 25%, 50%, 75%, or 100% of a savings goal.

**Content:**
- `goal_name`: Name of the goal
- `current_amount`: Current saved amount
- `target_amount`: Target goal amount
- `progress_percentage`: Progress (25, 50, 75, or 100)

## Email Templates

Email templates are defined in the edge function with branded HTML:
- Off-white background (#faf8f2)
- Black text (#0a0a0a)
- Calm, minimal design
- $ave+ branding

## Configuration

### Required Environment Variables
- `RESEND_API_KEY`: Your Resend API key for sending emails
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

### Cron Job Schedule
Currently runs every 5 minutes. To modify:

```sql
-- Update cron schedule
SELECT cron.unschedule('process-notification-emails');
SELECT cron.schedule(
  'process-notification-emails',
  '*/10 * * * *',  -- Every 10 minutes
  $$ ... $$
);
```

## Testing

### Manual Trigger
You can manually trigger the notification processor:

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke('send-notification-email');
```

### Check Queue Status

```sql
-- View pending notifications
SELECT * FROM notification_queue WHERE status = 'pending';

-- View sent notifications
SELECT * FROM notification_queue WHERE status = 'sent' ORDER BY sent_at DESC;

-- View failed notifications
SELECT * FROM notification_queue WHERE status = 'failed';
```

## Best Practices

1. **Queue immediately**: Queue notifications as soon as the event happens
2. **Avoid duplicates**: Check before queueing if a similar notification was recently sent
3. **Include context**: Provide all necessary data in the content JSON
4. **Monitor failures**: Regularly check for failed notifications
5. **Respect preferences**: Check user notification preferences before queueing

## Email Provider (Resend)

### Setup
1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain at [resend.com/domains](https://resend.com/domains)
3. Create an API key at [resend.com/api-keys](https://resend.com/api-keys)
4. Add the API key as `RESEND_API_KEY` secret

### Sending Limits
- Free tier: 100 emails/day
- Paid plans: Higher limits available

## Troubleshooting

### Notifications not sending
1. Check if cron job is running: `SELECT * FROM cron.job WHERE jobname = 'process-notification-emails';`
2. Check edge function logs in backend
3. Verify RESEND_API_KEY is set correctly
4. Check notification_queue table for errors

### Domain not verified
Users may see errors if your domain isn't verified in Resend. Verify at resend.com/domains.

## Future Enhancements
- User notification preferences (weekly digest, instant, etc.)
- SMS notifications via Twilio
- Push notifications for mobile
- Rich email templates with transaction summaries
- Scheduled digest emails

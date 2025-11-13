import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  user_id: string;
  notification_type: string;
  subject: string;
  content: Record<string, any>;
}

export const queueNotification = async (notification: NotificationData) => {
  try {
    const { error } = await supabase
      .from('notification_queue')
      .insert({
        user_id: notification.user_id,
        notification_type: notification.notification_type,
        subject: notification.subject,
        content: notification.content,
        status: 'pending',
      });

    if (error) {
      console.error('Error queuing notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in queueNotification:', error);
    return false;
  }
};

export const queueChallengeCompletionNotification = async (
  userId: string,
  challengeName: string,
  rewardPoints: number
) => {
  return queueNotification({
    user_id: userId,
    notification_type: 'challenge_completion',
    subject: '🎉 Challenge Completed!',
    content: {
      challenge_name: challengeName,
      reward_points: rewardPoints,
    },
  });
};

export const queueReferralRewardNotification = async (
  userId: string,
  rewardAmount: number
) => {
  return queueNotification({
    user_id: userId,
    notification_type: 'referral_reward',
    subject: '💰 Referral Reward Earned!',
    content: {
      reward_amount: rewardAmount,
    },
  });
};

export const queueMilestoneNotification = async (
  userId: string,
  milestoneName: string,
  milestoneDescription: string
) => {
  return queueNotification({
    user_id: userId,
    notification_type: 'milestone_achievement',
    subject: '🏆 New Milestone Achieved!',
    content: {
      milestone_name: milestoneName,
      milestone_description: milestoneDescription,
    },
  });
};

export const queueGoalMilestoneNotification = async (
  userId: string,
  goalName: string,
  currentAmount: number,
  targetAmount: number,
  progressPercentage: number
) => {
  return queueNotification({
    user_id: userId,
    notification_type: 'goal_milestone',
    subject: '🎯 Goal Progress Update!',
    content: {
      goal_name: goalName,
      current_amount: currentAmount,
      target_amount: targetAmount,
      progress_percentage: progressPercentage,
    },
  });
};

import { supabase } from "@/integrations/supabase/client";

/**
 * Schedule budget alert notifications
 * Creates notifications in the queue for various budget events
 */

export const scheduleBudgetAlert = async (
  userId: string,
  alertType: "overspend" | "threshold" | "milestone",
  data: {
    budgetName?: string;
    amount?: number;
    percentageUsed?: number;
    remaining?: number;
  }
) => {
  let subject = "";
  let content: Record<string, any> = {};

  switch (alertType) {
    case "overspend":
      subject = "⚠️ Budget Alert: Over Budget";
      content = {
        message: `You've exceeded your ${data.budgetName} budget by $${Math.abs(data.remaining || 0).toFixed(2)}`,
        action: "Review your spending",
        ...data,
      };
      break;

    case "threshold":
      subject = `📊 Budget Alert: ${data.percentageUsed}% Used`;
      content = {
        message: `You've used ${data.percentageUsed}% of your ${data.budgetName} budget`,
        remaining: data.remaining,
        ...data,
      };
      break;

    case "milestone":
      subject = "🎯 Budget Milestone Reached";
      content = {
        message: `Congratulations! You've stayed within your ${data.budgetName} budget`,
        ...data,
      };
      break;
  }

  const { error } = await supabase.from("notification_queue").insert({
    user_id: userId,
    notification_type: `budget_${alertType}`,
    subject,
    content,
    status: "pending",
  });

  if (error) {
    console.error("Failed to schedule notification:", error);
    return false;
  }

  return true;
};

export const scheduleGoalAlert = async (
  userId: string,
  alertType: "progress" | "achieved" | "reminder",
  data: {
    goalName?: string;
    progress?: number;
    target?: number;
    current?: number;
  }
) => {
  let subject = "";
  let content: Record<string, any> = {};

  switch (alertType) {
    case "progress":
      subject = `🎯 Goal Progress: ${data.progress}%`;
      content = {
        message: `You're ${data.progress}% toward your ${data.goalName} goal!`,
        current: data.current,
        target: data.target,
        ...data,
      };
      break;

    case "achieved":
      subject = "🎉 Goal Achieved!";
      content = {
        message: `Congratulations! You've reached your ${data.goalName} goal of $${data.target}`,
        ...data,
      };
      break;

    case "reminder":
      subject = "💡 Goal Reminder";
      content = {
        message: `Keep going! You're $${((data.target || 0) - (data.current || 0)).toFixed(2)} away from your ${data.goalName} goal`,
        ...data,
      };
      break;
  }

  const { error } = await supabase.from("notification_queue").insert({
    user_id: userId,
    notification_type: `goal_${alertType}`,
    subject,
    content,
    status: "pending",
  });

  if (error) {
    console.error("Failed to schedule notification:", error);
    return false;
  }

  return true;
};

export const scheduleSavingsAlert = async (
  userId: string,
  alertType: "streak" | "achievement" | "opportunity",
  data: {
    streakDays?: number;
    savingsAmount?: number;
    opportunityName?: string;
  }
) => {
  let subject = "";
  let content: Record<string, any> = {};

  switch (alertType) {
    case "streak":
      subject = `🔥 ${data.streakDays}-Day Savings Streak!`;
      content = {
        message: `You're on fire! ${data.streakDays} days of consistent savings`,
        ...data,
      };
      break;

    case "achievement":
      subject = "🏆 New Achievement Unlocked!";
      content = {
        message: `You've saved $${data.savingsAmount} this month!`,
        ...data,
      };
      break;

    case "opportunity":
      subject = "💰 Savings Opportunity Detected";
      content = {
        message: `We found a way to save on ${data.opportunityName}`,
        ...data,
      };
      break;
  }

  const { error } = await supabase.from("notification_queue").insert({
    user_id: userId,
    notification_type: `savings_${alertType}`,
    subject,
    content,
    status: "pending",
  });

  if (error) {
    console.error("Failed to schedule notification:", error);
    return false;
  }

  return true;
};

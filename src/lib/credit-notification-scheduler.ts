import { supabase } from "@/integrations/supabase/client";

export type CreditAlertType =
  | "credit_score_increase"
  | "credit_score_decrease"
  | "credit_milestone"
  | "credit_goal_achieved"
  | "credit_goal_reminder";

interface CreditScoreAlertData {
  previousScore?: number;
  newScore: number;
  change: number;
  milestone?: string;
  message: string;
}

interface CreditGoalAlertData {
  goalName: string;
  targetScore: number;
  currentScore: number;
  message: string;
}

export async function scheduleCreditScoreAlert(
  userId: string,
  alertType: CreditAlertType,
  data: CreditScoreAlertData | CreditGoalAlertData
) {
  try {
    // Check if user has credit alerts enabled
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("credit_alerts")
      .eq("user_id", userId)
      .single();

    if (!prefs?.credit_alerts) {
      console.log("Credit alerts disabled for user:", userId);
      return;
    }

    // Determine subject and content based on alert type
    let subject = "";
    let emailContent = "";

    switch (alertType) {
      case "credit_score_increase":
        subject = "📈 Your Credit Score Increased!";
        emailContent = `Great news! ${(data as CreditScoreAlertData).message}`;
        break;
      case "credit_score_decrease":
        subject = "📉 Credit Score Alert";
        emailContent = `Important: ${(data as CreditScoreAlertData).message}`;
        break;
      case "credit_milestone":
        subject = `🎉 ${(data as CreditScoreAlertData).milestone || "Credit Milestone Reached"}`;
        emailContent = (data as CreditScoreAlertData).message;
        break;
      case "credit_goal_achieved":
        subject = "🎯 Credit Goal Achieved!";
        emailContent = `Congratulations! ${(data as CreditGoalAlertData).message}`;
        break;
      case "credit_goal_reminder":
        subject = "💡 Credit Goal Check-in";
        emailContent = (data as CreditGoalAlertData).message;
        break;
    }

    // Queue notification
    const { error } = await supabase.from("notification_queue").insert({
      user_id: userId,
      notification_type: alertType,
      subject,
      content: {
        ...data,
        html_content: emailContent,
      },
      status: "pending",
    });

    if (error) {
      console.error("Error queuing credit alert:", error);
    } else {
      console.log(`Credit alert queued for user ${userId}: ${alertType}`);
    }
  } catch (error) {
    console.error("Error in scheduleCreditScoreAlert:", error);
  }
}

export function getCreditScoreMilestone(score: number): string | null {
  if (score >= 800) return "Exceptional Credit! 🌟";
  if (score >= 740) return "Very Good Credit Range";
  if (score >= 670) return "Good Credit Range";
  if (score >= 580) return "Fair Credit Range";
  return null;
}

export function calculateCreditProgress(
  currentScore: number,
  targetScore: number,
  startingScore: number
): number {
  const totalGain = targetScore - startingScore;
  const currentGain = currentScore - startingScore;
  return totalGain > 0 ? Math.min(100, Math.max(0, (currentGain / totalGain) * 100)) : 0;
}

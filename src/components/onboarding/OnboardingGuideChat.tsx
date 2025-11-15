import { AgentChat } from "@/components/ai-agents/AgentChat";
import { Card } from "@/components/ui/card";

interface OnboardingGuideChatProps {
  currentStep: string;
  className?: string;
}

export function OnboardingGuideChat({ currentStep, className }: OnboardingGuideChatProps) {
  const getContextForStep = (step: string) => {
    const contexts: Record<string, string> = {
      welcome: "User is on the welcome step of onboarding",
      account: "User is setting up their account details",
      kyc: "User is uploading KYC documents for verification",
      goal: "User is creating their first savings goal",
      automation: "User is setting up automation rules",
      features: "User is exploring available features",
      complete: "User has completed onboarding"
    };
    return contexts[step] || "User is in onboarding flow";
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Your Guide</h3>
        <p className="text-xs text-muted-foreground">Get help at any step</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AgentChat
          agentType="onboarding_guide"
          initialContext={{
            currentStep,
            stepContext: getContextForStep(currentStep)
          }}
          placeholder="Ask me anything about this step..."
          className="h-full"
        />
      </div>
    </Card>
  );
}

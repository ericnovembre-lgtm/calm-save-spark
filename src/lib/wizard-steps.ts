import { Target, TrendingUp, Zap, PiggyBank, ChartBar, Trophy } from "lucide-react";
import type { WizardStep } from "@/components/onboarding/InteractiveWizard";
import type { LucideIcon } from "lucide-react";

// Extended WizardStep type with icon component
export interface WizardStepWithIcon extends Omit<WizardStep, 'icon'> {
  iconComponent?: LucideIcon;
}

// Dashboard wizard steps
export const DASHBOARD_WIZARD_STEPS: WizardStepWithIcon[] = [
  {
    id: "welcome",
    title: "Welcome to $ave+! 👋",
    description: "Let's take a quick tour of your dashboard. We'll show you the key features that will help you save smarter and build wealth effortlessly.",
    targetSelector: "[data-wizard='balance-card']",
    position: "bottom",
    iconComponent: Target,
    actionLabel: "Get Started"
  },
  {
    id: "balance-overview",
    title: "Your Balance Overview",
    description: "This card shows your total savings balance across all your goals and pots. Track your monthly progress and see how your wealth is growing.",
    targetSelector: "[data-wizard='balance-card']",
    position: "bottom",
    iconComponent: PiggyBank
  },
  {
    id: "goals-section",
    title: "Savings Goals",
    description: "Create and manage your savings goals here. Set targets, deadlines, and track your progress. Each goal can have its own dedicated savings pot.",
    targetSelector: "[data-wizard='goals-section']",
    position: "top",
    iconComponent: Target
  },
  {
    id: "manual-transfer",
    title: "Manual Transfers",
    description: "Use this card to make instant transfers to your savings. Perfect for when you have extra cash and want to boost your goals.",
    targetSelector: "[data-wizard='manual-transfer']",
    position: "top",
    iconComponent: TrendingUp
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Access common actions quickly with this floating menu. Create new goals, make transfers, or view insights with a single tap.",
    targetSelector: "[data-wizard='quick-actions']",
    position: "left",
    iconComponent: Zap
  },
  {
    id: "achievements",
    title: "Track Your Progress",
    description: "Earn achievements as you save! Your journey milestones and streaks are displayed here. Keep saving consistently to unlock rewards.",
    targetSelector: "[data-wizard='milestones']",
    position: "top",
    iconComponent: Trophy
  },
  {
    id: "insights",
    title: "Financial Insights",
    description: "Get personalized recommendations and insights about your saving habits. We'll help you optimize your strategy and reach your goals faster.",
    targetSelector: "[data-wizard='insights']",
    position: "top",
    iconComponent: ChartBar
  }
];

// Settings wizard steps (for first-time settings configuration)
export const SETTINGS_WIZARD_STEPS: WizardStepWithIcon[] = [
  {
    id: "profile",
    title: "Your Profile",
    description: "Personalize your account by updating your profile information, adding a profile picture, and setting your preferences.",
    targetSelector: "[data-wizard='profile-section']",
    position: "right",
    iconComponent: Target
  },
  {
    id: "notifications",
    title: "Notification Preferences",
    description: "Choose how you want to be notified about savings milestones, goals, and achievements. Stay informed without being overwhelmed.",
    targetSelector: "[data-wizard='notifications']",
    position: "right",
    iconComponent: Target
  },
  {
    id: "accessibility",
    title: "Accessibility Options",
    description: "Customize motion effects, animations, and other accessibility features to match your preferences and device capabilities.",
    targetSelector: "[data-wizard='accessibility']",
    position: "right",
    iconComponent: Target
  }
];

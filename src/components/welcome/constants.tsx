/**
 * @fileoverview Shared constants and data for Welcome page components
 * 
 * Centralizes static data used across welcome section components
 * to separate data from presentation logic and improve maintainability.
 * 
 * @module components/welcome/constants
 */

import { Users, DollarSign, TrendingUp } from "lucide-react";
import type { Feature, Stat, Milestone } from "./types";
import type { Feature as FeatureCarouselType } from "@/components/welcome/FeatureCarousel";

/**
 * Core features showcased on the welcome page
 * Displayed in the features section with flippable cards
 */
export const WELCOME_FEATURES: FeatureCarouselType[] = [
  {
    id: "smart-pots",
    icon: "pots",
    title: "Smart Savings Pots",
    description: "Create dedicated goals and track progress with unlimited pots, auto-allocations, and shared access.",
    summary: "Create dedicated goals and track progress with unlimited pots, auto-allocations, and shared access.",
    details: "Unlimited pots with targets and dates. Auto-allocate new deposits by percentage. Lock/unlock rules, notes, shared view access, and attachments.",
  },
  {
    id: "automated-savings",
    icon: "automations",
    title: "Automated Savings",
    description: "Set rules that save for you automatically—round-ups, paycheck skims, and scheduled transfers.",
    summary: "Set rules that save for you automatically—round-ups, paycheck skims, and scheduled transfers.",
    details: "Round-ups from card spend, paycheck skim %, threshold sweeps, and safe-to-save checks. Scheduled weekly/biweekly deposits with pause/resume.",
  },
  {
    id: "ave-plus-card",
    icon: "card",
    title: "$ave+ Credit Card",
    description: "Build credit with real-time controls, instant freeze, and category insights.",
    summary: "Build credit with real-time controls, instant freeze, and category insights.",
    details: "Smart limits, instant freeze, category insights, statement reminders, and rewards posting. Disclosures available in-app.",
  },
  {
    id: "financial-insights",
    icon: "insights",
    title: "Financial Insights",
    description: "Know where you stand with savings rate, time-to-goal, and net worth tracking.",
    summary: "Know where you stand with savings rate, time-to-goal, and net worth tracking.",
    details: "Savings rate, time-to-goal, APY history, interest earned, contributions by pot, and net worth across linked accounts. CSV/PDF export.",
  },
  {
    id: "rewards-program",
    icon: "rewards",
    title: "Rewards Program",
    description: "Earn points for streaks and milestones, with boosters on goal completion.",
    summary: "Earn points for streaks and milestones, with boosters on goal completion.",
    details: "Points for streaks and milestones, boosters on goal completion, and perks for higher monthly support tiers.",
  },
  {
    id: "ai-coach",
    icon: "bot",
    title: "AI Coach",
    description: "Get 24/7 guided help with step-by-step tasks and progress summaries.",
    summary: "Get 24/7 guided help with step-by-step tasks and progress summaries.",
    details: "Step-by-step tasks for linking bank, creating pots, drafting transfers, enabling automations, and summarizing progress. Not financial advice.",
  },
  {
    id: "bank-security",
    icon: "shield",
    title: "Bank-Level Security",
    description: "Protect your account with MFA, encryption, and device management.",
    summary: "Protect your account with MFA, encryption, and device management.",
    details: "MFA, device/session management, encryption in transit/at rest, consent logs, and data export/delete controls.",
  },
];

/**
 * Platform statistics displayed in the stats section
 * Shows key metrics with expandable breakdowns
 */
export const WELCOME_STATS: Stat[] = [
  {
    label: "Active Savers",
    value: 50000,
    suffix: "+",
    icon: <Users className="w-8 h-8" />,
    delay: 0,
    breakdown: [
      { label: "This Month", value: "2,340", percentage: 75 },
      { label: "This Week", value: "580", percentage: 45 },
      { label: "Today", value: "120", percentage: 25 },
    ],
  },
  {
    label: "Total Saved",
    value: 2.1,
    suffix: "M+",
    icon: <DollarSign className="w-8 h-8" />,
    delay: 0.1,
    breakdown: [
      { label: "Automated Savings", value: "$1.2M", percentage: 57 },
      { label: "Round-ups", value: "$600K", percentage: 28 },
      { label: "Manual Transfers", value: "$300K", percentage: 15 },
    ],
  },
  {
    label: "Average APY",
    value: 4.25,
    suffix: "%",
    icon: <TrendingUp className="w-8 h-8" />,
    delay: 0.2,
  },
];

/**
 * Simple stats for header/footer sections
 * Displayed as quick metrics without breakdowns
 */
export const SIMPLE_STATS = [
  { label: "APY Rate", value: "4.25%", icon: "trending-up" },
  { label: "Happy Users", value: "50K+", icon: "users" },
  { label: "Saved Together", value: "$2.1M+", icon: "money" },
  { label: "Uptime", value: "99.9%", icon: "shield" },
];

/**
 * Journey timeline milestones
 * Shows user progression from signup to wealth building
 */
export const JOURNEY_MILESTONES: Milestone[] = [
  {
    id: "signup",
    title: "Sign Up",
    description: "Create your account and set your first goal",
    icon: "user",
    timeframe: "Day 1",
    completed: true,
  },
  {
    id: "first-save",
    title: "First $50 Saved",
    description: "Automated savings start working for you",
    icon: "piggy-bank",
    timeframe: "Week 1",
  },
  {
    id: "automation",
    title: "Enable Automation",
    description: "Set up round-ups and scheduled transfers",
    icon: "automations",
    timeframe: "Week 2",
  },
  {
    id: "first-goal",
    title: "Hit First Goal",
    description: "Celebrate your first savings milestone!",
    icon: "trophy",
    timeframe: "Month 1",
  },
  {
    id: "wealth-building",
    title: "Wealth Building",
    description: "Continue growing your savings effortlessly",
    icon: "chart",
    timeframe: "Ongoing",
  },
];

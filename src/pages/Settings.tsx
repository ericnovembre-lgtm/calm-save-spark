import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TwoFactorAuth } from '@/components/settings/TwoFactorAuth';
import { PasswordChange } from '@/components/settings/PasswordChange';
import { BiometricSetup } from '@/components/auth/BiometricSetup';
import { AccountDeletion } from '@/components/settings/AccountDeletion';
import { ProfilePictureUpload } from '@/components/settings/ProfilePictureUpload';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { ResetOnboarding } from '@/components/settings/ResetOnboarding';
import { WeeklyDigestTrigger } from '@/components/settings/WeeklyDigestTrigger';
import { AnalyticsDigestPreview } from '@/components/settings/AnalyticsDigestPreview';
import { CurrencyPreference } from "@/components/settings/CurrencyPreference";
import { useState } from "react";
import { CurrencySelector } from "@/components/currency/CurrencySelector";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AchievementsList } from '@/components/gamification/AchievementsList';
import { StreakFreezeManager } from '@/components/gamification/StreakFreezeManager';
import { Shield, User, Bell, Lock, Globe, Trophy, Snowflake, Sparkles, Volume2, Activity, Wand2, Brain, ChevronRight, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionAccessibilitySettings } from '@/components/settings/MotionAccessibilitySettings';
import { SoundSettings } from '@/components/settings/SoundSettings';
import { PerformanceDashboard } from '@/components/settings/PerformanceDashboard';
import { HighContrastMode } from '@/components/settings/HighContrastMode';
import { EasterEggsSettings } from '@/components/settings/EasterEggsSettings';
import { NaturalLanguageNotifications } from '@/components/settings/NaturalLanguageNotifications';
import { SecurityHealthGauge } from '@/components/settings/SecurityHealthGauge';
import { SpendingPersona } from '@/components/settings/SpendingPersona';
import { SupportConcierge } from '@/components/settings/SupportConcierge';
import { LiveThemePreview } from '@/components/settings/LiveThemePreview';
import { ConnectedAppsPrivacy } from '@/components/settings/ConnectedAppsPrivacy';
import { useSettingsSync } from '@/hooks/useSettingsSync';
import { AIModelPreferences } from '@/components/settings/AIModelPreferences';

export default function Settings() {
  // Initialize settings sync
  useSettingsSync();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Separator />

        {/* AI Control Center Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Control Center
            </CardTitle>
            <CardDescription>
              Smart, personalized settings powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SpendingPersona />
            <Separator />
            <SecurityHealthGauge />
            <Separator />
            <NaturalLanguageNotifications />
            <Separator />
            <LiveThemePreview />
            <Separator />
            <ConnectedAppsPrivacy />
            <Separator />
            <SupportConcierge />
          </CardContent>
        </Card>

        {/* AI Model Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Model Preferences
            </CardTitle>
            <CardDescription>
              Control which AI models power your financial assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AIModelPreferences />
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>
              Protect your account with additional security measures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <PasswordChange />
            <Separator />
            <TwoFactorAuth />
            <Separator />
            <BiometricSetup />
            <Separator />
            <Link 
              to="/security-settings" 
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="font-medium">Security Notifications & Guardian</p>
                  <p className="text-sm text-muted-foreground">
                    Configure security alerts, view active sessions, and access emergency controls
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Account Management
            </CardTitle>
            <CardDescription>
              Manage your account and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <ProfilePictureUpload />
            <Separator />
            <ResetOnboarding />
            <Separator />
            <AccountDeletion />
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications & Emails
            </CardTitle>
            <CardDescription>
              Manage your notification and email preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <NotificationPreferences />
            <Separator />
            <WeeklyDigestTrigger />
            <Separator />
            <AnalyticsDigestPreview />
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Display Preferences
            </CardTitle>
            <CardDescription>
              Customize how information is displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyPreference />
          </CardContent>
        </Card>

        {/* Sound Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Sound & Audio
            </CardTitle>
            <CardDescription>
              Control sound effects, volume, and audio feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SoundSettings />
            <Separator />
            <Link 
              to="/interaction-demo" 
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Hand className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="font-medium">Interaction Playground</p>
                  <p className="text-sm text-muted-foreground">
                    Test gestures, haptics, and sound effects
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </CardContent>
        </Card>

        {/* Motion & Accessibility Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Motion & Accessibility
            </CardTitle>
            <CardDescription>
              Control animations, effects, and visual motion throughout the app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <MotionAccessibilitySettings />
            <Separator />
            <HighContrastMode />
          </CardContent>
        </Card>

        {/* Performance Dashboard Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Performance Dashboard
            </CardTitle>
            <CardDescription>
              Monitor app performance and optimize settings for your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceDashboard />
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>
              View all your earned badges and locked achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AchievementsList />
          </CardContent>
        </Card>

        {/* Streak Freeze Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-primary" />
              Streak Protection
            </CardTitle>
            <CardDescription>
              Manage your streak freeze days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StreakFreezeManager />
          </CardContent>
        </Card>

        {/* Privacy Section - Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Privacy
            </CardTitle>
            <CardDescription>
              Control your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

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
import { CurrencyPreference } from '@/components/settings/CurrencyPreference';
import { AchievementsList } from '@/components/gamification/AchievementsList';
import { StreakFreezeManager } from '@/components/gamification/StreakFreezeManager';
import { Shield, User, Bell, Lock, Globe, Trophy, Snowflake, Sparkles, Volume2, Activity, Wand2 } from 'lucide-react';
import { MotionAccessibilitySettings } from '@/components/settings/MotionAccessibilitySettings';
import { SoundSettings } from '@/components/settings/SoundSettings';
import { PerformanceDashboard } from '@/components/settings/PerformanceDashboard';
import { HighContrastMode } from '@/components/settings/HighContrastMode';
import { EasterEggsSettings } from '@/components/settings/EasterEggsSettings';

export default function Settings() {
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
          <CardContent>
            <SoundSettings />
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

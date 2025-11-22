import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationRules {
  notify_overdraft: boolean;
  bill_threshold: number;
  notify_marketing: boolean;
  notify_goals: boolean;
  notify_achievements: boolean;
  notify_weekly_digest: boolean;
}

interface SecuritySettings {
  mfa_enabled: boolean;
  biometric_enabled: boolean;
  password_strength: number;
  password_age_days: number;
  email_verified: boolean;
}

interface ConnectedApp {
  id: string;
  name: string;
  provider: string;
  connected_at: string;
  last_synced: string;
  permissions: string[];
  privacy_summary?: string;
  risk_level?: 'high' | 'standard' | 'limited';
}

interface SettingsState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: number;
  
  // Notifications
  notificationRules: NotificationRules;
  naturalLanguageInput: string;
  
  // Security
  securityScore: number;
  securitySettings: SecuritySettings;
  
  // Connected Apps
  connectedApps: ConnectedApp[];
  
  // Spending Persona
  spendingPersona: {
    type: string;
    description: string;
    preferences?: Record<string, any>;
    optimizations?: {
      show_savings: boolean;
      show_investments: boolean;
      show_debt: boolean;
      show_crypto: boolean;
      priority_view: string;
    };
  } | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: number) => void;
  updateNotificationRules: (rules: Partial<NotificationRules>) => void;
  setNaturalLanguageInput: (input: string) => void;
  setSecurityScore: (score: number) => void;
  setSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  setConnectedApps: (apps: ConnectedApp[]) => void;
  setSpendingPersona: (persona: any) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      accentColor: '#d6c8a2',
      fontSize: 0,
      notificationRules: {
        notify_overdraft: true,
        bill_threshold: 0,
        notify_marketing: false,
        notify_goals: true,
        notify_achievements: true,
        notify_weekly_digest: true,
      },
      naturalLanguageInput: '',
      securityScore: 0,
      securitySettings: {
        mfa_enabled: false,
        biometric_enabled: false,
        password_strength: 0,
        password_age_days: 0,
        email_verified: false,
      },
      connectedApps: [],
      spendingPersona: null,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      setAccentColor: (color) => set({ accentColor: color }),
      setFontSize: (size) => set({ fontSize: size }),
      updateNotificationRules: (rules) =>
        set((state) => ({
          notificationRules: { ...state.notificationRules, ...rules },
        })),
      setNaturalLanguageInput: (input) => set({ naturalLanguageInput: input }),
      setSecurityScore: (score) => set({ securityScore: score }),
      setSecuritySettings: (settings) =>
        set((state) => ({
          securitySettings: { ...state.securitySettings, ...settings },
        })),
      setConnectedApps: (apps) => set({ connectedApps: apps }),
      setSpendingPersona: (persona) => set({ spendingPersona: persona }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        notificationRules: state.notificationRules,
      }),
    }
  )
);

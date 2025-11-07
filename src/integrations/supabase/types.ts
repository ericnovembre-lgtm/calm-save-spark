export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_coaching_sessions: {
        Row: {
          conversation_history: Json | null
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          session_type: string | null
          user_id: string
        }
        Insert: {
          conversation_history?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          session_type?: string | null
          user_id: string
        }
        Update: {
          conversation_history?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          session_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event: string
          id: string
          properties: Json | null
          route: string | null
          timestamp: string
          user_hashed: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          properties?: Json | null
          route?: string | null
          timestamp?: string
          user_hashed?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          properties?: Json | null
          route?: string | null
          timestamp?: string
          user_hashed?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          rule_name: string
          rule_type: string
          trigger_condition: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          rule_type: string
          trigger_condition?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          rule_type?: string
          trigger_condition?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          auto_save_enabled: boolean | null
          created_at: string | null
          id: string
          round_up_enabled: boolean | null
          scheduled_transfer_amount: number | null
          scheduled_transfer_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_save_enabled?: boolean | null
          created_at?: string | null
          id?: string
          round_up_enabled?: boolean | null
          scheduled_transfer_amount?: number | null
          scheduled_transfer_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_save_enabled?: boolean | null
          created_at?: string | null
          id?: string
          round_up_enabled?: boolean | null
          scheduled_transfer_amount?: number | null
          scheduled_transfer_frequency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      budget_templates: {
        Row: {
          category_percentages: Json
          created_at: string | null
          description: string | null
          id: string
          income_level: string | null
          name: string
        }
        Insert: {
          category_percentages: Json
          created_at?: string | null
          description?: string | null
          id?: string
          income_level?: string | null
          name: string
        }
        Update: {
          category_percentages?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          income_level?: string | null
          name?: string
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          account_mask: string | null
          account_type: string
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          institution_name: string
          last_synced: string | null
          plaid_access_token: string | null
          plaid_item_id: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_mask?: string | null
          account_type: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_name: string
          last_synced?: string | null
          plaid_access_token?: string | null
          plaid_item_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_mask?: string | null
          account_type?: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          institution_name?: string
          last_synced?: string | null
          plaid_access_token?: string | null
          plaid_item_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_scores: {
        Row: {
          change_from_previous: number | null
          created_at: string | null
          factors: Json | null
          id: string
          provider: string
          score: number
          score_date: string
          user_id: string
        }
        Insert: {
          change_from_previous?: number | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          provider: string
          score: number
          score_date: string
          user_id: string
        }
        Update: {
          change_from_previous?: number | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          provider?: string
          score?: number
          score_date?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string | null
          debt_id: string
          id: string
          interest_paid: number
          payment_date: string
          principal_paid: number
          remaining_balance: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          debt_id: string
          id?: string
          interest_paid: number
          payment_date: string
          principal_paid: number
          remaining_balance: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          debt_id?: string
          id?: string
          interest_paid?: number
          payment_date?: string
          principal_paid?: number
          remaining_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          created_at: string | null
          current_balance: number
          debt_name: string
          debt_type: string | null
          id: string
          interest_rate: number
          minimum_payment: number | null
          payment_due_date: number | null
          payoff_strategy: string | null
          principal_amount: number
          target_payoff_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_balance: number
          debt_name: string
          debt_type?: string | null
          id?: string
          interest_rate: number
          minimum_payment?: number | null
          payment_due_date?: number | null
          payoff_strategy?: string | null
          principal_amount: number
          target_payoff_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_balance?: number
          debt_name?: string
          debt_type?: string | null
          id?: string
          interest_rate?: number
          minimum_payment?: number | null
          payment_due_date?: number | null
          payoff_strategy?: string | null
          principal_amount?: number
          target_payoff_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      detected_subscriptions: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          frequency: string | null
          id: string
          is_confirmed: boolean | null
          last_charge_date: string | null
          merchant: string
          next_expected_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_confirmed?: boolean | null
          last_charge_date?: string | null
          merchant: string
          next_expected_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_confirmed?: boolean | null
          last_charge_date?: string | null
          merchant?: string
          next_expected_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feature_access: {
        Row: {
          computed_at: string | null
          features: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          computed_at?: string | null
          features?: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          computed_at?: string | null
          features?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          icon: string | null
          id: string
          name: string
          target_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          name: string
          target_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_accounts: {
        Row: {
          account_name: string
          account_type: string | null
          cost_basis: number | null
          created_at: string | null
          gains_losses: number | null
          holdings: Json | null
          id: string
          last_synced: string | null
          total_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_type?: string | null
          cost_basis?: number | null
          created_at?: string | null
          gains_losses?: number | null
          holdings?: Json | null
          id?: string
          last_synced?: string | null
          total_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string | null
          cost_basis?: number | null
          created_at?: string | null
          gains_losses?: number | null
          holdings?: Json | null
          id?: string
          last_synced?: string | null
          total_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          budget_alerts: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          goal_reminders: boolean | null
          id: string
          marketing_emails: boolean | null
          push_notifications: boolean | null
          transfer_alerts: boolean | null
          updated_at: string | null
          user_id: string
          weekly_summary: boolean | null
        }
        Insert: {
          budget_alerts?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          transfer_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_summary?: boolean | null
        }
        Update: {
          budget_alerts?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          transfer_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      pots: {
        Row: {
          color: string | null
          created_at: string | null
          current_amount: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          target_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_progress: Json | null
          onboarding_step: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_progress?: Json | null
          onboarding_step?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_progress?: Json | null
          onboarding_step?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_transfers: {
        Row: {
          amount: number
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean
          last_transfer_date: string | null
          next_transfer_date: string
          pot_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean
          last_transfer_date?: string | null
          next_transfer_date: string
          pot_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          last_transfer_date?: string | null
          next_transfer_date?: string
          pot_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_transfers_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          id: string
          new_amount: number
          previous_amount: number | null
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          id?: string
          new_amount: number
          previous_amount?: number | null
          user_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          id?: string
          new_amount?: number
          previous_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_recurring: boolean | null
          merchant: string | null
          recurring_frequency: string | null
          tags: string[] | null
          transaction_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          merchant?: string | null
          recurring_frequency?: string | null
          tags?: string[] | null
          transaction_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          merchant?: string | null
          recurring_frequency?: string | null
          tags?: string[] | null
          transaction_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_history: {
        Row: {
          amount: number
          created_at: string
          error_message: string | null
          id: string
          pot_id: string
          scheduled_transfer_id: string | null
          status: string
          transfer_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          error_message?: string | null
          id?: string
          pot_id: string
          scheduled_transfer_id?: string | null
          status?: string
          transfer_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          error_message?: string | null
          id?: string
          pot_id?: string
          scheduled_transfer_id?: string | null
          status?: string
          transfer_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_history_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_history_scheduled_transfer_id_fkey"
            columns: ["scheduled_transfer_id"]
            isOneToOne: false
            referencedRelation: "scheduled_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_budgets: {
        Row: {
          category_limits: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          period: string
          total_limit: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_limits?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          period: string
          total_limit: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_limits?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          period?: string
          total_limit?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_milestones: {
        Row: {
          completed_at: string
          created_at: string | null
          id: string
          metadata: Json | null
          milestone_description: string | null
          milestone_icon: string | null
          milestone_name: string
          milestone_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_description?: string | null
          milestone_icon?: string | null
          milestone_name: string
          milestone_type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_description?: string | null
          milestone_icon?: string | null
          milestone_name?: string
          milestone_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_interval: string
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_amount: number
          trial_end_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_interval?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_amount?: number
          trial_end_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_amount?: number
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      webauthn_credentials: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_webauthn_challenges: { Args: never; Returns: undefined }
      compute_user_features: { Args: { sub_amount: number }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

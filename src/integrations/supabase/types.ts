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
      achievements: {
        Row: {
          achievement_type: string
          badge_color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number
          requirement: Json
        }
        Insert: {
          achievement_type: string
          badge_color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number
          requirement?: Json
        }
        Update: {
          achievement_type?: string
          badge_color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number
          requirement?: Json
        }
        Relationships: []
      }
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
      allowances: {
        Row: {
          amount: number
          child_user_id: string
          created_at: string | null
          family_group_id: string
          frequency: string
          id: string
          is_active: boolean | null
          next_payment_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          child_user_id: string
          created_at?: string | null
          family_group_id: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_payment_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          child_user_id?: string
          created_at?: string | null
          family_group_id?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_payment_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allowances_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
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
      bill_negotiation_opportunities: {
        Row: {
          category: string | null
          confidence_score: number | null
          current_amount: number
          detected_at: string | null
          estimated_savings: number | null
          id: string
          last_charge_date: string | null
          merchant: string
          metadata: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          current_amount: number
          detected_at?: string | null
          estimated_savings?: number | null
          id?: string
          last_charge_date?: string | null
          merchant: string
          metadata?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          current_amount?: number
          detected_at?: string | null
          estimated_savings?: number | null
          id?: string
          last_charge_date?: string | null
          merchant?: string
          metadata?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bill_negotiation_requests: {
        Row: {
          actual_savings: number | null
          completed_at: string | null
          current_amount: number
          id: string
          merchant: string
          notes: string | null
          opportunity_id: string | null
          requested_at: string | null
          result_amount: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          actual_savings?: number | null
          completed_at?: string | null
          current_amount: number
          id?: string
          merchant: string
          notes?: string | null
          opportunity_id?: string | null
          requested_at?: string | null
          result_amount?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          actual_savings?: number | null
          completed_at?: string | null
          current_amount?: number
          id?: string
          merchant?: string
          notes?: string | null
          opportunity_id?: string | null
          requested_at?: string | null
          result_amount?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_negotiation_requests_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "bill_negotiation_opportunities"
            referencedColumns: ["id"]
          },
        ]
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
      business_expenses: {
        Row: {
          amount: number
          business_profile_id: string | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string
          expense_date: string
          id: string
          receipt_url: string | null
          tax_category: Database["public"]["Enums"]["tax_category"] | null
          tax_deductible: boolean | null
          updated_at: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          business_profile_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          expense_date: string
          id?: string
          receipt_url?: string | null
          tax_category?: Database["public"]["Enums"]["tax_category"] | null
          tax_deductible?: boolean | null
          updated_at?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          business_profile_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
          tax_category?: Database["public"]["Enums"]["tax_category"] | null
          tax_deductible?: boolean | null
          updated_at?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_expenses_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          address: string | null
          business_name: string
          business_type: string | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      carbon_footprint_logs: {
        Row: {
          carbon_kg: number
          category: string
          created_at: string | null
          id: string
          log_date: string | null
          merchant: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          carbon_kg: number
          category: string
          created_at?: string | null
          id?: string
          log_date?: string | null
          merchant?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          carbon_kg?: number
          category?: string
          created_at?: string | null
          id?: string
          log_date?: string | null
          merchant?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_footprint_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          joined_at: string | null
          progress: number | null
          rank: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          progress?: number | null
          rank?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          progress?: number | null
          rank?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points: number
          requirement: Json
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points?: number
          requirement?: Json
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number
          requirement?: Json
        }
        Relationships: []
      }
      community_challenges: {
        Row: {
          challenge_name: string
          challenge_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          goal_config: Json
          id: string
          is_active: boolean | null
          max_participants: number | null
          reward_points: number | null
          start_date: string
        }
        Insert: {
          challenge_name: string
          challenge_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          goal_config: Json
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date: string
        }
        Update: {
          challenge_name?: string
          challenge_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          goal_config?: Json
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date?: string
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          account_mask: string | null
          account_type: string
          available_balance: number | null
          balance: number | null
          created_at: string | null
          currency: string | null
          current_balance: number | null
          id: string
          institution_id: string | null
          institution_logo: string | null
          institution_name: string
          last_synced: string | null
          plaid_access_token: string | null
          plaid_account_id: string | null
          plaid_item_id: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_mask?: string | null
          account_type: string
          available_balance?: number | null
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          id?: string
          institution_id?: string | null
          institution_logo?: string | null
          institution_name: string
          last_synced?: string | null
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          plaid_item_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_mask?: string | null
          account_type?: string
          available_balance?: number | null
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number | null
          id?: string
          institution_id?: string | null
          institution_logo?: string | null
          institution_name?: string
          last_synced?: string | null
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          plaid_item_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          certificate_url: string | null
          course_id: string
          id: string
          issued_at: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          certificate_url?: string | null
          course_id: string
          id?: string
          issued_at?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          certificate_url?: string | null
          course_id?: string
          id?: string
          issued_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "literacy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          module_order: number
          quiz_questions: Json | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_order: number
          quiz_questions?: Json | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_order?: number
          quiz_questions?: Json | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "literacy_courses"
            referencedColumns: ["id"]
          },
        ]
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
      crypto_holdings: {
        Row: {
          created_at: string | null
          current_price: number | null
          exchange: string | null
          id: string
          integration_id: string | null
          name: string
          purchase_date: string | null
          purchase_price: number | null
          quantity: number
          symbol: string
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          current_price?: number | null
          exchange?: string | null
          id?: string
          integration_id?: string | null
          name: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity: number
          symbol: string
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          current_price?: number | null
          exchange?: string | null
          id?: string
          integration_id?: string | null
          name?: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          symbol?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_holdings_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integration_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_price_history: {
        Row: {
          id: string
          market_cap: number | null
          percent_change_24h: number | null
          price: number
          recorded_at: string | null
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          id?: string
          market_cap?: number | null
          percent_change_24h?: number | null
          price: number
          recorded_at?: string | null
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          id?: string
          market_cap?: number | null
          percent_change_24h?: number | null
          price?: number
          recorded_at?: string | null
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          chart_config: Json | null
          created_at: string | null
          date_range: Json
          filters: Json | null
          id: string
          is_scheduled: boolean | null
          report_name: string
          report_type: string
          schedule_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chart_config?: Json | null
          created_at?: string | null
          date_range: Json
          filters?: Json | null
          id?: string
          is_scheduled?: boolean | null
          report_name: string
          report_type: string
          schedule_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chart_config?: Json | null
          created_at?: string | null
          date_range?: Json
          filters?: Json | null
          id?: string
          is_scheduled?: boolean | null
          report_name?: string
          report_type?: string
          schedule_frequency?: string | null
          updated_at?: string | null
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
          currency: string | null
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
          currency?: string | null
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
          currency?: string | null
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
      esg_investments: {
        Row: {
          amount: number
          created_at: string | null
          environmental_score: number | null
          esg_score: number | null
          governance_score: number | null
          id: string
          investment_name: string
          purchased_at: string | null
          sectors: string[] | null
          social_score: number | null
          ticker_symbol: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          environmental_score?: number | null
          esg_score?: number | null
          governance_score?: number | null
          id?: string
          investment_name: string
          purchased_at?: string | null
          sectors?: string[] | null
          social_score?: number | null
          ticker_symbol?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          environmental_score?: number | null
          esg_score?: number | null
          governance_score?: number | null
          id?: string
          investment_name?: string
          purchased_at?: string | null
          sectors?: string[] | null
          social_score?: number | null
          ticker_symbol?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      esg_preferences: {
        Row: {
          carbon_offset_enabled: boolean | null
          created_at: string | null
          environmental_weight: number | null
          exclude_sectors: string[] | null
          governance_weight: number | null
          id: string
          social_weight: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          carbon_offset_enabled?: boolean | null
          created_at?: string | null
          environmental_weight?: number | null
          exclude_sectors?: string[] | null
          governance_weight?: number | null
          id?: string
          social_weight?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          carbon_offset_enabled?: boolean | null
          created_at?: string | null
          environmental_weight?: number | null
          exclude_sectors?: string[] | null
          governance_weight?: number | null
          id?: string
          social_weight?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          base_currency: string
          fetched_at: string | null
          id: string
          rate: number
          target_currency: string
        }
        Insert: {
          base_currency: string
          fetched_at?: string | null
          id?: string
          rate: number
          target_currency: string
        }
        Update: {
          base_currency?: string
          fetched_at?: string | null
          id?: string
          rate?: number
          target_currency?: string
        }
        Relationships: []
      }
      family_budgets: {
        Row: {
          category_limits: Json | null
          created_at: string | null
          family_group_id: string
          id: string
          is_active: boolean | null
          name: string
          period: string
          total_limit: number
          updated_at: string | null
        }
        Insert: {
          category_limits?: Json | null
          created_at?: string | null
          family_group_id: string
          id?: string
          is_active?: boolean | null
          name: string
          period: string
          total_limit: number
          updated_at?: string | null
        }
        Update: {
          category_limits?: Json | null
          created_at?: string | null
          family_group_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          period?: string
          total_limit?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_budgets_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          expense_date: string
          family_group_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          expense_date: string
          family_group_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          family_group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_expenses_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_group_id: string
          id: string
          joined_at: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Insert: {
          family_group_id: string
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Update: {
          family_group_id?: string
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["family_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
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
      financial_health_scores: {
        Row: {
          calculated_at: string | null
          credit_score_component: number | null
          debt_component: number | null
          emergency_fund_component: number | null
          goals_component: number | null
          id: string
          investment_component: number | null
          overall_score: number
          recommendations: Json | null
          savings_component: number | null
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          credit_score_component?: number | null
          debt_component?: number | null
          emergency_fund_component?: number | null
          goals_component?: number | null
          id?: string
          investment_component?: number | null
          overall_score: number
          recommendations?: Json | null
          savings_component?: number | null
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          credit_score_component?: number | null
          debt_component?: number | null
          emergency_fund_component?: number | null
          goals_component?: number | null
          id?: string
          investment_component?: number | null
          overall_score?: number
          recommendations?: Json | null
          savings_component?: number | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          currency: string | null
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
          currency?: string | null
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
          currency?: string | null
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
      integration_configs: {
        Row: {
          created_at: string | null
          credentials_encrypted: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_synced: string | null
          provider_name: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_synced?: string | null
          provider_name: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_synced?: string | null
          provider_name?: string
          settings?: Json | null
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
      invoices: {
        Row: {
          amount: number
          business_profile_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          invoice_type: string
          issue_date: string
          notes: string | null
          paid_date: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          updated_at: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          business_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          invoice_type: string
          issue_date: string
          notes?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          business_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          invoice_type?: string
          issue_date?: string
          notes?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          calculated_at: string | null
          category: string
          id: string
          leaderboard_type: string
          rank: number
          score: number
          time_period: string | null
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          category: string
          id?: string
          leaderboard_type: string
          rank: number
          score: number
          time_period?: string | null
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          category?: string
          id?: string
          leaderboard_type?: string
          rank?: number
          score?: number
          time_period?: string | null
          user_id?: string
        }
        Relationships: []
      }
      literacy_courses: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          language: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          budget_alerts: boolean | null
          created_at: string | null
          digest_frequency: string | null
          email_notifications: boolean | null
          goal_reminders: boolean | null
          id: string
          marketing_emails: boolean | null
          push_notifications: boolean | null
          transfer_alerts: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest_enabled: boolean | null
          weekly_summary: boolean | null
        }
        Insert: {
          budget_alerts?: boolean | null
          created_at?: string | null
          digest_frequency?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          transfer_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest_enabled?: boolean | null
          weekly_summary?: boolean | null
        }
        Update: {
          budget_alerts?: boolean | null
          created_at?: string | null
          digest_frequency?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          transfer_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest_enabled?: boolean | null
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          organization_id: string
          permissions: Json | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          organization_id: string
          permissions?: Json | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          organization_id?: string
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_branding: {
        Row: {
          accent_color: string | null
          created_at: string | null
          custom_css: string | null
          custom_domain: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          organization_id: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          organization_id: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          organization_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string | null
          organization_id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          organization_id: string
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string
          plan_type: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id: string
          plan_type?: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string
          plan_type?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_accounts: {
        Row: {
          account_identifier: string
          account_type: string
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          integration_id: string | null
          is_verified: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_identifier: string
          account_type: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          integration_id?: string | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_identifier?: string
          account_type?: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          integration_id?: string | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integration_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      plaid_link_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          link_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          link_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          link_token?: string
          user_id?: string
        }
        Relationships: []
      }
      pots: {
        Row: {
          color: string | null
          created_at: string | null
          currency: string | null
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
          currency?: string | null
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
          currency?: string | null
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
          current_streak: number | null
          email: string | null
          full_name: string | null
          id: string
          last_activity_date: string | null
          onboarding_completed: boolean | null
          onboarding_draft_data: Json | null
          onboarding_progress: Json | null
          onboarding_quiz: Json | null
          onboarding_step: string | null
          preferred_currency: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_draft_data?: Json | null
          onboarding_progress?: Json | null
          onboarding_quiz?: Json | null
          onboarding_step?: string | null
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_draft_data?: Json | null
          onboarding_progress?: Json | null
          onboarding_quiz?: Json | null
          onboarding_step?: string | null
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_user_id: string
          reward_amount: number | null
          reward_points: number | null
          rewarded_at: string | null
          signed_up_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          reward_amount?: number | null
          reward_points?: number | null
          rewarded_at?: string | null
          signed_up_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_amount?: number | null
          reward_points?: number | null
          rewarded_at?: string | null
          signed_up_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          template_config: Json
          template_name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          template_config: Json
          template_name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          template_config?: Json
          template_name?: string
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
      scheduled_vendor_payments: {
        Row: {
          amount: number
          business_profile_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_payment_date: string | null
          next_payment_date: string
          updated_at: string | null
          user_id: string
          vendor_id: string
        }
        Insert: {
          amount: number
          business_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          next_payment_date: string
          updated_at?: string | null
          user_id: string
          vendor_id: string
        }
        Update: {
          amount?: number
          business_profile_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          next_payment_date?: string
          updated_at?: string | null
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_vendor_payments_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number
          award_date: string | null
          created_at: string | null
          disbursement_schedule: string | null
          id: string
          name: string
          notes: string | null
          provider: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          award_date?: string | null
          created_at?: string | null
          disbursement_schedule?: string | null
          id?: string
          name: string
          notes?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          award_date?: string | null
          created_at?: string | null
          disbursement_schedule?: string | null
          id?: string
          name?: string
          notes?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_shares: {
        Row: {
          content_id: string | null
          id: string
          platform: string
          share_type: string
          shared_at: string | null
          user_id: string
        }
        Insert: {
          content_id?: string | null
          id?: string
          platform: string
          share_type: string
          shared_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string | null
          id?: string
          platform?: string
          share_type?: string
          shared_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spending_forecasts: {
        Row: {
          actual_amount: number | null
          category: string
          confidence_score: number | null
          created_at: string | null
          forecast_date: string
          id: string
          predicted_amount: number
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          category: string
          confidence_score?: number | null
          created_at?: string | null
          forecast_date: string
          id?: string
          predicted_amount: number
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          forecast_date?: string
          id?: string
          predicted_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      streak_freeze_inventory: {
        Row: {
          created_at: string | null
          freeze_days_available: number
          freeze_days_used: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          freeze_days_available?: number
          freeze_days_used?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          freeze_days_available?: number
          freeze_days_used?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      streak_freeze_usage: {
        Row: {
          created_at: string | null
          freeze_end_date: string
          freeze_start_date: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          freeze_end_date: string
          freeze_start_date: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          freeze_end_date?: string
          freeze_start_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      student_budget_templates: {
        Row: {
          category_allocations: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          total_budget: number
        }
        Insert: {
          category_allocations: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          total_budget: number
        }
        Update: {
          category_allocations?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          total_budget?: number
        }
        Relationships: []
      }
      student_income: {
        Row: {
          amount: number
          created_at: string | null
          frequency: string
          id: string
          income_date: string
          is_active: boolean | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          frequency?: string
          id?: string
          income_date: string
          is_active?: boolean | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          frequency?: string
          id?: string
          income_date?: string
          is_active?: boolean | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      student_loans: {
        Row: {
          created_at: string | null
          current_balance: number
          grace_period_end: string | null
          id: string
          interest_rate: number
          lender: string | null
          loan_name: string
          loan_type: string | null
          monthly_payment: number | null
          principal_amount: number
          repayment_plan: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_balance: number
          grace_period_end?: string | null
          id?: string
          interest_rate: number
          lender?: string | null
          loan_name: string
          loan_type?: string | null
          monthly_payment?: number | null
          principal_amount: number
          repayment_plan?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_balance?: number
          grace_period_end?: string | null
          id?: string
          interest_rate?: number
          lender?: string | null
          loan_name?: string
          loan_type?: string | null
          monthly_payment?: number | null
          principal_amount?: number
          repayment_plan?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string | null
          degree_program: string | null
          graduation_year: number | null
          id: string
          school_name: string | null
          student_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree_program?: string | null
          graduation_year?: number | null
          id?: string
          school_name?: string | null
          student_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree_program?: string | null
          graduation_year?: number | null
          id?: string
          school_name?: string | null
          student_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_analytics: {
        Row: {
          amount: number | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          plan_name: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          plan_name?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          plan_name?: string | null
          user_id?: string
        }
        Relationships: []
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
      sustainable_goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          goal_name: string
          goal_type: string
          id: string
          impact_metrics: Json | null
          is_active: boolean | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          goal_name: string
          goal_type: string
          id?: string
          impact_metrics?: Json | null
          is_active?: boolean | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          goal_name?: string
          goal_type?: string
          id?: string
          impact_metrics?: Json | null
          is_active?: boolean | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_documents: {
        Row: {
          created_at: string | null
          document_type: string
          exported_at: string | null
          exported_to_software: string | null
          file_url: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          tax_year: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          exported_at?: string | null
          exported_to_software?: string | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          tax_year: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          exported_at?: string | null
          exported_to_software?: string | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          tax_year?: number
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
          currency: string | null
          description: string | null
          id: string
          is_recurring: boolean | null
          merchant: string | null
          original_amount: number | null
          original_currency: string | null
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
          currency?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          merchant?: string | null
          original_amount?: number | null
          original_currency?: string | null
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
          currency?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          merchant?: string | null
          original_amount?: number | null
          original_currency?: string | null
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
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
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
      user_benchmarks: {
        Row: {
          benchmark_type: string
          calculated_at: string | null
          demographic_group: string | null
          id: string
          peer_average: number
          peer_percentile: number | null
          user_id: string
          user_value: number
        }
        Insert: {
          benchmark_type: string
          calculated_at?: string | null
          demographic_group?: string | null
          id?: string
          peer_average: number
          peer_percentile?: number | null
          user_id: string
          user_value: number
        }
        Update: {
          benchmark_type?: string
          calculated_at?: string | null
          demographic_group?: string | null
          id?: string
          peer_average?: number
          peer_percentile?: number | null
          user_id?: string
          user_value?: number
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
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          id: string
          progress: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          completed_modules: Json | null
          course_id: string
          id: string
          progress_percentage: number | null
          quiz_scores: Json | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_modules?: Json | null
          course_id: string
          id?: string
          progress_percentage?: number | null
          quiz_scores?: Json | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_modules?: Json | null
          course_id?: string
          id?: string
          progress_percentage?: number | null
          quiz_scores?: Json | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "literacy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_currency_preferences: {
        Row: {
          display_all_currencies: boolean | null
          id: string
          primary_currency: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          display_all_currencies?: boolean | null
          id?: string
          primary_currency?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          display_all_currencies?: boolean | null
          id?: string
          primary_currency?: string
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
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string
          updated_at?: string | null
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
      vendors: {
        Row: {
          address: string | null
          business_profile_id: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          payment_terms: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
          vendor_name: string
        }
        Insert: {
          address?: string | null
          business_profile_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
          vendor_name: string
        }
        Update: {
          address?: string | null
          business_profile_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      reset_inactive_streaks: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      family_role: "parent" | "child" | "partner"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      tax_category:
        | "office_supplies"
        | "equipment"
        | "travel"
        | "meals"
        | "utilities"
        | "rent"
        | "insurance"
        | "professional_services"
        | "marketing"
        | "software"
        | "payroll"
        | "other"
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
      family_role: ["parent", "child", "partner"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      tax_category: [
        "office_supplies",
        "equipment",
        "travel",
        "meals",
        "utilities",
        "rent",
        "insurance",
        "professional_services",
        "marketing",
        "software",
        "payroll",
        "other",
      ],
    },
  },
} as const

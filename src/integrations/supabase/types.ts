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
      account_balance_history: {
        Row: {
          account_id: string
          balance: number
          created_at: string | null
          id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          balance: number
          created_at?: string | null
          id?: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string | null
          id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balance_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_collections: {
        Row: {
          category: Database["public"]["Enums"]["achievement_category"]
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["achievement_category"]
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          achievement_type: string
          badge_color: string | null
          category: Database["public"]["Enums"]["achievement_category"] | null
          created_at: string | null
          description: string | null
          freeze_day_reward: number | null
          icon: string | null
          id: string
          name: string
          points: number
          requirement: Json
        }
        Insert: {
          achievement_type: string
          badge_color?: string | null
          category?: Database["public"]["Enums"]["achievement_category"] | null
          created_at?: string | null
          description?: string | null
          freeze_day_reward?: number | null
          icon?: string | null
          id?: string
          name: string
          points?: number
          requirement?: Json
        }
        Update: {
          achievement_type?: string
          badge_color?: string | null
          category?: Database["public"]["Enums"]["achievement_category"] | null
          created_at?: string | null
          description?: string | null
          freeze_day_reward?: number | null
          icon?: string | null
          id?: string
          name?: string
          points?: number
          requirement?: Json
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read: boolean | null
          read_at: string | null
          related_incident_id: string | null
          severity: string
          title: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read?: boolean | null
          read_at?: string | null
          related_incident_id?: string | null
          severity: string
          title: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read?: boolean | null
          read_at?: string | null
          related_incident_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_related_incident_id_fkey"
            columns: ["related_incident_id"]
            isOneToOne: false
            referencedRelation: "incident_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_actions: {
        Row: {
          action_type: string
          delegation_id: string | null
          executed_at: string | null
          id: string
          parameters: Json | null
          result: Json | null
          success: boolean | null
          user_id: string
          user_notified: boolean | null
        }
        Insert: {
          action_type: string
          delegation_id?: string | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          success?: boolean | null
          user_id: string
          user_notified?: boolean | null
        }
        Update: {
          action_type?: string
          delegation_id?: string | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          success?: boolean | null
          user_id?: string
          user_notified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_delegation_id_fkey"
            columns: ["delegation_id"]
            isOneToOne: false
            referencedRelation: "agent_delegations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_consultations: {
        Row: {
          consulting_agent: string
          conversation_id: string | null
          created_at: string
          id: string
          query: string
          requesting_agent: string
          response: string | null
        }
        Insert: {
          consulting_agent: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          query: string
          requesting_agent: string
          response?: string | null
        }
        Update: {
          consulting_agent?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          query?: string
          requesting_agent?: string
          response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_consultations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_delegations: {
        Row: {
          agent_id: string | null
          constraints: Json | null
          created_at: string | null
          granted_permissions: Json | null
          id: string
          last_action_at: string | null
          scenario_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          constraints?: Json | null
          created_at?: string | null
          granted_permissions?: Json | null
          id?: string
          last_action_at?: string | null
          scenario_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          constraints?: Json | null
          created_at?: string | null
          granted_permissions?: Json | null
          id?: string
          last_action_at?: string | null
          scenario_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_delegations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "autonomous_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_delegations_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "twin_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_documents: {
        Row: {
          analysis_result: Json | null
          analysis_status: string | null
          analyzed_at: string | null
          conversation_id: string | null
          created_at: string
          file_name: string
          file_size_bytes: number
          file_type: string
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          analysis_status?: string | null
          analyzed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          file_name: string
          file_size_bytes: number
          file_type: string
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          analysis_status?: string | null
          analyzed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          file_name?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_documents_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory: {
        Row: {
          agent_type: string
          confidence_score: number | null
          created_at: string
          id: string
          key: string
          memory_type: string
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          agent_type: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          key: string
          memory_type: string
          updated_at?: string
          user_id: string
          value: Json
        }
        Update: {
          agent_type?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          key?: string
          memory_type?: string
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      agent_nudges: {
        Row: {
          acted_on_at: string | null
          action_url: string | null
          agent_type: string
          created_at: string
          dismissed_at: string | null
          expires_at: string | null
          id: string
          message: string
          nudge_type: string
          priority: number | null
          sent_at: string | null
          trigger_data: Json | null
          user_id: string
        }
        Insert: {
          acted_on_at?: string | null
          action_url?: string | null
          agent_type: string
          created_at?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          nudge_type: string
          priority?: number | null
          sent_at?: string | null
          trigger_data?: Json | null
          user_id: string
        }
        Update: {
          acted_on_at?: string | null
          action_url?: string | null
          agent_type?: string
          created_at?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          nudge_type?: string
          priority?: number | null
          sent_at?: string | null
          trigger_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          agent_type: string
          capabilities: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          system_prompt: string
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          capabilities?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          system_prompt: string
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          capabilities?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_cfo_sessions: {
        Row: {
          conversation_history: Json | null
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          user_id: string
        }
        Insert: {
          conversation_history?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          user_id: string
        }
        Update: {
          conversation_history?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          user_id?: string
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
      ai_conversations: {
        Row: {
          agent_type: string
          conversation_history: Json
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          metadata: Json | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_type: string
          conversation_history?: Json
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_type?: string
          conversation_history?: Json
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_model_ab_tests: {
        Row: {
          agent_type: string
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          model_a: string
          model_b: string
          start_date: string | null
          test_name: string
          traffic_split: number | null
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          model_a: string
          model_b: string
          start_date?: string | null
          test_name: string
          traffic_split?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          model_a?: string
          model_b?: string
          start_date?: string | null
          test_name?: string
          traffic_split?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_model_routing_analytics: {
        Row: {
          actual_cost: number | null
          confidence_score: number | null
          conversation_id: string | null
          created_at: string | null
          estimated_cost: number | null
          fallback_reason: string | null
          id: string
          model_used: string
          query_length: number | null
          query_type: string
          reasoning_tokens: number | null
          response_time_ms: number | null
          token_count: number | null
          user_id: string | null
          was_fallback: boolean | null
        }
        Insert: {
          actual_cost?: number | null
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          fallback_reason?: string | null
          id?: string
          model_used: string
          query_length?: number | null
          query_type: string
          reasoning_tokens?: number | null
          response_time_ms?: number | null
          token_count?: number | null
          user_id?: string | null
          was_fallback?: boolean | null
        }
        Update: {
          actual_cost?: number | null
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          fallback_reason?: string | null
          id?: string
          model_used?: string
          query_length?: number | null
          query_type?: string
          reasoning_tokens?: number | null
          response_time_ms?: number | null
          token_count?: number | null
          user_id?: string | null
          was_fallback?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_routing_analytics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_model_test_results: {
        Row: {
          agent_type: string
          conversation_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          model_used: string
          response_time_ms: number | null
          test_id: string | null
          token_count: number | null
          user_feedback: number | null
          user_id: string
        }
        Insert: {
          agent_type: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used: string
          response_time_ms?: number | null
          test_id?: string | null
          token_count?: number | null
          user_feedback?: number | null
          user_id: string
        }
        Update: {
          agent_type?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string
          response_time_ms?: number | null
          test_id?: string | null
          token_count?: number | null
          user_feedback?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_test_results_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_model_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ai_model_ab_tests"
            referencedColumns: ["id"]
          },
        ]
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
      api_response_cache: {
        Row: {
          cache_key: string
          cache_type: string
          created_at: string
          expires_at: string
          hit_count: number | null
          id: string
          response_data: Json
          user_id: string | null
        }
        Insert: {
          cache_key: string
          cache_type: string
          created_at?: string
          expires_at: string
          hit_count?: number | null
          id?: string
          response_data: Json
          user_id?: string | null
        }
        Update: {
          cache_key?: string
          cache_type?: string
          created_at?: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          response_data?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      automation_execution_log: {
        Row: {
          amount_transferred: number | null
          automation_rule_id: string
          error_message: string | null
          executed_at: string | null
          id: string
          metadata: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount_transferred?: number | null
          automation_rule_id: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount_transferred?: number | null
          automation_rule_id?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_execution_log_automation_rule_id_fkey"
            columns: ["automation_rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json | null
          created_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_run_date: string | null
          metadata: Json | null
          next_run_date: string | null
          notes: string | null
          rule_name: string
          rule_type: string
          run_count: number | null
          start_date: string | null
          trigger_condition: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_config?: Json | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_run_date?: string | null
          metadata?: Json | null
          next_run_date?: string | null
          notes?: string | null
          rule_name: string
          rule_type: string
          run_count?: number | null
          start_date?: string | null
          trigger_condition?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_config?: Json | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_run_date?: string | null
          metadata?: Json | null
          next_run_date?: string | null
          notes?: string | null
          rule_name?: string
          rule_type?: string
          run_count?: number | null
          start_date?: string | null
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
      automation_templates: {
        Row: {
          action_config: Json
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_premium: boolean | null
          name: string
          popularity_score: number | null
          trigger_config: Json
        }
        Insert: {
          action_config: Json
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
          popularity_score?: number | null
          trigger_config: Json
        }
        Update: {
          action_config?: Json
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
          popularity_score?: number | null
          trigger_config?: Json
        }
        Relationships: []
      }
      autonomous_agents: {
        Row: {
          agent_name: string
          agent_type: string
          capabilities: Json[] | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          required_permissions: string[] | null
        }
        Insert: {
          agent_name: string
          agent_type: string
          capabilities?: Json[] | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          required_permissions?: string[] | null
        }
        Update: {
          agent_name?: string
          agent_type?: string
          capabilities?: Json[] | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          required_permissions?: string[] | null
        }
        Relationships: []
      }
      batch_processing_analytics: {
        Row: {
          anomalies_detected: number | null
          batch_id: string
          batch_size: number
          created_at: string | null
          error_message: string | null
          groq_latency_ms: number
          id: string
          queue_depth: number
          retry_count: number | null
          tokens_used: number | null
          total_processing_ms: number
          transactions_processed: number
        }
        Insert: {
          anomalies_detected?: number | null
          batch_id: string
          batch_size: number
          created_at?: string | null
          error_message?: string | null
          groq_latency_ms: number
          id?: string
          queue_depth: number
          retry_count?: number | null
          tokens_used?: number | null
          total_processing_ms: number
          transactions_processed: number
        }
        Update: {
          anomalies_detected?: number | null
          batch_id?: string
          batch_size?: number
          created_at?: string | null
          error_message?: string | null
          groq_latency_ms?: number
          id?: string
          queue_depth?: number
          retry_count?: number | null
          tokens_used?: number | null
          total_processing_ms?: number
          transactions_processed?: number
        }
        Relationships: []
      }
      behavioral_guardrails: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          parameters: Json | null
          rule_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          rule_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          rule_type?: string
          user_id?: string
        }
        Relationships: []
      }
      benchmark_data: {
        Row: {
          benchmark_name: string
          change_percent: number | null
          created_at: string | null
          date: string
          id: string
          value: number
        }
        Insert: {
          benchmark_name: string
          change_percent?: number | null
          created_at?: string | null
          date: string
          id?: string
          value: number
        }
        Update: {
          benchmark_name?: string
          change_percent?: number | null
          created_at?: string | null
          date?: string
          id?: string
          value?: number
        }
        Relationships: []
      }
      benefit_matches: {
        Row: {
          activated_at: string | null
          benefit_id: string
          created_at: string | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          match_confidence: number | null
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          benefit_id: string
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          match_confidence?: number | null
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          benefit_id?: string
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          match_confidence?: number | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_matches_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "card_benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_matches_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "card_transactions"
            referencedColumns: ["id"]
          },
        ]
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
      blocked_ips: {
        Row: {
          block_type: string
          blocked_at: string
          blocked_by: string | null
          created_at: string
          expires_at: string | null
          failure_count: number | null
          id: string
          ip_address: string
          last_failure_at: string | null
          metadata: Json | null
          reason: string
          updated_at: string
        }
        Insert: {
          block_type?: string
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          expires_at?: string | null
          failure_count?: number | null
          id?: string
          ip_address: string
          last_failure_at?: string | null
          metadata?: Json | null
          reason: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          expires_at?: string | null
          failure_count?: number | null
          id?: string
          ip_address?: string
          last_failure_at?: string | null
          metadata?: Json | null
          reason?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookkeeping_integrations: {
        Row: {
          access_token_encrypted: string | null
          business_profile_id: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          provider: string
          realm_id: string | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          sync_enabled: boolean | null
          sync_frequency: string | null
          sync_status: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider: string
          realm_id?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          sync_status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider?: string
          realm_id?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          sync_status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookkeeping_integrations_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_activity_log: {
        Row: {
          action_data: Json | null
          action_type: string
          budget_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          budget_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          budget_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_activity_log_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_analytics: {
        Row: {
          budget_id: string
          budgeted: number
          created_at: string | null
          id: string
          metadata: Json | null
          period: string
          period_date: string
          spent: number | null
          user_id: string
          variance: number | null
        }
        Insert: {
          budget_id: string
          budgeted: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period: string
          period_date: string
          spent?: number | null
          user_id: string
          variance?: number | null
        }
        Update: {
          budget_id?: string
          budgeted?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period?: string
          period_date?: string
          spent?: number | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_analytics_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_custom: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_custom?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budget_comments: {
        Row: {
          budget_id: string
          comment_text: string
          created_at: string
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_id: string
          comment_text: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_id?: string
          comment_text?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_comments_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "budget_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_inflation_alerts: {
        Row: {
          budget_id: string
          category: string
          created_at: string
          evidence: Json
          id: string
          old_budget: number
          reason: string
          status: string
          suggested_budget: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_id: string
          category: string
          created_at?: string
          evidence?: Json
          id?: string
          old_budget: number
          reason: string
          status?: string
          suggested_budget: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_id?: string
          category?: string
          created_at?: string
          evidence?: Json
          id?: string
          old_budget?: number
          reason?: string
          status?: string
          suggested_budget?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_inflation_alerts_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_nl_creation_log: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          parsed_budget: Json | null
          raw_input: string
          user_id: string
          was_created: boolean | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          parsed_budget?: Json | null
          raw_input: string
          user_id: string
          was_created?: boolean | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          parsed_budget?: Json | null
          raw_input?: string
          user_id?: string
          was_created?: boolean | null
        }
        Relationships: []
      }
      budget_onboarding: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          first_budget_created: boolean | null
          first_category_added: boolean | null
          id: string
          skipped: boolean | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          first_budget_created?: boolean | null
          first_category_added?: boolean | null
          id?: string
          skipped?: boolean | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          first_budget_created?: boolean | null
          first_category_added?: boolean | null
          id?: string
          skipped?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      budget_rebalancing_feedback: {
        Row: {
          action: string
          created_at: string | null
          feedback_notes: string | null
          feedback_reason: string | null
          id: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          feedback_notes?: string | null
          feedback_reason?: string | null
          id?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          feedback_notes?: string | null
          feedback_reason?: string | null
          id?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_rules: {
        Row: {
          budget_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          pattern: string
          priority: number | null
          rule_type: string
          user_id: string
        }
        Insert: {
          budget_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pattern: string
          priority?: number | null
          rule_type: string
          user_id: string
        }
        Update: {
          budget_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pattern?: string
          priority?: number | null
          rule_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_rules_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_shares: {
        Row: {
          accepted_at: string | null
          budget_id: string
          created_at: string
          id: string
          invited_by: string
          permission_level: string
          shared_with_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          budget_id: string
          created_at?: string
          id?: string
          invited_by: string
          permission_level: string
          shared_with_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          budget_id?: string
          created_at?: string
          id?: string
          invited_by?: string
          permission_level?: string
          shared_with_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_shares_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_spending: {
        Row: {
          budget_id: string
          created_at: string | null
          currency: string | null
          id: string
          last_updated: string | null
          period_end: string
          period_start: string
          spent_amount: number | null
          transaction_count: number | null
          user_id: string
        }
        Insert: {
          budget_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          last_updated?: string | null
          period_end: string
          period_start: string
          spent_amount?: number | null
          transaction_count?: number | null
          user_id: string
        }
        Update: {
          budget_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          last_updated?: string | null
          period_end?: string
          period_start?: string
          spent_amount?: number | null
          transaction_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_spending_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
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
      budget_transfer_log: {
        Row: {
          amount: number
          created_at: string
          from_budget_id: string
          id: string
          reason: string | null
          to_budget_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_budget_id: string
          id?: string
          reason?: string | null
          to_budget_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_budget_id?: string
          id?: string
          reason?: string | null
          to_budget_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_transfer_log_from_budget_id_fkey"
            columns: ["from_budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_transfer_log_to_budget_id_fkey"
            columns: ["to_budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
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
      business_income_streams: {
        Row: {
          average_monthly_revenue: number | null
          business_profile_id: string | null
          created_at: string | null
          id: string
          integration_id: string | null
          is_active: boolean | null
          notes: string | null
          payment_terms: string | null
          platform: string | null
          revenue_volatility: number | null
          seasonality_pattern: Json | null
          stream_name: string
          stream_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_monthly_revenue?: number | null
          business_profile_id?: string | null
          created_at?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          platform?: string | null
          revenue_volatility?: number | null
          seasonality_pattern?: Json | null
          stream_name: string
          stream_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_monthly_revenue?: number | null
          business_profile_id?: string | null
          created_at?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          platform?: string | null
          revenue_volatility?: number | null
          seasonality_pattern?: Json | null
          stream_name?: string
          stream_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_income_streams_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_income_streams_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "bookkeeping_integrations"
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
      business_registrations: {
        Row: {
          annual_revenue_estimate: number | null
          atlas_application_id: string | null
          business_profile_id: string | null
          created_at: string | null
          ein: string | null
          entity_type: string
          id: string
          incorporation_date: string | null
          metadata: Json | null
          provider: string | null
          registration_status: string
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_revenue_estimate?: number | null
          atlas_application_id?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          ein?: string | null
          entity_type: string
          id?: string
          incorporation_date?: string | null
          metadata?: Json | null
          provider?: string | null
          registration_status?: string
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_revenue_estimate?: number | null
          atlas_application_id?: string | null
          business_profile_id?: string | null
          created_at?: string | null
          ein?: string | null
          entity_type?: string
          id?: string
          incorporation_date?: string | null
          metadata?: Json | null
          provider?: string | null
          registration_status?: string
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_registrations_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      card_accounts: {
        Row: {
          account_number: string | null
          account_type: string
          apr_bps: number | null
          autopay_amount_type: string | null
          autopay_enabled: boolean | null
          available_cents: number
          billing_cycle_day: number | null
          closed_at: string | null
          created_at: string | null
          credit_limit_cents: number
          current_balance_cents: number | null
          id: string
          last_statement_date: string | null
          minimum_payment_cents: number | null
          next_due_date: string | null
          next_statement_date: string | null
          opened_at: string | null
          routing_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type: string
          apr_bps?: number | null
          autopay_amount_type?: string | null
          autopay_enabled?: boolean | null
          available_cents?: number
          billing_cycle_day?: number | null
          closed_at?: string | null
          created_at?: string | null
          credit_limit_cents?: number
          current_balance_cents?: number | null
          id?: string
          last_statement_date?: string | null
          minimum_payment_cents?: number | null
          next_due_date?: string | null
          next_statement_date?: string | null
          opened_at?: string | null
          routing_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string
          apr_bps?: number | null
          autopay_amount_type?: string | null
          autopay_enabled?: boolean | null
          available_cents?: number
          billing_cycle_day?: number | null
          closed_at?: string | null
          created_at?: string | null
          credit_limit_cents?: number
          current_balance_cents?: number | null
          id?: string
          last_statement_date?: string | null
          minimum_payment_cents?: number | null
          next_due_date?: string | null
          next_statement_date?: string | null
          opened_at?: string | null
          routing_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      card_benefits: {
        Row: {
          activation_required: boolean | null
          activation_url: string | null
          benefit_category: string
          benefit_name: string
          card_tier: string
          created_at: string | null
          description: string
          fine_print: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          trigger_keywords: string[] | null
          trigger_merchant_categories: string[] | null
          trigger_min_amount_cents: number | null
          validity_days: number | null
        }
        Insert: {
          activation_required?: boolean | null
          activation_url?: string | null
          benefit_category: string
          benefit_name: string
          card_tier: string
          created_at?: string | null
          description: string
          fine_print?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          trigger_keywords?: string[] | null
          trigger_merchant_categories?: string[] | null
          trigger_min_amount_cents?: number | null
          validity_days?: number | null
        }
        Update: {
          activation_required?: boolean | null
          activation_url?: string | null
          benefit_category?: string
          benefit_name?: string
          card_tier?: string
          created_at?: string | null
          description?: string
          fine_print?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          trigger_keywords?: string[] | null
          trigger_merchant_categories?: string[] | null
          trigger_min_amount_cents?: number | null
          validity_days?: number | null
        }
        Relationships: []
      }
      card_collateral: {
        Row: {
          account_id: string
          collateral_cents: number
          created_at: string | null
          id: string
          pledged_at: string | null
          released_at: string | null
          source_account_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          collateral_cents: number
          created_at?: string | null
          id?: string
          pledged_at?: string | null
          released_at?: string | null
          source_account_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          collateral_cents?: number
          created_at?: string | null
          id?: string
          pledged_at?: string | null
          released_at?: string | null
          source_account_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_collateral_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "card_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      card_controls: {
        Row: {
          account_id: string
          allowed_merchant_categories: string[] | null
          atm_enabled: boolean | null
          blocked_merchant_categories: string[] | null
          contactless_enabled: boolean | null
          created_at: string | null
          daily_spend_limit_cents: number | null
          id: string
          international_enabled: boolean | null
          monthly_spend_limit_cents: number | null
          online_enabled: boolean | null
          single_transaction_limit_cents: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          allowed_merchant_categories?: string[] | null
          atm_enabled?: boolean | null
          blocked_merchant_categories?: string[] | null
          contactless_enabled?: boolean | null
          created_at?: string | null
          daily_spend_limit_cents?: number | null
          id?: string
          international_enabled?: boolean | null
          monthly_spend_limit_cents?: number | null
          online_enabled?: boolean | null
          single_transaction_limit_cents?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          allowed_merchant_categories?: string[] | null
          atm_enabled?: boolean | null
          blocked_merchant_categories?: string[] | null
          contactless_enabled?: boolean | null
          created_at?: string | null
          daily_spend_limit_cents?: number | null
          id?: string
          international_enabled?: boolean | null
          monthly_spend_limit_cents?: number | null
          online_enabled?: boolean | null
          single_transaction_limit_cents?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_controls_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "card_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      card_payments: {
        Row: {
          account_id: string
          amount_cents: number
          confirmation_number: string | null
          created_at: string | null
          id: string
          is_autopay: boolean | null
          notes: string | null
          payment_date: string | null
          payment_method: string
          payment_source: Json | null
          scheduled_date: string | null
          statement_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount_cents: number
          confirmation_number?: string | null
          created_at?: string | null
          id?: string
          is_autopay?: boolean | null
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          payment_source?: Json | null
          scheduled_date?: string | null
          statement_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          confirmation_number?: string | null
          created_at?: string | null
          id?: string
          is_autopay?: boolean | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_source?: Json | null
          scheduled_date?: string | null
          statement_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "card_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_payments_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "card_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      card_points_ledger: {
        Row: {
          card_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          multiplier: number | null
          points_amount: number
          points_type: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          points_amount: number
          points_type: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          multiplier?: number | null
          points_amount?: number
          points_type?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_points_ledger_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_points_ledger_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "card_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      card_spend_rules: {
        Row: {
          card_id: string | null
          category_filters: string[] | null
          created_at: string | null
          destination_goal_id: string | null
          destination_pot_id: string | null
          id: string
          is_active: boolean | null
          max_daily_save: number | null
          merchant_filters: string[] | null
          min_transaction_amount: number | null
          rule_name: string
          rule_type: string
          rule_value: number
          times_triggered: number | null
          total_saved: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_id?: string | null
          category_filters?: string[] | null
          created_at?: string | null
          destination_goal_id?: string | null
          destination_pot_id?: string | null
          id?: string
          is_active?: boolean | null
          max_daily_save?: number | null
          merchant_filters?: string[] | null
          min_transaction_amount?: number | null
          rule_name: string
          rule_type: string
          rule_value: number
          times_triggered?: number | null
          total_saved?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string | null
          category_filters?: string[] | null
          created_at?: string | null
          destination_goal_id?: string | null
          destination_pot_id?: string | null
          id?: string
          is_active?: boolean | null
          max_daily_save?: number | null
          merchant_filters?: string[] | null
          min_transaction_amount?: number | null
          rule_name?: string
          rule_type?: string
          rule_value?: number
          times_triggered?: number | null
          total_saved?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_spend_rules_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_spend_rules_destination_goal_id_fkey"
            columns: ["destination_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_spend_rules_destination_pot_id_fkey"
            columns: ["destination_pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
        ]
      }
      card_statements: {
        Row: {
          account_id: string
          available_credit_cents: number
          created_at: string | null
          credit_limit_cents: number
          due_date: string
          fees_cents: number | null
          id: string
          interest_cents: number | null
          is_paid: boolean | null
          minimum_payment_cents: number
          new_balance_cents: number
          paid_at: string | null
          payments_cents: number | null
          pdf_path: string | null
          previous_balance_cents: number | null
          purchases_cents: number | null
          statement_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          available_credit_cents: number
          created_at?: string | null
          credit_limit_cents: number
          due_date: string
          fees_cents?: number | null
          id?: string
          interest_cents?: number | null
          is_paid?: boolean | null
          minimum_payment_cents: number
          new_balance_cents: number
          paid_at?: string | null
          payments_cents?: number | null
          pdf_path?: string | null
          previous_balance_cents?: number | null
          purchases_cents?: number | null
          statement_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          available_credit_cents?: number
          created_at?: string | null
          credit_limit_cents?: number
          due_date?: string
          fees_cents?: number | null
          id?: string
          interest_cents?: number | null
          is_paid?: boolean | null
          minimum_payment_cents?: number
          new_balance_cents?: number
          paid_at?: string | null
          payments_cents?: number | null
          pdf_path?: string | null
          previous_balance_cents?: number | null
          purchases_cents?: number | null
          statement_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_statements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "card_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      card_subscriptions: {
        Row: {
          ai_merchant_name: string | null
          amount_cents: number
          cancel_reminder_days_before: number | null
          cancel_reminder_enabled: boolean | null
          card_id: string | null
          category: string | null
          confidence: number | null
          created_at: string | null
          first_detected_at: string | null
          frequency: string | null
          id: string
          is_confirmed: boolean | null
          last_charge_date: string | null
          last_usage_date: string | null
          merchant_name: string
          next_expected_date: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
          usage_count_last_30_days: number | null
          user_id: string
          zombie_score: number | null
        }
        Insert: {
          ai_merchant_name?: string | null
          amount_cents: number
          cancel_reminder_days_before?: number | null
          cancel_reminder_enabled?: boolean | null
          card_id?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          first_detected_at?: string | null
          frequency?: string | null
          id?: string
          is_confirmed?: boolean | null
          last_charge_date?: string | null
          last_usage_date?: string | null
          merchant_name: string
          next_expected_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          usage_count_last_30_days?: number | null
          user_id: string
          zombie_score?: number | null
        }
        Update: {
          ai_merchant_name?: string | null
          amount_cents?: number
          cancel_reminder_days_before?: number | null
          cancel_reminder_enabled?: boolean | null
          card_id?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          first_detected_at?: string | null
          frequency?: string | null
          id?: string
          is_confirmed?: boolean | null
          last_charge_date?: string | null
          last_usage_date?: string | null
          merchant_name?: string
          next_expected_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          usage_count_last_30_days?: number | null
          user_id?: string
          zombie_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "card_subscriptions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_tier_status: {
        Row: {
          avg_utilization_rate: number | null
          consecutive_months_paid_on_time: number | null
          current_tier: string
          id: string
          lifetime_points: number | null
          months_with_rules_active: number | null
          points_to_next_tier: number | null
          tier_benefits: Json | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_utilization_rate?: number | null
          consecutive_months_paid_on_time?: number | null
          current_tier?: string
          id?: string
          lifetime_points?: number | null
          months_with_rules_active?: number | null
          points_to_next_tier?: number | null
          tier_benefits?: Json | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_utilization_rate?: number | null
          consecutive_months_paid_on_time?: number | null
          current_tier?: string
          id?: string
          lifetime_points?: number | null
          months_with_rules_active?: number | null
          points_to_next_tier?: number | null
          tier_benefits?: Json | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      card_transactions: {
        Row: {
          account_id: string
          ai_category: string | null
          ai_confidence: number | null
          ai_merchant_name: string | null
          amount_cents: number
          card_id: string
          created_at: string | null
          description: string | null
          dispute_letter_path: string | null
          dispute_reason: string | null
          dispute_resolved_at: string | null
          dispute_status: string | null
          dispute_submitted_at: string | null
          enriched_at: string | null
          enrichment_status: string | null
          geo_confidence: number | null
          id: string
          merchant_category: string | null
          merchant_city: string | null
          merchant_country: string | null
          merchant_lat: number | null
          merchant_lon: number | null
          merchant_name: string | null
          merchant_state: string | null
          metadata: Json | null
          posted_date: string | null
          receipt_extracted_data: Json | null
          receipt_image_path: string | null
          receipt_match_confidence: number | null
          receipt_matched_at: string | null
          receipt_verified: boolean | null
          status: string | null
          transaction_date: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          account_id: string
          ai_category?: string | null
          ai_confidence?: number | null
          ai_merchant_name?: string | null
          amount_cents: number
          card_id: string
          created_at?: string | null
          description?: string | null
          dispute_letter_path?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          dispute_submitted_at?: string | null
          enriched_at?: string | null
          enrichment_status?: string | null
          geo_confidence?: number | null
          id?: string
          merchant_category?: string | null
          merchant_city?: string | null
          merchant_country?: string | null
          merchant_lat?: number | null
          merchant_lon?: number | null
          merchant_name?: string | null
          merchant_state?: string | null
          metadata?: Json | null
          posted_date?: string | null
          receipt_extracted_data?: Json | null
          receipt_image_path?: string | null
          receipt_match_confidence?: number | null
          receipt_matched_at?: string | null
          receipt_verified?: boolean | null
          status?: string | null
          transaction_date?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          account_id?: string
          ai_category?: string | null
          ai_confidence?: number | null
          ai_merchant_name?: string | null
          amount_cents?: number
          card_id?: string
          created_at?: string | null
          description?: string | null
          dispute_letter_path?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          dispute_submitted_at?: string | null
          enriched_at?: string | null
          enrichment_status?: string | null
          geo_confidence?: number | null
          id?: string
          merchant_category?: string | null
          merchant_city?: string | null
          merchant_country?: string | null
          merchant_lat?: number | null
          merchant_lon?: number | null
          merchant_name?: string | null
          merchant_state?: string | null
          metadata?: Json | null
          posted_date?: string | null
          receipt_extracted_data?: Json | null
          receipt_image_path?: string | null
          receipt_match_confidence?: number | null
          receipt_matched_at?: string | null
          receipt_verified?: boolean | null
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "card_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string
          activated_at: string | null
          billing_address: Json | null
          brand: string | null
          card_type: string
          cardholder_name: string
          created_at: string | null
          cvv_encrypted: string | null
          exp_month: number
          exp_year: number
          frozen_at: string | null
          id: string
          issued_at: string | null
          last4: string
          network: string | null
          pan_encrypted: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          activated_at?: string | null
          billing_address?: Json | null
          brand?: string | null
          card_type: string
          cardholder_name: string
          created_at?: string | null
          cvv_encrypted?: string | null
          exp_month: number
          exp_year: number
          frozen_at?: string | null
          id?: string
          issued_at?: string | null
          last4: string
          network?: string | null
          pan_encrypted?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          activated_at?: string | null
          billing_address?: Json | null
          brand?: string | null
          card_type?: string
          cardholder_name?: string
          created_at?: string | null
          cvv_encrypted?: string | null
          exp_month?: number
          exp_year?: number
          frozen_at?: string | null
          id?: string
          issued_at?: string | null
          last4?: string
          network?: string | null
          pan_encrypted?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "card_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      category_suggestions: {
        Row: {
          amount_range: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          merchant_name: string
          suggested_category_code: string
          times_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_range?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          merchant_name: string
          suggested_category_code: string
          times_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_range?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          merchant_name?: string
          suggested_category_code?: string
          times_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          current_streak: number | null
          days_active: number | null
          id: string
          is_completed: boolean | null
          joined_at: string | null
          milestones_reached: Json | null
          progress: number | null
          rank: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          current_streak?: number | null
          days_active?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          milestones_reached?: Json | null
          progress?: number | null
          rank?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          current_streak?: number | null
          days_active?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          milestones_reached?: Json | null
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
      claude_api_metrics: {
        Row: {
          agent_type: string
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          error_type: string | null
          id: string
          input_tokens: number | null
          latency_ms: number
          model: string
          output_tokens: number | null
          rate_limit_remaining: number | null
          rate_limit_reset: string | null
          request_id: string | null
          status: string
          time_to_first_token_ms: number | null
          tool_count: number | null
          tools_used: string[] | null
          total_stream_time_ms: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          agent_type: string
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms: number
          model?: string
          output_tokens?: number | null
          rate_limit_remaining?: number | null
          rate_limit_reset?: string | null
          request_id?: string | null
          status: string
          time_to_first_token_ms?: number | null
          tool_count?: number | null
          tools_used?: string[] | null
          total_stream_time_ms?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          agent_type?: string
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number
          model?: string
          output_tokens?: number | null
          rate_limit_remaining?: number | null
          rate_limit_reset?: string | null
          request_id?: string | null
          status?: string
          time_to_first_token_ms?: number | null
          tool_count?: number | null
          tools_used?: string[] | null
          total_stream_time_ms?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claude_api_metrics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_goal_members: {
        Row: {
          contribution: number | null
          goal_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          contribution?: number | null
          goal_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          contribution?: number | null
          goal_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_goal_members_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "collaborative_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_goals: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_amount: number | null
          deadline: string | null
          description: string | null
          goal_type: string | null
          id: string
          is_completed: boolean | null
          name: string
          target_amount: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          target_amount?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          target_amount?: number | null
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
      competitor_alerts: {
        Row: {
          acknowledged: boolean | null
          alert_type: string | null
          competitor_price: number
          competitor_provider: string
          created_at: string | null
          id: string
          opportunity_id: string | null
          potential_savings: number
          user_current_price: number
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          alert_type?: string | null
          competitor_price: number
          competitor_provider: string
          created_at?: string | null
          id?: string
          opportunity_id?: string | null
          potential_savings: number
          user_current_price: number
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          alert_type?: string | null
          competitor_price?: number
          competitor_provider?: string
          created_at?: string | null
          id?: string
          opportunity_id?: string | null
          potential_savings?: number
          user_current_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_alerts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "bill_negotiation_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_pricing: {
        Row: {
          category: string
          features: Json | null
          id: string
          last_updated: string | null
          market_region: string | null
          monthly_price: number
          plan_name: string | null
          provider: string
          source: string | null
          speed: string | null
        }
        Insert: {
          category: string
          features?: Json | null
          id?: string
          last_updated?: string | null
          market_region?: string | null
          monthly_price: number
          plan_name?: string | null
          provider: string
          source?: string | null
          speed?: string | null
        }
        Update: {
          category?: string
          features?: Json | null
          id?: string
          last_updated?: string | null
          market_region?: string | null
          monthly_price?: number
          plan_name?: string | null
          provider?: string
          source?: string | null
          speed?: string | null
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          account_color: string | null
          account_mask: string | null
          account_type: string
          apy: number | null
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
          nickname: string | null
          plaid_access_token: string | null
          plaid_account_id: string | null
          plaid_item_id: string | null
          plaid_item_table_id: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_color?: string | null
          account_mask?: string | null
          account_type: string
          apy?: number | null
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
          nickname?: string | null
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          plaid_item_id?: string | null
          plaid_item_table_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_color?: string | null
          account_mask?: string | null
          account_type?: string
          apy?: number | null
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
          nickname?: string | null
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          plaid_item_id?: string | null
          plaid_item_table_id?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_accounts_plaid_item_table_id_fkey"
            columns: ["plaid_item_table_id"]
            isOneToOne: false
            referencedRelation: "plaid_items"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_contexts: {
        Row: {
          captured_at: string | null
          conversation_id: string | null
          id: string
          page_context: Json | null
          page_route: string
          user_id: string
        }
        Insert: {
          captured_at?: string | null
          conversation_id?: string | null
          id?: string
          page_context?: Json | null
          page_route: string
          user_id: string
        }
        Update: {
          captured_at?: string | null
          conversation_id?: string | null
          id?: string
          page_context?: Json | null
          page_route?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_contexts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_starters_cache: {
        Row: {
          context_hash: string
          expires_at: string | null
          generated_at: string | null
          id: string
          starters: Json
          user_id: string
        }
        Insert: {
          context_hash: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          starters: Json
          user_id: string
        }
        Update: {
          context_hash?: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          starters?: Json
          user_id?: string
        }
        Relationships: []
      }
      cooling_off_sessions: {
        Row: {
          early_exit_requested: boolean | null
          end_time: string | null
          id: string
          reflection_notes: string | null
          start_time: string | null
          triggered_by: string
          user_id: string
        }
        Insert: {
          early_exit_requested?: boolean | null
          end_time?: string | null
          id?: string
          reflection_notes?: string | null
          start_time?: string | null
          triggered_by: string
          user_id: string
        }
        Update: {
          early_exit_requested?: boolean | null
          end_time?: string | null
          id?: string
          reflection_notes?: string | null
          start_time?: string | null
          triggered_by?: string
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
      credit_goals: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          id: string
          is_achieved: boolean | null
          reason: string | null
          starting_score: number
          target_date: string | null
          target_score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          is_achieved?: boolean | null
          reason?: string | null
          starting_score: number
          target_date?: string | null
          target_score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          is_achieved?: boolean | null
          reason?: string | null
          starting_score?: number
          target_date?: string | null
          target_score?: number
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
      creditor_negotiations: {
        Row: {
          attempted_at: string | null
          created_at: string | null
          debt_id: string
          final_terms: Json | null
          id: string
          negotiation_type: string
          notes: string | null
          original_terms: Json | null
          requested_terms: Json | null
          script_used: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          created_at?: string | null
          debt_id: string
          final_terms?: Json | null
          id?: string
          negotiation_type: string
          notes?: string | null
          original_terms?: Json | null
          requested_terms?: Json | null
          script_used?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          created_at?: string | null
          debt_id?: string
          final_terms?: Json | null
          id?: string
          negotiation_type?: string
          notes?: string | null
          original_terms?: Json | null
          requested_terms?: Json | null
          script_used?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creditor_negotiations_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
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
      custom_redirects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          from_path: string
          id: string
          is_active: boolean | null
          to_path: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_path: string
          id?: string
          is_active?: boolean | null
          to_path: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_path?: string
          id?: string
          is_active?: boolean | null
          to_path?: string
          updated_at?: string
          usage_count?: number | null
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
      debt_payment_history: {
        Row: {
          amount: number
          created_at: string | null
          debt_id: string
          id: string
          interest_amount: number
          notes: string | null
          payment_date: string
          principal_amount: number
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          debt_id: string
          id?: string
          interest_amount: number
          notes?: string | null
          payment_date: string
          principal_amount: number
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          debt_id?: string
          id?: string
          interest_amount?: number
          notes?: string | null
          payment_date?: string
          principal_amount?: number
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payment_history_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payment_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
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
      debt_payoff_strategies: {
        Row: {
          created_at: string | null
          debt_order: string[] | null
          extra_payment: number | null
          id: string
          is_active: boolean | null
          monthly_payment: number
          name: string
          projected_payoff_date: string | null
          strategy_type: string
          total_debt: number
          total_interest_saved: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_order?: string[] | null
          extra_payment?: number | null
          id?: string
          is_active?: boolean | null
          monthly_payment: number
          name: string
          projected_payoff_date?: string | null
          strategy_type: string
          total_debt: number
          total_interest_saved?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_order?: string[] | null
          extra_payment?: number | null
          id?: string
          is_active?: boolean | null
          monthly_payment?: number
          name?: string
          projected_payoff_date?: string | null
          strategy_type?: string
          total_debt?: number
          total_interest_saved?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          actual_payment: number | null
          created_at: string | null
          currency: string | null
          current_balance: number
          debt_name: string
          debt_type: string | null
          id: string
          interest_rate: number
          is_active: boolean | null
          minimum_payment: number | null
          original_balance: number | null
          payment_due_date: number | null
          payoff_strategy: string | null
          principal_amount: number
          status: string | null
          target_payoff_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_payment?: number | null
          created_at?: string | null
          currency?: string | null
          current_balance: number
          debt_name: string
          debt_type?: string | null
          id?: string
          interest_rate: number
          is_active?: boolean | null
          minimum_payment?: number | null
          original_balance?: number | null
          payment_due_date?: number | null
          payoff_strategy?: string | null
          principal_amount: number
          status?: string | null
          target_payoff_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_payment?: number | null
          created_at?: string | null
          currency?: string | null
          current_balance?: number
          debt_name?: string
          debt_type?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          minimum_payment?: number | null
          original_balance?: number | null
          payment_due_date?: number | null
          payoff_strategy?: string | null
          principal_amount?: number
          status?: string | null
          target_payoff_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      defi_positions: {
        Row: {
          apy: number | null
          asset_address: string | null
          asset_symbol: string
          auto_managed: boolean | null
          chain: string
          created_at: string | null
          current_price: number | null
          current_value_usd: number | null
          entry_price: number | null
          health_factor: number | null
          id: string
          last_rebalanced_at: string | null
          position_metadata: Json | null
          position_type: string
          protocol: string
          protocol_version: string | null
          quantity: number
          updated_at: string | null
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          apy?: number | null
          asset_address?: string | null
          asset_symbol: string
          auto_managed?: boolean | null
          chain?: string
          created_at?: string | null
          current_price?: number | null
          current_value_usd?: number | null
          entry_price?: number | null
          health_factor?: number | null
          id?: string
          last_rebalanced_at?: string | null
          position_metadata?: Json | null
          position_type: string
          protocol: string
          protocol_version?: string | null
          quantity: number
          updated_at?: string | null
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          apy?: number | null
          asset_address?: string | null
          asset_symbol?: string
          auto_managed?: boolean | null
          chain?: string
          created_at?: string | null
          current_price?: number | null
          current_value_usd?: number | null
          entry_price?: number | null
          health_factor?: number | null
          id?: string
          last_rebalanced_at?: string | null
          position_metadata?: Json | null
          position_type?: string
          protocol?: string
          protocol_version?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defi_positions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      defi_transactions: {
        Row: {
          chain: string
          created_at: string | null
          executed_by: string | null
          from_amount: number | null
          from_asset: string | null
          gas_fee_usd: number | null
          id: string
          metadata: Json | null
          protocol: string
          status: string
          strategy_id: string | null
          to_amount: number | null
          to_asset: string | null
          transaction_hash: string
          transaction_type: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          chain?: string
          created_at?: string | null
          executed_by?: string | null
          from_amount?: number | null
          from_asset?: string | null
          gas_fee_usd?: number | null
          id?: string
          metadata?: Json | null
          protocol: string
          status?: string
          strategy_id?: string | null
          to_amount?: number | null
          to_asset?: string | null
          transaction_hash: string
          transaction_type: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          chain?: string
          created_at?: string | null
          executed_by?: string | null
          from_amount?: number | null
          from_asset?: string | null
          gas_fee_usd?: number | null
          id?: string
          metadata?: Json | null
          protocol?: string
          status?: string
          strategy_id?: string | null
          to_amount?: number | null
          to_asset?: string | null
          transaction_hash?: string
          transaction_type?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defi_transactions_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "yield_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defi_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      detected_subscriptions: {
        Row: {
          amount: number
          category: string | null
          confidence: number | null
          created_at: string | null
          frequency: string | null
          id: string
          is_confirmed: boolean | null
          last_charge_date: string | null
          last_usage_date: string | null
          marked_for_cancellation: boolean | null
          marked_for_cancellation_at: string | null
          merchant: string
          next_expected_date: string | null
          paused_at: string | null
          paused_reason: string | null
          status: string | null
          updated_at: string | null
          usage_count_last_30_days: number | null
          user_id: string
          zombie_flagged_at: string | null
          zombie_score: number | null
        }
        Insert: {
          amount: number
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_confirmed?: boolean | null
          last_charge_date?: string | null
          last_usage_date?: string | null
          marked_for_cancellation?: boolean | null
          marked_for_cancellation_at?: string | null
          merchant: string
          next_expected_date?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          status?: string | null
          updated_at?: string | null
          usage_count_last_30_days?: number | null
          user_id: string
          zombie_flagged_at?: string | null
          zombie_score?: number | null
        }
        Update: {
          amount?: number
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_confirmed?: boolean | null
          last_charge_date?: string | null
          last_usage_date?: string | null
          marked_for_cancellation?: boolean | null
          marked_for_cancellation_at?: string | null
          merchant?: string
          next_expected_date?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          status?: string | null
          updated_at?: string | null
          usage_count_last_30_days?: number | null
          user_id?: string
          zombie_flagged_at?: string | null
          zombie_score?: number | null
        }
        Relationships: []
      }
      digital_twin_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          insight_summary: string | null
          model_used: string | null
          outcome_metrics: Json | null
          query_text: string | null
          response_time_ms: number | null
          scenario_parameters: Json | null
          session_id: string | null
          token_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          insight_summary?: string | null
          model_used?: string | null
          outcome_metrics?: Json | null
          query_text?: string | null
          response_time_ms?: number | null
          scenario_parameters?: Json | null
          session_id?: string | null
          token_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          insight_summary?: string | null
          model_used?: string | null
          outcome_metrics?: Json | null
          query_text?: string | null
          response_time_ms?: number | null
          scenario_parameters?: Json | null
          session_id?: string | null
          token_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      digital_twin_profiles: {
        Row: {
          created_at: string | null
          current_state: Json
          id: string
          life_stage: string | null
          risk_tolerance: string | null
          updated_at: string | null
          user_id: string
          values_priorities: Json | null
        }
        Insert: {
          created_at?: string | null
          current_state?: Json
          id?: string
          life_stage?: string | null
          risk_tolerance?: string | null
          updated_at?: string | null
          user_id: string
          values_priorities?: Json | null
        }
        Update: {
          created_at?: string | null
          current_state?: Json
          id?: string
          life_stage?: string | null
          risk_tolerance?: string | null
          updated_at?: string | null
          user_id?: string
          values_priorities?: Json | null
        }
        Relationships: []
      }
      digital_twin_state: {
        Row: {
          calibration_accuracy: number | null
          created_at: string | null
          financial_goals_alignment: number | null
          id: string
          impulse_factor: number | null
          last_calibrated_at: string | null
          personality_profile: Json | null
          risk_tolerance: number | null
          savings_propensity: number | null
          twin_version: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calibration_accuracy?: number | null
          created_at?: string | null
          financial_goals_alignment?: number | null
          id?: string
          impulse_factor?: number | null
          last_calibrated_at?: string | null
          personality_profile?: Json | null
          risk_tolerance?: number | null
          savings_propensity?: number | null
          twin_version?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calibration_accuracy?: number | null
          created_at?: string | null
          financial_goals_alignment?: number | null
          id?: string
          impulse_factor?: number | null
          last_calibrated_at?: string | null
          personality_profile?: Json | null
          risk_tolerance?: number | null
          savings_propensity?: number | null
          twin_version?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      edge_function_rate_limits: {
        Row: {
          call_count: number | null
          created_at: string
          function_name: string
          id: string
          updated_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          call_count?: number | null
          created_at?: string
          function_name: string
          id?: string
          updated_at?: string
          user_id: string
          window_start?: string
        }
        Update: {
          call_count?: number | null
          created_at?: string
          function_name?: string
          id?: string
          updated_at?: string
          user_id?: string
          window_start?: string
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
      financial_anomalies: {
        Row: {
          affected_entity_id: string | null
          affected_entity_type: string | null
          anomaly_type: string
          detected_at: string | null
          factors: Json
          false_positive: boolean | null
          id: string
          resolution_type: string | null
          resolved_at: string | null
          severity: string
          user_id: string
        }
        Insert: {
          affected_entity_id?: string | null
          affected_entity_type?: string | null
          anomaly_type: string
          detected_at?: string | null
          factors?: Json
          false_positive?: boolean | null
          id?: string
          resolution_type?: string | null
          resolved_at?: string | null
          severity?: string
          user_id: string
        }
        Update: {
          affected_entity_id?: string | null
          affected_entity_type?: string | null
          anomaly_type?: string
          detected_at?: string | null
          factors?: Json
          false_positive?: boolean | null
          id?: string
          resolution_type?: string | null
          resolved_at?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_health_benchmarks: {
        Row: {
          age_range: string
          average_score: number
          created_at: string
          id: string
          income_bracket: string
          last_updated: string
          percentile_25: number
          percentile_50: number
          percentile_75: number
          percentile_90: number
          sample_size: number
        }
        Insert: {
          age_range: string
          average_score: number
          created_at?: string
          id?: string
          income_bracket: string
          last_updated?: string
          percentile_25: number
          percentile_50: number
          percentile_75: number
          percentile_90: number
          sample_size: number
        }
        Update: {
          age_range?: string
          average_score?: number
          created_at?: string
          id?: string
          income_bracket?: string
          last_updated?: string
          percentile_25?: number
          percentile_50?: number
          percentile_75?: number
          percentile_90?: number
          sample_size?: number
        }
        Relationships: []
      }
      financial_health_history: {
        Row: {
          calculated_at: string
          components: Json
          created_at: string
          id: string
          recommendations: Json | null
          score: number
          user_id: string
        }
        Insert: {
          calculated_at?: string
          components: Json
          created_at?: string
          id?: string
          recommendations?: Json | null
          score: number
          user_id: string
        }
        Update: {
          calculated_at?: string
          components?: Json
          created_at?: string
          id?: string
          recommendations?: Json | null
          score?: number
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
      financial_questlines: {
        Row: {
          badge_reward: string | null
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          narrative_intro: string | null
          steps: Json
          total_points: number | null
        }
        Insert: {
          badge_reward?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          narrative_intro?: string | null
          steps?: Json
          total_points?: number | null
        }
        Update: {
          badge_reward?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          narrative_intro?: string | null
          steps?: Json
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_questlines_badge_reward_fkey"
            columns: ["badge_reward"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_reward_partners: {
        Row: {
          address: string | null
          bonus_type: string | null
          category: string
          created_at: string | null
          current_multiplier: number | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          multiplier_end_time: string | null
          name: string
        }
        Insert: {
          address?: string | null
          bonus_type?: string | null
          category: string
          created_at?: string | null
          current_multiplier?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          multiplier_end_time?: string | null
          name: string
        }
        Update: {
          address?: string | null
          bonus_type?: string | null
          category?: string
          created_at?: string | null
          current_multiplier?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          multiplier_end_time?: string | null
          name?: string
        }
        Relationships: []
      }
      goal_achievement_unlocks: {
        Row: {
          achievement_id: string
          animation_viewed: boolean | null
          id: string
          metadata: Json | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id: string
          animation_viewed?: boolean | null
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string
          animation_viewed?: boolean | null
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          celebration_type: string | null
          created_at: string | null
          goal_id: string | null
          id: string
          milestone_percentage: number
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          celebration_type?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          milestone_percentage: number
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          celebration_type?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          milestone_percentage?: number
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_preferences: {
        Row: {
          animation_intensity: string | null
          created_at: string | null
          display_order: string[] | null
          updated_at: string | null
          user_id: string
          view_mode: string | null
        }
        Insert: {
          animation_intensity?: string | null
          created_at?: string | null
          display_order?: string[] | null
          updated_at?: string | null
          user_id: string
          view_mode?: string | null
        }
        Update: {
          animation_intensity?: string | null
          created_at?: string | null
          display_order?: string[] | null
          updated_at?: string | null
          user_id?: string
          view_mode?: string | null
        }
        Relationships: []
      }
      goal_transactions: {
        Row: {
          amount: number
          created_at: string | null
          goal_id: string | null
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          goal_id?: string | null
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          goal_id?: string | null
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_visuals: {
        Row: {
          created_at: string | null
          goal_name: string
          id: string
          image_url: string
          prompt_used: string | null
        }
        Insert: {
          created_at?: string | null
          goal_name: string
          id?: string
          image_url: string
          prompt_used?: string | null
        }
        Update: {
          created_at?: string | null
          goal_name?: string
          id?: string
          image_url?: string
          prompt_used?: string | null
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
          is_active: boolean | null
          name: string
          target_amount: number
          time_to_goal_suggestions: Json | null
          updated_at: string | null
          user_id: string
          visual_prompt: string | null
          visual_url: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_amount: number
          time_to_goal_suggestions?: Json | null
          updated_at?: string | null
          user_id: string
          visual_prompt?: string | null
          visual_url?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_amount?: number
          time_to_goal_suggestions?: Json | null
          updated_at?: string | null
          user_id?: string
          visual_prompt?: string | null
          visual_url?: string | null
        }
        Relationships: []
      }
      groq_quota_state: {
        Row: {
          avg_latency_ms: number | null
          circuit_opened_at: string | null
          circuit_state: string | null
          consecutive_failures: number | null
          created_at: string | null
          id: string
          last_request_at: string | null
          latency_samples: number | null
          p95_latency_ms: number | null
          requests_limit_rpd: number | null
          requests_remaining_rpd: number | null
          requests_reset_at: string | null
          tokens_limit_tpm: number | null
          tokens_remaining_tpm: number | null
          tokens_reset_at: string | null
          updated_at: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          circuit_opened_at?: string | null
          circuit_state?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          id?: string
          last_request_at?: string | null
          latency_samples?: number | null
          p95_latency_ms?: number | null
          requests_limit_rpd?: number | null
          requests_remaining_rpd?: number | null
          requests_reset_at?: string | null
          tokens_limit_tpm?: number | null
          tokens_remaining_tpm?: number | null
          tokens_reset_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          circuit_opened_at?: string | null
          circuit_state?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          id?: string
          last_request_at?: string | null
          latency_samples?: number | null
          p95_latency_ms?: number | null
          requests_limit_rpd?: number | null
          requests_remaining_rpd?: number | null
          requests_reset_at?: string | null
          tokens_limit_tpm?: number | null
          tokens_remaining_tpm?: number | null
          tokens_reset_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      incident_logs: {
        Row: {
          action_description: string
          action_type: string
          ai_diagnosis: string | null
          breach_id: string | null
          created_at: string | null
          execution_time_ms: number | null
          fix_applied: string | null
          fix_successful: boolean | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action_description: string
          action_type: string
          ai_diagnosis?: string | null
          breach_id?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          fix_applied?: string | null
          fix_successful?: boolean | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action_description?: string
          action_type?: string
          ai_diagnosis?: string | null
          breach_id?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          fix_applied?: string | null
          fix_successful?: boolean | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_logs_breach_id_fkey"
            columns: ["breach_id"]
            isOneToOne: false
            referencedRelation: "slo_breaches"
            referencedColumns: ["id"]
          },
        ]
      }
      insights_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          beneficiaries: string[] | null
          coverage_amount: number | null
          created_at: string | null
          effective_date: string
          expiration_date: string | null
          id: string
          notes: string | null
          policy_number: string | null
          policy_type: string
          premium_amount: number
          premium_frequency: string
          provider: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          beneficiaries?: string[] | null
          coverage_amount?: number | null
          created_at?: string | null
          effective_date: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          policy_number?: string | null
          policy_type: string
          premium_amount: number
          premium_frequency: string
          provider: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          beneficiaries?: string[] | null
          coverage_amount?: number | null
          created_at?: string | null
          effective_date?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          policy_number?: string | null
          policy_type?: string
          premium_amount?: number
          premium_frequency?: string
          provider?: string
          status?: string | null
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
      investment_alert_settings: {
        Row: {
          created_at: string | null
          daily_portfolio_summary: boolean | null
          drift_threshold_percent: number | null
          id: string
          market_event_alerts: boolean | null
          price_alert_notifications: boolean | null
          updated_at: string | null
          user_id: string
          volatility_alerts: boolean | null
          volatility_threshold_percent: number | null
        }
        Insert: {
          created_at?: string | null
          daily_portfolio_summary?: boolean | null
          drift_threshold_percent?: number | null
          id?: string
          market_event_alerts?: boolean | null
          price_alert_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
          volatility_alerts?: boolean | null
          volatility_threshold_percent?: number | null
        }
        Update: {
          created_at?: string | null
          daily_portfolio_summary?: boolean | null
          drift_threshold_percent?: number | null
          id?: string
          market_event_alerts?: boolean | null
          price_alert_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
          volatility_alerts?: boolean | null
          volatility_threshold_percent?: number | null
        }
        Relationships: []
      }
      investment_mandates: {
        Row: {
          auto_rebalance_enabled: boolean | null
          created_at: string | null
          id: string
          min_harvest_amount: number | null
          rebalancing_threshold: number | null
          risk_tolerance: string
          target_allocation: Json
          tax_loss_harvest_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_rebalance_enabled?: boolean | null
          created_at?: string | null
          id?: string
          min_harvest_amount?: number | null
          rebalancing_threshold?: number | null
          risk_tolerance: string
          target_allocation?: Json
          tax_loss_harvest_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_rebalance_enabled?: boolean | null
          created_at?: string | null
          id?: string
          min_harvest_amount?: number | null
          rebalancing_threshold?: number | null
          risk_tolerance?: string
          target_allocation?: Json
          tax_loss_harvest_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_price_alerts: {
        Row: {
          alert_type: string
          asset_name: string | null
          created_at: string | null
          current_price_at_creation: number | null
          id: string
          is_active: boolean | null
          is_triggered: boolean | null
          note: string | null
          percent_threshold: number | null
          symbol: string
          target_price: number | null
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          asset_name?: string | null
          created_at?: string | null
          current_price_at_creation?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          note?: string | null
          percent_threshold?: number | null
          symbol: string
          target_price?: number | null
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          asset_name?: string | null
          created_at?: string | null
          current_price_at_creation?: number | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          note?: string | null
          percent_threshold?: number | null
          symbol?: string
          target_price?: number | null
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_research_cache: {
        Row: {
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          research_type: string
          symbol: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          research_type: string
          symbol: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          research_type?: string
          symbol?: string
        }
        Relationships: []
      }
      investment_watchlist: {
        Row: {
          added_at: string | null
          asset_type: string
          id: string
          notes: string | null
          symbol: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          asset_type: string
          id?: string
          notes?: string | null
          symbol: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          asset_type?: string
          id?: string
          notes?: string | null
          symbol?: string
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
      kyc_verifications: {
        Row: {
          attempts: number | null
          created_at: string | null
          document_number: string | null
          document_storage_path: string | null
          document_type: string | null
          failure_reason: string | null
          id: string
          status: string
          updated_at: string | null
          user_id: string
          verification_provider: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          document_number?: string | null
          document_storage_path?: string | null
          document_type?: string | null
          failure_reason?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
          verification_provider?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          document_number?: string | null
          document_storage_path?: string | null
          document_type?: string | null
          failure_reason?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          verification_provider?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_visible: boolean | null
          leaderboard_type: string
          period: string
          rank: number | null
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_visible?: boolean | null
          leaderboard_type: string
          period: string
          rank?: number | null
          score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_visible?: boolean | null
          leaderboard_type?: string
          period?: string
          rank?: number | null
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      learning_events: {
        Row: {
          event_data: Json | null
          event_type: string
          feedback_at: string | null
          id: string
          prediction_id: string | null
          user_id: string
          was_accurate: boolean | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          feedback_at?: string | null
          id?: string
          prediction_id?: string | null
          user_id: string
          was_accurate?: boolean | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          feedback_at?: string | null
          id?: string
          prediction_id?: string | null
          user_id?: string
          was_accurate?: boolean | null
        }
        Relationships: []
      }
      life_event_checklists: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          document_storage_path: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          item_type: string
          life_plan_id: string
          priority: string | null
          reminder_date: string | null
          title: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          document_storage_path?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          item_type: string
          life_plan_id: string
          priority?: string | null
          reminder_date?: string | null
          title: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          document_storage_path?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          item_type?: string
          life_plan_id?: string
          priority?: string | null
          reminder_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_event_checklists_life_plan_id_fkey"
            columns: ["life_plan_id"]
            isOneToOne: false
            referencedRelation: "life_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      life_event_costs: {
        Row: {
          actual_amount: number | null
          cost_category: string
          cost_name: string
          cost_type: string
          created_at: string | null
          due_date: string | null
          estimated_amount: number
          frequency: string | null
          id: string
          is_paid: boolean | null
          life_plan_id: string
          notes: string | null
          payment_date: string | null
        }
        Insert: {
          actual_amount?: number | null
          cost_category: string
          cost_name: string
          cost_type: string
          created_at?: string | null
          due_date?: string | null
          estimated_amount: number
          frequency?: string | null
          id?: string
          is_paid?: boolean | null
          life_plan_id: string
          notes?: string | null
          payment_date?: string | null
        }
        Update: {
          actual_amount?: number | null
          cost_category?: string
          cost_name?: string
          cost_type?: string
          created_at?: string | null
          due_date?: string | null
          estimated_amount?: number
          frequency?: string | null
          id?: string
          is_paid?: boolean | null
          life_plan_id?: string
          notes?: string | null
          payment_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "life_event_costs_life_plan_id_fkey"
            columns: ["life_plan_id"]
            isOneToOne: false
            referencedRelation: "life_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      life_event_playbooks: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          event_date: string | null
          event_type: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          event_date?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          event_date?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      life_event_scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_selected: boolean | null
          life_plan_id: string
          parameters: Json
          projected_outcomes: Json
          scenario_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_selected?: boolean | null
          life_plan_id: string
          parameters: Json
          projected_outcomes: Json
          scenario_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_selected?: boolean | null
          life_plan_id?: string
          parameters?: Json
          projected_outcomes?: Json
          scenario_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_event_scenarios_life_plan_id_fkey"
            columns: ["life_plan_id"]
            isOneToOne: false
            referencedRelation: "life_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      life_plans: {
        Row: {
          created_at: string | null
          current_phase: string | null
          description: string | null
          event_type: string
          id: string
          linked_goal_ids: string[] | null
          linked_pot_ids: string[] | null
          status: string | null
          target_date: string | null
          title: string
          total_estimated_cost: number | null
          total_saved: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_phase?: string | null
          description?: string | null
          event_type: string
          id?: string
          linked_goal_ids?: string[] | null
          linked_pot_ids?: string[] | null
          status?: string | null
          target_date?: string | null
          title: string
          total_estimated_cost?: number | null
          total_saved?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_phase?: string | null
          description?: string | null
          event_type?: string
          id?: string
          linked_goal_ids?: string[] | null
          linked_pot_ids?: string[] | null
          status?: string | null
          target_date?: string | null
          title?: string
          total_estimated_cost?: number | null
          total_saved?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lifesim_game_sessions: {
        Row: {
          behavioral_insights: Json | null
          completed_at: string | null
          created_at: string | null
          current_age: number | null
          current_year: number | null
          financial_state: Json
          id: string
          life_events: Json | null
          scenario_id: string | null
          score: number | null
          session_name: string | null
          started_at: string | null
          starting_age: number | null
          status: string | null
          target_age: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          behavioral_insights?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_age?: number | null
          current_year?: number | null
          financial_state?: Json
          id?: string
          life_events?: Json | null
          scenario_id?: string | null
          score?: number | null
          session_name?: string | null
          started_at?: string | null
          starting_age?: number | null
          status?: string | null
          target_age?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          behavioral_insights?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_age?: number | null
          current_year?: number | null
          financial_state?: Json
          id?: string
          life_events?: Json | null
          scenario_id?: string | null
          score?: number | null
          session_name?: string | null
          started_at?: string | null
          starting_age?: number | null
          status?: string | null
          target_age?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifesim_game_sessions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "lifesim_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      lifesim_player_decisions: {
        Row: {
          created_at: string | null
          decision_data: Json
          decision_type: string
          financial_impact: Json | null
          game_year: number
          id: string
          risk_score: number | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          decision_data?: Json
          decision_type: string
          financial_impact?: Json | null
          game_year: number
          id?: string
          risk_score?: number | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          decision_data?: Json
          decision_type?: string
          financial_impact?: Json | null
          game_year?: number
          id?: string
          risk_score?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifesim_player_decisions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lifesim_game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lifesim_scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_duration_minutes: number | null
          events: Json
          id: string
          initial_conditions: Json
          learning_objectives: string[] | null
          scenario_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_duration_minutes?: number | null
          events?: Json
          id?: string
          initial_conditions?: Json
          learning_objectives?: string[] | null
          scenario_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_duration_minutes?: number | null
          events?: Json
          id?: string
          initial_conditions?: Json
          learning_objectives?: string[] | null
          scenario_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lifesim_turns: {
        Row: {
          age: number
          created_at: string | null
          debt: number
          financial_state: Json | null
          id: string
          income: number
          investments: number
          net_worth: number
          session_id: string
          turn_number: number
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string | null
          debt?: number
          financial_state?: Json | null
          id?: string
          income?: number
          investments?: number
          net_worth?: number
          session_id: string
          turn_number: number
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string | null
          debt?: number
          financial_state?: Json | null
          id?: string
          income?: number
          investments?: number
          net_worth?: number
          session_id?: string
          turn_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifesim_turns_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lifesim_game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_health_analyses: {
        Row: {
          analyzed_at: string | null
          created_at: string | null
          health_score: number
          id: string
          recommendations: Json
          risks: Json
          score_label: string
          strengths: Json
          summary: string
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          created_at?: string | null
          health_score: number
          id?: string
          recommendations: Json
          risks: Json
          score_label: string
          strengths: Json
          summary: string
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          created_at?: string | null
          health_score?: number
          id?: string
          recommendations?: Json
          risks?: Json
          score_label?: string
          strengths?: Json
          summary?: string
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
      loan_rate_alerts: {
        Row: {
          alert_threshold: number
          created_at: string | null
          current_rate: number
          debt_id: string | null
          id: string
          is_active: boolean | null
          last_checked_at: string | null
          loan_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_threshold: number
          created_at?: string | null
          current_rate: number
          debt_id?: string | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          loan_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_threshold?: number
          created_at?: string | null
          current_rate?: number
          debt_id?: string | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          loan_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_rate_alerts_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data_cache: {
        Row: {
          change_percent: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          price: number
          symbol: string
          volume: number | null
        }
        Insert: {
          change_percent?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          price: number
          symbol: string
          volume?: number | null
        }
        Update: {
          change_percent?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          price?: number
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      market_loan_rates: {
        Row: {
          created_at: string | null
          current_rate: number
          id: string
          loan_type: string
          min_credit_score: number | null
          previous_rate: number | null
          rate_date: string
          rate_type: string
          source: string | null
          term_years: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_rate: number
          id?: string
          loan_type: string
          min_credit_score?: number | null
          previous_rate?: number | null
          rate_date?: string
          rate_type?: string
          source?: string | null
          term_years?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_rate?: number
          id?: string
          loan_type?: string
          min_credit_score?: number | null
          previous_rate?: number | null
          rate_date?: string
          rate_type?: string
          source?: string | null
          term_years?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_news_cache: {
        Row: {
          cached_at: string | null
          created_at: string | null
          expires_at: string | null
          headline: string
          id: string
          published_at: string | null
          relevance_score: number | null
          sentiment: string | null
          source: string | null
          symbol: string
          url: string | null
        }
        Insert: {
          cached_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          headline: string
          id?: string
          published_at?: string | null
          relevance_score?: number | null
          sentiment?: string | null
          source?: string | null
          symbol: string
          url?: string | null
        }
        Update: {
          cached_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          headline?: string
          id?: string
          published_at?: string | null
          relevance_score?: number | null
          sentiment?: string | null
          source?: string | null
          symbol?: string
          url?: string | null
        }
        Relationships: []
      }
      merchant_category_mappings: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string
          id: string
          is_user_confirmed: boolean | null
          merchant_name: string
          times_applied: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_user_confirmed?: boolean | null
          merchant_name: string
          times_applied?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_user_confirmed?: boolean | null
          merchant_name?: string
          times_applied?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      merchant_enrichment: {
        Row: {
          cleaned_name: string
          confidence_score: number
          created_at: string | null
          id: string
          logo_url: string | null
          raw_merchant: string
          suggested_category: string | null
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          cleaned_name: string
          confidence_score: number
          created_at?: string | null
          id?: string
          logo_url?: string | null
          raw_merchant: string
          suggested_category?: string | null
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          cleaned_name?: string
          confidence_score?: number
          created_at?: string | null
          id?: string
          logo_url?: string | null
          raw_merchant?: string
          suggested_category?: string | null
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      merchant_locations: {
        Row: {
          city: string | null
          confidence: number | null
          country: string | null
          created_at: string | null
          id: string
          lat: number
          lon: number
          merchant_name: string
          source: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          confidence?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          lat: number
          lon: number
          merchant_name: string
          source?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          confidence?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          lat?: number
          lon?: number
          merchant_name?: string
          source?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      merchant_logos: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string
          merchant_name: string
          source: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url: string
          merchant_name: string
          source: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string
          merchant_name?: string
          source?: string
        }
        Relationships: []
      }
      negotiation_script_outcomes: {
        Row: {
          actual_savings: number | null
          created_at: string | null
          id: string
          negotiation_completed_at: string | null
          negotiation_notes: string | null
          new_monthly_amount: number | null
          request_id: string | null
          script_variant_id: string | null
          user_rating: number | null
          was_successful: boolean | null
        }
        Insert: {
          actual_savings?: number | null
          created_at?: string | null
          id?: string
          negotiation_completed_at?: string | null
          negotiation_notes?: string | null
          new_monthly_amount?: number | null
          request_id?: string | null
          script_variant_id?: string | null
          user_rating?: number | null
          was_successful?: boolean | null
        }
        Update: {
          actual_savings?: number | null
          created_at?: string | null
          id?: string
          negotiation_completed_at?: string | null
          negotiation_notes?: string | null
          new_monthly_amount?: number | null
          request_id?: string | null
          script_variant_id?: string | null
          user_rating?: number | null
          was_successful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_script_outcomes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "bill_negotiation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negotiation_script_outcomes_script_variant_id_fkey"
            columns: ["script_variant_id"]
            isOneToOne: false
            referencedRelation: "negotiation_script_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_script_variants: {
        Row: {
          aggressive_script: string
          amount: number
          bloat_items: Json | null
          competitor_offer: Json | null
          created_at: string | null
          data_driven_script: string
          friendly_script: string
          generation_time_ms: number | null
          id: string
          leverage_points: Json | null
          merchant: string
          negotiation_score: number | null
          opportunity_id: string | null
          selected_at: string | null
          selected_variant: string | null
          user_id: string
        }
        Insert: {
          aggressive_script: string
          amount: number
          bloat_items?: Json | null
          competitor_offer?: Json | null
          created_at?: string | null
          data_driven_script: string
          friendly_script: string
          generation_time_ms?: number | null
          id?: string
          leverage_points?: Json | null
          merchant: string
          negotiation_score?: number | null
          opportunity_id?: string | null
          selected_at?: string | null
          selected_variant?: string | null
          user_id: string
        }
        Update: {
          aggressive_script?: string
          amount?: number
          bloat_items?: Json | null
          competitor_offer?: Json | null
          created_at?: string | null
          data_driven_script?: string
          friendly_script?: string
          generation_time_ms?: number | null
          id?: string
          leverage_points?: Json | null
          merchant?: string
          negotiation_score?: number | null
          opportunity_id?: string | null
          selected_at?: string | null
          selected_variant?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_script_variants_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "bill_negotiation_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          budget_alerts: boolean | null
          created_at: string | null
          credit_alerts: boolean | null
          credit_score_alert_threshold: number | null
          digest_frequency: string | null
          email_notifications: boolean | null
          goal_reminders: boolean | null
          id: string
          marketing_emails: boolean | null
          push_notifications: boolean | null
          security_lockdown_alerts: boolean | null
          security_login_alerts: boolean | null
          security_session_revoked: boolean | null
          security_suspicious_activity: boolean | null
          transfer_alerts: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest_enabled: boolean | null
          weekly_summary: boolean | null
        }
        Insert: {
          budget_alerts?: boolean | null
          created_at?: string | null
          credit_alerts?: boolean | null
          credit_score_alert_threshold?: number | null
          digest_frequency?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          security_lockdown_alerts?: boolean | null
          security_login_alerts?: boolean | null
          security_session_revoked?: boolean | null
          security_suspicious_activity?: boolean | null
          transfer_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest_enabled?: boolean | null
          weekly_summary?: boolean | null
        }
        Update: {
          budget_alerts?: boolean | null
          created_at?: string | null
          credit_alerts?: boolean | null
          credit_score_alert_threshold?: number | null
          digest_frequency?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          security_lockdown_alerts?: boolean | null
          security_login_alerts?: boolean | null
          security_session_revoked?: boolean | null
          security_suspicious_activity?: boolean | null
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
        Relationships: [
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "achievement_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_conversations: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          messages: Json
          persona: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          messages?: Json
          persona?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          messages?: Json
          persona?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_steps: string[] | null
          created_at: string | null
          current_step: string
          demo_mode: boolean | null
          draft_data: Json | null
          id: string
          incomplete_tasks: string[] | null
          is_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          demo_mode?: boolean | null
          draft_data?: Json | null
          id?: string
          incomplete_tasks?: string[] | null
          is_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          demo_mode?: boolean | null
          draft_data?: Json | null
          id?: string
          incomplete_tasks?: string[] | null
          is_completed?: boolean | null
          updated_at?: string | null
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
      page_not_found_analytics: {
        Row: {
          attempted_url: string
          contextual_help_shown: boolean | null
          created_at: string
          id: string
          recent_pages_count: number | null
          referrer: string | null
          suggestion_clicked: string | null
          suggestions_shown: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempted_url: string
          contextual_help_shown?: boolean | null
          created_at?: string
          id?: string
          recent_pages_count?: number | null
          referrer?: string | null
          suggestion_clicked?: string | null
          suggestions_shown?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_url?: string
          contextual_help_shown?: boolean | null
          created_at?: string
          id?: string
          recent_pages_count?: number | null
          referrer?: string | null
          suggestion_clicked?: string | null
          suggestions_shown?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          query_params: Json | null
          referrer: string | null
          route: string
          session_id: string | null
          timestamp: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          query_params?: Json | null
          referrer?: string | null
          route: string
          session_id?: string | null
          timestamp?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          query_params?: Json | null
          referrer?: string | null
          route?: string
          session_id?: string | null
          timestamp?: string
          title?: string | null
          user_id?: string | null
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
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
          status: string
          threshold_value: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
          status: string
          threshold_value?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
          status?: string
          threshold_value?: number | null
        }
        Relationships: []
      }
      plaid_items: {
        Row: {
          access_token: string
          consent_expiration_time: string | null
          created_at: string | null
          error_code: string | null
          id: string
          institution_id: string | null
          institution_logo: string | null
          institution_name: string | null
          item_id: string
          status: string | null
          update_type: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          consent_expiration_time?: string | null
          created_at?: string | null
          error_code?: string | null
          id?: string
          institution_id?: string | null
          institution_logo?: string | null
          institution_name?: string | null
          item_id: string
          status?: string | null
          update_type?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          consent_expiration_time?: string | null
          created_at?: string | null
          error_code?: string | null
          id?: string
          institution_id?: string | null
          institution_logo?: string | null
          institution_name?: string | null
          item_id?: string
          status?: string | null
          update_type?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
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
      platform_stats: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          stat_key: string
          stat_metadata: Json | null
          stat_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          stat_key: string
          stat_metadata?: Json | null
          stat_value?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          stat_key?: string
          stat_metadata?: Json | null
          stat_value?: number
        }
        Relationships: []
      }
      playbook_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          download_url: string | null
          generation_status: string | null
          id: string
          metadata: Json | null
          playbook_id: string
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          download_url?: string | null
          generation_status?: string | null
          id?: string
          metadata?: Json | null
          playbook_id: string
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          download_url?: string | null
          generation_status?: string | null
          id?: string
          metadata?: Json | null
          playbook_id?: string
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_documents_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "life_event_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_tasks: {
        Row: {
          assigned_agent: string | null
          automation_status: string | null
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          playbook_id: string
          status: string | null
          task_category: string
          task_name: string
          task_order: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_agent?: string | null
          automation_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          playbook_id: string
          status?: string | null
          task_category: string
          task_name: string
          task_order?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_agent?: string | null
          automation_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          playbook_id?: string
          status?: string | null
          task_category?: string
          task_name?: string
          task_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_tasks_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "life_event_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      points_redemptions: {
        Row: {
          catalog_item_id: string | null
          completed_at: string | null
          created_at: string | null
          dollar_value: number
          fulfillment_details: Json | null
          id: string
          points_spent: number
          redemption_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          catalog_item_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          dollar_value: number
          fulfillment_details?: Json | null
          id?: string
          points_spent: number
          redemption_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          catalog_item_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          dollar_value?: number
          fulfillment_details?: Json | null
          id?: string
          points_spent?: number
          redemption_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_redemptions_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "redemption_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_goals: {
        Row: {
          color: string | null
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          goal_name: string
          goal_type: string
          icon: string | null
          id: string
          target_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          goal_name: string
          goal_type: string
          icon?: string | null
          id?: string
          target_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          goal_name?: string
          goal_type?: string
          icon?: string | null
          id?: string
          target_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          asset_type: string
          cost_basis: number
          created_at: string | null
          id: string
          last_updated: string | null
          market_value: number
          quantity: number
          symbol: string
          unrealized_gain_loss: number
          user_id: string
        }
        Insert: {
          asset_type?: string
          cost_basis?: number
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_value?: number
          quantity?: number
          symbol: string
          unrealized_gain_loss?: number
          user_id: string
        }
        Update: {
          asset_type?: string
          cost_basis?: number
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_value?: number
          quantity?: number
          symbol?: string
          unrealized_gain_loss?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          snapshot_date: string | null
          total_value: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          snapshot_date?: string | null
          total_value: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          snapshot_date?: string | null
          total_value?: number
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
          image_url: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          target_amount: number
          target_date: string | null
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
          image_url?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          target_amount: number
          target_date?: string | null
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
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      proactive_insights: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          insight_type: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          resolution_action: string | null
          resolution_data: Json | null
          resolved_at: string | null
          severity: string
          title: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution_action?: string | null
          resolution_data?: Json | null
          resolved_at?: string | null
          severity: string
          title: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution_action?: string | null
          resolution_data?: Json | null
          resolved_at?: string | null
          severity?: string
          title?: string
          user_id?: string
          viewed_at?: string | null
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
          longest_streak: number | null
          milestones_reached: Json | null
          onboarding_completed: boolean | null
          onboarding_draft_data: Json | null
          onboarding_persona: Json | null
          onboarding_progress: Json | null
          onboarding_quiz: Json | null
          onboarding_step: string | null
          preferred_currency: string | null
          show_dashboard_tutorial: boolean | null
          streak_freeze_available: number | null
          total_check_ins: number | null
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
          longest_streak?: number | null
          milestones_reached?: Json | null
          onboarding_completed?: boolean | null
          onboarding_draft_data?: Json | null
          onboarding_persona?: Json | null
          onboarding_progress?: Json | null
          onboarding_quiz?: Json | null
          onboarding_step?: string | null
          preferred_currency?: string | null
          show_dashboard_tutorial?: boolean | null
          streak_freeze_available?: number | null
          total_check_ins?: number | null
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
          longest_streak?: number | null
          milestones_reached?: Json | null
          onboarding_completed?: boolean | null
          onboarding_draft_data?: Json | null
          onboarding_persona?: Json | null
          onboarding_progress?: Json | null
          onboarding_quiz?: Json | null
          onboarding_step?: string | null
          preferred_currency?: string | null
          show_dashboard_tutorial?: boolean | null
          streak_freeze_available?: number | null
          total_check_ins?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quarterly_tax_projections: {
        Row: {
          amount_paid: number | null
          business_profile_id: string | null
          confidence_score: number | null
          created_at: string | null
          due_date: string
          estimated_tax_federal: number
          estimated_tax_self_employment: number
          estimated_tax_state: number
          id: string
          methodology: string | null
          payment_status: string | null
          projected_expenses: number
          projected_income: number
          quarter: number
          tax_year: number
          total_estimated_tax: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          business_profile_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          due_date: string
          estimated_tax_federal: number
          estimated_tax_self_employment: number
          estimated_tax_state: number
          id?: string
          methodology?: string | null
          payment_status?: string | null
          projected_expenses: number
          projected_income: number
          quarter: number
          tax_year: number
          total_estimated_tax: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          business_profile_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          due_date?: string
          estimated_tax_federal?: number
          estimated_tax_self_employment?: number
          estimated_tax_state?: number
          id?: string
          methodology?: string | null
          payment_status?: string | null
          projected_expenses?: number
          projected_income?: number
          quarter?: number
          tax_year?: number
          total_estimated_tax?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_tax_projections_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rebalancing_actions: {
        Row: {
          action_type: string
          created_at: string | null
          executed_at: string | null
          id: string
          mandate_id: string | null
          price: number
          quantity: number
          reason: string
          status: string | null
          symbol: string
          total_value: number
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          mandate_id?: string | null
          price: number
          quantity: number
          reason: string
          status?: string | null
          symbol: string
          total_value: number
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          mandate_id?: string | null
          price?: number
          quantity?: number
          reason?: string
          status?: string | null
          symbol?: string
          total_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rebalancing_actions_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "investment_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      rebalancing_suggestions: {
        Row: {
          created_at: string | null
          executed_at: string | null
          id: string
          status: string | null
          suggestion_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          executed_at?: string | null
          id?: string
          status?: string | null
          suggestion_data: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          executed_at?: string | null
          id?: string
          status?: string | null
          suggestion_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      recurring_budget_configs: {
        Row: {
          budget_name_template: string
          category_limits: Json
          created_at: string | null
          currency: string | null
          frequency: string
          id: string
          is_active: boolean | null
          next_creation_date: string
          template_id: string | null
          total_limit: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_name_template: string
          category_limits: Json
          created_at?: string | null
          currency?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_creation_date: string
          template_id?: string | null
          total_limit: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_name_template?: string
          category_limits?: Json
          created_at?: string | null
          currency?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_creation_date?: string
          template_id?: string | null
          total_limit?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_budget_configs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "budget_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_detection_queue: {
        Row: {
          created_at: string
          processed_at: string | null
          triggered_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          processed_at?: string | null
          triggered_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          processed_at?: string | null
          triggered_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          avg_amount: number
          category: string | null
          confidence: number
          created_at: string | null
          detected_at: string | null
          expected_date: number | null
          frequency: string
          id: string
          last_occurrence: string
          merchant: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_amount: number
          category?: string | null
          confidence: number
          created_at?: string | null
          detected_at?: string | null
          expected_date?: number | null
          frequency: string
          id?: string
          last_occurrence: string
          merchant: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_amount?: number
          category?: string | null
          confidence?: number
          created_at?: string | null
          detected_at?: string | null
          expected_date?: number | null
          frequency?: string
          id?: string
          last_occurrence?: string
          merchant?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      redemption_catalog: {
        Row: {
          created_at: string | null
          description: string | null
          dollar_value: number
          id: string
          is_active: boolean | null
          metadata: Json | null
          min_points: number | null
          name: string
          partner_logo_url: string | null
          partner_name: string | null
          points_cost: number
          redemption_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dollar_value: number
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          min_points?: number | null
          name: string
          partner_logo_url?: string | null
          partner_name?: string | null
          points_cost: number
          redemption_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dollar_value?: number
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          min_points?: number | null
          name?: string
          partner_logo_url?: string | null
          partner_name?: string | null
          points_cost?: number
          redemption_type?: string
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
      refinancing_applications: {
        Row: {
          actual_savings: number | null
          application_status: string | null
          created_at: string | null
          estimated_closing_date: string | null
          id: string
          lender_name: string | null
          metadata: Json | null
          new_rate: number | null
          new_term_months: number | null
          opportunity_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_savings?: number | null
          application_status?: string | null
          created_at?: string | null
          estimated_closing_date?: string | null
          id?: string
          lender_name?: string | null
          metadata?: Json | null
          new_rate?: number | null
          new_term_months?: number | null
          opportunity_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_savings?: number | null
          application_status?: string | null
          created_at?: string | null
          estimated_closing_date?: string | null
          id?: string
          lender_name?: string | null
          metadata?: Json | null
          new_rate?: number | null
          new_term_months?: number | null
          opportunity_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refinancing_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "refinancing_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      refinancing_opportunities: {
        Row: {
          available_rate: number | null
          confidence_score: number | null
          created_at: string | null
          current_balance: number
          current_payment: number
          current_rate: number
          detected_at: string | null
          estimated_savings_monthly: number | null
          estimated_savings_total: number | null
          expires_at: string | null
          id: string
          liability_type: string
          loan_type: string | null
          net_savings: number | null
          notes: string | null
          potential_new_rate: number
          status: string | null
          user_id: string
        }
        Insert: {
          available_rate?: number | null
          confidence_score?: number | null
          created_at?: string | null
          current_balance: number
          current_payment: number
          current_rate: number
          detected_at?: string | null
          estimated_savings_monthly?: number | null
          estimated_savings_total?: number | null
          expires_at?: string | null
          id?: string
          liability_type: string
          loan_type?: string | null
          net_savings?: number | null
          notes?: string | null
          potential_new_rate: number
          status?: string | null
          user_id: string
        }
        Update: {
          available_rate?: number | null
          confidence_score?: number | null
          created_at?: string | null
          current_balance?: number
          current_payment?: number
          current_rate?: number
          detected_at?: string | null
          estimated_savings_monthly?: number | null
          estimated_savings_total?: number | null
          expires_at?: string | null
          id?: string
          liability_type?: string
          loan_type?: string | null
          net_savings?: number | null
          notes?: string | null
          potential_new_rate?: number
          status?: string | null
          user_id?: string
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
          schedule: string | null
          template_config: Json
          template_name: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          schedule?: string | null
          template_config: Json
          template_name: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          schedule?: string | null
          template_config?: Json
          template_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rwa_holdings: {
        Row: {
          asset_name: string
          asset_type: string
          chain: string
          created_at: string | null
          current_price: number | null
          current_value_usd: number | null
          id: string
          issuer: string
          liquidity_rating: string | null
          maturity_date: string | null
          minimum_hold_period: number | null
          purchase_price: number
          quantity: number
          token_address: string
          token_symbol: string
          underlying_asset_info: Json | null
          updated_at: string | null
          user_id: string
          wallet_id: string | null
          yield_rate: number | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          chain?: string
          created_at?: string | null
          current_price?: number | null
          current_value_usd?: number | null
          id?: string
          issuer: string
          liquidity_rating?: string | null
          maturity_date?: string | null
          minimum_hold_period?: number | null
          purchase_price: number
          quantity: number
          token_address: string
          token_symbol: string
          underlying_asset_info?: Json | null
          updated_at?: string | null
          user_id: string
          wallet_id?: string | null
          yield_rate?: number | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          chain?: string
          created_at?: string | null
          current_price?: number | null
          current_value_usd?: number | null
          id?: string
          issuer?: string
          liquidity_rating?: string | null
          maturity_date?: string | null
          minimum_hold_period?: number | null
          purchase_price?: number
          quantity?: number
          token_address?: string
          token_symbol?: string
          underlying_asset_info?: Json | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string | null
          yield_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rwa_holdings_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_milestones: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          is_celebrated: boolean | null
          milestone_amount: number
          milestone_percentage: number
          reached_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          is_celebrated?: boolean | null
          milestone_amount: number
          milestone_percentage: number
          reached_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          is_celebrated?: boolean | null
          milestone_amount?: number
          milestone_percentage?: number
          reached_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
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
      security_alert_configs: {
        Row: {
          admin_emails: string[]
          alert_type: string
          created_at: string
          enabled: boolean | null
          id: string
          last_triggered_at: string | null
          threshold: number
          updated_at: string
          window_minutes: number
        }
        Insert: {
          admin_emails?: string[]
          alert_type: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          threshold: number
          updated_at?: string
          window_minutes: number
        }
        Update: {
          admin_emails?: string[]
          alert_type?: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          threshold?: number
          updated_at?: string
          window_minutes?: number
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          triggered_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          title: string
          triggered_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          triggered_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_message: string
          event_type: string
          id: string
          metadata: Json | null
          severity: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_message: string
          event_type: string
          id?: string
          metadata?: Json | null
          severity?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_message?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_error_logs: {
        Row: {
          created_at: string
          error_code: string | null
          error_type: string
          first_seen_at: string
          function_name: string
          id: string
          last_seen_at: string
          request_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_type: string
          first_seen_at?: string
          function_name: string
          id?: string
          last_seen_at?: string
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_type?: string
          first_seen_at?: string
          function_name?: string
          id?: string
          last_seen_at?: string
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_validation_failures: {
        Row: {
          attempted_value: string | null
          created_at: string
          error_message: string | null
          failure_type: string
          field_name: string | null
          function_name: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempted_value?: string | null
          created_at?: string
          error_message?: string | null
          failure_type: string
          field_name?: string | null
          function_name: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_value?: string | null
          created_at?: string
          error_message?: string | null
          failure_type?: string
          field_name?: string | null
          function_name?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shared_category_templates: {
        Row: {
          categories: Json
          created_at: string
          created_by: string
          id: string
          is_public: boolean | null
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          categories?: Json
          created_at?: string
          created_by: string
          id?: string
          is_public?: boolean | null
          template_name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          categories?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_public?: boolean | null
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_scenario_links: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          preview_image_url: string | null
          scenario_data: Json
          scenario_name: string
          share_token: string
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          preview_image_url?: string | null
          scenario_data: Json
          scenario_name: string
          share_token: string
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          preview_image_url?: string | null
          scenario_data?: Json
          scenario_name?: string
          share_token?: string
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      slo_breaches: {
        Row: {
          breach_duration_seconds: number | null
          breach_type: string
          created_at: string | null
          current_value: number
          id: string
          metadata: Json | null
          metric_name: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          threshold_value: number
        }
        Insert: {
          breach_duration_seconds?: number | null
          breach_type: string
          created_at?: string | null
          current_value: number
          id?: string
          metadata?: Json | null
          metric_name: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          threshold_value: number
        }
        Update: {
          breach_duration_seconds?: number | null
          breach_type?: string
          created_at?: string | null
          current_value?: number
          id?: string
          metadata?: Json | null
          metric_name?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          threshold_value?: number
        }
        Relationships: []
      }
      smart_alerts: {
        Row: {
          action_taken: boolean | null
          alert_type: string
          created_at: string
          data: Json | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          read_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          action_taken?: boolean | null
          alert_type: string
          created_at?: string
          data?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          read_at?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          action_taken?: boolean | null
          alert_type?: string
          created_at?: string
          data?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          severity?: string
          title?: string
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
      spending_patterns: {
        Row: {
          average_amount: number | null
          category: string | null
          confidence_score: number | null
          created_at: string
          first_detected_at: string
          frequency: string | null
          id: string
          is_active: boolean | null
          last_occurrence_at: string | null
          merchant: string | null
          metadata: Json | null
          occurrence_count: number | null
          pattern_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          average_amount?: number | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          first_detected_at?: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_occurrence_at?: string | null
          merchant?: string | null
          metadata?: Json | null
          occurrence_count?: number | null
          pattern_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          average_amount?: number | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          first_detected_at?: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_occurrence_at?: string | null
          merchant?: string | null
          metadata?: Json | null
          occurrence_count?: number | null
          pattern_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spending_predictions: {
        Row: {
          budget_id: string | null
          category_code: string | null
          confidence_level: string | null
          created_at: string | null
          factors: Json | null
          id: string
          predicted_amount: number
          prediction_period: string
          user_id: string
          valid_until: string
        }
        Insert: {
          budget_id?: string | null
          category_code?: string | null
          confidence_level?: string | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          predicted_amount: number
          prediction_period: string
          user_id: string
          valid_until: string
        }
        Update: {
          budget_id?: string | null
          category_code?: string | null
          confidence_level?: string | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          predicted_amount?: number
          prediction_period?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "spending_predictions_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_events: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          notes: string | null
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          subscription_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "detected_subscriptions"
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
      subscription_reminders: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          id: string
          is_sent: boolean | null
          message: string | null
          reminder_date: string
          reminder_type: string | null
          sent_at: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_sent?: boolean | null
          message?: string | null
          reminder_date: string
          reminder_type?: string | null
          sent_at?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_sent?: boolean | null
          message?: string | null
          reminder_date?: string
          reminder_type?: string | null
          sent_at?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_reminders_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "card_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_usage_events: {
        Row: {
          amount: number | null
          created_at: string | null
          event_type: string
          id: string
          merchant: string
          subscription_id: string | null
          transaction_date: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          merchant: string
          subscription_id?: string | null
          transaction_date: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          merchant?: string
          subscription_id?: string | null
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "detected_subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      synthetic_paychecks: {
        Row: {
          business_profile_id: string | null
          calculated_paycheck: number
          calculation_method: string | null
          created_at: string | null
          id: string
          income_sources: Json | null
          net_paycheck: number
          notes: string | null
          period_end: string
          period_start: string
          status: string | null
          total_income: number
          user_id: string
          withholding_federal: number
          withholding_fica: number
          withholding_state: number
        }
        Insert: {
          business_profile_id?: string | null
          calculated_paycheck: number
          calculation_method?: string | null
          created_at?: string | null
          id?: string
          income_sources?: Json | null
          net_paycheck: number
          notes?: string | null
          period_end: string
          period_start: string
          status?: string | null
          total_income: number
          user_id: string
          withholding_federal: number
          withholding_fica: number
          withholding_state: number
        }
        Update: {
          business_profile_id?: string | null
          calculated_paycheck?: number
          calculation_method?: string | null
          created_at?: string | null
          id?: string
          income_sources?: Json | null
          net_paycheck?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          status?: string | null
          total_income?: number
          user_id?: string
          withholding_federal?: number
          withholding_fica?: number
          withholding_state?: number
        }
        Relationships: [
          {
            foreignKeyName: "synthetic_paychecks_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_deductions: {
        Row: {
          amount: number
          created_at: string | null
          deduction_type: string
          description: string | null
          document_ids: string[] | null
          id: string
          status: string | null
          tax_year: number
          transaction_ids: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          deduction_type: string
          description?: string | null
          document_ids?: string[] | null
          id?: string
          status?: string | null
          tax_year: number
          transaction_ids?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          deduction_type?: string
          description?: string | null
          document_ids?: string[] | null
          id?: string
          status?: string | null
          tax_year?: number
          transaction_ids?: string[] | null
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
          parsed_data: Json | null
          processing_status: string | null
          storage_path: string | null
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
          parsed_data?: Json | null
          processing_status?: string | null
          storage_path?: string | null
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
          parsed_data?: Json | null
          processing_status?: string | null
          storage_path?: string | null
          tax_year?: number
          user_id?: string
        }
        Relationships: []
      }
      tax_loss_harvest_opportunities: {
        Row: {
          created_at: string | null
          current_loss: number
          expires_at: string | null
          holding_id: string | null
          id: string
          potential_tax_savings: number
          replacement_symbol: string | null
          status: string | null
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_loss: number
          expires_at?: string | null
          holding_id?: string | null
          id?: string
          potential_tax_savings: number
          replacement_symbol?: string | null
          status?: string | null
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_loss?: number
          expires_at?: string | null
          holding_id?: string | null
          id?: string
          potential_tax_savings?: number
          replacement_symbol?: string | null
          status?: string | null
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_loss_harvest_opportunities_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "portfolio_holdings"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_execution_logs: {
        Row: {
          conversation_id: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_params: Json | null
          output_data: Json | null
          success: boolean
          tool_name: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_params?: Json | null
          output_data?: Json | null
          success?: boolean
          tool_name: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_params?: Json | null
          output_data?: Json | null
          success?: boolean
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_execution_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_emotions: {
        Row: {
          confidence_score: number | null
          detected_at: string | null
          detected_emotion: string
          id: string
          intervention_shown: boolean | null
          triggers: Json | null
          user_action: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          detected_at?: string | null
          detected_emotion: string
          id?: string
          intervention_shown?: boolean | null
          triggers?: Json | null
          user_action?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          detected_at?: string | null
          detected_emotion?: string
          id?: string
          intervention_shown?: boolean | null
          triggers?: Json | null
          user_action?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transaction_alert_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          status: string | null
          transaction_data: Json
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          transaction_data: Json
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          transaction_data?: Json
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_alert_queue_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_filter_presets: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json
          id?: string
          name: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_insights: {
        Row: {
          acted_on_at: string | null
          created_at: string
          data: Json
          description: string
          dismissed_at: string | null
          id: string
          insight_type: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acted_on_at?: string | null
          created_at?: string
          data?: Json
          description: string
          dismissed_at?: string | null
          id?: string
          insight_type: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acted_on_at?: string | null
          created_at?: string
          data?: Json
          description?: string
          dismissed_at?: string | null
          id?: string
          insight_type?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_search_history: {
        Row: {
          id: string
          parsed_filters: Json
          query: string
          searched_at: string
          user_id: string
        }
        Insert: {
          id?: string
          parsed_filters: Json
          query: string
          searched_at?: string
          user_id: string
        }
        Update: {
          id?: string
          parsed_filters?: Json
          query?: string
          searched_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_splits: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          notes: string | null
          parent_transaction_id: string
          payment_method: string | null
          payment_status: string | null
          split_amount: number
          split_name: string
          split_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          parent_transaction_id: string
          payment_method?: string | null
          payment_status?: string | null
          split_amount: number
          split_name: string
          split_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          parent_transaction_id?: string
          payment_method?: string | null
          payment_status?: string | null
          split_amount?: number
          split_name?: string
          split_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_splits_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_tag_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          tag_id: string
          transaction_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          tag_id: string
          transaction_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          tag_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tag_assignment_tag"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "transaction_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tag_assignment_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          tag_name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          tag_name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          tag_name?: string
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
          enrichment_metadata: Json | null
          id: string
          is_recurring: boolean | null
          merchant: string | null
          original_amount: number | null
          original_currency: string | null
          plaid_transaction_id: string | null
          recurring_frequency: string | null
          tags: string[] | null
          transaction_date: string
          transaction_type: string | null
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
          enrichment_metadata?: Json | null
          id?: string
          is_recurring?: boolean | null
          merchant?: string | null
          original_amount?: number | null
          original_currency?: string | null
          plaid_transaction_id?: string | null
          recurring_frequency?: string | null
          tags?: string[] | null
          transaction_date: string
          transaction_type?: string | null
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
          enrichment_metadata?: Json | null
          id?: string
          is_recurring?: boolean | null
          merchant?: string | null
          original_amount?: number | null
          original_currency?: string | null
          plaid_transaction_id?: string | null
          recurring_frequency?: string | null
          tags?: string[] | null
          transaction_date?: string
          transaction_type?: string | null
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
      twin_scenarios: {
        Row: {
          created_at: string | null
          id: string
          monte_carlo_runs: number | null
          parameters: Json
          projected_outcomes: Json | null
          scenario_name: string | null
          scenario_type: string
          success_probability: number | null
          twin_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          monte_carlo_runs?: number | null
          parameters?: Json
          projected_outcomes?: Json | null
          scenario_name?: string | null
          scenario_type: string
          success_probability?: number | null
          twin_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          monte_carlo_runs?: number | null
          parameters?: Json
          projected_outcomes?: Json | null
          scenario_name?: string | null
          scenario_type?: string
          success_probability?: number | null
          twin_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twin_scenarios_twin_id_fkey"
            columns: ["twin_id"]
            isOneToOne: false
            referencedRelation: "digital_twin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      twin_sessions: {
        Row: {
          created_at: string | null
          decisions: Json[] | null
          final_state: Json | null
          id: string
          session_name: string | null
          twin_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          decisions?: Json[] | null
          final_state?: Json | null
          id?: string
          session_name?: string | null
          twin_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          decisions?: Json[] | null
          final_state?: Json | null
          id?: string
          session_name?: string | null
          twin_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twin_sessions_twin_id_fkey"
            columns: ["twin_id"]
            isOneToOne: false
            referencedRelation: "digital_twin_profiles"
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
      user_behavior_patterns: {
        Row: {
          confidence_score: number | null
          first_detected_at: string | null
          id: string
          last_updated_at: string | null
          pattern_data: Json
          pattern_type: string
          sample_size: number | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          first_detected_at?: string | null
          id?: string
          last_updated_at?: string | null
          pattern_data?: Json
          pattern_type: string
          sample_size?: number | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          first_detected_at?: string | null
          id?: string
          last_updated_at?: string | null
          pattern_data?: Json
          pattern_type?: string
          sample_size?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_benchmark_preferences: {
        Row: {
          age_range: string | null
          created_at: string
          id: string
          income_bracket: string | null
          opted_in: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          id?: string
          income_bracket?: string | null
          opted_in?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          created_at?: string
          id?: string
          income_bracket?: string | null
          opted_in?: boolean
          updated_at?: string
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
          currency: string | null
          id: string
          is_active: boolean | null
          last_rebalanced_at: string | null
          name: string
          period: string
          total_limit: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_limits?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          last_rebalanced_at?: string | null
          name: string
          period: string
          total_limit: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_limits?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          last_rebalanced_at?: string | null
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
      user_consents: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          consent_text: string
          consent_type: string
          consent_version: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted: boolean
          accepted_at?: string | null
          consent_text: string
          consent_type: string
          consent_version: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          consent_text?: string
          consent_type?: string
          consent_version?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_geo_rewards: {
        Row: {
          id: string
          partner_id: string
          points_earned: number | null
          transaction_date: string | null
          user_id: string
        }
        Insert: {
          id?: string
          partner_id: string
          points_earned?: number | null
          transaction_date?: string | null
          user_id: string
        }
        Update: {
          id?: string
          partner_id?: string
          points_earned?: number | null
          transaction_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_geo_rewards_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "geo_reward_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lockdown_status: {
        Row: {
          activated_at: string | null
          created_at: string | null
          deactivated_at: string | null
          id: string
          is_active: boolean | null
          reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_login_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_authorized: boolean | null
          is_current: boolean | null
          last_active_at: string | null
          latitude: number | null
          longitude: number | null
          os: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_authorized?: boolean | null
          is_current?: boolean | null
          last_active_at?: string | null
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_authorized?: boolean | null
          is_current?: boolean | null
          last_active_at?: string | null
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          session_token?: string
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
      user_preferences: {
        Row: {
          accent_color: string | null
          ai_model_preferences: Json | null
          created_at: string | null
          dashboard_card_order: string[] | null
          id: string
          last_security_check: string | null
          natural_language_rules: Json | null
          portfolio_allocation_target: Json | null
          security_score: number | null
          security_settings: Json | null
          spending_persona: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          ai_model_preferences?: Json | null
          created_at?: string | null
          dashboard_card_order?: string[] | null
          id?: string
          last_security_check?: string | null
          natural_language_rules?: Json | null
          portfolio_allocation_target?: Json | null
          security_score?: number | null
          security_settings?: Json | null
          spending_persona?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accent_color?: string | null
          ai_model_preferences?: Json | null
          created_at?: string | null
          dashboard_card_order?: string[] | null
          id?: string
          last_security_check?: string | null
          natural_language_rules?: Json | null
          portfolio_allocation_target?: Json | null
          security_score?: number | null
          security_settings?: Json | null
          spending_persona?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_questline_progress: {
        Row: {
          completed_at: string | null
          current_step: number | null
          id: string
          questline_id: string
          started_at: string | null
          steps_completed: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number | null
          id?: string
          questline_id: string
          started_at?: string | null
          steps_completed?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number | null
          id?: string
          questline_id?: string
          started_at?: string | null
          steps_completed?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_questline_progress_questline_id_fkey"
            columns: ["questline_id"]
            isOneToOne: false
            referencedRelation: "financial_questlines"
            referencedColumns: ["id"]
          },
        ]
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
      voice_sessions: {
        Row: {
          conversation_id: string | null
          id: string
          metadata: Json | null
          session_end: string | null
          session_start: string | null
          total_duration_ms: number | null
          turns_count: number | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          metadata?: Json | null
          session_end?: string | null
          session_start?: string | null
          total_duration_ms?: number | null
          turns_count?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          id?: string
          metadata?: Json | null
          session_end?: string | null
          session_start?: string | null
          total_duration_ms?: number | null
          turns_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_allowances: {
        Row: {
          agent_id: string
          allowed_tokens: string[]
          created_at: string
          daily_limit: number
          daily_spent: number
          id: string
          is_active: boolean
          last_reset_date: string
          max_amount_per_tx: number
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          agent_id: string
          allowed_tokens?: string[]
          created_at?: string
          daily_limit?: number
          daily_spent?: number
          id?: string
          is_active?: boolean
          last_reset_date?: string
          max_amount_per_tx?: number
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          agent_id?: string
          allowed_tokens?: string[]
          created_at?: string
          daily_limit?: number
          daily_spent?: number
          id?: string
          is_active?: boolean
          last_reset_date?: string
          max_amount_per_tx?: number
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_allowances_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "autonomous_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_allowances_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_backup_audit_log: {
        Row: {
          action: string
          backup_id: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          backup_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          backup_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_backup_audit_log_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "wallet_backups"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_backups: {
        Row: {
          backup_type: string
          created_at: string
          encrypted_seed_phrase: string
          encryption_hint: string | null
          id: string
          last_accessed_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          backup_type?: string
          created_at?: string
          encrypted_seed_phrase: string
          encryption_hint?: string | null
          id?: string
          last_accessed_at?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          backup_type?: string
          created_at?: string
          encrypted_seed_phrase?: string
          encryption_hint?: string | null
          id?: string
          last_accessed_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_backups_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: true
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_balance_history: {
        Row: {
          created_at: string | null
          id: string
          recorded_at: string
          token_breakdown: Json
          total_balance_usd: number
          user_id: string
          wallet_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recorded_at?: string
          token_breakdown?: Json
          total_balance_usd: number
          user_id: string
          wallet_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recorded_at?: string
          token_breakdown?: Json
          total_balance_usd?: number
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_balance_history_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_chain_configs: {
        Row: {
          chain_id: string
          chain_name: string
          created_at: string | null
          explorer_url: string
          icon: string | null
          id: string
          is_active: boolean | null
          native_currency: Json
          rpc_url: string
        }
        Insert: {
          chain_id: string
          chain_name: string
          created_at?: string | null
          explorer_url: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          native_currency: Json
          rpc_url: string
        }
        Update: {
          chain_id?: string
          chain_name?: string
          created_at?: string | null
          explorer_url?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          native_currency?: Json
          rpc_url?: string
        }
        Relationships: []
      }
      wallet_contacts: {
        Row: {
          address: string
          chain: string
          created_at: string
          id: string
          last_transaction_at: string | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          chain?: string
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          chain?: string
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_gas_alerts: {
        Row: {
          chain_id: string
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          threshold_gwei: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chain_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          threshold_gwei: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          threshold_gwei?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          priority: string | null
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: string | null
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: string | null
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_push_subscriptions: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          subscription_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          subscription_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          subscription_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_settings: {
        Row: {
          created_at: string
          display_currency: string
          hide_balance: boolean
          hide_transaction_amounts: boolean
          id: string
          show_transaction_history: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_currency?: string
          hide_balance?: boolean
          hide_transaction_amounts?: boolean
          id?: string
          show_transaction_history?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_currency?: string
          hide_balance?: boolean
          hide_transaction_amounts?: boolean
          id?: string
          show_transaction_history?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_tokens: {
        Row: {
          chain: string
          contract_address: string | null
          created_at: string
          decimals: number
          id: string
          is_active: boolean
          is_native: boolean
          logo_url: string | null
          name: string
          symbol: string
        }
        Insert: {
          chain?: string
          contract_address?: string | null
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          is_native?: boolean
          logo_url?: string | null
          name: string
          symbol: string
        }
        Update: {
          chain?: string
          contract_address?: string | null
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          is_native?: boolean
          logo_url?: string | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          block_number: number | null
          chain: string | null
          created_at: string
          from_address: string
          gas_price: number | null
          gas_used: number | null
          hash: string
          id: string
          metadata: Json | null
          nonce: number | null
          status: string
          to_address: string
          token_address: string | null
          token_symbol: string
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          block_number?: number | null
          chain?: string | null
          created_at?: string
          from_address: string
          gas_price?: number | null
          gas_used?: number | null
          hash: string
          id?: string
          metadata?: Json | null
          nonce?: number | null
          status?: string
          to_address: string
          token_address?: string | null
          token_symbol?: string
          transaction_type?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          block_number?: number | null
          chain?: string | null
          created_at?: string
          from_address?: string
          gas_price?: number | null
          gas_used?: number | null
          hash?: string
          id?: string
          metadata?: Json | null
          nonce?: number | null
          status?: string
          to_address?: string
          token_address?: string | null
          token_symbol?: string
          transaction_type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          address: string
          chain: string
          created_at: string
          encrypted_key_share: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          chain?: string
          created_at?: string
          encrypted_key_share?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          chain?: string
          created_at?: string
          encrypted_key_share?: string | null
          id?: string
          updated_at?: string
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
      weekly_insights: {
        Row: {
          budget_adherence_score: number | null
          created_at: string | null
          id: string
          insights: Json | null
          sent_at: string | null
          top_category: string | null
          total_saved: number | null
          total_spent: number | null
          user_id: string
          viewed_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          budget_adherence_score?: number | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          sent_at?: string | null
          top_category?: string | null
          total_saved?: number | null
          total_spent?: number | null
          user_id: string
          viewed_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          budget_adherence_score?: number | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          sent_at?: string | null
          top_category?: string | null
          total_saved?: number | null
          total_spent?: number | null
          user_id?: string
          viewed_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      yield_strategies: {
        Row: {
          auto_execute: boolean | null
          constraints: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_allocation_percent: number | null
          performance_tracking: Json | null
          rebalance_threshold: number | null
          risk_level: string
          strategy_name: string
          strategy_type: string
          target_apy_min: number
          target_protocols: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_execute?: boolean | null
          constraints?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_allocation_percent?: number | null
          performance_tracking?: Json | null
          rebalance_threshold?: number | null
          risk_level?: string
          strategy_name: string
          strategy_type: string
          target_apy_min: number
          target_protocols: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_execute?: boolean | null
          constraints?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_allocation_percent?: number | null
          performance_tracking?: Json | null
          rebalance_threshold?: number | null
          risk_level?: string
          strategy_name?: string
          strategy_type?: string
          target_apy_min?: number
          target_protocols?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      achievement_leaderboard: {
        Row: {
          avatar_url: string | null
          current_streak: number | null
          full_name: string | null
          rank: number | null
          total_achievements: number | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: []
      }
      script_variant_performance: {
        Row: {
          avg_rating: number | null
          avg_savings: number | null
          last_used: string | null
          merchant: string | null
          outcome_count: number | null
          selected_variant: string | null
          selection_count: number | null
          success_rate: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_financial_health_score: {
        Args: { p_user_id: string }
        Returns: {
          credit_component: number
          debt_component: number
          emergency_fund_component: number
          goals_component: number
          investment_component: number
          overall_score: number
          recommendations: Json
          savings_component: number
        }[]
      }
      calculate_health_trend: { Args: { p_user_id: string }; Returns: number }
      calculate_next_billing_dates: {
        Args: { billing_day: number; from_date?: string }
        Returns: {
          next_due: string
          next_statement: string
        }[]
      }
      clean_expired_insights_cache: { Args: never; Returns: undefined }
      cleanup_expired_ip_blocks: { Args: never; Returns: undefined }
      cleanup_expired_news_cache: { Args: never; Returns: undefined }
      cleanup_expired_nudges: { Args: never; Returns: undefined }
      cleanup_expired_webauthn_challenges: { Args: never; Returns: undefined }
      cleanup_old_analytics_events: { Args: never; Returns: undefined }
      cleanup_old_financial_health_history: { Args: never; Returns: undefined }
      cleanup_old_monitoring_data: { Args: never; Returns: undefined }
      cleanup_old_page_views: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_old_security_logs: { Args: never; Returns: undefined }
      compute_user_features: { Args: { sub_amount: number }; Returns: Json }
      contribute_to_goal: {
        Args: {
          p_amount: number
          p_goal_id: string
          p_note: string
          p_user_id: string
        }
        Returns: {
          is_completed: boolean
          new_amount: number
        }[]
      }
      get_active_nudges: {
        Args: { p_user_id: string }
        Returns: {
          action_url: string
          agent_type: string
          created_at: string
          id: string
          message: string
          nudge_type: string
          priority: number
        }[]
      }
      get_cached_response: { Args: { p_cache_key: string }; Returns: Json }
      grant_freeze_day_reward: {
        Args: { p_freeze_days: number; p_user_id: string }
        Returns: undefined
      }
      has_role:
        | { Args: { role_name: string; user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      increment_redirect_usage: {
        Args: { redirect_id: string }
        Returns: undefined
      }
      is_ip_blocked: { Args: { ip: string }; Returns: boolean }
      reset_daily_wallet_allowances: { Args: never; Returns: undefined }
      reset_inactive_streaks: { Args: never; Returns: undefined }
      set_cached_response: {
        Args: {
          p_cache_key: string
          p_cache_type: string
          p_response_data: Json
          p_ttl_seconds?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_groq_circuit_state: {
        Args: { p_state: string }
        Returns: undefined
      }
      update_groq_quota_state: {
        Args: {
          p_latency_ms: number
          p_requests_limit: number
          p_requests_remaining: number
          p_requests_reset: string
          p_success: boolean
          p_tokens_limit: number
          p_tokens_remaining: number
          p_tokens_reset: string
        }
        Returns: {
          avg_latency_ms: number | null
          circuit_opened_at: string | null
          circuit_state: string | null
          consecutive_failures: number | null
          created_at: string | null
          id: string
          last_request_at: string | null
          latency_samples: number | null
          p95_latency_ms: number | null
          requests_limit_rpd: number | null
          requests_remaining_rpd: number | null
          requests_reset_at: string | null
          tokens_limit_tpm: number | null
          tokens_remaining_tpm: number | null
          tokens_reset_at: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "groq_quota_state"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_platform_stats: { Args: never; Returns: undefined }
      user_family_group_ids: {
        Args: { user_uuid: string }
        Returns: {
          family_group_id: string
        }[]
      }
      user_is_org_owner_or_admin: {
        Args: { org_uuid: string; user_uuid: string }
        Returns: boolean
      }
      user_organization_ids: {
        Args: { user_uuid: string }
        Returns: {
          organization_id: string
        }[]
      }
    }
    Enums: {
      achievement_category:
        | "savings_mastery"
        | "goal_achiever"
        | "streak_champion"
        | "financial_wellness"
        | "automation_expert"
        | "community_champion"
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
      achievement_category: [
        "savings_mastery",
        "goal_achiever",
        "streak_champion",
        "financial_wellness",
        "automation_expert",
        "community_champion",
      ],
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

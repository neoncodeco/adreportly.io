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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_accounts: {
        Row: {
          agency_id: string
          created_at: string
          currency: string | null
          fb_account_id: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          name: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          currency?: string | null
          fb_account_id: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          name: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          currency?: string | null
          fb_account_id?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          agency_id: string
          created_at: string
          email: string
          id: string
          last_login_at: string | null
          name: string
          organization: string | null
          status: Database["public"]["Enums"]["client_status"]
        }
        Insert: {
          agency_id: string
          created_at?: string
          email: string
          id?: string
          last_login_at?: string | null
          name: string
          organization?: string | null
          status?: Database["public"]["Enums"]["client_status"]
        }
        Update: {
          agency_id?: string
          created_at?: string
          email?: string
          id?: string
          last_login_at?: string | null
          name?: string
          organization?: string | null
          status?: Database["public"]["Enums"]["client_status"]
        }
        Relationships: []
      }
      fb_tokens: {
        Row: {
          agency_id: string
          auth_tag: string
          created_at: string
          encrypted_token: string
          expires_at: string | null
          fb_user_id: string | null
          iv: string
          scope: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          auth_tag: string
          created_at?: string
          encrypted_token: string
          expires_at?: string | null
          fb_user_id?: string | null
          iv: string
          scope?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          auth_tag?: string
          created_at?: string
          encrypted_token?: string
          expires_at?: string | null
          fb_user_id?: string | null
          iv?: string
          scope?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          fb_user_id: string | null
          full_name: string | null
          id: string
          organization: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          fb_user_id?: string | null
          full_name?: string | null
          id: string
          organization?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          fb_user_id?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shared_links: {
        Row: {
          agency_id: string
          campaign_id: string
          campaign_name: string | null
          client_email: string | null
          client_id: string | null
          created_at: string
          date_from: string | null
          date_to: string | null
          expires_at: string
          id: string
          report_name: string | null
          unique_token: string
          view_count: number
        }
        Insert: {
          agency_id: string
          campaign_id: string
          campaign_name?: string | null
          client_email?: string | null
          client_id?: string | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          expires_at: string
          id?: string
          report_name?: string | null
          unique_token?: string
          view_count?: number
        }
        Update: {
          agency_id?: string
          campaign_id?: string
          campaign_name?: string | null
          client_email?: string | null
          client_id?: string | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          expires_at?: string
          id?: string
          report_name?: string | null
          unique_token?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          agency_id: string
          created_at: string
          current_period_end: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          current_period_end?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          current_period_end?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agency_owner"
      client_status: "active" | "paused" | "archived"
      subscription_plan: "free" | "pro" | "enterprise"
      subscription_status: "active" | "past_due" | "canceled" | "trialing"
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
      app_role: ["admin", "agency_owner"],
      client_status: ["active", "paused", "archived"],
      subscription_plan: ["free", "pro", "enterprise"],
      subscription_status: ["active", "past_due", "canceled", "trialing"],
    },
  },
} as const

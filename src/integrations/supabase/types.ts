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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_pinned: boolean
          link_url: string | null
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_pinned?: boolean
          link_url?: string | null
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_pinned?: boolean
          link_url?: string | null
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          metadata: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      collection_adjustments: {
        Row: {
          adjusted_kg: number
          adjusted_points: number
          admin_id: string
          collection_id: string
          created_at: string
          delta_kg: number | null
          delta_points: number | null
          id: string
          original_kg: number
          original_points: number
          reason: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          adjusted_kg: number
          adjusted_points: number
          admin_id: string
          collection_id: string
          created_at?: string
          delta_kg?: number | null
          delta_points?: number | null
          id?: string
          original_kg: number
          original_points: number
          reason: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          adjusted_kg?: number
          adjusted_points?: number
          admin_id?: string
          collection_id?: string
          created_at?: string
          delta_kg?: number | null
          delta_points?: number | null
          id?: string
          original_kg?: number
          original_points?: number
          reason?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_adjustments_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          id: string
          location: string | null
          notes: string | null
          photo_url: string | null
          plastic_type: string
          points_earned: number
          status: string
          updated_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          photo_url?: string | null
          plastic_type?: string
          points_earned: number
          status?: string
          updated_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          photo_url?: string | null
          plastic_type?: string
          points_earned?: number
          status?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      fraud_flags: {
        Row: {
          created_at: string
          description: string
          flag_type: string
          id: string
          is_resolved: boolean
          related_adjustment_id: string | null
          related_collection_id: string | null
          related_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          created_at?: string
          description: string
          flag_type: string
          id?: string
          is_resolved?: boolean
          related_adjustment_id?: string | null
          related_collection_id?: string | null
          related_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Update: {
          created_at?: string
          description?: string
          flag_type?: string
          id?: string
          is_resolved?: boolean
          related_adjustment_id?: string | null
          related_collection_id?: string | null
          related_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_flags_related_adjustment_id_fkey"
            columns: ["related_adjustment_id"]
            isOneToOne: false
            referencedRelation: "collection_adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_flags_related_collection_id_fkey"
            columns: ["related_collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_transactions: {
        Row: {
          admin_id: string
          amount: number
          created_at: string
          description: string | null
          id: string
          type: string
        }
        Insert: {
          admin_id: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          type?: string
        }
        Update: {
          admin_id?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qr_transactions: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          location: string | null
          notes: string | null
          plastic_type: string
          points: number
          status: string
          transaction_code: string
          used_at: string | null
          used_by: string | null
          weight_kg: number
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          location?: string | null
          notes?: string | null
          plastic_type?: string
          points: number
          status?: string
          transaction_code?: string
          used_at?: string | null
          used_by?: string | null
          weight_kg: number
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          plastic_type?: string
          points?: number
          status?: string
          transaction_code?: string
          used_at?: string | null
          used_by?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          amount_kes: number
          created_at: string
          error_message: string | null
          id: string
          mpesa_transaction_id: string | null
          phone_number: string
          points_spent: number
          reward_category: string
          reward_title: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_kes: number
          created_at?: string
          error_message?: string | null
          id?: string
          mpesa_transaction_id?: string | null
          phone_number: string
          points_spent: number
          reward_category: string
          reward_title: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_kes?: number
          created_at?: string
          error_message?: string | null
          id?: string
          mpesa_transaction_id?: string | null
          phone_number?: string
          points_spent?: number
          reward_category?: string
          reward_title?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_pool: {
        Row: {
          balance: number
          id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          id?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stk_deposits: {
        Row: {
          admin_id: string
          amount: number
          checkout_request_id: string | null
          created_at: string
          error_message: string | null
          id: string
          mpesa_receipt: string | null
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          amount: number
          checkout_request_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          mpesa_receipt?: string | null
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          amount?: number
          checkout_request_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          mpesa_receipt?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
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
      deduct_reward_pool: {
        Args: { p_amount: number; p_description: string }
        Returns: boolean
      }
      fund_reward_pool: {
        Args: { p_admin_id: string; p_amount: number; p_description: string }
        Returns: number
      }
      get_admin_stats: {
        Args: never
        Returns: {
          active_announcements: number
          successful_redemptions: number
          total_collections: number
          total_kg_collected: number
          total_points_balance: number
          total_points_earned: number
          total_redemptions: number
          total_users: number
        }[]
      }
      get_collections_with_adjustments: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          adjusted_kg: number
          adjusted_points: number
          adjustment_reason: string
          adjustment_status: string
          created_at: string
          final_kg: number
          final_points: number
          has_adjustment: boolean
          id: string
          location: string
          original_kg: number
          original_points: number
          photo_url: string
          plastic_type: string
          status: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

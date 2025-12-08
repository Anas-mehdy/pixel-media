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
      bot_settings: {
        Row: {
          ai_personality: string | null
          bot_active: boolean | null
          business_hours_end: string | null
          business_hours_start: string | null
          client_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          ai_personality?: string | null
          bot_active?: boolean | null
          business_hours_end?: string | null
          business_hours_start?: string | null
          client_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          ai_personality?: string | null
          bot_active?: boolean | null
          business_hours_end?: string | null
          business_hours_start?: string | null
          client_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          fts: unknown
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          fts?: unknown
          id?: never
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          fts?: unknown
          id?: never
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_pixelmedia: {
        Row: {
          content: string | null
          embedding: string | null
          fts: unknown
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          fts?: unknown
          id?: never
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          fts?: unknown
          id?: never
          metadata?: Json | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          ai_summary: string | null
          client_id: string | null
          created_at: string
          id: string
          last_contact_at: string | null
          name: string | null
          notes: string | null
          phone: string
          status: string | null
        }
        Insert: {
          ai_summary?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_contact_at?: string | null
          name?: string | null
          notes?: string | null
          phone: string
          status?: string | null
        }
        Update: {
          ai_summary?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_contact_at?: string | null
          name?: string | null
          notes?: string | null
          phone?: string
          status?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          client_id: string | null
          contact_name: string | null
          contact_phone: string
          content: string | null
          created_at: string
          id: string
          is_from_bot: boolean | null
          message_type: string | null
        }
        Insert: {
          client_id?: string | null
          contact_name?: string | null
          contact_phone: string
          content?: string | null
          created_at?: string
          id?: string
          is_from_bot?: boolean | null
          message_type?: string | null
        }
        Update: {
          client_id?: string | null
          contact_name?: string | null
          contact_phone?: string
          content?: string | null
          created_at?: string
          id?: string
          is_from_bot?: boolean | null
          message_type?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client_id: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          last_updated: string | null
          product_details: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          last_updated?: string | null
          product_details?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          last_updated?: string | null
          product_details?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_phone_fkey"
            columns: ["customer_phone"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["phone"]
          },
        ]
      }
      products: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_id: string
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_client_id: { Args: never; Returns: string }
      hybrid_search: {
        Args: {
          full_text_weight?: number
          match_count: number
          query_embedding: string
          query_text: string
          rrf_k?: number
          semantic_weight?: number
        }
        Returns: {
          content: string | null
          embedding: string | null
          fts: unknown
          id: number
          metadata: Json | null
        }[]
        SetofOptions: {
          from: "*"
          to: "documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      match_documents: {
        Args: { filter: Json; match_count: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

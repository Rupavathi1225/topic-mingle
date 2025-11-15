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
      analytics_blog_clicks: {
        Row: {
          blog_id: string | null
          clicked_at: string | null
          id: string
          session_id: string
        }
        Insert: {
          blog_id?: string | null
          clicked_at?: string | null
          id?: string
          session_id: string
        }
        Update: {
          blog_id?: string | null
          clicked_at?: string | null
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_blog_clicks_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_page_views: {
        Row: {
          id: string
          page_id: string | null
          page_type: string
          session_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          page_id?: string | null
          page_type: string
          session_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          page_id?: string | null
          page_type?: string
          session_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      analytics_related_search_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          related_search_id: string | null
          session_id: string
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          related_search_id?: string | null
          session_id: string
        }
        Update: {
          clicked_at?: string | null
          id?: string
          related_search_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_related_search_clicks_related_search_id_fkey"
            columns: ["related_search_id"]
            isOneToOne: false
            referencedRelation: "related_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_sessions: {
        Row: {
          country: string | null
          created_at: string | null
          device: string | null
          id: string
          ip_address: string | null
          session_id: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          session_id: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      analytics_visit_now_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          related_search_id: string | null
          session_id: string
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          related_search_id?: string | null
          session_id: string
        }
        Update: {
          clicked_at?: string | null
          id?: string
          related_search_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_visit_now_clicks_related_search_id_fkey"
            columns: ["related_search_id"]
            isOneToOne: false
            referencedRelation: "related_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author: string
          category_id: number | null
          content: string
          created_at: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          serial_number: number | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          category_id?: number | null
          content: string
          created_at?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          serial_number?: number | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          category_id?: number | null
          content?: string
          created_at?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          serial_number?: number | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          code_range_end: number
          code_range_start: number
          created_at: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          code_range_end: number
          code_range_start: number
          created_at?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          code_range_end?: number
          code_range_start?: number
          created_at?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      pre_landing_pages: {
        Row: {
          background_color: string | null
          background_image_url: string | null
          created_at: string | null
          cta_text: string | null
          description: string | null
          email_placeholder: string | null
          headline: string | null
          id: string
          logo_url: string | null
          main_image_url: string | null
          related_search_id: string | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          background_image_url?: string | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          email_placeholder?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          main_image_url?: string | null
          related_search_id?: string | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          background_image_url?: string | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          email_placeholder?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          main_image_url?: string | null
          related_search_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_landing_pages_related_search_id_fkey"
            columns: ["related_search_id"]
            isOneToOne: true
            referencedRelation: "related_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      related_searches: {
        Row: {
          blog_id: string | null
          created_at: string | null
          id: string
          order_number: number | null
          search_text: string
          target_url: string
        }
        Insert: {
          blog_id?: string | null
          created_at?: string | null
          id?: string
          order_number?: number | null
          search_text: string
          target_url: string
        }
        Update: {
          blog_id?: string | null
          created_at?: string | null
          id?: string
          order_number?: number | null
          search_text?: string
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "related_searches_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

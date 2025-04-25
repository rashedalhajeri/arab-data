export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advertisement_features: {
        Row: {
          advertisement_id: string
          category: string | null
          created_at: string
          feature: string
          id: string
        }
        Insert: {
          advertisement_id: string
          category?: string | null
          created_at?: string
          feature: string
          id?: string
        }
        Update: {
          advertisement_id?: string
          category?: string | null
          created_at?: string
          feature?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_features_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisement_images: {
        Row: {
          advertisement_id: string
          alt_text: string | null
          created_at: string
          height: number | null
          id: string
          image_url: string
          is_main: boolean | null
          order: number | null
          size_in_bytes: number | null
          storage_path: string | null
          width: number | null
        }
        Insert: {
          advertisement_id: string
          alt_text?: string | null
          created_at?: string
          height?: number | null
          id?: string
          image_url: string
          is_main?: boolean | null
          order?: number | null
          size_in_bytes?: number | null
          storage_path?: string | null
          width?: number | null
        }
        Update: {
          advertisement_id?: string
          alt_text?: string | null
          created_at?: string
          height?: number | null
          id?: string
          image_url?: string
          is_main?: boolean | null
          order?: number | null
          size_in_bytes?: number | null
          storage_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_images_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisement_pricing_options: {
        Row: {
          advertisement_id: string
          created_at: string
          id: string
          is_default: boolean | null
          period: string
          price: string
        }
        Insert: {
          advertisement_id: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          period: string
          price: string
        }
        Update: {
          advertisement_id?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          period?: string
          price?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_pricing_options_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          ad_type: string
          area: string | null
          body_type: string | null
          category_id: string | null
          category_type: string
          color: string | null
          condition: string | null
          created_at: string
          deposit: string | null
          description: string | null
          display_period: string | null
          engine_size: string | null
          fuel_type: string | null
          gear_type: string | null
          has_monthly_payment: boolean | null
          id: string
          import: string | null
          interior_color: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          kilometers: string | null
          km_limit: string | null
          manufacturer: string | null
          model: string | null
          monthly_payment: string | null
          negotiable: boolean | null
          office_id: string | null
          price: string | null
          property_type: string | null
          rent_period: string | null
          search_vector: unknown | null
          show_features: boolean | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
          year: string | null
        }
        Insert: {
          ad_type: string
          area?: string | null
          body_type?: string | null
          category_id?: string | null
          category_type: string
          color?: string | null
          condition?: string | null
          created_at?: string
          deposit?: string | null
          description?: string | null
          display_period?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          gear_type?: string | null
          has_monthly_payment?: boolean | null
          id?: string
          import?: string | null
          interior_color?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          kilometers?: string | null
          km_limit?: string | null
          manufacturer?: string | null
          model?: string | null
          monthly_payment?: string | null
          negotiable?: boolean | null
          office_id?: string | null
          price?: string | null
          property_type?: string | null
          rent_period?: string | null
          search_vector?: unknown | null
          show_features?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
          year?: string | null
        }
        Update: {
          ad_type?: string
          area?: string | null
          body_type?: string | null
          category_id?: string | null
          category_type?: string
          color?: string | null
          condition?: string | null
          created_at?: string
          deposit?: string | null
          description?: string | null
          display_period?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          gear_type?: string | null
          has_monthly_payment?: boolean | null
          id?: string
          import?: string | null
          interior_color?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          kilometers?: string | null
          km_limit?: string | null
          manufacturer?: string | null
          model?: string | null
          monthly_payment?: string | null
          negotiable?: boolean | null
          office_id?: string | null
          price?: string | null
          property_type?: string | null
          rent_period?: string | null
          search_vector?: unknown | null
          show_features?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          office_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          office_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          office_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_office"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          country: string
          cover_url: string
          created_at: string
          currency: string | null
          currency_symbol: string | null
          id: string
          logo_url: string
          name: string
          phone: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country: string
          cover_url: string
          created_at?: string
          currency?: string | null
          currency_symbol?: string | null
          id?: string
          logo_url: string
          name: string
          phone: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          cover_url?: string
          created_at?: string
          currency?: string | null
          currency_symbol?: string | null
          id?: string
          logo_url?: string
          name?: string
          phone?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_office_by_slug: {
        Args: { slug_param: string }
        Returns: {
          id: string
          user_id: string
          name: string
          slug: string
          country: string
          phone: string
          logo_url: string
          cover_url: string
          created_at: string
          updated_at: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

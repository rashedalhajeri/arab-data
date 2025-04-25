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
          created_at: string | null
          feature: string
          id: string
        }
        Insert: {
          advertisement_id: string
          created_at?: string | null
          feature: string
          id?: string
        }
        Update: {
          advertisement_id?: string
          created_at?: string | null
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
          created_at: string | null
          height: number | null
          id: string
          image_url: string
          is_main: boolean | null
          order_num: number
          storage_path: string
          width: number | null
        }
        Insert: {
          advertisement_id: string
          created_at?: string | null
          height?: number | null
          id?: string
          image_url: string
          is_main?: boolean | null
          order_num: number
          storage_path: string
          width?: number | null
        }
        Update: {
          advertisement_id?: string
          created_at?: string | null
          height?: number | null
          id?: string
          image_url?: string
          is_main?: boolean | null
          order_num?: number
          storage_path?: string
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
          created_at: string | null
          id: string
          period: string
          price: string
        }
        Insert: {
          advertisement_id: string
          created_at?: string | null
          id?: string
          period: string
          price: string
        }
        Update: {
          advertisement_id?: string
          created_at?: string | null
          id?: string
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
          contact_count: number | null
          created_at: string | null
          deposit: string | null
          description: string
          display_period: string | null
          engine_size: string | null
          featured: boolean | null
          fuel_type: string | null
          gear_type: string | null
          has_monthly_payment: boolean | null
          id: string
          import: string | null
          interior_color: string | null
          is_active: boolean | null
          kilometers: string | null
          km_limit: string | null
          manufacturer: string | null
          model: string | null
          monthly_payment: string | null
          negotiable: boolean | null
          office_id: string
          price: string | null
          property_type: string | null
          rent_period: string | null
          show_features: boolean | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
          views_count: number | null
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
          contact_count?: number | null
          created_at?: string | null
          deposit?: string | null
          description: string
          display_period?: string | null
          engine_size?: string | null
          featured?: boolean | null
          fuel_type?: string | null
          gear_type?: string | null
          has_monthly_payment?: boolean | null
          id?: string
          import?: string | null
          interior_color?: string | null
          is_active?: boolean | null
          kilometers?: string | null
          km_limit?: string | null
          manufacturer?: string | null
          model?: string | null
          monthly_payment?: string | null
          negotiable?: boolean | null
          office_id: string
          price?: string | null
          property_type?: string | null
          rent_period?: string | null
          show_features?: boolean | null
          status: string
          title: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
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
          contact_count?: number | null
          created_at?: string | null
          deposit?: string | null
          description?: string
          display_period?: string | null
          engine_size?: string | null
          featured?: boolean | null
          fuel_type?: string | null
          gear_type?: string | null
          has_monthly_payment?: boolean | null
          id?: string
          import?: string | null
          interior_color?: string | null
          is_active?: boolean | null
          kilometers?: string | null
          km_limit?: string | null
          manufacturer?: string | null
          model?: string | null
          monthly_payment?: string | null
          negotiable?: boolean | null
          office_id?: string
          price?: string | null
          property_type?: string | null
          rent_period?: string | null
          show_features?: boolean | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
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
          image_url: string | null
          is_active: boolean | null
          name: string
          office_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          office_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          office_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          advertisement_id: string
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          advertisement_id: string
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          advertisement_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          country: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          country: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          country?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      other_ads: {
        Row: {
          advertisement_id: string
          condition: string | null
          created_at: string | null
          id: string
          price: string
          user_category_id: string | null
        }
        Insert: {
          advertisement_id: string
          condition?: string | null
          created_at?: string | null
          id?: string
          price: string
          user_category_id?: string | null
        }
        Update: {
          advertisement_id?: string
          condition?: string | null
          created_at?: string | null
          id?: string
          price?: string
          user_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "other_ads_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "other_ads_user_category_id_fkey"
            columns: ["user_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          advertisement_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          advertisement_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          advertisement_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_advertisement_features: {
        Args: { ad_id: string }
        Returns: {
          advertisement_id: string
          created_at: string | null
          feature: string
          id: string
        }[]
      }
      get_advertisement_images: {
        Args: { ad_id: string }
        Returns: {
          advertisement_id: string
          created_at: string | null
          height: number | null
          id: string
          image_url: string
          is_main: boolean | null
          order_num: number
          storage_path: string
          width: number | null
        }[]
      }
      get_advertisement_pricing: {
        Args: { ad_id: string }
        Returns: {
          advertisement_id: string
          created_at: string | null
          id: string
          period: string
          price: string
        }[]
      }
      get_office_by_slug: {
        Args: { slug_param: string }
        Returns: {
          country: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          updated_at: string | null
          user_id: string
        }[]
      }
      increment_contact_count: {
        Args: { ad_id: string }
        Returns: undefined
      }
      increment_views_count: {
        Args: { ad_id: string }
        Returns: undefined
      }
      is_favorite: {
        Args: { ad_id: string; uid: string }
        Returns: boolean
      }
      search_advertisements: {
        Args: {
          category_type_param?: string
          ad_type_param?: string
          min_price?: string
          max_price?: string
          manufacturer_param?: string
          condition_param?: string
          year_from?: string
          year_to?: string
          category_id_param?: string
          featured_only?: boolean
          limit_param?: number
          offset_param?: number
        }
        Returns: {
          ad_type: string
          area: string | null
          body_type: string | null
          category_id: string | null
          category_type: string
          color: string | null
          condition: string | null
          contact_count: number | null
          created_at: string | null
          deposit: string | null
          description: string
          display_period: string | null
          engine_size: string | null
          featured: boolean | null
          fuel_type: string | null
          gear_type: string | null
          has_monthly_payment: boolean | null
          id: string
          import: string | null
          interior_color: string | null
          is_active: boolean | null
          kilometers: string | null
          km_limit: string | null
          manufacturer: string | null
          model: string | null
          monthly_payment: string | null
          negotiable: boolean | null
          office_id: string
          price: string | null
          property_type: string | null
          rent_period: string | null
          show_features: boolean | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
          views_count: number | null
          year: string | null
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

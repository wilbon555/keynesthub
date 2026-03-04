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
      agent_actions: {
        Row: {
          action_type: string
          agent_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          agent_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          agent_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      agent_applications: {
        Row: {
          country: string
          created_at: string
          email: string
          experience: string | null
          full_name: string
          hometown: string | null
          id: string
          phone: string
          price_range: string | null
          state: string | null
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          hometown?: string | null
          id?: string
          phone: string
          price_range?: string | null
          state?: string | null
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          hometown?: string | null
          id?: string
          phone?: string
          price_range?: string | null
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          agent_notes: string | null
          assigned_agent_id: string | null
          created_at: string
          id: string
          message: string | null
          processed_at: string | null
          property_id: string
          requester_email: string
          requester_name: string
          requester_phone: string | null
          status: string
        }
        Insert: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          processed_at?: string | null
          property_id: string
          requester_email: string
          requester_name: string
          requester_phone?: string | null
          status?: string
        }
        Update: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          processed_at?: string | null
          property_id?: string
          requester_email?: string
          requester_name?: string
          requester_phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          new_listings: boolean | null
          price_changes: boolean | null
          saved_search_matches: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_listings?: boolean | null
          price_changes?: boolean | null
          saved_search_matches?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_listings?: boolean | null
          price_changes?: boolean | null
          saved_search_matches?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_at: string
          id: string
          new_price: string
          old_price: string
          property_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          new_price: string
          old_price: string
          property_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          new_price?: string
          old_price?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          area: string
          bathrooms: number | null
          bedrooms: number | null
          building_age: number | null
          country: string | null
          created_at: string
          description: string | null
          developer: string | null
          featured: boolean | null
          floors: number | null
          id: string
          image: string | null
          images: string[] | null
          listing_type: string
          location: string
          maintenance_quality: string | null
          phone: string | null
          physical_inspection_done: boolean
          price: string
          region: string | null
          status: string | null
          taxes_paid_verified: boolean
          title: string
          title_deed_verified: boolean
          total_units: number | null
          type: string
          units: number | null
          updated_at: string
          user_id: string
          vacant_units: number | null
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          virtual_tour_type: string | null
          virtual_tour_url: string | null
        }
        Insert: {
          area: string
          bathrooms?: number | null
          bedrooms?: number | null
          building_age?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          featured?: boolean | null
          floors?: number | null
          id?: string
          image?: string | null
          images?: string[] | null
          listing_type?: string
          location: string
          maintenance_quality?: string | null
          phone?: string | null
          physical_inspection_done?: boolean
          price: string
          region?: string | null
          status?: string | null
          taxes_paid_verified?: boolean
          title: string
          title_deed_verified?: boolean
          total_units?: number | null
          type: string
          units?: number | null
          updated_at?: string
          user_id: string
          vacant_units?: number | null
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          virtual_tour_type?: string | null
          virtual_tour_url?: string | null
        }
        Update: {
          area?: string
          bathrooms?: number | null
          bedrooms?: number | null
          building_age?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          featured?: boolean | null
          floors?: number | null
          id?: string
          image?: string | null
          images?: string[] | null
          listing_type?: string
          location?: string
          maintenance_quality?: string | null
          phone?: string | null
          physical_inspection_done?: boolean
          price?: string
          region?: string | null
          status?: string | null
          taxes_paid_verified?: boolean
          title?: string
          title_deed_verified?: boolean
          total_units?: number | null
          type?: string
          units?: number | null
          updated_at?: string
          user_id?: string
          vacant_units?: number | null
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          virtual_tour_type?: string | null
          virtual_tour_url?: string | null
        }
        Relationships: []
      }
      property_views: {
        Row: {
          id: string
          property_id: string
          session_id: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          property_id: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          center_point: Json | null
          created_at: string
          filters: Json | null
          id: string
          name: string
          notifications_enabled: boolean | null
          polygon_coordinates: Json | null
          radius_km: number | null
          search_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          center_point?: Json | null
          created_at?: string
          filters?: Json | null
          id?: string
          name: string
          notifications_enabled?: boolean | null
          polygon_coordinates?: Json | null
          radius_km?: number | null
          search_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          center_point?: Json | null
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string
          notifications_enabled?: boolean | null
          polygon_coordinates?: Json | null
          radius_km?: number | null
          search_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          applied_at: string
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          applied_at?: string
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          applied_at?: string
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      viewings: {
        Row: {
          buyer_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          inquiry_id: string
          notes: string | null
          owner_id: string
          property_id: string
          scheduled_at: string
          scheduled_by: string
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          inquiry_id: string
          notes?: string | null
          owner_id: string
          property_id: string
          scheduled_at: string
          scheduled_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          inquiry_id?: string
          notes?: string | null
          owner_id?: string
          property_id?: string
          scheduled_at?: string
          scheduled_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewings_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "contact_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_vacant_units: { Args: { property_id: string }; Returns: number }
      get_property_view_stats: {
        Args: { owner_user_id: string }
        Returns: {
          property_id: string
          total_views: number
          views_this_month: number
          views_this_week: number
          views_today: number
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_vacant_units: { Args: { property_id: string }; Returns: number }
    }
    Enums: {
      app_role: "buyer" | "owner" | "agent" | "admin"
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
      app_role: ["buyer", "owner", "agent", "admin"],
    },
  },
} as const

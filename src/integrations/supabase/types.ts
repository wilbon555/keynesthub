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
          price: string
          region: string | null
          status: string | null
          title: string
          type: string
          units: number | null
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
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
          price: string
          region?: string | null
          status?: string | null
          title: string
          type: string
          units?: number | null
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
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
          price?: string
          region?: string | null
          status?: string | null
          title?: string
          type?: string
          units?: number | null
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
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

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
      agronomist_contacts: {
        Row: {
          contacted_at: string
          created_at: string
          farm_id: string
          id: string
          user_id: string
        }
        Insert: {
          contacted_at?: string
          created_at?: string
          farm_id: string
          id?: string
          user_id: string
        }
        Update: {
          contacted_at?: string
          created_at?: string
          farm_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          farm_id: string
          id: string
          is_read: boolean
          message: string
          priority: number | null
          severity: string
          type: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          farm_id: string
          id?: string
          is_read?: boolean
          message: string
          priority?: number | null
          severity: string
          type?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          farm_id?: string
          id?: string
          is_read?: boolean
          message?: string
          priority?: number | null
          severity?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_reports: {
        Row: {
          analyzed_at: string
          analyzed_media: string | null
          bounding_boxes: Json | null
          confidence_score: number | null
          created_at: string
          farm_id: string
          id: string
          image_url: string
          infestation_level: string | null
          media_type: string | null
          pest_types: Json | null
          scan_type: string
        }
        Insert: {
          analyzed_at?: string
          analyzed_media?: string | null
          bounding_boxes?: Json | null
          confidence_score?: number | null
          created_at?: string
          farm_id: string
          id?: string
          image_url: string
          infestation_level?: string | null
          media_type?: string | null
          pest_types?: Json | null
          scan_type: string
        }
        Update: {
          analyzed_at?: string
          analyzed_media?: string | null
          bounding_boxes?: Json | null
          confidence_score?: number | null
          created_at?: string
          farm_id?: string
          id?: string
          image_url?: string
          infestation_level?: string | null
          media_type?: string | null
          pest_types?: Json | null
          scan_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_reports_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          created_at: string
          farm_name: string
          farmer_id: string
          id: string
          location: string
          size_hectares: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_name: string
          farmer_id: string
          id?: string
          location: string
          size_hectares?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_name?: string
          farmer_id?: string
          id?: string
          location?: string
          size_hectares?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      market_price_submissions: {
        Row: {
          created_at: string
          crop_name: string
          id: string
          price_per_kg: number
          submitted_by: string
        }
        Insert: {
          created_at?: string
          crop_name: string
          id?: string
          price_per_kg: number
          submitted_by: string
        }
        Update: {
          created_at?: string
          crop_name?: string
          id?: string
          price_per_kg?: number
          submitted_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          farm_location: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          farm_location?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          farm_location?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      sensor_data: {
        Row: {
          farm_id: string
          humidity: number | null
          id: string
          light_intensity: number | null
          recorded_at: string
          soil_moisture: number | null
          temperature: number | null
        }
        Insert: {
          farm_id: string
          humidity?: number | null
          id?: string
          light_intensity?: number | null
          recorded_at?: string
          soil_moisture?: number | null
          temperature?: number | null
        }
        Update: {
          farm_id?: string
          humidity?: number | null
          id?: string
          light_intensity?: number | null
          recorded_at?: string
          soil_moisture?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_data_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "farmer" | "agronomist"
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
      app_role: ["farmer", "agronomist"],
    },
  },
} as const

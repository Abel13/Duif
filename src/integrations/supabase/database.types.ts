export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      correspondence_options: {
        Row: {
          active: boolean
          description_key: string
          id: string
          mock_key: string
          name_key: string
          sort_order: number
          type: Database["public"]["Enums"]["correspondence_type"]
        }
        Insert: {
          active?: boolean
          description_key: string
          id: string
          mock_key: string
          name_key: string
          sort_order?: number
          type: Database["public"]["Enums"]["correspondence_type"]
        }
        Update: {
          active?: boolean
          description_key?: string
          id?: string
          mock_key?: string
          name_key?: string
          sort_order?: number
          type?: Database["public"]["Enums"]["correspondence_type"]
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          animal_speed_kmh: number
          correspondence_option_id: string | null
          created_at: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          distance_km: number
          id: string
          mascot_id: string
          mock_key: string | null
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          outbound_arrival_at: string
          outbound_start_at: string
          receiver_profile_id: string
          return_arrival_at: string | null
          return_start_at: string | null
          reward_seed: string
          sender_profile_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at: string
        }
        Insert: {
          animal_speed_kmh: number
          correspondence_option_id?: string | null
          created_at?: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          distance_km: number
          id: string
          mascot_id: string
          mock_key?: string | null
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          outbound_arrival_at: string
          outbound_start_at: string
          receiver_profile_id: string
          return_arrival_at?: string | null
          return_start_at?: string | null
          reward_seed: string
          sender_profile_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Update: {
          animal_speed_kmh?: number
          correspondence_option_id?: string | null
          created_at?: string
          destination_label_key?: string
          destination_latitude?: number
          destination_longitude?: number
          distance_km?: number
          id?: string
          mascot_id?: string
          mock_key?: string | null
          origin_label_key?: string
          origin_latitude?: number
          origin_longitude?: number
          outbound_arrival_at?: string
          outbound_start_at?: string
          receiver_profile_id?: string
          return_arrival_at?: string | null
          return_start_at?: string | null
          reward_seed?: string
          sender_profile_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_correspondence_option_id_fkey"
            columns: ["correspondence_option_id"]
            isOneToOne: false
            referencedRelation: "correspondence_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_mascot_id_fkey"
            columns: ["mascot_id"]
            isOneToOne: false
            referencedRelation: "player_mascots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_receiver_profile_id_fkey"
            columns: ["receiver_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_rewards: {
        Row: {
          collected_at: string | null
          created_at: string
          delivery_id: string
          id: string
          mock_key: string | null
          reward_item_id: string
          xp_gained: number
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          delivery_id: string
          id: string
          mock_key?: string | null
          reward_item_id: string
          xp_gained: number
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          delivery_id?: string
          id?: string
          mock_key?: string | null
          reward_item_id?: string
          xp_gained?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_rewards_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: true
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_rewards_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_profile_id: string
          created_at: string
          exchange_count: number
          favorite_note_key: string | null
          friendship_level: number
          id: string
          mock_key: string | null
          requester_profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_profile_id: string
          created_at?: string
          exchange_count?: number
          favorite_note_key?: string | null
          friendship_level?: number
          id: string
          mock_key?: string | null
          requester_profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_profile_id?: string
          created_at?: string
          exchange_count?: number
          favorite_note_key?: string | null
          friendship_level?: number
          id?: string
          mock_key?: string | null
          requester_profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_profile_id_fkey"
            columns: ["addressee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_profile_id_fkey"
            columns: ["requester_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: Database["public"]["Enums"]["inventory_category"]
          collected_at: string
          created_at: string
          description_key: string
          equipped: boolean
          id: string
          mock_key: string | null
          name_key: string
          owner_profile_id: string
          rarity: Database["public"]["Enums"]["reward_rarity"]
          reward_item_id: string | null
          source_key: string | null
          thumbnail_asset_path: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["inventory_category"]
          collected_at?: string
          created_at?: string
          description_key: string
          equipped?: boolean
          id: string
          mock_key?: string | null
          name_key: string
          owner_profile_id: string
          rarity: Database["public"]["Enums"]["reward_rarity"]
          reward_item_id?: string | null
          source_key?: string | null
          thumbnail_asset_path?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["inventory_category"]
          collected_at?: string
          created_at?: string
          description_key?: string
          equipped?: boolean
          id?: string
          mock_key?: string | null
          name_key?: string
          owner_profile_id?: string
          rarity?: Database["public"]["Enums"]["reward_rarity"]
          reward_item_id?: string | null
          source_key?: string | null
          thumbnail_asset_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
        ]
      }
      mascot_templates: {
        Row: {
          appearance: Json
          attributes: Json
          base_level: number
          base_xp: number
          created_at: string
          equipment: Json
          id: string
          mock_key: string
          name: string
          next_level_xp: number
          skills: Json
          species_key: string
          trait: Json
        }
        Insert: {
          appearance: Json
          attributes: Json
          base_level?: number
          base_xp?: number
          created_at?: string
          equipment?: Json
          id: string
          mock_key: string
          name: string
          next_level_xp: number
          skills?: Json
          species_key: string
          trait: Json
        }
        Update: {
          appearance?: Json
          attributes?: Json
          base_level?: number
          base_xp?: number
          created_at?: string
          equipment?: Json
          id?: string
          mock_key?: string
          name?: string
          next_level_xp?: number
          skills?: Json
          species_key?: string
          trait?: Json
        }
        Relationships: []
      }
      player_mascots: {
        Row: {
          appearance: Json
          attributes: Json
          created_at: string
          equipment: Json
          id: string
          level: number
          mock_key: string | null
          name: string
          next_level_xp: number
          owner_profile_id: string
          skills: Json
          template_id: string
          trait: Json
          updated_at: string
          xp: number
        }
        Insert: {
          appearance: Json
          attributes: Json
          created_at?: string
          equipment?: Json
          id: string
          level: number
          mock_key?: string | null
          name: string
          next_level_xp: number
          owner_profile_id: string
          skills?: Json
          template_id: string
          trait: Json
          updated_at?: string
          xp?: number
        }
        Update: {
          appearance?: Json
          attributes?: Json
          created_at?: string
          equipment?: Json
          id?: string
          level?: number
          mock_key?: string | null
          name?: string
          next_level_xp?: number
          owner_profile_id?: string
          skills?: Json
          template_id?: string
          trait?: Json
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_mascots_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_mascots_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mascot_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          display_name: string
          home_label_key: string
          home_latitude: number
          home_longitude: number
          id: string
          mock_key: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          display_name: string
          home_label_key: string
          home_latitude: number
          home_longitude: number
          id: string
          mock_key?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          display_name?: string
          home_label_key?: string
          home_latitude?: number
          home_longitude?: number
          id?: string
          mock_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reward_items: {
        Row: {
          description_key: string
          id: string
          mock_key: string
          name_key: string
          rarity: Database["public"]["Enums"]["reward_rarity"]
          thumbnail_asset_path: string | null
        }
        Insert: {
          description_key: string
          id: string
          mock_key: string
          name_key: string
          rarity: Database["public"]["Enums"]["reward_rarity"]
          thumbnail_asset_path?: string | null
        }
        Update: {
          description_key?: string
          id?: string
          mock_key?: string
          name_key?: string
          rarity?: Database["public"]["Enums"]["reward_rarity"]
          thumbnail_asset_path?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      correspondence_type: "letter" | "postcard" | "sticker" | "smallGift"
      delivery_status:
        | "available"
        | "preparing"
        | "outbound"
        | "delivered"
        | "returning"
        | "returned"
        | "completed"
      inventory_category: "equipment" | "stamps" | "keepsakes" | "routeMarks"
      reward_rarity: "common" | "uncommon" | "rare"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      correspondence_type: ["letter", "postcard", "sticker", "smallGift"],
      delivery_status: [
        "available",
        "preparing",
        "outbound",
        "delivered",
        "returning",
        "returned",
        "completed",
      ],
      inventory_category: ["equipment", "stamps", "keepsakes", "routeMarks"],
      reward_rarity: ["common", "uncommon", "rare"],
    },
  },
} as const


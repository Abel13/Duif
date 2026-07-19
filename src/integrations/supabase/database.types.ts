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
      player_data_reset_audit: {
        Row: {
          backup_identifier: string
          deleted_counts: Json
          environment: string
          executed_at: string
          id: number
          operator_label: string
          project_ref: string
        }
        Insert: {
          backup_identifier: string
          deleted_counts: Json
          environment: string
          executed_at?: string
          id?: never
          operator_label: string
          project_ref: string
        }
        Update: {
          backup_identifier?: string
          deleted_counts?: Json
          environment?: string
          executed_at?: string
          id?: never
          operator_label?: string
          project_ref?: string
        }
        Relationships: []
      }
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
          route_discovery_version: number | null
          sender_profile_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          travel_modifiers: Json | null
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
          route_discovery_version?: number | null
          sender_profile_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          travel_modifiers?: Json | null
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
          route_discovery_version?: number | null
          sender_profile_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          travel_modifiers?: Json | null
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
      delivery_correspondence_contents: {
        Row: {
          correspondence_type: Database["public"]["Enums"]["correspondence_type"]
          created_at: string
          delivery_id: string
          gift_note: string | null
          id: string
          letter_text: string | null
          metadata: Json
          postcard_message: string | null
          postcard_variant: string | null
          sticker_ids: string[]
        }
        Insert: {
          correspondence_type: Database["public"]["Enums"]["correspondence_type"]
          created_at?: string
          delivery_id: string
          gift_note?: string | null
          id: string
          letter_text?: string | null
          metadata?: Json
          postcard_message?: string | null
          postcard_variant?: string | null
          sticker_ids?: string[]
        }
        Update: {
          correspondence_type?: Database["public"]["Enums"]["correspondence_type"]
          created_at?: string
          delivery_id?: string
          gift_note?: string | null
          id?: string
          letter_text?: string | null
          metadata?: Json
          postcard_message?: string | null
          postcard_variant?: string | null
          sticker_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "delivery_correspondence_contents_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: true
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_route_discoveries: {
        Row: {
          collected_at: string | null
          created_at: string
          delivery_id: string
          distance_from_route_km: number
          id: string
          inventory_item_id: string | null
          reward_item_id: string
          route_progress: number
          route_reward_point_id: string
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          delivery_id: string
          distance_from_route_km: number
          id: string
          inventory_item_id?: string | null
          reward_item_id: string
          route_progress: number
          route_reward_point_id: string
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          delivery_id?: string
          distance_from_route_km?: number
          id?: string
          inventory_item_id?: string | null
          reward_item_id?: string
          route_progress?: number
          route_reward_point_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_route_discoveries_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_route_discoveries_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_route_discoveries_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_route_discoveries_route_reward_point_id_fkey"
            columns: ["route_reward_point_id"]
            isOneToOne: false
            referencedRelation: "route_reward_points"
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
          postal_base_city: string
          postal_base_country: string
          postal_base_neighborhood: string
          postal_base_state: string
          postal_base_street: string
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
          postal_base_city: string
          postal_base_country: string
          postal_base_neighborhood: string
          postal_base_state: string
          postal_base_street: string
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
          postal_base_city?: string
          postal_base_country?: string
          postal_base_neighborhood?: string
          postal_base_state?: string
          postal_base_street?: string
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
      route_reward_points: {
        Row: {
          active: boolean
          created_at: string
          description_key: string
          eligibility_radius_km: number
          id: string
          inventory_category: Database["public"]["Enums"]["inventory_category"]
          kind: string
          latitude: number
          longitude: number
          mock_key: string
          region_kind: string
          region_label: string
          reward_item_id: string
          sort_order: number
          title_key: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description_key: string
          eligibility_radius_km: number
          id: string
          inventory_category: Database["public"]["Enums"]["inventory_category"]
          kind: string
          latitude: number
          longitude: number
          mock_key: string
          region_kind: string
          region_label: string
          reward_item_id: string
          sort_order?: number
          title_key: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description_key?: string
          eligibility_radius_km?: number
          id?: string
          inventory_category?: Database["public"]["Enums"]["inventory_category"]
          kind?: string
          latitude?: number
          longitude?: number
          mock_key?: string
          region_kind?: string
          region_label?: string
          reward_item_id?: string
          sort_order?: number
          title_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_reward_points_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      collect_delivery_reward: {
        Args: { delivery_public_id: string }
        Returns: Json
      }
      create_delivery_from_selection: {
        Args: {
          content_payload: Json
          correspondence_mock_key: string
          friend_mock_key: string
          mascot_mock_key: string
        }
        Returns: {
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
          route_discovery_version: number | null
          sender_profile_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          travel_modifiers: Json | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_accepted_friend_profiles: {
        Args: never
        Returns: {
          display_name: string
          exchange_count: number
          favorite_note_key: string
          friendship_level: number
          mock_key: string
          postal_base_city: string
          postal_base_country: string
          postal_base_state: string
          profile_id: string
        }[]
      }
      get_nearby_postal_traffic: {
        Args: {
          center_latitude: number
          center_longitude: number
          viewport_east: number
          viewport_north: number
          viewport_south: number
          viewport_west: number
        }
        Returns: {
          current_latitude: number
          current_longitude: number
          destination_latitude: number
          destination_longitude: number
          destination_region: string
          distance_km: number
          friend_id: string | null
          friend_name: string | null
          mascot_name: string
          origin_latitude: number
          origin_longitude: number
          origin_region: string
          outbound_arrival_at: string
          outbound_start_at: string
          portrait_asset_path: string
          return_arrival_at: string | null
          return_start_at: string | null
          species_key: string
          traffic_id: string
          visibility: string
        }[]
      }
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

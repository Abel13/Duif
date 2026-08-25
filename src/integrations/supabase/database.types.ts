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
      account_onboarding: {
        Row: {
          auth_user_id: string
          completed_at: string | null
          created_at: string
          display_name: string | null
          inaugural_postcard_hint_seen_at: string | null
          mascot_name: string | null
          selected_mascot_template_id: string | null
          stage: Database["public"]["Enums"]["onboarding_stage"]
          stage_version: number
          tutorial_collected_at: string | null
          tutorial_delivery_id: string | null
          tutorial_instruction_step:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          completed_at?: string | null
          created_at?: string
          display_name?: string | null
          inaugural_postcard_hint_seen_at?: string | null
          mascot_name?: string | null
          selected_mascot_template_id?: string | null
          stage?: Database["public"]["Enums"]["onboarding_stage"]
          stage_version?: number
          tutorial_collected_at?: string | null
          tutorial_delivery_id?: string | null
          tutorial_instruction_step?:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          completed_at?: string | null
          created_at?: string
          display_name?: string | null
          inaugural_postcard_hint_seen_at?: string | null
          mascot_name?: string | null
          selected_mascot_template_id?: string | null
          stage?: Database["public"]["Enums"]["onboarding_stage"]
          stage_version?: number
          tutorial_collected_at?: string | null
          tutorial_delivery_id?: string | null
          tutorial_instruction_step?:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_onboarding_selected_mascot_template_id_fkey"
            columns: ["selected_mascot_template_id"]
            isOneToOne: false
            referencedRelation: "mascot_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_onboarding_tutorial_delivery_id_fkey"
            columns: ["tutorial_delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence_options: {
        Row: {
          catalog_key: string
          description_key: string | null
          id: string
          name_key: string | null
          sort_order: number
          status: Database["public"]["Enums"]["catalog_status"]
          type: Database["public"]["Enums"]["correspondence_type"]
        }
        Insert: {
          catalog_key: string
          description_key?: string | null
          id: string
          name_key?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
          type: Database["public"]["Enums"]["correspondence_type"]
        }
        Update: {
          catalog_key?: string
          description_key?: string | null
          id?: string
          name_key?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
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
          destination_place_label: string | null
          distance_km: number
          equipment_snapshot: Json
          id: string
          is_tutorial: boolean
          mascot_id: string
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          origin_place_label: string | null
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
          travel_rules_snapshot: Json | null
          travel_slot_capacity: number
          travel_slots_used: number
          travel_weather_summary: Json | null
          updated_at: string
        }
        Insert: {
          animal_speed_kmh: number
          correspondence_option_id?: string | null
          created_at?: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          destination_place_label?: string | null
          distance_km: number
          equipment_snapshot?: Json
          id: string
          is_tutorial?: boolean
          mascot_id: string
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          origin_place_label?: string | null
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
          travel_rules_snapshot?: Json | null
          travel_slot_capacity?: number
          travel_slots_used?: number
          travel_weather_summary?: Json | null
          updated_at?: string
        }
        Update: {
          animal_speed_kmh?: number
          correspondence_option_id?: string | null
          created_at?: string
          destination_label_key?: string
          destination_latitude?: number
          destination_longitude?: number
          destination_place_label?: string | null
          distance_km?: number
          equipment_snapshot?: Json
          id?: string
          is_tutorial?: boolean
          mascot_id?: string
          origin_label_key?: string
          origin_latitude?: number
          origin_longitude?: number
          origin_place_label?: string | null
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
          travel_rules_snapshot?: Json | null
          travel_slot_capacity?: number
          travel_slots_used?: number
          travel_weather_summary?: Json | null
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
          postcard_catalog_key: string | null
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
          postcard_catalog_key?: string | null
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
          postcard_catalog_key?: string | null
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
          {
            foreignKeyName: "delivery_correspondence_contents_postcard_catalog_key_fkey"
            columns: ["postcard_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_postcards"
            referencedColumns: ["catalog_key"]
          },
        ]
      }
      delivery_equipment_activations: {
        Row: {
          activated_at: string
          applied_effects: Json
          condition: string
          delivery_id: string
          equipment_instance_id: string
          mitigation_points: number
          segment_id: string
        }
        Insert: {
          activated_at?: string
          applied_effects?: Json
          condition: string
          delivery_id: string
          equipment_instance_id: string
          mitigation_points: number
          segment_id: string
        }
        Update: {
          activated_at?: string
          applied_effects?: Json
          condition?: string
          delivery_id?: string
          equipment_instance_id?: string
          mitigation_points?: number
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_equipment_activations_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_equipment_activations_equipment_instance_id_fkey"
            columns: ["equipment_instance_id"]
            isOneToOne: false
            referencedRelation: "equipment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_equipment_activations_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "delivery_route_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_mailbox_opens: {
        Row: {
          delivery_id: string
          direction: string
          opened_at: string
          profile_id: string
        }
        Insert: {
          delivery_id: string
          direction: string
          opened_at?: string
          profile_id: string
        }
        Update: {
          delivery_id?: string
          direction?: string
          opened_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_mailbox_opens_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_mailbox_opens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_progression_awards: {
        Row: {
          awarded_at: string
          delivery_id: string
          formula_version: number
          inputs: Json
          mascot_id: string
          mascot_xp: number
          profile_id: string
          reputation_xp: number
          skill_awards: Json
        }
        Insert: {
          awarded_at?: string
          delivery_id: string
          formula_version?: number
          inputs: Json
          mascot_id: string
          mascot_xp: number
          profile_id: string
          reputation_xp: number
          skill_awards?: Json
        }
        Update: {
          awarded_at?: string
          delivery_id?: string
          formula_version?: number
          inputs?: Json
          mascot_id?: string
          mascot_xp?: number
          profile_id?: string
          reputation_xp?: number
          skill_awards?: Json
        }
        Relationships: [
          {
            foreignKeyName: "delivery_progression_awards_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: true
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_progression_awards_mascot_id_fkey"
            columns: ["mascot_id"]
            isOneToOne: false
            referencedRelation: "player_mascots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_progression_awards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_return_replies: {
        Row: {
          confirmed_at: string
          delivery_id: string
          departure_at: string
          letter_text: string
          metadata: Json
          receiver_profile_id: string
          sender_profile_id: string
        }
        Insert: {
          confirmed_at?: string
          delivery_id: string
          departure_at: string
          letter_text: string
          metadata?: Json
          receiver_profile_id: string
          sender_profile_id: string
        }
        Update: {
          confirmed_at?: string
          delivery_id?: string
          departure_at?: string
          letter_text?: string
          metadata?: Json
          receiver_profile_id?: string
          sender_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_return_replies_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: true
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_return_replies_receiver_profile_id_fkey"
            columns: ["receiver_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_return_replies_sender_profile_id_fkey"
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
          reward_item_id: string
          xp_gained: number
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          delivery_id: string
          id: string
          reward_item_id: string
          xp_gained: number
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          delivery_id?: string
          id?: string
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
      delivery_route_daylight_windows: {
        Row: {
          created_at: string
          delivery_id: string
          ended_at: string | null
          id: string
          is_day: boolean
          segment_id: string
          started_at: string
        }
        Insert: {
          created_at?: string
          delivery_id: string
          ended_at?: string | null
          id?: string
          is_day: boolean
          segment_id: string
          started_at: string
        }
        Update: {
          created_at?: string
          delivery_id?: string
          ended_at?: string | null
          id?: string
          is_day?: boolean
          segment_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_route_daylight_windows_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_route_daylight_windows_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "delivery_route_segments"
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
      delivery_route_segments: {
        Row: {
          completed_at: string | null
          created_at: string
          delivery_id: string
          distance_km: number
          effective_speed_kmh: number
          estimated_end_at: string
          estimated_start_at: string
          id: string
          leg: string
          modifiers: Json
          route_fraction_end: number
          route_fraction_start: number
          segment_index: number
          state: string
          updated_at: string
          weather_snapshot: Json
          weather_source: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          delivery_id: string
          distance_km: number
          effective_speed_kmh: number
          estimated_end_at: string
          estimated_start_at: string
          id?: string
          leg: string
          modifiers: Json
          route_fraction_end: number
          route_fraction_start: number
          segment_index: number
          state?: string
          updated_at?: string
          weather_snapshot: Json
          weather_source: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          delivery_id?: string
          distance_km?: number
          effective_speed_kmh?: number
          estimated_end_at?: string
          estimated_start_at?: string
          id?: string
          leg?: string
          modifiers?: Json
          route_fraction_end?: number
          route_fraction_start?: number
          segment_index?: number
          state?: string
          updated_at?: string
          weather_snapshot?: Json
          weather_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_route_segments_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_sticker_transfers: {
        Row: {
          delivery_id: string
          quantity: number
          recipient_profile_id: string
          settled_at: string | null
          snapshot: Json
          sticker_catalog_key: string
        }
        Insert: {
          delivery_id: string
          quantity: number
          recipient_profile_id: string
          settled_at?: string | null
          snapshot: Json
          sticker_catalog_key: string
        }
        Update: {
          delivery_id?: string
          quantity?: number
          recipient_profile_id?: string
          settled_at?: string | null
          snapshot?: Json
          sticker_catalog_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_sticker_transfers_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_sticker_transfers_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_sticker_transfers_sticker_catalog_key_fkey"
            columns: ["sticker_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_stickers"
            referencedColumns: ["catalog_key"]
          },
        ]
      }
      equipment_catalog: {
        Row: {
          asset_key: string | null
          catalog_key: string
          condition: string | null
          created_at: string
          description_key: string
          id: string
          kind: string
          max_uses: number | null
          metadata: Json
          mitigation_points: number
          name_key: string
          repair_seed_price: number | null
          seed_price: number | null
          slot_bonus: number
          sort_order: number
          speed_multiplier: number
          status: string
        }
        Insert: {
          asset_key?: string | null
          catalog_key: string
          condition?: string | null
          created_at?: string
          description_key: string
          id?: string
          kind: string
          max_uses?: number | null
          metadata?: Json
          mitigation_points?: number
          name_key: string
          repair_seed_price?: number | null
          seed_price?: number | null
          slot_bonus?: number
          sort_order?: number
          speed_multiplier?: number
          status?: string
        }
        Update: {
          asset_key?: string | null
          catalog_key?: string
          condition?: string | null
          created_at?: string
          description_key?: string
          id?: string
          kind?: string
          max_uses?: number | null
          metadata?: Json
          mitigation_points?: number
          name_key?: string
          repair_seed_price?: number | null
          seed_price?: number | null
          slot_bonus?: number
          sort_order?: number
          speed_multiplier?: number
          status?: string
        }
        Relationships: []
      }
      equipment_catalog_effects: {
        Row: { catalog_id: string; hazard_key: string; mitigation_points: number; sort_order: number }
        Insert: { catalog_id: string; hazard_key: string; mitigation_points: number; sort_order?: number }
        Update: { catalog_id?: string; hazard_key?: string; mitigation_points?: number; sort_order?: number }
        Relationships: [{ foreignKeyName: "equipment_catalog_effects_catalog_id_fkey"; columns: ["catalog_id"]; isOneToOne: false; referencedRelation: "equipment_catalog"; referencedColumns: ["id"] }]
      }
      equipment_instances: {
        Row: {
          acquired_at: string
          acquisition_key: string
          catalog_id: string
          equipped_mascot_id: string | null
          id: string
          owner_profile_id: string
          source: string
          updated_at: string
          uses_remaining: number | null
        }
        Insert: {
          acquired_at?: string
          acquisition_key?: string
          catalog_id: string
          equipped_mascot_id?: string | null
          id?: string
          owner_profile_id: string
          source?: string
          updated_at?: string
          uses_remaining?: number | null
        }
        Update: {
          acquired_at?: string
          acquisition_key?: string
          catalog_id?: string
          equipped_mascot_id?: string | null
          id?: string
          owner_profile_id?: string
          source?: string
          updated_at?: string
          uses_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_instances_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_instances_equipped_mascot_id_fkey"
            columns: ["equipped_mascot_id"]
            isOneToOne: false
            referencedRelation: "player_mascots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_instances_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_mutation_requests: {
        Row: {
          created_at: string
          mutation_kind: string
          profile_id: string
          request_id: string
          result: Json
        }
        Insert: {
          created_at?: string
          mutation_kind: string
          profile_id: string
          request_id: string
          result: Json
        }
        Update: {
          created_at?: string
          mutation_kind?: string
          profile_id?: string
          request_id?: string
          result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "equipment_mutation_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_purchase_requests: {
        Row: {
          catalog_id: string
          created_at: string
          instance_id: string
          profile_id: string
          request_id: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          instance_id: string
          profile_id: string
          request_id: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          instance_id?: string
          profile_id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_purchase_requests_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_purchase_requests_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "equipment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_purchase_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      geonames_admin1_regions: {
        Row: {
          admin1_code: string
          archived_at: string | null
          ascii_name: string
          country_code: string
          geoname_id: number | null
          import_run_id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          admin1_code: string
          archived_at?: string | null
          ascii_name: string
          country_code: string
          geoname_id?: number | null
          import_run_id: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          admin1_code?: string
          archived_at?: string | null
          ascii_name?: string
          country_code?: string
          geoname_id?: number | null
          import_run_id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geonames_admin1_regions_import_run_id_fkey"
            columns: ["import_run_id"]
            isOneToOne: false
            referencedRelation: "geonames_import_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      geonames_cities: {
        Row: {
          admin1_code: string | null
          alternate_names: string
          archived_at: string | null
          ascii_name: string
          country_code: string
          geoname_id: number
          import_run_id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          population: number
          search_text: string
          updated_at: string
        }
        Insert: {
          admin1_code?: string | null
          alternate_names?: string
          archived_at?: string | null
          ascii_name: string
          country_code: string
          geoname_id: number
          import_run_id: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          population?: number
          search_text: string
          updated_at?: string
        }
        Update: {
          admin1_code?: string | null
          alternate_names?: string
          archived_at?: string | null
          ascii_name?: string
          country_code?: string
          geoname_id?: number
          import_run_id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          population?: number
          search_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geonames_cities_import_run_id_fkey"
            columns: ["import_run_id"]
            isOneToOne: false
            referencedRelation: "geonames_import_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      geonames_import_runs: {
        Row: {
          admin1_source_sha256: string | null
          archived_city_count: number
          archived_region_count: number
          completed_at: string | null
          created_at: string
          dataset: string
          id: string
          imported_city_count: number
          imported_region_count: number
          operator_label: string
          source: string
          source_date: string
          source_row_count: number
          source_sha256: string
        }
        Insert: {
          admin1_source_sha256?: string | null
          archived_city_count?: number
          archived_region_count?: number
          completed_at?: string | null
          created_at?: string
          dataset: string
          id?: string
          imported_city_count?: number
          imported_region_count?: number
          operator_label: string
          source: string
          source_date: string
          source_row_count: number
          source_sha256: string
        }
        Update: {
          admin1_source_sha256?: string | null
          archived_city_count?: number
          archived_region_count?: number
          completed_at?: string | null
          created_at?: string
          dataset?: string
          id?: string
          imported_city_count?: number
          imported_region_count?: number
          operator_label?: string
          source?: string
          source_date?: string
          source_row_count?: number
          source_sha256?: string
        }
        Relationships: []
      }
      geonames_refresh_city_staging: {
        Row: {
          admin1_code: string | null
          alternate_names: string
          ascii_name: string
          country_code: string
          geoname_id: number
          job_id: string
          latitude: number
          longitude: number
          name: string
          population: number
          search_text: string
        }
        Insert: {
          admin1_code?: string | null
          alternate_names?: string
          ascii_name: string
          country_code: string
          geoname_id: number
          job_id: string
          latitude: number
          longitude: number
          name: string
          population: number
          search_text: string
        }
        Update: {
          admin1_code?: string | null
          alternate_names?: string
          ascii_name?: string
          country_code?: string
          geoname_id?: number
          job_id?: string
          latitude?: number
          longitude?: number
          name?: string
          population?: number
          search_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "geonames_refresh_city_staging_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "geonames_refresh_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      geonames_refresh_jobs: {
        Row: {
          admin1_source_sha256: string | null
          archived_city_count: number
          completed_at: string | null
          created_at: string
          id: string
          imported_city_count: number
          processed_city_count: number
          requested_by: string
          safe_error_code: string | null
          source_date: string | null
          source_sha256: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["geonames_refresh_status"]
          updated_city_count: number
        }
        Insert: {
          admin1_source_sha256?: string | null
          archived_city_count?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          imported_city_count?: number
          processed_city_count?: number
          requested_by: string
          safe_error_code?: string | null
          source_date?: string | null
          source_sha256?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["geonames_refresh_status"]
          updated_city_count?: number
        }
        Update: {
          admin1_source_sha256?: string | null
          archived_city_count?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          imported_city_count?: number
          processed_city_count?: number
          requested_by?: string
          safe_error_code?: string | null
          source_date?: string | null
          source_sha256?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["geonames_refresh_status"]
          updated_city_count?: number
        }
        Relationships: []
      }
      geonames_refresh_region_staging: {
        Row: {
          admin1_code: string
          ascii_name: string
          country_code: string
          geoname_id: number | null
          job_id: string
          name: string
        }
        Insert: {
          admin1_code: string
          ascii_name: string
          country_code: string
          geoname_id?: number | null
          job_id: string
          name: string
        }
        Update: {
          admin1_code?: string
          ascii_name?: string
          country_code?: string
          geoname_id?: number | null
          job_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "geonames_refresh_region_staging_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "geonames_refresh_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: Database["public"]["Enums"]["inventory_category"]
          collected_at: string
          created_at: string
          delivery_reward_id: string | null
          description_key: string
          equipped: boolean
          id: string
          name_key: string
          owner_profile_id: string
          rarity: Database["public"]["Enums"]["reward_rarity"]
          reward_item_id: string | null
          source_key: string | null
          thumbnail_asset_key: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["inventory_category"]
          collected_at?: string
          created_at?: string
          delivery_reward_id?: string | null
          description_key: string
          equipped?: boolean
          id: string
          name_key: string
          owner_profile_id: string
          rarity: Database["public"]["Enums"]["reward_rarity"]
          reward_item_id?: string | null
          source_key?: string | null
          thumbnail_asset_key?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["inventory_category"]
          collected_at?: string
          created_at?: string
          delivery_reward_id?: string | null
          description_key?: string
          equipped?: boolean
          id?: string
          name_key?: string
          owner_profile_id?: string
          rarity?: Database["public"]["Enums"]["reward_rarity"]
          reward_item_id?: string | null
          source_key?: string | null
          thumbnail_asset_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_delivery_reward_id_fkey"
            columns: ["delivery_reward_id"]
            isOneToOne: true
            referencedRelation: "delivery_rewards"
            referencedColumns: ["id"]
          },
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
      mascot_loadouts: {
        Row: {
          backpack_instance_id: string | null
          mascot_id: string
          revision: number
          updated_at: string
          utility_instance_id: string | null
        }
        Insert: {
          backpack_instance_id?: string | null
          mascot_id: string
          revision?: number
          updated_at?: string
          utility_instance_id?: string | null
        }
        Update: {
          backpack_instance_id?: string | null
          mascot_id?: string
          revision?: number
          updated_at?: string
          utility_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mascot_loadouts_backpack_instance_id_fkey"
            columns: ["backpack_instance_id"]
            isOneToOne: true
            referencedRelation: "equipment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mascot_loadouts_mascot_id_fkey"
            columns: ["mascot_id"]
            isOneToOne: true
            referencedRelation: "player_mascots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mascot_loadouts_utility_instance_id_fkey"
            columns: ["utility_instance_id"]
            isOneToOne: true
            referencedRelation: "equipment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      mascot_skill_progression: {
        Row: {
          level: number
          mascot_id: string
          next_level_xp: number
          skill_id: string
          updated_at: string
          xp: number
        }
        Insert: {
          level?: number
          mascot_id: string
          next_level_xp?: number
          skill_id: string
          updated_at?: string
          xp?: number
        }
        Update: {
          level?: number
          mascot_id?: string
          next_level_xp?: number
          skill_id?: string
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "mascot_skill_progression_mascot_id_fkey"
            columns: ["mascot_id"]
            isOneToOne: false
            referencedRelation: "player_mascots"
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
          catalog_key: string
          created_at: string
          equipment: Json
          id: string
          next_level_xp: number
          skills: Json
          species_key: string | null
          status: Database["public"]["Enums"]["catalog_status"]
          suggested_name_key: string | null
          trait: Json
        }
        Insert: {
          appearance: Json
          attributes: Json
          base_level?: number
          base_xp?: number
          catalog_key: string
          created_at?: string
          equipment?: Json
          id: string
          next_level_xp: number
          skills?: Json
          species_key?: string | null
          status?: Database["public"]["Enums"]["catalog_status"]
          suggested_name_key?: string | null
          trait: Json
        }
        Update: {
          appearance?: Json
          attributes?: Json
          base_level?: number
          base_xp?: number
          catalog_key?: string
          created_at?: string
          equipment?: Json
          id?: string
          next_level_xp?: number
          skills?: Json
          species_key?: string | null
          status?: Database["public"]["Enums"]["catalog_status"]
          suggested_name_key?: string | null
          trait?: Json
        }
        Relationships: []
      }
      nest_search_rate_limits: {
        Row: {
          auth_user_id: string
          request_count: number
          updated_at: string
          window_started_at: string
        }
        Insert: {
          auth_user_id: string
          request_count?: number
          updated_at?: string
          window_started_at?: string
        }
        Update: {
          auth_user_id?: string
          request_count?: number
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
      official_asset_activity: {
        Row: {
          action: string
          actor_user_id: string
          asset_version_id: string | null
          created_at: string
          details: Json
          id: string
        }
        Insert: {
          action: string
          actor_user_id: string
          asset_version_id?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          asset_version_id?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "official_asset_activity_asset_version_id_fkey"
            columns: ["asset_version_id"]
            isOneToOne: false
            referencedRelation: "official_asset_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      official_asset_versions: {
        Row: {
          alt_text_key: string | null
          asset_id: string
          author: string
          byte_size: number
          created_at: string
          height: number
          id: string
          is_decorative: boolean
          metadata: Json
          mime_type: string
          packaged_path: string | null
          source: Database["public"]["Enums"]["official_asset_source"]
          status: Database["public"]["Enums"]["catalog_status"]
          storage_bucket: string | null
          storage_object_path: string | null
          version: number
          width: number
        }
        Insert: {
          alt_text_key?: string | null
          asset_id: string
          author: string
          byte_size: number
          created_at?: string
          height: number
          id?: string
          is_decorative?: boolean
          metadata?: Json
          mime_type: string
          packaged_path?: string | null
          source: Database["public"]["Enums"]["official_asset_source"]
          status?: Database["public"]["Enums"]["catalog_status"]
          storage_bucket?: string | null
          storage_object_path?: string | null
          version: number
          width: number
        }
        Update: {
          alt_text_key?: string | null
          asset_id?: string
          author?: string
          byte_size?: number
          created_at?: string
          height?: number
          id?: string
          is_decorative?: boolean
          metadata?: Json
          mime_type?: string
          packaged_path?: string | null
          source?: Database["public"]["Enums"]["official_asset_source"]
          status?: Database["public"]["Enums"]["catalog_status"]
          storage_bucket?: string | null
          storage_object_path?: string | null
          version?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "official_asset_versions_alt_text_key_fkey"
            columns: ["alt_text_key"]
            isOneToOne: false
            referencedRelation: "official_translation_keys"
            referencedColumns: ["translation_key"]
          },
          {
            foreignKeyName: "official_asset_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "official_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      official_assets: {
        Row: {
          asset_key: string
          asset_type: Database["public"]["Enums"]["official_asset_type"]
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          asset_key: string
          asset_type: Database["public"]["Enums"]["official_asset_type"]
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          asset_key?: string
          asset_type?: Database["public"]["Enums"]["official_asset_type"]
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      official_postal_job_contacts: {
        Row: {
          catalog_key: string
          name_key: string
          place_key: string
          role_key: string
          sort_order: number
          status: Database["public"]["Enums"]["catalog_status"]
        }
        Insert: {
          catalog_key: string
          name_key: string
          place_key: string
          role_key: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
        }
        Update: {
          catalog_key?: string
          name_key?: string
          place_key?: string
          role_key?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
        }
        Relationships: []
      }
      official_postal_job_templates: {
        Row: {
          cargo_key: string
          cargo_slots: number
          catalog_key: string
          contact_catalog_key: string
          description_key: string
          mascot_xp: number
          max_distance_km: number
          max_mascot_level: number | null
          min_distance_km: number
          min_mascot_level: number
          seed_reward: number
          sort_order: number
          status: Database["public"]["Enums"]["catalog_status"]
          title_key: string
        }
        Insert: {
          cargo_key: string
          cargo_slots: number
          catalog_key: string
          contact_catalog_key: string
          description_key: string
          mascot_xp?: number
          max_distance_km: number
          max_mascot_level?: number | null
          min_distance_km: number
          min_mascot_level: number
          seed_reward: number
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
          title_key: string
        }
        Update: {
          cargo_key?: string
          cargo_slots?: number
          catalog_key?: string
          contact_catalog_key?: string
          description_key?: string
          mascot_xp?: number
          max_distance_km?: number
          max_mascot_level?: number | null
          min_distance_km?: number
          min_mascot_level?: number
          seed_reward?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
          title_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "official_postal_job_templates_contact_catalog_key_fkey"
            columns: ["contact_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_postal_job_contacts"
            referencedColumns: ["catalog_key"]
          },
        ]
      }
      official_postcards: {
        Row: {
          artwork_asset_key: string
          availability: string
          catalog_key: string
          description_key: string
          name_key: string
          sort_order: number
          status: Database["public"]["Enums"]["catalog_status"]
        }
        Insert: {
          artwork_asset_key: string
          availability: string
          catalog_key: string
          description_key: string
          name_key: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
        }
        Update: {
          artwork_asset_key?: string
          availability?: string
          catalog_key?: string
          description_key?: string
          name_key?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
        }
        Relationships: []
      }
      official_stickers: {
        Row: {
          artwork_asset_key: string
          catalog_key: string
          description_key: string
          name_key: string
          sort_order: number
          status: Database["public"]["Enums"]["catalog_status"]
        }
        Insert: {
          artwork_asset_key: string
          catalog_key: string
          description_key: string
          name_key: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
        }
        Update: {
          artwork_asset_key?: string
          catalog_key?: string
          description_key?: string
          name_key?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
        }
        Relationships: []
      }
      official_translation_keys: {
        Row: {
          created_at: string
          has_en_us: boolean
          has_pt_br: boolean
          translation_key: string
        }
        Insert: {
          created_at?: string
          has_en_us?: boolean
          has_pt_br?: boolean
          translation_key: string
        }
        Update: {
          created_at?: string
          has_en_us?: boolean
          has_pt_br?: boolean
          translation_key?: string
        }
        Relationships: []
      }
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
      player_mascots: {
        Row: {
          appearance: Json
          attributes: Json
          created_at: string
          equipment: Json
          id: string
          is_starter: boolean
          level: number
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
          is_starter?: boolean
          level: number
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
          is_starter?: boolean
          level?: number
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
      postal_friend_code_rate_limits: {
        Row: {
          profile_id: string
          request_count: number
          updated_at: string
          window_started_at: string
        }
        Insert: {
          profile_id: string
          request_count: number
          updated_at?: string
          window_started_at: string
        }
        Update: {
          profile_id?: string
          request_count?: number
          updated_at?: string
          window_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "postal_friend_code_rate_limits_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      postal_job_cycles: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          mascot_id: string
          profile_id: string
          replacement_count: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mascot_id: string
          profile_id: string
          replacement_count?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mascot_id?: string
          profile_id?: string
          replacement_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "postal_job_cycles_mascot_id_fkey"
            columns: ["mascot_id"]
            isOneToOne: false
            referencedRelation: "player_mascots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postal_job_cycles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      postal_job_offers: {
        Row: {
          accepted_at: string | null
          created_at: string
          cycle_id: string
          destination_latitude: number
          destination_longitude: number
          distance_km: number
          id: string
          replaced_at: string | null
          status: string
          template_catalog_key: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          cycle_id: string
          destination_latitude: number
          destination_longitude: number
          distance_km: number
          id?: string
          replaced_at?: string | null
          status?: string
          template_catalog_key: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          cycle_id?: string
          destination_latitude?: number
          destination_longitude?: number
          distance_km?: number
          id?: string
          replaced_at?: string | null
          status?: string
          template_catalog_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "postal_job_offers_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "postal_job_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postal_job_offers_template_catalog_key_fkey"
            columns: ["template_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_postal_job_templates"
            referencedColumns: ["catalog_key"]
          },
        ]
      }
      postal_job_runs: {
        Row: {
          cargo_snapshot: Json
          collected_at: string | null
          contact_catalog_key: string
          contact_snapshot: Json
          delivery_id: string
          mascot_id: string
          offer_id: string
          profile_id: string
          seed_reward: number
        }
        Insert: {
          cargo_snapshot: Json
          collected_at?: string | null
          contact_catalog_key: string
          contact_snapshot: Json
          delivery_id: string
          mascot_id: string
          offer_id: string
          profile_id: string
          seed_reward: number
        }
        Update: {
          cargo_snapshot?: Json
          collected_at?: string | null
          contact_catalog_key?: string
          contact_snapshot?: Json
          delivery_id?: string
          mascot_id?: string
          offer_id?: string
          profile_id?: string
          seed_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "postal_job_runs_contact_catalog_key_fkey"
            columns: ["contact_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_postal_job_contacts"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "postal_job_runs_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: true
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postal_job_runs_mascot_id_fkey"
            columns: ["mascot_id"]
            isOneToOne: false
            referencedRelation: "player_mascots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postal_job_runs_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "postal_job_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postal_job_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      postal_progression_reset_audits: {
        Row: {
          actor_label: string
          award_count: number
          created_at: string
          id: string
          mascot_count: number
          profile_count: number
          project_ref: string
          skill_count: number
        }
        Insert: {
          actor_label: string
          award_count: number
          created_at?: string
          id?: string
          mascot_count: number
          profile_count: number
          project_ref: string
          skill_count: number
        }
        Update: {
          actor_label?: string
          award_count?: number
          created_at?: string
          id?: string
          mascot_count?: number
          profile_count?: number
          project_ref?: string
          skill_count?: number
        }
        Relationships: []
      }
      postal_seed_ledger: {
        Row: {
          created_at: string
          id: string
          job_delivery_id: string
          profile_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          job_delivery_id: string
          profile_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          job_delivery_id?: string
          profile_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "postal_seed_ledger_job_delivery_id_fkey"
            columns: ["job_delivery_id"]
            isOneToOne: true
            referencedRelation: "postal_job_runs"
            referencedColumns: ["delivery_id"]
          },
          {
            foreignKeyName: "postal_seed_ledger_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_postal_friend_codes: {
        Row: {
          code: string
          created_at: string
          profile_id: string
          rotated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          profile_id: string
          rotated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          profile_id?: string
          rotated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_postal_friend_codes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_postal_progression: {
        Row: {
          level: number
          next_level_xp: number
          profile_id: string
          updated_at: string
          xp: number
        }
        Insert: {
          level?: number
          next_level_xp?: number
          profile_id: string
          updated_at?: string
          xp?: number
        }
        Update: {
          level?: number
          next_level_xp?: number
          profile_id?: string
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_postal_progression_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_postcard_balances: {
        Row: {
          postcard_catalog_key: string
          profile_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          postcard_catalog_key: string
          profile_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          postcard_catalog_key?: string
          profile_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_postcard_balances_postcard_catalog_key_fkey"
            columns: ["postcard_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_postcards"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "profile_postcard_balances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_postcard_unlocks: {
        Row: {
          postcard_catalog_key: string
          profile_id: string
          source: string
          unlocked_at: string
        }
        Insert: {
          postcard_catalog_key: string
          profile_id: string
          source: string
          unlocked_at?: string
        }
        Update: {
          postcard_catalog_key?: string
          profile_id?: string
          source?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_postcard_unlocks_postcard_catalog_key_fkey"
            columns: ["postcard_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_postcards"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "profile_postcard_unlocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_seed_balances: {
        Row: {
          profile_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          profile_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          profile_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_seed_balances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_sticker_balances: {
        Row: {
          profile_id: string
          quantity: number
          sticker_catalog_key: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          quantity?: number
          sticker_catalog_key: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          quantity?: number
          sticker_catalog_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_sticker_balances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_sticker_balances_sticker_catalog_key_fkey"
            columns: ["sticker_catalog_key"]
            isOneToOne: false
            referencedRelation: "official_stickers"
            referencedColumns: ["catalog_key"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          display_name: string
          home_city_geoname_id: number | null
          home_label_key: string
          home_latitude: number
          home_longitude: number
          id: string
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
          home_city_geoname_id?: number | null
          home_label_key: string
          home_latitude: number
          home_longitude: number
          id: string
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
          home_city_geoname_id?: number | null
          home_label_key?: string
          home_latitude?: number
          home_longitude?: number
          id?: string
          postal_base_city?: string
          postal_base_country?: string
          postal_base_neighborhood?: string
          postal_base_state?: string
          postal_base_street?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_city_geoname_id_fkey"
            columns: ["home_city_geoname_id"]
            isOneToOne: false
            referencedRelation: "geonames_cities"
            referencedColumns: ["geoname_id"]
          },
        ]
      }
      referral_attributions: {
        Row: {
          captured_at: string
          id: string
          invalidated_at: string | null
          invalidated_by_auth_user_id: string | null
          invalidation_reason: string | null
          invitation_link_id: string
          invitation_version: number
          invitee_auth_user_id: string | null
          inviter_profile_id: string
          qualified_at: string | null
        }
        Insert: {
          captured_at?: string
          id?: string
          invalidated_at?: string | null
          invalidated_by_auth_user_id?: string | null
          invalidation_reason?: string | null
          invitation_link_id: string
          invitation_version: number
          invitee_auth_user_id?: string | null
          inviter_profile_id: string
          qualified_at?: string | null
        }
        Update: {
          captured_at?: string
          id?: string
          invalidated_at?: string | null
          invalidated_by_auth_user_id?: string | null
          invalidation_reason?: string | null
          invitation_link_id?: string
          invitation_version?: number
          invitee_auth_user_id?: string | null
          inviter_profile_id?: string
          qualified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_attributions_invitation_link_id_fkey"
            columns: ["invitation_link_id"]
            isOneToOne: false
            referencedRelation: "referral_invitation_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_attributions_inviter_profile_id_fkey"
            columns: ["inviter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_audit_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          invitee_auth_user_id: string | null
          inviter_profile_id: string | null
          metadata: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          invitee_auth_user_id?: string | null
          inviter_profile_id?: string | null
          metadata?: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          invitee_auth_user_id?: string | null
          inviter_profile_id?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "referral_audit_events_inviter_profile_id_fkey"
            columns: ["inviter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_capture_rate_limits: {
        Row: {
          attempt_count: number
          auth_user_id: string
          bucket_start: string
        }
        Insert: {
          attempt_count?: number
          auth_user_id: string
          bucket_start: string
        }
        Update: {
          attempt_count?: number
          auth_user_id?: string
          bucket_start?: string
        }
        Relationships: []
      }
      referral_invitation_links: {
        Row: {
          created_at: string
          id: string
          inviter_profile_id: string
          rotated_at: string
          token_digest: string | null
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          inviter_profile_id: string
          rotated_at?: string
          token_digest?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          inviter_profile_id?: string
          rotated_at?: string
          token_digest?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_invitation_links_inviter_profile_id_fkey"
            columns: ["inviter_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_owl_rewards: {
        Row: {
          available_at: string
          claimed_at: string | null
          mascot_id: string | null
          owner_profile_id: string
          status: string
        }
        Insert: {
          available_at?: string
          claimed_at?: string | null
          mascot_id?: string | null
          owner_profile_id: string
          status?: string
        }
        Update: {
          available_at?: string
          claimed_at?: string | null
          mascot_id?: string | null
          owner_profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_owl_rewards_mascot_id_fkey"
            columns: ["mascot_id"]
            isOneToOne: true
            referencedRelation: "player_mascots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_owl_rewards_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_signup_tokens: {
        Row: {
          auth_user_id: string
          created_at: string
          token_digest: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          token_digest: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          token_digest?: string
        }
        Relationships: []
      }
      reward_items: {
        Row: {
          catalog_key: string
          description_key: string | null
          id: string
          name_key: string | null
          rarity: Database["public"]["Enums"]["reward_rarity"]
          status: Database["public"]["Enums"]["catalog_status"]
          thumbnail_asset_key: string | null
        }
        Insert: {
          catalog_key: string
          description_key?: string | null
          id: string
          name_key?: string | null
          rarity: Database["public"]["Enums"]["reward_rarity"]
          status?: Database["public"]["Enums"]["catalog_status"]
          thumbnail_asset_key?: string | null
        }
        Update: {
          catalog_key?: string
          description_key?: string | null
          id?: string
          name_key?: string | null
          rarity?: Database["public"]["Enums"]["reward_rarity"]
          status?: Database["public"]["Enums"]["catalog_status"]
          thumbnail_asset_key?: string | null
        }
        Relationships: []
      }
      route_reward_points: {
        Row: {
          catalog_key: string
          created_at: string
          description_key: string | null
          eligibility_radius_km: number
          id: string
          inventory_category: Database["public"]["Enums"]["inventory_category"]
          kind: string
          latitude: number
          longitude: number
          region_kind: string
          region_label_key: string | null
          reward_item_id: string
          sort_order: number
          status: Database["public"]["Enums"]["catalog_status"]
          title_key: string | null
        }
        Insert: {
          catalog_key: string
          created_at?: string
          description_key?: string | null
          eligibility_radius_km: number
          id: string
          inventory_category: Database["public"]["Enums"]["inventory_category"]
          kind: string
          latitude: number
          longitude: number
          region_kind: string
          region_label_key?: string | null
          reward_item_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
          title_key?: string | null
        }
        Update: {
          catalog_key?: string
          created_at?: string
          description_key?: string | null
          eligibility_radius_km?: number
          id?: string
          inventory_category?: Database["public"]["Enums"]["inventory_category"]
          kind?: string
          latitude?: number
          longitude?: number
          region_kind?: string
          region_label_key?: string | null
          reward_item_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalog_status"]
          title_key?: string | null
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
      timezone_boundaries: {
        Row: {
          created_at: string
          geometry: unknown
          id: number
          import_id: string
          priority: number
          time_zone: string
        }
        Insert: {
          created_at?: string
          geometry: unknown
          id?: never
          import_id: string
          priority?: number
          time_zone: string
        }
        Update: {
          created_at?: string
          geometry?: unknown
          id?: never
          import_id?: string
          priority?: number
          time_zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "timezone_boundaries_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "timezone_boundary_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      timezone_boundary_imports: {
        Row: {
          boundary_count: number
          id: string
          imported_at: string
          source: string
          source_sha256: string
          version: string
        }
        Insert: {
          boundary_count: number
          id?: string
          imported_at?: string
          source: string
          source_sha256: string
          version: string
        }
        Update: {
          boundary_count?: number
          id?: string
          imported_at?: string
          source?: string
          source_sha256?: string
          version?: string
        }
        Relationships: []
      }
      weather_forecast_cache: {
        Row: {
          block_start: string
          category: string
          cell_latitude: number
          cell_longitude: number
          expires_at: string
          is_day: boolean
          queried_at: string
          source: string
          temperature_c: number | null
          weather_code: number
          wind_gust_kmh: number
          wind_speed_kmh: number
        }
        Insert: {
          block_start: string
          category: string
          cell_latitude: number
          cell_longitude: number
          expires_at: string
          is_day: boolean
          queried_at?: string
          source: string
          temperature_c?: number | null
          weather_code: number
          wind_gust_kmh: number
          wind_speed_kmh: number
        }
        Update: {
          block_start?: string
          category?: string
          cell_latitude?: number
          cell_longitude?: number
          expires_at?: string
          is_day?: boolean
          queried_at?: string
          source?: string
          temperature_c?: number | null
          weather_code?: number
          wind_gust_kmh?: number
          wind_speed_kmh?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_postal_job_offer: {
        Args: { target_offer_id: string }
        Returns: Json
      }
      acknowledge_inaugural_postcard_hint: {
        Args: never
        Returns: {
          auth_user_id: string
          completed_at: string | null
          created_at: string
          display_name: string | null
          inaugural_postcard_hint_seen_at: string | null
          mascot_name: string | null
          selected_mascot_template_id: string | null
          stage: Database["public"]["Enums"]["onboarding_stage"]
          stage_version: number
          tutorial_collected_at: string | null
          tutorial_delivery_id: string | null
          tutorial_instruction_step:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "account_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      acknowledge_tutorial_instruction: {
        Args: {
          requested_step: Database["public"]["Enums"]["tutorial_instruction_step"]
        }
        Returns: {
          auth_user_id: string
          completed_at: string | null
          created_at: string
          display_name: string | null
          inaugural_postcard_hint_seen_at: string | null
          mascot_name: string | null
          selected_mascot_template_id: string | null
          stage: Database["public"]["Enums"]["onboarding_stage"]
          stage_version: number
          tutorial_collected_at: string | null
          tutorial_delivery_id: string | null
          tutorial_instruction_step:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "account_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_activate_asset_version: {
        Args: {
          actor_id: string
          public_object_path: string
          version_id: string
        }
        Returns: {
          alt_text_key: string | null
          asset_id: string
          author: string
          byte_size: number
          created_at: string
          height: number
          id: string
          is_decorative: boolean
          metadata: Json
          mime_type: string
          packaged_path: string | null
          source: Database["public"]["Enums"]["official_asset_source"]
          status: Database["public"]["Enums"]["catalog_status"]
          storage_bucket: string | null
          storage_object_path: string | null
          version: number
          width: number
        }
        SetofOptions: {
          from: "*"
          to: "official_asset_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_archive_asset_version: {
        Args: { actor_id: string; version_id: string }
        Returns: {
          alt_text_key: string | null
          asset_id: string
          author: string
          byte_size: number
          created_at: string
          height: number
          id: string
          is_decorative: boolean
          metadata: Json
          mime_type: string
          packaged_path: string | null
          source: Database["public"]["Enums"]["official_asset_source"]
          status: Database["public"]["Enums"]["catalog_status"]
          storage_bucket: string | null
          storage_object_path: string | null
          version: number
          width: number
        }
        SetofOptions: {
          from: "*"
          to: "official_asset_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_begin_geonames_refresh: {
        Args: { actor_id: string }
        Returns: {
          admin1_source_sha256: string | null
          archived_city_count: number
          completed_at: string | null
          created_at: string
          id: string
          imported_city_count: number
          processed_city_count: number
          requested_by: string
          safe_error_code: string | null
          source_date: string | null
          source_sha256: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["geonames_refresh_status"]
          updated_city_count: number
        }
        SetofOptions: {
          from: "*"
          to: "geonames_refresh_jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_asset_draft: {
        Args: {
          actor_id: string
          requested_alt_key: string
          requested_author: string
          requested_bytes: number
          requested_decorative: boolean
          requested_height: number
          requested_key: string
          requested_metadata: Json
          requested_mime: string
          requested_type: Database["public"]["Enums"]["official_asset_type"]
          requested_width: number
          staging_object_path: string
        }
        Returns: Json
      }
      admin_finalize_geonames_refresh: {
        Args: {
          actor_id: string
          imported_admin1_sha256: string
          imported_source_date: string
          imported_source_sha256: string
          refresh_job_id: string
        }
        Returns: Json
      }
      admin_invalidate_referral: {
        Args: { attribution_id: string; reason: string }
        Returns: Json
      }
      admin_list_geonames_refreshes: { Args: never; Returns: Json }
      admin_list_official_assets: { Args: never; Returns: Json }
      admin_validate_asset_draft: {
        Args: {
          actor_id: string
          observed_bytes: number
          observed_height: number
          observed_mime: string
          observed_width: number
          version_id: string
        }
        Returns: {
          alt_text_key: string | null
          asset_id: string
          author: string
          byte_size: number
          created_at: string
          height: number
          id: string
          is_decorative: boolean
          metadata: Json
          mime_type: string
          packaged_path: string | null
          source: Database["public"]["Enums"]["official_asset_source"]
          status: Database["public"]["Enums"]["catalog_status"]
          storage_bucket: string | null
          storage_object_path: string | null
          version: number
          width: number
        }
        SetofOptions: {
          from: "*"
          to: "official_asset_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      advance_account_onboarding: {
        Args: {
          expected_stage: Database["public"]["Enums"]["onboarding_stage"]
          next_stage: Database["public"]["Enums"]["onboarding_stage"]
          requested_display_name?: string
        }
        Returns: {
          auth_user_id: string
          completed_at: string | null
          created_at: string
          display_name: string | null
          inaugural_postcard_hint_seen_at: string | null
          mascot_name: string | null
          selected_mascot_template_id: string | null
          stage: Database["public"]["Enums"]["onboarding_stage"]
          stage_version: number
          tutorial_collected_at: string | null
          tutorial_delivery_id: string | null
          tutorial_instruction_step:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "account_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_delivery_progression: {
        Args: { completed_delivery_id: string }
        Returns: {
          awarded_at: string
          delivery_id: string
          formula_version: number
          inputs: Json
          mascot_id: string
          mascot_xp: number
          profile_id: string
          reputation_xp: number
          skill_awards: Json
        }
        SetofOptions: {
          from: "*"
          to: "delivery_progression_awards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_weather_forecast: {
        Args: {
          block_start: string
          cell_latitude: number
          cell_longitude: number
          is_day: boolean
          source?: string
          temperature_c: number
          weather_code: number
          wind_gust_kmh: number
          wind_speed_kmh: number
        }
        Returns: number
      }
      assert_asset_admin_actor: {
        Args: { actor_id: string }
        Returns: undefined
      }
      asset_version_usage: { Args: { asset_key_value: string }; Returns: Json }
      astronomical_is_day: {
        Args: { at_time: string; latitude: number; longitude: number }
        Returns: boolean
      }
      begin_or_resume_onboarding: {
        Args: never
        Returns: {
          auth_user_id: string
          completed_at: string | null
          created_at: string
          display_name: string | null
          inaugural_postcard_hint_seen_at: string | null
          mascot_name: string | null
          selected_mascot_template_id: string | null
          stage: Database["public"]["Enums"]["onboarding_stage"]
          stage_version: number
          tutorial_collected_at: string | null
          tutorial_delivery_id: string | null
          tutorial_instruction_step:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "account_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      capture_referral_invitation: {
        Args: { invitation_token: string }
        Returns: string
      }
      claim_referral_owl: { Args: { requested_name: string }; Returns: Json }
      collect_delivery_reward: { Args: { delivery_id: string }; Returns: Json }
      collect_tutorial_delivery: { Args: never; Returns: Json }
      complete_nest_setup: {
        Args: {
          selected_city_geoname_id: number
          selected_latitude: number
          selected_longitude: number
        }
        Returns: Json
      }
      confirm_delivery_return_reply: {
        Args: { reply_payload: Json; target_delivery_id: string }
        Returns: {
          confirmed_at: string
          delivery_id: string
          departure_at: string
          letter_text: string
          metadata: Json
          receiver_profile_id: string
          sender_profile_id: string
        }
        SetofOptions: {
          from: "*"
          to: "delivery_return_replies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_delivery_from_selection: {
        Args: {
          content_payload: Json
          correspondence_catalog_key: string
          friend_profile_id: string
          mascot_id: string
        }
        Returns: {
          animal_speed_kmh: number
          correspondence_option_id: string | null
          created_at: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          destination_place_label: string | null
          distance_km: number
          equipment_snapshot: Json
          id: string
          is_tutorial: boolean
          mascot_id: string
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          origin_place_label: string | null
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
          travel_rules_snapshot: Json | null
          travel_slot_capacity: number
          travel_slots_used: number
          travel_weather_summary: Json | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_delivery_from_selection_legacy_equipment: {
        Args: {
          content_payload: Json
          correspondence_catalog_key: string
          friend_profile_id: string
          mascot_id: string
        }
        Returns: {
          animal_speed_kmh: number
          correspondence_option_id: string | null
          created_at: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          destination_place_label: string | null
          distance_km: number
          equipment_snapshot: Json
          id: string
          is_tutorial: boolean
          mascot_id: string
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          origin_place_label: string | null
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
          travel_rules_snapshot: Json | null
          travel_slot_capacity: number
          travel_slots_used: number
          travel_weather_summary: Json | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_delivery_from_selection_legacy_origin: {
        Args: {
          content_payload: Json
          correspondence_catalog_key: string
          friend_profile_id: string
          mascot_id: string
        }
        Returns: {
          animal_speed_kmh: number
          correspondence_option_id: string | null
          created_at: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          destination_place_label: string | null
          distance_km: number
          equipment_snapshot: Json
          id: string
          is_tutorial: boolean
          mascot_id: string
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          origin_place_label: string | null
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
          travel_rules_snapshot: Json | null
          travel_slot_capacity: number
          travel_slots_used: number
          travel_weather_summary: Json | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_delivery_from_selection_legacy_postmark: {
        Args: {
          content_payload: Json
          correspondence_catalog_key: string
          friend_profile_id: string
          mascot_id: string
        }
        Returns: {
          animal_speed_kmh: number
          correspondence_option_id: string | null
          created_at: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          destination_place_label: string | null
          distance_km: number
          equipment_snapshot: Json
          id: string
          is_tutorial: boolean
          mascot_id: string
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          origin_place_label: string | null
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
          travel_rules_snapshot: Json | null
          travel_slot_capacity: number
          travel_slots_used: number
          travel_weather_summary: Json | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_profile_for_postal_friendship: { Args: never; Returns: string }
      current_profile_id: { Args: never; Returns: string }
      derive_mascot_travel_modifiers: {
        Args: {
          mascot_attributes: Json
          mascot_skills: Json
          mascot_trait: Json
          route_distance_km: number
        }
        Returns: Json
      }
      dispatch_postal_job: {
        Args: { target_offer_id: string }
        Returns: {
          animal_speed_kmh: number
          correspondence_option_id: string | null
          created_at: string
          destination_label_key: string
          destination_latitude: number
          destination_longitude: number
          destination_place_label: string | null
          distance_km: number
          equipment_snapshot: Json
          id: string
          is_tutorial: boolean
          mascot_id: string
          origin_label_key: string
          origin_latitude: number
          origin_longitude: number
          origin_place_label: string | null
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
          travel_rules_snapshot: Json | null
          travel_slot_capacity: number
          travel_slots_used: number
          travel_weather_summary: Json | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deliveries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_my_referral_invitation: {
        Args: never
        Returns: {
          link_id: string
          version: number
        }[]
      }
      generate_postal_friend_code: { Args: never; Returns: string }
      get_accepted_friend_profiles: {
        Args: never
        Returns: {
          city_latitude: number
          city_longitude: number
          display_name: string
          exchange_count: number
          favorite_note_key: string
          friendship_level: number
          postal_base_city: string
          postal_base_country: string
          postal_base_state: string
          profile_id: string
        }[]
      }
      get_delivery_progression_award: {
        Args: { delivery_id: string }
        Returns: Json
      }
      get_mascot_flight_state: { Args: { target_mascot_id: string }; Returns: Json }
      get_delivery_postmark_snapshot: {
        Args: { target_delivery_id: string }
        Returns: Json
      }
      get_mascot_skill_state: {
        Args: { target_mascot_id: string }
        Returns: Json
      }
      get_delivery_return_reply_context: {
        Args: { target_delivery_id: string }
        Returns: {
          delivery_id: string
          destination_label: string
          mascot_id: string
          mascot_name: string
          origin_label: string
          reply_confirmed: boolean
          reply_deadline: string
          sender_name: string
          sender_profile_id: string
        }[]
      }
      get_my_nest_city: {
        Args: never
        Returns: {
          label: string
        }[]
      }
      choose_mascot_individual_skill: {
        Args: { target_mascot_id: string; target_skill_id: string }
        Returns: undefined
      }
      resolve_soft_landing_migration: {
        Args: { target_mascot_id: string; target_skill_id: string }
        Returns: undefined
      }
      resolve_retired_urban_start_transfer: {
        Args: { target_mascot_id: string; target_skill_id: string }
        Returns: undefined
      }
      resolve_retired_water_path_transfer: {
        Args: { target_mascot_id: string; target_skill_id: string }
        Returns: undefined
      }
      preview_mascot_skill_modifiers: {
        Args: { target_mascot_id: string; destination_key: string; distance_km: number }
        Returns: Json
      }
      preview_mascot_flight: { Args: { target_mascot_id: string; target_profile_id: string }; Returns: Json }
      preview_origin_postmark: { Args: { target_delivery_id?: string }; Returns: Json }
      get_my_postal_friend_code: {
        Args: never
        Returns: {
          code: string
          created_at: string
          rotated_at: string
        }[]
      }
      get_my_referral_progress: { Args: never; Returns: Json }
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
          friend_id: string
          friend_name: string
          mascot_name: string
          origin_latitude: number
          origin_longitude: number
          origin_region: string
          outbound_arrival_at: string
          outbound_start_at: string
          portrait_asset_key: string
          return_arrival_at: string
          return_start_at: string
          species_key: string
          traffic_id: string
          visibility: string
        }[]
      }
      invoke_weather_travel_edge_function: { Args: never; Returns: number }
      is_asset_admin: { Args: never; Returns: boolean }
      json_translation_keys_are_official: {
        Args: { payload: Json }
        Returns: boolean
      }
      list_active_postal_visitors: {
        Args: never
        Returns: {
          correspondence_type: string
          delivery_id: string
          departs_at: string
          mascot_id: string
          mascot_name: string
          portrait_asset_key: string
          prestige_asset_key: string
        }[]
      }
      list_my_postal_connections: { Args: never; Returns: Json }
      list_owned_postcards: {
        Args: never
        Returns: {
          artwork_asset_key: string
          availability: string
          catalog_key: string
          description_key: string
          name_key: string
          quantity: number
        }[]
      }
      list_owned_stickers: {
        Args: never
        Returns: {
          artwork_asset_key: string
          catalog_key: string
          description_key: string
          name_key: string
          quantity: number
        }[]
      }
      list_received_correspondence: {
        Args: never
        Returns: {
          arrived_at: string
          correspondence_type: string
          delivery_id: string
          direction: string
          is_opened: boolean
          letter_text: string
          origin_label: string
          postcard_asset_key: string
          postcard_catalog_key: string
          postcard_message: string
          postcard_name_key: string
          postmark_city: string
          postmark_color: string
          postmark_country: string
          postmark_date: string
          postmark_key: string
          postmark_model: string
          return_reply_confirmed: boolean
          return_reply_deadline: string
          sender_name: string
          sender_profile_id: string
          stamp_asset_key: string
          sticker_asset_keys: string[]
          sticker_ids: string[]
        }[]
      }
      list_received_letters: {
        Args: never
        Returns: {
          arrived_at: string
          delivery_id: string
          letter_text: string
          origin_label: string
          postmark_key: string
          sender_name: string
          sender_profile_id: string
          stamp_asset_key: string
          stamp_kind: string
          stamp_name_key: string
        }[]
      }
      open_received_correspondence: {
        Args: { target_delivery_id: string; target_direction: string }
        Returns: {
          arrived_at: string
          correspondence_type: string
          delivery_id: string
          direction: string
          is_opened: boolean
          letter_text: string
          origin_label: string
          postcard_asset_key: string
          postcard_catalog_key: string
          postcard_message: string
          postcard_name_key: string
          postmark_city: string
          postmark_color: string
          postmark_country: string
          postmark_date: string
          postmark_key: string
          postmark_model: string
          return_reply_confirmed: boolean
          return_reply_deadline: string
          sender_name: string
          sender_profile_id: string
          stamp_asset_key: string
          sticker_asset_keys: string[]
          sticker_ids: string[]
        }[]
      }
      pending_weather_forecast_cells: {
        Args: { reference_time?: string }
        Returns: {
          block_start: string
          cell_latitude: number
          cell_longitude: number
        }[]
      }
      pending_weather_forecast_requests: {
        Args: { reference_time?: string }
        Returns: {
          block_start: string
          cached_is_day: boolean
          cached_source: string
          cached_temperature_c: number
          cached_weather_code: number
          cached_wind_gust_kmh: number
          cached_wind_speed_kmh: number
          cell_latitude: number
          cell_longitude: number
        }[]
      }
      postal_job_offer_payload: {
        Args: { target_mascot_id: string }
        Returns: Json
      }
      preview_mascot_loadout: {
        Args: {
          backpack_instance_id: string
          target_mascot_id: string
          utility_instance_id: string
          weather: Json
        } | {
          backpack_instance_id: string
          is_day?: boolean
          target_mascot_id: string
          utility_instance_id: string
          weather_category?: string
          wind_speed_kmh?: number
        }
        Returns: Json
      }
      progression_next_level_xp: {
        Args: { current_level: number; curve: string }
        Returns: number
      }
      provision_initial_mascot: { Args: never; Returns: Json }
      purchase_equipment: {
        Args: { request_id: string; target_catalog_key: string }
        Returns: Json
      }
      regenerate_my_postal_friend_code: {
        Args: never
        Returns: {
          code: string
          created_at: string
          rotated_at: string
        }[]
      }
      repair_equipment: {
        Args: { request_id: string; target_instance_id: string }
        Returns: Json
      }
      select_mascot_prestige_border: { Args: { target_mascot_id: string; target_border_catalog_key: string }; Returns: Json }
      replace_postal_job_offer: {
        Args: { target_mascot_id: string }
        Returns: Json
      }
      request_friendship_by_postal_code: {
        Args: { submitted_code: string }
        Returns: {
          outcome: string
          request_id: string
        }[]
      }
      resolve_delivery_route_segments: {
        Args: { at_time?: string; target_delivery_id: string }
        Returns: Json
      }
      resolve_delivery_visual_timezone: {
        Args: { delivery_id: string; latitude: number; longitude: number }
        Returns: string
      }
      resolve_due_delivery_route_segments: {
        Args: { reference_time?: string }
        Returns: number
      }
      resolve_live_delivery_daylight: {
        Args: { reference_time?: string }
        Returns: number
      }
      resolve_referral_invitation: {
        Args: { invitation_token: string }
        Returns: {
          inviter_name: string
        }[]
      }
      resolve_travel_progress: {
        Args: { reference_time?: string }
        Returns: number
      }
      respond_to_postal_friend_request: {
        Args: { friendship_id: string; should_accept: boolean }
        Returns: {
          accepted: boolean
          profile_id: string
        }[]
      }
      rotate_my_referral_invitation: {
        Args: never
        Returns: {
          link_id: string
          version: number
        }[]
      }
      save_initial_mascot_draft: {
        Args: { requested_mascot_name: string; template_id: string }
        Returns: {
          auth_user_id: string
          completed_at: string | null
          created_at: string
          display_name: string | null
          inaugural_postcard_hint_seen_at: string | null
          mascot_name: string | null
          selected_mascot_template_id: string | null
          stage: Database["public"]["Enums"]["onboarding_stage"]
          stage_version: number
          tutorial_collected_at: string | null
          tutorial_delivery_id: string | null
          tutorial_instruction_step:
            | Database["public"]["Enums"]["tutorial_instruction_step"]
            | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "account_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_nest_cities: {
        Args: { search_query: string }
        Returns: {
          id: string
          label: string
          latitude: number
          longitude: number
        }[]
      }
      set_mascot_loadout:
        | {
            Args: {
              backpack_instance_id: string
              expected_revision?: number
              target_mascot_id: string
              utility_instance_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              backpack_instance_id: string
              expected_revision: number
              request_id: string
              target_mascot_id: string
              utility_instance_id: string
            }
            Returns: Json
          }
      set_official_catalog_status: {
        Args: {
          entity_id: string
          entity_type: string
          next_status: Database["public"]["Enums"]["catalog_status"]
        }
        Returns: undefined
      }
      settle_arrived_sticker_transfers: {
        Args: { target_profile_id: string }
        Returns: undefined
      }
      start_or_resume_tutorial_delivery: { Args: never; Returns: Json }
      store_my_referral_invitation_digest: {
        Args: { digest_value: string; link_id: string; link_version: number }
        Returns: undefined
      }
      translation_key_is_official: {
        Args: { candidate: string }
        Returns: boolean
      }
      travel_effective_multiplier: {
        Args: {
          category: string
          is_day: boolean
          season: string
          wind_speed: number
        }
        Returns: number
      }
      travel_season: {
        Args: { at_time: string; latitude: number }
        Returns: string
      }
      travel_weather_category: {
        Args: { weather_code: number }
        Returns: string
      }
      virtual_travel_weather: {
        Args: {
          block_start: string
          delivery_id: string
          latitude: number
          leg: string
          longitude: number
          segment_index: number
        }
        Returns: Json
      }
    }
    Enums: {
      catalog_status: "draft" | "active" | "archived"
      correspondence_type: "letter" | "postcard" | "sticker" | "smallGift"
      delivery_status:
        | "available"
        | "preparing"
        | "outbound"
        | "delivered"
        | "returning"
        | "returned"
        | "completed"
      geonames_refresh_status: "queued" | "running" | "succeeded" | "failed"
      inventory_category: "equipment" | "stamps" | "keepsakes" | "routeMarks"
      official_asset_source: "packaged" | "storage"
      official_asset_type:
        | "mascotPortrait"
        | "equipmentIcon"
        | "rewardThumbnail"
        | "collectibleThumbnail"
        | "navigationIcon"
        | "mapControl"
        | "mapPin"
        | "currencyIcon"
        | "shopArtwork"
        | "texture"
        | "postalMark"
        | "postcardArtwork"
        | "nestArtwork"
      onboarding_stage:
        | "welcome"
        | "travel"
        | "discoveries"
        | "returnCollection"
        | "displayName"
        | "mascotChoice"
        | "tutorial"
        | "nestSetup"
        | "completed"
      reward_rarity: "common" | "uncommon" | "rare"
      tutorial_instruction_step:
        | "preparing"
        | "outbound"
        | "discovery"
        | "destination"
        | "returning"
        | "returned"
        | "collection"
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
      catalog_status: ["draft", "active", "archived"],
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
      geonames_refresh_status: ["queued", "running", "succeeded", "failed"],
      inventory_category: ["equipment", "stamps", "keepsakes", "routeMarks"],
      official_asset_source: ["packaged", "storage"],
      official_asset_type: [
        "mascotPortrait",
        "equipmentIcon",
        "rewardThumbnail",
        "collectibleThumbnail",
        "navigationIcon",
        "mapControl",
        "mapPin",
        "currencyIcon",
        "shopArtwork",
        "texture",
        "postalMark",
        "postcardArtwork",
        "nestArtwork",
      ],
      onboarding_stage: [
        "welcome",
        "travel",
        "discoveries",
        "returnCollection",
        "displayName",
        "mascotChoice",
        "tutorial",
        "nestSetup",
        "completed",
      ],
      reward_rarity: ["common", "uncommon", "rare"],
      tutorial_instruction_step: [
        "preparing",
        "outbound",
        "discovery",
        "destination",
        "returning",
        "returned",
        "collection",
      ],
    },
  },
} as const

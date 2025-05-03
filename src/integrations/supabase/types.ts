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
      achievements: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          duration_days: number
          goal: number
          id: string
          reward: string
          start_date: string | null
          type: string
        }
        Insert: {
          duration_days: number
          goal: number
          id?: string
          reward: string
          start_date?: string | null
          type: string
        }
        Update: {
          duration_days?: number
          goal?: number
          id?: string
          reward?: string
          start_date?: string | null
          type?: string
        }
        Relationships: []
      }
      crew_members: {
        Row: {
          crew_id: string | null
          id: string
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          crew_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          crew_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_mining_limits: {
        Row: {
          date: string
          id: string
          last_mining_session_id: string | null
          max_minutes: number | null
          minutes_mined: number | null
          user_id: string | null
        }
        Insert: {
          date: string
          id?: string
          last_mining_session_id?: string | null
          max_minutes?: number | null
          minutes_mined?: number | null
          user_id?: string | null
        }
        Update: {
          date?: string
          id?: string
          last_mining_session_id?: string | null
          max_minutes?: number | null
          minutes_mined?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_mining_limits_last_mining_session_id_fkey"
            columns: ["last_mining_session_id"]
            isOneToOne: false
            referencedRelation: "mining_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mining_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      epochs: {
        Row: {
          end_date: string
          id: number
          start_date: string
          status: string | null
        }
        Insert: {
          end_date: string
          id?: number
          start_date?: string
          status?: string | null
        }
        Update: {
          end_date?: string
          id?: number
          start_date?: string
          status?: string | null
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          epoch: number
          epoch_total_mined: number | null
          id: string
          rank: number | null
          user_id: string | null
        }
        Insert: {
          epoch: number
          epoch_total_mined?: number | null
          id?: string
          rank?: number | null
          user_id?: string | null
        }
        Update: {
          epoch?: number
          epoch_total_mined?: number | null
          id?: string
          rank?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_chapters: {
        Row: {
          content: string
          id: string
          title: string
          unlock_condition: string
        }
        Insert: {
          content: string
          id?: string
          title: string
          unlock_condition: string
        }
        Update: {
          content?: string
          id?: string
          title?: string
          unlock_condition?: string
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          base_rate: number
          earned_amount: number | null
          end_time: string | null
          id: string
          nft_boost_percent: number | null
          referral_bonus_percent: number | null
          start_time: string | null
          user_id: string | null
        }
        Insert: {
          base_rate: number
          earned_amount?: number | null
          end_time?: string | null
          id?: string
          nft_boost_percent?: number | null
          referral_bonus_percent?: number | null
          start_time?: string | null
          user_id?: string | null
        }
        Update: {
          base_rate?: number
          earned_amount?: number | null
          end_time?: string | null
          id?: string
          nft_boost_percent?: number | null
          referral_bonus_percent?: number | null
          start_time?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mining_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_boosts: {
        Row: {
          boost_percent: number
          id: string
          minted_at: string | null
          tier: Database["public"]["Enums"]["nft_tier"]
          user_id: string | null
        }
        Insert: {
          boost_percent: number
          id?: string
          minted_at?: string | null
          tier: Database["public"]["Enums"]["nft_tier"]
          user_id?: string | null
        }
        Update: {
          boost_percent?: number
          id?: string
          minted_at?: string | null
          tier?: Database["public"]["Enums"]["nft_tier"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_percent: number | null
          id: string
          referred_wallet: string
          referrer_id: string | null
          registered_at: string | null
        }
        Insert: {
          bonus_percent?: number | null
          id?: string
          referred_wallet: string
          referrer_id?: string | null
          registered_at?: string | null
        }
        Update: {
          bonus_percent?: number | null
          id?: string
          referred_wallet?: string
          referrer_id?: string | null
          registered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          current_streak_days: number | null
          id: string
          last_check_in: string | null
          user_id: string | null
        }
        Insert: {
          current_streak_days?: number | null
          id?: string
          last_check_in?: string | null
          user_id?: string | null
        }
        Update: {
          current_streak_days?: number | null
          id?: string
          last_check_in?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          id: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity: Database["public"]["Enums"]["activity_type"]
          created_at: string
          id: string
          metadata: Json | null
          user_id: string | null
          visible: boolean | null
        }
        Insert: {
          activity: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          visible?: boolean | null
        }
        Update: {
          activity?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string | null
          completed: boolean | null
          id: string
          progress: number | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed?: boolean | null
          id?: string
          progress?: number | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed?: boolean | null
          id?: string
          progress?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_weekly_challenges: {
        Row: {
          challenge_id: string | null
          completed: boolean | null
          completed_at: string | null
          id: string
          progress: number | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_weekly_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_weekly_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_stage: number | null
          experience: number | null
          id: string
          joined_at: string | null
          level: number | null
          next_level_exp: number | null
          total_mined: number | null
          wallet_address: string
        }
        Insert: {
          avatar_stage?: number | null
          experience?: number | null
          id?: string
          joined_at?: string | null
          level?: number | null
          next_level_exp?: number | null
          total_mined?: number | null
          wallet_address: string
        }
        Update: {
          avatar_stage?: number | null
          experience?: number | null
          id?: string
          joined_at?: string | null
          level?: number | null
          next_level_exp?: number | null
          total_mined?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          challenge_type: string
          description: string
          end_date: string
          goal: number
          id: string
          reward: number
          start_date: string | null
          title: string
        }
        Insert: {
          challenge_type: string
          description: string
          end_date: string
          goal: number
          id?: string
          reward: number
          start_date?: string | null
          title: string
        }
        Update: {
          challenge_type?: string
          description?: string
          end_date?: string
          goal?: number
          id?: string
          reward?: number
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_crew_total_mined: {
        Args: { crew_id: string }
        Returns: number
      }
      get_current_epoch_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      activity_type:
        | "wallet_connect"
        | "start_mining"
        | "stop_mining"
        | "join_crew"
        | "leave_crew"
        | "mint_nft"
        | "claim_reward"
      nft_tier: "bronze" | "silver" | "gold"
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
    Enums: {
      activity_type: [
        "wallet_connect",
        "start_mining",
        "stop_mining",
        "join_crew",
        "leave_crew",
        "mint_nft",
        "claim_reward",
      ],
      nft_tier: ["bronze", "silver", "gold"],
    },
  },
} as const

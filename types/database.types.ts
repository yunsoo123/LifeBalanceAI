export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      events: {
        Row: {
          all_day: boolean;
          color: string;
          completed_at: string | null;
          created_at: string;
          description: string | null;
          end_time: string;
          goal_id: string | null;
          id: string;
          priority: number;
          recurrence: string | null;
          schedule_id: string | null;
          start_time: string;
          title: string;
          updated_at: string;
          user_id: string;
          achievement_percent: number | null;
        };
        Insert: {
          all_day?: boolean;
          color?: string;
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          end_time: string;
          goal_id?: string | null;
          id?: string;
          priority?: number;
          recurrence?: string | null;
          schedule_id?: string | null;
          start_time: string;
          title: string;
          updated_at?: string;
          user_id: string;
          achievement_percent?: number | null;
        };
        Update: {
          all_day?: boolean;
          color?: string;
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          end_time?: string;
          goal_id?: string | null;
          id?: string;
          priority?: number;
          recurrence?: string | null;
          schedule_id?: string | null;
          start_time?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          achievement_percent?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'events_goal_id_fkey';
            columns: ['goal_id'];
            isOneToOne: false;
            referencedRelation: 'goals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_schedule_id_fkey';
            columns: ['schedule_id'];
            isOneToOne: false;
            referencedRelation: 'schedules';
            referencedColumns: ['id'];
          },
        ];
      };
      goals: {
        Row: {
          created_at: string;
          description: string | null;
          hours_per_week: number | null;
          id: string;
          optimal_time: Database['public']['Enums']['optimal_time'] | null;
          priority: number | null;
          status: Database['public']['Enums']['goal_status'];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          hours_per_week?: number | null;
          id?: string;
          optimal_time?: Database['public']['Enums']['optimal_time'] | null;
          priority?: number | null;
          status?: Database['public']['Enums']['goal_status'];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          hours_per_week?: number | null;
          id?: string;
          optimal_time?: Database['public']['Enums']['optimal_time'] | null;
          priority?: number | null;
          status?: Database['public']['Enums']['goal_status'];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          content: string;
          created_at: string;
          event_id: string | null;
          id: string;
          tags: string[] | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          event_id?: string | null;
          id?: string;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          event_id?: string | null;
          id?: string;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          ai_calls_this_month: number;
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          subscription_status: Database['public']['Enums']['subscription_status'];
          subscription_tier: Database['public']['Enums']['subscription_tier'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_calls_this_month?: number;
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          subscription_status?: Database['public']['Enums']['subscription_status'];
          subscription_tier?: Database['public']['Enums']['subscription_tier'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_calls_this_month?: number;
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          subscription_status?: Database['public']['Enums']['subscription_status'];
          subscription_tier?: Database['public']['Enums']['subscription_tier'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      schedules: {
        Row: {
          activities_json: Json;
          created_at: string;
          feasible: boolean;
          id: string;
          suggestions: string[] | null;
          total_hours: number;
          user_id: string;
          week_start_date: string;
        };
        Insert: {
          activities_json: Json;
          created_at?: string;
          feasible?: boolean;
          id?: string;
          suggestions?: string[] | null;
          total_hours: number;
          user_id: string;
          week_start_date: string;
        };
        Update: {
          activities_json?: Json;
          created_at?: string;
          feasible?: boolean;
          id?: string;
          suggestions?: string[] | null;
          total_hours?: number;
          user_id?: string;
          week_start_date?: string;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          completed: boolean;
          due_date: string | null;
          event_id: string | null;
          created_at: string;
          updated_at: string;
          category: string | null;
          recurrence: string | null;
          recurrence_weekday: number | null;
          achievement_percent: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          completed?: boolean;
          due_date?: string | null;
          event_id?: string | null;
          created_at?: string;
          updated_at?: string;
          category?: string | null;
          recurrence?: string | null;
          recurrence_weekday?: number | null;
          achievement_percent?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          completed?: boolean;
          due_date?: string | null;
          event_id?: string | null;
          created_at?: string;
          updated_at?: string;
          category?: string | null;
          recurrence?: string | null;
          recurrence_weekday?: number | null;
          achievement_percent?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'todos_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      weekly_reviews: {
        Row: {
          completed_hours: Json;
          created_at: string;
          id: string;
          suggestions: string[] | null;
          summary_text: string;
          user_id: string;
          week_end_date: string;
          week_start_date: string;
        };
        Insert: {
          completed_hours: Json;
          created_at?: string;
          id?: string;
          suggestions?: string[] | null;
          summary_text: string;
          user_id: string;
          week_end_date: string;
          week_start_date: string;
        };
        Update: {
          completed_hours?: Json;
          created_at?: string;
          id?: string;
          suggestions?: string[] | null;
          summary_text?: string;
          user_id?: string;
          week_end_date?: string;
          week_start_date?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      goal_status: 'active' | 'paused' | 'completed';
      optimal_time: 'morning' | 'afternoon' | 'evening' | 'flexible';
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
      subscription_tier: 'free' | 'pro' | 'teams';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      goal_status: ['active', 'paused', 'completed'],
      optimal_time: ['morning', 'afternoon', 'evening', 'flexible'],
      subscription_status: ['active', 'canceled', 'past_due', 'trialing'],
      subscription_tier: ['free', 'pro', 'teams'],
    },
  },
} as const;

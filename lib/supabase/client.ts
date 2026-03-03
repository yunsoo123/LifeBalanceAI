import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

/** 웹에서는 window 미정의(SSR/번들) 시 localStorage 접근을 피해 "window is not defined" 방지 */
const authStorage =
  Platform.OS === 'web'
    ? {
        getItem: async (key: string): Promise<string | null> => {
          if (typeof window === 'undefined') return null;
          try {
            return window.localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: async (key: string, value: string): Promise<void> => {
          if (typeof window === 'undefined') return;
          try {
            window.localStorage.setItem(key, value);
          } catch {
            /* ignore */
          }
        },
        removeItem: async (key: string): Promise<void> => {
          if (typeof window === 'undefined') return;
          try {
            window.localStorage.removeItem(key);
          } catch {
            /* ignore */
          }
        },
      }
    : AsyncStorage;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type-safe table access
export const tables = {
  profiles: () => supabase.from('profiles'),
  goals: () => supabase.from('goals'),
  schedules: () => supabase.from('schedules'),
  events: () => supabase.from('events'),
  notes: () => supabase.from('notes'),
  todos: () => supabase.from('todos'),
  weeklyReviews: () => supabase.from('weekly_reviews'),
};

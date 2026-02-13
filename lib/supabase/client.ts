import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
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
  weeklyReviews: () => supabase.from('weekly_reviews'),
};

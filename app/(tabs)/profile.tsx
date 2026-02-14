import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/lib/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.replace('/sign-in');
    } catch {
      Alert.alert('Error', 'Could not sign out.');
    }
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : '?';

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top', 'bottom']}>
      <ScrollView className="flex-1">
        <View className="p-4">
          <Card variant="default" padding="lg" className="mb-6">
            <View className="items-center">
              <Avatar fallback={initials} size="xl" />
              <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
                {email ? email.split('@')[0] : 'Guest'}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-3">
                {email ?? 'Not signed in'}
              </Text>
              <Badge variant="info" size="md">
                Free
              </Badge>
            </View>
          </Card>

          {/* Settings Sections */}
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Settings
          </Text>

          <Card variant="default" padding="md" className="mb-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Dark Mode
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
              />
            </View>
          </Card>

          {/* Account */}
          <Card variant="default" padding="md" className="mb-3">
            <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              Subscription
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Pro Plan - $9.99/month
            </Text>
            <Button variant="ghost" size="sm">
              Manage Subscription
            </Button>
          </Card>

          {/* AI Usage */}
          <Card variant="default" padding="md" className="mb-6">
            <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
              AI Usage This Month
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 dark:text-gray-400">Schedules Generated</Text>
              <Text className="font-semibold text-gray-900 dark:text-gray-100">12 / ∞</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Notes Parsed</Text>
              <Text className="font-semibold text-gray-900 dark:text-gray-100">45 / ∞</Text>
            </View>
          </Card>

          <Button
            variant="danger"
            size="lg"
            fullWidth
            onPress={handleSignOut}
            disabled={loading}
            accessibilityLabel="Sign out"
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

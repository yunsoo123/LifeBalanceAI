import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Card, Avatar, Badge, Button } from '@/components/ui';

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950">
      <View className="p-4">
        {/* Profile Header */}
        <Card variant="default" padding="lg" className="mb-6">
          <View className="items-center">
            <Avatar fallback="JD" size="xl" />
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
              John Doe
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-3">
              john@example.com
            </Text>
            <Badge variant="info" size="md">
              Mendly Pro
            </Badge>
          </View>
        </Card>

        {/* Settings Sections */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Settings
        </Text>

        {/* Appearance */}
        <Card variant="default" padding="md" className="mb-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                Dark Mode
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Toggle dark theme
              </Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
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

        {/* Logout */}
        <Button variant="danger" size="lg" fullWidth>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

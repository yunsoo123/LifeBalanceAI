import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Badge, Button } from '@/components/ui';

export default function ReviewScreen() {
  const mockKPIs = [
    { goal: 'App Dev', planned: 15, actual: 12, percentage: 80, status: 'warning' as const },
    { goal: 'School', planned: 20, actual: 18, percentage: 90, status: 'success' as const },
    { goal: 'Poker', planned: 10, actual: 11, percentage: 110, status: 'success' as const },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Weekly Review
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400">
            Feb 12 - Feb 18, 2025
          </Text>
        </View>

        {/* Summary Card */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Weekly Summary
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600 dark:text-gray-400">Total Planned</Text>
            <Text className="font-semibold text-gray-900 dark:text-gray-100">45 hours</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600 dark:text-gray-400">Total Completed</Text>
            <Text className="font-semibold text-gray-900 dark:text-gray-100">41 hours</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Completion Rate</Text>
            <Badge variant="success" size="md">
              91%
            </Badge>
          </View>
        </Card>

        {/* KPI Table */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Goal Breakdown
        </Text>

        {mockKPIs.map((kpi, i) => (
          <Card key={i} variant="default" padding="md" className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {kpi.goal}
              </Text>
              <Badge variant={kpi.status} size="sm">
                {kpi.percentage}%
              </Badge>
            </View>
            <View className="flex-row justify-between text-sm">
              <Text className="text-gray-600 dark:text-gray-400">
                Planned: {kpi.planned}h
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">
                Actual: {kpi.actual}h
              </Text>
            </View>
          </Card>
        ))}

        {/* AI Suggestions */}
        <Card variant="default" padding="lg" className="mt-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            ✨ AI Suggestions
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-2">
            • Consider reducing poker time by 1-2 hours to focus more on app development
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-2">
            • You're most productive on App Dev during afternoons (14:00-16:00)
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            • Great consistency this week! Keep up the momentum 🎉
          </Text>
        </Card>

        {/* Action Button */}
        <Button variant="primary" size="lg" fullWidth className="mt-6">
          Apply Suggestions
        </Button>
      </View>
    </ScrollView>
  );
}

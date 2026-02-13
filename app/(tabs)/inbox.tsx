import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Button, Card } from '@/components/ui';

export default function InboxScreen() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Inbox
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400">
            Dump your thoughts freely. Mendly will organize them later.
          </Text>
        </View>

        {/* Brain Dump Input */}
        <Card variant="default" padding="md" className="mb-4">
          <TextInput
            placeholder="Type or speak your goals, tasks, thoughts..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={10}
            className="text-base text-gray-900 dark:text-gray-100 min-h-[200px]"
            textAlignVertical="top"
          />
        </Card>

        {/* Actions */}
        <View className="flex-row gap-3 mb-6">
          <Button variant="primary" size="md" className="flex-1">
            🎤 Voice Input
          </Button>
          <Button variant="secondary" size="md" className="flex-1">
            ✨ Structure This
          </Button>
        </View>

        {/* Recent Entries */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Recent Entries
        </Text>

        <Card variant="default" padding="md" className="mb-3">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            2 hours ago
          </Text>
          <Text className="text-base text-gray-900 dark:text-gray-100">
            I want to build an AI app, play poker, and keep up with school...
          </Text>
        </Card>

        <Card variant="default" padding="md">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Yesterday
          </Text>
          <Text className="text-base text-gray-900 dark:text-gray-100">
            Need to practice coding and study for midterms...
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

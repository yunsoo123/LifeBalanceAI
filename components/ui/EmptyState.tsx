import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps extends ViewProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  ...viewProps
}: EmptyStateProps) {
  return (
    <View
      {...viewProps}
      className={`flex-1 items-center justify-center px-6 py-12 ${className}`}
    >
      {icon && <View className="mb-4 opacity-40">{icon}</View>}
      <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
          {description}
        </Text>
      )}
      {action && (
        <Button variant="primary" size="md" onPress={action.onPress}>
          {action.label}
        </Button>
      )}
    </View>
  );
}

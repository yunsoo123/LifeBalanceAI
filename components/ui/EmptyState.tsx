import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { Button } from './Button';
import { useTheme } from '@/lib/ThemeContext';
import { colors } from '@/lib/design-system';

interface EmptyStateProps extends ViewProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
  /** Schedule 등 다크 배경 화면에서 밝은 글씨 강제 (웹 다크 가독성) */
  dark?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  dark: darkProp = false,
  className = '',
  ...viewProps
}: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = darkProp || theme === 'dark';
  const titleColor = isDark ? colors.text.primary : undefined;
  const descColor = isDark ? colors.text.secondary : undefined;
  return (
    <View {...viewProps} className={`flex-1 items-center justify-center px-8 py-14 ${className}`}>
      {icon && <View className="mb-6 opacity-90">{icon}</View>}
      <Text
        className="text-[17px] font-semibold text-center mb-2 text-gray-900 dark:text-gray-100"
        style={titleColor ? { color: titleColor } : undefined}
      >
        {title}
      </Text>
      {description && (
        <Text
          className="text-[15px] text-center mb-8 max-w-[280px] leading-relaxed text-gray-500 dark:text-gray-400"
          style={descColor ? { color: descColor } : undefined}
        >
          {description}
        </Text>
      )}
      {action && (
        <Button
          variant="primary"
          size="lg"
          onPress={action.onPress}
          accessibilityLabel={action.label}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
}

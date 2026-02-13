import React from 'react';
import { ActivityIndicator, View, Text, type ViewProps } from 'react-native';
import { colors } from '@/lib/design-system';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps extends ViewProps {
  size?: SpinnerSize;
  text?: string;
  fullScreen?: boolean;
}

export function Spinner({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
  ...viewProps
}: SpinnerProps) {
  const sizeMap: Record<SpinnerSize, 'small' | 'large'> = {
    sm: 'small',
    md: 'large',
    lg: 'large',
  };

  const Container = fullScreen
    ? ({ children }: { children: React.ReactNode }) => (
        <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
          {children}
        </View>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <View className={`items-center justify-center ${className}`} {...viewProps}>
          {children}
        </View>
      );

  return (
    <Container>
      <ActivityIndicator size={sizeMap[size]} color={colors.brand.primary} />
      {text && (
        <Text className="text-gray-600 dark:text-gray-400 text-sm mt-2">{text}</Text>
      )}
    </Container>
  );
}

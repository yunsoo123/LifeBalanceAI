import React from 'react';
import { View, Text, type ViewProps } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...viewProps
}: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 dark:bg-gray-800',
    success: 'bg-success-light/20 dark:bg-success-dark/20',
    warning: 'bg-warning-light/20 dark:bg-warning-dark/20',
    error: 'bg-error-light/20 dark:bg-error-dark/20',
    info: 'bg-info-light/20 dark:bg-info-dark/20',
  };

  const textColorClasses: Record<BadgeVariant, string> = {
    default: 'text-gray-700 dark:text-gray-300',
    success: 'text-success-dark dark:text-success-light',
    warning: 'text-warning-dark dark:text-warning-light',
    error: 'text-error-dark dark:text-error-light',
    info: 'text-info-dark dark:text-info-light',
  };

  const sizeClasses: Record<BadgeSize, { container: string; text: string }> = {
    sm: { container: 'px-2 py-0.5', text: 'text-xs' },
    md: { container: 'px-2.5 py-1', text: 'text-sm' },
    lg: { container: 'px-3 py-1.5', text: 'text-base' },
  };

  return (
    <View
      {...viewProps}
      className={`
        rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size].container}
        ${className}
      `}
    >
      <Text
        className={`
          ${sizeClasses[size].text}
          ${textColorClasses[variant]}
          font-medium
        `}
      >
        {children}
      </Text>
    </View>
  );
}

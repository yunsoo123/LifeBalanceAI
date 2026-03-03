import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { colors } from '@/lib/design-system';

export type MetricCardVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface MetricCardProps extends ViewProps {
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: MetricCardVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantBorder: Record<MetricCardVariant, string> = {
  default: 'border-gray-200 dark:border-zinc-700',
  success: 'border-emerald-200 dark:border-emerald-800',
  warning: 'border-amber-200 dark:border-amber-800',
  error: 'border-red-200 dark:border-red-800',
  info: 'border-blue-200 dark:border-blue-800',
};

const variantBg: Record<MetricCardVariant, string> = {
  default: 'bg-white dark:bg-zinc-900',
  success: 'bg-emerald-50/50 dark:bg-emerald-950/30',
  warning: 'bg-amber-50/50 dark:bg-amber-950/30',
  error: 'bg-red-50/50 dark:bg-red-950/30',
  info: 'bg-blue-50/50 dark:bg-blue-950/30',
};

export function MetricCard({
  label,
  value,
  sublabel,
  variant = 'default',
  children,
  className = '',
  ...viewProps
}: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const labelColor = isDark ? colors.text.secondary : colors.gray[500];
  const valueColor = isDark ? colors.text.primary : colors.gray[900];
  const sublabelColor = isDark ? colors.text.tertiary : colors.gray[500];
  return (
    <View
      className={`rounded-2xl border p-4 ${variantBg[variant]} ${variantBorder[variant]} ${className}`}
      {...viewProps}
    >
      <Text className="text-[13px] font-medium mb-0.5" style={{ color: labelColor }}>
        {label}
      </Text>
      <Text className="text-xl font-bold" style={{ color: valueColor }}>
        {value}
      </Text>
      {sublabel ? (
        <Text className="text-[13px] mt-0.5" style={{ color: sublabelColor }}>
          {sublabel}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { colors } from '@/lib/design-system';

type Variant = 'safe' | 'risk' | 'pending';

interface RealityCheckBadgeProps {
  variant: Variant;
  lang?: 'ko' | 'en';
  className?: string;
}

const COPY: Record<Variant, { ko: string; en: string }> = {
  safe: { ko: '번아웃 위험 없음', en: 'No burnout risk' },
  risk: { ko: '번아웃 위험', en: 'Burnout risk' },
  pending: { ko: '검증 대기', en: 'Pending check' },
};

export function RealityCheckBadge({
  variant,
  lang = 'ko',
  className = '',
}: RealityCheckBadgeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const text = lang === 'ko' ? COPY[variant].ko : COPY[variant].en;
  const isSafe = variant === 'safe';
  const isRisk = variant === 'risk';
  const titleText = lang === 'ko' ? '현실성 검증' : 'Reality Check';
  const bg = isDark ? 'rgba(26, 27, 46, 0.9)' : colors.gray[100];
  const border = isDark ? 'rgba(63, 63, 70, 0.5)' : colors.gray[300];
  const titleColor = isDark ? colors.gray[400] : colors.gray[600];
  const statusColor = isSafe
    ? colors.success.light
    : isRisk
      ? colors.warning.DEFAULT
      : colors.gray[500];
  return (
    <View
      className={`rounded-xl px-4 py-3 self-end min-h-[44px] justify-center ${className}`}
      style={{ backgroundColor: bg, borderWidth: 1, borderColor: border }}
      accessibilityLabel={`${titleText}: ${text}`}
      accessible
    >
      <Text className="text-[13px] mb-1" style={{ color: titleColor }}>
        {titleText}
      </Text>
      <View className="flex-row items-center gap-2">
        {isSafe && (
          <View className="w-5 h-5 rounded-full bg-emerald-500 items-center justify-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}
        <Text className="text-[15px] font-semibold" style={{ color: statusColor }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

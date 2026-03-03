import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { colors } from '@/lib/design-system';

/** 스케줄 생성 완료 카드 (112h/168h, Safe, 여유 시간, CTA) — 테마·토큰 반영 */
export function ResultCard({
  totalHours,
  totalMax = 168,
  safe = true,
  freeHours,
  onAddToCalendar,
  addToCalendarLoading = false,
  className = '',
}: {
  totalHours: number;
  totalMax?: number;
  safe?: boolean;
  freeHours?: number;
  onAddToCalendar?: () => void;
  addToCalendarLoading?: boolean;
  className?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pct = totalMax > 0 ? Math.min(100, (totalHours / totalMax) * 100) : 0;
  const cardBg = isDark ? colors.surface.resultCard : colors.surface.resultCardLight;
  const borderColor = isDark ? 'rgba(63,63,70,0.6)' : colors.gray[200];
  const textPrimary = isDark ? '#ffffff' : colors.gray[900];
  const textSecondary = isDark ? '#f3f4f6' : colors.gray[700];
  const textMuted = colors.gray[500];
  const barTrack = isDark ? '#52525b' : colors.gray[300];
  const safeColor = safe ? colors.success.light : colors.warning.DEFAULT;
  return (
    <View
      className={`rounded-2xl border p-5 ${className}`}
      style={{
        backgroundColor: cardBg,
        borderColor,
        borderRadius: 20,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
          <Text className="text-lg font-bold" style={{ color: textPrimary }}>
            스케줄 생성 완료!
          </Text>
        </View>
        <Text className="text-sm font-semibold" style={{ color: safeColor }}>
          {safe ? 'Safe ✅' : 'Check ⚠️'}
        </Text>
      </View>
      <Text className="text-base font-semibold mb-2" style={{ color: textSecondary }}>
        활동 시간 분석
      </Text>
      <View className="flex-row items-baseline gap-1 mb-2">
        <Text className="text-3xl font-bold" style={{ color: textPrimary }}>
          {totalHours}h
        </Text>
        <Text className="text-base" style={{ color: textMuted }}>
          / {totalMax}h Total
        </Text>
      </View>
      <View className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: barTrack }}>
        <View className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </View>
      {freeHours != null && freeHours >= 0 && (
        <Text className="text-[14px] mb-4" style={{ color: textMuted }}>
          여유 시간 {freeHours}시간이 확보되었습니다.
        </Text>
      )}
      {onAddToCalendar && (
        <Pressable
          onPress={onAddToCalendar}
          disabled={addToCalendarLoading}
          className="w-full min-h-[48px] rounded-2xl flex-row justify-center items-center disabled:opacity-50 mt-2"
          style={{ backgroundColor: colors.brand.primary, height: 48 }}
          accessibilityLabel="캘린더에 등록하기"
          accessibilityRole="button"
        >
          <Text className="text-base font-semibold text-white">
            {addToCalendarLoading ? '등록 중...' : '캘린더에 등록하기'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

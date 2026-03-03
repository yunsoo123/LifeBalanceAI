import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18n';
import { CONTENT_MAX_WIDTH } from '@/lib/layoutConstants';
import { colors, getSurface, fontFamily, borderRadius, spacing } from '@/lib/design-system';

export default function GuideScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getSurface('screen', theme) }}
      className="flex-1"
      edges={['top', 'bottom']}
    >
      {/* Phase 2-4: 헤더 — design-system */}
      <View
        className="px-4 pt-3 pb-4 border-b flex-row items-center"
        style={{
          borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
          backgroundColor: getSurface('card', theme),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="min-h-[48px] min-w-[48px] items-center justify-center -ml-2"
          accessibilityLabel={t.guide.back}
        >
          <Text
            className="text-base font-semibold"
            style={{
              color: isDark ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.medium,
            }}
          >
            ← {t.guide.back}
          </Text>
        </Pressable>
        <Text
          className="flex-1 text-center mr-10 text-xl font-bold"
          numberOfLines={1}
          style={{
            color: isDark ? colors.text.primary : colors.text.primaryLight,
            fontFamily: fontFamily.bold,
          }}
        >
          {t.guide.title}
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          width: '100%',
          padding: spacing.lg,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-base font-semibold mb-2"
            style={{
              color: isDark ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.medium,
            }}
          >
            {t.guide.inboxTitle}
          </Text>
          <Text
            className="text-[15px] leading-relaxed"
            style={{
              color: isDark ? colors.text.secondary : colors.text.secondaryLight,
              fontFamily: fontFamily.regular,
            }}
          >
            {t.guide.inboxBody}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-base font-semibold mb-2"
            style={{
              color: isDark ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.medium,
            }}
          >
            {t.guide.scheduleTitle}
          </Text>
          <Text
            className="text-[15px] leading-relaxed"
            style={{
              color: isDark ? colors.text.secondary : colors.text.secondaryLight,
              fontFamily: fontFamily.regular,
            }}
          >
            {t.guide.scheduleBody}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-base font-semibold mb-2"
            style={{
              color: isDark ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.medium,
            }}
          >
            {t.guide.calendarTitle}
          </Text>
          <Text
            className="text-[15px] leading-relaxed"
            style={{
              color: isDark ? colors.text.secondary : colors.text.secondaryLight,
              fontFamily: fontFamily.regular,
            }}
          >
            {t.guide.calendarBody}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-base font-semibold mb-2"
            style={{
              color: isDark ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.medium,
            }}
          >
            {t.guide.notesTitle}
          </Text>
          <Text
            className="text-[15px] leading-relaxed"
            style={{
              color: isDark ? colors.text.secondary : colors.text.secondaryLight,
              fontFamily: fontFamily.regular,
            }}
          >
            {t.guide.notesBody}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-base font-semibold mb-2"
            style={{
              color: isDark ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.medium,
            }}
          >
            {t.guide.reviewTitle}
          </Text>
          <Text
            className="text-[15px] leading-relaxed"
            style={{
              color: isDark ? colors.text.secondary : colors.text.secondaryLight,
              fontFamily: fontFamily.regular,
            }}
          >
            {t.guide.reviewBody}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

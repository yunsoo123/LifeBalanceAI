import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  colors,
  getSurface,
  getBrand,
  fontFamily,
  typography,
  spacing,
  borderRadius,
} from '@/lib/design-system';
import { useTheme } from '@/lib/ThemeContext';
import { setOnboardingDone } from '@/lib/onboardingStorage';
import { useI18n } from '@/lib/i18n';

const slides = [
  {
    emoji: '\u{1F4ED}',
    accent: 'bg-blue-50 dark:bg-blue-950',
    accentText: 'text-blue-600 dark:text-blue-400',
    ring: 'border-blue-100 dark:border-blue-900',
  },
  {
    emoji: '\u{1F916}',
    accent: 'bg-emerald-50 dark:bg-emerald-950',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    ring: 'border-emerald-100 dark:border-emerald-900',
  },
  {
    emoji: '\u{1F4C5}',
    accent: 'bg-amber-50 dark:bg-amber-950',
    accentText: 'text-amber-600 dark:text-amber-400',
    ring: 'border-amber-100 dark:border-amber-900',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const isLast = current === slides.length - 1;
  const isDark = theme === 'dark';

  const subtitles = [
    t.onboarding.slide1Subtitle,
    t.onboarding.slide2Subtitle,
    t.onboarding.slide3Subtitle,
  ];
  const titles = [t.onboarding.slide1Title, t.onboarding.slide2Title, t.onboarding.slide3Title];
  const descriptions = [
    t.onboarding.slide1Description,
    t.onboarding.slide2Description,
    t.onboarding.slide3Description,
  ];

  const next = useCallback(() => {
    if (!isLast) setCurrent((p) => p + 1);
  }, [isLast]);

  const prev = useCallback(() => {
    if (current > 0) setCurrent((p) => p - 1);
  }, [current]);

  const handleStart = useCallback(async () => {
    await setOnboardingDone();
    router.replace('/(tabs)/capture');
  }, [router]);

  const slide = slides[current];
  const subtitle = subtitles[current];
  const title = titles[current];
  const description = descriptions[current];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: getSurface('screen', theme),
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
      }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 375,
          backgroundColor: getSurface('card', theme),
          borderWidth: 1,
          borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
          borderRadius: borderRadius.xl,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
          }}
        >
          {!isLast ? (
            <Pressable
              onPress={() => setCurrent(slides.length - 1)}
              accessibilityLabel={t.onboarding.skip}
              accessibilityRole="button"
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.small,
                  fontFamily: fontFamily.medium,
                  color: isDark ? colors.text.tertiary : colors.text.secondaryLight,
                }}
              >
                {t.onboarding.skip}
              </Text>
            </Pressable>
          ) : (
            <View style={{ height: 20 }} />
          )}
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.xl,
          }}
        >
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: borderRadius['2xl'],
              borderWidth: 4,
              borderColor: isDark ? colors.border.medium : colors.border.subtleLight,
              backgroundColor: isDark ? colors.surface.cardElevated : colors.surface.subtleLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xl,
            }}
          >
            <Text style={{ fontSize: 56 }}>{slide.emoji}</Text>
          </View>

          <View
            style={{
              marginBottom: spacing.md,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: borderRadius.full,
              backgroundColor: getBrand('primaryMuted', theme),
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.caption,
                fontFamily: fontFamily.bold,
                color: getBrand('primary', theme),
              }}
            >
              {subtitle}
            </Text>
          </View>

          <Text
            style={{
              marginBottom: spacing.md,
              fontSize: typography.fontSize.title,
              lineHeight: typography.lineHeight.title,
              fontFamily: fontFamily.bold,
              color: isDark ? colors.text.primary : colors.text.primaryLight,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: typography.fontSize.body,
              lineHeight: typography.lineHeight.body,
              fontFamily: fontFamily.regular,
              color: isDark ? colors.text.secondary : colors.text.secondaryLight,
              textAlign: 'center',
            }}
          >
            {description}
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              marginBottom: spacing.xl,
            }}
          >
            {slides.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => setCurrent(i)}
                accessibilityLabel={t.onboarding.goToSlide.replace('{n}', String(i + 1))}
                accessibilityRole="button"
                style={{
                  width: i === current ? 28 : 5,
                  height: 5,
                  borderRadius: borderRadius.full,
                  backgroundColor:
                    i === current
                      ? getBrand('primary', theme)
                      : isDark
                        ? colors.gray[600]
                        : colors.gray[300],
                }}
              />
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {current > 0 && (
              <Pressable
                onPress={prev}
                accessibilityLabel={t.onboarding.previousSlide}
                accessibilityRole="button"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1,
                  borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
                  backgroundColor: getSurface('card', theme),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.title,
                    color: isDark ? colors.text.secondary : colors.text.secondaryLight,
                  }}
                >
                  ‹
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={isLast ? handleStart : next}
              accessibilityLabel={isLast ? t.onboarding.start : t.onboarding.next}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 52,
                borderRadius: borderRadius.lg,
                backgroundColor: getBrand('primary', theme),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                ...(isDark
                  ? {}
                  : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 2,
                    }),
              }}
            >
              {isLast ? (
                <>
                  <Text
                    style={{
                      fontSize: typography.fontSize.body,
                      fontFamily: fontFamily.bold,
                      color: colors.text.inverse,
                    }}
                  >
                    {t.onboarding.start}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.fontSize.body,
                      fontFamily: fontFamily.bold,
                      color: colors.text.inverse,
                    }}
                  >
                    →
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    fontSize: typography.fontSize.body,
                    fontFamily: fontFamily.bold,
                    color: colors.text.inverse,
                  }}
                >
                  {t.onboarding.next}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: spacing.md }}>
          <View
            style={{
              width: 134,
              height: 5,
              borderRadius: borderRadius.full,
              backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

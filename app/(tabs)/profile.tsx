import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar, Badge, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/lib/ThemeContext';
import { getUsage } from '@/lib/usageLimits';
import { useSubscription } from '@/lib/useSubscription';
import { useI18n } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import { CONTENT_MAX_WIDTH, LAYOUT } from '@/lib/layoutConstants';
import { colors, getSurface, fontFamily, borderRadius, spacing } from '@/lib/design-system';

type UsageKind = 'schedules' | 'parses' | 'insights';

function UsageCount({ kind }: { kind: UsageKind }) {
  const [text, setText] = useState<string>('— / —');
  const { theme } = useTheme();
  useEffect(() => {
    getUsage(kind).then(({ count, limit }) => setText(`${count} / ${limit}`));
  }, [kind]);
  return (
    <Text
      className="text-base font-semibold"
      style={{
        color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
        fontFamily: fontFamily.medium,
      }}
    >
      {text}
    </Text>
  );
}

const ROW_CLASS = 'flex-row justify-between items-center py-4';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { isPro, purchasing, restoring, purchasePro, restore } = useSubscription();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.replace('/sign-in');
    } catch {
      Alert.alert(t.common.error, 'Could not sign out.');
    }
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : '?';
  const displayName = email ? email.split('@')[0] : 'Guest';

  const greeting = lang === 'ko' ? `안녕하세요, ${displayName}님` : `Hello, ${displayName}`;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getSurface('screen', theme) }}
      className={`flex-1 ${LAYOUT.screenBg}`}
      edges={['top', 'bottom']}
    >
      {/* Phase 2-3: 상단 배너 카드 — design-system */}
      <View
        className="px-6 pt-6 pb-8"
        style={{
          backgroundColor: theme === 'dark' ? colors.surface.card : colors.brand.primary,
        }}
      >
        <View className="flex-row items-center gap-4">
          <View className="overflow-hidden rounded-full border-2 border-white/30">
            <Avatar fallback={initials} size="xl" />
          </View>
          <View className="flex-1">
            <Text
              className="text-lg font-bold text-white"
              style={{ fontFamily: fontFamily.bold }}
              numberOfLines={1}
            >
              {greeting}
            </Text>
            <Text
              className="text-sm text-white/80 mt-0.5"
              style={{ fontFamily: fontFamily.regular }}
              numberOfLines={1}
            >
              {email ?? (lang === 'ko' ? '로그인하지 않음' : 'Not signed in')}
            </Text>
            <Badge variant={isPro ? 'success' : 'info'} size="sm" className="mt-2 self-start">
              {isPro ? t.profile.pro : t.profile.free}
            </Badge>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          width: '100%',
          paddingHorizontal: spacing.lg,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text
            className="text-[12px] font-semibold uppercase tracking-wide"
            style={{
              color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
              fontFamily: fontFamily.medium,
            }}
          >
            Settings
          </Text>
          <Text
            className="text-xl font-bold mt-0.5"
            style={{
              color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.bold,
            }}
          >
            {t.profile.title}
          </Text>
        </View>

        {/* 다크 모드 */}
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <View className={`${ROW_CLASS} border-b-0`}>
            <View>
              <Text
                className="text-lg font-bold"
                style={{
                  color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                  fontFamily: fontFamily.bold,
                }}
              >
                {t.profile.darkMode}
              </Text>
              <Text
                className="text-[13px] mt-0.5"
                style={{
                  color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                  fontFamily: fontFamily.regular,
                }}
              >
                {theme === 'dark'
                  ? lang === 'ko'
                    ? '켜짐'
                    : 'On'
                  : lang === 'ko'
                    ? '꺼짐'
                    : 'Off'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
            />
          </View>
        </View>

        {/* 언어 */}
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{
              color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.bold,
            }}
          >
            {t.profile.language}
          </Text>
          <View className="flex flex-row gap-2">
            <Button
              variant={lang === 'ko' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setLang('ko' as Lang)}
            >
              {t.profile.langKo}
            </Button>
            <Button
              variant={lang === 'en' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setLang('en' as Lang)}
            >
              {t.profile.langEn}
            </Button>
          </View>
        </View>

        {/* 사용 가이드 */}
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Pressable
            onPress={() => router.push('/guide')}
            className="flex-row items-center justify-between py-1 min-h-[48px]"
            accessibilityLabel={t.guide.linkLabel}
            accessibilityRole="button"
          >
            <Text
              className="text-lg font-bold"
              style={{
                color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                fontFamily: fontFamily.bold,
              }}
            >
              {t.guide.linkLabel}
            </Text>
            <Text
              className="text-base"
              style={{
                color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                fontFamily: fontFamily.regular,
              }}
            >
              →
            </Text>
          </Pressable>
        </View>

        {/* Pro 업그레이드 */}
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-lg font-bold mb-1"
            style={{
              color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.bold,
            }}
          >
            {t.profile.upgradePro}
          </Text>
          <Text
            className="text-base mb-4"
            style={{
              color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
              fontFamily: fontFamily.regular,
            }}
          >
            {isPro ? t.profile.proDescription : t.profile.freeDescription}
          </Text>
          {!isPro && (
            <View className="gap-2">
              <Button
                variant="primary"
                size="md"
                onPress={() => purchasePro()}
                disabled={purchasing}
              >
                {purchasing ? t.common.loading : t.profile.upgrade}
              </Button>
              <Button variant="outline" size="sm" onPress={() => restore()} disabled={restoring}>
                {restoring ? '...' : lang === 'ko' ? '구매 복원' : 'Restore Purchase'}
              </Button>
            </View>
          )}
        </View>

        {/* AI 사용량 */}
        <View
          style={{
            backgroundColor: getSurface('card', theme),
            borderWidth: 1,
            borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.lg,
          }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{
              color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
              fontFamily: fontFamily.bold,
            }}
          >
            {t.profile.usageTitle}
          </Text>
          <View
            className={ROW_CLASS}
            style={{
              borderBottomWidth: 1,
              borderBottomColor:
                theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
          >
            <Text
              className="text-base"
              style={{
                color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                fontFamily: fontFamily.regular,
              }}
            >
              {t.profile.schedules}
            </Text>
            <UsageCount kind="schedules" />
          </View>
          <View
            className={ROW_CLASS}
            style={{
              borderBottomWidth: 1,
              borderBottomColor:
                theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
          >
            <Text
              className="text-base"
              style={{
                color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                fontFamily: fontFamily.regular,
              }}
            >
              {t.profile.parses}
            </Text>
            <UsageCount kind="parses" />
          </View>
          <View className={`${ROW_CLASS} border-b-0`}>
            <Text
              className="text-base"
              style={{
                color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                fontFamily: fontFamily.regular,
              }}
            >
              {t.profile.insights}
            </Text>
            <UsageCount kind="insights" />
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.semantic.error,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Text
            className="text-base font-semibold text-white"
            style={{ fontFamily: fontFamily.medium }}
          >
            {t.profile.signOut}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { useTheme } from '@/lib/ThemeContext';
import {
  colors,
  getSurface,
  getBrand,
  fontFamily,
  typography,
  spacing,
  borderRadius,
} from '@/lib/design-system';
import { supabase } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';

function getSignInErrorMessage(error: { message?: string }): string {
  const msg = error?.message ?? '';
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.';
  }
  if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
    return '이메일 인증이 필요해요. 가입 시 발송된 메일에서 인증 링크를 눌러 주세요.';
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
    return '네트워크 연결을 확인해 주세요. Supabase URL/키 설정도 확인해 보세요.';
  }
  if (msg.includes('JWT') || msg.includes('supabase')) {
    return 'Supabase 설정을 확인해 주세요. (.env.local의 URL과 anon 키)';
  }
  return msg || '로그인에 실패했어요. 다시 시도해 주세요.';
}

function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  errorMessage,
  onSignIn,
  t,
  theme,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  errorMessage: string | null;
  onSignIn: () => void;
  t: ReturnType<typeof useI18n>['t'];
  theme: 'light' | 'dark';
}) {
  const isDark = theme === 'dark';
  return (
    <View style={{ gap: spacing.md }}>
      {errorMessage ? (
        <View
          style={{
            backgroundColor: isDark ? colors.semantic.errorBg : colors.semantic.errorBgLight,
            borderRadius: borderRadius.md,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.semantic.error,
          }}
        >
          <Text
            style={{
              fontSize: typography.fontSize.small,
              color: colors.semantic.error,
              fontFamily: fontFamily.regular,
            }}
          >
            {errorMessage}
          </Text>
        </View>
      ) : null}
      <Input
        label={t.auth.email}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-[52px] px-4"
      />
      <Input
        label={t.auth.password}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-[52px] px-4"
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={onSignIn}
        disabled={loading}
        loading={loading}
        accessibilityLabel={t.auth.signIn}
        style={{
          backgroundColor: getBrand('primary', theme),
          minHeight: 48,
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.lg,
        }}
      >
        {t.auth.signIn}
      </Button>
    </View>
  );
}

export default function SignInScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isDark = theme === 'dark';

  async function handleSignIn() {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
      if (error) throw error;
      router.replace('/(tabs)/capture');
    } catch (err) {
      const msg = getSignInErrorMessage(err instanceof Error ? err : { message: String(err) });
      setErrorMessage(msg);
      Alert.alert('로그인 실패', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getSurface('screen', theme) }}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: 48,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 400, alignItems: 'center' }}>
            {/* Hero: logo + app name + description */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: borderRadius.xl,
                  backgroundColor: getBrand('primary', theme),
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(isDark
                    ? {}
                    : {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 12,
                        elevation: 4,
                      }),
                }}
              >
                <Text style={{ fontSize: 32 }}>⚖</Text>
              </View>
              <Text
                style={{
                  marginTop: spacing.md,
                  fontSize: typography.fontSize.titleLarge,
                  lineHeight: typography.lineHeight.titleLarge,
                  fontFamily: fontFamily.bold,
                  color: isDark ? colors.text.primary : colors.text.primaryLight,
                }}
              >
                Mendly
              </Text>
              <Text
                style={{
                  marginTop: spacing.xs,
                  fontSize: typography.fontSize.body,
                  lineHeight: typography.lineHeight.body,
                  fontFamily: fontFamily.regular,
                  color: isDark ? colors.text.secondary : colors.text.secondaryLight,
                  textAlign: 'center',
                }}
              >
                {t.auth.welcomeBack}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: typography.fontSize.small,
                  fontFamily: fontFamily.regular,
                  color: isDark ? colors.text.tertiary : colors.text.secondaryLight,
                  textAlign: 'center',
                }}
              >
                {t.auth.signInDesc}
              </Text>
            </View>

            {/* Card: form */}
            <View
              style={{
                width: '100%',
                backgroundColor: getSurface('card', theme),
                borderWidth: 1,
                borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                ...(isDark
                  ? {}
                  : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      elevation: 2,
                    }),
              }}
            >
              <SignInForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                errorMessage={errorMessage}
                onSignIn={handleSignIn}
                t={t}
                theme={theme}
              />
            </View>

            {/* Footer: sign-up link */}
            <View
              style={{
                marginTop: spacing.xl,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.small,
                  fontFamily: fontFamily.regular,
                  color: isDark ? colors.text.secondary : colors.text.secondaryLight,
                }}
              >
                {t.auth.createAccountPrompt}{' '}
              </Text>
              <Pressable
                onPress={() => router.push('/sign-up')}
                accessibilityLabel={t.auth.createAccount}
                accessibilityRole="button"
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.small,
                    fontFamily: fontFamily.medium,
                    color: getBrand('primary', theme),
                  }}
                >
                  {t.auth.createAccount}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

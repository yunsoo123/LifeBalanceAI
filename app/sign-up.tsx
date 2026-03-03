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
  getSurface,
  getBrand,
  fontFamily,
  typography,
  spacing,
  borderRadius,
  colors,
} from '@/lib/design-system';
import { supabase } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';

function SignUpForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSignUp,
  t,
  theme,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  onSignUp: () => void;
  t: ReturnType<typeof useI18n>['t'];
  theme: 'light' | 'dark';
}) {
  return (
    <View style={{ gap: spacing.md }}>
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
        placeholder={t.auth.passwordMinLength}
        secureTextEntry
        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-[52px] px-4"
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={onSignUp}
        disabled={loading}
        loading={loading}
        accessibilityLabel={t.auth.signUp}
        style={{
          backgroundColor: getBrand('primary', theme),
          minHeight: 48,
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.lg,
        }}
      >
        {t.auth.signUp}
      </Button>
    </View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isDark = theme === 'dark';

  async function handleSignUp() {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      Alert.alert(t.common.error, t.auth.enterEmailAndPassword);
      return;
    }
    if (password.length < 6) {
      Alert.alert(t.common.error, t.auth.passwordMinLength);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email: trimmed, password });
      if (error) throw error;
      Alert.alert(t.auth.checkEmailTitle, t.auth.checkEmailMessage, [
        { text: t.common.ok, onPress: () => router.replace('/sign-in') },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.auth.signUpFailed;
      Alert.alert(t.auth.signUpFailed, msg);
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
            {/* Hero */}
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
                {t.auth.signUpTagline}
              </Text>
            </View>

            {/* Card */}
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
              <SignUpForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                onSignUp={handleSignUp}
                t={t}
                theme={theme}
              />
            </View>

            {/* Footer */}
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
                {t.auth.alreadyHaveAccount}
              </Text>
              <Pressable
                onPress={() => router.replace('/sign-in')}
                accessibilityLabel={t.auth.signIn}
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
                  {t.auth.signIn}
                </Text>
              </Pressable>
            </View>

            {/* Terms */}
            <Text
              style={{
                marginTop: spacing.lg,
                fontSize: typography.fontSize.caption,
                lineHeight: 18,
                fontFamily: fontFamily.regular,
                color: isDark ? colors.text.tertiary : colors.text.secondaryLight,
                textAlign: 'center',
                paddingHorizontal: spacing.sm,
              }}
            >
              가입하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import './globals.css';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/noto-sans-kr/useFonts';
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { ToastProvider } from '@/lib/ToastContext';
import { I18nProvider } from '@/lib/i18n';
import { SubscriptionProvider } from '@/lib/useSubscription';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/** 실기기에서도 다크 모드 적용: style backgroundColor 강제 + NativeWind dark 클래스 */
import { DARK_BG_COLOR, LIGHT_BG_COLOR } from '@/lib/layoutConstants';

/** Noto Sans KR — 한/영 동시 출시용 기본 폰트. 로드 후 전역 Text 기본 폰트 적용 */
function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    const RNText = Text as unknown as { defaultProps?: { style?: unknown } };
    RNText.defaultProps = RNText.defaultProps || {};
    const prev = RNText.defaultProps.style;
    const base = Array.isArray(prev) ? prev : prev ? [prev] : [];
    RNText.defaultProps = {
      ...RNText.defaultProps,
      style: [...base, { fontFamily: 'NotoSansKR_400Regular' }],
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return <>{children}</>;
}

function ThemedLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <View
      key={theme}
      style={{ flex: 1, backgroundColor: isDark ? DARK_BG_COLOR : LIGHT_BG_COLOR }}
      className={isDark ? 'dark' : ''}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <SubscriptionProvider>
              <ErrorBoundary>
                <ToastProvider>
                  <FontLoader>
                    <ThemedLayout />
                  </FontLoader>
                </ToastProvider>
              </ErrorBoundary>
            </SubscriptionProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

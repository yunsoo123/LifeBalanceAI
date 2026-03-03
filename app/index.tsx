import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { colors, getSurface, getBrand } from '@/lib/design-system';
import { useTheme } from '@/lib/ThemeContext';
import { useSession } from '@/lib/useSession';
import { getOnboardingDone } from '@/lib/onboardingStorage';

function LoadingScreen() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: getSurface('screen', theme),
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: getBrand('primary', theme),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 28, color: colors.text.inverse }}>⚖</Text>
        </View>
        <ActivityIndicator size="small" color={getBrand('primary', theme)} />
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'System',
            color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
          }}
        >
          Loading...
        </Text>
      </View>
    </View>
  );
}

export default function Index() {
  const { user, loading: authLoading } = useSession();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    getOnboardingDone().then(setOnboardingDone);
  }, [user]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  if (onboardingDone === null) {
    return <LoadingScreen />;
  }

  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/capture" />;
}

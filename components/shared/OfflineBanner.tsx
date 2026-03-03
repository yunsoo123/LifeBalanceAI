import React from 'react';
import { View, Text } from 'react-native';
import { useNetStatus } from '@/lib/useNetStatus';
import { useI18n } from '@/lib/i18n';

export function OfflineBanner() {
  const isOnline = useNetStatus();
  const { t } = useI18n();

  if (isOnline) return null;

  return (
    <View className="bg-amber-500 dark:bg-amber-600 px-4 py-2">
      <Text className="text-sm font-medium text-white text-center">{t.common.offlineMessage}</Text>
    </View>
  );
}

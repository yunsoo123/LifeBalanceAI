/**
 * 전역 하단 배너 광고 (AdMob). Pro 구독자에게는 미노출.
 * Expo Go에서는 네이티브 모듈이 없어 import 시 크래시하므로, Expo Go일 때는 배너를 아예 로드하지 않음.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useSubscription } from '@/lib/useSubscription';

const BANNER_HEIGHT = 50;

/** Expo Go 또는 네이티브 모듈이 없는 환경이면 true. 이 경우 react-native-google-mobile-ads를 import하면 안 됨. */
function isExpoGoOrUnsupported(): boolean {
  if (Platform.OS === 'web') return true;
  try {
    return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  } catch {
    return true;
  }
}

type AdModule = {
  BannerAd: React.ComponentType<{
    unitId: string;
    size: string;
    onAdFailedToLoad: () => void;
    accessibilityLabel: string;
  }>;
  BannerAdSize: { BANNER: string };
  TestIds: { BANNER: string };
};

function AdBannerInner() {
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const initRef = useRef(false);
  const [adModule, setAdModule] = useState<AdModule | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isExpoGoOrUnsupported()) {
      setLoadFailed(true);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { default: mobileAds } = await import('react-native-google-mobile-ads');
        if (!initRef.current) {
          await mobileAds().initialize();
          initRef.current = true;
        }
        if (mounted) setReady(true);
      } catch {
        if (mounted) setLoadFailed(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || loadFailed) return;
    if (isExpoGoOrUnsupported()) return;
    import('react-native-google-mobile-ads')
      .then((m) => setAdModule(m as unknown as AdModule))
      .catch(() => setLoadFailed(true));
  }, [ready, loadFailed]);

  if (!ready || loadFailed) {
    return (
      <View style={{ height: BANNER_HEIGHT, width: '100%' }} accessibilityLabel="Advertisement" />
    );
  }

  if (!adModule) {
    return (
      <View style={{ height: BANNER_HEIGHT, width: '100%' }} accessibilityLabel="Advertisement" />
    );
  }

  const { BannerAd, BannerAdSize, TestIds } = adModule;
  const unitId = __DEV__
    ? TestIds.BANNER
    : (process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID ?? TestIds.BANNER);
  return (
    <View
      style={{
        height: BANNER_HEIGHT,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={() => setLoadFailed(true)}
        accessibilityLabel="Advertisement"
      />
    </View>
  );
}

export const AD_BANNER_HEIGHT = BANNER_HEIGHT;

export function AdBanner() {
  const { isPro, loading } = useSubscription();

  if (loading || isPro) return null;
  if (Platform.OS === 'web') return null;
  if (isExpoGoOrUnsupported()) {
    return (
      <View style={{ height: BANNER_HEIGHT, width: '100%' }} accessibilityLabel="Advertisement" />
    );
  }

  return <AdBannerInner />;
}

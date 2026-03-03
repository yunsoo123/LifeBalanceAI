/**
 * 구독 상태: Pro 여부, 구매/복원 액션.
 * IAP는 개발 빌드에서만 동작하므로 Expo Go에서는 항상 isPro=false.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  getAvailablePurchases,
  initConnection,
  endConnection,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  PRO_SUBSCRIPTION_SKU,
} from '@/lib/iap';

type SubscriptionContextValue = {
  isPro: boolean;
  loading: boolean;
  initError: Error | null;
  purchasing: boolean;
  restoring: boolean;
  purchaseError: Error | null;
  purchasePro: () => Promise<void>;
  restore: () => Promise<void>;
  refreshPro: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

async function checkProFromPurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases({ onlyIncludeActiveItems: true });
    return purchases.some((p) => p.productId === PRO_SUBSCRIPTION_SKU);
  } catch {
    return false;
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [purchaseError, setPurchaseError] = useState<Error | null>(null);
  const readyRef = useRef(false);

  const refreshPro = useCallback(async () => {
    const pro = await checkProFromPurchases();
    setPro(pro);
  }, []);

  useEffect(() => {
    let subscriptionUpdated: { remove: () => void } | null = null;
    let subscriptionError: { remove: () => void } | null = null;
    let connected = false;

    try {
      initConnection()
        .then(() => {
          connected = true;
          readyRef.current = true;
          return refreshPro();
        })
        .catch((e) => {
          setInitError(e instanceof Error ? e : new Error(String(e)));
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (e) {
      // Expo Go 등 네이티브 IAP 미지원: E_IAP_NOT_AVAILABLE 등 동기 throw
      setInitError(e instanceof Error ? e : new Error(String(e)));
      setLoading(false);
    }

    try {
      subscriptionUpdated = purchaseUpdatedListener(() => {
        void refreshPro();
      });
      subscriptionError = purchaseErrorListener((err) => {
        setPurchaseError(err instanceof Error ? err : new Error(String(err)));
      });
    } catch {
      // Expo Go에서는 리스너도 미지원이므로 무시
    }

    return () => {
      subscriptionUpdated?.remove();
      subscriptionError?.remove();
      readyRef.current = false;
      if (connected) void endConnection();
    };
  }, [refreshPro]);

  const purchasePro = useCallback(async () => {
    setPurchaseError(null);
    setPurchasing(true);
    try {
      await requestSubscription({ sku: PRO_SUBSCRIPTION_SKU });
      await refreshPro();
    } catch (e) {
      setPurchaseError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setPurchasing(false);
    }
  }, [refreshPro]);

  const restore = useCallback(async () => {
    setRestoring(true);
    try {
      await getAvailablePurchases({ onlyIncludeActiveItems: true });
      await refreshPro();
    } finally {
      setRestoring(false);
    }
  }, [refreshPro]);

  const value: SubscriptionContextValue = {
    isPro,
    loading,
    initError,
    purchasing,
    restoring,
    purchaseError,
    purchasePro,
    restore,
    refreshPro,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (ctx == null) {
    return {
      isPro: false,
      loading: false,
      initError: null,
      purchasing: false,
      restoring: false,
      purchaseError: null,
      purchasePro: async () => {},
      restore: async () => {},
      refreshPro: async () => {},
    };
  }
  return ctx;
}

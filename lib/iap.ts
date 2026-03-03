/**
 * 인앱 결제(IAP) 래퍼. 앱스토어/플레이스토어 구독 Pro 연동.
 * 개발 빌드(EAS Build 등) 필요, Expo Go에서는 동작하지 않음.
 */
import {
  initConnection as iapInitConnection,
  endConnection as iapEndConnection,
  getAvailablePurchases as iapGetAvailablePurchases,
  getSubscriptions as iapGetSubscriptions,
  requestSubscription as iapRequestSubscription,
  purchaseUpdatedListener as iapPurchaseUpdatedListener,
  purchaseErrorListener as iapPurchaseErrorListener,
} from 'react-native-iap';

/** Pro 월간 구독 상품 ID. App Store Connect / Play Console에서 동일 ID로 등록 */
export const PRO_SUBSCRIPTION_SKU = 'mendly_pro_monthly';

export const initConnection = iapInitConnection;
export const endConnection = iapEndConnection;
export const getAvailablePurchases = iapGetAvailablePurchases;
export const getSubscriptions = iapGetSubscriptions;
export const requestSubscription = iapRequestSubscription;
export const purchaseUpdatedListener = iapPurchaseUpdatedListener;
export const purchaseErrorListener = iapPurchaseErrorListener;

/** 구독 복원 = getAvailablePurchases 호출 (스토어가 복원 후 리스너로 전달) */
export async function restorePurchases(): Promise<void> {
  await getAvailablePurchases({ onlyIncludeActiveItems: true });
}

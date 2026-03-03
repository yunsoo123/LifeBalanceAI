# 한국 결제 정책 (Phase 7)

**작성일**: 2025-02-15

Stripe는 한국에서 개인/소규모 사업자 사용이 제한적이므로, 한국 사용자 대상 결제는 아래 대안을 사용합니다.

## 1. 권장 결제 수단 (한국)

### 1.1 인앱 결제 (IAP) — 모바일 앱 권장
- Apple App Store / Google Play 인앱 구독
- 한국 사용자 결제(신용카드, 톡페이, 네이버페이 등)를 앱스토어가 처리
- 구현: expo-in-app-purchases 또는 react-native-iap

### 1.2 웹/하이브리드 결제 (선택)
- 토스페이먼츠 (toss.im): 한국 카드/계좌이체/간편결제
- PortOne (portone.io): 여러 PG 단일 연동

### 1.3 Stripe
- 프로젝트에서는 미사용. 의존성 제거함. 해외 전용 시에만 재검토.

## 2. 무료 한도 (Free Tier)

| 항목 | 무료 한도 | Pro |
|------|-----------|-----|
| AI 일정 생성 | 월 10회 | 무제한 |
| 노트 파싱 | 월 50회 | 무제한 |
| AI 인사이트 | 월 20회 | 무제한 |

한도는 lib/usageLimits.ts + AsyncStorage로 관리.

## 3. Pro 플랜 (인앱 결제 연동 완료)
- 가격: 인앱 결제 시 앱스토어 정책 (예: 월 9,900원)
- **상품 ID**: `mendly_pro_monthly` (iOS/Android 동일, `lib/iap.ts` 참고)
- **구현**: `react-native-iap` + `lib/iap.ts`, `lib/useSubscription.tsx` (SubscriptionProvider), Profile에서 업그레이드/구매 복원
- **테스트**: Expo Go 불가. EAS Build 등 개발 빌드 필요. App Store Connect / Play Console에서 상품 등록 후 실기기에서 결제 테스트

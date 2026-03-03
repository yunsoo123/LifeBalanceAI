# 광고 배너 수익화 — Design

**Date**: 2026-02-22  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [ad-monetization.plan.md](../../01-plan/features/ad-monetization.plan.md)

---

## Overview

Google AdMob 배너 1개를 **탭 바 바로 위**에 전역으로 배치하고, Pro 구독자에게는 노출하지 않는다. 배너 로딩/에러 시에도 레이아웃이 흔들리지 않도록 고정 높이 영역을 둔다.

---

## 아키텍처 요약

| 항목 | 내용 |
|------|------|
| **광고 네트워크** | Google AdMob |
| **패키지** | `react-native-google-mobile-ads` (Expo config plugin 사용) |
| **배너 위치** | 전역 하단 — 탭 바 바로 위, 모든 탭 공통 |
| **Pro 사용자** | `useSubscription().isPro === true` 이면 배너 컴포넌트 미렌더 |
| **초기화** | 앱 진입 시 1회 `mobileAds().initialize()` (root layout 또는 AdBanner 마운트 시) |

---

## 레이아웃

- **현재**: `app/(tabs)/_layout.tsx`에서 `Tabs`만 사용, 각 화면 콘텐츠 + 하단 탭 바.
- **변경**: 탭 바를 **커스텀 tabBar**로 교체하여 구조를 다음처럼 만든다.

```
┌─────────────────────────┐
│  Screen content         │
│  (ScrollView 등)        │
├─────────────────────────┤
│  AdBanner (고정 높이)   │  ← 무료만 표시
├─────────────────────────┤
│  Tab bar (기존 스타일)   │
└─────────────────────────┘
```

- **구현 방식**: `Tabs`의 `screenOptions.tabBar`에 커스텀 함수를 넘겨, `(props) => <View><AdBanner /><BottomTabBar {...props} /></View>` 형태로 렌더. `AdBanner`는 `isPro`일 때 `null` 반환.
- **배너 높이**: 표준 배너 약 50dp. 로딩/에러 시에도 **동일 높이** 유지(빈 View 또는 placeholder)해 레이아웃 시프트 방지.

---

## 데이터 / 환경

- **AdMob App ID**: `app.json` (또는 `app.config.js`)의 Expo plugin `react-native-google-mobile-ads`에 설정.
  - `androidAppId`: Android 앱 ID (예: `ca-app-pub-xxx~xxx`)
  - `iosAppId`: iOS 앱 ID
- **배너 광고 단위 ID**: 테스트용 `TestIds.BANNER`, 프로덕션용 실제 ID는 env 또는 config에서 읽도록 설계 권장 (예: `EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID`).
- **Pro 판별**: 기존 `useSubscription()` 훅 사용. `isPro === true`이면 배너 미표시.

---

## API / 컴포넌트

### 1. AdMob 초기화

- **위치**: 앱 루트 1회. `app/_layout.tsx`의 `useEffect`에서 `mobileAds().initialize()` 호출하거나, `AdBanner` 최초 마운트 시 초기화(이미 초기화됐으면 스킵).
- **에러**: 초기화 실패 시 로그만 남기고, 배너 영역은 빈 placeholder로 유지(앱 크래시 방지).

### 2. AdBanner 컴포넌트

- **파일**: `components/ui/AdBanner.tsx` (또는 `components/features/AdBanner.tsx`).
- **Props**: (선택) `placement?: string` — 나중에 슬롯별 unit ID 분리 시 사용. Phase 1에서는 단일 배너만.
- **동작**:
  - `useSubscription().isPro === true` → `null` 반환.
  - 그 외: 고정 높이(예: 50) 컨테이너 안에 `BannerAd` 렌더.
  - `BannerAd`: `react-native-google-mobile-ads`의 `BannerAd`, `BannerAdSize.ANCHORED_ADAPTIVE_BANNER` 또는 `BannerAdSize.BANNER` (320x50), `unitId`는 __DEV__면 `TestIds.BANNER`, 아니면 env/config.
  - 로딩 중: 같은 높이의 빈 View 또는 회색 placeholder.
  - onAdFailedToLoad: 같은 높이 유지, 빈 View(또는 재시도 버튼은 선택).
- **접근성**: `accessibilityLabel="Advertisement"` (또는 i18n "광고").

### 3. 탭 레이아웃 수정

- **파일**: `app/(tabs)/_layout.tsx`.
- **변경**:
  - `useSubscription()` 호출.
  - `@react-navigation/bottom-tabs`에서 `BottomTabBar` import (또는 Expo Router가 제공하는 기본 탭 바 참조).
  - `screenOptions.tabBar: (props) => ( <View style={{ backgroundColor: ... }}> {!isPro && <AdBanner />} <BottomTabBar {...props} /> </View> )`
  - 탭 바 전체 높이: 기존 `tabBarHeight` + (isPro ? 0 : BANNER_HEIGHT). `screenOptions.tabBarStyle.height`를 이 값으로 설정해 콘텐츠가 가려지지 않게 함.

---

## 에러 처리

| 상황 | 동작 |
|------|------|
| AdMob 미초기화 / 초기화 실패 | 배너 영역만 빈 50dp 유지, 앱은 정상 동작. |
| 광고 로드 실패 (onAdFailedToLoad) | 같은 높이 빈 View 유지. (선택) 개발 시에만 로그. |
| Pro 상태 로딩 중 (useSubscription().loading) | 배너는 일단 숨김 처리 권장(로딩 끝나면 Pro면 계속 숨김, 무료면 표시). 또는 로딩 중에도 배너 표시 후 Pro 판정되면 다음 마운트부터 숨김. 설계는 **로딩 중에는 배너 숨김**으로 단순화 가능. |

---

## 보안 / 정책

- AdMob App ID / Unit ID는 앱에 포함되어도 됨(클라이언트 노출). 민감한 키는 아님.
- 앱 스토어 정책: 앱 설명에 “광고 포함, 구독 시 광고 제거” 문구 권장.
- 테스트 시 반드시 AdMob 테스트 ID 사용(__DEV__에서 TestIds.BANNER). 실제 ID로 테스트 클릭 시 정책 위반 위험.

---

## 제한 사항 (Expo)

- **Expo Go**: `react-native-google-mobile-ads`는 네이티브 모듈이라 **Expo Go에서는 동작하지 않음**. 개발 빌드(EAS Build 등) 또는 prebuild 후 로컬 빌드에서만 배너가 표시됨. README에 이 점 명시.

---

## 파일 체크리스트

| 파일 | 역할 |
|------|------|
| `app.json` 또는 `app.config.js` | `react-native-google-mobile-ads` 플러그인, androidAppId, iosAppId |
| `app/_layout.tsx` | (선택) `mobileAds().initialize()` 1회 호출 |
| `components/ui/AdBanner.tsx` | Pro 시 null, 그 외 고정 높이 + BannerAd, 로딩/에러 시 placeholder |
| `app/(tabs)/_layout.tsx` | useSubscription, 커스텀 tabBar (AdBanner + BottomTabBar), tabBarStyle.height에 배너 높이 반영 |
| `README.md` | 이미 plan에서 반영됨 — Monetization / Ads 섹션 유지 |

---

## 구현 순서 제안

1. **의존성 및 설정**  
   - `npx expo install react-native-google-mobile-ads`  
   - app.config에 plugin 추가 (androidAppId, iosAppId — 테스트용 ID라도 우선 넣어서 빌드 가능하게).

2. **AdBanner 컴포넌트**  
   - AdBanner.tsx 추가: useSubscription, isPro면 null, 아니면 50dp 컨테이너 + BannerAd (TestIds.BANNER), onAdFailedToLoad 시 빈 View.

3. **초기화**  
   - _layout.tsx 또는 AdBanner 내부에서 mobileAds().initialize() 1회.

4. **탭 레이아웃**  
   - (tabs)/_layout.tsx에서 커스텀 tabBar에 AdBanner + 기본 탭 바, 높이 보정.

5. **품질**  
   - `npx tsc --noEmit`, `npx expo lint` 통과.  
   - Pro 계정으로 배너 비노출, 무료 계정으로 배너 노출(개발 빌드에서만 확인 가능) 체크리스트에 명시.

---

**Next Steps**: Do — 위 순서대로 구현 후 자가 테스트(tsc, lint). Expo Go에서는 배너 미표시가 정상임을 README/체크리스트에 기입.

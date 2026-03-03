# Ad-Monetization — Analysis

**Date**: 2026-02-26  
**Author**: gap-detector  
**Project**: Mendly (LifeBalanceAI)

---

## Overview

This document compares the **ad-monetization** feature implementation to its design (`docs/02-design/features/ad-monetization.design.md`) and plan (`docs/01-plan/features/ad-monetization.plan.md`). The implementation covers AdMob banner placement above the tab bar, Pro hide, fixed height, and README documentation.

---

## Gap Analysis

### 1. Configuration (app.json)

| Design | Implementation | Status |
|--------|-----------------|--------|
| Plugin `react-native-google-mobile-ads` with `androidAppId`, `iosAppId` | Present in `expo.plugins`: `["react-native-google-mobile-ads", { "androidAppId": "ca-app-pub-3940256099942544~3347511713", "iosAppId": "ca-app-pub-3940256099942544~1458002511" }]` | **Match** |

---

### 2. AdBanner Component (`components/ui/AdBanner.tsx`)

| Design | Implementation | Status |
|--------|-----------------|--------|
| Pro hide: `useSubscription().isPro === true` → `null` | `if (loading \|\| isPro) return null` | **Match** |
| Loading: design allows "로딩 중에는 배너 숨김" | Same: `loading` → `null` | **Match** |
| Fixed height 50dp | `BANNER_HEIGHT = 50`, used for container and placeholders | **Match** |
| `BannerAd` from `react-native-google-mobile-ads`, `BannerAdSize.BANNER` (320x50) | `BannerAd`, `BannerAdSize.BANNER`, same height container | **Match** |
| `unitId`: __DEV__ → `TestIds.BANNER`, else env/config | `__DEV__ ? TestIds.BANNER : (process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID ?? TestIds.BANNER)` | **Match** |
| Init: root layout or AdBanner mount, 1x `mobileAds().initialize()` | Init inside AdBanner on mount via dynamic import, `initRef` guards 1x init | **Match** |
| Load failure / init failure: same-height placeholder (empty View) | `loadFailed` or `!ready` → `<View style={{ height: BANNER_HEIGHT, width: '100%' }} />` | **Match** |
| `accessibilityLabel="Advertisement"` | Set on placeholder Views and on `BannerAd` | **Match** |
| Optional `placement?: string` prop (Phase 1 single banner) | No prop; single banner only | **Match** (optional, not required) |
| File location: `components/ui/AdBanner.tsx` | `components/ui/AdBanner.tsx` | **Match** |

**Added (not in design):**

- `Platform.OS === 'web'` → `null` (avoids loading native module on web; reasonable extension).
- Dynamic `import('react-native-google-mobile-ads')` so Expo Go / environments without the native module do not crash; init and render only after load. Aligns with design’s “init in AdBanner” and “Expo Go doesn’t run ads.”

---

### 3. Tab Layout (`app/(tabs)/_layout.tsx`)

| Design | Implementation | Status |
|--------|-----------------|--------|
| Custom tabBar: `(props) => <View><AdBanner /><BottomTabBar {...props} /></View>` | `tabBar={(props) => <CustomTabBar {...props} />}` with `<AdBanner />` + `<BottomTabBar {...props} />` inside a `View` | **Match** (design says `screenOptions.tabBar`; implementation uses `Tabs` prop `tabBar` — equivalent) |
| `useSubscription()` for Pro check | Used in `CustomTabBar` and for `totalBarHeight` | **Match** |
| `!isPro && <AdBanner />` | `{!isPro && <AdBanner />}` | **Match** |
| `tabBarStyle.height` = tabBarHeight + (isPro ? 0 : BANNER_HEIGHT) | `totalBarHeight = tabBarHeight + (isPro ? 0 : AD_BANNER_HEIGHT)`, `screenOptions.tabBarStyle.height: totalBarHeight` | **Match** |
| `BottomTabBar` from `@react-navigation/bottom-tabs` | `import { BottomTabBar } from '@react-navigation/bottom-tabs'` | **Match** |

---

### 4. Root Layout (`app/_layout.tsx`)

| Design | Implementation | Status |
|--------|-----------------|--------|
| (Optional) `mobileAds().initialize()` in `app/_layout.tsx` | Init done in AdBanner on first mount; not in root layout | **Match** (design allows either root or AdBanner) |

---

### 5. README — Monetization / Ads

| Design / Plan | Implementation | Status |
|---------------|-----------------|--------|
| Monetization / Ads section | Present | **Match** |
| Network: AdMob | “Google AdMob (banner ads)” | **Match** |
| Placement: above tab bar, all tabs | “Single banner fixed **above the tab bar** on all tabs” | **Match** |
| Policy: Pro no ads | “Pro subscribers see no ads” + `useSubscription` | **Match** |
| Setup: AdMob app IDs / unit IDs, env or config | “Configure AdMob app IDs (and optional unit IDs) via environment or app config” + link to design doc | **Match** |
| **README에 이 점 명시**: Expo Go에서는 배너 미표시, 개발 빌드에서만 동작 | README does **not** mention that Expo Go does not show the banner or that a dev build is required for ads | **Missing** |

---

### 6. Error Handling & Conventions

| Design | Implementation | Status |
|--------|-----------------|--------|
| AdMob init failure: log only, 50dp placeholder, no crash | Init in try/catch; on failure `setLoadFailed(true)` → placeholder View | **Match** |
| onAdFailedToLoad: same height empty View | `onAdFailedToLoad={() => setLoadFailed(true)}` → same-height View | **Match** |
| Component naming PascalCase, file AdBanner.tsx | `AdBanner`, `AdBanner.tsx` | **Match** |
| Export `AD_BANNER_HEIGHT` for layout height | Exported from `AdBanner.tsx`, used in `_layout.tsx` | **Match** |

---

## Match Rate Summary

| Area | Match | Missing | Added/Changed |
|------|--------|---------|----------------|
| app.json (plugin, App IDs) | 1 | 0 | 0 |
| AdBanner (Pro, 50dp, BannerAd, init, failure, a11y) | 10 | 0 | 2 (web guard, dynamic import) |
| Tab layout (custom tabBar, height, BottomTabBar) | 5 | 0 | 0 |
| Root layout (optional init) | 1 | 0 | 0 |
| README (section, network, placement, policy, setup) | 5 | 1 (Expo Go note) | 0 |
| Error handling / conventions | 4 | 0 | 0 |
| **Total (requirement items)** | **26** | **1** | **2** |

- **Match rate**: 26 / (26 + 1) ≈ **96%** (counting design requirements only; “Added” items are non-conflicting).
- If the single missing item (README Expo Go note) is added, the feature meets the design and plan.

---

## Recommended Actions

1. **README — Expo Go / dev build (Missing)**  
   Add one sentence to the Monetization / Ads section, for example:  
   - “Banner ads use a native module and **do not run in Expo Go**; use a development build (e.g. EAS Build) or prebuild to see the banner.”

2. **Optional**  
   - Keep the current “Added” behavior (web skip, dynamic import); both align with design intent and improve robustness.

No code or design doc changes are required beyond the README addition above.

---

## Next Steps

- **If the README change is applied**: Match rate reaches design coverage; recommend **pdca report** for ad-monetization completion.
- **If iterating**: Run **pdca iterate** (or apply the single README edit) then re-check or proceed to report.

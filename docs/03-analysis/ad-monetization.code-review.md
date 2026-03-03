# Ad monetization — Code review

**Scope**: `AdBanner.tsx`, `(tabs)/_layout.tsx` (ad-related: CustomTabBar, tabBar, AdBanner, AD_BANNER_HEIGHT).  
**Checked**: TypeScript strict, error handling, Pro check, accessibility, .cursorrules / bkit conventions, design-system usage.  
**Date**: 2026-02-26

---

## Summary

**Files reviewed**: 2. **Critical**: 0. **Warnings (to-improve)**: 4. **Good**: 10+.

---

## Good

- **Pro check**: `AdBanner` returns `null` when `loading || isPro` or on web; `CustomTabBar` renders `{!isPro && <AdBanner />}`. Redundant but safe; matches design (hide when loading).
- **TypeScript**: No `any` or `@ts-ignore`. `AdModule` type is explicit for the dynamic import surface.
- **Error handling**: Init failure, dynamic-import failure, and `onAdFailedToLoad` all set `loadFailed` and keep a fixed-height placeholder; no crash.
- **Layout stability**: Fixed `BANNER_HEIGHT` (50) used for placeholder and container; no layout shift on load/fail.
- **Accessibility**: `accessibilityLabel="Advertisement"` on placeholder `View`s and on `BannerAd` (design requirement).
- **Constants**: `BANNER_HEIGHT` / `AD_BANNER_HEIGHT` exported and used in layout; unit ID from env with `TestIds.BANNER` fallback.
- **Naming**: Components PascalCase (`AdBanner`, `AdBannerInner`), constant UPPER_SNAKE_CASE (`AD_BANNER_HEIGHT`, `BANNER_HEIGHT`), file `AdBanner.tsx`.
- **Design-system in layout**: `_layout.tsx` uses `colors` from `@/lib/design-system` for tab bar background and border.
- **Design doc alignment**: Single banner above tab bar, Pro hidden, env for unit ID, init once, fixed height, error → placeholder.

---

## To-improve

| # | Location | Finding | Recommendation |
|---|----------|---------|----------------|
| 1 | `AdBanner.tsx` (all `View` styles) | Inline `style={{ height, width, ... }}` throughout. | Prefer `StyleSheet.create` or design-system tokens (e.g. `spacing`) where applicable; .cursorrules prefer no inline styles. |
| 2 | `AdBanner.tsx` L50 | `(m as unknown as AdModule)` — type assertion on dynamic import. | Keep as-is if library has no types; otherwise use library types or a narrower type to avoid double assertion. |
| 3 | `_layout.tsx` L26, L49 | Magic number `56` for tab bar base height. | Extract e.g. `const TAB_BAR_BASE_HEIGHT = 56` (bkit: constants UPPER_SNAKE_CASE) and reuse. |
| 4 | `AdBanner.tsx` catch blocks | No logging on init or load failure. | Optional: add `__DEV__ && console.warn(...)` for debugging (design allows "개발 시에만 로그"). |

---

## Critical

- None. No secrets in code, no missing guards for Pro/web, no unhandled errors that would crash the app.

---

## Conventions / design-system notes

- **bkit**: Naming and file placement match. Env uses `EXPO_PUBLIC_` for client-visible ID — correct.
- **Design-system**: `AdBanner` does not use `colors` or `spacing`; placeholder is a plain View (no background). Acceptable; could later use a surface token for placeholder if desired.
- **Security**: AdMob App ID / Unit ID are client-visible by design; no sensitive keys.

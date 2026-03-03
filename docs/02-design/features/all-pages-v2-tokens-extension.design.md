# 전체 페이지 v2 토큰 확장 — 완료 요약

**Date**: 2026-02  
**Project**: Mendly (LifeBalanceAI)  
**기준**: [auth-screens-visual-overhaul.design.md](auth-screens-visual-overhaul.design.md), [mendly-ui-overhaul-v2.design.md](mendly-ui-overhaul-v2.design.md)

---

## 적용 범위

인증(sign-in, sign-up)에 적용한 **같은 방식**(v2 design-system 토큰, getSurface/getBrand, spacing, borderRadius, 일관된 카드/테두리)을 **모든 주요 페이지**에 확장 적용함.

---

## 적용한 화면

| 화면 | 적용 내용 |
|------|-----------|
| **onboarding** | getSurface('screen','card'), getBrand, typography, spacing, borderRadius. 슬라이드 카드·버튼·인디케이터 v2 토큰. |
| **index (LoadingScreen)** | getSurface('screen'), getBrand('primary'), colors.text. |
| **profile** | 카드: getSurface('card'), border.subtle/subtleLight, borderRadius.lg, spacing.lg. Sign out 버튼 borderRadius.lg. |
| **inbox** | 배경 카드 getSurface('card'). border 색상 tokens (기존 border.subtle 적용 구간 유지). |
| **schedule** | borderColor/slotDefault → colors.border.subtle/subtleLight, surface.input. |
| **notes** | 모든 카드/테두리 rgba(63,63,70) → colors.border.subtle/subtleLight. 보라 강조 → brand.primaryMuted. |
| **review** | 카드/테두리 rgba(63…) → colors.border.subtle/subtleLight. 배경 0.3 → surface.subtle/screenLight. |
| **calendar** | 테두리 #3f3f46/#e5e7eb → colors.border.subtle/subtleLight. |

---

## 공통 패턴

- **배경**: `getSurface('screen', theme)` 또는 LAYOUT.screenBg.
- **카드**: `getSurface('card', theme)`, `border.subtle` / `border.subtleLight`, `borderRadius.lg`, `spacing.lg` 패딩.
- **테두리**: 하드코딩 hex/`rgba(63,63,70)` 제거 → `colors.border.subtle`(다크), `colors.border.subtleLight`(라이트).
- **타이포/간격**: onboarding 등에서 `typography.*`, `spacing.*` 사용.

---

## 품질

- `npx tsc --noEmit` 통과.
- `npx expo lint` 실행(백그라운드). 에러 없음 목표.

---

## 다음 (선택)

- **guide.tsx**, **calendar/edit/[id].tsx** 등 남은 라우트에 동일 border/surface 토큰 적용.
- 컴포넌트(EmptyState, Button, Input)의 className 내 gray/zinc를 design-system 토큰으로 점진 교체.

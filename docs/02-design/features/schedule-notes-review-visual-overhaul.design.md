# 스케줄·노트·리뷰 시각 일관성 (Visual Overhaul) - Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: `docs/01-plan/features/real-device-feedback-improvements.plan.md` § 항목 1

---

## Overview

캡처·캘린더와 동일한 design-system·LAYOUT·카드 스타일을 **스케줄(AI 주간 일정)**·**노트**·**리뷰** 탭에 적용하여 "목업 같다"는 체감을 줄이고 시각적 완성도를 맞춘다.

---

## Reference (기준선)

- **캡처** (`app/(tabs)/capture/index.tsx`): 상단 제목(`typography.fontSize.titleLarge`, `fontFamily.bold`), 그 아래 캡션(`typography.fontSize.small`, `colors.text.tertiary` / `colors.text.secondaryLight`). 카드: `getSurface('card', theme)`, `borderRadius.lg`, `borderWidth: 1`, `colors.border.subtle`/`subtleLight`. 패딩 `spacing.lg`.
- **캘린더**: 헤더 컴팩트, 요일/시간 컬럼에 `colors.text.secondary`/`secondaryLight`. 카드·여백 design-system 통일.
- **Design system**: `lib/design-system.ts` — `colors`, `getSurface`, `fontFamily`, `typography`, `spacing`, `borderRadius`. `lib/layoutConstants.ts` — `LAYOUT`, `CONTENT_MAX_WIDTH`.

---

## Scope

| 화면 | 파일 | 적용 내용 |
|------|------|-----------|
| AI 주간 일정 | `app/(tabs)/capture/schedule.tsx` | 헤더(캡션+제목+액션), 채팅/결과 카드 색·radius·여백 통일 |
| 노트 | `app/(tabs)/notes.tsx` | 헤더 구조 통일, 목록/상세 카드 `getSurface`+`borderRadius.xl`, EmptyState 스타일 |
| 리뷰 | `app/(tabs)/review.tsx` | 헤더 구조 통일, 통계/카드 `getSurface`+`borderRadius.xl`, 여백·타이포 통일 |

---

## Visual Rules

### 1. 헤더 (모든 탭 공통)

- **구조**: 캡션(작은 라벨) + 제목 + (선택) Primary 액션 버튼.
- **캡션**: `fontSize: typography.fontSize.caption`(12) 또는 `typography.fontSize.small`(14), `color: colors.text.tertiary`(dark) / `colors.text.secondaryLight`(light).
- **제목**: `fontSize: typography.fontSize.titleLarge`(24), `fontFamily: fontFamily.bold`, `color: colors.text.primary` / `colors.text.primaryLight`.
- **패딩**: 상단 영역 `paddingHorizontal: spacing.lg`(24), `paddingTop: spacing.md`(16); 필요 시 `paddingBottom: spacing.sm`.

### 2. 카드

- **배경**: `getSurface('card', theme)` 또는 결과/강조용 `getSurface('cardElevated', theme)`.
- **테두리**: `borderWidth: 1`, `borderColor: colors.border.subtle`(dark) / `colors.border.subtleLight`(light).
- **모서리**: `borderRadius: borderRadius.xl`(20). (기존 `rounded-2xl` / `rounded-[20px]` 유지 가능.)
- **내부 패딩**: `padding: spacing.lg`(24) 또는 `spacing.md`(16) 일관 적용.

### 3. 색·타이포

- **본문 제목**: `fontFamily: fontFamily.bold` 또는 `fontFamily.medium`, `colors.text.primary`/`primaryLight`.
- **보조 문구**: `colors.text.secondary`/`secondaryLight` 또는 `colors.text.tertiary`.
- **배경**: 화면 전체 `getSurface('screen', theme)`; 스크롤 영역 동일.

### 4. 여백·레이아웃

- **콘텐츠 최대 폭**: `CONTENT_MAX_WIDTH`(672) 사용 권장, `alignSelf: 'center'`.
- **세로 간격**: 섹션 간 `spacing.lg` 또는 `spacing.xl`; 카드 내부 `spacing.md`.

---

## Component-Level Checklist

### Schedule (`capture/schedule.tsx`)

- [ ] 상단: 캡션(예: "AI 주간 일정") + 제목(예: `t.schedule.title` 또는 "LifeBalance AI") + 메뉴/액션; 색상 `design-system`으로 통일.
- [ ] 채팅 말풍선·ResultCard·활동 카드: `getSurface`, `borderRadius.xl`, `colors.border.subtle`/`subtleLight`.
- [ ] 스크롤 영역 배경 `getSurface('screen', theme)`; 콘텐츠 패딩 `spacing.lg`.
- [ ] TimeEditModal 등 모달: `getSurface('card', theme)` 또는 `cardElevated`, `borderRadius.xl`.

### Notes (`notes.tsx`)

- [ ] 목록 화면: 헤더(캡션+제목)+"+ 새 노트" primary 버튼; 색·폰트 design-system.
- [ ] 노트 목록 카드/행: `getSurface('card', theme)`, `borderRadius.xl`, border 색 통일.
- [ ] 상세/편집: 동일 카드 스타일; EmptyState는 `EmptyState` 컴포넌트 + design-system 색.
- [ ] "지식 연결", "AI 요약" 등 섹션: `typography.fontSize.small` + `colors.text.tertiary`/`secondaryLight`.

### Review (`review.tsx`)

- [ ] 상단: 캡션(예: "주간 리뷰") + 제목(예: "이번 주 요약"); 주간 네비(‹ ›) 스타일 통일.
- [ ] 통계 카드·목표 vs 실제·AI 인사이트 카드: `getSurface('card'|'cardElevated', theme)`, `borderRadius.xl`, 패딩 `spacing.lg`.
- [ ] CARD_CLASS / ROW_CLASS 대체 또는 유지 시 `LAYOUT.card` 및 design-system 색으로 통일.
- [ ] EmptyState: 캡처/캘린더와 동일한 버튼·캡션 스타일.

---

## Error Handling & Security

- 기존 로직 유지. 시각만 변경하므로 API·RLS 변경 없음.

---

## Implementation Order

1. **Schedule**: 헤더 → 채팅/ResultCard/활동 카드 색·radius·패딩.
2. **Notes**: 헤더 → 목록 카드 → 상세/편집 카드·섹션.
3. **Review**: 헤더 → 통계/카드 블록 → EmptyState.

---

**Next Steps**: 구현(Do) 후 필요 시 gap analysis. 노트 UX(첫 노트·일정 연결)는 `notes-ux-and-visual-overhaul.design.md` 별도 적용.

# UX Convenience P0–P2 - Gap Analysis

**Date**: 2026-02-22  
**Author**: Agent (PDCA)  
**Project**: Mendly (LifeBalanceAI)  
**Baseline**: [ux-convenience-pain-points-and-ideas.md](./ux-convenience-pain-points-and-ideas.md) §4 우선순위 제안 (P0·P1·P2)

---

## Overview

분석서의 P0·P1·P2 항목을 “요구사항 체크리스트”로 두고, 현재 코드베이스와 비교한 결과를 정리한다.  
(공식 design doc은 없고, 분석서의 “편리성 방안”을 구현 범위로 사용.)

---

## 1. P0 vs 구현

| # | 항목 (분석서) | 구현 여부 | 근거 |
|---|----------------|-----------|------|
| P0-1 | Alert·한도·로그인·오프라인 메시지 **i18n 통일** | ✅ 구현됨 | `lib/i18n.tsx`: common.signInRequiredTitle, limitReachedParse/Schedule/Insight, offlineMessage, saveFailed, offlineSaveMessage 등 한/영 정의. `review.tsx` 한도 Alert·로그인 EmptyState, `sign-in.tsx` createAccountPrompt, `capture/index.tsx`·`capture/schedule.tsx` Alert 문구가 t.* 사용. |
| P0-2 | **Pull-to-refresh** (Calendar 일정·할 일, Notes, Review) | ✅ 구현됨 | `app/(tabs)/calendar/index.tsx`: ScrollView에 RefreshControl, onRefresh에서 calendarSegment에 따라 loadEvents 또는 loadTodos. `app/(tabs)/notes.tsx`: FlatList에 RefreshControl, onRefresh에서 loadNotes. `app/(tabs)/review.tsx`: ScrollView에 RefreshControl, onRefresh에서 loadWeeklyStats. |

**P0 매칭**: 2/2 (100%).

---

## 2. P1 vs 구현

| # | 항목 (분석서) | 구현 여부 | 근거 |
|---|----------------|-----------|------|
| P1-1 | 할 일 **삭제 안내** (길게 누르기 또는 설명) | ✅ 구현됨 | `lib/i18n.tsx`: todo.longPressToDelete 한/영. `app/(tabs)/calendar/index.tsx`: 할 일 목록 상단에 안내 문구 표시, Pressable에 accessibilityHint={t.todo.longPressToDelete}. |
| P1-2 | **오프라인 배너** i18n + **저장 실패 시 오프라인 메시지** | ✅ 구현됨 | `components/shared/OfflineBanner.tsx`: t.common.offlineMessage 사용. `app/(tabs)/capture/index.tsx`·`schedule.tsx`: useNetStatus(), 저장 실패 시 !isOnline이면 t.common.offlineSaveMessage로 안내. |

**P1 매칭**: 2/2 (100%).

---

## 3. P2 vs 구현

| # | 항목 (분석서) | 구현 여부 | 근거 |
|---|----------------|-----------|------|
| P2-1 | 온보딩 **locale별 title/description 통일** | ✅ 구현됨 | `lib/i18n.tsx`: onboarding.slide1~3 Subtitle/Title/Description, skip, next, start, goToSlide 한/영. `app/onboarding.tsx`: useI18n(), subtitles/titles/descriptions 배열로 t.onboarding.* 사용, 버튼/접근성 라벨도 t.onboarding.* 사용. |
| P2-2 | Capture **저장 실패 시 [다시 시도] 버튼** | ✅ 구현됨 | `app/(tabs)/capture/index.tsx`: 저장 실패 Alert에 t.common.retry 버튼, onPress에서 handleSaveWithPlacement(placement) 재호출. `app/(tabs)/capture/schedule.tsx`: 저장 실패 Alert에 t.common.retry 버튼, onPress에서 saveSchedule() 재호출. |

**P2 매칭**: 2/2 (100%).

---

## 4. 요약

| 구분 | 항목 수 | 구현 일치 | 누락 | 부정확 | 매칭률 |
|------|---------|-----------|------|--------|--------|
| P0   | 2       | 2         | 0    | 0      | 100%   |
| P1   | 2       | 2         | 0    | 0      | 100%   |
| P2   | 2       | 2         | 0    | 0      | 100%   |
| **합계** | **6** | **6**     | **0** | **0** | **100%** |

- **추가 구현**: 분석서에 없던 세부 개선(예: Review 로그인 EmptyState i18n, Schedule 저장 실패 시 제목을 t.common.saveFailed로 통일 등) 포함되어 있음.
- **권장**: 이번 범위(P0–P2)는 갭 없이 반영된 것으로 보고, **완료 리포트** 작성 후 PDCA Act 단계 종료 가능.

---

## 5. Next Steps

- 완료 리포트 작성: `docs/04-report/features/ux-convenience-p0-p2.report.md`
- (선택) P3(할 일 추가 후 폼 유지, 빠른 일정 추가 등)는 별도 plan/design 후 진행.

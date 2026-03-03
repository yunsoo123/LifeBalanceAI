# Schedule Edit (Track 3) - Analysis

**Date**: 2025-02-23  
**Author**: gap-detector  
**Project**: Mendly (LifeBalanceAI)

**Design**: [schedule-edit.design.md](../02-design/features/schedule-edit.design.md)

---

## Overview

This report compares the Schedule Edit (Track 3) design with the current implementation. The feature enables time/day changes for AI-generated weekly schedule activities via a "시간 변경" flow: TimeEditModal (day + start time) → conflict check → overrides state → "캘린더에 등록하기" using overrides for start_time/end_time.

**Implementation scope**: `LifeBalanceAI/app/(tabs)/schedule.tsx` — overrides state, `getEffectiveSlot`, `hasScheduleConflict`, `addToCalendar` (overrides usage), `TimeEditModal`, activity row "시간 변경" button and override summary.

---

## Gap Analysis

### 1. Data & State

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **schedule type** | `ScheduleResult` with `activities: { name, hoursPerWeek, optimalTime }[]` | Local `ScheduleResult` and `ScheduleActivity` types with same shape | **Match** |
| **overrides type** | `Record<number, { dayOfWeek: number; startMinutes: number }>`, key = activity index (0-based) | `TimeOverride` + `OverridesMap` (Record<number, TimeOverride>) | **Match** |
| **dayOfWeek semantics** | 0=월 … 6=일 (getStartOfWeek 기준) | Same; `DAY_LABELS` and slot logic use 0=Mon | **Match** |
| **startMinutes range** | 0~1440 (e.g. 540 = 09:00) for override storage | Stored as-is; TIME_SLOTS 360–1320 (6:00–22:00) in modal | **Match** |
| **overrides state** | `useState`, initial `{}` | `useState<OverridesMap>({})` (line 200) | **Match** |
| **Reset on new schedule** | 스케줄 새로 생성 시 `setOverrides({})` | `setOverrides({})` when schedule result is set (line 359) | **Match** |
| **Reset on "다시 만들기"** | 다시 만들기 시 초기화 | `setOverrides({})` with setSchedule(null), setMessages([]) (lines 451–454) | **Match** |

**Summary**: Data and state match the design.

---

### 2. addToCalendar Extension

| Requirement | Design | Implementation | Status |
|-------------|--------|----------------|--------|
| **Override path** | `overrides[i]` 있으면 해당 요일·시작 시간으로 start/end 계산 | `getEffectiveSlot(schedule, overrides, i)` used; startDate from weekStart + slot.dayOfWeek, 00:00 + slot.startMinutes | **Match** |
| **Default path** | 없으면 기존 로직 (9시 + offset, duration = max(30, round(hoursPerWeek/7*60)), gap 60) | `getEffectiveSlot` when no override: dayOfWeek = index % 7, startMinutes = 9*60 + offsetMinutes, duration same | **Match** |
| **events insert** | 기존 `tables.events().insert(...)` | Same; insert with start_time/end_time from slot (lines 284–294) | **Match** |

**Summary**: addToCalendar correctly uses overrides via getEffectiveSlot; no new API as designed.

---

### 3. Conflict Check

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Scope** | 같은 주 내, overrides 있는 활동끼리 + 없는 활동은 기본 배치로 비교 | `hasScheduleConflict` uses `getEffectiveSlot` for every other activity (override or default) | **Match** |
| **Rule** | 두 활동 [start, end) 겹치면 충돌 | Overlap check `a1 < b2 && b1 < a2` for same dayOfWeek (lines 71–76) | **Match** |
| **On conflict** | "이 시간대에 이미 다른 활동이 있어요." 표시, overrides 갱신하지 않음 | Alert with that message (ko) / "This slot overlaps..." (en), return without setOverrides (469–479) | **Match** |
| **Modal on conflict** | 재선택 유도, 모달 유지 | Modal not closed; user can change selection and Apply again | **Match** |

**Summary**: Conflict detection and UX match the design.

---

### 4. getEffectiveSlot & Helpers

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Override** | overrides[index] 있으면 그 값 사용, duration 동일 | Returns ov.dayOfWeek, ov.startMinutes, durationMinutes (line 45) | **Match** |
| **Default** | dayOffset = i % 7, 9시 + offsetMinutes, duration = max(30, round(h/7*60)), gap 60 | offsetMinutes = sum of (duration_j + 60) for j < i; startMinutes = 9*60 + offsetMinutes; dayOfWeek = index % 7 (lines 46–56) | **Match** |

**Summary**: getEffectiveSlot implements design logic.

---

### 5. UI Components

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Schedule screen state** | overrides, reset on new/다시 만들기 | Implemented as above | **Match** |
| **"시간 변경" per row** | 각 활동 행에 버튼 → onPress setTimeEditActivityIndex(index), setShowTimeEditModal(true) | Pressable with onPress setting index and modal visible (lines 447–455) | **Match** |
| **Activity row content** | 아이콘, 이름, h/week, optimalTime | Same (icon, name, hoursPerWeek, optimalTime) (lines 428–438) | **Match** |
| **"시간 변경" touch target** | min 44dp | `min-h-[44px] min-w-[44px]` (line 453) | **Match** |
| **Override summary** | overrides[index] 있으면 "월 09:00" 등 요약 표시(선택) | Text with DAY_LABELS[dayOfWeek] and formatted time when overrides[index] (lines 441–446) | **Match** |
| **TimeEditModal props** | visible, activityIndex, activityName, initialDayOfWeek, initialStartMinutes, onApply(dayOfWeek, startMinutes), onCancel | visible, activityName, initialDayOfWeek, initialStartMinutes, onApply, onCancel; activityIndex held by parent, not passed as prop | **Match** |
| **TimeEditModal UI** | 요일 선택 (월~일 7버튼), 시작 시간 (30분 단위 06:00~22:00), [취소] [적용] | 7 day buttons, TIME_SLOTS 360–1320 (6:00–22:00), Cancel/Apply buttons (lines 134–173) | **Match** |
| **Apply behavior** | 부모에서 충돌 검사 후, 충돌 없으면 setOverrides + 모달 닫기; 충돌 시 Alert 후 모달 유지 | onApply calls hasScheduleConflict; no conflict → setOverrides, close modal; conflict → Alert, return (469–483) | **Match** |

**Summary**: All listed UI requirements are implemented; activityIndex is used in parent only (modal does not need it as a prop).

---

### 6. Error Handling

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Conflict message** | "이 시간대에 이미 다른 활동이 있어요. 다른 요일이나 시간을 선택해 주세요." | Alert title "시간 충돌" / "Time conflict", message matches (ko/en) (472–476) | **Match** |
| **캘린더 등록 실패** | 기존과 동일 Alert | catch: Alert.alert('오류', ...) (301–302) | **Match** |
| **저장 실패** | 기존과 동일 Alert | Alert.alert('저장 실패', ...) / '오류' (234–236, 243–244) | **Match** |

**Summary**: Error handling matches design.

---

### 7. Security & API

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **RLS** | events insert 기존 정책(user_id = auth.uid())만 사용, 변경 없음 | No change; client uses existing tables.events().insert with user_id | **Match** |
| **No new API** | 클라이언트 addToCalendar에서 overrides 사용 후 기존 insert | No new endpoints; addToCalendar uses overrides and existing insert | **Match** |

**Summary**: Security and API scope match design.

---

### 8. Acceptance Criteria (Plan §5)

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| Schedule 결과에서 "시간/요일 변경" 가능 (드래그 또는 폼) | Option A: "시간 변경" → TimeEditModal (요일 + 시작 시간) | "시간 변경" → TimeEditModal with day + start time | **Match** |
| 변경 시 충돌 검사 및 경고 | 적용 시 충돌 검사, 경고 후 재선택 | hasScheduleConflict on Apply; Alert; modal kept open | **Match** |
| "캘린더에 등록" 시 최종 반영 | overrides 반영해 start_time/end_time 계산 후 insert | addToCalendar uses getEffectiveSlot(schedule, overrides, i) for each activity | **Match** |

**Summary**: All three acceptance criteria are met.

---

## Match Rate Summary

| Area | Match | Partial | Gap | Notes |
|------|-------|---------|-----|--------|
| Data & State | 7 | 0 | 0 | — |
| addToCalendar | 3 | 0 | 0 | — |
| Conflict check | 4 | 0 | 0 | — |
| getEffectiveSlot | 2 | 0 | 0 | — |
| UI Components | 8 | 0 | 0 | — |
| Error handling | 3 | 0 | 0 | — |
| Security & API | 2 | 0 | 0 | — |
| Acceptance criteria | 3 | 0 | 0 | — |

**Overall**: **32 / 32** requirements marked as **Match**.

**Match rate**: **100%** (design vs implementation in the stated scope).

---

## Recommended Actions

- **No gaps** were found in the in-scope implementation. The design’s "Implemented (2025-02-23)" note is consistent with the code.
- **Optional (out of scope for this analysis)**:
  - Consider extracting `TimeEditModal` and the activity row (with "시간 변경" + override summary) into named components under `components/features/` or `components/shared/` for reuse and tests, if the project’s conventions prefer smaller components.
  - Option B (주간 미니 타임테이블 + 블록 드래그) was out of scope; no comparison performed.

---

## Next Steps

- **Match rate ≥ 90%**: Proceed to **pdca report** to generate the completion report for the schedule-edit feature (e.g. `docs/04-report/features/schedule-edit.report.md`).
- No iteration required for design–implementation alignment within the analyzed scope.

# Code Review: Schedule Edit (Track 3)

**Scope**: `LifeBalanceAI/app/(tabs)/schedule.tsx` — Track 3 only (OverridesMap/TimeOverride, getEffectiveSlot, hasScheduleConflict, overrides state/reset, TimeEditModal, "시간 변경" button and override display, addToCalendar overrides, conflict Alert).  
**Design**: `docs/02-design/features/schedule-edit.design.md`  
**Date**: 2025-02-23

---

## Summary

**Reviewed**: 1 file (Track 3-related code). **Critical**: 0 · **Warnings**: 2 · **Suggestions**: 3.

Implementation matches the design (overrides shape, dayOfWeek 0=Mon..6=Sun, startMinutes, conflict rule, no new API, RLS unchanged). TypeScript and naming are correct. Two touch-target gaps and a few accessibility improvements are recommended.

---

## 1. TypeScript — OK

| Check | Status | Notes |
|-------|--------|--------|
| No `any` | OK | All Track 3 code is properly typed. |
| Types | OK | `TimeOverride`, `OverridesMap` defined; `getEffectiveSlot` and `hasScheduleConflict` have explicit parameter/return types. |
| TimeEditModal props | OK | All props typed (visible, activityName, initialDayOfWeek, initialStartMinutes, onApply, onCancel). |

---

## 2. Naming — OK

| Convention | Status | Examples |
|------------|--------|----------|
| Types PascalCase | OK | `TimeOverride`, `OverridesMap` |
| Functions camelCase | OK | `getEffectiveSlot`, `hasScheduleConflict`, `formatTimeSlot` |
| Constants UPPER_SNAKE | OK | `DAY_LABELS`, `TIME_SLOTS`, `MAX_TURNS`, `ACTIVITY_ICON_BG` |
| Component PascalCase | OK | `TimeEditModal` |

---

## 3. Error Handling — OK

| Check | Status | Notes |
|-------|--------|--------|
| Conflict Alert | OK | Shown on apply when `hasScheduleConflict` is true; message matches design (ko/en). |
| User-facing message | OK | "이 시간대에 이미 다른 활동이 있어요. 다른 요일이나 시간을 선택해 주세요." / English equivalent. |
| Modal on conflict | OK | Alert shown, overrides not updated, modal stays open (return before `setOverrides`). |

---

## 4. Security — OK

| Check | Status | Notes |
|-------|--------|--------|
| No new API | OK | Only existing `tables.events().insert` used. |
| RLS | OK | No schema/RLS changes; insert still uses `user_id` from auth. |
| Inputs | OK | Overrides come from UI (day 0–6, TIME_SLOTS); no unsanitized external input. |

---

## 5. Touch Targets & Accessibility — Warnings + Suggestions

| Item | Status | Location | Recommendation |
|------|--------|----------|----------------|
| "시간 변경" button | OK | ~442–450 | `min-h-[44px] min-w-[44px]` and `accessibilityLabel` present. |
| Modal Cancel/Apply | OK | ~166–178 | `min-h-[44px]`. |
| Day buttons in TimeEditModal | **Warning** | ~136–146 | `min-h-[40px]` &lt; 44dp. Use `min-h-[44px]` (and optionally `min-w-[44px]` or sufficient padding) per project rule (≥44dp). |
| Time slot buttons in TimeEditModal | **Warning** | ~152–163 | `min-h-[36px]` &lt; 44dp. Use `min-h-[44px]` (and ensure width ≥44dp) per project rule. |
| Day/time buttons | **Suggestion** | Same | Add `accessibilityLabel` (e.g. "Select Monday", "Select 9:00") and `accessibilityRole="button"` for screen readers. |
| Modal Cancel/Apply | **Suggestion** | ~166–178 | Add `accessibilityRole="button"` for consistency with other buttons. |

---

## 6. Design Doc Alignment — OK

| Design requirement | Implementation | Status |
|--------------------|----------------|--------|
| overrides shape | `Record<number, { dayOfWeek: number; startMinutes: number }>` | OK |
| dayOfWeek 0=Mon..6=Sun | `DAY_LABELS = ['월',…,'일']`, default `index % 7` | OK |
| startMinutes 0..1440, 30-min slots 06:00–22:00 | `TIME_SLOTS` 360–1320 (33 slots) | OK |
| Conflict: same day, [start, end) overlap | `hasScheduleConflict` interval check `a1 < b2 && b1 < a2` | OK |
| addToCalendar uses overrides | `getEffectiveSlot(schedule, overrides, i)` for each activity | OK |
| Reset on new schedule / "다시 만들기" | `setOverrides({})` in handleSend result and reset button | OK |
| TimeEditModal: apply → conflict check → Alert or setOverrides | onApply runs conflict check, Alert then return or setOverrides + close | OK |
| No new API; RLS unchanged | No new endpoints; same events insert path | OK |

---

## Suggested Fixes (concise)

1. **Touch targets (TimeEditModal)**  
   - Day selector: change `min-h-[40px]` to `min-h-[44px]` (and ensure width ≥44dp).  
   - Time slots: change `min-h-[36px]` to `min-h-[44px]` (and ensure width ≥44dp).

2. **Accessibility (optional)**  
   - Day buttons: `accessibilityLabel={DAY_LABELS[i]}` (or "Select " + day name), `accessibilityRole="button"`.  
   - Time slot buttons: `accessibilityLabel={formatTimeSlot(mins)}` (or "Select " + time), `accessibilityRole="button"`.  
   - Modal Cancel/Apply: add `accessibilityRole="button"`.

---

**Verdict**: Implementation is solid and design-aligned. Address the two touch-target warnings for project compliance; apply suggestions for better accessibility.

# 캘린더 일정 생성 UX 및 요일/타임테이블 수정 — Completion Report

**Date**: 2025-02-25  
**Feature**: calendar-event-ux-and-day-time-fix  
**Project**: Mendly (LifeBalanceAI)

---

## Summary

캘린더 **New Event 모달** 겹침/가독성 개선·i18n, **Schedule**에서 사용자/AI가 지정한 요일·시간(금요일 오전 등) 반영, **타임테이블** 주 state 및 로드 범위 확장을 적용했다.

---

## Done

| 항목 | 내용 |
|------|------|
| Plan | `docs/01-plan/features/calendar-event-ux-and-day-time-fix.plan.md` |
| Design | `docs/02-design/features/calendar-event-ux-and-day-time-fix.design.md` |
| New Event 모달 | 블록형 레이아웃(marginBottom 16/20), minHeight 400, min-h-[48px], i18n(calendar.newEvent, eventTitle, descriptionOptional, date, startTime, create, creating, eventTitleRequired, createEventSuccess, createEventFailed, signInRequired*) |
| Schedule AI | `preferredDayOfWeek`(0=월..6=일), `preferredStartMinutes`(0..1440) 스키마·시스템 프롬프트 반영 |
| getEffectiveSlot | override 없을 때 activity.preferredDayOfWeek / preferredStartMinutes 사용 → "금요일 오전" 요청 시 금요일로 표시·캘린더 등록 |
| 타임테이블 | `timetableWeekStart` state, focusWeek 연동, `getWeekDatesFromMonday`, 월 이동·오늘 시 동기화, loadEvents 시 주 범위가 월 밖이면 추가 조회 후 merge |

---

## Files Touched

- `lib/i18n.tsx` — calendar 모달·알림 키 추가
- `lib/ai/schedule-generator.ts` — Schedule 스키마·시스템 프롬프트 확장
- `app/(tabs)/schedule.tsx` — ScheduleActivity 타입, getEffectiveSlot preferred 반영
- `app/(tabs)/calendar.tsx` — 모달 i18n·블록형, timetableWeekStart, getWeekDatesFromMonday, getWeekStartForMonth, loadEvents 주 범위 확장

---

## 유지보수 (Maintainability)

- **요일·시간 규칙**: 0=월..6=일, 분 단위(0..1440)는 `lib/ai/schedule-generator.ts` 주석 및 `schedule.tsx` getEffectiveSlot 한 곳에서만 해석.
- **타임테이블 주**: `timetableWeekStart`(YYYY-MM-DD 월요일) 단일 state로 관리; focusWeek·월 이동·오늘 버튼에서만 갱신.
- **이벤트 로드**: 월 범위 + (타임테이블 주가 월 밖이면 해당 주 범위 추가 조회 후 id 기준 merge)로 중복·누락 없음.
- **모달**: 라벨/필드는 블록 단위 marginBottom, ScrollView minHeight로 겹침 방지; 새 문구는 모두 i18n.

---

## Quality

- `npx tsc --noEmit`: ✅

---

## Next Steps

- 수동 확인: "금요일 오전 [활동]" 요청 시 Schedule 카드·캘린더 등록이 금요일로 나오는지, focusWeek 이동 후 타임테이블에 해당 주 이벤트가 보이는지.
- (선택) 갭 분석: design vs 구현 비교.
- 블록형 대규모 리디자인(타임테이블 셀 탭 추가 등)은 별도 feature로 진행.

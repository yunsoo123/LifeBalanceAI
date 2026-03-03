# 캘린더: 날짜 탭 시 타임테이블 표시 (방안 A)

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)

---

## 1. 목표

월간 달력에서 **날짜를 탭하면 해당 주의 타임테이블이 바로 보이도록** 한다. (아이폰 캘린더처럼 날짜 선택 → 일정 뷰로 이어지는 UX)

---

## 2. 현재 상태

- `viewMode`: `'month'`(월 그리드) | `'timetable'`(주간 타임테이블).
- 월 뷰에서 날짜 셀 탭 시 `setSelectedDay(cell)` 만 호출 → 선택일만 바뀌고 뷰는 월간 유지.
- 타임테이블은 `timetableWeekStart`(해당 주 월요일 YYYY-MM-DD) 기준 7일 컬럼.

---

## 3. 변경 사양 (방안 A)

- **트리거**: 월 그리드에서 날짜 셀 탭.
- **동작**  
  1. `setSelectedDay(cell)` — 선택일을 탭한 날로 설정.  
  2. `setTimetableWeekStart(getStartOfWeek(cell))` — 탭한 날이 포함된 주의 월요일로 설정.  
  3. `setViewMode('timetable')` — 타임테이블 탭으로 전환.
- **결과**: 사용자는 날짜를 누르는 즉시 해당 주 타임테이블에서 그 날을 확인할 수 있음.

---

## 4. 구현

- **파일**: `app/(tabs)/calendar/index.tsx`
- **위치**: 월 그리드 셀 `Pressable`의 `onPress`.
- **기존**: `onPress={() => cell && setSelectedDay(cell)}`
- **변경**:  
  `onPress={() => { if (cell) { setSelectedDay(cell); setTimetableWeekStart(getStartOfWeek(cell)); setViewMode('timetable'); } }}`

`getStartOfWeek`는 `lib/weekUtils`에서 이미 `Date` 인자를 받음.

---

## 5. 검증

- 월간 탭에서 다른 월의 날짜 탭 → 타임테이블로 전환되고 해당 주 표시.
- 오늘 탭 → 이번 주 타임테이블 + 오늘 선택.
- tsc, lint 통과.

---

**Next**: Do(구현) 후 필요 시 분석/리포트.

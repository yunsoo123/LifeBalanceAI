# 일정 반복 (Event Recurrence) — Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: [event-recurrence.plan.md](../../01-plan/features/event-recurrence.plan.md)

---

## Overview

1. **events.recurrence** 컬럼 추가: `'daily' | 'weekly' | 'monthly' | null`.
2. 일정 **추가 모달**과 **편집 화면**에서 반복 선택 UI.
3. 일정 **목록/카드**에 반복 뱃지 또는 문구 표시.

---

## Data Model

- **events.recurrence** TEXT nullable. 값: `null` | `'daily'` | `'weekly'` | `'monthly'`.
- 이번 단계에서는 **저장·표시만**. 반복 시리즈 확장(다음 발생 생성)은 Phase 2.

---

## Schema Change (Migration)

```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence TEXT;
COMMENT ON COLUMN events.recurrence IS 'Recurrence: daily, weekly, monthly, or null';
```

---

## UI Spec

### 1. 캘린더 — 새 일정 모달

- **필드 순서**: 기존(제목, 설명, 날짜, 시작/종료 시간) + **반복** 블록.
- **반복 블록**: 라벨 "반복" / "Repeat", 선택 칩: 없음 | 매일 | 매주 | 매월.
- 기본값: **없음**(null). 선택 값은 `formRecurrence` state로 보관 후 insert 시 `recurrence` 전달.

### 2. 캘린더 — 일정 편집 화면 (`calendar/edit/[id].tsx`)

- 기존 필드에 **반복** 선택 추가(동일 옵션).
- update 시 `recurrence` 포함.

### 3. 표시 (타임테이블 / 이벤트 카드)

- 이벤트 행 또는 카드에 `recurrence`가 있으면 작은 뱃지 또는 보조 텍스트로 표시.  
  예: "매일 반복", "매주 반복", "매월 반복" (i18n).

---

## Implementation Order

1. Migration: `events.recurrence` 추가.
2. `types/database.types.ts`: events Row/Insert/Update에 `recurrence` 추가.
3. i18n: `calendar.recurrence`, `calendar.recurrenceNone`, `recurrenceDaily`, `recurrenceWeekly`, `recurrenceMonthly` (기존 todo와 공유 가능한지 확인 후 재사용 또는 calendar 전용 키).
4. 캘린더 `index.tsx`: `formRecurrence` state, 새 일정 모달에 반복 블록, `createEvent` insert 시 `recurrence` 전달.
5. `loadEvents` / 이벤트 변환: DB row에 `recurrence` 포함되도록 select에 recurrence 추가. `CalendarEvent` 타입에 `recurrence?: string | null` 추가.
6. 타임테이블/이벤트 카드: recurrence 있을 때 뱃지 또는 보조 텍스트 표시.
7. `calendar/edit/[id].tsx`: recurrence state, 폼 블록, update 시 `recurrence` 전달.

---

## Error Handling & Security

- RLS 기존 유지. `recurrence`는 enum처럼 `'daily'|'weekly'|'monthly'|null` 만 허용(클라이언트/서버 검증).
- 길이 제한 없음(4자 이하 값만 사용).

---

## Next Steps

Do(구현) 후 tsc·lint 실행.

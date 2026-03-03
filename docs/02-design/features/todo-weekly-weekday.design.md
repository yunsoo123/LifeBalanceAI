# TO-DO 매주 O 요일 — Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: [todo-weekly-weekday.plan.md](../../01-plan/features/todo-weekly-weekday.plan.md)

---

## Overview

`todos.recurrence = 'weekly'` 일 때 **요일**을 저장하는 `recurrence_weekday` 컬럼 추가.  
UI: 반복 "매주" 선택 시 요일 칩(월~일) 노출, 선택 값 저장·표시.

---

## Data Model

- **todos.recurrence_weekday** SMALLINT nullable.  
  값: 0 = 월요일, 1 = 화, 2 = 수, 3 = 목, 4 = 금, 5 = 토, 6 = 일.  
  `recurrence = 'weekly'` 일 때만 의미 있음; 그 외에는 null 허용.

---

## Schema Change (Migration)

```sql
ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_weekday SMALLINT;
COMMENT ON COLUMN todos.recurrence_weekday IS 'When recurrence=weekly: 0=Mon .. 6=Sun';
```

---

## UI Spec

### 캘린더 탭 — 새 할 일 입력 폼

- 기존 반복 선택: 없음 | 매일 | 매주 | 매월.
- **반복 = "매주" 선택 시** 바로 아래에 **요일 선택** 행 추가.  
  칩: 월, 화, 수, 목, 금, 토, 일. 하나만 선택 가능, 선택 시 `recurrence_weekday` 0~6 저장.
- 반복을 매주에서 다른 값으로 바꾸면 `recurrence_weekday`는 null로 저장(또는 클라이언트에서 전송 시 null).

### 캘린더 탭 — 할 일 목록 각 행

- `recurrence === 'weekly' && recurrence_weekday != null` 이면  
  보조 텍스트로 **"매주 O요일"** 표시 (예: "매주 월요일").  
  i18n: 요일명은 locale 기존 사용(한글/영어).

---

## Implementation Order

1. Migration: `recurrence_weekday` 추가.
2. `types/database.types.ts`: todos Row/Insert/Update에 `recurrence_weekday` 추가.
3. 캘린더 `TodoRow` 타입에 `recurrence_weekday` 추가, `loadTodos` select 포함.
4. 새 할 일 폼: 반복 "매주" 선택 시 요일 칩 행 표시, state `newTodoRecurrenceWeekday`, insert 시 전달.
5. 할 일 행: recurrence=weekly이고 recurrence_weekday 있으면 "매주 {요일}" 표시.

---

## Error Handling & Security

- RLS 유지. `recurrence_weekday`는 0–6만 허용(클라이언트/서버 검증).

---

**Next Steps**: Do 후 tsc·lint 실행.

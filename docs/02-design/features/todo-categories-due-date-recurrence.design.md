# TO-DO 카테고리·날짜·반복 - Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: `docs/01-plan/features/real-device-feedback-round2.plan.md` § 항목 1, 2

---

## Overview

1. **TO-DO 카테고리화**: 할 일에 카테고리(운동, 프로젝트1, 공부 등)를 붙여 목록에서 구분·필터.
2. **TO-DO 날짜·반복·편의**: 마감일(due_date) 설정·표시, 반복 규칙, **할 일 칸에서 날짜 변경** 가능.

---

## Current State

- `todos` 테이블: `id`, `user_id`, `title`, `completed`, `due_date` (DATE, nullable), `event_id`, `created_at`, `updated_at`.
- 캘린더 탭 "할 일" 세그먼트: 목록 표시, 완료 토글, 삭제(롱프레스), 새 할 일 입력(제목만). **due_date 미표시·미설정**, 카테고리 없음.
- 캡처에서 "할 일만"/"둘 다" 저장 시 `tables.todos().insert({ user_id, title })` 만 호출 — due_date 미전달.

---

## Data Model

### 1. 카테고리

- **방안 A**: `todos.category` TEXT nullable — 사용자 입력 또는 프리셋 선택. 단순.
- **방안 B**: `todo_categories` 테이블 + `todos.category_id` — 사용자별 카테고리 관리. 확장 유리.

**선택**: **A**. 첫 버전은 `category TEXT`로 하고, UI에서 프리셋(운동, 프로젝트1, 공부, 기타) + 직접 입력(선택) 지원.

### 2. 반복

- **추가 컬럼**: `todos.recurrence` TEXT nullable. 값: `'daily'` | `'weekly'` | `'monthly'` | null.
- 반복 시 "다음 발생" 생성은 Phase 2에서 별도(오늘은 반복 규칙 저장 + 표시만).

---

## Schema Change (Migration)

```sql
ALTER TABLE todos ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence TEXT;
CREATE INDEX IF NOT EXISTS idx_todos_user_category ON todos(user_id, category);
```

- `due_date` 는 이미 있으므로 추가 없음.

---

## UI Spec

### 캘린더 탭 — "할 일" 세그먼트

1. **목록 각 행**
   - 제목, 완료 체크박스, **due_date 표시**(있을 때만, 예: "2/25"), **category 뱃지**(있을 때만).
   - **날짜 변경**: 행 탭은 기존대로 완료 토글; **날짜 영역 탭** 또는 "날짜 변경" 버튼 → due_date 선택 모달/인라인 → update 후 reload.
2. **새 할 일 추가**
   - 필수: 제목.
   - 선택: 마감일(due_date) 피커, 카테고리 선택(드롭다운 또는 칩: 운동/프로젝트1/공부/기타/직접입력), 반복(없음/매일/매주/매월).
3. **필터(선택)**
   - "전체" | 카테고리별 필터 드롭다운. 첫 버전에서는 목록만 카테고리 표시해도 가능.

### 캡처

- "할 일만" / "둘 다" 저장 시: 기존처럼 placement 모달 후 바로 저장 가능 유지. **선택적으로** "마감일·카테고리 설정" 스텝 추가(모달 한 번 더) 후 insert 시 due_date, category, recurrence 전달.  
- 첫 버전에서는 **캘린더 할 일 칸에서만** 날짜·카테고리·반복 설정 가능하게 하고, 캡처는 제목만 저장해도 됨.

---

## Implementation Order

1. Migration: `category`, `recurrence` 추가.
2. `database.types.ts` 수동 반영(또는 supabase gen types).
3. 캘린더 `loadTodos`: select에 `category`, `recurrence` 포함. `TodoRow` 타입 확장.
4. 캘린더 할 일 목록: 행에 due_date, category 표시; 날짜 탭 시 due_date 변경 모달.
5. 캘린더 새 할 일 입력: due_date 피커, 카테고리 선택, 반복 선택 추가 후 insert.
6. (선택) 캡처에서 할 일 저장 시 due_date/category 모달.

---

## Error Handling & Security

- RLS 기존 유지. category, recurrence는 사용자 입력 sanitize(길이 제한 등).
- recurrence 값은 enum처럼 'daily'|'weekly'|'monthly'|null 만 허용.

---

**Next Steps**: Do(구현) 후 tsc·lint 실행.

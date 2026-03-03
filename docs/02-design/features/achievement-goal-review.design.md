# 성취도·리뷰 연동 — Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: [achievement-goal-review.plan.md](../../01-plan/features/achievement-goal-review.plan.md)

---

## Overview

1. **todos.achievement** 컬럼 추가 (0–100 정수, nullable).
2. 캘린더 "할 일" 목록에서 행별 성취도 설정·표시.
3. 리뷰 탭에서 해당 주 할 일 성취도 집계(평균·완료 건수) 표시.

---

## Data Model

- **todos.achievement** SMALLINT nullable. 값: 0–100 (퍼센트). null = 미설정.
- completed=true여도 achievement는 별도(예: 완료했지만 80%만 했다고 표시 가능). 첫 버전에서는 **completed일 때만** achievement 편집 가능하게 하거나, 항상 편집 가능하게 둠. → **항상 편집 가능** (0–100, null).

---

## Schema Change (Migration)

```sql
ALTER TABLE todos ADD COLUMN IF NOT EXISTS achievement SMALLINT;
COMMENT ON COLUMN todos.achievement IS 'Achievement 0-100 percent, nullable';
```

---

## UI Spec

### 캘린더 탭 — 할 일 목록

- **행 표시**: 기존 due_date, category, "매주 O요일" 외에 **성취도** 표시.  
  achievement가 있으면 "85%" 등 퍼센트 뱃지 또는 작은 텍스트.  
  없으면 "—" 또는 터치 시 설정 유도.
- **성취도 설정**: 행 롱프레스 메뉴에 "성취도 설정" 추가, 또는 행 내 "성취도" 탭 시 모달/인라인에서 0–100 슬라이더 또는 25% 단위 칩(0, 25, 50, 75, 100) 선택 후 update.

**선택**: 행 탭은 기존대로 완료 토글. **별도 버튼 "성취도"** 또는 행 내 성취도 텍스트 탭 시 → 모달에서 슬라이더 또는 칩(0, 25, 50, 75, 100) 선택 후 `tables.todos().update({ achievement }).eq('id', id)`.

### 리뷰 탭

- 해당 주에 **due_date가 해당 주 내**이거나 **created_at이 해당 주 내**인 할 일 목록 로드.
- 집계: (1) 완료 건수 / 전체 건수, (2) 평균 성취도(achievement가 non-null인 것만).  
  표시: 기존 "이번 주 일정" 카드 아래 또는 별도 카드 "이번 주 할 일"에 **할 일 N건, 평균 성취도 M%** (및 선택적으로 완료 수).

---

## Implementation Order

1. Migration: `todos.achievement` 추가.
2. database.types.ts: todos Row/Insert/Update에 achievement 추가.
3. 캘린더: TodoRow 타입, loadTodos select에 achievement. 목록 행에 achievement 표시. 성취도 설정 모달(탭 시): 0/25/50/75/100 칩 또는 슬라이더, update 후 reload.
4. 리뷰: 해당 주 할 일 조회(created_at 또는 due_date 기준). 집계(평균 성취도, 완료 수). "이번 주 할 일" 블록 또는 기존 카드 내 한 줄 추가.

---

## Error Handling & Security

- RLS 유지. achievement는 0–100만 허용(클라이언트/서버 검증).

---

**Next Steps**: Do 후 tsc·lint.

# TO-DO 반복 "매주 O 요일" — Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [real-device-feedback-round3.plan.md](./real-device-feedback-round3.plan.md) § 항목 2, [todo-categories-due-date-recurrence.design.md](../02-design/features/todo-categories-due-date-recurrence.design.md)

---

## Overview

할 일 반복이 **매주**일 때 **요일**(월~일)을 선택할 수 있게 한다.  
기존 `recurrence`: 'daily'|'weekly'|'monthly'|null 에 대해, **weekly** 시 보조 필드로 요일 저장.

---

## Goals

- 사용자가 "매주" 선택 후 **월/화/수/목/금/토/일** 중 하나 선택 가능.
- DB에 요일 저장(`recurrence_weekday` 0=월 … 6=일 또는 동일 의미).
- 목록·카드에 "매주 O요일" 표시.

---

## Out of Scope

- 여러 요일 선택(매주 월·수·금 등) — 1단계는 요일 1개만.
- "다음 발생" 자동 생성.

---

## Success Criteria

- [ ] Migration으로 `recurrence_weekday` 추가.
- [ ] 새 할 일 폼에서 반복=매주일 때 요일 선택 UI 노출, 저장 반영.
- [ ] 할 일 행에 recurrence=weekly이고 recurrence_weekday 있으면 "매주 O요일" 표시.

---

## Next Steps

Design → Do.

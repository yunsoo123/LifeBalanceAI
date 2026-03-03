# 일정 반복 (Event Recurrence) — Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [real-device-feedback-round3.plan.md](./real-device-feedback-round3.plan.md) §4-2, [future-improvements.plan.md](./future-improvements.plan.md) F1

---

## Overview

일정(events)에 **반복 규칙**을 저장·표시하고, 추가/편집 시 "없음 / 매일 / 매주 / 매월" 중 선택할 수 있게 한다.  
실기기 피드백 4번 "일정도 반복 기능 필요" 및 future-improvements F1에 따른 1단계(규칙 저장·표시만, 실제 반복 발생 생성은 Phase 2).

---

## Goals

- 사용자가 일정 추가·편집 시 반복(없음/매일/매주/매월) 선택 가능.
- 일정 목록·카드에 반복 여부 표시.
- DB에 `events.recurrence` 저장 (TEXT, nullable).

---

## Out of Scope (Phase 2)

- "다음 발생" 자동 생성(시리즈 확장).
- 매주 O요일만 반복 등 세부 규칙.

---

## Success Criteria

- [ ] Migration 적용 후 `events.recurrence` 컬럼 존재.
- [ ] 새 일정 모달에서 반복 선택 후 저장 시 recurrence 반영.
- [ ] 일정 편집 화면에서 반복 변경 가능.
- [ ] 타임테이블/목록에서 반복 일정에 반복 뱃지 또는 문구 표시.

---

## Next Steps

Design → Do (migration, types, add-event modal, edit screen, display).

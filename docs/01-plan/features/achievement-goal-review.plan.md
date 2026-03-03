# 성취도·리뷰 연동 — Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [real-device-feedback-round3.plan.md](./real-device-feedback-round3.plan.md) §7, [future-improvements.plan.md](./future-improvements.plan.md) F2

---

## Overview

**할 일(TO-DO)** 단위로 **성취도**(0–100% 또는 완료/부분/미완)를 설정하고, **리뷰 탭**에서 그 주의 할 일 성취를 집계해 "목표 채운 것"을 볼 수 있게 한다.  
실기기 피드백: "일정칸에선 성취도 설정 불가" → 1단계는 **할 일만** 성취도 지원, 일정(events)은 추후 확장.

---

## Goals

- 할 일에 성취도 필드 저장 (0–100 또는 단계형).
- 캘린더 "할 일" 목록에서 항목별 성취도 설정·표시.
- 리뷰 탭에서 해당 주 할 일 성취도 집계·표시 (예: 평균 성취도, 완료 N건).

---

## Out of Scope (Phase 1)

- 일정(events) 성취도 설정.
- "다음 주 제안" 등 AI 연동.

---

## Success Criteria

- [ ] Migration으로 `todos.achievement` 추가.
- [ ] 할 일 행에서 성취도 설정 가능, 저장·표시 반영.
- [ ] 리뷰에서 해당 주 할 일 성취도 집계(평균 또는 완료 건수) 표시.

---

## Next Steps

Design → Do.

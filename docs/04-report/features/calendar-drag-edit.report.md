# 캘린더 타임테이블 드래그 수정 — Report

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Feature**: calendar-drag-edit (F2)  
**Related**: [calendar-drag-edit.plan.md](../../01-plan/features/calendar-drag-edit.plan.md), [calendar-drag-edit.design.md](../../02-design/features/calendar-drag-edit.design.md)

---

## Overview

캘린더 **타임테이블 뷰**에서 이벤트를 롱프레스로 이동 모드 진입 후 셀 탭으로 드롭하는 기능은 설계에 따라 이미 구현되어 있었습니다. 이번 사이클에서 **Plan**을 추가하고, 이동 모드·충돌 모달 문구를 **i18n**으로 통일한 뒤 완료 보고했습니다.

---

## 완료 요약

| 항목 | 상태 |
|------|------|
| 타임테이블 이동 (롱프레스 → 셀 탭) | 이미 구현됨 (updateEventTime, loadEvents) |
| 충돌 감지 및 ConflictModal | 이미 구현됨 |
| 이동 모드 안내·취소·충돌 모달 i18n | ✅ 적용 (t.calendar.timetableMoveHint, timetableMoveCancel, conflictTitle, conflictMessage, conflictMessageWithTitle, conflictCancel, conflictMoveHere) |
| Plan | docs/01-plan/features/calendar-drag-edit.plan.md |

---

## 구현 내용 (이번 사이클)

- **lib/i18n.tsx**: calendar에 timetableMoveHint, timetableMoveCancel, conflictTitle, conflictMessage, conflictMessageWithTitle, conflictCancel, conflictMoveHere 추가 (한/영).
- **app/(tabs)/calendar.tsx**: 이동 모드 바와 ConflictModal에서 위 i18n 키 사용, accessibilityLabel 보강.

---

## 품질

- `npx tsc --noEmit` 통과.

---

## Next Steps

- 실제 드래그(블록이 손가락을 따라 이동)는 설계에서 롱프레스+탭으로 구현된 상태 유지. 추후 PanResponder/gesture-handler로 확장 가능.
- **다음 실행 순서**: F6 노트 강화(notion-style-notes) 또는 D2 빈 상태 통일.

# 캘린더 타임테이블 드래그 수정 — Plan

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [calendar-drag-edit.design.md](../../02-design/features/calendar-drag-edit.design.md), [improvement-ideas-brainstorm.plan.md](./improvement-ideas-brainstorm.plan.md) F2

---

## Overview

캘린더 **타임테이블 뷰**에서 이벤트 블록의 **시간/요일 변경**: 롱프레스로 이동 모드 진입 → 셀 탭으로 드롭. 충돌 시 모달로 "덮어쓸까요?" 선택. 설계(calendar-drag-edit.design.md)에 따라 2025-02-23에 롱프레스+탭 방식으로 구현된 상태를 정리하고, 안내 문구 i18n 및 완료 보고를 진행한다.

---

## 목표

- 타임테이블에서 이벤트 **롱프레스** → 이동 모드 → **셀 탭**으로 드롭.
- 드롭 시 DB `updateEventTime` 반영; **같은 날 겹침** 시 ConflictModal "이 시간대에 다른 일정이 있어요. 덮어쓸까요?" [취소] [이동].
- 실패 시 롤백(loadEvents).

---

## 인수 조건

- [ ] 롱프레스로 이동 모드, 탭으로 드롭 (이미 구현됨).
- [ ] 충돌 감지 및 ConflictModal (이미 구현됨).
- [ ] 이동 모드 안내·취소 버튼 i18n 적용.

---

## 범위

**In scope**

- 타임테이블 이동 UX i18n (한/영).
- Plan·Report 작성, 실행 순서 반영.

**Out of scope**

- 실제 드래그(손가락 따라 블록 이동): 설계에서 롱프레스+탭으로 구현된 상태 유지. 추후 PanResponder/gesture-handler로 확장 가능.

---

## Next Steps

- Design 이미 있음. Do: i18n 추가 및 calendar.tsx 적용 → Report.

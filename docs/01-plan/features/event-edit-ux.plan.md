# 일정 편집 UX (Event Edit UX) — Plan

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [improvement-ideas-brainstorm.plan.md](./improvement-ideas-brainstorm.plan.md) F1

---

## Overview

캘린더에서 이벤트 카드의 **편집(✎) 버튼**을 누르면 현재는 `Alert.alert('Edit', 'Full edit modal in Phase 5')`만 표시되어 실제 수정이 불가능하다. 사용자가 **제목·시간·설명을 수정**할 수 있는 **편집 모달**을 제공하여, 탭 한 번으로 수정 가능하도록 한다.

---

## 목표

- 이벤트 카드에서 [편집] 탭 시 **편집 모달**이 열린다.
- 모달에서 **제목, 설명, 시작 시간, 종료 시간**을 수정할 수 있다.
- [저장] 시 Supabase `events` 테이블이 갱신되고, 화면에 반영된다.
- [취소] 또는 배경 탭 시 모달이 닫힌다.

---

## 인수 조건

- [ ] 편집 버튼 탭 → 모달 표시(기존 Add Event 모달과 유사한 레이아웃·스타일).
- [ ] 제목 필수; 설명·시작/종료 시간 입력 가능.
- [ ] 저장 시 `tables.events().update({ title, description, start_time, end_time }).eq('id', eventId)` 호출 후 목록 갱신.
- [ ] 로그인 사용자만 편집 가능; 실패 시 Alert로 안내.

---

## 범위

**In scope**

- Calendar 탭: 선택된 날짜의 이벤트 리스트에서 [편집] → 편집 모달 → 저장/취소.
- 수정 필드: title, description, start_time, end_time (날짜는 이벤트 기준일 유지; 시간만 변경 가능해도 됨).

**Out of scope**

- 타임테이블 뷰에서의 인라인 편집, 드래그로 시간 변경(기존 updateEventTime 유지).
- 이벤트 색상·반복·all_day 편집(필요 시 추후 확장).

---

## 성공 기준

- `npx tsc --noEmit`, `npx expo lint` 통과.
- 편집 모달에서 제목·설명·시작·종료 수정 후 저장 시 DB 반영 및 화면 갱신.

---

## Next Steps

- **Design**: `docs/02-design/features/event-edit-ux.design.md` — 모달 UI, 필드, API, 에러 처리.
- **Do**: `app/(tabs)/calendar.tsx`에 편집 모달 상태·폼·저장 로직 구현.

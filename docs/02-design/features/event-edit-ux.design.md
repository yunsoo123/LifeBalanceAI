# 일정 편집 UX — Design

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [event-edit-ux.plan.md](../../01-plan/features/event-edit-ux.plan.md)

---

## Overview

캘린더 이벤트 카드의 [편집] 버튼 탭 시 **편집 모달**을 띄우고, 제목·설명·시작 시간·종료 시간을 수정 후 저장하면 Supabase `events`를 갱신하고 로컬 상태를 반영한다.

---

## UI 스펙

### 진입

- 기존 이벤트 카드의 [✎] 버튼 `onPress`에서 **편집 모달 열기** (Alert 제거).
- 전달: 편집 대상 `CalendarEvent` (id, title, start, end, description, color).

### 편집 모달

- **레이아웃**: 기존 Add Event 모달과 동일한 패턴 — `Modal` + `KeyboardAvoidingView` + `ScrollView`, 배경 탭 시 닫기.
- **제목**: "Edit Event" (또는 i18n "일정 수정").
- **필드** (모두 편집 가능):
  1. **Event title** — TextInput, 필수. 기본값: `event.title`.
  2. **Description (optional)** — TextInput. 기본값: `event.description ?? ''`.
  3. **Date** — 읽기 전용 표시(이벤트 날짜). `event.start` 기준 날짜.
  4. **Start time (HH:MM)** — TextInput. 기본값: `event.start`를 "HH:MM" (24h 또는 12h 일관되게).
  5. **End time (HH:MM)** — TextInput. 기본값: `event.end`를 "HH:MM".
- **버튼**: [Cancel] (모달 닫기), [Save] (유효성 검사 후 update 호출). Save 시 로딩 중이면 "Saving..." 등 표시.

### 유효성

- 제목 비어 있으면 Alert "Please enter event title" (또는 i18n) 후 저장 중단.
- 시작/종료 시간 파싱 실패 시 기본값(09:00, 10:00) 또는 Alert로 재입력 유도.

---

## 데이터 / API

- **읽기**: 편집 대상은 이미 `CalendarEvent`로 보유 (선택된 날짜의 이벤트 리스트).
- **쓰기**: `tables.events().update({ title, description, start_time, end_time }).eq('id', event.id)`. `start_time`/`end_time`은 이벤트 날짜 + 편집한 시작/종료 시간으로 조합한 ISO 문자열.
- **로컬 상태**: 저장 성공 시 `loadEvents()` 호출하여 `events` 갱신 후 모달 닫기. 또는 낙관적 업데이트: `setEvents(prev => prev.map(e => e.id === event.id ? { ...e, title, start, end, description } : e))` 후 모달 닫기. 설계는 **loadEvents()로 재조회**로 단순화 권장.

---

## 에러 처리

- **로그인 없음**: Alert "Sign in required" + Sign in 이동 (기존 Add와 동일).
- **update 실패**: Alert "Failed to update event" + 재시도 없음(모달은 유지해 재저장 가능).
- **제목 비어 있음**: Alert "Please enter event title".

---

## 파일 / 컴포넌트

- **파일**: `app/(tabs)/calendar.tsx`.
- **추가 상태**:
  - `eventToEdit: CalendarEvent | null` — 편집 대상; null이면 모달 비표시.
  - (선택) `editFormTitle`, `editFormDescription`, `editFormStartTime`, `editFormEndTime` — 모달 내 입력값. 또는 모달 열릴 때만 `eventToEdit`에서 초기화한 폼 상태 1세트.
- **함수**:
  - `openEditModal(event: CalendarEvent)` — `setEventToEdit(event)`, 폼 필드 초기화.
  - `closeEditModal()` — `setEventToEdit(null)`.
  - `saveEditedEvent()` — 제목 검사, start/end ISO 생성, `tables.events().update(...).eq('id', eventToEdit.id)`, 성공 시 `loadEvents()`, `closeEditModal()`, Alert 성공.
- **시간 포맷**: `event.start`/`event.end` (Date) → "HH:MM" 은 `toLocaleTimeString` 또는 수동 `padStart` (예: 9시 0분 → "09:00"). 24시간 형식 권장.

---

## 체크리스트

- [ ] [편집] 탭 시 Alert 제거, 편집 모달 열림.
- [ ] 모달에 제목·설명·날짜(읽기 전용)·시작 시간·종료 시간 필드.
- [ ] 저장 시 update API 호출, 성공 시 목록 갱신 및 모달 닫기.
- [ ] 취소/배경 탭 시 모달 닫기.

---

**Next Steps**: Do — `calendar.tsx`에 편집 모달·상태·저장 로직 구현.

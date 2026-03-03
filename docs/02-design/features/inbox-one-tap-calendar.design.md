# Inbox 한 번에 캘린더 추가 — Design

**Date**: 2025-02-23  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [inbox-one-tap-calendar.plan.md](../../01-plan/features/inbox-one-tap-calendar.plan.md)

---

## Overview

Inbox 빠른 메모에서 **한 번의 버튼 클릭**으로 일정 파싱(parse-schedule API)과 캘린더 자동 배치(auto-schedule + events insert)까지 연속 실행한다. 2단계(구조화 → 캘린더에 추가)를 1단계로 줄여 사용자 기대에 맞춘다.

---

## 결정 사항

- **단일 CTA**: 기존 "일정으로 구조화"와 "캘린더에 N개 추가"를 **하나의 버튼**으로 통합.
- **버튼 라벨**: `일정으로 구조화하고 캘린더에 추가` (영문: `Parse & add to calendar`).
- **동작**: 클릭 시 (1) parse-schedule API 호출 → (2) 성공 시 즉시 auto-schedule API 호출 → (3) 반환된 eventsToCreate를 DB에 insert → (4) 성공 메시지.
- **파싱만 먼저 보기**: 별도 버튼은 두지 않음. 한 번에 캘린더까지 추가하는 경로만 제공(Plan의 "기존 플로우 유지"는 옵션 B 제거로 단순화).

---

## API / 데이터 (변경 없음)

- `POST /api/inbox/parse-schedule` — body `{ text }`, response `{ events: ParsedScheduleEvent[] }`.
- `POST /api/inbox/auto-schedule` — body `{ parsedEvents, weekStart }`, response `{ eventsToCreate: Array<{ title, start_time, end_time, color }> }`.
- 클라이언트: parse 성공 시 `parsedScheduleEvents` 설정 후 `runAutoSchedule`와 동일한 로직( Supabase auth, insert loop )을 **같은 플로우 안에서** 연속 호출.

---

## UI 스펙

### 빠른 메모 영역 (Quick Note)

- **한 줄 입력**: 기존 `TextInput` + `+` 항목 추가 유지.
- **단일 CTA**: 기존 "일정으로 구조화" 버튼 자리에 하나의 버튼.
  - 라벨: **일정으로 구조화하고 캘린더에 추가** (영문: **Parse & add to calendar**).
  - 비활성화: `!quickAddLine.trim() || oneTapLoading`.
  - 접근성: `accessibilityLabel` 동일 문구.

### 로딩

- **하나의 로딩 상태**: `oneTapLoading` (또는 기존 `scheduleParseLoading`을 전체 플로우용으로 사용).
- 표시: 버튼 내 스피너 + (선택) 문구 "일정 만들기 중..." (버튼 텍스트 대체).
- 파싱 단계와 배치 단계를 UI에서 구분하지 않음.

### 성공 후

- Alert: **캘린더에 N개 일정이 추가되었어요.** (기존과 동일).
- (선택) 파싱된 일정 리스트를 카드로 표시 — **캘린더에 N개 추가** 버튼은 제거(이미 추가됨). 카드는 "추가된 일정" 확인용으로만 사용 가능.

### 에러

- **파싱 실패**: Alert "파싱 실패" + 원인 + [확인] [재시도]. 재시도 시 같은 one-tap 플로우 다시 실행.
- **로그인 필요**: 기존과 동일 Alert, Sign in 이동.
- **auto-schedule 실패 또는 insert 실패**: Alert "일정 저장 실패" + [확인] [재시도]. 재시도 시 **이미 파싱된 결과**(`parsedScheduleEvents`)로 auto-schedule만 다시 실행할 수 있도록, 성공 시 `parsedScheduleEvents`는 유지하고 재시도 시 runAutoSchedule만 호출하는 편이 좋음.  
  - 구현 시: one-tap 함수 내에서 parse 성공 후 in-memory로 `parsedScheduleEvents`를 설정한 뒤 auto-schedule 호출하므로, 실패 시 사용자가 "재시도" 누르면 **같은 one-tap 함수 전체**를 다시 호출해도 됨(이미 파싱된 상태면 parse 스킵하고 배치만 하는 분기도 가능하나, 단순화를 위해 재시도 = 전체 one-tap 재실행).

---

## 컴포넌트 / 코드 변경

- **파일**: `app/(tabs)/inbox.tsx`.
- **상태**:  
  - `scheduleParseLoading` → **oneTapLoading** 하나로 통합. (파싱 중이든 배치 중이든 true 유지.)
  - `parsedScheduleEvents` 유지(성공 후 리스트 표시용).
  - `autoScheduleLoading` 제거하고 `oneTapLoading`으로 대체.
- **함수**:  
  - **parseAndAddToCalendar** (또는 **oneTapParseAndAdd**):  
    1. 한도 체크(checkLimit), quickAddLine 비어 있으면 return.  
    2. setOneTapLoading(true).  
    3. parse-schedule API 호출 → 실패 시 Alert + setOneTapLoading(false) + return.  
    4. setParsedScheduleEvents(events).  
    5. auth.getUser() 실패 시 Alert + setOneTapLoading(false) + return.  
    6. auto-schedule API 호출 → 실패 시 Alert + setOneTapLoading(false) + return.  
    7. eventsToCreate 루프로 insert.  
    8. setCreatedEventIds, setPlacedEvents.  
    9. Alert 성공 메시지.  
    10. setOneTapLoading(false).  
  - `parseScheduleFromInbox` 제거(또는 내부에서만 사용하지 않고 oneTap으로 대체).  
  - `runAutoSchedule`는 one-tap 내부 로직으로 인라인하거나, one-tap에서 parse 성공 후 `runAutoSchedule(events)` 형태로 재사용 가능. 재사용 시 runAutoSchedule에 `events` 인자로 넘겨서 기존 `parsedScheduleEvents` 상태에 의존하지 않도록 하면, one-tap 한 번의 플로우에서 깔끔하게 쓸 수 있음.
- **UI**:  
  - "일정으로 구조화" 버튼 → **일정으로 구조화하고 캘린더에 추가** 한 개.  
  - 파싱 결과 카드: **캘린더에 N개 추가** 버튼 제거. 파싱된 일정 리스트만 표시(성공 후 확인용).  
  - "캘린더에 N개 추가" 별도 버튼 없음.

---

## 에러 처리 요약

| 단계       | 실패 시 동작 |
|------------|----------------|
| 한도 초과  | Alert, return |
| 파싱 API   | Alert + 재시도(재시도 시 one-tap 전체) |
| 로그인     | Alert + Sign in 이동 |
| auto-schedule API | Alert + 재시도 |
| insert 일부 실패 | (기존과 동일) ids만 수집, 성공한 개수로 메시지 |

---

## 체크리스트

- [ ] 단일 버튼 "일정으로 구조화하고 캘린더에 추가" 클릭 시 파싱 → 배치 → insert 한 번에 완료.
- [ ] 로딩 중 하나의 스피너/문구로 표시.
- [ ] 성공 시 "캘린더에 N개 일정이 추가되었어요." Alert.
- [ ] 실패 시 Alert + 재시도 옵션.
- [ ] 파싱 결과 카드는 유지하되 "캘린더에 N개 추가" 버튼 제거.

---

**Next Steps**: Do — `app/(tabs)/inbox.tsx` 수정, 타입/린트 통과 후 수동 테스트.

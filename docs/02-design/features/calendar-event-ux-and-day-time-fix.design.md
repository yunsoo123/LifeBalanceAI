# 캘린더 일정 생성 UX 및 요일/타임테이블 수정 — Design

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [calendar-event-ux-and-day-time-fix.plan.md](../../01-plan/features/calendar-event-ux-and-day-time-fix.plan.md)

---

## Overview

1) 캘린더 **New Event 모달**의 겹침/가독성 해소 및 블록형·i18n 적용.  
2) **Schedule**에서 사용자/AI가 지정한 요일·시간(예: 금요일 오전)을 초기 슬롯 및 "캘린더에 등록"에 반영.  
3) **타임테이블**과 달력이 같은 주를 기준으로 이벤트를 일관되게 표시하도록 주 범위·포커스 동작 명확화.

---

## 1. New Event 모달 (캘린더)

### 1.1 목표

- 겹침/레이아웃 깨짐 방지: **고정된 블록 단위**로 라벨·입력 영역 구분, 스크롤 영역과 키보드 대응을 명확히.
- 모든 사용자 노출 문구 **i18n** (calendar.addEvent.*).
- 날짜는 **선택된 날짜만 표시**하고 변경 시에는 (1단계에서는) 기존처럼 모달 오픈 시점의 `selectedDay` 사용. 시간은 **HH:MM** 검증 유지.

### 1.2 UI 스펙 (블록형)

- **컨테이너**: Modal 내부 `ScrollView`의 `contentContainerStyle`에 `paddingVertical` 충분히, `minHeight` 없이 콘텐츠 기준. 모달 본문에 `maxHeight: '85%'` 유지하되 내부는 **flex를 쓰지 않고** 블록 단위로 세로 쌓기만 해서 겹침 원인 제거.
- **블록 단위**: 각 필드는 반드시 하나의 **Wrapper View**로 감싼다.  
  - 라벨: `Text` (font-semibold, 13px, mb-2).  
  - 입력 영역: `View` (rounded-xl, border, min-h-[48px], px-4) 안에 `TextInput` 또는 날짜/시간 표시용 `Text`.  
  - 블록 간 간격: `mb-4` 또는 `mb-5`.
- **필드 순서**: 제목 → 설명(선택) → 날짜(읽기 전용 표시) → 시작 시간(HH:MM) → 버튼 행(Cancel / Create).
- **키보드**: `KeyboardAvoidingView` 유지. 스크롤은 `keyboardShouldPersistTaps="handled"` 유지.
- **접근성**: 기존처럼 버튼·모달에 `accessibilityLabel` 유지.

### 1.3 i18n 키 (calendar)

- `newEvent`: "새 일정" / "New Event"
- `eventTitle`: "제목" / "Event title"
- `eventTitlePlaceholder`: "제목 입력" / "Enter title"
- `descriptionOptional`: "설명 (선택)" / "Description (optional)"
- `descriptionPlaceholder`: "설명 추가" / "Add description"
- `date`: "날짜" / "Date"
- `startTime`: "시작 시간 (HH:MM)" / "Start time (HH:MM)"
- `startTimePlaceholder`: "09:00" (공통 또는 ko/en 동일)
- `cancel`: "취소" / "Cancel"
- `create`: "만들기" / "Create"
- `creating`: "저장 중..." / "Creating..."

(기존 `addEvent`는 FAB 등에 쓰이므로 유지. `editEvent`는 이미 있음.)

### 1.4 동작

- `createEvent()`: 기존 로직 유지. 제목 필수, `formStartTime` HH:MM 파싱, `selectedDay`에 시간 적용 후 `tables.events().insert`, 이후 `loadEvents()` 호출 및 모달 닫기.

---

## 2. Schedule — 요일/시간 의도 반영

### 2.1 데이터

- **AI 스키마 확장**: `Schedule`의 `activities[]` 항목에 선택 필드 추가.  
  - `preferredDayOfWeek?: number` — 0=월 … 6=일 (ISO 요일이 아니라 현재 앱 규칙: 0=Mon, 6=Sun).  
  - `preferredStartMinutes?: number` — 0~1440 (자정부터 분 단위).  
- **시스템 프롬프트**: 사용자가 요일·시간을 명시한 경우(예: "금요일 오전만", "Friday morning only") 해당 활동에 `preferredDayOfWeek`, `preferredStartMinutes`를 설정하라고 안내. 예: 금요일 오전 9시 → preferredDayOfWeek: 4, preferredStartMinutes: 540.

### 2.2 로직

- **getEffectiveSlot**:  
  - override가 있으면 기존처럼 override 사용.  
  - 없으면 `activity.preferredDayOfWeek` / `activity.preferredStartMinutes`가 있으면 사용.  
  - 둘 다 없으면 기존 기본값: `dayOfWeek: index % 7`, `startMinutes: 9*60 + offsetMinutes`.
- **addToCalendar**: 변경 없음. 이미 `getEffectiveSlot`으로 계산한 `slot.dayOfWeek`, `slot.startMinutes`로 insert하므로, AI가 preferred를 주면 그대로 반영됨.

### 2.3 유지보수

- 요일/시간 규칙(0=월, 분 단위)은 `schedule-generator` 타입과 `getEffectiveSlot` 한 곳에서만 해석. 주석으로 명시.

---

## 3. 타임테이블 표시 일치

### 3.1 현재 동작

- 이벤트 로드: `getMonthBounds(viewingMonth)` 로 해당 **월** 전체 조회.  
- 타임테이블: `getWeekDatesFor(viewingMonth)` 로 해당 월 1일이 속한 **주**의 월~일 7일.  
- Schedule에서 "캘린더에 등록" 후 `focusWeek=YYYY-MM-DD`(월요일) 로 이동하면 `setViewingMonth(d)` 로 그 날짜를 넣음. 그 달의 1일이 속한 주가 아닐 수 있음(예: focusWeek가 2월 22일이면 2월 22일이 viewingMonth가 되고, 2월 1일이 속한 주은 1/27~2/2라서 2/22 일정이 타임테이블에 안 나올 수 있음).

### 3.2 수정

- **focusWeek 처리**: `focusWeek`가 있을 때 `viewingMonth`를 **해당 주의 월요일이 속한 달**로 설정하면, `getMonthBounds(viewingMonth)`에 그 달이 포함되고, `getWeekDatesFor(viewingMonth)`는 "그 달 1일이 속한 주"를 주므로 여전히 다를 수 있음.  
- **권장**: `focusWeek`(월요일)이 들어오면, **그 주의 월요일 날짜**를 기준으로 `viewingMonth`를 설정하는 것은 유지하되, 타임테이블에 표시하는 **주**를 "viewingMonth의 1일이 속한 주"가 아니라 **현재 보고 있는 주**로 명확히 한다. 즉, `viewingMonth`만으로는 "이번에 표시할 주"가 달라질 수 있으므로, **주 전용 state**를 두는 편이 유지보수에 좋다.  
- **1단계 최소 수정**: focusWeek로 캘린더 진입 시 `viewingMonth`를 `focusWeek`의 **그 주 월요일**로 설정. 그러면 `getMonthBounds(viewingMonth)`는 그 주가 속한 달을 로드하고, `getWeekDatesFor(viewingMonth)`에 넘기는 값을 **그 주 월요일**로 맞춘다.  
  - 즉, `getWeekDatesFor`를 "viewingMonth가 아니라 **현재 표시할 주의 기준일(월요일)**"을 받도록 바꾸거나,  
  - 타임테이블용 주를 `viewingMonth`에서 파생하지 말고, **timetableWeekStart** 같은 state를 두고, focusWeek가 있으면 그걸로 설정, 없으면 이번 주 월요일.  
- **구체안**:  
  - `timetableWeekStart: string | null` (YYYY-MM-DD, 월요일) state 추가.  
  - `params.focusWeek`가 있으면 `timetableWeekStart = focusWeek`, `viewingMonth = new Date(focusWeek + 'T12:00:00')` (달 이동도 이 날짜 기준).  
  - 타임테이블의 주: `getWeekDatesForTimetable(timetableWeekStart ?? getStartOfWeek())` 로 7일 배열 생성.  
  - 이벤트는 이미 월 단위로 로드되므로, 해당 주가 viewingMonth와 다른 달이면? 예: 1월 27일 주를 보려면 viewingMonth를 1월로 두고, getWeekDatesFor(1월)은 1/27~2/2를 주지 않을 수 있음(1월 1일이 수요일이면 1/1 주는 12/29~1/4). 그래서 **타임테이블 주**를 별도 state로 두고, 그 주가 속한 달을 추가로 로드하거나, loadEvents를 **월 + 이번 주가 다른 달이면 그 달도** 로드하도록 확장하는 편이 안전.  
  - **단순화(1단계)**: loadEvents는 계속 **현재 viewingMonth + timetableWeekStart가 다른 달이면 그 달도** 조회해서 합치기. 또는 loadEvents에서 조회 범위를 "viewingMonth 달 + timetableWeekStart가 속한 달"로 해서 두 달치를 가져오기. 그러면 타임테이블에 항상 그 주 이벤트가 포함됨.  
  - 더 단순: **timetableWeekStart**만 도입하고, 타임테이블 렌더 시 사용하는 7일은 이걸로 계산. loadEvents는 기존처럼 viewingMonth만 쓰면, "다른 달 주"를 보면 이벤트가 안 나올 수 있음. 따라서 loadEvents를 **주 단위 확장**: timetableWeekStart가 있으면 그 주의 start/end(월 00:00 ~ 일 23:59)를 포함하도록 쿼리 범위를 넓히거나, viewingMonth를 timetableWeekStart가 속한 달로 동기화.  
  - **최소 변경 제안**:  
    1. `timetableWeekStart` state 추가. 초기값 `getStartOfWeek()`.  
    2. focusWeek가 있으면 `setTimetableWeekStart(focusWeek)`, `setViewingMonth(new Date(focusWeek + 'T12:00:00'))`.  
    3. 타임테이블의 7일: `timetableWeekStart` 기준으로 월~일 계산.  
    4. loadEvents: `monthStart`/`monthEnd`에 더해, **timetableWeekStart가 속한 주**의 start/end가 month 범위 밖이면 쿼리 범위를 확장해서 두 달치 이벤트를 가져오거나, 한 번 더 조회해서 merge. (또는 단순히 viewingMonth를 "timetableWeekStart의 달"로 맞춰서 한 달만 로드해도, 그 주가 해당 달에만 있으면 OK. 1/27 주는 1월과 2월에 걸치므로, 1월만 로드하면 2/1, 2/2 이벤트가 빠짐. 그래서 loadEvents를 확장하는 게 맞음.)  
    5. loadEvents 확장: `timetableWeekStart`가 있으면 그 주의 월요일 00:00 ~ 일요일 23:59를 계산하고, 이 범위가 현재 monthStart~monthEnd 밖이면 해당 주가 속한 달도 조회해 events에 merge (중복 제거).

이렇게 하면 "캘린더에 등록" 후 focusWeek로 넘어갔을 때, 그 주가 타임테이블에 정확히 나오고, 해당 주 이벤트가 달력/타임테이블 둘 다에 보인다.

---

## 4. 구현 순서 (코드 꼬이지 않게)

1. **i18n** — calendar.newEvent, eventTitle, descriptionOptional, date, startTime, cancel, create, creating 등 추가.  
2. **New Event 모달** — 블록형 레이아웃으로 마크업 정리, i18n 적용, 기존 createEvent 로직 유지.  
3. **Schedule AI 스키마** — preferredDayOfWeek, preferredStartMinutes 추가, 시스템 프롬프트 보강.  
4. **getEffectiveSlot** — preferred 반영.  
5. **Calendar 타임테이블** — timetableWeekStart 도입, focusWeek 연동, loadEvents 범위 확장(주가 달에 걸친 경우).

---

## 5. 인수 조건 체크

- [ ] New Event 모달에서 블록형으로 라벨/필드가 겹치지 않고, i18n 적용됨.  
- [ ] "금요일 오전 [활동]" 요청 시 Schedule 카드에 금요일로 표시되고, 캘린더에 등록 시 금요일로 저장됨.  
- [ ] Schedule에서 캘린더로 focusWeek 이동 시, 해당 주가 타임테이블에 표시되고 그 주 이벤트가 달력·타임테이블 모두에 보임.

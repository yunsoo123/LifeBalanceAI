# Design: 스케줄 결과 수정 (드래그/편집)

**Date**: 2025-02-23  
**Plan**: [production-upgrade.plan.md](../../01-plan/features/production-upgrade.plan.md) — Track 3  
**Project**: Mendly (LifeBalanceAI)

---

## 목표

- **Schedule** 탭에서 AI가 생성한 주간 스케줄(활동 리스트/결과 카드)을 사용자가 **시간·요일 변경** 가능.
- 드래그 또는 간단 편집(시간/요일 선택) 후 저장, "캘린더에 등록" 시 반영.

### 인수 조건 (Plan §5)

- [ ] Schedule 결과 카드/리스트에서 "시간/요일 변경" 가능 (드래그 또는 폼)
- [ ] 변경 시 충돌 검사 및 경고
- [ ] "캘린더에 등록" 시 최종 반영

---

## 1. UI 구조

### 1.1 결과 카드 이후

- **기존**: ResultCard + 활동 리스트(이름, h/week, optimalTime) + "캘린더에 등록하기", "일정 저장", "다시 만들기".
- **추가**: 각 활동 행에 **"시간 변경"** 버튼.
  - **Option A (본 설계)**: 활동 행 "시간 변경" → **TimeEditModal** (요일 + 시작 시간 선택) → 적용 시 overrides 반영.
  - **Option B (추가)**: 주간 미니 타임테이블 + 블록 드래그. Track 2 컴포넌트 재사용 시 별도 확장.

### 1.2 플로우

1. AI 스케줄 생성 완료 → 활동 리스트 표시.
2. 활동 행 **"시간 변경"** → TimeEditModal 열림 → 요일(월~일), 시작 시간 선택 → [적용] 시 **충돌 검사** → 충돌 없으면 overrides 반영, 있으면 경고 "이 시간대에 이미 다른 활동이 있어요." 후 재선택 유도.
3. **"캘린더에 등록하기"** → 각 activity에 대해 overrides[index] 있으면 해당 요일·시작 시간으로, 없으면 기존 로직(9시부터 offset)으로 `start_time`/`end_time` 계산 → `events` insert.

---

## 2. 데이터·상태

### 2.1 타입

- **schedule**: 기존 `ScheduleResult` — `activities: { name, hoursPerWeek, optimalTime }[]`.
- **overrides**: `Record<number, { dayOfWeek: number; startMinutes: number }>`  
  - 키: 활동 인덱스 (0-based).  
  - 값: `dayOfWeek` 0=월 … 6=일 (getStartOfWeek 기준 주의 요일). `startMinutes`: 0~1440 (예: 540 = 09:00).

### 2.2 addToCalendar 확장

- **기존**: `dayOffset = i % 7`, 9시 + offsetMinutes, duration = `max(30, round(hoursPerWeek/7*60))`, gap 60분.
- **변경**: `overrides[i]`가 있으면  
  - `startDate = weekStartDate + overrides[i].dayOfWeek` 일자,  
  - 해당 일 00:00 + `overrides[i].startMinutes` 분으로 시작.  
  - duration은 동일. 없으면 기존 로직 유지.

### 2.3 충돌 검사

- **범위**: 같은 주(weekStart) 내, overrides에 있는 활동끼리 + overrides 없는 활동은 기존 기본 배치로 가정한 시간대로 비교.
- **규칙**: 두 활동의 [start, end) 구간이 겹치면 충돌. 적용 시 "이 시간대에 이미 다른 활동이 있어요." 표시, overrides 갱신하지 않음.

---

## 3. API

- **캘린더 등록**: 신규 API 없음. 클라이언트 `addToCalendar`에서 `overrides` 상태를 사용해 각 activity의 `start_time`/`end_time` 계산 후 기존 `tables.events().insert(...)` 호출.

---

## 4. 컴포넌트

### 4.1 Schedule 화면 (app/(tabs)/schedule.tsx)

- 상태 추가: `overrides: Record<number, { dayOfWeek: number; startMinutes: number }>` (useState, 초기값 {}).
- 스케줄 새로 생성/다시 만들기 시 `setOverrides({})`로 초기화.
- 활동 리스트 각 행에 **"시간 변경"** 버튼 → onPress 시 `setTimeEditActivityIndex(index)`, `setShowTimeEditModal(true)`.

### 4.2 ActivityRow (인라인 또는 공통 컴포넌트)

- 기존: 아이콘, 이름, h/week, optimalTime.
- 추가: **"시간 변경"** Pressable (min 44dp). 표시: overrides[index] 있으면 "월 09:00" 등 요약 표시(선택).

### 4.3 TimeEditModal

- **Props**: visible, activityIndex, activityName, initialDayOfWeek, initialStartMinutes, onApply(dayOfWeek, startMinutes), onCancel.
- **UI**: 요일 선택 (월~일 7개 버튼 또는 Picker), 시작 시간 (30분 단위 슬롯 06:00~22:00 또는 Picker). [취소] [적용].
- **적용**: 부모에서 충돌 검사 후, 충돌 없으면 `setOverrides(prev => ({ ...prev, [activityIndex]: { dayOfWeek, startMinutes } }))`, 모달 닫기. 충돌 시 Alert 후 모달 유지.

---

## 5. 에러·경계

- **충돌**: "이 시간대에 이미 다른 활동이 있어요. 다른 요일이나 시간을 선택해 주세요." → TimeEditModal 유지.
- **캘린더 등록 실패**: 기존과 동일 Alert.
- **저장 실패**: 기존과 동일 Alert.

---

## 6. 보안

- RLS: `events` insert는 기존 정책(user_id = auth.uid())만 사용. 변경 없음.

---

**Implemented (2025-02-23)**: overrides state + reset on new schedule/다시 만들기; getEffectiveSlot + hasScheduleConflict; addToCalendar uses overrides for start_time/end_time; TimeEditModal (요일 7버튼, 30분 단위 6:00–22:00, 적용/취소); 활동 행에 "시간 변경" + override 요약(요일 시각); 충돌 시 Alert 후 모달 유지.

# Phase 1 - Calendar & Capture Quick Wins - Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: [real-device-feedback-improvements.plan.md](../../01-plan/features/real-device-feedback-improvements.plan.md)

---

## Overview

실기기 테스트 피드백 반영 Phase 1: 캘린더 3건(오늘 표시, 다크모드 요일 색, 헤더 컴팩트) + 캡처 1건(일정 저장 시 날짜·시간 지정). 디자인 선행 후 구현하여 작업물 일관성 유지.

---

## 1. 캘린더 – 오늘 날짜 "투데이" 표시 (#3)

### 1.1 요구사항

- **월간 그리드**: 오늘인 날짜 셀에 "오늘" / "Today" 텍스트가 보여야 함. (현재는 테두리·색만 있음)
- **타임테이블**: 이번 주 뷰에서 "오늘"인 열(요일)에 시각적 구분 또는 라벨이 있으면 좋음 (선택).

### 1.2 스펙

| 항목 | 내용 |
|------|------|
| **i18n** | `calendar.todayLabel`: ko "오늘", en "Today" (이미 `t.calendar.today`가 '오늘' 등으로 있을 수 있음 — 확인 후 재사용 또는 키 통일) |
| **월간 그리드** | 오늘 셀(`isToday === true`) 내부, 날짜 숫자 **아래** 또는 **옆**에 작은 텍스트로 `t.calendar.todayLabel` 표시. 폰트: `typography.fontSize.caption` 또는 10~11px, 색: `colors.text.secondary` / `colors.text.secondaryLight` (theme 대응). |
| **타임테이블** | 요일 헤더 행에서 오늘인 요일 컬럼에만 "오늘" 뱃지 또는 작은 라벨 표시 (선택). 없으면 월간만 적용. |
| **파일** | `app/(tabs)/calendar/index.tsx` — 월 그리드 렌더 부분, 타임테이블 요일 헤더 부분. |

### 1.3 구현 순서

1. i18n에 `calendar.todayLabel` 추가(없을 경우).
2. 월간 그리드 셀: `isToday`일 때 날짜 아래에 `<Text>{t.calendar.todayLabel}</Text>` 추가, style은 design-system 색·폰트.
3. (선택) 타임테이블 요일 헤더에서 오늘 요일 컬럼에 동일 라벨 표시.

---

## 2. 캘린더 – 다크모드 요일 헤더 색 (#5)

### 2.1 요구사항

- 다크 모드에서 월~일 요일 라벨(S, M, T, …)이 배경과 대비되어 잘 보여야 함. 현재 검정에 가깝게 보인다는 피드백.

### 2.2 스펙

| 항목 | 내용 |
|------|------|
| **대상** | 월간 그리드 상단 요일 헤더 행의 `Text` (WEEKDAY_LABELS). |
| **색상** | `style={{ color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight }}` (design-system 명시). Tailwind만 쓰지 말고 `style` prop으로 지정. |
| **타임테이블** | 타임테이블 내 요일 컬럼 헤더 텍스트도 동일 규칙 적용. |
| **파일** | `app/(tabs)/calendar/index.tsx` — 요일 헤더가 렌더되는 두 곳. |

### 2.3 구현 순서

1. 월간 요일 헤더 `Text`에 `style={{ color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight }}` 적용.
2. 타임테이블 요일 헤더(요일명·날짜) `Text`에 동일 색 규칙 적용.

---

## 3. 캘린더 – 월/년·월간·이번 주 박스 컴팩트화 (#6)

### 3.1 요구사항

- "2026년 3월" + 월간/이번 주 영역이 너무 크고 글씨만 있어 디자인적으로 개선.
- 헤더 컴팩트화, 월/년과 뷰 전환의 시각적 구분.

### 3.2 스펙

| 항목 | 내용 |
|------|------|
| **월/년 네비 영역** | `px-5 pt-4 pb-2` → `px-4 pt-3 pb-2` 수준으로 축소. 좌우 화살표 버튼 `min-h-[44px]` 유지(터치 영역). 중앙 "2026년 3월" 텍스트는 `fontSize: typography.fontSize.body` 또는 15px, `fontFamily: fontFamily.bold`, 색은 기존 유지. |
| **월간/이번 주 토글** | `marginHorizontal: 20, marginBottom: 12` → `marginHorizontal: 16, marginBottom: 8`. 토글 내부 패딩 `padding: 4` 유지. "월간"/"이번 주" 텍스트는 `text-[12px]` 유지. 전체적으로 카드 내부 상단 영역이 한 단계 줄어든 인상. |
| **캡션 활용 (선택)** | "2026년 3월" 위에 작은 캡션 "Calendar" 등 넣을 수 있으나, 기존 캘린더 상단 "Schedule" / "Calendar" 구조와 중복되지 않도록. 여기서는 **패딩·마진 축소**만 필수, 캡션은 선택. |
| **파일** | `app/(tabs)/calendar/index.tsx` — 달력 카드 내부 View (월 네비 + 토글). |

### 3.3 구현 순서

1. 월 네비 영역 View의 padding·pt·pb 축소.
2. 월간/이번 주 토글 View의 marginHorizontal·marginBottom 축소.
3. 필요 시 캡션 추가(선택).

---

## 4. 캡처 – 일정 저장 시 날짜·시간 지정 (#2)

### 4.1 요구사항

- "일정만" 또는 "둘 다" 선택 후 저장할 때, 캘린더에 넣는 일정에 대해 **날짜 1개** + **시작 시간**(또는 시작+종료)을 사용자가 지정할 수 있어야 함.
- 파싱 결과가 있으면 해당 값을 기본값으로 채움.

### 4.2 현재 플로우 (참고)

- Capture index: quickAdd 입력 → 저장 버튼 → placement 모달(일정만/할 일만/둘 다) → `handleSaveWithPlacement(placement)`.
- "일정만"/"둘 다"일 때: parse API 호출 → 결과 이벤트들을 **기본 날짜·시간**으로 캘린더에 insert. (현재 사용자에게 날짜/시간 선택 UI 없음.)

### 4.3 스펙

| 항목 | 내용 |
|------|------|
| **트리거** | placement에서 "일정만" 또는 "둘 다" 선택 후, **저장 실행 전**에 "날짜·시간 선택" 단계 추가. (옵션 A: 모달에서 선택 후 "다음" → 날짜/시간 모달. 옵션 B: placement 확인 후 바로 날짜/시간 모달 띄우고 확인 시 저장.) **권장: B** — placement 선택 후 날짜·시간 모달 표시, "저장" 시 기존 로직 호출하되 선택한 날짜·시간 사용. |
| **날짜** | **1개** 날짜 선택. 기본값: 오늘(`new Date()`). DatePicker 또는 캘린더에서 선택. (기존 캘린더 add 이벤트 모달의 날짜 선택 UI 재사용 가능하면 재사용.) |
| **시간** | **시작 시간** 필수. **종료 시간** 또는 **소요 시간(분)** 중 하나. 기본: 시작 09:00, 종료 10:00 (1시간). 파싱 결과가 있으면 첫 이벤트의 start/end를 기본값으로. |
| **복수 이벤트** | 파싱 결과가 여러 건이면: (1) 모두 같은 날짜, 첫 이벤트 시작/종료만 사용자 선택하고 나머지는 오프셋 유지 — 또는 (2) 사용자는 "하나의 날짜 + 하나의 시간대"만 선택하고, 그 날짜에 첫 이벤트만 넣고 나머지는 동일 오프셋으로. **단순화**: 사용자 선택은 **날짜 1개 + 시작 시간 + 종료 시간(또는 소요)**. insert 시 파싱된 여러 이벤트가 있으면, 선택한 날짜와 선택한 시작 시간을 기준으로 1번째 이벤트만 넣거나, 전부 같은 날에 시간 오프셋 유지. (구현 시: 한 건만 넣는 방식으로 단순화 권장 — 여러 건이면 반복 저장 또는 별도 플로우.) |
| **UI** | 모달: 제목 "일정 날짜·시간", 날짜 선택(앞/뒤 화살표 또는 날짜 픽커), 시작 시간(TimeWheelPicker 또는 텍스트 입력), 종료 시간 또는 소요(분). 버튼: "취소", "저장". design-system 색·font·padding 사용. |
| **데이터** | `handleSaveWithPlacement(placement)` 호출 시, `placement === 'calendar' || placement === 'both'`이면 먼저 날짜·시간 모달 표시 → 사용자 선택 후 해당 `date`, `startTime`, `endTime`(또는 duration)을 넘겨 insert 시 사용. |
| **파일** | `app/(tabs)/capture/index.tsx` — placement 모달 다음에 날짜·시간 모달 상태 추가, 기존 create event 로직에 날짜·시간 인자 전달. |

### 4.4 구현 순서

1. 캡처 index에 상태: `eventDate: Date`, `eventStartTime: string`, `eventEndTime: string` (또는 `eventDurationMinutes: number`).
2. placement "일정만"/"둘 다" 선택 시, 기존처럼 바로 `handleSaveWithPlacement` 호출하지 않고, **날짜·시간 선택 모달** 표시.
3. 날짜·시간 모달 UI 추가 (날짜 1개, 시작/종료 TimeWheelPicker 또는 Input). 기본값: 오늘, 09:00–10:00. 파싱 결과가 있으면 첫 이벤트 start/end로 채움.
4. 모달 "저장" 시 `handleSaveWithPlacement(placement, { date, startTime, endTime })` 형태로 호출. 내부에서 캘린더 insert 시 해당 날짜·시간 사용.
5. 단일 이벤트만 넣는 방식으로 단순화: 파싱 결과가 여러 건이어도 사용자가 선택한 날짜·시간으로 **1건**만 생성. (다건은 추후 개선.)

---

## 5. 구현 체크리스트 (TO-DO 순서)

1. **#3** 캘린더 오늘 표시 — i18n + 월간 그리드 + (선택) 타임테이블.
2. **#5** 캘린더 다크모드 요일 색 — 월간·타임테이블 요일 헤더 style.
3. **#6** 캘린더 헤더 컴팩트 — 패딩·마진 축소.
4. **#2** 캡처 일정 날짜·시간 — 모달·상태·저장 로직 연동.
5. **Quality** — `npx tsc --noEmit`, `npx expo lint` 실행.

---

## 6. Next Steps

- Phase 1 구현 완료 후 자가 테스트 통과하면 완료 리포트에 반영.
- Phase 2(노트·스케줄·리뷰 디자인)는 별도 design → do.

# 캡처 일정 저장 시 날짜·시간 지정 — Design Spec

**Date**: 2026-02-22  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: [real-device-feedback-improvements.plan.md](../../01-plan/features/real-device-feedback-improvements.plan.md) §4 항목 2

---

## 1. 목표

캡처에서 "일정만" 또는 "둘 다" 선택 후 저장할 때, **사용자가 일정의 날짜와 시간을 지정**할 수 있게 한다.

---

## 2. 현재 플로우

1. 사용자가 텍스트 입력 후 저장 버튼 → 배치 모달(일정만 / 할 일만 / 둘 다)
2. "일정만" 또는 "둘 다" 선택 시: parse API → auto-schedule API → `eventsToCreate` 배열을 그대로 DB insert (날짜·시간은 API 결과만 사용)

---

## 3. 변경 플로우

1. 배치 모달에서 "일정만" 또는 "둘 다" 선택
2. **캘린더가 포함된 경우**: **날짜·시간 선택 모달** 표시  
   - **날짜**: 단일 날짜 선택 (기본값: 오늘). 캘린더 스타일 또는 날짜 스트립/피커.  
   - **시작 시간**: 기본 09:00 (파싱 결과 첫 이벤트의 start가 있으면 해당 시간으로 기본값).  
   - **종료 시간**: 기본 10:00 (또는 파싱 첫 이벤트의 end).  
   - 버튼: [취소], [저장]
3. [저장] 시: 기존대로 parse → auto-schedule 호출.  
   - **단일 이벤트로 저장**: `eventsToCreate` 중 **첫 번째만** 사용하고, 그 **제목**과 **소요 시간(종료−시작)** 은 유지하되 **날짜·시작 시각**을 사용자가 고른 값으로 교체하여 1건만 insert.  
   - (선택) 여러 건이면 첫 건만 사용자 날짜/시간으로 하고 나머지는 같은 날 기준 상대 오프셋으로 insert — 우선은 **1건만** 저장하는 단순 버전으로 구현 가능.
4. "할 일만" 선택 시에는 기존과 동일(날짜·시간 모달 없음).

---

## 4. UI 요구사항

- **모달**: 캡처 배치 모달과 동일한 톤(design-system, rounded-[20px], getSurface).  
- **날짜**: `Pressable` 날짜 스트립(오늘, 내일, +날짜 선택) 또는 기존 캘린더의 `addFormDate` 형태의 날짜 1개 선택.  
- **시작/종료**: 기존 `TimeWheelPicker` 재사용 또는 00:00~24:00 선택.  
- **접근성**: 모든 컨트롤에 `accessibilityLabel`.  
- **i18n**: 라벨·버튼은 `t.capture.*` 또는 `t.calendar.*` 사용.

---

## 5. 데이터·API

- **변경 없음**: parse API, auto-schedule API 시그니처 유지.  
- **클라이언트**: 사용자 선택 `{ date: Date, startTime: string, endTime: string }` 저장 후, insert 시 `start_time`/`end_time`을 해당 날짜 + startTime/endTime으로 생성.

---

## 6. 구현 순서 제안

1. 캡처 화면에 상태 추가: `eventDate`, `eventStartTime`, `eventEndTime` (기본: 오늘, 09:00, 10:00).  
2. 배치 모달에서 "일정만"/"둘 다" 선택 시, 캘린더 포함이면 **날짜·시간 모달**을 먼저 띄움(또는 인라인 섹션).  
3. 모달에서 날짜·시작·종료 선택 후 [저장] 시 `handleSaveWithPlacement(placement)` 호출 시 **선택한 date/start/end** 전달.  
4. `handleSaveWithPlacement` 내부: parse → auto-schedule 후, **eventsToCreate의 첫 항목**에 대해 `start_time`/`end_time`을 사용자 선택 날짜·시간으로 덮어쓰고 **1건만** insert (또는 전체를 해당 날짜 기준으로 시프트).

---

**Next**: 위 순서로 `app/(tabs)/capture/index.tsx` 수정. 기존 API 유지, UI만 확장.

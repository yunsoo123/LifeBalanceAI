# Design: 캘린더 타임테이블 드래그 수정

**Plan**: [production-upgrade.plan.md](../../01-plan/features/production-upgrade.plan.md) — Track 2

---

## 목표

- 캘린더 **타임테이블 뷰**에서 이벤트 블록을 **드래그**하여 시간/요일 변경.
- 드롭 시 DB 업데이트, **충돌 시 경고** 후 저장/되돌리기 선택.

---

## 1. UI 구조

### 1.1 타임테이블 그리드

- **기존**: `viewMode === 'timetable'` 시 그리드 렌더. 시간 행(09:00, 13:00, 18:00 등), 요일 열(Mon~Sun).
- **추가**: 각 이벤트 블록을 **드래그 가능** 컴포넌트로 래핑. 드래그 중 시각 피드백(오프셋, 반투명). 드롭 대상 셀 하이라이트.

### 1.2 드래그 동작

| 동작 | 설명 |
|------|------|
| 드래그 시작 | 블록 롱프레스 또는 터치 후 드래그. 블록이 손가락을 따라 이동. |
| 드롭 | 셀 위에서 손을 뗌. 해당 셀의 시작 시간·요일로 이벤트 start_time/end_time 갱신. duration은 유지. |
| 충돌 | 같은 요일·같은 사용자 내 겹치는 시간 감지. 드롭 시 "이 시간대에 다른 일정이 있어요. 덮어쓸까요?" 또는 "다른 칸을 선택해 주세요." |

### 1.3 시각

- 블록 색상: 기존 goal/카테고리 색 유지.
- 드래그 중: opacity 0.9, elevation/shadow 강조.
- 드롭 가능 셀: 테두리 또는 배경 강조.

---

## 2. 데이터·API

### 2.1 상태

- **events**: 기존 events fetch (주간). start_time, end_time, title, color 등.
- **draggingEventId**: 드래그 중인 이벤트 id.
- **dropTarget**: { dayIndex: number, startMinutes: number } (드롭 예정 셀).

### 2.2 API

- **PATCH** events id 또는 Supabase tables.events().update({ id }, { start_time, end_time }).
- **Request**: { start_time: ISO string, end_time: ISO string }.
- **Response**: 업데이트된 row 또는 200.
- **충돌 검사**: 클라이언트에서 같은 주·같은 user 내 다른 이벤트와 겹치면 경고. (선택: 서버에서 검사 후 409 반환.)

---

## 3. 컴포넌트·라이브러리

- **TimetableGrid**: 기존 calendar timetable 영역. 자식으로 **DraggableEventBlock** 목록.
- **DraggableEventBlock**: react-native-gesture-handler 또는 PanResponder로 드래그. 위치 계산: 셀(행,열) → start_time/end_time.
- **ConflictModal**: "이 시간대에 다른 일정이 있어요. 덮어쓸까요? [취소] [덮어쓰기]".

### 3.1 라이브러리 선택

- **Option A**: react-native-gesture-handler + react-native-reanimated로 직접 드래그 제스처 구현.
- **Option B**: 타임테이블을 절대 위치 레이아웃으로 두고, PanResponder로 블록 이동.
- **권장**: Gesture Handler의 PanGestureHandler로 블록 이동, onEnd에서 가장 가까운 셀에 스냅.

---

## 4. 에러·경계

- 업데이트 실패: "일정 변경에 실패했어요." + 롤백(이전 start/end 복원).
- 오프라인: 큐에 넣고 복귀 시 동기화(기존 패턴).

---

## 5. 보안

- RLS: events update 시 user_id = auth.uid() 조건만 허용.

---

**Implemented (2025-02-23)**: Long-press on event block in timetable to enter move mode → tap target cell to drop. Conflict detection on same day; ConflictModal "Move here anyway?" [Cancel] [Move here]. `updateEventTime` via Supabase `events().update()`. Rollback on failure (reload events). No react-native-gesture-handler; used long-press + tap for reliability across web/mobile.

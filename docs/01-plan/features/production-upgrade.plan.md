# Production Upgrade (목업 → 배포 수준) - Plan

**Date**: 2025-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)

---

## 1. 요청 해석 (Deep-think)

- **겉**: 가독성·사용자 친화성 향상, Inbox 타임테이블, 캘린더/스케줄 드래그 수정, 리뷰 성취도·달성률·다음 주 제안.
- **속**: 현재 목업 수준을 벗어나 **실제 배포 가능한 수준**으로 올리고, 첨부 목업(백지장 Inbox & Smart Calendar, Schedule 채팅, Weekly Retrospective)에 맞춰 기능과 UI를 정리·구현하며, **유지보수 용이성**을 유지하는 것.

---

## 2. 전제 조건

- 기존 Plan: `inbox-brain-dump`, `smart-calendar`, `weekly-review`, `schedule-conversational-ui` 등과 정합성 유지.
- DB: `events`, `schedules`, `notes`, `weekly_reviews` 등 기존 스키마 활용; 필요 시 마이그레이션만 최소 추가.
- 플랫폼: React Native + Expo, 웹/다크 대응 이미 진행됨.

---

## 3. 알 것 / 모를 것

| 구분 | 내용 |
|------|------|
| **알 것** | 캘린더에 `timetable` 뷰 존재, 드래그 미구현. Inbox는 엔트리+파싱만 있고 타임테이블·Auto-Schedule 연동 없음. 리뷰는 기본 KPI·제안만 있고 목표 vs 실제 그래프·계획 달성률·다음 주 자동 제안 UI는 목업 수준 미도달. |
| **모를 것** | 드래그 라이브러리 선택(react-native-draggable-flatlist vs gesture 기반 직접 구현), 리뷰 “다음 주 제안”의 트리거 시점(일요일 자동 vs 수동만). |

---

## 4. 접근 (2가지)

**A. 4개 기능을 독립 PDCA 피처로 분리**  
- Plan/Design을 피처별로 작성 후 순차 Do.  
- 장점: 단위 테스트·배포·롤백 용이. 단점: 문서·의존성 관리 부담.

**B. 하나의 “Production Upgrade” 플랜 아래 4개 트랙으로 정리**  
- 하나의 플랜에 Inbox 타임테이블, 캘린더 드래그, 스케줄 수정, 리뷰 고도화를 모두 넣고, 설계는 트랙별 design 문서로 분리.  
- 장점: 전체 비전·우선순위가 한 문서에 있음. 단점: 플랜이 길어짐.

**권장**: **B**로 플랜을 작성하고, 설계는 **트랙별 design 문서**로 분리해 유지보수성 확보.

---

## 5. 범위 정의

### Track 1: Inbox + 타임테이블 (백지장 Inbox & Smart Calendar)

- **목표**: 한 줄 입력 → AI 파싱 → Auto-Schedule 버튼 → 주간 타임테이블 미리보기 + 이벤트 자동 생성.
- **User Story**: 사용자가 Inbox에 "학교 월수금 9-1시" 등 한 줄을 입력하면, 파싱 결과(3개 이상 이벤트)가 표시되고, "Auto-Schedule"로 캘린더에 배치·타임테이블로 확인할 수 있다.
- **인수 조건**  
  - [x] QUICK NOTE 영역 + 파싱 결과 리스트(시간·반복 요약) 표시  
  - [x] "Auto-Schedule" 버튼(보라색, 번개 아이콘)  
  - [x] Inbox 내 주간 타임테이블(Time / Mon / Tue / Wed …) 미리보기  
  - [x] 고정 일정 우선 배치, 유연 활동은 빈 시간 최적화(Conflict Guard 개념)  
  - [x] "3 Recurring Events Created" 등 결과 피드백
- **Out of scope**: 드래그는 캘린더/스케줄 트랙에서 처리.

### Track 2: 캘린더 타임테이블 드래그 수정

- **목표**: 타임테이블 뷰에서 일정 블록을 드래그해 시간/요일 변경 가능.
- **User Story**: 캘린더 타임테이블에서 이벤트 블록을 드래그하면 새 시간/요일로 이동하고, 충돌 시 경고 후 저장/되돌리기 선택 가능.
- **인수 조건**  
  - [x] 타임테이블 그리드 내 이벤트 블록 드래그 가능  
  - [x] 드롭 시 해당 셀의 start/end 반영, DB 업데이트  
  - [x] 겹치는 일정 감지 및 경고 UI  
  - [x] 색상은 기존 goal/카테고리 유지
- **의존**: `events` 테이블, 기존 calendar timetable 뷰.

### Track 3: 스케줄 탭 수정 경험

- **목표**: Schedule에서 생성된 결과(활동 리스트/타임블록)를 사용자가 조정할 수 있게 함. (드래그 또는 시간/요일 편집)
- **User Story**: AI가 만든 주간 스케줄을 사용자가 드래그 또는 간단 편집으로 바꾼 뒤 다시 저장·캘린더 반영할 수 있다.
- **인수 조건**  
  - [ ] Schedule 결과 카드/리스트에서 “시간/요일 변경” 가능 (드래그 또는 폼)  
  - [ ] 변경 시 충돌 검사 및 경고  
  - [ ] “캘린더에 등록” 시 최종 반영
- **의존**: Schedule 채팅 결과 구조, `events`/`schedules` 연동.

### Track 4: 리뷰 고도화 (주간 회고 & AI 코칭)

- **목표**: 목표 vs 실제 시각화, 계획 달성률, 다음 주 자동 제안.
- **User Story**: 리뷰 화면에서 일정별 성취도(목표 vs 실제) 그래프, 계획 달성률, AI의 “다음 주 루틴 제안”을 보고 수락/무시할 수 있다.
- **인수 조건**  
  - [ ] **목표 vs 실제 (Goal vs Actual)** 섹션: 활동별 진행 바(목표 시간 vs 실제 시간, %)  
  - [ ] **계획 달성률** 요약(예: 78%, ↑/↓ 표시)  
  - [ ] **New Routine Generated**: AI 제안 말풍선(보라색) + “다음 주에는 ~ 제한하고 ~ 늘리는 건 어떨까요?”  
  - [ ] 2월 3주차 리포트 등 주차 헤더, 공유 아이콘
- **의존**: `weekly_reviews`, `events`, `schedules`, OpenAI 제안 API.

---

## 6. 비기능 요구사항

- **가독성**: 다크/라이트, 웹에서도 텍스트 contrast 유지(기존 Schedule 개선과 동일).
- **사용자 친화성**: 터치 타겟 ≥44dp, 로딩/에러/빈 상태 명확.
- **유지보수**: 공통 컴포넌트(타임테이블 그리드, 진행 바, AI 말풍선) 재사용; API·상태는 기존 패턴 유지.

---

## 7. 구현 순서 제안

1. **Track 4 (리뷰 고도화)** — 기존 리뷰 데이터·API 확장만으로 진행 가능, UI 목업과 바로 대응.  
2. **Track 1 (Inbox + 타임테이블)** — 파싱·Auto-Schedule·타임테이블 미리보기 추가.  
3. **Track 2 (캘린더 드래그)** — 타임테이블 드래그 라이브러리 도입 및 충돌 처리.  
4. **Track 3 (스케줄 수정)** — Schedule 결과 편집/드래그, Track 2와 공통 로직 재사용.

---

## 8. 성공 기준

- **기능**: 4개 트랙 인수 조건 90% 이상 충족.  
- **품질**: `npx tsc --noEmit`, `npx expo lint` 통과; 기존 회귀 없음.  
- **UX**: 목업(첨부 이미지)과 시각·플로우가 일치한다는 gap 분석 통과.

---

**Next Steps**:  
- `docs/02-design/features/inbox-timetable.design.md`  
- `docs/02-design/features/calendar-drag-edit.design.md`  
- `docs/02-design/features/schedule-edit.design.md`  
- `docs/02-design/features/review-enhancements.design.md`  
작성 후, Track 4 → 1 → 2 → 3 순으로 Do 단계 진행.

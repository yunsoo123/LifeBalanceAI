# Design: Inbox + 타임테이블 (백지장 Inbox & Smart Calendar)

**Plan**: [production-upgrade.plan.md](../../01-plan/features/production-upgrade.plan.md) — Track 1

---

## 목표

- 한 줄 입력 → AI 파싱 → **파싱 결과 리스트** 표시 → **Auto-Schedule** 버튼 → 주간 **타임테이블 미리보기** + 이벤트 자동 생성.
- 목업: QUICK NOTE, 파싱된 3줄(학교 월수금 09:00-13:00, 알바 화목 18:00, 앱개발 공부 매일 2시간), 보라색 Auto-Schedule 버튼, Time/Mon/Tue/Wed 그리드, "3 Recurring Events Created".

---

## 1. UI 구조

### 1.1 Inbox 화면 구성

| 영역 | 내용 |
|------|------|
| 헤더 | 햄버거(≡) + "Inbox" + 캘린더 아이콘 (다크 배경, 흰 텍스트) |
| QUICK NOTE | 라벨 "QUICK NOTE" (연한 회색) + 다중 줄 입력 또는 파싱 결과 표시 영역 |
| 파싱 결과 | 파싱된 일정 3개 이상: "학교 월수금 09:00-13:00", "알바 화목 18:00 (4시간)", "앱개발 공부 매일 2시간" (한 줄씩) |
| Auto-Schedule | 보라색 풀폭 버튼, 번개 아이콘 + "Auto-Schedule" |
| 타임테이블 미리보기 | Time \| Mon \| Tue \| Wed (필요 시 Thu~Sun 확장). 09:00, 13:00, 18:00 등 행. 셀에 색상 블록(학교=파랑, 앱개발=초록, 알바=보라 등) + 라벨 |
| 피드백 | "3 Recurring Events Created" + 초록 체크 |

### 1.2 데이터 흐름

1. 사용자 한 줄 입력(또는 기존 엔트리) → "구조화하기" 또는 "파싱" → API에서 **일정 파싱 결과** (제목, 요일, 시작/종료 또는 반복, 예상 시간) 반환.
2. 파싱 결과를 Inbox 하단에 리스트로 표시.
3. "Auto-Schedule" 클릭 → **고정 일정 우선 배치**, 유연 활동은 빈 시간 배치(Conflict Guard) → `events` insert + 타임테이블 미리보기 갱신.
4. 피드백: "N Recurring Events Created".

---

## 2. API

### 2.1 일정 파싱 (기존 확장 또는 신규)

- **Endpoint**: `POST /api/inbox/parse-schedule` (또는 기존 parse 확장).
- **Request**: `{ text: string }`.
- **Response**: `{ events: { title: string, days?: number[], startTime?: string, endTime?: string, durationHours?: number, recurring?: boolean }[] }`.
- **Validation**: Zod. 3개 미만이면 "추가로 입력해 주세요" 등 유도.

### 2.2 Auto-Schedule 적용

- **Endpoint**: `POST /api/inbox/auto-schedule`.
- **Request**: `{ parsedEvents: ParsedEvent[], weekStart?: string }` (weekStart YYYY-MM-DD, 선택).
- **Logic**: 고정 일정(요일·시간 지정) 우선 배치 → 빈 슬롯에 유연 활동 배치. 충돌 시 해당 슬롯 스킵.
- **Response**: `{ eventsToCreate: { title, start_time, end_time, color }[] }`. API는 배치 결과만 반환.
- **DB**: 클라이언트가 `events` insert 수행 (`user_id` = auth.uid(), RLS 준수). 삽입 후 `created`/`eventIds`는 클라이언트에서 피드백 표시용으로 사용.

---

## 3. 컴포넌트

- **InboxScreen**: 기존 + QuickNoteSection, ParsedScheduleList, AutoScheduleButton, InboxTimetablePreview, CreatedFeedback.
- **InboxTimetablePreview**: 그리드(Time 열 + 요일 열들), 셀에 EventBlock (색상, 라벨). 읽기 전용 미리보기.
- **EventBlock**: 작은 rounded 블록, title, 색상(goal/카테고리).

---

## 4. 에러·경계

- 파싱 실패: 토스트 또는 인라인 "다시 입력해 주세요".
- Auto-Schedule 실패: "일정 저장에 실패했어요. 다시 시도해 주세요." + 재시도 버튼.
- 빈 입력으로 Auto-Schedule: 버튼 비활성화 또는 "먼저 한 줄을 입력하고 구조화해 주세요."

---

## 5. 보안

- RLS: `events` insert 시 `user_id` = auth.uid() (클라이언트에서 insert).
- Rate limit: 파싱은 `checkLimit('parses', isPro)`로 클라이언트 한도 적용. Auto-Schedule은 별도 서버 한도 없음(선택 시 동일 parses 한도에 포함 가능).

---

**Next**: 구현 시 `lib/ai/` 파싱 스키마 확장, `app/api/inbox/auto-schedule+api.ts` 신규, Inbox 화면에 타임테이블 섹션 추가.

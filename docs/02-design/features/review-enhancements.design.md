# Design: 리뷰 고도화 (주간 회고 & AI 코칭)

**Plan**: [production-upgrade.plan.md](../../01-plan/features/production-upgrade.plan.md) — Track 4

---

## 목표

- **목표 vs 실제 (Goal vs Actual)** 시각화: 활동별 진행 바 + 목표 시간 vs 실제 시간, %.
- **계획 달성률** 요약: 총 몰입 시간, 달성률 %, 증감(↑ 12% 증가 / ↓ 5% 감소), Over Budget 태그.
- **New Routine Generated**: AI의 다음 주 제안 말풍선(보라색) + 수락/무시.

---

## 1. UI 구조 (목업 기준)

### 1.1 WEEKLY REPORT 카드

| 영역 | 내용 |
|------|------|
| 헤더 | "WEEKLY REPORT", "2월 3주차 리포트", 공유 아이콘 |
| 총 몰입 시간 | "42h", "↑ 12% 증가" (초록) |
| 계획 달성률 | "78%", "↓ 5% 감소" (빨강), "• Over Budget: Poker (+20h)" (빨간 점) |
| 목표 vs 실제 | 아이콘 + "목표 vs 실제 (Goal vs Actual)" |
| 진행 바 1 | 앱 개발 공부: 빨간 블록, "8h / 20h (40%)" |
| 진행 바 2 | 학교 수업: 초록 블록, "12h / 12h (100%)" |
| 진행 바 3 | 온라인 홀덤: 보라 블록, "30h / 10h (300%)" (오버플로우 표시) |
| New Routine Generated | 배너 + 스파클 아이콘. AI 말풍선(보라): "다음 주에는 홀덤 15시간 제한, 앱 개발 15시간 늘리는 건 어떨까요?" |

### 1.2 데이터 소스

- **실제 시간**: `events`에서 해당 주 완료된 이벤트의 duration 합계, goal/활동별 그룹.
- **목표 시간**: `schedules` 또는 goals 테이블의 주간 목표 시간. 없으면 이전 주 계획 또는 0.
- **달성률**: (실제 총 몰입 시간 / 계획 총 몰입 시간) * 100. 전주 대비 증감 %.
- **Over Budget**: 목표 대비 초과한 활동(이름, +Nh) 리스트.

---

## 2. API·데이터

### 2.1 기존 확장

- **주간 리뷰 데이터**: `weekly_reviews` 또는 온더플라이 계산.
  - `goalVsActual: { goalName: string, plannedHours: number, actualHours: number, percent: number, color?: string }[]`
  - `totalImmersionHours: number`, `planAchievementRate: number`, `immersionTrend: number` (전주 대비 %), `achievementTrend: number`
  - `overBudget: { name: string, overHours: number }[]`

### 2.2 다음 주 자동 제안

- **Endpoint**: `POST /api/review/next-week-suggestion` 또는 기존 review 생성 시 함께 반환.
- **Input**: 현재 주 goalVsActual, overBudget, 사용자 이벤트 요약.
- **Output**: `{ suggestion: string }` (한국어 문장). 예: "다음 주에는 홀덤 시간을 15시간으로 제한하고, 앱 개발 시간을 15시간으로 늘리는 건 어떨까요?"
- **저장**: `weekly_reviews.suggestion_text` 또는 별도 컬럼. "수락" 시 다음 주 schedule 초안 생성(선택).

---

## 3. 컴포넌트

- **ReviewScreen**: 기존 + 아래 컴포넌트.
- **WeeklyReportCard**: 카드 컨테이너, 다크 배경.
- **SummaryMetrics**: 총 몰입 시간, 계획 달성률, 증감, Over Budget 태그.
- **GoalVsActualSection**: 헤더 + **GoalVsActualBar** × N.
- **GoalVsActualBar**: 아이콘(색), 진행 바(실제/목표 비율, 100% 초과 시 오버플로우 스타일), "8h / 20h (40%)".
- **NewRoutineBanner**: "New Routine Generated" + **AISuggestionBubble** (보라 말풍선, 흰 글씨). [수락] [나중에] 버튼(선택).

---

## 4. 에러·경계

- 데이터 없음: "이번 주 데이터가 없어요." (기존 EmptyState).
- 제안 API 실패: "제안을 불러오지 못했어요." + 재시도.

---

## 5. 보안

- RLS: `weekly_reviews` read/write 본인만. 제안 API rate limit.

---

**Next**: Review 화면에 SummaryMetrics, GoalVsActualSection, GoalVsActualBar, NewRoutineBanner 추가. API는 기존 review 로드 확장 + next-week-suggestion 호출.

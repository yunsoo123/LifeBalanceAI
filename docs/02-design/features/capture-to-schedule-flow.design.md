# Design: 캡처 → 일정·리뷰 연결감 (Phase C)

**Plan**: [competitive-roadmap.plan.md](../../01-plan/competitive-roadmap.plan.md)

---

## 목표

- "Inbox에 넣은 것이 Schedule/Calendar/Review로 이어진다"가 **화면만 봐도** 느껴지게.
- AI가 "버튼"이 아닌 **흐름** 안에 있다는 인상 강화.

---

## 1. Inbox 항목 카드 뱃지

| 뱃지 | 조건 | 비고 |
|------|------|------|
| ✓ 구조화됨 | `parsed` 있음 | 기존 유지 |
| 📋 Notes에 저장됨 | 해당 항목을 "노트로 저장" 완료한 경우 | 세션 중 상태로 표시. 저장 후 항목을 목록에서 제거하지 않고 뱃지만 표시. (선택) "목록에서 제거" 버튼 |
| Schedule 반영됨 / Calendar에 추가됨 | 2차: Schedule 생성·Calendar 가져오기 시 항목 매핑 시 | 1차에서는 미구현 가능 |

**데이터**: Entry에 `savedToNote?: boolean` 추가. 노트 저장 성공 시 `true`로 설정하고 엔트리 유지. (DB 변경 없음, 메모리만.)

**i18n**: `inbox.savedToNote` (한/영).

---

## 2. Review와의 연결

- Review 탭 상단 또는 Achievement 카드 위에 **한 줄 요약**:
  - "이번 주 노트 N개 · 일정 M개" (또는 "이번 주: 노트 N개, 일정 M개")
- 데이터: 기존 `loadWeeklyStats`의 `notes_created`, `total_events` 사용.
- 데이터가 있을 때만 표시. 빈 주면 생략 또는 "이번 주 데이터 없음" 유지.

**i18n**: `review.weeklySummary` (예: "이번 주 노트 {notes}개 · 일정 {events}개").

---

## 3. 적용 순서

1. i18n에 `inbox.savedToNote`, `review.weeklySummary` 추가.
2. Inbox: Entry 타입에 `savedToNote`, 저장 성공 시 설정·뱃지 표시, 저장 버튼은 저장 후 숨김.
3. Review: stats 있을 때 요약 한 줄 렌더링.

---

## 4. 성공 기준

- Inbox에서 "노트로 저장" 후 해당 카드에 "Notes에 저장됨" 뱃지가 보임.
- Review에서 "이번 주 노트 N개 · 일정 M개" 한 줄이 보임 (데이터 있을 때).

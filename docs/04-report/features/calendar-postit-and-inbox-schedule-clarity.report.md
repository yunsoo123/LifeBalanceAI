# 캘린더 포스트잇 + Inbox/Schedule 명확화 — Completion Report

**Date**: 2025-02-25  
**Project**: Mendly (LifeBalanceAI)

---

## 1. 캘린더 B (포스트잇 스타일) — 완료

| 항목 | 내용 |
|------|------|
| Design | `docs/02-design/features/calendar-add-event-postit.design.md` |
| Do | Add Event 모달: 카드 maxWidth 400, minHeight 520, shadow·radius 20, 배경 rgba(0,0,0,0.5). 라벨 13/18, 입력 16/24, 필드 간 20px, style 기반으로 겹침 방지. |
| 파일 | `app/(tabs)/calendar.tsx` (모달 블록) |

---

## 2. Inbox / Schedule 차이점 명확화 + 사용 가이드 — 완료

| 항목 | 내용 |
|------|------|
| Plan | `docs/01-plan/features/inbox-schedule-clarity.plan.md` |
| Design | `docs/02-design/features/inbox-schedule-clarity.design.md` |
| i18n | inbox.subtitle: "한 줄로 적고 → 구조화·캘린더에 추가" / "Type a line → structure & add to calendar". schedule.subtitle: "AI와 대화로 주간 일정 설계" / "Plan your week with AI conversation". guide.* (title, inbox/schedule/calendar/notes/review Title+Body, back, linkLabel). |
| Inbox | 상단 부제를 t.inbox.subtitle로 표시. |
| Schedule | 헤더 아래 t.schedule.subtitle 표시. |
| 가이드 | `app/guide.tsx` 추가. 카드 형태로 Inbox/Schedule/Calendar/Notes/Review 안내. 뒤로 버튼. |
| Profile | "사용 가이드" / "Usage guide" 버튼 → router.push('/guide'). |

---

## 3. UI/UX 전 페이지 퀄리티 일관화 — Plan만 작성

| 항목 | 내용 |
|------|------|
| Plan | `docs/01-plan/features/ui-quality-consistency.plan.md` |
| 상태 | 참조 샘플 이미지 또는 스펙이 있으면 그에 맞춰 Design → Do 진행. 없으면 design-system + 포스트잇·가이드 화면을 기준으로 갭 분석 후 순차 적용 가능. |

---

## Quality

- `npx tsc --noEmit`: ✅

---

## Next

- UI 퀄리티: 사용자에게 참조 스크린샷 1~2장 요청하거나, 기준 스펙 정한 뒤 전 페이지 점검.

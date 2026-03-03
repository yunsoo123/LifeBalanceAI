# 빈 상태 통일 — Completion Report

**Date**: 2025-02-25  
**Feature**: empty-states-consistency (D2)  
**Project**: Mendly (LifeBalanceAI)

---

## Summary

탭별 빈 상태를 **EmptyState** 컴포넌트와 **text-4xl 아이콘**, **i18n CTA**로 통일했다.

---

## Done

| 항목 | 내용 |
|------|------|
| Plan | `docs/01-plan/features/empty-states-consistency.plan.md` |
| Design | `docs/02-design/features/empty-states-consistency.design.md` |
| Inbox | 아이콘 text-5xl → text-4xl |
| Schedule | EmptyState에 icon 추가 (📋 text-4xl) |
| Calendar | action.label → `t.calendar.emptyAction` (i18n) |
| Review | View+Text → EmptyState(📊, title, description, action "Schedule로 가기") |
| i18n | calendar.emptyAction, review.emptyAction (ko/en) |

---

## Files Touched

- `lib/i18n.tsx` — emptyAction 타입·ko/en 추가
- `app/(tabs)/inbox.tsx` — icon class
- `app/(tabs)/schedule.tsx` — EmptyState icon
- `app/(tabs)/calendar.tsx` — action label i18n
- `app/(tabs)/review.tsx` — EmptyState 사용, useRouter, emptyAction CTA

---

## Quality

- `npx tsc --noEmit`: ✅

---

## Next

- 실행 순서 §10: D2 완료 표시, 다음은 F3(schedule-edit) 또는 D3(skeleton-loading) 등.

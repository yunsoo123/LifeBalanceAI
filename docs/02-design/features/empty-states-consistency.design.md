# 빈 상태 통일 — Design

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [empty-states-consistency.plan.md](../../01-plan/features/empty-states-consistency.plan.md)

---

## Overview

모든 탭에서 빈 상태를 **EmptyState** 컴포넌트로 통일하고, **아이콘 크기(text-4xl)**, **i18n CTA 라벨**, **Review 화면 EmptyState 적용**을 반영한다.

---

## 공통 스펙

- **컴포넌트**: `@/components/ui` EmptyState (icon?, title, description?, action?).
- **아이콘**: `text-4xl` (기본). 이모지 또는 단순 아이콘.
- **다크**: Schedule 등 다크 배경에서는 `dark={true}` 전달.
- **CTA**: action 사용 시 `label`은 i18n 키 사용.

---

## 탭별 적용

| 탭 | 현재 | 변경 |
|----|------|------|
| **Inbox** | EmptyState, icon text-5xl, t.inbox, action "일정 만들기 →" | icon을 text-4xl로 통일. action 라벨은 이미 lang 분기 → (선택) t.inbox.emptyAction 추가해 통일. |
| **Schedule** | EmptyState, dark, no icon, t.schedule | **icon 추가** (예: 📋 text-4xl). action 없음 유지. |
| **Calendar** | EmptyState, icon text-4xl, t.calendar, action "Create schedule" 하드코딩 | action.label → **t.calendar.emptyAction** (i18n 추가: "일정 만들기" / "Create schedule"). |
| **Notes** | EmptyState(목록 빈 경우), icon text-4xl, t.notes; (선택 시 빈 경우) selectNoteTitle/Desc | 유지. 필요 시 Notes 목록 빈 상태에 action "새 노트" 추가(이번 사이클에서는 선택). |
| **Review** | View + Text만 (t.review.emptyTitle, emptyDesc), EmptyState 미사용 | **EmptyState** 사용: icon 📊 text-4xl, title=t.review.emptyTitle, description=t.review.emptyDesc. action (선택): t.review.emptyAction "Schedule로 가기" → router Schedule. |

---

## i18n 추가

- **calendar**: emptyAction — "일정 만들기" / "Create schedule".
- **review**: emptyAction (선택) — "Schedule로 가기" / "Go to Schedule". Review에 CTA 넣을 때 사용.

---

## 체크리스트

- [ ] Inbox 아이콘 text-5xl → text-4xl.
- [ ] Schedule EmptyState에 icon 추가 (text-4xl).
- [ ] Calendar action.label → t.calendar.emptyAction.
- [ ] Review: View+Text → EmptyState(icon, title, description[, action]).

---

**Next Steps**: Do — 위 항목 반영 후 Report.

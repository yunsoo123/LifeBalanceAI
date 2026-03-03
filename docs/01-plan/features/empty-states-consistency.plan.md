# 빈 상태 통일 — Plan

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [improvement-ideas-brainstorm.plan.md](./improvement-ideas-brainstorm.plan.md) D2

---

## Overview

탭별 **빈 상태** 문구·아이콘·CTA를 v0 톤과 design-system에 맞춰 통일한다. 현재 Inbox·Schedule·Calendar·Notes는 `EmptyState` 컴포넌트를 쓰나 아이콘 크기·버튼 라벨이 탭마다 다르고, Review는 `EmptyState`를 쓰지 않고 별도 View+Text로만 표시한다.

---

## 목표

- 모든 탭의 빈 상태가 **EmptyState** 컴포넌트로 통일되고, **아이콘 크기**(text-4xl)와 **문구 톤**을 맞춘다.
- CTA가 필요한 탭에서는 **i18n**된 라벨을 사용한다 (Calendar "Create schedule" → t.calendar.emptyAction 등).
- Review 빈 상태를 EmptyState로 교체해 시각·구성 통일.

---

## 인수 조건

- [ ] Inbox, Schedule, Calendar, Notes, Review에서 빈 상태 시 **EmptyState** 사용 (Review는 기존 View+Text → EmptyState).
- [ ] 아이콘 크기 통일: text-4xl (Inbox는 현재 text-5xl → 4xl로 통일).
- [ ] Calendar 빈 상태 CTA 라벨: i18n (emptyAction).
- [ ] Review 빈 상태: EmptyState(icon, title, description, optional action).

---

## 범위

**In scope**

- EmptyState 사용 통일, 아이콘 크기, CTA i18n, Review EmptyState 적용.

**Out of scope**

- EmptyState 컴포넌트 자체 리디자인(레이아웃·색상 변경).
- Profile 탭 빈 상태(해당 시 존재 시 동일 패턴 적용).

---

## Next Steps

- Design: 탭별 현재/목표 스펙. Do: 코드 수정 → Report.

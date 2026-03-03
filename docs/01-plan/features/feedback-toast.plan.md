# 성공/에러 피드백 통일 (토스트) — Plan

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [improvement-ideas-brainstorm.plan.md](./improvement-ideas-brainstorm.plan.md) D1

---

## Overview

성공 시 **Alert**가 화면을 가리는 것이 반복되면 답답하다는 피드백을 반영해, **성공 메시지는 토스트**(2~3초 자동 사라짐)로 표시하고 화면을 가리지 않도록 한다. 기존 `components/ui/Toast.tsx`와 `useToast` 훅이 있으나 **앱 전역에서 사용 가능한 Provider**가 없어, 루트에 토스트를 올리고 주요 성공 플로우에서 Alert 대신 토스트를 사용한다.

---

## 목표

- **성공 피드백**: "캘린더에 N개 추가됨", "Event updated", "Event created" 등 **성공 메시지는 토스트**로 표시(2~3초 후 자동 사라짐).
- **에러/확인 필요**: 로그인 필요, 삭제 확인, 파싱 실패 등 **사용자 선택이 필요한 경우는 기존 Alert 유지**.
- 앱 전역에서 `useToast()`를 쓸 수 있도록 **ToastProvider**를 루트 레이아웃에 배치.

---

## 인수 조건

- [ ] 루트 레이아웃(`_layout.tsx`)에서 ToastProvider로 앱을 감싸고, 단일 Toast가 렌더링됨.
- [ ] Inbox: "캘린더에 N개 일정이 추가되었어요" 성공 시 Alert 제거 → 토스트로 표시.
- [ ] Calendar: "Event updated", "Event created" 성공 시 Alert 제거 → 토스트로 표시.
- [ ] 토스트는 2~3초 후 자동 사라짐; 탭 시 즉시 닫기 가능.

---

## 범위

**In scope**

- ToastProvider + Context (또는 기존 useToast를 Provider와 연동).
- _layout에 Provider 및 Toast 렌더링.
- Inbox·Calendar의 **성공** Alert → 토스트 전환.

**Out of scope**

- 에러 메시지를 전부 토스트로 바꾸기(필요 시 추후). 이번에는 성공만.
- Schedule 탭 성공 메시지(동일 패턴으로 추후 적용 가능).

---

## 성공 기준

- `npx tsc --noEmit`, `npx expo lint` 통과.
- Inbox one-tap 성공, Calendar 이벤트 생성/수정 성공 시 Alert 없이 토스트만 표시.

---

## Next Steps

- **Design**: `docs/02-design/features/feedback-toast.design.md` — Provider 구조, 적용 위치(Alert → toast 목록).
- **Do**: ToastContext/Provider, _layout 연동, Inbox·Calendar 성공 메시지 토스트로 교체.

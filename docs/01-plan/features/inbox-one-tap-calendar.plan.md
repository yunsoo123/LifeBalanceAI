# Inbox 한 번에 캘린더 추가 (옵션 A) — Plan

**Date**: 2025-02-23  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [ux-simplify-and-monetization.report.md](../04-report/features/ux-simplify-and-monetization.report.md), [ux-and-feature-improvement-next.plan.md](./ux-and-feature-improvement-next.plan.md)

---

## Overview

Inbox에서 "일정으로 구조화" 버튼 한 번으로 **파싱 + 캘린더 자동 배치**까지 한 번에 수행하도록 하는 기능입니다. 현재는 (1) 일정으로 구조화 클릭 → 파싱 결과 표시 → (2) "캘린더에 N개 추가" 클릭의 2단계이므로, 사용자 기대("한 번 누르면 캘린더까지 반영")에 맞추어 1단계로 줄입니다.

---

## 목표

- **한 번의 액션**: 한 줄 입력 후 "일정으로 구조화하고 캘린더에 추가" (또는 동일 의미의 단일 버튼) 클릭 시, 파싱 API 호출 → 성공 시 즉시 자동 배치(runAutoSchedule) 실행 → 캘린더에 이벤트 insert.
- **기존 플로우 유지**: 파싱만 먼저 보고 싶은 사용자를 위해, 기존 "일정으로 구조화" 버튼을 유지하고 **새 옵션**으로 "한 번에 캘린더까지" 버튼을 추가하거나, 또는 기존 버튼 하나의 동작을 "파싱 후 자동 배치까지"로 변경할지 설계 단계에서 결정.

---

## 인수 조건

- [ ] 한 줄 입력 + **단일 CTA** 클릭 시(또는 선택한 플로우 시) 파싱 + 캘린더 배치가 **한 번에** 완료된다.
- [ ] 로딩 중에는 파싱·배치를 구분하지 않고 **하나의 로딩 표시**(스피너/문구)로 보여준다.
- [ ] 성공 시 "캘린더에 N개 일정이 추가되었어요." 안내 유지. 실패 시 기존처럼 Alert로 원인 안내.
- [ ] 기존 "캘린더에 N개 추가" 수동 플로우(파싱 결과 확인 후 버튼)를 제거할지, 유지할지는 Design에서 결정.

---

## 범위

**In scope**

- Inbox 화면: 단일 CTA 또는 "한 번에 캘린더 추가" 플로우.
- parseScheduleFromInbox 성공 시 runAutoSchedule 로직 연속 호출(동일 API·DB 사용).
- 로딩·에러·성공 메시지 정리.

**Out of scope**

- API 스펙 변경(기존 parse, auto-schedule API 유지).
- Schedule 탭 변경.

---

## 성공 기준

- `npx tsc --noEmit`, `npx expo lint` 통과.
- 한 번의 사용자 액션으로 Inbox → 캘린더 반영까지 완결되는 경로가 존재함.
- 실패 시(파싱 실패/배치 실패) 명확한 안내.

---

## Next Steps

- **Design**: `docs/02-design/features/inbox-one-tap-calendar.design.md` 작성 — CTA 라벨, 기존 "일정으로 구조화" vs "한 번에 캘린더 추가" 버튼 구성, 로딩/에러 상태 정의.
- 사용자 확인 후 Design → Do 진행.

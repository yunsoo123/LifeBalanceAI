# 인박스 간소화 + 구조화 → 캘린더 — Design

**Date**: 2026-02-26  
**Project**: Mendly  
**Plan**: [inbox-simplify-and-structure-to-calendar.plan.md](../../01-plan/features/inbox-simplify-and-structure-to-calendar.plan.md)

---

## Overview

인박스 UI를 간소화하고, 구조화된 항목에서 캘린더 추가 경로를 연다.

---

## 1. API 변경

### 1.1 parse-schedule

- **현재**: `events.length < 3` → 400.
- **변경**: `events.length < 1` → 400. 1개 이상이면 200 + `{ events }`.
- **적용 위치**: `app/api/inbox/parse-schedule+api.ts`, `lib/ai/parse-schedule.ts` (프롬프트는 "1 or more events"로 변경 가능, 검증만 1 이상).

---

## 2. Inbox UI — 구조화 → 캘린더

### 2.1 항목 카드

- **구조화(parsed)된 항목**에 버튼 추가: **"캘린더에 추가"** (또는 "일정으로 추가").
- **동작**: 클릭 시 (1) 해당 `entry.text`로 `POST /api/inbox/parse-schedule` 호출. (2) 응답 `events`가 1개 이상이면 `POST /api/inbox/auto-schedule` + 클라이언트에서 `events` insert. (3) 성공 시 토스트 "N개 일정이 캘린더에 추가되었어요." (4) 실패(0개 파싱, API 에러) 시 Alert + 재시도 가능.
- **로딩**: 해당 항목에만 로딩 표시(예: `addingToCalendarEntryId`). 터치 비활성화.
- **중복 방지**: 같은 항목을 연속으로 여러 번 누르지 않도록 로딩 중에는 비활성화.

### 2.2 데이터/상태

- `addingToCalendarEntryId: string | null` — 캘린더 추가 중인 entry id.
- 인증: insert 전 `supabase.auth.getUser()` 확인, 미로그인 시 로그인 유도 Alert.

---

## 3. Inbox UI — 간소화

### 3.1 제거

- **음성(🎤)**: 전체 행 제거. `startRecording`, `stopRecording`, `Audio` 관련 코드 및 상태 제거.
- **"고정 일정 / 우선 순위 자동 배치"** 카드: 해당 블록 전체 제거.

### 3.2 라벨 정리

- **구조화하기**: 라벨 유지. 필요 시 서브텍스트 또는 툴팁 "노트로 구조화" (선택).
- **Auto-Schedule**: "일정으로 구조화하고 캘린더에 추가" 유지.
- **빈 상태**: "일정 만들기 →" 유지, Schedule 탭 이동. 선택적으로 "캘린더에서 추가" 보조 CTA로 `router.push('/(tabs)/calendar')` 추가.

---

## 4. 에러·경계

- parse-schedule가 0개 반환: Alert "이 내용으로는 일정을 만들 수 없어요."
- 로그인 필요: Alert + 로그인 이동.
- insert 실패: Alert + 재시도.

---

**Next**: Do — parse-schedule 완화, Inbox 항목에 캘린더 추가 버튼·핸들러, 음성/고정일정 카드 제거, 라벨·빈 상태 정리.

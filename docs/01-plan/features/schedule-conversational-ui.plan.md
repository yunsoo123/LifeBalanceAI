# Schedule 페이지: 대화형 UI 리디자인 - Plan

**Date**: 2026-02-23  
**Author**: User + PDCA  
**Project**: LifeBalance AI  
**Related**: [ai-schedule-generator.plan.md](./ai-schedule-generator.plan.md)

---

## Overview

Schedule 탭을 목업대로 **2단 레이아웃**과 **멀티턴 대화형 일정 생성**으로 변경한다. 왼쪽에는 CORE FEATURE 01 설명 패널, 오른쪽에는 LifeBalance AI 채팅 + 현실성 검증 + 결과 카드 + "캘린더에 등록하기" CTA를 둔다. 5-Step 스마트 질의응답으로 사용자 입력을 구체화한 뒤 일정을 생성하고, 현실성 체크(번아웃 위험 없음/있음)를 노출한다.

## User Story

**As a** 사용자  
**I want** 친구에게 말하듯 입력하고 AI가 질문으로 구체화한 뒤 현실적인 주간 일정을 만들어 주길  
**So that** 번아웃 없이 목표를 반영한 시간표를 얻을 수 있다

**Acceptance Criteria**:

- [ ] 2단 레이아웃: 왼쪽 CORE FEATURE 01 패널, 오른쪽 채팅·결과
- [ ] 왼쪽 패널: CORE FEATURE 01 헤더, "AI 대화형 일정 생성", 4개 기능 불릿(친구에게 말하듯, 자연어&음성, 5-Step Q&A, 현실성 체크)
- [ ] 멀티턴 채팅: 사용자 말풍선(보라), AI 말풍선(다크 그레이), 여러 턴 지원
- [ ] 5-Step Q&A: AI가 역질문(알바 요일/시간, 수면 시간 등) → 사용자 답변 → 최종 일정 생성
- [ ] 현실성 검증 배지: "번아웃 위험 없음"(녹색) 또는 "번아웃 위험"(경고) 표시
- [ ] 결과 카드: 스케줄 생성 완료, 활동 시간 분석(예: 112h/168h), Safe, 여유 시간, "캘린더에 등록하기" CTA
- [ ] 다크 테마 + 보라 포인트 컬러 유지

## Scope

**In Scope**:

- 2단 레이아웃 (좌: 기능 설명, 우: 채팅·결과)
- 반응형: 좁은 화면에서 왼쪽 패널 접기 또는 상단 스택
- 멀티턴 채팅 UI 및 메시지 목록 상태
- 단일 API: 대화 기록 전달 → "질문" 또는 "일정" 응답
- 5-Step Q&A 플로우 (최대 턴 수 제한)
- 현실성 검증 배지 (번아웃 위험 없음/있음)
- 기존 ResultCard, "캘린더에 등록하기" → schedule/events 저장 플로우 유지

**Out of Scope**:

- 음성 입력(Whisper) 연동
- 인앱 일정 편집
- 여러 버전 일정 A/B

## Dependencies

- **API**: OpenAI (기존 schedule generate 확장 또는 멀티턴 전용 엔드포인트)
- **DB**: `schedules`, `events` (기존과 동일)
- **UI**: ChatBubble, ResultCard 재사용; LeftPanel, RealityCheckBadge, ChatThread 신규

## Success Criteria

1. 2~5턴 내 질의응답 후 일정 생성이 완료된다.
2. 좁은/넓은 화면 모두에서 레이아웃이 목업과 일치한다.
3. AI 응답 1회당 5초 이내이다.
4. 왼쪽 패널·현실성 검증·결과 카드 문구가 목업과 일치한다.

## Technical Notes

- **State**: `messages: { role: 'user'|'assistant', content: string }[]`, `schedule: ScheduleResult | null`, `loading`, `error`, (선택) `leftPanelCollapsed`.
- **API**: 단일 엔드포인트 권장. 요청 `{ messages }`, 응답 `{ type: 'question', content }` 또는 `{ type: 'schedule', data: ScheduleResult }`. Zod로 응답 검증, 일정 반환 시에만 rate limit 카운트.
- **Q&A 제한**: 최대 턴 수(예: 5)로 무한 대화 방지.

---
**Next Steps**: design 문서 작성 → API·레이아웃·LeftPanel·채팅·배지·ResultCard 순 구현.

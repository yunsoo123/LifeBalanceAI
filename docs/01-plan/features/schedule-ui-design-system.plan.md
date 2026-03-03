# Schedule 화면: 디자인 시스템·테마·목업 정렬 - Plan

**Date**: 2025-02-23  
**Author**: PDCA + deep-think  
**Project**: Mendly (LifeBalanceAI)

---

## Overview

스케줄 탭과 관련 컴포넌트(ChatBubble, ResultCard, RealityCheckBadge)가 **일관된 디자인 시스템**을 사용하고, **라이트/다크 테마**를 따르며, 첨부 **목업**과 시각적으로 정렬되도록 한다. 기능 변경 없이 토큰·테마·색상만 정리한다.

## User Story

**As a** 사용자  
**I want** 스케줄 페이지가 앱 테마(라이트/다크)를 따르고 목업과 같은 일관된 색·레이아웃을 보길  
**So that** 전체 앱과 통일된 UX를 경험할 수 있다.

**Acceptance Criteria**:

- [ ] 스케줄 탭이 useTheme()로 라이트/다크 전환됨
- [ ] 스케줄·관련 UI 색상이 design-system 토큰만 사용(하드코딩 제거)
- [ ] 목업 정렬: 헤더(앱명·Online·⋯), 유저/AI 버블 색, 결과 카드·112h/168h·Safe·CTA
- [ ] 터치 타겟 ≥44dp, 접근성 유지

## Scope

**In Scope**:

- schedule.tsx: useTheme() 도입, 배경·카드 토큰화
- ChatBubble, ResultCard, RealityCheckBadge: 테마·토큰 적용
- design-system.ts: chat.userBubble, chat.aiBubble, surface.resultCard 등 목업용 토큰 추가
- 레이아웃: 현재 구조 유지(채팅 → 현실성 검증 → 입력 카드 → ResultCard)

**Out of Scope**:

- 앱 전역 컴포넌트 리팩터(별도 PDCA)
- 현실성 검증 사이드 패널 레이아웃 변경(요구 확정 시 별도)
- 기능 로직 변경

## Preconditions

- 디자인 시스템 단일 소스 사용
- 스케줄에서 useTheme() 사용
- 목업 색 → 토큰 매핑(design 문서 참고)

## Success Criteria

- `npx tsc --noEmit`, `npx expo lint` 통과
- 스케줄 화면 테마 전환 시 라이트/다크 정상 표시
- 갭 분석 시 목업 대비 매칭률 ≥90%

---

**Next Steps**: design 문서(`schedule-ui-design-system.design.md`) 기준으로 구현. 사용자 "진행해" 확인 후 do 단계 진행.

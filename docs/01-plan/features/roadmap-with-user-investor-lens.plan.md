# 로드맵 통합 계획 (성능·신규·디자인 + 실제 사용자·투자자 관점)

**Date**: 2026-02  
**Project**: Mendly (LifeBalanceAI)  
**관련 문서**:  
- [improvement-ideas-brainstorm.plan.md](improvement-ideas-brainstorm.plan.md)  
- [docs/00-evaluation/user-investor-lens.md](../00-evaluation/user-investor-lens.md)  
- [.cursor/rules/user-investor-lens.mdc](../../.cursor/rules/user-investor-lens.mdc)

---

## Overview

3.1(성능)·3.2(신규)·3.3(디자인) 항목을 유지하고, **실제 사용자·투자자 관점(User–Investor lens)** 를 적용해 추가 보완점을 반영한 **통합 로드맵**이다.  
진행 순서와 PDCA 후보를 명시해 "좋은 계획 세워서 진행"할 수 있게 한다.

---

## 1. 성능 향상 (3.1 유지 + lens)

| # | 항목 | 설명 | PDCA/문서 |
|---|------|------|-----------|
| P1 | 로딩 스켈레톤 | Schedule 결과·캘린더 주간 등 긴 API 대기 시 스피너 대신 스켈레톤 | skeleton-loading |
| P2 | 캘린더 카드 밀도·스크롤 | 일정 많을 때 카드 높이·스크롤 성능, "오늘 N건 → 펼치기" | calendar-card-density |
| P3 | 오프라인/동기화 표시 | 오프라인 시 큐 표시, 동기화 중 인디케이터 (**U4 lens**) | offline-sync-ui |
| P4 | 실기기 콜 스택 오류 | v2 Phase A: 콜 스택 원인 수정 후 갭·코드리뷰 (**I3 lens**) | mendly-ui-overhaul-v2 iterate |

---

## 2. 신규 기능 (3.2 유지 + lens)

| # | 항목 | 설명 | PDCA 후보 |
|---|------|------|------------|
| F1 | Schedule 결과 수정·재배치 | 생성된 주간 일정에서 활동별 시간 변경 후 AI 재배치/수동 슬롯 | schedule-edit |
| F2 | Schedule 대화형 UI | 질문에 답하면서 일정 생성 | schedule-conversational-ui |
| F3 | 스마트 캘린더 제안 | "이 시간 비어 있음 → 이 목표 넣을까요?" | smart-calendar |
| F4 | Quick add 전역 | 헤더/플로팅에서 한 줄 입력 → Inbox 또는 바로 일정 | inbox-quick-add 확장 |
| F5 | Pro 한도·혜택 명시 | 설정/프로필에서 무료 vs Pro 차이 명확히 (**U3 lens**) | monetization-clarity |
| F6 | 첫 사용자 온보딩 | "한 줄 적고 → 구조화·캘린더 추가" 1회 미니 투어/툴팁 (**U1 lens**) | onboarding-first-run |
| F7 | 재방문 동기(알림/리마인더) | 매일/매주 열게 만드는 이유 강화 (**U2 lens**) | notification-reminder (신규 plan 검토) |

---

## 3. 디자인 개선 (3.3 유지 + lens)

| # | 항목 | 설명 | PDCA/문서 |
|---|------|------|-----------|
| D1 | 디자인 시스템 통일 | 남은 하드코딩 색/폰트 → design-system, 카드 규칙 정리 | design-system-pass |
| D2 | mendly-ui-overhaul-v2 갭 수정 | 갭 분석 High 우선 (탭 라벨, ResultCard, Button, Input 등) | mendly-ui-overhaul-v2 iterate |
| D3 | 접근성 점검 | 포커스 순서, 스크린 리더, 44/48dp, accessibilityLabel | a11y-audit |
| D4 | 다크 모드 대비 | WCAG 대비, 강조색 다크에서 구분 | dark-mode-contrast |
| D5 | 참조 이미지·목업 일치 | "보낸 디자인"과 정합성 | reference-images-full-consistency |

---

## 4. 실제 사용자·투자자 관점 보완점 (Lens 적용 결과)

`docs/00-evaluation/user-investor-lens.md` §4 적용 결과를 위 1~3에 매핑한 항목 외, **문서/전략** 수준 보완:

| # | 관점 | 보완점 | 조치 |
|---|------|--------|------|
| I1 | 투자자 | 한 줄 피치·차별화 문구 정리 | pitch-one-liner: `docs/00-evaluation/pitch-one-liner.md` 또는 README §1에 추가 |
| I2 | 투자자 | 핵심 지표 정의 부족 | metrics-definition: 지표 목록·이벤트 설계를 `docs/00-evaluation/metrics-definition.md` 에 정리 |
| I4 | 리스크 | 보안·규정 점검 | deployment-checklist §4, 개인정보처리방침 URL·스토어 대응 유지 |

---

## 5. 권장 실행 순서 (진행해보자)

### Phase 1 — 정리·안정화 (우선)

| 순서 | 작업 | 산출 |
|------|------|------|
| 1 | **inbox-simplify-and-structure-to-calendar** | pdca analyze → (필요 시 iterate) → pdca report |
| 2 | **review-tab-ui-ux** | pdca analyze → (필요 시 iterate) → pdca report |
| 3 | **실기기 안정화** (I3) | mendly-ui-overhaul-v2 Phase A: 콜 스택 수정·갭 High 반영 |

### Phase 2 — 사용자·투자자 가시성 (단기)

| 순서 | 작업 | 산출 |
|------|------|------|
| 4 | **Pro 한도·혜택 명시** (F5, U3) | monetization-clarity: 설정/프로필 화면에 무료 vs Pro 표 |
| 5 | **첫 사용자 온보딩** (F6, U1) | onboarding-first-run: 1회 미니 투어 또는 빈 상태 CTA 강화 |
| 6 | **한 줄 피치·지표 문서** (I1, I2) | pitch-one-liner.md, metrics-definition.md 초안 |

### Phase 3 — 기능·성능·디자인 (중기)

| 순서 | 작업 | 산출 |
|------|------|------|
| 7 | **Schedule 결과 수정** (F1) | schedule-edit: Design 있음 → Do 또는 analyze → iterate |
| 8 | **로딩 스켈레톤** (P1) | skeleton-loading: Plan → Design → Do |
| 9 | **디자인 시스템 통일** (D1) | design-system-pass 또는 ui-quality-consistency-phased |
| 10 | **v2 갭 수정** (D2) | mendly-ui-overhaul-v2 iterate |
| 11 | 이후 | F2, F3, P2, P3, D3, D4, F7 등 우선순위에 따라 진행 |

---

## 6. 다음 액션 (지금 할 수 있는 것)

- **바로 진행하려면**: Phase 1–1부터.  
  - `pdca analyze inbox-simplify-and-structure-to-calendar`  
  - `pdca analyze review-tab-ui-ux`  
  - 필요 시 `pdca report` 로 두 feature 마무리.
- **문서만 먼저** 정리하려면: Phase 2–6.  
  - `docs/00-evaluation/pitch-one-liner.md`  
  - `docs/00-evaluation/metrics-definition.md`  
  - 생성 후 로드맵·투자자 대화에 활용.

---

**Next Steps**

1. Phase 1 순서대로 analyze → report 진행.  
2. Phase 2에서 F5(monetization-clarity), F6(onboarding)는 기존 Plan/Design 유무 확인 후 pdca do 또는 plan → design → do.  
3. 새 feature(예: notification-reminder, skeleton-loading)는 pdca plan부터 시작.

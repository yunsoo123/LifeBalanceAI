# 기능·디자인·추가 개선 아이디어 브레인스토밍

**Date**: 2025-02-25  
**Author**: PDCA + deep-think  
**Project**: Mendly (LifeBalanceAI)  
**최신 추후 개선**: [future-improvements.plan.md](./future-improvements.plan.md) 참고.  
**Related**: [ux-and-feature-improvement-next.plan.md](./ux-and-feature-improvement-next.plan.md), [inbox-one-tap-calendar.report.md](../04-report/features/inbox-one-tap-calendar.report.md)

---

## 1. 요청 해석 (Deep)

| 표면 요청 | 실제 의도 |
|-----------|------------|
| "기능 개선할 거, 디자인 개선할 거, 추가로 뭐 있는지 아이디어 브레인스토밍" | **우선순위를 정할 수 있는 후보 목록**이 필요함. 단순 나열이 아니라, **실행 가능한 PDCA 단위**로 잘라서 "다음에 뭘 할지" 선택할 수 있게 함. |
| /pdca /deep | 전제·근거·접근·권장을 명시하고, 모호한 표현("이쁘게", "깔끔하게")은 **구체적인 스펙 후보**로 풀어서 제안. |

---

## 2. 전제 조건

- **P1**: inbox-one-tap-calendar, ux-simplify-and-monetization 은 완료. Inbox → 캘린더 한 번에 추가, 시간 가시성·타임테이블 노출·카드 스타일 반영됨.
- **P2**: Plan/Design이 이미 있는 기능(weekly-review, notion-style-notes, schedule-conversational-ui, calendar-drag-edit, schedule-edit 등)은 **아직 Do 미진행** 또는 부분 진행. 여기서는 "다음에 손댈 후보"로 포함.
- **P3**: 타겟 사용자(ADHD형, 목표 많고 계획 시간 적음)와 "돈 내고 쓰고 싶은" 수준까지 끌어올리는 게 목표라고 가정.

---

## 3. 알 것 / 모를 것

| 구분 | 내용 |
|------|------|
| **알 것** | 탭 구성(Inbox, Schedule, Calendar, Notes, Review, Profile). 완료된 개선(한 번에 캘린더, 시간 블록, 타임테이블 기본 뷰). 기존 Plan/Design 목록. |
| **모를 것** | 사용자가 **가장 불만인 화면**이 어디인지. **유료 전환**을 이끄는 핵심 기능. 다음 출시 우선순위(리뷰 vs 노트 vs 결제 vs 편집 UX). |

---

## 4. 접근

- **A. 시나리오 중심**: "할 일 넣기" / "주간 돌아보기" / "노트 정리" 등 시나리오별로 갈라서, 각 시나리오에서 기능·디자인 개선 아이디어를 나열.
- **B. 영역별 + 유형별**: 탭/영역(Inbox, Schedule, Calendar, Notes, Review, 공통) × 유형(기능 추가, 디자인 정교화, 기타)으로 매트릭스처럼 아이디어를 채움.

**선택**: B로 정리해, **기능 개선 / 디자인 개선 / 기타** 세 가지 유형으로 나누고, 각 항목이 **어느 탭·어떤 사용자 가치**에 기여하는지 한 줄로 적음. 그래야 "다음 PDCA는 이거" 고를 때 비교하기 쉬움.

---

## 5. 기능 개선 아이디어

| # | 아이디어 | 설명 | 탭/영역 | PDCA 후보 |
|---|----------|------|---------|------------|
| F1 | **일정 편집 UX** | 캘린더 이벤트 탭 시 **제목·시간·설명 수정 모달**. 현재 Alert만 있으면 실제 수정 불가. | Calendar | ✅ event-edit-ux (Plan 없으면 신규) |
| F2 | **타임테이블 드래그로 시간 변경** | 이벤트 드래그로 요일/시간 이동 후 DB 반영. design 있음: calendar-drag-edit. | Calendar | calendar-drag-edit |
| F3 | **Schedule 결과 수정 후 재배치** | 생성된 주간 일정에서 "이 활동만 시간 바꿀게" → AI 재배치 또는 수동 슬롯 변경. | Schedule | schedule-edit (Design 있음) |
| F4 | **Inbox 최소 일정 수 완화** | 현재 "3개 이상"만 one-tap 허용. 1~2개도 캘린더 추가 허용할지 제품 결정 후 반영. | Inbox | 설정/옵션 또는 design 명시 |
| F5 | **주간 리뷰 강화** | Weekly review 플로우: 지난주 반성 + 다음 주 목표. Plan/Design 있음. | Review | weekly-review |
| F6 | **노트(Notion 스타일) 강화** | 노트 목록·편집·태그·일정 연결. Plan/Design 있음. | Notes | notion-style-notes |
| F7 | **Schedule 대화형 UI** | 한 번에 목표 넣기보다 **질문에 답하면서** 일정 생성. Design 있음. | Schedule | schedule-conversational-ui |
| F8 | **스마트 캘린더 제안** | "이 시간 비어 있음 → 이 목표 넣을까요?" 등 제안. Plan 있음. | Calendar | smart-calendar |
| F9 | **빠른 추가(Quick add) 전역** | 헤더나 플로팅 버튼에서 "한 줄 입력 → Inbox 또는 바로 일정" 진입. | 공통 | inbox-quick-add 확장 |
| F10 | **Pro 한도·혜택 명시** | 무료 vs Pro 차이를 설정/프로필에서 명확히. "월 N회 파싱" 등. | Profile / 설정 | monetization-clarity |

---

## 6. 디자인 개선 아이디어

| # | 아이디어 | 설명 | 탭/영역 | PDCA 후보 |
|---|----------|------|---------|------------|
| D1 | **성공/에러 피드백 통일** | Alert 대신 **토스트/스낵바**(2~3초 자동 사라짐) 도입. 성공 시 화면 가리지 않음. | 공통 | feedback-toast |
| D2 | **빈 상태 통일** | 탭별 빈 상태 문구·아이콘·CTA를 v0 톤과 design-system에 맞춰 통일. | 전 탭 | empty-states-consistency |
| D3 | **로딩 스켈레톤** | 긴 API 대기 시 스피너 대신 **스켈레톤 UI**(Schedule 결과, 캘린더 주간 등). | Schedule, Calendar | skeleton-loading |
| D4 | **카드·타이포 일관성** | 남은 하드코딩 색/폰트를 design-system으로 교체. 카드 rounded·padding 규칙 정리. | 전역 | design-system-pass |
| D5 | **접근성 점검** | 포커스 순서, 스크린 리더, 터치 타겟 48dp 이상 등 체크리스트로 점검 후 수정. | 전역 | a11y-audit |
| D6 | **다크 모드 세부 대비** | 텍스트/배경 대비가 WCAG에 맞는지, 강조색이 다크에서도 구분되는지 확인. | 전역 | dark-mode-contrast |
| D7 | **캘린더 이벤트 카드 밀도** | 많은 일정일 때 카드 높이·스크롤 성능. 요약 뷰(오늘 5건 → 펼치기) 등. | Calendar | calendar-card-density |
| D8 | **탭/네비게이션 정리** | 탭 6개 유지 vs 5개로 줄이기(예: Review를 Profile 안으로). 진입 경로 단순화. | 공통 | nav-simplify (검토용) |

---

## 7. 기타 아이디어

| # | 아이디어 | 설명 | PDCA 후보 |
|---|----------|------|------------|
| O1 | **첫 사용자 온보딩** | "한 줄 적고 → 구조화하고 캘린더에 추가" 1회 미니 투어 또는 툴팁. | onboarding-first-run |
| O2 | **오프라인/동기화 표시** | 오프라인 시 큐 표시, 동기화 중 인디케이터. (이미 .cursorrules에 offline-first 언급) | offline-sync-ui |
| O3 | **에러 로그·모니터링** | Sentry 등 연동, AI 호출 실패율·한도 사용량 대시(내부용). | observability |
| O4 | **A/B 또는 기능 플래그** | 새 플로우(예: 대화형 Schedule)를 일부만 노출해 효과 측정. | feature-flags |
| O5 | **다음 PDCA 주제 선택 가이드** | 이 문서(또는 .pdca-status)를 보고 "다음은 F1 또는 D1" 같이 팀이 고르기. | (문서화) |

---

## 8. 권장 우선순위 (다음 1~2개 PDCA용)

- **1순위 — 기능**: **F1 일정 편집 UX**. 리포터에서 계속 "다음 주제"로 거론됨. 사용자가 캘린더에서 시간/제목 수정을 기대하는데 없으면 이탈 가능.
- **2순위 — 디자인**: **D1 토스트/스낵바**. 성공 시 Alert이 화면을 가리는 게 반복되면 답답함. 구현 규모가 크지 않으면 빠른 체감 개선.
- **3순위 — 기능**: **F5 주간 리뷰** 또는 **F6 노트 강화** — 이미 Plan/Design이 있으면 Design → Do만 진행하면 됨. 제품이 "일정만"이 아니라 "생활 전반 관리"로 가려면 리뷰·노트가 차별화.

**정리**: 다음 PDCA는 **event-edit-ux**(Plan 없으면 pdca plan 후 design) 또는 **feedback-toast**(디자인 문서 후 Do) 중 하나를 골라 진행하는 것을 권장합니다.

---

## 9. 결론

- **기능**: 일정 편집 → 타임테이블 드래그/재배치 → 리뷰/노트/대화형 Schedule 순으로 손대면, "할 일 넣기·고치기·돌아보기"가 모두 연결됨.
- **디자인**: 피드백(토스트)·빈 상태·로딩·design-system 통일을 한 번씩 PDCA로 끊어서 하면, "메모장 같다"는 인상을 줄일 수 있음.
- **기타**: 온보딩·오프라인 표시·모니터링은 출시 전후 단계에 맞춰 선택.

---

---

## 10. 실행 순서 (Implementation order)

브레인스토밍 우선순위에 따른 **구현 순서**. 완료된 항목은 ✅, 다음 진행은 ▶.

| 순서 | 항목 | PDCA feature | 상태 |
|------|------|--------------|------|
| 1 | F1 일정 편집 UX | event-edit-ux | ✅ 완료 (Report 있음) |
| 2 | D1 토스트/스낵바 | feedback-toast | ✅ 완료 (Report 있음) |
| 3 | F5 주간 리뷰 강화 | weekly-review | ✅ 완료 (토스트 적용 + Report) |
| 4 | F2 타임테이블 드래그 | calendar-drag-edit | ✅ 완료 (i18n + Report) |
| 5 | F6 노트 강화 | notion-style-notes | ✅ 완료 (Design + 토스트·i18n + Report) |
| 6 | D2 빈 상태 통일 | empty-states-consistency | ✅ 완료 (Report 있음) |
| 7 | F3 Schedule 결과 수정 또는 D3 로딩 스켈레톤 | schedule-edit / skeleton-loading | ▶ 다음 |
| 8 | 이후 | D4, F7, F8 등 | 아이디어 풀 참고 |

---

**Next Steps**

- 위 표에서 **다음에 할 1개**를 정한 뒤, 해당 항목에 대해 **pdca plan** (또는 기존 Plan 있으면 **pdca design** / **pdca do**) 진행.
- 이 문서는 **아이디어 풀**로 유지하고, status/next 할 때 참고.

# 참고 이미지 기반 전체 페이지 일관화 — 실행 계획

**Date**: 2025-02-22  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [ui-quality-consistency-phased.plan.md](ui-quality-consistency-phased.plan.md), 참고 이미지 3장 (Schedule, Inbox, Weekly Report)

---

## 0. 목표

- **참고 이미지 3장**을 기준으로 **먼저 Schedule, Inbox, Review** 세 화면을 “박스(카드/말풍선)” 구조로 맞춤.
- 그다음 **나머지 모든 페이지**(Calendar, Notes, Profile, 공통·가이드·모달)를 **같은 느낌**으로 통일 — 섹션은 카드/박스로, 글자만 나열되지 않게.

---

## 1. 기준 원칙 (“같은 느낌”)

참고 이미지에서 공통으로 쓰인 패턴을 **전체 앱 공통**으로 적용:

| 항목 | 기준 |
|------|------|
| **내용** | 텍스트 나열 ❌ → **섹션마다 둥근 카드(박스)** 로 구분. |
| **대화/피드백** | 평면 텍스트 ❌ → **말풍선 또는 카드** 안에 넣기. |
| **헤더** | 상단 한 줄: 브랜드/로고 + 상태(• Online 등) + 메뉴. 구역이 명확히. |
| **입력** | 입력창은 **하나의 카드**처럼 보이게 (둥근 모서리, 배경 구분). |
| **결과/요약** | 숫자·진행바·CTA는 **한 카드** 안에. |
| **리스트** | 항목 = **행 한 줄** 또는 **카드 한 장**으로 시각 구분. |
| **시각** | 다크 테마 시 카드 배경·테두리로 구역 구분, 둥근 모서리 일관. |

---

## 2. Phase 구분

### Phase 1 — 참고 이미지에 맞춤 (3페이지)

| 순서 | 화면 | 참고 이미지 | 적용할 “박스” 구조 |
|------|------|------------|---------------------|
| 1 | **Schedule** | 이미지 1 | 헤더 바 · 사용자/AI 말풍선 · 현실성 검증 카드 · 스케줄 요약 한 카드(112h, 진행바, CTA) · 하단 고정 입력 카드 |
| 2 | **Inbox** | 이미지 2 | QUICK NOTE 라벨 · 입력 카드 · Auto-Schedule 버튼 · 스케줄 미리보기(색 블록) · 결과 피드백 카드(3 Recurring Events Created) |
| 3 | **Review** | 이미지 3 | WEEKLY REPORT 캡션+제목 · 메트릭 2열 카드 · 목표 vs 실제 한 카드(행별 진행바) · AI Coach's Tip 카드 |

**완료 조건**: 위 3화면이 참고 이미지와 같은 “박스/카드” 구조로 보이고, tsc·lint 통과.

---

### Phase 2 — 나머지 페이지 같은 느낌으로 통일

참고 이미지에 없는 화면에도 **같은 원칙** 적용:

| 순서 | 화면 | 적용할 “박스” 구조 |
|------|------|---------------------|
| 4 | **Calendar** | 헤더 · 그리드/타임라인 · 일정 = 색 블록 · 일정 추가 모달 = 한 카드(제목·날짜·시간·반복) · 리스트 있으면 행/카드 구분 |
| 5 | **Notes** | 제목 블록 · 본문/체크/태그 각각 카드/블록 구분 · 리스트 항목 = 카드 또는 행 한 줄 |
| 6 | **Profile** | Account / Preferences / Subscription 등 **섹션을 카드 또는 행 블록**으로 구분 · 상단 배너 카드 |
| 7 | **공통·가이드·모달** | 모든 모달·가이드에서 섹션을 **카드/박스**로 구분 · CTA·입력은 위와 동일한 느낌 |

**완료 조건**: 모든 탭·모달이 “글자만 나열”이 아니라 **박스(카드/블록)로 구분**된 일관된 느낌, tsc·lint 통과.

---

## 3. 진행 방식

- **Phase 1**: Schedule → Inbox → Review 순서로, 한 화면씩(또는 한 턴에 한 화면) 참고 이미지에 맞춰 적용. 각 화면 완료 후 `npx tsc --noEmit`, `npx expo lint` 실행.
- **Phase 2**: Phase 1 완료 후, Calendar → Notes → Profile → 공통 순서로 “같은 느낌” 체크리스트대로 적용.
- **일관성**: Phase 2에서 수정할 때 Phase 1에서 쓴 컴포넌트(카드, 말풍선, 입력 카드)와 design-system 토큰을 그대로 사용해 전체가 한 느낌이 되게 함.

---

## 4. 참고 문서

- **Phase별 상세 체크리스트**: `docs/01-plan/features/ui-quality-consistency-phased.plan.md` (C1=Schedule, C2=Inbox, C3=Review, C4~C7=나머지).
- **디자인 원칙**: `docs/02-design/features/ui-quality-consistency.design.md` (Product feel, 카드·타이포·색).
- **참고 이미지**: 사용자 제공 3장 — Schedule(채팅+결과카드+입력), Inbox(QUICK NOTE+미리보기+결과), Review(메트릭 2열+목표vs실제+AI 팁).

---

## 5. 다음 액션

- **지금**: Phase 1–1 **Schedule**부터 참고 이미지에 맞춰 “박스” 구조 적용.
- **이후**: Phase 1–2 Inbox → Phase 1–3 Review → Phase 2 Calendar → Notes → Profile → 공통 순서로 진행.

"진행해" 하시면 Schedule 화면부터 적용하겠습니다.

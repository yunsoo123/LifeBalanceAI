# UI 품질 일관화 — Phase별 실행 계획 (Option C)

**Date**: 2025-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [ui-quality-consistency.plan.md](ui-quality-consistency.plan.md), [ui-quality-consistency.design.md](../../02-design/features/ui-quality-consistency.design.md), [mendly-ui-overhaul-v2.analysis.md](../../03-analysis/mendly-ui-overhaul-v2.analysis.md)

---

## 0. 이 문서의 목적

- **Option C**(화면별 디자인 정합성: Schedule → Inbox → Review → Calendar → Notes → Profile)를 **한 턴에 하지 않고**, PDCA로 **Phase를 나눠 순서대로** 진행하기 위한 **실행 계획**.
- **한 번에 한 Phase만 Do** 한다. 각 Phase 완료 후 자가 테스트(tsc, lint) 실행. 다음 턴에서 "Phase N 진행해" 요청으로 이어감.

---

## 1. 전제

- **기준 디자인**: `docs/02-design/features/ui-quality-consistency.design.md` §1 Product feel, §2–10 시각, §11 적용 순서.
- **보조 기준**: `mendly-ui-overhaul-v2.design.md` + `mendly-ui-overhaul-v2.analysis.md` (토큰·컴포넌트 정합성).
- **적용 원칙**: 각 Phase마다 **1순위 = 구조·인터랙션**(블록·카드·대화·입력바), **2순위 = 시각**(색·타이포·radius·패딩).

---

## 2. Phase 정의 (한 턴 = 한 Phase)

| Phase | 화면 | 1순위 (구조·인터랙션) | 2순위 (시각) | Do 후 Check |
|-------|------|------------------------|--------------|--------------|
| **C1** | Schedule | 말풍선 구분 + 하단 고정 입력창 + 결과를 **한 카드 블록**으로 | 헤더·색·진행바 스타일 |
| **C2** | Inbox | QUICK NOTE + Auto-Schedule **한 블록**, 결과 문장 + 이벤트 칩/그리드 | 라벨·색·패딩 |
| **C3** | Review | WEEKLY REPORT **카드 2열** + 목표 vs 실제 **행 블록** + 배너 | 캡션·진행바 색 |
| **C4** | Calendar | 타임라인/그리드 + **일정 블록**, 추가 모달 **한 블록** | 포스트잇·색 |
| **C5** | Notes | **블록 단위**(제목·본문·체크·태그) 구분 | 카드·여백 |
| **C6** | Profile | 설정 **카드/행 블록** 구분 | 배너·색 |
| **C7** | 공통·가이드·모달 | 섹션을 **블록/카드**로 구분 | 타이포·CTA |

---

## 3. Phase별 Do 체크리스트

### Phase C1 — Schedule

**범위**: `app/(tabs)/schedule.tsx`, `components/ui/ChatBubble.tsx`, `components/ui/ResultCard.tsx` 등.

- [ ] **구조**: 대화 스레드에서 사용자 말풍선 / AI 말풍선이 명확히 구분되고 시간순 스크롤.
- [ ] **구조**: 하단 입력창이 **고정**(KeyboardAvoidingView + 스크롤이 말풍선 쪽으로).
- [ ] **구조**: 스케줄 결과가 **한 카드 블록**(ResultCard) 안에 요약·진행바·CTA가 묶여 있음(메모장 나열 아님).
- [ ] **시각**: 헤더·진행바·말풍선이 design-system / ui-quality-consistency §2–4 토큰 사용.
- [ ] **Check**: `npx tsc --noEmit`, `npx expo lint` 통과.

---

### Phase C2 — Inbox

**범위**: `app/(tabs)/inbox.tsx`.

- [ ] **구조**: "QUICK NOTE" 한 줄 입력 + Auto-Schedule이 **한 블록**으로 묶여 있음.
- [ ] **구조**: 결과가 "N Recurring Events Created" 등 **한 문장** + 이벤트 칩/그리드로 표시.
- [ ] **구조**: BRAIN DUMP는 보조/접이식 또는 QUICK NOTE 아래로 배치(quick capture first).
- [ ] **시각**: 라벨(QUICK NOTE 등) 캡션 12–13px, 색·패딩 design-system.
- [ ] **Check**: tsc, lint 통과.

---

### Phase C3 — Review

**범위**: `app/(tabs)/review.tsx`, 메트릭 카드·목표 vs 실제 컴포넌트.

- [ ] **구조**: "WEEKLY REPORT" 캡션 → 제목 → **메트릭 카드 2열** → **목표 vs 실제 카드**(행 단위) → 하단 배너. 각각 카드/블록으로 묶임.
- [ ] **구조**: 숫자·진행바가 블록 안에 있어 "한 덩어리"로 인지됨.
- [ ] **시각**: 캡션·진행바 색 semantic, 타이포 §3.
- [ ] **Check**: tsc, lint 통과.

---

### Phase C4 — Calendar

**범위**: `app/(tabs)/calendar/index.tsx`, 일정 추가 모달, 타임테이블 블록.

- [ ] **구조**: 캘린더 **그리드/타임라인**이 메인, 일정이 **블록**으로 표시(단순 리스트 아님).
- [ ] **구조**: 일정 추가 시 모달에서 제목·날짜·시간·반복이 **한 블록**으로 묶여 있음.
- [ ] **시각**: 이벤트 블록 4px 좌측 보더·색·radius design-system.
- [ ] **Check**: tsc, lint 통과.

---

### Phase C5 — Notes

**범위**: `app/(tabs)/notes.tsx`, 노트 상세·NoteBodyView.

- [ ] **구조**: 제목 블록 / 본문 블록 / 체크리스트 블록 / 태그 블록이 **시각적으로 구분**됨.
- [ ] **구조**: 제목 > 섹션 > 본문 > 캡션 계층이 한눈에 들어옴.
- [ ] **시각**: 카드·여백 §4.
- [ ] **Check**: tsc, lint 통과.

---

### Phase C6 — Profile

**범위**: `app/(tabs)/profile.tsx`.

- [ ] **구조**: Account / Preferences / Subscription / Support / Sign out 등이 **카드 또는 행 블록**으로 구분됨.
- [ ] **시각**: 배너·색 design-system.
- [ ] **Check**: tsc, lint 통과.

---

### Phase C7 — 공통·가이드·모달

**범위**: 공통 컴포넌트, 가이드/온보딩/모달 화면.

- [ ] **구조**: 섹션이 **블록/카드**로 구분됨.
- [ ] **시각**: 타이포·CTA §3, §7.
- [ ] **Check**: tsc, lint 통과.

---

## 4. 턴별 진행 규칙

1. **한 턴에 한 Phase만 Do** 한다. (예: "Phase C1 진행해" → Schedule만 적용 후 종료.)
2. **Do 완료 후** 반드시 **자가 테스트** 실행: `npx tsc --noEmit`, `npx expo lint`. 실패 시 해당 Phase 내에서 수정 후 재실행.
3. **다음 턴**에서 사용자가 "Phase C2 진행해" 또는 "다음 phase 진행해"라고 하면 **C2** 범위만 Do. 이후 C3 → C4 → … → C7 순서로 진행.
4. **원하면** 특정 Phase 완료 후 `pdca analyze ui-quality-consistency`로 해당 화면만 갭 분석하여 문서화 가능.

---

## 5. PDCA와의 연결

- **Plan**: 이 문서 = **Phase별 실행 계획** (ui-quality-consistency의 Do 단계를 Phase로 쪼갠 것).
- **Design**: `docs/02-design/features/ui-quality-consistency.design.md` 유지.
- **Do**: 각 Phase가 한 번의 "Do" 단위. Phase Cn 완료 = Cn 체크리스트 구현 + tsc/lint 통과.
- **Check**: Phase 단위로 tsc/lint; 필요 시 `pdca analyze ui-quality-consistency`로 design vs 구현 비교.
- **Act**: Phase 실패 시 해당 Phase만 iterate; 전부 통과 후 `pdca report ui-quality-consistency`로 완료 리포트 작성.

---

## 6. 다음 액션 (지금 턴 이후)

- **다음 턴에서 할 일**: 사용자가 "Phase C1 진행해" 또는 "다음 phase 진행해"라고 하면 **Phase C1 (Schedule)** 부터 Do.
- **문서 위치**: 이 계획은 `docs/01-plan/features/ui-quality-consistency-phased.plan.md`에 있음. Phase 진행 시 이 파일의 해당 Phase 체크리스트를 참고하여 구현.

---

**요약**: C(화면별 디자인 정합성)를 **한 턴에 하지 않고**, 위 Phase C1→C7 순서대로 **한 번에 한 Phase만** 진행. 매 Phase 후 tsc·lint 실행. 다음 턴에서 "Phase N 진행해"로 이어가면 됨.

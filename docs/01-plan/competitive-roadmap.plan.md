# 경쟁 로드맵: 목업 수준 → 경쟁력

**Date**: 2025-02-15  
**Project**: Mendly  
**참조**: [benchmark-competitors.md](../02-design/benchmark-competitors.md)

---

## 현실 인정

- **기능·디자인이 목업 수준에도 미치지 못한다**는 판단을 전제로 함.
- Notion / Todoist / TickTick 벤치마크 결과: **캡처 속도, 자연어, 디자인 완성도, AI 통합 느낌**에서 전반적으로 뒤처짐.
- Mendly의 차별화 아이디어(브레인 덤프 → AI 주간 일정 → 주간 리뷰)는 있으나, **실행 품질**이 따라가지 못한 상태.

---

## 목표 단계

| 단계 | 목표 | 성공 기준 (예시) |
|------|------|------------------|
| **A. 목업 수준** | “그냥 메모장/프로토타입”이 아니라 “의도된 앱”처럼 보이게 | 타이포·여백·빈 상태·로딩이 전 화면에서 일관됨. 새 사용자가 30초 안에 “뭘 해야 하는지” 이해. |
| **B. 캡처·일정 경쟁력** | Todoist/TickTick 수준의 “빠른 입력 + 예측 가능한 결과” | Inbox에서 한 줄 추가 시 곧바로 구조화된 항목. (선택) 자연어 날짜/반복. |
| **C. 차별화 강화** | “AI로 주간을 잡고, 주간을 돌아본다”가 체감되게 | Schedule/Review가 Inbox·Calendar와 시각적·플로우적으로 연결됨. AI가 버튼 하나가 아니라 흐름 안에 녹아 있음. |

---

## Phase A: 목업 수준 디자인 (우선)

**목표**: 디자인과 UX만으로도 “제대로 된 앱”처럼 보이고, 첫 사용자가 길을 잃지 않게.

1. **전 화면 디자인 시스템 적용**
   - LAYOUT / design-system을 **모든 탭·모달·빈 상태·에러**에 적용.
   - 컴포넌트: Button, Card, Input, EmptyState 외에 **로딩 스켈레톤, 토스트/인라인 에러**까지 일관 스타일.
2. **한 화면 = 한 가지 목적**
   - Inbox: “캡처”만. Schedule: “질문 + 결과”. Calendar: “보기 + 추가/수정”. Notes: “목록 + 에디터”. Review: “주간 + 인사이트”.
   - 부가 액션은 보조(아이콘/링크)로 빼고, 메인 CTA 하나가 눈에 띄게.
3. **빈 상태 = 1회성 가이드**
   - “항목이 없어요” + “생각을 적어 보세요”를 넘어, **한 문장**으로 “여기 적고 → 구조화하기 → 일정/노트로” 안내.
   - (선택) 첫 실행 시 1회만 표시되는 “Inbox 한 줄 안내” 또는 툴팁.
4. **성공 기준**
   - 팀원/테스터가 “목업 같다”가 아니라 “앱 같다”고 느끼는 수준.
   - 벤치마크 문서의 “디자인 완성도” 행에서 “낮음 (목업 미만)” → “보통 (목업 수준)”으로 바꿀 수 있을 것.

**다음 단계**:  
- `docs/02-design/features/design-mockup-level.design.md` 작성 (화면별 구체 스케치·컴포넌트·카피).  
- 그 다음 Do → Check(갭 분석) → Act.

---

## Phase B: Quick Add + 자연어 (Todoist 수준 맞춤)

**목표**: Inbox가 “덤프 후 Parse”가 아니라 **한 줄 입력으로 곧바로 구조화된 항목**이 되게.

1. **Quick Add**
   - Inbox 상단 또는 플로팅에 “한 줄 입력” 필드. Enter(또는 추가 버튼) 시 **한 항목**으로 추가.
   - 기존 “여러 줄 덤프”는 유지하되, “한 줄 추가”가 기본 동작이 되도록.
2. **자연어 날짜/반복 (선택, 1차는 간단히)**
   - 입력 텍스트에서 “내일”, “다음 주 월요일”, “매일” 등 키워드 추출 → 구조화된 항목에 `due_date`, `recurrence` 등 반영.
   - 1차: 날짜만. 2차: 반복.
3. **성공 기준**
   - “이메일 보내기 내일” 입력 → 항목 추가 + “내일”로 표시되거나 Calendar에 반영.

**다음 단계**:  
- `docs/02-design/features/inbox-quick-add.design.md` (API·입력 규칙·UI).  
- Plan → Design → Do → Check.

---

## Phase C: 캡처 → 일정·리뷰 연결감 (차별화 강화)

**목표**: “Inbox에 넣은 게 Schedule/Calendar/Review로 이어진다”가 **화면만 봐도** 느껴지게.

1. **시각적 연결**
   - Inbox 항목 카드에 “Schedule 반영됨” / “Calendar에 추가됨” / “Notes에 저장됨” 뱃지 또는 링크.
   - Schedule 결과 카드에 “Calendar에 가져오기”가 이미 있으면, Inbox → Schedule → Calendar 흐름을 한 번에 보여주는 짧은 안내 문구.
2. **Review와의 연결**
   - Review 탭에서 “이번 주 Inbox에서 처리한 항목 N개” 등 요약 한 줄. (데이터 있으면 표시.)
3. **AI가 “버튼”이 아닌 흐름**
   - Parse/Generate/Enhance가 버튼만이 아니라, “이 항목을 구조화할까요?” 같은 문맥 제안으로 보이거나, 결과 옆에 “다시 생성”/“노트로 저장”이 자연스럽게 붙게.

**다음 단계**:  
- Phase A·B가 어느 정도 된 뒤, `docs/02-design/features/capture-to-schedule-flow.design.md`로 상세 설계.

---

## 우선순위 요약

| 순서 | 내용 | 산출물 (design-first) |
|------|------|------------------------|
| 1 | **Phase A**: 목업 수준 디자인 | `design-mockup-level.design.md` → 전 화면 적용 → 갭 분석 |
| 2 | **Phase B**: Inbox Quick Add + (선택) 자연어 | `inbox-quick-add.design.md` → 구현 → 검증 |
| 3 | **Phase C**: 캡처→일정·리뷰 연결감 | `capture-to-schedule-flow.design.md` → 구현 |

---

## 벤치마크 재측정 시점

- Phase A 완료 후: Notion/Todoist/TickTick 대비 **디자인 완성도** 재평가.
- Phase B 완료 후: **캡처 속도·자연어** 재평가.
- Phase C 완료 후: **차별화(브레인 덤프→일정→리뷰)** 체감도 평가.

이 로드맵은 `docs/02-design/benchmark-competitors.md`와 함께 유지하며, 경쟁사 기능이 바뀌면 벤치마크 문서를 먼저 갱신한 뒤 로드맵을 조정한다.

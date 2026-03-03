# UI/UX·기능 추가 개선 방향 — Plan (Next Cycle)

**Date**: 2025-02-23  
**Author**: PDCA + deep-think  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [ux-simplify-and-monetization.plan.md](./ux-simplify-and-monetization.plan.md), [ux-simplify-and-monetization.analysis.md](../03-analysis/ux-simplify-and-monetization.analysis.md)

---

## 1. 요청 해석 (Deep-think)

| 표면 요청 | 실제 의도 |
|-----------|-----------|
| "개발이나 똑바로 해라" | 구현 품질·일관성을 높이고, 설계(Plan/Design)에 맞게 **제대로 동작하는** 상태를 유지하라는 기대. |
| "UI/UX 더 개선시키고 기능 개선시킬 방법 생각해봐" | **우선순위가 있는 구체적 개선 목록**과, **어떤 순서로 손댈지**에 대한 제안이 필요함. 단순 나열이 아니라 실행 가능한 단계로 정리. |
| /pdca /deep | 개선안을 **전제·근거·접근·권장**으로 정리하고, 필요 시 **다음 PDCA 사이클(Plan → Design → Do → Check → Act)** 로 이어갈 수 있게 함. |

---

## 2. 전제 조건

- **P1**: ux-simplify-and-monetization 은 Plan·Design·Do·Analyze 까지 완료되었고, Match rate 약 95%. 남은 갭은 Minor(파싱 블록 카드화, 색 토큰화).
- **P2**: v0·design-system(카드, 타이포, 여백)이 정의되어 있으나, 화면별로 **완전히 통일되어 있지는 않음**(일부 하드코딩 색, 카드 래핑 누락).
- **P3**: 실사용 피드백(복잡도, 시간 가시성, Inbox 2단계, 타임테이블 발견, 메모장 같은 UI)은 1차 반영 완료. **다음 단계**는 "더 나은 UX"와 "기능 확장"을 동시에 고려할 수 있음.

---

## 3. 알 것 / 모를 것

| 구분 | 내용 |
|------|------|
| **알 것** | 분석서에 Minor 갭(Inbox 파싱 블록 카드 래핑, Calendar/Inbox 색 design-system 토큰화), 옵션 A(파싱+캘린더 한 번에) 미구현. v0 문서에 탭별 목표 UI·카드 스타일 명시됨. |
| **모를 것** | 사용자가 "더 개선"에서 **가장 불만인 화면/기능**이 무엇인지. **다음에 출시할 기능** 우선순위(리뷰·노트·결제 등). |

---

## 4. 접근 (2가지)

**A. 갭 마무리 + 품질 강화 (단기)**  
- 분석서의 Minor 갭만 해결: Inbox 파싱 결과 블록 카드 래핑, Calendar/Inbox/Schedule 하드코딩 색을 design-system 토큰으로 교체.  
- ux-simplify-and-monetization 에 대해 **iterate 1회** 후 **report** 작성으로 해당 사이클 정리.  
- 새 기능은 넣지 않고, **일관성·완성도**만 올림.

**B. 갭 마무리 + 다음 기능/UX 로드맵 (중기)**  
- A를 선행한 뒤, **다음 PDCA 1~2개**를 정해 순서를 정함.  
  - 예: (1) **Inbox 한 번에 캘린더 추가**(옵션 A) — Plan → Design → Do.  
  - 예: (2) **일정 편집 UX**(캘린더 이벤트 탭 시 수정 모달, 시간 드래그 개선) — 기존 calendar-event-ux-fixes 또는 별도 feature.  
  - 예: (3) **빈 상태·에러·성공 피드백** 통일(토스트/스낵바, 문구 톤).  
- 로드맵을 **짧은 Plan**으로 문서화해, "다음에 무엇을 할지"를 팀/스스로가 볼 수 있게 함.

**권장**: **A 먼저** 실행(갭 수정 + report)으로 현재 사이클을 정리하고, 이어서 **B**에서 "다음 개선 1~2개"를 Plan으로 올려 **차순위 PDCA**를 시작하는 흐름을 권장합니다.

---

## 5. UI/UX·기능 개선 방안 (구체)

### 5.1 지금 단기로 할 수 있는 것 (갭 수정·품질)

1. **Inbox 파싱 결과 블록 카드화**  
   - "파싱된 일정" 리스트 + "캘린더에 N개 추가" 버튼을 `rounded-2xl`, `p-5`, `border`, 배경(라이트/다크)을 가진 **카드 하나**로 감싼다.  
   - Design 4.5 및 분석서 권장과 일치.

2. **색상 토큰 통일**  
   - Calendar 이벤트 카드 배경 `#252631` → `colors.surface.darkCard`.  
   - Inbox 카드 배경·테두리도 design-system `surface`, `border` 사용.  
   - Schedule 활동 행 다크 모드 색을 가능한 한 `colors.gray`, `colors.brand` 로 치환.  
   - 효과: 테마 추가·변경 시 한 곳만 수정하면 됨.

3. **pdca report ux-simplify-and-monetization**  
   - 위 1~2 반영 여부와 관계없이, 현재 구현·분석 결과를 기준으로 **완료 보고서**를 작성해 PDCA 사이클을 닫는다.

### 5.2 다음 사이클에서 검토할 만한 것 (기능·UX)

4. **Inbox "한 번에 캘린더 추가" (옵션 A)**  
   - "일정으로 구조화" 클릭 시 **파싱 API 호출 → 성공 시 즉시 자동 배치(runAutoSchedule)** 까지 한 번에 수행.  
   - 사용자 인지: "한 번 누르면 캘린더까지 반영" → 단계 수 감소.

5. **일정 편집 UX**  
   - 캘린더 이벤트 카드에서 [수정] 탭 시 **시간·제목·설명을 수정하는 모달** (현재는 Alert만).  
   - 타임테이블 드래그는 현재 롱프레스+탭이므로, "드롭 시 시각 피드백"만 더 정교히 해도 개선.

6. **빈 상태·에러·성공 피드백 통일**  
   - 성공 시 Alert 대신 **토스트/스낵바**(2~3초 후 사라짐) 도입 검토.  
   - 빈 상태 문구·아이콘을 v0 톤에 맞춰 탭별로 통일.

7. **주간 리뷰·노트·Pro**  
   - Plan/Design이 이미 있는 기능(weekly-review, notion-style-notes 등) 중 **우선순위 1개**를 정해, 다음 PDCA feature로 진행.

---

## 6. 권장 실행 순서

1. **지금**  
   - (선택) Minor 갭 수정: Inbox 파싱 블록 카드 래핑 + 색 토큰화.  
   - **pdca report ux-simplify-and-monetization** 작성으로 해당 feature 완료 처리.

2. **다음**  
   - "다음 개선" 1개를 정해 **Plan** 작성(예: `inbox-one-tap-calendar.plan.md` 또는 `event-edit-ux.plan.md`).  
   - 필요 시 **Design** → **Do** → **Analyze** → **Report** 순으로 진행.

3. **지속**  
   - 모든 기능/개선은 **Plan → Design → Do** 순서를 지키고, 변경 후 **타입 체크·린트**로 품질을 유지합니다.

---

## 7. 결론

- **개발을 "똑바로"** 하려면: 설계(Plan/Design)에 맞춰 구현하고, 갭은 분석(analyze)으로 찾아 **iterate**로 메우고, **report**로 한 사이클을 마무리하는 흐름을 유지하는 것이 좋습니다.  
- **UI/UX·기능을 더 개선**하려면: 위 **5.1(단기)** 로 완성도를 올린 뒤, **5.2(다음 사이클)** 에서 우선순위를 정해 하나씩 PDCA로 진행하는 방식을 권장합니다.

---

**Next Steps**:  
- ux-simplify-and-monetization **report** 작성.  
- (선택) Minor 갭 수정 후 **iterate** 또는 report에 "미반영 갭"으로 기록.  
- 다음 개선 주제 1개를 정해 **Plan** 수립 후 Design → Do 진행.

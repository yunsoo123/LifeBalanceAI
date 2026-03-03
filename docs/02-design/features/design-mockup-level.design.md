# Design: 목업 수준 도달 (Phase A)

**Plan**: [competitive-roadmap.plan.md](../../01-plan/competitive-roadmap.plan.md)  
**Benchmark**: [benchmark-competitors.md](../benchmark-competitors.md)

---

## 목표

- “메모장/프로토타입”이 아닌 **의도된 앱**처럼 보이게.
- **한 화면 = 한 가지 목적**. 보조 액션은 줄이고 메인 CTA가 명확히.
- **빈 상태 = 1회성 가이드**. “뭘 해야 하지?”를 30초 안에 해소.

---

## 1. 전 화면 공통

| 요소 | 규칙 |
|------|------|
| 배경 | `LAYOUT.screenBg` (slate-50 / zinc-950). 이미 적용된 화면 유지, 미적용 화면 추가 적용. |
| 헤더 | `LAYOUT.header`. 제목은 `LAYOUT.pageTitle`, 액션은 최대 2~3개(primary 1개 + ghost/outline). |
| 본문 | `LAYOUT.contentContainer` 또는 `containerPadding`. PC는 max-width 672px 중앙. |
| 섹션 제목 | `LAYOUT.sectionTitle`. 본문은 `LAYOUT.bodyText`, 보조는 `LAYOUT.caption`. |
| 카드 | Card 컴포넌트 기본값. padding md = p-5, rounded-2xl. |
| 버튼 | Primary 1개만 눈에 띄게. 나머지는 outline/ghost. |
| 로딩 | Spinner 또는 Skeleton. 문구는 “불러오는 중…” 수준 한 줄. |
| 에러 | 인라인 메시지 + (선택) 재시도 버튼. Alert만 쓰지 말고 화면 내 복구 가능하게. |

---

## 2. 화면별 “한 가지 목적” + 빈 상태

### Inbox

- **목적**: “생각을 캡처한다.”  
- **메인**: 큰 입력창 하나 + “항목 추가” (또는 Quick Add 한 줄). “구조화하기”는 보조(헤더 오른쪽).  
- **빈 상태**:  
  - 제목: “아직 항목이 없어요” (유지 가능).  
  - 설명: **“여기에 생각을 적고 [항목 추가]를 누르면, [구조화하기]로 일정·노트로 넘길 수 있어요.”** (한 문장 가이드).  
  - CTA: “일정 만들기 →” 유지.

### Schedule

- **목적**: “이번 주에 뭘 할지 입력하고, AI가 주간 일정을 만든다.”  
- **메인**: 질문 + 텍스트 영역 + “내 일정 생성하기” 버튼 하나.  
- **빈 상태**: “이번 주 목표를 한 줄로 적어 보세요” + 예시 문장.  
- **결과**: 카드 하나로 “생성된 일정” 제목 + 활동 목록. “캘린더에 가져오기” 강조.

### Calendar

- **목적**: “주간을 보고, 이벤트를 추가/수정한다.”  
- **메인**: 주간 탭 + 선택된 날의 이벤트 목록. “+ Add”가 눈에 띄게.  
- **빈 상태**: “이번 주 이벤트가 없어요. 추가하거나 Schedule에서 가져오세요.”

### Notes

- **목적**: “노트 목록을 보고, 하나를 골라 읽거나 편집한다.”  
- **메인**: 사이드바(목록) + 에디터. “+ New”가 눈에 띄게.  
- **빈 상태 (목록)**: “노트가 없어요. 새로 만들거나 Inbox에서 저장해 보세요.”

### Review

- **목적**: “이번 주를 돌아보고, AI 인사이트를 본다.”  
- **메인**: 주 선택 + “Achievement Overview” 카드 + “Key Metrics” + “AI Insights” 카드. “Generate”가 primary.  
- **빈 상태(데이터 없음)**: “이번 주 데이터가 없어요. Schedule·Calendar를 사용하면 여기에 통계가 쌓여요.”

### Profile

- **목적**: “계정·설정·구독을 본다.”  
- **메인**: 아바타 + 이메일 + 다크모드/언어/Pro 카드. 로그아웃은 outline 또는 ghost.

---

## 3. 적용·검증 순서

1. **빈 상태 문구 통일**: ✅ 완료. i18n에 calendar/notes/review emptyTitle·emptyDesc·selectNote 등 추가, Inbox/Schedule/Calendar/Notes/Review에 반영.  
2. **헤더·본문 재점검**: LAYOUT 적용됨 (이전 세션). 필요 시 추가 점검.  
3. **로딩·에러**: API 부르는 화면에서 Spinner/인라인 에러 일관 적용. (부분 적용됨)  
4. **갭 분석**: 이 설계 vs 현재 코드 → `docs/03-analysis/design-mockup-level.analysis.md` 작성 후 부족한 부분 Act.

---

## 4. 성공 기준

- 새 사용자가 앱을 켜고 30초 안에 “Inbox에 적고 → 항목 추가 → 구조화하기” 흐름을 이해할 수 있음.  
- 팀원/테스터가 “목업 같다”가 아니라 “앱 같다”고 느낌.  
- 벤치마크 문서에서 “디자인 완성도: 낮음 (목업 미만)” → “보통 (목업 수준)”으로 변경 가능해짐.

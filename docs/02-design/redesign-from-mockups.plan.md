# 신규 디자인 계획 — 첨부 목업 5종 기준

**근거**: 사용자 첨부 5개 이미지 (기존 계획 무시)  
**작성**: deep-think-agent  
**목적**: ui-design / 구현 시 이 순서와 구조로 코드 작성

---

## 1. 요청 해석

기존 디자인 계획을 제거하고, 첨부한 5개 목업(AI 일정 생성, Inbox·스마트 캘린더, 노션형 노트, 주간 회고·AI 코칭, Before/After)만 기준으로 **단일 신규 계획** 수립. 본 문서는 **디자인·구조·구현 순서**만 정의하며, 실제 코드는 별도 단계에서 작성.

---

## 2. 전제 조건

| 유지 | 교체·정렬 |
|------|------------|
| Supabase 스키마, RLS, 인증, 기존 API | 모든 UI/레이아웃/스타일을 5개 화면에 맞춤 |
| React Native(Expo), NativeWind v4, 탭 라우팅 | 다크 우선 테마, 토큰, 컴포넌트 체계 |
| 기능 개념: Inbox, Schedule, Calendar, Notes, Review, Profile | 화면 레이아웃, 컴포넌트 계층, 목업의 카피/CTA |

---

## 3. 디자인 토큰 (목업 기준)

- **테마**: 다크 우선. 배경 #1A1B27 계열. 카드/서페이스 한 단계 밝게, 테두리 은은하게.
- **색상**: Purple = primary/CTA, Green = success/Safe, Red = over-budget/alert, Blue = info, Gray = AI/보조.
- **라디우스**: rounded-xl / rounded-2xl 수준.
- **간격**: 4px 베이스, 4/8/12/16/24/32 스케일.
- **타이포**: Sans-serif, 제목·부제·본문·캡션 위계. 터치 타겟 버튼 최소 h-12~h-14.

---

## 4. 화면별 구현 요소

| 화면 | 목업 | 구현 포인트 |
|------|------|-------------|
| **Schedule** | Core 01 | 채팅 UI(유저 보라 버블, AI 회색), 5단계 Q&A, 현실성 검증 카드, 결과 카드(112h/168h, Safe ✅), CTA "캘린더에 등록하기" |
| **Inbox** | Core 02 | Quick Note 영역, 파싱된 줄, 보라 "Auto-Schedule"(번개 아이콘), 캘린더 그리드/링크, "3 Recurring Events Created", Fixed Schedule 콜아웃 |
| **Notes** | Core 03 | 노션형: 커버 밴드, 제목+이모지, 메타(태그·날짜), 본문, 체크리스트, 코드 블록 |
| **Review** | Core 04 | 주간 리포트 카드, 지표(몰입 시간, 달성률, Over Budget), 목표 vs 실제 바, "✨ New Routine Generated" |
| **Profile** | 추론 | 다크 헤더, 동일 카드 스타일 |

---

## 5. 공용 컴포넌트 목록

- **채팅**: ChatBubble, ChatInput  
- **카드**: ResultCard, RealityCheckCard, MetricCard, WeeklyReportCard, TaskCard(좌측 악센트 바)  
- **진행**: ProgressBar, GoalVsActualBar  
- **노트**: NoteCover, NoteMetadata, ChecklistItem, CodeBlock  
- **액션**: PrimaryButton(보라), AutoScheduleButton(번개 아이콘)  
- **레이아웃**: ScreenContainer, Card, AccentBar  

---

## 6. 구현 순서

1. **디자인 시스템** — theme/tokens 갱신, 루트 레이아웃·배경/텍스트  
2. **공용 컴포넌트** — ScreenContainer, Card, PrimaryButton, ProgressBar, AccentBar, MetricCard, Tag  
3. **Schedule** — 채팅 섹션, ChatBubble, ChatInput, RealityCheckCard, ResultCard, CTA 연동  
4. **Inbox** — Quick Note, 파싱 줄, Auto-Schedule 버튼, 캘린더 그리드/푸터/콜아웃  
5. **Notes** — 노션형 노트 뷰(커버, 메타, 체크리스트, 코드 블록)  
6. **Review** — WeeklyReportCard, 지표, GoalVsActualBar, New Routine 태그  
7. **Profile + 마무리** — 다크 헤더, 전역 스페이싱·타이포·대비  

---

*다음 단계: 위 순서대로 ui-design 또는 메인 에이전트가 코드 생성.*

# Mendly UI Overhaul v2 — Plan (전면 UI/UX 대공사)

**Date**: 2025-02-22  
**Author**: PDCA + deep-think + pipeline-guide + ui-design  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [mendly-ui-overhaul-v2.design.md](../../02-design/features/mendly-ui-overhaul-v2.design.md)

---

## 1. 요청 해석 (Deep)

| 표면 | 실제 의도 |
|------|-----------|
| "기존 집을 부시고 대공사할 수준" | **단순 수리 아님.** 현재 UI를 유지한 채 색/여백만 손보는 게 아니라, **구조·시각·패턴을 통째로 갈아엎는 수준**. |
| "아예 새로운 버전으로" | **v2** — 기존 ui-quality-consistency(카톡·노션·틱틱) 방향을 계승하되, **새 디자인 언어·토큰·컴포넌트**로 전면 재구성. |

---

## 2. 목표

- **전면 리빌드**: 디자인 시스템 v2(색상·타이포·간격·라디우스) 정의 후, 모든 탭(Schedule, Inbox, Calendar, Notes, Review, Profile)을 새 시스템으로 이전.
- **구조 우선**: 화면별로 “카톡/노션/틱틱” 구조(채팅·블록·카드·타임라인)를 먼저 맞추고, 그 다음 v2 시각 토큰 적용.
- **점진 배포**: 한 번에 다 깨뜨리지 않고, **디자인 시스템 → 공통 컴포넌트 → 화면 순차 마이그레이션**으로 단계별로 적용·테스트 가능하게.

---

## 3. 범위

- **포함**: 6개 탭 전체 + 로그인/회원가입 + 공통 컴포넌트(헤더, 카드, 입력, 버튼, 채팅 말풍선, 리스트 행, 캘린더 이벤트 블록, 탭 바).
- **제외**: 백엔드/API/스키마 변경 없음. 기존 기능·플로우 유지; **표현(UI/UX)만 v2로 교체**.

---

## 4. 성공 기준

- [ ] `lib/design-system.ts`와 `lib/layoutConstants.ts`가 v2 스펙(색·타이포·간격·라디우스)으로 통일됨.
- [ ] 모든 탭이 v2 헤더·카드·입력·버튼 패턴을 사용하고, 다크/라이트 테마에서 일관됨.
- [ ] Schedule: 풀스크린 채팅 + 고정 입력창 + 결과 카드 한 블록. Inbox: 한 블록 퀵 입력 + 결과 문장 + 이벤트 칩. Calendar: 타임라인/그리드 + 이벤트 블록. Notes: 블록 단위. Review: 메트릭 2열 + 목표 vs 실제 카드. Profile: 카드 섹션 + 리스트 행.
- [ ] 터치 타겟 44/48pt, 접근성(대비·라벨) 준수.
- [ ] TypeScript·Lint·빌드 통과; 기존 기능 회귀 없음.

---

## 5. 선행 조건

- **Design**이 존재함 → [mendly-ui-overhaul-v2.design.md](../../02-design/features/mendly-ui-overhaul-v2.design.md) 에 v2 디자인 언어·컴포넌트 패턴·화면별 방향·구현 체크리스트·**화면 마이그레이션 순서**가 정의되어 있음.
- **파이프라인**: Phase 3(목업/방향) → Phase 5(디자인 시스템 구현) → Phase 6(화면 순차 적용). Plan/Design 완료 후 Do 진입.

---

## 6. Next Steps

1. **Do**: Design §4 구현 체크리스트 순서대로 진행.  
   - design-system.ts / layoutConstants.ts 갱신 → ThemeContext·공통 컴포넌트 → **화면 순서**: Schedule → Inbox → Calendar → Notes → Review → Profile.
2. **Check**: 구현 완료 후 **pdca analyze mendly-ui-overhaul-v2** 로 디자인 대비 갭 분석.
3. **Act**: **pdca iterate mendly-ui-overhaul-v2** 로 갭 수정 후 필요 시 재분석.
4. **Report**: **pdca report mendly-ui-overhaul-v2** 로 완료 보고서 작성.

사용자 확인("진행해") 후 **Do** 단계부터 구현 진행.

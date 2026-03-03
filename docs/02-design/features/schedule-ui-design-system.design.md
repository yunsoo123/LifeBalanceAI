# Design: Schedule 화면 디자인 시스템·테마·목업 정렬

**Date**: 2025-02-23  
**Plan**: [schedule-ui-design-system.plan.md](../../01-plan/features/schedule-ui-design-system.plan.md)  
**Project**: Mendly (LifeBalanceAI)

---

## 1. 목표

- 스케줄 탭이 **테마(라이트/다크)** 를 따르고, 모든 색·배경이 **design-system 토큰**으로만 구성되게 함.
- 첨부 **목업**과 시각적 정렬(헤더, 채팅 버블, 결과 카드, CTA).

---

## 2. 토큰 매핑 (목업 → design-system)

| 요소 | 목업 기준 | 토큰/값 | 비고 |
|------|-----------|---------|------|
| 화면 배경 (다크) | #1A1A2E | `surface.dark` (#1A1B27) 또는 `layoutConstants.DARK_BG_COLOR` | 동일 계열 |
| 헤더 배경 (다크) | 동일 | 화면 배경과 동일 토큰 | |
| 유저 버블 | #6C63FF | `colors.chat.userBubble` 신규 `'#6C63FF'` 또는 `colors.brand.primary` | 목업 정확 반영 시 신규 |
| AI 버블 | #3A3A4A | `colors.chat.aiBubble` 신규 `'#3A3A4A'` | |
| 결과 카드·입력 카드 배경 (다크) | #2E2E4A | `colors.surface.resultCard` 신규 `'#2E2E4A'` 또는 `surface.darkCard` | 목업은 #2E2E4A |
| 진행 바 채움 | 초록 | `colors.success.DEFAULT` / `success.light` | |
| CTA 버튼 | 보라, 풀폭 | `colors.brand.primary` | |
| Safe/초록 체크 | 초록 | `colors.success.DEFAULT` | |
| 본문 텍스트 (다크) | 흰/연회색 | design-system text 또는 `#ffffff` / `#f3f4f6` / `#9ca3af` 토큰 | |

**design-system.ts 추가 권장**:
- `chat: { userBubble: '#6C63FF', aiBubble: '#3A3A4A' }`
- `surface.resultCard` 또는 `surface.scheduleCard: '#2E2E4A'` (다크용)

라이트 모드: 기존 `LAYOUT`, `colors.background.*`, `colors.gray` 등 앱 공통 라이트 패턴 사용.

---

## 3. 스케줄 화면 구조 (변경 없음)

1. **헤더**: [보라 점 + 앱명] + [⋯]. 하단 [초록 점 + "• Online"].
2. **본문(ScrollView)**: 채팅 스레드 → RealityCheckBadge → 입력 카드(텍스트영역 + 전송 버튼) → 로딩/빈/에러 → ResultCard → 활동 리스트 + 일정 저장/다시 만들기.
3. **ResultCard**: 스케줄 생성 완료 + Safe ✅, 활동 시간 분석, 112h/168h, 진행 바, 여유 시간 문구, "캘린더에 등록하기" CTA.

현실성 검증은 **현재처럼 인라인 배지** 유지(사이드 패널은 요구 시 별도).

---

## 4. 컴포넌트별 변경

| 컴포넌트 | 변경 내용 |
|----------|-----------|
| **schedule.tsx** | `useTheme()` 사용. SafeAreaView/ScrollView/헤더/입력 카드 배경을 `theme === 'dark'`일 때 토큰(예: surface.dark, surface.resultCard), 라이트일 때 LIGHT_BG_COLOR·card 등 적용. 하드코딩 #1a1b2e, rgba(37,38,49) 제거. |
| **ChatBubble** | 테마 또는 `isDark` prop. 다크: `colors.chat.userBubble` / `colors.chat.aiBubble`. 라이트: design-system 라이트 버블 색(예: primary 연한 톤, gray 배경). |
| **ResultCard** | 테마 인자 또는 useTheme. 다크: `colors.surface.resultCard`, 라이트: card 배경 토큰. 텍스트·진행 바·CTA는 기존 구조 유지, 색만 토큰. |
| **RealityCheckBadge** | 다크/라이트 배경·테두리·텍스트 색을 토큰으로. |

---

## 5. 에러·접근성

- 기존 로딩/에러/빈 상태 유지.
- 터치 타겟 ≥44dp, accessibilityLabel 유지.

---

## 6. 기능 변경

- 없음. 테마 전환 및 색/토큰 정리만 수행.

---

**Next**: plan 승인 후 schedule.tsx 및 ChatBubble, ResultCard, RealityCheckBadge에 위 토큰·테마 반영 구현.

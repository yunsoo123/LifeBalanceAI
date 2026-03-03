# 인증 화면 비주얼 오버홀 (Sign-in / Sign-up)

**Date**: 2026-02  
**Project**: Mendly (LifeBalanceAI)  
**기준**: [mendly-ui-overhaul-v2.design.md](mendly-ui-overhaul-v2.design.md)  
**배경**: 실기기 테스터 피드백 — "기능은 괜찮은데 디자인이 허접해 보인다". 첫인상(회원가입·로그인)부터 껍데기를 프리미엄하게 가져가기 위함.

---

## 1. 원칙

- **첫인상**: 30초 안에 "정돈된, 신뢰 가는 앱"이 전달되어야 함. 플랫한 회색 배경 + 작은 로고 + 빽빽한 폼은 피함.
- **v2 토큰 준수**: `design-system.ts`의 colors, typography, spacing, borderRadius만 사용. 하드코딩 hex/px 최소화.
- **여백**: 화면 상하·블록 간 `spacing.xl`(32) 이상. 카드 내부 `spacing.lg`(24). 답답하지 않게.

---

## 2. 레이아웃 (공통)

| 영역 | 스펙 |
|------|------|
| **배경** | `surface.screen` (getSurface('screen', theme)). 단색 유지. |
| **최대 폭** | 400px, 가로 중앙. 좌우 padding `spacing.lg`(24). |
| **스크롤** | ScrollView, keyboardShouldPersistTaps="handled", contentContainerStyle에 paddingVertical 40~48. |
| **키보드** | KeyboardAvoidingView (iOS padding, Android undefined). |

---

## 3. 히어로 (로고 + 문구)

| 요소 | 스펙 |
|------|------|
| **로고 컨테이너** | 정사각형 72×72 (또는 80×80). bg `brand.primary`, radius `borderRadius.xl`(20). 그림자: elevation 4 (Android), shadowOffset (0,4) shadowOpacity 0.12 shadowRadius 12 (iOS). 중앙 정렬. |
| **로고 아이콘** | 이모지 또는 앱 심볼, text 32px. |
| **앱 이름** | "Mendly". `typography.titleLarge`(24), `fontWeight.bold`, `text.primary`. 중앙 정렬. 로고와 간격 `spacing.md`(16). |
| **설명 한 줄** | sign-in: "다시 오신 걸 환영해요" / sign-up: "이메일로 간편하게 시작하세요". `typography.body`(16), `text.secondary`. 로고 블록과 카드 사이 `spacing.xl`(32). |

---

## 4. 카드 (폼 영역)

| 속성 | 값 |
|------|-----|
| 배경 | `surface.card` (theme) |
| 테두리 | `border.subtle` (theme), 1px |
| 모서리 | `borderRadius.lg`(16) |
| 패딩 | `spacing.lg`(24) |
| 그림자 | light: shadowColor #000, offset (0,2), opacity 0.06, radius 8. dark: 약하게 또는 생략. |

**에러 메시지** (sign-in): 카드 상단, `semantic.errorBg` 배경, `semantic.error` 텍스트, padding 12, radius `borderRadius.md`, `typography.small`.

---

## 5. 입력 필드 (Input)

- **높이**: 52px (v2 Input 48–52).
- **배경**: `surface.input` (getSurface('input', theme)).
- **테두리**: `border.subtle`, focus 시 `border.medium` 또는 primary 링 2px.
- **라벨**: `typography.caption`(12), `text.tertiary`. 필드와 간격 8.
- **placeholder**: `text.tertiary`.
- **radius**: `borderRadius.md`(12).

---

## 6. 버튼

- **Primary**: bg `brand.primary`, text `text.inverse`, `typography.bodyMedium`, min height 48, `borderRadius.md`, padding horizontal 24. disabled: opacity 0.5.
- **풀폭**: 카드 내 폼에서 submit 버튼은 fullWidth.

---

## 7. 푸터 (로그인 ↔ 회원가입 링크)

- **문구**: "계정이 없으신가요?" / "이미 계정이 있으신가요?" — `typography.small`, `text.secondary`.
- **링크**: "회원가입" / "로그인" — `typography.small` + `fontWeight.semibold`, 색 `brand.primary`. underline 제거해도 됨(터치 영역 44pt).
- **카드와 간격**: `spacing.xl`(32).

---

## 8. Sign-up 전용

- **약관/개인정보**: 카드 아래 또는 푸터 아래, `typography.caption`, `text.tertiary`. 링크는 밑줄 + 동일 tertiary 또는 brand.primary.
- **가입 성공**: Alert 대신 가능하면 토스트("이메일을 확인해 주세요") + 자동 replace sign-in.

---

## 9. 구현 체크리스트

- [ ] sign-in.tsx: 히어로(72pt 로고, Mendly, 설명), 카드(v2 token), Input/Button 스타일, 푸터 링크.
- [ ] sign-up.tsx: 동일 톤, SignUpForm 에러 처리(i18n), 푸터 + 약관 문구.
- [ ] i18n: sign-up 화면 한글 메시지(이메일 확인, 6자 이상 등).
- [ ] tsc, lint 통과.

---

**Next**: Do 단계에서 sign-in.tsx, sign-up.tsx 수정. 이후 탭 진입 후 첫 화면(Inbox/Profile 등)으로 확장.

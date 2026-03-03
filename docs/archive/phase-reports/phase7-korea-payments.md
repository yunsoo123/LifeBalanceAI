# Phase 7: 한국 결제 대안 및 무료 한도 — 완료 요약

**Date**: 2025-02-15  
**Project**: Mendly LifeBalance AI

---

## 1. Stripe 제거 및 한국 대안 반영

- **package.json**: `@stripe/stripe-react-native` 의존성 제거.
- **.env.example**: Stripe 키 항목 주석 처리, "한국 사용 시 Stripe 미사용" 주석 추가.
- **docs/01-plan/payments-korea.md** (신규): 한국 결제 정책 문서.
  - 권장: **인앱 결제(IAP)** (앱스토어/플레이스토어) — 한국 카드·톡페이·네이버페이 등 지원.
  - 선택: 토스페이먼츠, PortOne (웹/하이브리드).
  - Stripe: 프로젝트에서 미사용.

---

## 2. 무료 한도 (Free Tier)

- **lib/usageLimits.ts** (신규):
  - `FREE_TIER_LIMITS`: 일정 생성 월 10회, 노트 파싱 월 50회, AI 인사이트 월 20회.
  - `checkLimit(kind)`, `incrementUsage(kind)`, `getUsage(kind)` — AsyncStorage 기반 월별 카운트.
- **Schedule**: `handleGenerate` 전에 `checkLimit('schedules')` 호출, 초과 시 한도 안내 Alert. 성공 시 `incrementUsage('schedules')`.
- **Inbox**: `parseEntry` 전에 `checkLimit('parses')`, 성공 시 `incrementUsage('parses')`.
- **Review**: `generateAIInsights` 전에 `checkLimit('insights')`, 성공 시 `incrementUsage('insights')`.
- 한도 초과 시 공통 메시지: "무료 플랜은 월 N회까지 … Pro는 인앱 결제로 업그레이드 예정이에요."

---

## 3. Profile 화면 (구독·사용량)

- **구독**: "Free 플랜 (무료 한도 적용 중). Pro는 앱스토어·플레이스토어 인앱 결제로 업그레이드 예정이에요."
- **버튼**: "업그레이드 (인앱 결제 예정)".
- **AI 사용량**: "이번 달 AI 사용량 (무료 한도)" — 일정 생성 / 노트 파싱 / AI 인사이트 각각 `getUsage`로 "count / limit" 표시 (UsageCount 컴포넌트).

---

## 4. SETUP.md

- 환경 변수 섹션에 "결제: 한국 사용 시 Stripe 미사용. Pro는 인앱 결제 예정" 문구 추가.

---

## 5. 검증

- `npx tsc --noEmit`: 0 errors.
- Lint: 해당 파일 0 errors.
- `npm test`: 기존 16 tests 통과 (usageLimits는 로직만 사용, 테스트는 선택).

---

## 6. 다음 단계 (선택)

- 인앱 결제: `expo-in-app-purchases` 또는 `react-native-iap` 연동 후 Pro 플랜 구독 상태에 따라 `checkLimit` 우회.
- 웹 결제: 토스페이먼츠/PortOne 연동 시 `docs/01-plan/payments-korea.md` 참고.

---
*Phase 7 — Korea payments & free tier limits complete*

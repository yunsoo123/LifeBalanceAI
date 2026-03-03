# 현재 프로젝트 상태 보고서

**작성일**: 2025-02-15  
**프로젝트**: Mendly (LifeBalance AI)  
**프로젝트 루트**: SortIt/LifeBalanceAI/

---

## 1. 완료된 Phase 요약

### Phase 0: Foundation
- **완료된 작업**: Expo TypeScript 프로젝트 초기화, Git·.gitignore, 폴더 구조(9 docs·3 code), TypeScript strict·ESLint·Prettier·NativeWind, Supabase 로컬 설정, .env.example·템플릿 4종, schema.md·terminology.md·CONVENTIONS.md·.cursorrules
- **생성/수정된 파일**: `docs/01-plan/schema.md`, `docs/01-plan/terminology.md`, `CONVENTIONS.md`, `.cursorrules`, `docs/templates/*`, `app.json`, `tsconfig.json`, `.env.example` 등 20+ 파일
- **테스트 결과**: `npx tsc --noEmit` 0 errors, `npm run lint` Pass, `npx expo start` 앱 로드

### Phase 4: MVP 기능 구현
- **완료된 작업**: AI Schedule Generator(schedule.tsx + generate API), Inbox & Brain Dump(inbox.tsx + parse API·음성), Smart Calendar(calendar.tsx + events CRUD), Notion-style Notes(notes.tsx + enhance API·이벤트 링크), Weekly Review(review.tsx + insights API·내보내기/공유). 탭: Inbox → Schedule → Calendar → Notes → Review → Profile.
- **생성/수정된 파일**: `app/(tabs)/schedule.tsx`, `inbox.tsx`, `calendar.tsx`, `notes.tsx`, `review.tsx`, `app/api/schedule/generate+api.ts`, `app/api/note/parse+api.ts`, `app/api/note/enhance+api.ts`, `app/api/review/insights+api.ts`, `lib/ai/*`, `lib/supabase/client.ts` 등
- **테스트 결과**: 기능 구현체 존재 확인(Phase 4 검증 보고서). Design/Analysis/Report 문서는 미보강.

### Phase 5: Integration & Polish
- **완료된 작업**: E2E 흐름 문서(phase5-e2e-flow.md), Alert.alert·재시도/Sign in, 로딩/Empty State·CTA, ThemeContext·다크모드(Profile 스위치·전 화면), 온보딩 3장 슬라이드·1회 표시, NetInfo·OfflineBanner, hitSlop·accessibilityLabel 보완
- **생성/수정된 파일**: `docs/01-plan/phase5-e2e-flow.md`, `phase5-integration.md`, `app/onboarding.tsx`, `app/(tabs)/_layout.tsx`, `lib/ThemeContext.tsx`, `lib/onboardingStorage.ts`, `components/shared/OfflineBanner.tsx`, `lib/useNetStatus.ts`, 각 탭(로딩/Empty/다크) 수정
- **테스트 결과**: tsc 0 errors, 수동 플로우 검증

### Phase 6: QA·테스트 인프라
- **6.1 Code Quality**: tsconfig strict 유지, ESLint 0 errors, .eslintignore backup
- **6.4 Security**: npm audit 0 vulnerabilities, Supabase RLS 6테이블
- **6.5 Testing**: Jest·jest-expo, weekUtils·onboardingStorage·apiUrl·design-system 단위 테스트 16개(4 suites)
- **생성/수정된 파일**: `jest.config.js`, `__tests__/lib/weekUtils.test.ts`, `onboardingStorage.test.ts`, `apiUrl.test.ts`, `design-system.test.ts`, `lib/weekUtils.ts`, `.eslintignore`
- **테스트 결과**: `npm test` 16 passed, `npx tsc --noEmit` 0 errors. E2E 미구현.

### Phase 7: 한국 결제·무료 한도·인앱 결제
- **완료된 작업**: Stripe 제거, payments-korea.md, lib/usageLimits.ts(월별 한도·checkLimit·incrementUsage), Schedule/Inbox/Review 한도 적용, Profile 구독·사용량 UI. 이후 **인앱 결제 연동**: react-native-iap, app.json 플러그인, lib/iap.ts·useSubscription.tsx(SubscriptionProvider), usageLimits Pro 우회, Profile Pro 업그레이드·구매 복원, SETUP.md 5.3·payments-korea.md 갱신
- **생성/수정된 파일**: `docs/01-plan/payments-korea.md`, `lib/usageLimits.ts`, `lib/iap.ts`, `lib/useSubscription.tsx`, `app.json`, `app/_layout.tsx`, `app/(tabs)/profile.tsx`, `schedule.tsx`, `inbox.tsx`, `review.tsx`, `SETUP.md`
- **테스트 결과**: `npx tsc --noEmit` 0 errors, Lint 0 errors, `npm test` 16 passed

### 법적·문서 (Phase 7 이후)
- **완료된 작업**: 사업자등록증(와이에스 프로젝트) 기반 개인정보처리방침·이용약관 초안, 테스트 목록 배포 직전 작성 방침
- **생성/수정된 파일**: `docs/legal/privacy-policy.md`, `docs/legal/terms-of-service.md`, `docs/legal/README.md`, `docs/01-plan/test-list-deferred.md`

---

## 2. 현재 앱 기능 목록

실제로 작동하는 기능(수동/자동 테스트 여부 포함):

- [x] **회원가입·로그인** — 이메일/비밀번호, Supabase Auth — 수동 테스트
- [x] **온보딩** — 3장 슬라이드, 1회만 표시 — 수동 테스트
- [x] **Inbox·브레인 덤프** — 텍스트 입력·저장, 음성 녹음·Whisper 파싱 — 수동 테스트
- [x] **노트 파싱** — Parse 버튼 → AI 구조화, 무료 한도(월 50회)·Pro 우회 — 수동 테스트
- [x] **AI 일정 생성** — 사용자 입력 → AI 주간 일정 제안·저장, 무료 한도(월 10회)·Pro 우회 — 수동 테스트
- [x] **캘린더** — 주간 뷰, 이벤트 CRUD, 일정에서 Calendar로 이동·Import — 수동 테스트
- [x] **노트** — 노트 CRUD, 이벤트 링크, AI 요약(enhance) — 수동 테스트
- [x] **주간 리뷰** — 주간 통계·AI 인사이트 생성, 무료 한도(월 20회)·Pro 우회, 내보내기/공유 — 수동 테스트
- [x] **프로필** — 이메일 표시, 다크모드 스위치, 구독(Free/Pro)·이번 달 AI 사용량, Pro 업그레이드·구매 복원(IAP) — 수동 테스트(IAP는 개발 빌드 필요)
- [x] **다크 모드** — 전 화면 적용 — 수동 테스트
- [x] **오프라인 배너** — 네트워크 끊김 시 배너 표시 — 수동 테스트
- [ ] **E2E 자동 테스트** — Detox/Maestro 미구현
- [ ] **인앱 결제 실기기 검증** — 스토어 상품 등록 후 개발 빌드에서 결제·복원 테스트 필요

---

## 3. 파일 구조

```
SortIt/
├── LifeBalanceAI/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── schedule.tsx
│   │   │   ├── inbox.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── notes.tsx
│   │   │   ├── review.tsx
│   │   │   └── profile.tsx
│   │   ├── api/
│   │   │   ├── schedule/generate+api.ts
│   │   │   ├── note/parse+api.ts
│   │   │   ├── note/enhance+api.ts
│   │   │   └── review/insights+api.ts
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── globals.css
│   │   ├── onboarding.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── index.ts
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── shared/
│   │   │   └── OfflineBanner.tsx
│   │   └── features/
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── ThemeContext.tsx
│   │   ├── useSession.ts
│   │   ├── useNetStatus.ts
│   │   ├── onboardingStorage.ts
│   │   ├── apiUrl.ts
│   │   ├── weekUtils.ts
│   │   ├── design-system.ts
│   │   ├── usageLimits.ts
│   │   ├── iap.ts
│   │   ├── useSubscription.tsx
│   │   └── ai/
│   │       ├── schedule-generator.ts
│   │       └── note-parser.ts
│   ├── __tests__/
│   │   └── lib/
│   │       ├── design-system.test.ts
│   │       ├── weekUtils.test.ts
│   │       ├── onboardingStorage.test.ts
│   │       └── apiUrl.test.ts
│   ├── assets/
│   ├── supabase/
│   │   └── migrations/
│   ├── docs/
│   │   ├── 00-foundation/
│   │   ├── 01-plan/
│   │   ├── 02-design/
│   │   ├── 03-analysis/
│   │   ├── 04-report/
│   │   ├── 05-status/
│   │   ├── 05-testing/
│   │   ├── 06-qa/
│   │   ├── 07-launch/
│   │   ├── 08-launch/
│   │   ├── 09-roadmap/
│   │   ├── legal/
│   │   │   ├── README.md
│   │   │   ├── privacy-policy.md
│   │   │   └── terms-of-service.md
│   │   └── templates/
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── SETUP.md
│   └── CONVENTIONS.md
```

*(일부 backup·.gitkeep 파일은 생략)*

---

## 4. 환경 변수 요구사항

`.env.local`에 필요한 항목:

| 변수 이름 | 어디서 얻는지 | 필수/선택 |
|-----------|----------------|-----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase 대시보드 → Settings → API → Project URL | 필수 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase 대시보드 → Settings → API → anon public | 필수 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 대시보드 → Settings → API → service_role (비공개 유지) | 필수 |
| `OPENAI_API_KEY` | platform.openai.com → API Keys | 필수 |
| `EXPO_PUBLIC_APP_ENV` | 개발 시 `development`, 배포 시 `production` 등 | 필수 |
| `EXPO_PUBLIC_API_URL` | 실기기/에뮬레이터에서 API 호출 시 PC LAN IP (예: `http://192.168.0.5:8081`) | 선택(실기기 시 필수) |

Stripe 관련 변수는 한국 정책상 미사용(주석 처리).

---

## 5. 테스트 결과

| 항목 | 결과 |
|------|------|
| **TypeScript** | 0 errors (`npx tsc --noEmit`) |
| **ESLint** | 0 errors (Phase 6·7 보고서 기준, legacy config 사용) |
| **단위 테스트** | 16/16 passed, 4 suites (design-system, weekUtils, onboardingStorage, apiUrl) |
| **E2E 테스트** | 미구현 (0/Y) |
| **성능 벤치마크** | 미측정 (— ms) |

---

## 6. 남은 작업

배포 전 필요한 작업:

1. [ ] **고객 문의 이메일** — 개인정보처리방침·이용약관 문의처에 실제 이메일 추가 — 약 5분
2. [ ] **통신판매업 신고번호** — 신고 후 이용약관/판매 페이지에 기재 — 약 10분
3. [ ] **Phase 0~마지막 테스트 목록 작성** — 배포 직전 일괄 작성 (`docs/01-plan/test-list-deferred.md`) — 1~2시간
4. [ ] **앱 내 법적 문서 링크** — 설정/프로필에서 개인정보처리방침·이용약관 URL 연결 — 약 30분
5. [ ] **EAS 빌드·스토어 제출** — 프로덕션 빌드, TestFlight/Play 내부 테스트, 스토어 제출 — 2~4시간
6. [ ] **인앱 결제 실기기 검증** — App Store Connect/Play Console 상품 `mendly_pro_monthly` 등록 후 결제·복원 테스트 — 약 1시간
7. [ ] **브랜딩·스크린샷** — 앱 아이콘·스플래시·스토어 스크린샷 (Phase 8) — 1~2시간
8. [ ] **E2E 테스트 도입(선택)** — Detox 또는 Maestro 설정 및 핵심 플로우 테스트 — 2~4시간

---

## 7. 배포 준비도

- [ ] **프로덕션 빌드 가능** — EAS Build 등으로 프로덕션 빌드 1회 성공 필요
- [x] **API keys 설정 완료** — Supabase·OpenAI .env.local 설정 가이드 완료(SETUP.md)
- [x] **테스트 통과** — 단위 테스트 16/16, tsc 0 errors, lint 0 errors (E2E는 미구현)
- [x] **문서 완료** — SETUP.md, payments-korea.md, legal 초안, test-list-deferred 방침. 고객 이메일·통신판매업 번호만 보완하면 됨

---

*현재 상태 보고서 — 배포 직전 테스트 목록·스토어 제출·이메일 보완 후 출시 가능*

# Phase 5: Integration & Polish — Development Plan

**Project**: Mendly (LifeBalance AI)  
**Date**: 2025-02-14  
**Status**: Complete  
**Prerequisite**: Phase 4 (Core Features) complete

---

## 1. Phase 5 Exit Criteria (Goals)

| # | Goal | Description |
|---|------|-------------|
| 1 | **End-to-End Flow** | Onboarding → AI Schedule → Calendar → Note → Review 흐름이 논리적으로 연결됨 |
| 2 | **Error Handling** | AI 실패, 네트워크/인증 에러에 대한 우아한(Graceful) 처리 |
| 3 | **UX Polish** | 모든 비동기 작업에 Loading State, 데이터 없을 때 Empty State 적용 |
| 4 | **Offline Mode** | 오프라인 시 액션 큐잉 및 복귀 시 동기화 (가능 범위 내) |
| 5 | **Dark Mode** | 모든 화면에서 다크 모드 렌더링 점검 및 일관성 확보 |

---

## 2. To-Do List (우선순위 순)

### P0 — 필수 (Phase 5 완료를 위해 반드시 필요)

- [x] **P0-1. End-to-End Flow 정리**
  - [ ] 앱 진입점(`app/index.tsx`)이 Inbox로 리다이렉트되는 현재 동작을 문서화
  - [ ] 권장 사용자 흐름 정의: **Inbox(브레인덤프) → Schedule(AI 일정 생성) → Calendar(확인/조정) → Notes(메모) → Review(주간 리뷰)**
  - [ ] 각 탭에서 “다음 단계” 안내(예: Schedule 화면에서 “캘린더에서 확인” CTA) 추가 여부 결정 및 필요 시 구현

- [x] **P0-2. Error Handling 통일**
  - [ ] AI API 실패(OpenAI/네트워크): `Alert.alert` + 재시도/취소 옵션, 화면 내 에러 메시지 영역
  - [ ] 인증 실패(미로그인): 공통 메시지 및 Profile/로그인 유도
  - [ ] Supabase/네트워크 에러: 사용자 친화적 메시지 + “다시 시도” 버튼
  - [ ] `alert()` 사용처를 `Alert.alert()`로 전면 교체 (CONVENTIONS 준수)

- [x] **P0-3. Loading State 적용**
  - [x] Schedule saveLoading+"Saving...", Inbox/Calendar/Notes/Review loading·disabled 적용

- [x] **P0-4. Empty State 적용** (완료)
  - [ ] Schedule: 일정 없을 때 “목표를 입력하고 AI 일정 생성” 유도
  - [ ] Inbox: 엔트리 없을 때 브레인덤프 유도
  - [ ] Calendar: 이벤트 없을 때 Schedule/Notes로 유도
  - [ ] Notes: 목록/선택 없을 때 기존 EmptyState 컴포넌트 활용 확인
  - [ ] Review: 데이터 없을 때 “이번 주 데이터가 없습니다” 메시지

- [x] **P0-5. Dark Mode 점검**
  - [x] ThemeContext + Profile 스위치, 모든 탭·인증·온보딩 `dark:` 적용

### P1 — 권장 (UX 완성도)

- [x] **P1-1. Onboarding/First-Run**
  - [ ] 최초 실행 시 짧은 워크스루(3~4장) 또는 단일 “시작하기” 화면 검토
  - [ ] “Inbox에서 생각을 적어보세요” → “Schedule에서 AI가 일정을 만들어요” 등 흐름 소개

- [x] **P1-2. 탭 간 연결 CTA**
  - [ ] Schedule 저장 후 “캘린더에서 확인하기” 버튼/링크
  - [ ] Calendar에서 “노트에 메모하기” 등 컨텍스트별 CTA (선택)

- [x] **P1-3. 에러 복구 UX**
  - [ ] API 실패 시 “다시 시도” 버튼
  - [ ] 오프라인 감지 시 배너 또는 토스트로 안내 (구현 범위에 따라)

### P2 — 가능 시 (Offline 등)

- [x] **P2-1. Offline Mode (선택)**
  - [x] NetInfo + OfflineBanner 노출 (큐/동기화는 미구현)

- [x] **P2-2. 접근성 및 마이크로 UX**
  - [x] Calendar/Notes hitSlop·accessibilityLabel 보완

---

## 3. 작업 우선순위 요약

| 우선순위 | 항목 | 예상 공수 |
|----------|------|-----------|
| **P0** | Error Handling 통일, Loading/Empty State, Dark Mode 점검 | 2–3일 |
| **P0** | End-to-End Flow 문서화 및 필요 시 CTA 추가 | 0.5–1일 |
| **P1** | Onboarding/First-Run, 탭 간 CTA, 에러 복구 UX | 1–2일 |
| **P2** | Offline 큐잉/동기화 (선택) | 2–3일 |

**Phase 5 목표 완료**: P0 전체 + P1 핵심까지 완료 시 “Integration & Polish” 완료로 간주.

---

## 4. 준수 사항

- **CONVENTIONS.md**: 파일/폴더 명명, TypeScript, 컴포넌트 구조, import 순서 준수
- **.cursorrules**: bkit 컨벤션, PDCA, 태스크 분류 적용
- **UX 원칙**: 사용자에게 항상 “무슨 일이 일어나고 있는지”, “다음에 무엇을 할 수 있는지”가 보이도록 함

---

## 5. 다음 단계

1. 이 계획서에 대한 **승인**을 받은 뒤 P0부터 순서대로 구현 시작.
2. P0-2(Error Handling), P0-3(Loading), P0-4(Empty State)는 화면별로 나누어 작업 가능.
3. P2(Offline)는 시간/범위에 따라 Phase 5 이후로 이관 가능.

---

**Document version**: 1.1  
**Last updated**: 2025-02-14  

---

## 6. P0 구현 완료 (2025-02-14)

- **P0-2 Error Handling**: `schedule.tsx`, `inbox.tsx`에서 `alert()` → `Alert.alert()` 전면 교체.
- **P0-1 E2E Flow**: Schedule 저장 후 "📅 Calendar" 버튼 추가 → `router.push('/(tabs)/calendar')`. 저장 중 `saveLoading` 상태로 버튼 비활성화.
- **P0-5 Dark Mode**: Schedule 에러 카드 `dark:text-gray-500` → `dark:text-gray-400` 수정.
- **P0-3 Loading**: Schedule "Save Schedule" 버튼에 `saveLoading` 및 "Saving..." 라벨 적용.
- **Offline Foundation**: `@react-native-community/netinfo` 추가, `lib/useNetStatus.ts`, `components/shared/OfflineBanner.tsx` 생성, `app/_layout.tsx`에 배너 노출.

**P1 구현 (동일일)**  
- **P1-1 / P1-2**: 온보딩 별도 화면 없이, EmptyState `action`만 활용. **Inbox** 빈 상태에 "Plan my week →" → Schedule 탭. **Calendar** 빈 상태에 "Create schedule" → Schedule 탭. (P1-3 에러 복구는 기존 Try Again/배너로 충족, 추가 코드 없음)

**배포·완성도 추가 구현**  
- **Supabase 인증**: `app/sign-in.tsx`, `app/sign-up.tsx` (이메일/비밀번호), `lib/useSession.ts`, `app/index.tsx` 세션 게이트(미로그인 → sign-in). Profile: 실제 사용자 이메일 표시, Sign Out → `signOut()` 후 `/sign-in`으로 이동. Schedule/Inbox/Calendar/Notes 인증 필요 시 Alert에 "Sign in" 버튼 → 로그인 화면 이동.  
- **온보딩**: `lib/onboardingStorage.ts`, `app/onboarding.tsx` (3장 슬라이드: Inbox → Schedule → Calendar/Notes/Review), 첫 로그인 후 1회만 표시, 완료 시 `@mendly_onboarding_done` 저장 후 탭으로.  
- **에러 재시도**: Inbox 파싱/저장 실패 Alert에 "Retry" 버튼 추가.  
- **다크 모드**: `lib/ThemeContext.tsx` (테마 상태 + AsyncStorage 저장), `_layout.tsx`에 ThemeProvider 및 루트 View에 `dark` 클래스 적용, Profile 스위치와 연동.

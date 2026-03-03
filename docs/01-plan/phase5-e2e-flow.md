# Phase 5: End-to-End Flow (문서)

**Project**: Mendly  
**Date**: 2025-02-14

---

## 1. 앱 진입점

- **파일**: `app/index.tsx`
- **동작**:
  1. `useSession()`으로 세션 로딩
  2. 로딩 중 → 로딩 스피너
  3. 미로그인 → `Redirect` to `/sign-in`
  4. 로그인 후 → `getOnboardingDone()` 확인
  5. 온보딩 미완료 → `Redirect` to `/onboarding`
  6. 온보딩 완료 → `Redirect` to `/(tabs)/inbox`

---

## 2. 권장 사용자 흐름

| 순서 | 화면 | 설명 |
|------|------|------|
| 1 | **Inbox** | 브레인덤프로 생각/할 일 적기 (텍스트 또는 음성) |
| 2 | **Schedule** | 목표 입력 → AI가 주간 일정 생성 → 저장 |
| 3 | **Calendar** | 생성된 일정 확인·조정, 이벤트 추가/임포트 |
| 4 | **Notes** | 메모 작성, 이벤트 링크, AI 요약 |
| 5 | **Review** | 주간 통계·AI 인사이트·내보내기/공유 |

---

## 3. 탭 간 CTA (다음 단계 안내)

| 화면 | CTA | 이동 |
|------|-----|------|
| Inbox (빈 상태) | "Plan my week →" | Schedule |
| Schedule (결과 있음) | "📅 Calendar" | Calendar |
| Calendar (이벤트 없음) | "Create schedule" | Schedule |
| (선택) Calendar | "📝 Notes" | Notes |

---

## 4. 인증·온보딩

- **미로그인**: 저장/생성 시도 시 Alert "Sign in required" + **Sign in** 버튼 → `/sign-in`
- **첫 로그인**: 1회 온보딩 3장 (Inbox → Schedule → Calendar/Notes/Review) → "Get started" 후 `/(tabs)/inbox`

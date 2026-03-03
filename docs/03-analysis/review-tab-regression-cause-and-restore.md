# 리뷰 탭 퇴화 원인 및 복원 계획

**Date**: 2026-02-22  
**Project**: Mendly (LifeBalanceAI)

---

## 1. 현상

- 리뷰 페이지에 **다크모드가 적용되지 않음**.
- **그동안 적용했던 UI**가 사라지고 **예전 목업 느낌**으로 퇴화함.

---

## 2. 원인 정리

### 2.1 현재 `app/(tabs)/review.tsx` 상태

- **사용 중**: `Card` / `CardBody` / `CardHeader` + Tailwind 클래스(`text-gray-900 dark:text-gray-100` 등)만 사용.
- **미사용**:
  - `useTheme()`, `getSurface()`, `colors` (design-system)
  - `LAYOUT`, `reviewCardStyle`
  - i18n (`t.review.*`)
  - `GoalVsActualBar`, `ProgressBar`, 요약 카드(총 몰입 시간 + 계획 달성률 + (i) 툴팁)
  - 이번 주 일정 리스트, 이번 주 할 일, ⋮ 메뉴

즉, **design 문서·분석 문서에 적힌 “풀 버전” 리뷰 화면이 아니라, 훨씬 단순한 카드 목업 버전**이 현재 코드베이스에 들어가 있음.

### 2.2 가능한 원인

1. **다른 버전으로 덮어쓰기**  
   풀 버전이 있던 `review.tsx`가, 예전 목업/다른 브랜치 버전으로 교체되었을 수 있음.
2. **Git / 머지**  
   리베이스·머지·체리픽 과정에서 풀 버전이 빠지고 단순 버전만 남았을 수 있음.
3. **세션/튕김**  
   Cursor 세션 중 풀 버전을 수정하다가 저장/동기화가 안 되고, 디스크에는 예전 단순 버전만 남았을 수 있음.

### 2.3 PDCA “변경 단계”와의 관계

- **Phase 1·2·3(N2/N3)** 에서 한 작업은 다음이었음:
  - Phase 1: (i) 툴팁, 터치 44dp, 노트 토스트 등
  - Phase 2: 요약 숫자 강조, 노트 카드 “마지막 수정” 등
  - Phase 3: 노트 필터 칩, 노트↔리뷰 이동(N3)
- 이때 **“리뷰 탭을 목업으로 되돌리는” 변경 단계는 없었음.**
- 다만, **현재 repo의 `review.tsx`가 처음부터 단순 버전이었거나**, 중간에 풀 버전이 이 단순 버전으로 덮어씌워졌다면, 우리가 문서로만 다룬 “요약 카드·(i)·text-2xl” 등은 **이 파일에는 반영된 적이 없을 수 있음.**

---

## 3. 다크모드가 “안 된다”고 느껴지는 이유

- 현재 리뷰는 **Tailwind `dark:`** 만 사용 (`dark:bg-gray-950`, `dark:text-gray-100` 등).
- 앱 전체 다크모드는 보통 **ThemeContext + design-system** 으로 제어하는데, 리뷰는 **`useTheme()`을 쓰지 않음**.
- 따라서 **시스템/앱 테마와 design-system이 연동되지 않고**, NativeWind 설정·클래스만으로는 다크모드가 기대대로 동작하지 않거나, 다른 탭(노트·캘린더 등)과 느낌이 다르게 보일 수 있음.

---

## 4. 앞으로의 계획에 넣을 “변경 단계”

- **이미 있던 “변경”이 퇴화를 유발한 것은 아님.**  
- **앞으로의 계획**에 아래를 **추가 단계**로 넣는 것을 권장함.

| 단계 | 내용 |
|------|------|
| **리뷰 탭 복원(재적용)** | `review-tab-ui-ux.design.md` 및 `review-notes-current-and-improvements.md` §3 기준으로, design-system·다크모드(useTheme/getSurface/colors)·i18n·요약 카드·GoalVsActualBar·이번 주 일정·할 일·(i) 툴팁·⋮ 메뉴·주 선택 등을 다시 적용. (별도 plan/design 후 Do 또는 기존 design 체크리스트로 Do.) |

이렇게 하면 “다음 PDCA 진행하기 전에” 리뷰만 먼저 복원할지, 아니면 다른 기능을 하다가 리뷰 복원을 한 번에 할지 선택할 수 있음.

---

## 5. Next Steps

- **즉시**: 리뷰 탭 복원을 할지 결정.
- **복원 시**:  
  - `docs/02-design/features/review-tab-ui-ux.design.md` §2·§4 체크리스트와  
  - `docs/03-analysis/review-notes-current-and-improvements.md` §3 “구현된 기능” 목록  
  을 기준으로 `app/(tabs)/review.tsx`에 useTheme·getSurface·LAYOUT·GoalVsActualBar·ProgressBar·이번 주 일정/할 일·i18n·⋮ 메뉴 등을 재구현.
- **복원을 별도 feature로 관리하려면**:  
  - `pdca plan review-tab-restore` → `pdca design review-tab-restore` (기존 design 문서 참조) → Do → Analyze → Report.

# 다크모드 텍스트 가독성 — Deep 분석

**Date**: 2026-02-26  
**Trigger**: 사용자 스크린샷 3장 (Inbox 브레인 덤프, Review 주간 리포트, Calendar) + "스케줄 제외 모든 페이지에서 다크모드 글씨 검정/안 보임"

---

## 1. 의도 해석

- **표면**: "다크모드에서 글씨가 검정색이라 안 보인다. 왜 개선이 안 되나? 스케줄만 제외하고 모든 페이지에서 그렇다."
- **실제 의도**: 다크 배경에서 **모든 본문·라벨·버튼 텍스트가 밝은 색**으로 보여야 하며, 현재는 **일부 화면/컴포넌트에서만** 반영되고 나머지는 여전히 검정/진한 회색으로 남아 있다. 원인 파악과 **전면 수정**을 원함.

---

## 2. 전제 조건

- 루트 `_layout.tsx`에서 `theme === 'dark'`일 때 `className="dark"`와 `backgroundColor: DARK_BG_COLOR` 적용됨.
- `design-system`에 `colors.text.primary`(다크용 밝은색), `colors.text.primaryLight`(라이트용 진한색) 존재.
- Schedule 페이지는 이미 `useTheme()` + `style={{ color: textPrimary }}` 등으로 **인라인 색**을 써서 가독성이 확보된 상태.

---

## 3. 알고 있는 것 vs 가정

| 구분 | 내용 |
|------|------|
| **알고 있는 것** | (1) 캘린더 `index.tsx`에 **dark: 없이** `text-gray-500`만 쓰는 Text 3곳(Time 라벨, 요일 날짜, 시간열). (2) EmptyState는 `text-gray-900 dark:text-gray-100` 있으나 **dark prop**을 안 넘기면 인라인 색을 안 씀. (3) MetricCard·ProgressBar·LAYOUT 등은 Tailwind `dark:` 보유. (4) Schedule만 전역적으로 `style={{ color: textPrimary }}` 사용. |
| **가정** | React Native + NativeWind에서 **상위 View의 `dark` 클래스가 일부 자식까지 전달되지 않거나**, 빌드/캐시에 따라 `dark:` 변형이 적용되지 않는 경우가 있음. 그래서 **Tailwind만으로는 다크모드 텍스트가 일부 화면에서 누락**될 수 있음. |

---

## 4. 접근안 (2가지)

### A. Tailwind `dark:` 보강만

- **내용**: `text-gray-500`만 있는 곳에 `dark:text-gray-400` 추가, EmptyState에 `dark` prop 넘겨서 인라인 색 사용.
- **장점**: 변경 범위 작음.  
- **단점**: RN에서 `dark` 캐스케이드가 불안정하면 여전히 일부 환경에서 안 보일 수 있음.

### B. 중요 텍스트는 인라인 색으로 통일 (권장)

- **내용**:  
  (1) **캘린더**: `text-gray-500`만 있는 3곳에 `dark:text-gray-400` 추가하고, 가능하면 해당 구간도 `theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight` 등 **인라인 color**로 교체.  
  (2) **EmptyState**: 호출부에서 `dark={theme === 'dark'}` 전달해, 다크일 때 제목·설명에 `style={{ color: ... }}` 적용되게 함.  
  (3) **리뷰/인박스 등**: 이미 `style={{ color: theme === 'dark' ? colors.text.primary : ... }}` 쓰는 곳은 유지. MetricCard·ProgressBar 등 공통 컴포넌트는 Tailwind `dark:` 유지하되, **화면별로 “검정으로 보인다”고 보고된 블록**은 인라인 색으로 덮어씀.
- **장점**: 테마가 JS에서 오므로 **환경과 무관하게** 다크모드 색이 적용됨.  
- **단점**: 수정할 파일/라인이 A보다 많음.

---

## 5. 권장

- **B를 기본**으로 하되, **우선 적용**은 다음만 해도 효과 큼.  
  - **캘린더**: Time/날짜/시간열 3곳에 `dark:text-gray-400` 추가 + (선택) 해당 Text를 `style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[500] }}` 등으로 교체.  
  - **EmptyState**: Inbox(및 다른 사용처)에서 `dark={theme === 'dark'}` 전달하고, EmptyState 내부는 이미 `dark`일 때 인라인 색 쓰도록 구현되어 있으므로 유지.  
- **이후**: 사용자 재검증 후에도 “검정”으로 보이는 블록이 있으면, 그 블록만 **인라인 color + theme**로 교체하는 식으로 점진 적용.

---

## 6. 구체 수정 목록 (권장 적용)

| 위치 | 문제 | 수정 |
|------|------|------|
| `app/(tabs)/calendar/index.tsx` | "Time", 요일 날짜, 시간열(`hour}:00`) — `text-gray-500`만 있음 | `dark:text-gray-400` 추가 또는 `style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[500] }}` |
| `app/(tabs)/inbox.tsx` | EmptyState에 dark 미전달 | `<EmptyState ... dark={theme === 'dark'} />` |
| (선택) `components/ui/EmptyState.tsx` | theme 직접 쓰지 않음 | prop `dark`로만 제어해도 됨(이미 구현됨). 호출부에서 theme 전달만 하면 됨. |

이후에도 특정 카드/라벨이 검정으로 보이면, 해당 컴포넌트에 `useTheme()` + `style={{ color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight }}` 적용.

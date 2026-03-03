# Phase 6.3: Accessibility (WCAG AA) — 완료 요약

**Date**: 2025-02-15  
**Project**: Mendly LifeBalance AI

---

## 적용 내용

### 1. accessibilityLabel 추가 (전체 버튼/주요 터치 영역)

| 화면 | 요소 | 라벨 |
|------|------|------|
| **Inbox** | Structure All, Add Entry, Voice/Stop, Save, Parse | Parse all entries with AI, Add entry to list, Start/Stop voice recording, Save as note, Parse entry with AI |
| **Schedule** | Generate, Try Again, Save Schedule, Calendar, New | Generate AI schedule, Try generating again, Save schedule, Open Calendar, Create new schedule |
| **Notes** | + New, note list item, Cancel, Save, Back, Edit, Delete, Link Event, Done, event toggle, Enhance | Create new note, Note: {title}, Cancel editing, Save note, Back to note list, Edit note, Delete note, Link calendar event, Close event link modal, Link/Unlink event {title}, View event {title}, Generate AI suggestions |
| **Calendar** | (기존) Notes, Import AI, Add, Prev/Next week, day tabs, (추가) Edit, Delete, modal, Cancel, Create | Edit event {title}, Delete event {title}, Close modal, New event form, Cancel new event, Create event |
| **Review** | Copy, Share, Export, Generate, Prev/Current/Next week | Copy review to clipboard, Share review, Export review as text, Generate AI insights, Previous week, Week {range}, Next week |
| **Profile** | Manage Subscription, (기존) Sign out | Manage subscription, Sign out |
| **Sign-in** | Sign In, Create account | Sign in, Create account |
| **Sign-up** | Sign Up, Sign in link | Sign up, Already have an account? Sign in |
| **Onboarding** | Next, Get started | Next slide, Get started |

### 2. hitSlop 적용 (작은 터치 영역)

- **Notes**: 노트 목록 항목(+8), 이벤트 링크 모달 Done(+8), 이벤트 토글/링크 카드(+8). (기존 Unlink ✕ hitSlop=8 유지)
- **Calendar**: (기존) 주간 탭(+8), 오늘 이동(+12)

### 3. accessibilityRole

- **Notes**: 노트 목록 Pressable `accessibilityRole="button"`  
- **Calendar**: 모달 백드롭 `accessibilityRole="button"`

### 4. 공통 컴포넌트

- **EmptyState**: `action` 사용 시 Button에 `accessibilityLabel={action.label}` 전달

---

## 터치 영역

- Button 기본: `min-h-[36px]`(sm), `min-h-[44px]`(md), `min-h-[52px]`(lg) — 44dp 이상 충족.
- 작은 Pressable(닫기, ✕, 리스트 셀): `hitSlop={8}` 또는 `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` 적용.

---

## 검증

- `npx tsc --noEmit`: 0 errors
- 모든 주요 버튼/링크에 `accessibilityLabel` 적용 완료
- 작은 터치 대상에 `hitSlop` 적용

---

## 권장 (추가 작업)

- **색 대비**: 텍스트/배경은 `text-gray-900`/`bg-white`, `dark:text-gray-100`/`dark:bg-gray-950` 사용으로 대비 확보. 필요 시 디자인 시스템에서 4.5:1 검사.
- **VoiceOver/TalkBack**: 실제 기기에서 주 흐름 스크린 리더 테스트 권장.
- **동적 글자 크기**: 지원 시 `allowFontScaling` 및 레이아웃 점검.

---
*Phase 6.3 Accessibility (WCAG AA) complete*

# Design: 캘린더·스케줄 UX 버그 수정

**Plan**: [calendar-event-ux-fixes.plan.md](../../01-plan/features/calendar-event-ux-fixes.plan.md)

---

## 1. Add Event 모달 (P1, P5)

- **KeyboardAvoidingView**: 모달 내부 최상단에 두고, behavior=padding, keyboardVerticalOffset 적절히.
- **ScrollView**: 모달 본문(제목 + 폼 + 버튼)을 ScrollView로 감싸서 키보드 시 스크롤 가능.
- **라벨**: 각 입력 필드 위에 `<Text>` 라벨 (Event title, Description (optional), Date, Start time). 라벨과 입력란 간격 8px.
- **카드/박스**: 각 필드를 `View`로 감싸고 rounded-xl, border, padding, 배경색(design-system).
- **터치 영역**: 입력란·버튼 minHeight 44px 유지.
- **필드 간격**: marginBottom 16 (mb-4).

## 2. 스케줄 스크롤 (P2)

- `contentContainerStyle`: `flexGrow: 1` 유지하되, `paddingBottom` 충분히 두어 끝까지 스크롤 가능.
- `scrollToEnd`: 메시지 또는 schedule 변경 시 호출. 타이밍을 100ms + requestAnimationFrame 또는 setTimeout(400)으로 레이아웃 반영 후 실행.

## 3. 타임테이블 보는 주 (P3)

- **Schedule** `addToCalendar` 성공 후: `router.push('/(tabs)/calendar?focusWeek=' + weekStart)` (weekStart는 YYYY-MM-DD).
- **Calendar**: `useLocalSearchParams<{ focusWeek?: string }>()`. `focusWeek`가 있으면 `setViewingMonth(new Date(focusWeek + 'T12:00:00'))`, `setViewMode('timetable')` 한 번 적용 (useEffect, 의존성 focusWeek).

## 4. 드래그 드롭 시각 (P4)

- 타임테이블 셀: 드롭 타겟일 때 배경색을 더 진하게 (예: rgba(139, 92, 246, 0.25)), 테두리 2px violet.
- 상단 안내 문구 유지: "Tap a cell to move event · Tap Cancel to clear".

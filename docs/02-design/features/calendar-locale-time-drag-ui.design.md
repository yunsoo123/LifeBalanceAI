# Calendar Locale, Time Picker, Drag & App-Wide UI - Design

**Date**: 2025-02-22
**Author**: PDCA
**Project**: Mendly (LifeBalanceAI)
**Plan**: [calendar-locale-time-drag-ui.plan.md](../../01-plan/features/calendar-locale-time-drag-ui.plan.md)

---

## 1. Locale (date / weekday)

### 1.1 Rule

- Use **locale** = `lang === 'ko' ? 'ko-KR' : 'en-US'` for every `toLocaleDateString(..., { weekday, month, ... })` and `toLocaleTimeString(...)` that is user-facing.
- **Files to touch**: `app/(tabs)/calendar.tsx`, `app/(tabs)/review.tsx`, `app/(tabs)/inbox.tsx`, `app/(tabs)/notes.tsx` (any date/weekday display). Optionally add `lib/formatDateByLang.ts` and use it everywhere.

### 1.2 Implementation

- In calendar: pass `lang` from `useI18n()`; replace hardcoded `'en-US'` with locale variable; ensure add-form and edit-form dates use same locale.
- In review/inbox/notes: same pattern where date/weekday is shown.

---

## 2. Time picker (scroll wheel)

### 2.1 Choice

- **Scroll wheel picker** (two columns: hour, minute). Slider is worse for precise time (e.g. 14:35). Wheel is familiar and works on web (scroll/drag) and native.

### 2.2 Spec

- **Component**: Reusable `TimeWheelPicker` (or `TimePicker`) that accepts `value: string` (HH:MM), `onChange: (value: string) => void`, optional `minuteStep` (default 5 or 15).
- **UI**: Hour column (0–23 or 1–12 + AM/PM; prefer 24h for consistency), minute column (0–59 or 0, 15, 30, 45). ScrollView with snap or flatlist with scrollToIndex to center selection. Display selected time as HH:MM below or inside.
- **Where**: Add-event modal: replace start/end TextInputs with TimePicker. Edit-event modal: same.
- **Fallback**: Keep optional text input or "직접 입력" if desired; at minimum, primary path is wheel.

### 2.3 Dependencies

- No new dependency if implemented with ScrollView + FlatList. If using community DateTimePicker for native, use `mode="time"` and 24h; then web needs a custom wheel. Prefer **custom wheel** for one code path (web + native).

---

## 3. Timetable drag-and-drop (Phase 2)

### 3.1 Library

- Add **react-native-gesture-handler** (RNGH). Use **PanGestureHandler** on the event block view. On `onEnd`, compute the cell under the finger from gesture position and timetable layout; call existing `updateEventTime(id, newStart, newEnd)` and conflict flow.

### 3.2 Behavior

- **Drag start**: Pointer/finger down on event block → block follows (translateX/Y or position). Visual: opacity 0.9, elevation.
- **Drop**: Pointer/finger up → snap to nearest cell (same logic as current tap-drop). If conflict, show existing ConflictModal.
- **Cancel**: Drag outside grid or explicit cancel → revert.

### 3.3 Status

- **Implemented (Phase 2)**: react-native-gesture-handler added. Event blocks wrapped in GestureDetector + Pan gesture; on start measure block position and show ghost at finger; on update ghost follows (Modal with absolute position); on end compute drop cell from grid layout + scroll offset, then updateEventTime or ConflictModal. Long-press + tap still works; drag requires ~8px movement (minDistance) so tap/long-press are unchanged.

---

## 4. App-wide UI consistency

### 4.1 Reference

- **New-event modal** (calendar add): Title (fontSize 20, bold), block per field with label (13px semibold, mb-8), input container (minHeight 48, rounded-xl, border, padding), primary/outline buttons. Card: rounded-20, shadow, maxWidth 400, padding 24.

### 4.2 Tokens to apply everywhere

- **Screen background**: `bg-slate-50 dark:bg-zinc-950` or from LAYOUT.screenBg.
- **Cards**: `rounded-2xl` or `rounded-3xl`, `border border-gray-200/80 dark:border-zinc-800`, `bg-white dark:bg-zinc-900`, padding 5–6, shadow if needed.
- **Section / block label**: `text-[13px] font-semibold`, `marginBottom: 8`, secondary color.
- **Input container**: `minHeight 48`, `rounded-xl`, `border`, `px-4 py-3`, same border/background as new-event modal.
- **Buttons**: Same Button component; primary/outline; rounded-xl; minHeight 48 where appropriate.

### 4.3 Screens to align

- **sign-in.tsx**: Already has card; ensure label/input block style matches (block label above input, input container minHeight/rounded-xl).
- **sign-up.tsx**: Same as sign-in.
- **inbox.tsx**: Header, cards (InboxEntryItem, QUICK NOTE block), buttons — use same block/card style.
- **schedule.tsx**: Header, input area, cards — same.
- **calendar.tsx**: Already has new-event modal as reference; list/day view cards to use same tokens.
- **notes.tsx**: Header, note cards, empty state — same.
- **review.tsx**: Header, metric cards, report card — same.
- **profile.tsx**: Header, settings rows/cards — same.

### 4.4 No breaking changes

- Only style/className/layout changes; no removal of features or change of behavior beyond visual consistency.

---

## 5. Implementation order

1. **Locale** — Small, low risk. Apply in calendar, then review/inbox/notes.
2. **Time picker** — New component; integrate into add and edit modals.
3. **Timetable drag** — Add RNGH; wrap event block in PanGestureHandler; implement position mapping and drop.
4. **App-wide UI** — Pass over sign-in, sign-up, then each tab screen and apply tokens.

---

## 6. Acceptance

- [ ] All date/weekday use locale from lang.
- [ ] Start/end time chosen via time picker (wheel).
- [ ] Event blocks are draggable with pointer/finger and drop updates time.
- [ ] Login, sign-up, and all main screens use the same card/block/input design language as the new-event modal.

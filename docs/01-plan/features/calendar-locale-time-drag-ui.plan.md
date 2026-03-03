# Calendar Locale, Time Picker, Drag & App-Wide UI - Plan

**Date**: 2025-02-22
**Author**: PDCA
**Project**: Mendly (LifeBalanceAI)

---

## Overview

Four work streams to improve calendar UX and app-wide visual consistency:

1. **Locale**: When app language is Korean, all date and weekday labels (calendar, add/edit modals, timetable) must display in Korean (ko-KR), not English.
2. **Time picker**: Replace free-text start/end time with a **scroll wheel** time picker so users select time by scrolling (no typing HH:MM).
3. **Timetable drag**: Implement real **drag-and-drop** for event blocks (mouse on web, finger on app) using react-native-gesture-handler, instead of long-press + tap.
4. **UI consistency**: Apply the "새일정" (new event) page design language to **all screens** (login, sign-up, tabs: Inbox, Schedule, Calendar, Notes, Review, Profile) so layout, cards, headers, and inputs are consistent.

---

## Scope

- **In scope**: Calendar date/weekday locale; time picker in add/edit event modals; timetable PanGestureHandler drag; design tokens (block labels, card, input style) applied app-wide including sign-in, sign-up, and every tab screen.
- **Out of scope**: Changing app logic or API contracts; new backend features.

---

## Success Criteria

- [ ] Korean locale: All date/weekday strings use ko-KR when lang is ko.
- [ ] Time picker: Start and end time selected via scroll wheel (or equivalent picker); no mandatory typing.
- [ ] Timetable: User can drag an event block with pointer/finger and drop on a cell; DB updates; conflict handling unchanged.
- [ ] UI: Login, sign-up, and main tabs share the same card/block/input style as the new-event modal (rounded cards, labeled blocks, minHeight inputs, consistent spacing).

---

## Next Steps

Create design doc (`docs/02-design/features/calendar-locale-time-drag-ui.design.md`), then implement in order: (1) locale, (2) time picker, (3) drag, (4) app-wide UI.

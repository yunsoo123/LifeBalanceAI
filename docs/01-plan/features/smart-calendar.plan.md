# Smart Calendar - Plan

**Date**: 2025-02-13  
**Author**: [Your Name]  
**Estimated Effort**: 5 days  
**Priority**: P0

---

## Overview

A calendar that auto-places activities from the approved AI schedule into time slots, then lets users drag events to adjust. Conflict detection warns when events overlap. Events are color-coded by goal/category so the plan is easy to scan.

## User Story

**As a** user with a generated schedule  
**I want** to see it in a calendar and adjust easily  
**So that** I know when to do what and can fix conflicts

**Acceptance Criteria**:

- [ ] Weekly and monthly views
- [ ] Auto-places events from approved schedule
- [ ] Drag-and-drop to reschedule
- [ ] Conflict warnings (overlapping events)
- [ ] Color-coded by goal category

## Scope

**In Scope (MVP)**:

- ✅ Week and month views
- ✅ Auto-placement from schedule
- ✅ Drag-and-drop reschedule
- ✅ Conflict detection and warnings

**Out of Scope (Post-MVP)**:

- ❌ Year view
- ❌ Recurring events (v1: manual only)
- ❌ External calendar sync (Google, etc.)

## Dependencies

- **External API**: None
- **Database**: `events` table, `goals` table (for colors/labels)
- **Libraries**: react-native-calendars or similar
- **Components**: Calendar grid, event card, conflict banner

## Success Criteria

1. **Functional**: 90% of events placed without conflicts after auto-placement or user adjustment.
2. **Performance**: Smooth drag interaction (no visible lag).
3. **UX**: Clear weekly/monthly views, obvious conflict feedback, consistent colors per goal.

## Technical Notes

Use react-native-calendars (or equivalent) for week/month views. Auto-placement: for each activity from the schedule, find earliest available slot that respects optimal_time and duration; persist as `events`. On drag, update event start/end and run conflict check (overlapping events for same user); show warning and allow save or revert. Color: map goal_id to a fixed palette. Risk: timezone handling; store and display in user timezone consistently.

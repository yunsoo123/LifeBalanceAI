# Weekly Review - Plan

**Date**: 2025-02-13  
**Author**: [Your Name]  
**Estimated Effort**: 4 days  
**Priority**: P0

---

## Overview

Every Sunday at 8pm (user timezone), the app triggers a weekly review. The AI generates a performance report: completed hours per goal, completion %, and 3–5 suggestions (e.g. "Consider app-locking distracting apps during app dev time"). Users can also open the review manually anytime.

## User Story

**As a** user  
**I want** weekly feedback on my performance and suggestions to improve  
**So that** I can see progress and adjust my habits

**Acceptance Criteria**:

- [ ] Auto-triggers Sunday 8pm (user timezone)
- [ ] Shows KPI table (goal, planned hrs, actual hrs, completion %)
- [ ] 3–5 AI suggestions based on patterns
- [ ] One-tap to apply suggestions (e.g. create app lock rule)
- [ ] User can manually trigger review anytime

## Scope

**In Scope (MVP)**:

- ✅ Auto-trigger (Sunday 8pm)
- ✅ KPI table (planned vs actual by goal)
- ✅ AI suggestions
- ✅ Manual trigger
- ✅ One-tap apply (where applicable)

**Out of Scope (Post-MVP)**:

- ❌ Monthly/yearly reviews
- ❌ Comparison with other users

## Dependencies

- **External API**: OpenAI GPT-4o-mini for suggestions
- **Database**: `weekly_reviews` table, `events` (for actual hours), `goals`, `schedules`
- **Triggers**: Supabase cron or client-side scheduled notification
- **Components**: Table, suggestion cards, apply button

## Success Criteria

1. **Functional**: 60% of users view the weekly review at least once per month.
2. **Performance**: Review screen loads in <2 seconds; suggestions generated in <5 seconds.
3. **UX**: 30% of users apply at least one suggestion (e.g. add rule or goal change).

## Technical Notes

Use Supabase cron (pg_cron) or client-side scheduled task (e.g. local notification Sunday 8pm in user timezone) to create/refresh the review. Actual hours: sum event durations from `events` for the week, grouped by goal_id. Planned hours: from `schedules` or goals. Store summary and suggestions in `weekly_reviews` (summary_text, completed_hours jsonb, suggestions text[]). GPT-4o-mini: input completion rates and patterns; output 3–5 short, actionable suggestions. "Apply" can create a follow-up task or open a relevant screen (e.g. app block). Risk: timezone bugs; store and compute in user's timezone consistently.

# AI Schedule Generator - Plan

**Date**: 2025-02-13  
**Author**: [Your Name]  
**Estimated Effort**: 5 days  
**Priority**: P0

---

## Overview

User types goals in free-form text; the AI asks 3–5 clarifying questions (hours available, sleep, constraints) and generates a realistic weekly time allocation. A reality check ensures total hours ≤ 168 and accounts for sleep. This is the core value proposition: turning chaos into structure.

## User Story

**As a** user with multiple goals  
**I want** AI to create a realistic schedule  
**So that** I don't over-commit and burn out

**Acceptance Criteria**:

- [ ] Free-form text input for goals
- [ ] AI asks 3–5 clarifying questions
- [ ] Generates schedule in <5 seconds
- [ ] Shows reality check (total hours ≤ 168, sleep accounted)
- [ ] One-tap approve → adds to calendar

## Scope

**In Scope (MVP)**:

- ✅ Text input for goals
- ✅ AI generation with clarifying questions
- ✅ Reality check (hours, sleep)
- ✅ Approve action → add to calendar

**Out of Scope (Post-MVP)**:

- ❌ Voice input for goals
- ❌ In-app schedule editing (adjust in calendar)
- ❌ Multiple schedule versions / A/B

## Dependencies

- **External API**: OpenAI GPT-4o-mini
- **Database**: `schedules` table, `events` table
- **Components**: Button, Spinner, input components from Phase 2

## Success Criteria

1. **Functional**: 80% of users accept the generated schedule (approve and add to calendar).
2. **Performance**: Schedule generation completes in <5 seconds.
3. **UX**: Clear flow: input → questions → schedule → reality check → approve.

## Technical Notes

Use GPT-4o-mini with few-shot prompting and a structured output schema. Validate AI response with Zod before saving. Store schedule in `schedules` (activities_json, total_hours, feasible, suggestions); on approve, create `events` from activities. Risk: prompt drift; mitigate with fixed schema and regression checks.

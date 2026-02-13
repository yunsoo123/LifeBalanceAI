# Notion-style Notes - Plan

**Date**: 2025-02-13  
**Author**: [Your Name]  
**Estimated Effort**: 6 days  
**Priority**: P0

---

## Overview

A rich-text note editor linked to calendar events. Supports markdown-style formatting (bold, italic, headings, lists, code blocks). Users can open a note from an event and use AI to compile a weekly portfolio from their notes (e.g. "Generate portfolio from this week's app dev notes").

## User Story

**As a** developer  
**I want** to log code and thoughts per project and auto-generate a portfolio  
**So that** I have a clear record and can share progress

**Acceptance Criteria**:

- [ ] Rich text editor (bold, italic, headings, lists, code blocks)
- [ ] Click calendar event → opens linked note
- [ ] Search across all notes
- [ ] AI compilation: "Generate portfolio from this week's notes"
- [ ] Supports markdown export

## Scope

**In Scope (MVP)**:

- ✅ Rich text editing
- ✅ Link note to event (notes.event_id → events.id)
- ✅ Search notes
- ✅ AI portfolio compilation

**Out of Scope (Post-MVP)**:

- ❌ Real-time collaboration
- ❌ Version history

## Dependencies

- **External API**: OpenAI GPT-4o-mini for compilation
- **Database**: `notes` table, `events` table (FK notes.event_id)
- **Libraries**: react-native-pell-rich-editor or TipTap (or equivalent with markdown)
- **Components**: Rich editor, note list, search bar

## Success Criteria

1. **Functional**: 50% of events have a linked note created within 7 days.
2. **Performance**: Portfolio generation completes in <10 seconds.
3. **UX**: One tap from event to note; search returns relevant notes; portfolio output is readable and shareable.

## Technical Notes

Use a rich text library with markdown support; store content as markdown or HTML in `notes.content`. Enforce FK: notes.event_id → events.id (nullable for standalone notes). Search: full-text on title + content (PostgreSQL or client-side filter). AI compilation: send selected notes (e.g. by week + goal) to GPT-4o-mini with a "portfolio" prompt; validate and return formatted text; support markdown export. Risk: large notes; consider pagination or length limits for AI context.

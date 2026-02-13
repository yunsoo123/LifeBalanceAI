# Inbox & Brain Dump - Plan

**Date**: 2025-02-13  
**Author**: [Your Name]  
**Estimated Effort**: 3 days  
**Priority**: P0

---

## Overview

A blank page where users type or speak thoughts without structure. Content is auto-saved and can later be parsed by AI into goals, tasks, and notes. Removes planning friction so users can capture racing thoughts first and organize later.

## User Story

**As a** user with racing thoughts  
**I want** to dump everything into one place without organizing  
**So that** I can capture ideas before I lose them

**Acceptance Criteria**:

- [ ] Blank text area, no form fields
- [ ] Auto-saves every 2 seconds
- [ ] Optional voice input (Whisper API)
- [ ] One-tap "Structure this" → AI parses into goals/tasks
- [ ] Works offline (queue sync when back online)

## Scope

**In Scope (MVP)**:

- ✅ Plain text input
- ✅ Auto-save (debounced)
- ✅ Voice input (Whisper)
- ✅ AI parsing to goals/tasks

**Out of Scope (Post-MVP)**:

- ❌ Rich text formatting (handled in Notion-style Notes)

## Dependencies

- **External API**: Whisper API (optional), OpenAI GPT-4o-mini for parsing
- **Database**: `notes` table (or temporary inbox storage)
- **Components**: TextInput, Button, optional voice button

## Success Criteria

1. **Functional**: 70% of users use Inbox as entry point at least once in first week.
2. **Performance**: Save completes in <1 second (debounced).
3. **UX**: Zero UI friction: blank page, no required fields, clear "Structure this" CTA.

## Technical Notes

Use a single TextInput with debounced auto-save (e.g. 2s). For voice, call Whisper API and append transcript to the same field. For "Structure this", send content to GPT-4o-mini with a schema (goals/tasks); validate with Zod and create DB records. Offline: queue writes in local storage and sync when online. Risk: long transcripts; consider length limit or chunking for parsing.

# Mendly - MVP Feature Prioritization

**Date**: 2025-02-13  
**Author**: [Your Name]  
**Project**: Mendly  
**Target**: 12-week MVP launch

---

## Prioritization Framework

Use this scoring system (1–5 scale):

- **User Value**: How much users need this (5 = must-have, 1 = nice-to-have)
- **Technical Complexity**: Implementation difficulty (5 = very hard, 1 = very easy)
- **MVP Priority Score**: User Value ÷ Technical Complexity (higher = build first)

---

## MVP Features (Build in Phase 4, Weeks 5–8)

List exactly 5 features for MVP with detailed specifications:

### 1. AI Schedule Generator (Priority Score: 5.0)

- **User Value**: 5/5 (Core value proposition — turns chaos into structure)
- **Technical Complexity**: 1/5 (GPT-4o-mini + basic prompt engineering)
- **Description**: User types goals in free-form text → AI asks 3–5 clarifying questions (hours available, sleep, constraints) → Generates realistic weekly time allocation
- **User Story**: "As a user with multiple goals, I want AI to create a realistic schedule so I don't over-commit"
- **Success Criteria**:
  - Generates schedule in <5 seconds
  - Includes reality check (total hours ≤168, accounts for sleep)
  - Provides actionable suggestions
  - 80% of users accept the generated schedule
- **Dependencies**: OpenAI API, Zod validation
- **Estimated Effort**: 5 days

### 2. Inbox & Brain Dump (Priority Score: 5.0)

- **User Value**: 5/5 (Removes planning friction — just type/speak freely)
- **Technical Complexity**: 1/5 (Text input + optional Whisper voice-to-text)
- **Description**: Blank page where users type or speak thoughts without structure → Later parsed by AI into goals, tasks, notes
- **User Story**: "As a user with racing thoughts, I want to dump everything into one place without organizing"
- **Success Criteria**:
  - Zero UI friction (blank page, no fields)
  - Voice input works (Whisper API)
  - Auto-saves every 2 seconds
  - Can convert to structured items with one tap
- **Dependencies**: Whisper API (optional), auto-save logic
- **Estimated Effort**: 3 days

### 3. Smart Calendar (Priority Score: 4.0)

- **User Value**: 5/5 (Core visualization — see the plan in action)
- **Technical Complexity**: 1.25/5 (React Native calendar library + auto-placement algorithm)
- **Description**: Calendar that auto-places activities based on optimal times and user constraints → Drag-to-adjust → Conflict detection
- **User Story**: "As a user with a generated schedule, I want to see it in a calendar and adjust easily"
- **Success Criteria**:
  - Weekly and monthly views
  - Auto-places events from AI schedule
  - Drag-and-drop to reschedule
  - Conflict warnings (overlapping events)
  - Color-coded by goal/category
- **Dependencies**: react-native-calendars or similar
- **Estimated Effort**: 5 days

### 4. Notion-style Notes (Priority Score: 3.3)

- **User Value**: 5/5 (Critical for project work — code snippets, logs, reflections)
- **Technical Complexity**: 1.5/5 (Rich text editor + calendar linking)
- **Description**: Rich-text note editor linked to calendar events → Supports markdown, code blocks, checklists → AI can auto-compile weekly notes into portfolio
- **User Story**: "As a developer, I want to log code and thoughts per project and auto-generate a portfolio"
- **Success Criteria**:
  - Rich text editing (bold, italic, headings, lists, code blocks)
  - Click calendar event → opens linked note
  - AI compilation: "Generate portfolio from this week's app dev notes"
  - Search across all notes
- **Dependencies**: TipTap or similar rich-text library, GPT-4o-mini for compilation
- **Estimated Effort**: 6 days

### 5. Weekly Review (Priority Score: 4.0)

- **User Value**: 4/5 (High retention driver — users see progress and get coaching)
- **Technical Complexity**: 1/5 (GPT-4o-mini summarization + simple UI)
- **Description**: Every Sunday night, AI generates a performance report → Shows completed hours per goal → Suggestions (e.g., "Consider app-locking poker apps during app dev time")
- **User Story**: "As a user, I want weekly feedback on my performance and suggestions to improve"
- **Success Criteria**:
  - Auto-triggers Sunday 8pm (user's timezone)
  - Shows KPI table (goal, planned hours, actual hours, completion %)
  - 3–5 AI suggestions based on patterns
  - One-tap to apply suggestions (e.g., create app lock rule)
- **Dependencies**: GPT-4o-mini, time-based triggers (Supabase cron or client-side)
- **Estimated Effort**: 4 days

**Total MVP Effort**: 23 days (fits in 4-week Phase 4)

---

## Post-MVP Features (Defer to Phase 9+)

List 8+ features to build after launch:

### Energy Level Tracking

- **User Value**: 3/5 (Optimization, not core)
- **Technical Complexity**: 2/5 (Tracking UI + scheduling algorithm update)
- **Why Post-MVP**: Need MVP data to validate if users actually use this
- **Estimated Launch**: Month 4

### Habit Tracker with AI Coaching

- **User Value**: 4/5 (Retention booster)
- **Technical Complexity**: 2/5 (Daily check-ins + streak logic)
- **Why Post-MVP**: MVP focuses on planning, not habit enforcement
- **Estimated Launch**: Month 5

### Gamification (Streaks, Badges, Levels)

- **User Value**: 3/5 (Fun but not essential)
- **Technical Complexity**: 2/5 (Point system + UI)
- **Why Post-MVP**: Premature — need engaged users first
- **Estimated Launch**: Month 6

### Mobile Widgets (iOS/Android)

- **User Value**: 4/5 (Convenience)
- **Technical Complexity**: 3/5 (Platform-specific APIs)
- **Why Post-MVP**: Requires stable app first
- **Estimated Launch**: Month 7

### Team Collaboration Features

- **User Value**: 5/5 (For Teams tier)
- **Technical Complexity**: 4/5 (Permissions, shared calendars, real-time sync)
- **Why Post-MVP**: Individual use case must work first
- **Estimated Launch**: Month 8

### Integrations (Google Calendar, Notion, Todoist)

- **User Value**: 4/5 (Power users love this)
- **Technical Complexity**: 3/5 (OAuth + API sync)
- **Why Post-MVP**: Each integration is 1–2 weeks; defer until traction
- **Estimated Launch**: Month 9+

### AI Voice Assistant (Voice-only interaction)

- **User Value**: 3/5 (Cool but niche)
- **Technical Complexity**: 4/5 (Real-time voice, conversation state)
- **Why Post-MVP**: MVP proves text-based AI works first
- **Estimated Launch**: Month 10+

### Web Version (Full Desktop App)

- **User Value**: 4/5 (Many users prefer desktop)
- **Technical Complexity**: 2/5 (Next.js + same backend)
- **Why Post-MVP**: Mobile-first; web is parallel effort after MVP
- **Estimated Launch**: Month 6

---

## Decision Rationale

### Why These 5 for MVP?

1. **Core Loop**: Inbox → AI Schedule → Calendar → Notes → Weekly Review completes the full user journey
2. **Differentiation**: AI-driven scheduling + reality check is unique vs competitors
3. **Technical Feasibility**: All use GPT-4o-mini (same API), no complex integrations
4. **Time-to-Value**: User sees value in first session (schedule generated in 30 seconds)
5. **Validation**: Tests key hypothesis — "Will users trust AI to plan their time?"

### What We're NOT Building (Yet)

- ❌ Habit tracking (nice-to-have, not core value prop)
- ❌ Gamification (premature without engaged users)
- ❌ Team features (need individual PMF first)
- ❌ Integrations (scope creep; defer until traction)
- ❌ Web version (mobile-first MVP)

---

## Success Metrics (MVP)

Define how we'll measure MVP success:

- **Activation**: 70% of sign-ups complete AI schedule generation
- **Engagement**: 40% DAU/MAU ratio (daily active / monthly active)
- **Retention**: 30% Day-7 retention, 15% Day-30 retention
- **Monetization**: 5% free-to-paid conversion within 30 days
- **NPS**: ≥40 (product-market fit indicator)

---

## Next Steps

After this document is approved:

1. Create detailed PDCA plans for each of the 5 MVP features (Prompt 1.2–1.3)
2. Design data model to support all 5 features (Prompt 1.4)
3. Write Supabase migration SQL (Prompt 1.5)
4. Validate tech stack choices (Prompt 1.6)

---

**Deliverables**: 5 MVP features with specs, 8+ post-MVP features with timeline, decision rationale, success metrics.

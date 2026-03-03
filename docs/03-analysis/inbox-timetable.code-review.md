# Code Review: Inbox Timetable / Schedule Flow

**Scope**: `parse-schedule+api.ts`, `auto-schedule+api.ts`, `lib/ai/parse-schedule.ts`, `lib/autoSchedulePlacement.ts`, and schedule-related parts of `app/(tabs)/inbox.tsx`.

**Reference**: `.cursorrules`, `docs/02-design/features/inbox-timetable.design.md`, `lib/design-system.ts`, `.cursor/rules/bkit-conventions.mdc`.

---

## Summary

**Files reviewed**: 5. **Critical**: 2 · **Warnings**: 6 · **Suggestions**: 4. TypeScript and naming are in good shape; main gaps are leaking error details to the client, missing AI cost logging, and a few UX/convention items.

---

## Findings

### Critical (must fix)

| # | Location | Finding | Fix |
|---|----------|---------|-----|
| 1 | **parse-schedule+api.ts:33–38**, **auto-schedule+api.ts:28–33** | 500 responses include `details: error.message`, exposing raw/server errors to the client. | Remove `details` from the JSON body in production responses. Return only `{ error: '...' }` (user-facing message). Log full error server-side only. |
| 2 | **lib/ai/parse-schedule.ts** | No token-usage or cost logging for OpenAI calls. | After `getOpenAI().chat.completions.create(...)`, log `response.usage` (and optionally model) for cost tracking, as required by project rules. |

---

### Warnings (should fix)

| # | Location | Finding | Fix |
|---|----------|---------|-----|
| 3 | **app/api/inbox/parse-schedule+api.ts** | No server-side rate limiting; client-only `checkLimit('parses')` can be bypassed. | Add rate limiting on the route (e.g. by IP or auth) per project rule (e.g. 10 req/min free, 50 req/min pro), or document that enforcement is client-only by design. |
| 4 | **inbox.tsx:419–420, 451–452** | Parsed list and timetable preview use `key={\`${ev.title}-${idx}\`}`. Keys are not missing but use index and non-stable title. | Prefer a stable key, e.g. `key={\`parsed-${idx}\`}` and `key={\`placed-${idx}\`}` if list is not reordered; or generate a client-side id when setting state. |
| 5 | **inbox.tsx:99** | Inline style `style={leftBorderColor ? { borderLeftWidth: 4, borderLeftColor: leftBorderColor } : undefined}` for accent. | Prefer design-system (e.g. `colors.success.DEFAULT`) for the color value; keep style prop only for the dynamic left border if Tailwind cannot express it. |
| 6 | **inbox.tsx:383–384, 363–364** | Error alerts show `err instanceof Error ? err.message : 'Unknown error'` — raw message may be technical or from API. | Use a user-facing message (e.g. "일정 파싱에 실패했어요. 다시 시도해 주세요.") and only log the raw error; avoid showing API/server text in the alert. |
| 7 | **inbox.tsx** | `runAutoSchedule` inserts events one-by-one in a loop; partial failure leaves DB in mixed state and no rollback. | Consider inserting in a single batch (if Supabase supports multi-insert) or collect errors and show "X of Y added" with retry for failures. |
| 8 | **docs/02-design/features/inbox-timetable.design.md §2.2** | Design says auto-schedule response includes `created`, `eventIds` and "DB: events insert". | Implementation returns `eventsToCreate` and does insert on the client (RLS respected). Either update the design doc to match (client-side insert + `eventsToCreate`) or add a note that response shape differs by design. |

---

### Suggestions (consider)

| # | Location | Finding | Fix |
|---|----------|---------|-----|
| 9 | **parse-schedule+api.ts:15, auto-schedule+api.ts:16** | `parsed.error.issues.map((e: { message: string }) => e.message)` — inline type. | Use Zod’s `ZodIssue` type for the callback parameter (e.g. `(e: ZodIssue) => e.message`) for consistency. |
| 10 | **inbox.tsx** | Client does not validate API responses with Zod (uses type assertions for `data.events`, `data.eventsToCreate`). | Add Zod schema (e.g. re-use `ParsedScheduleEventSchema` and a small schema for auto-schedule response) and `safeParse` before using API payloads for stronger runtime safety. |
| 11 | **lib/autoSchedulePlacement.ts:12–18** | `BLOCK_COLORS` is a constant array; name is UPPER_SNAKE. OK. Hex values duplicate design-system palette. | Optionally import from `lib/design-system` or a shared palette constant to keep colors in one place. |
| 12 | **inbox.tsx:424** | "Auto-Schedule" label shown for both ko/en in one branch (`lang === 'ko' ? 'Auto-Schedule' : 'Auto-Schedule'`). | Use `autoScheduleLabel` (already defined at 368) for consistency and correct i18n. |

---

## OK (no change required)

- **TypeScript**: No `any`; types and Zod schemas used in API and in `parse-schedule.ts`. `EventToCreate` and `ParsedScheduleEvent` are properly typed.
- **Naming**: PascalCase components (`InboxEntryItem`), camelCase functions (`parseScheduleFromInbox`, `runAutoSchedule`, `placeParsedEvents`), UPPER_SNAKE for `BLOCK_COLORS`, `FREE_TIER_LIMITS`, `DAY_NAMES_KO`.
- **Security**: Request bodies validated with Zod. No secrets in client code. RLS respected: events inserted with `user_id` from `supabase.auth.getUser()` on the client.
- **Error handling**: Try/catch in API routes and in `parseScheduleFromInbox` / `runAutoSchedule`; user-facing messages in Korean/English; retry actions in alerts.
- **Loading / empty states**: `scheduleParseLoading` and `autoScheduleLoading` with spinners; "Parse to schedule" disabled when empty; parsed list and timetable only shown when data exists.
- **Touch targets**: Buttons use `h-11` / `h-12` / `min-h-12` (44–48px) and `min-w-[48px]` where needed — meets 44×44dp guidance.
- **Design system**: Brand color used for primary buttons (`colors.brand.primary`); `LAYOUT.card`, `DARK_BG_COLOR` used; timetable chips use `ev.color` from placement (dynamic).
- **AI**: Single structured call per parse; `response_format: { type: 'json_object' }` and Zod `ResponseSchema` validate AI output; no unbounded or unvalidated AI calls.
- **List keys**: All `.map()` render lists have a `key`; only the stability of the key value was noted above.

---

## Suggested fix order

1. Remove `details` from 500 responses in both inbox API routes (critical for security/UX).
2. Add token-usage logging in `parse-schedule.ts`.
3. Replace raw error message in inbox alerts with a fixed user-facing string and log the real error.
4. Optionally add server-side rate limiting for `parse-schedule` and align design doc with actual response shape.

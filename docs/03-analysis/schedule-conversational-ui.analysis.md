# Schedule Conversational UI - Gap Analysis

**Date**: 2025-02-23  
**Feature**: schedule-conversational-ui  
**Design doc**: [schedule-conversational-ui.design.md](../02-design/features/schedule-conversational-ui.design.md)  
**Project**: Mendly (LifeBalance AI)

---

## Overview

This report compares the **design document** (source of truth) for the Schedule conversational UI with the **current implementation** in `LifeBalanceAI`. The feature provides a two-panel layout: left panel for CORE FEATURE 01 copy, right panel for Mendly header, chat thread, reality-check badge, input card, result card, and CTAs. Responsive behavior (wide = side-by-side, narrow = collapsible top section), state, API contract, copy, error handling, and accessibility are compared below.

---

## 1. UI Structure & Layout

| Design item | Status | Notes |
|-------------|--------|--------|
| Wide: left fixed panel + right chat/result area | **Match** | `schedule.tsx` uses `flex-row`, `ScheduleLeftPanel` when `isWide && !leftPanelCollapsed`. |
| Narrow: collapsible left (Option A/B) | **Match** | Hamburger/title toggle; when open, left panel as top stack with `ScheduleLeftPanel compact`. |
| Left panel width 280–320px | **Changed** | Implementation uses `minWidth: 260, maxWidth: 320` (260 vs 280). |
| Right: Mendly header + dot + "Online" | **Changed** | Design: "보라 점" (purple dot). Code: `bg-emerald-500` (green dot). |
| ScrollView: Chat → RealityCheckBadge → InputCard → ResultCard → CTA | **Match** | Order and presence match. |
| ChatThread as ChatBubble × N | **Match** | Inline map of `ChatBubble` (design allows "인라인 map"). |
| RealityCheckBadge (feasible / risk / none) | **Match** | Variant `safe` \| `risk` \| `pending`; shown when messages or schedule. |
| InputCard with placeholder and send | **Match** | Card with label, TextInput, send button. |
| ResultCard when schedule exists | **Match** | 112h/168h, Safe, free hours, copy as in design. |
| Activity list (선택) | **Match** | Activity list with icons in schedule result block. |
| CTA "캘린더에 등록하기" (purple) | **Match** | Purple `#8B5CF6`, correct label. |

---

## 2. Left Panel (CORE FEATURE 01)

| Design item | Status | Notes |
|-------------|--------|--------|
| Header "CORE FEATURE 01" | **Match** | `ScheduleLeftPanel.tsx`. |
| Title KO: "AI 대화형 일정 생성" | **Match** | |
| Title EN: "AI Conversational Schedule" | **Match** | |
| Subtitle "Brain Dump to Structured Plan" | **Match** | |
| 4 bullets: icon + title + body | **Match** | BULLETS array with icon, titleKo/En, bodyKo/En. |
| Bullet 1 KO title/body | **Match** | "나 앱개발이랑 알바하고 싶은데…" + friend/AI copy. |
| Bullet 1 EN | **Minor** | Design: "Speak as to a friend; AI handles time math." Impl: "Just like talking to a friend" / "Speak freely; AI handles the time math." |
| Bullets 2–4 KO | **Match** | 자연어&음성, 5-Step 스마트 질의응답, 현실성 체크. |
| Bullets 2–4 EN | **Match** | Same meaning; wording slightly different. |
| Icons: 말풍선, 마이크, 물음표, 저울 | **Match** | 💬, 🎤, ❓, ⚖️. |
| Compact prop for narrow layout | **Match** | `compact` used; no fixed min/max width when compact. |

---

## 3. Data & State

| Design item | Status | Notes |
|-------------|--------|--------|
| messages: `{ role, content }[]` | **Match** | `ChatMessage[]`, append user on send, assistant on response. |
| schedule: `ScheduleResult \| null` | **Match** | Set when `type: 'schedule'`. |
| loading: boolean | **Match** | `setLoading(true/false)` around API call. |
| error: string | **Match** | `setError`, displayed with retry. |
| leftPanelCollapsed: boolean | **Match** | State + toggle on narrow. |
| Message rules: user append then API; question → assistant append; schedule → setSchedule + assistant message | **Match** | Implemented; rollback on error (`prev.slice(0, -1)`). |

---

## 4. API Contract

| Design item | Status | Notes |
|-------------|--------|--------|
| POST /api/schedule/chat | **Match** | `chat+api.ts` POST handler. |
| Request body: `{ messages: { role, content }[] }` | **Match** | `ChatBodySchema` Zod with role enum and content string. |
| Response: `{ type: 'question', content }` \| `{ type: 'schedule', data: ScheduleResult }` | **Match** | `scheduleChat()` return type; API returns `result` as JSON. |
| ScheduleResult: activities, totalHours, feasible, suggestions | **Match** | `ScheduleSchema` in `schedule-generator.ts`; same shape. |
| Rate limit: usage only when type 'schedule' | **Match** | Client calls `incrementUsage('schedules')` only for schedule response. |
| 400 on invalid body | **Match** | `safeParse` failure → 400 with error message. |
| 429 on rate limit | **Missing** | Design: "429(한도 초과)". API does not return 429; limit checked client-side only. |
| 500 on server error | **Match** | catch → 500 with KO message. |
| Response Zod 검증 (design) | **Partial** | Schedule payload validated via `ScheduleSchema.parse` in lib; API does not Zod-validate response envelope. |

---

## 5. lib/ai/schedule-generator.ts

| Design item | Status | Notes |
|-------------|--------|--------|
| scheduleChat(messages) | **Match** | Exists; accepts `ScheduleChatMessage[]`. |
| Return type `question` \| `schedule` | **Match** | `ScheduleChatResponse` type. |
| ScheduleSchema (activities, totalHours, feasible, suggestions) | **Match** | Defined and used for parse. |

---

## 6. RealityCheckBadge Copy

| Design item | Status | Notes |
|-------------|--------|--------|
| feasible true → "번아웃 위험 없음" / "No burnout risk" | **Match** | COPY.safe.ko / .en. |
| feasible false → "번아웃 위험" / "Burnout risk" | **Match** | COPY.risk.ko / .en. |
| No schedule → 비표시 또는 "검증 대기" | **Match** | Variant `pending`, "검증 대기" / "Pending check". |

---

## 7. InputCard & ResultCard Copy

| Design item | Status | Notes |
|-------------|--------|--------|
| InputCard label/placeholder "친구에게 말하듯 입력 · 5단계 Q&A로 현실적인 일정을 만들어요." | **Changed** | Design: this as **placeholder**. Impl: same text as **caption** above input; placeholder is `t.schedule.inputPlaceholder` ("예: 앱 개발..."). |
| ResultCard: "스케줄 생성 완료!", "활동 시간 분석 · 현실성 체크 완료", "여유 시간 N시간", "캘린더에 등록하기" | **Match** | ResultCard and CTA use these (KO only; design says "기존 유지"). |

---

## 8. Error Handling

| Design item | Status | Notes |
|-------------|--------|--------|
| Network/5xx: inline message + "다시 시도" (or assistant-style message) | **Match** | Error block with message; "Try Again" button; network hint when applicable. |
| 400: short message ("입력이 올바르지 않습니다." 등) | **Partial** | API returns 400 with parsed error; client shows generic or server message. |
| 429: "요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요." | **Missing** | API never returns 429; client has no 429-specific copy. |
| JSON/Zod mismatch: same as above | **Match** | Client treats as error and shows message + retry. |

---

## 9. Accessibility

| Design item | Status | Notes |
|-------------|--------|--------|
| Touch targets ≥ 44×44pt (iOS) / 48×48dp (Android) | **Match** | Send button min-h-[44px]; CTA min-h-[44px]; retry min-h-[44px] min-w-[44px]; collapse button min-h-[44px] min-w-[44px]. |
| accessibilityLabel: send button | **Match** | `accessibilityLabel={loading ? t.schedule.generating : t.schedule.generate}`. |
| accessibilityLabel: "캘린더에 등록하기" | **Match** | `accessibilityLabel="캘린더에 등록하기"` on CTA. |
| accessibilityLabel: ResultCard | **Missing** | Design §7: ResultCard has accessibilityLabel. `ResultCard.tsx` has no accessibilityLabel. |
| accessibilityLabel: RealityCheckBadge | **Match** | `accessibilityLabel={text}` (badge copy). |
| Focus order: input → send → (if result) CTA | **Partial** | Order is correct; explicit focus management not verified. |

---

## 10. Match / Missing / Extra Summary

### Match (implemented as designed)

- Two-panel layout (wide/narrow) and collapsible left on narrow.
- Left panel: CORE FEATURE 01, title, subtitle, 4 bullets with icons and KO/EN.
- Right: Mendly header, ChatBubble thread, RealityCheckBadge (safe/risk/pending), InputCard, ResultCard, activity list, "캘린더에 등록하기" CTA.
- State: messages, schedule, loading, error, leftPanelCollapsed.
- POST /api/schedule/chat with Zod request body; response shape question | schedule; ScheduleResult shape; 400/500; client usage increment only on schedule.
- scheduleChat(messages) and ScheduleSchema in lib.
- RealityCheckBadge copy KO/EN for all three variants.
- ResultCard and CTA copy (KO).
- Error UI: inline message + retry; touch targets; accessibilityLabel on send, CTA, RealityCheckBadge, collapse.

### Missing (in design but not or wrong in code)

- **API 429**: Design requires 429 for rate limit; API does not return 429 (limit is client-only).
- **429 client copy**: "요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요." not used (no 429 path).
- **ResultCard accessibilityLabel**: Design §7; ResultCard component has none.
- **Left panel width**: Design 280–320px; implementation 260–320px (min 260).

### Changed (different from design)

- **RightHeader dot**: Design "보라 점"; implementation green (`bg-emerald-500`).
- **InputCard placeholder**: Design uses long copy as placeholder; implementation uses it as caption and different placeholder in input.

### Extra (in code but not in design)

- "일정 저장" and "다시 만들기" buttons (design only required "캘린더에 등록하기"; extra CTAs acceptable).
- MAX_TURNS check and error message before API call.
- Save-to-DB flow and addToCalendar flow (design references "기존 addToCalendar 플로우" — present).

---

## 11. Match Rate

| Area | Items counted | Match | Partial/Missing/Changed |
|------|----------------|-------|---------------------------|
| UI structure & layout | 11 | 9 | 2 (width range, dot color) |
| Left panel | 11 | 10 | 1 (EN bullet wording) |
| Data & state | 6 | 6 | 0 |
| API contract | 9 | 6 | 3 (429, response Zod at API) |
| schedule-generator | 3 | 3 | 0 |
| RealityCheckBadge copy | 3 | 3 | 0 |
| InputCard/ResultCard copy | 2 | 1 | 1 (placeholder vs caption) |
| Error handling | 4 | 2 | 2 (429, 429 copy) |
| Accessibility | 6 | 4 | 2 (ResultCard a11y, focus order) |

**Rough total design items**: ~55.  
**Fully met**: ~44. **Partial/Missing/Changed**: ~11.

**Match rate: ~80%** (conservative; many “partial” are minor).

If counting only critical path (layout, state, API shape, chat flow, main copy, main CTAs): **~90%**.

---

## 12. Recommended Actions

1. **429 and rate limit (design alignment)**  
   - Option A: In API, after auth/session, check usage and return 429 when over limit; client handle 429 and show "요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."  
   - Option B: Document that rate limit is client-only and 429 is deferred; keep current behavior.

2. **ResultCard accessibility**  
   - Add `accessibilityLabel` (and optionally `accessibilityRole`) to `ResultCard` (e.g. "스케줄 생성 완료, 총 N시간, Safe" or i18n equivalent).

3. **RightHeader dot**  
   - Change `bg-emerald-500` to a purple token (e.g. violet/primary) to match design "보라 점".

4. **Left panel width**  
   - Optionally set min width to 280 in `ScheduleLeftPanel` when not compact.

5. **InputCard placeholder**  
   - If design is strict: use "친구에게 말하듯 입력 · 5단계 Q&A로 현실적인 일정을 만들어요." as `placeholder` and keep or shorten caption; or document current split (caption + short placeholder) as accepted.

6. **Response Zod at API (optional)**  
   - If design requires explicit response Zod 검증 at API boundary, add a response schema and parse before `Response.json(result)`.

---

## 13. Next Steps

- If **match rate ≥ 90%** is required: fix ResultCard a11y, dot color, and (if agreed) 429 + client copy; re-run gap analysis.
- If **match rate ~80%** is acceptable: document the 429/rate-limit and placeholder decisions, then run **pdca report** for completion.
- Suggested: implement **ResultCard accessibilityLabel** and **보라 점** as quick wins; then decide on 429 vs client-only limit and write **schedule-conversational-ui.report.md**.

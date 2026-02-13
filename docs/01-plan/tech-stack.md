# Mendly - Tech Stack Validation

**Date**: 2025-02-13  
**Author**: [Your Name]  
**Project**: Mendly  
**Target**: 12-week MVP launch

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│ Mobile App (iOS/Android)                 │
│ React Native + Expo + TypeScript         │
│ NativeWind (Tailwind)                    │
└─────────────────┬───────────────────────┘
                  │ HTTPS / WebSocket
┌─────────────────▼───────────────────────┐
│ Supabase Backend                         │
│ ┌─────────┬──────────┬──────────────┐     │
│ │ Auth    │ Database │ Realtime    │     │
│ │ (JWT)   │ (Postgres) │ (WebSocket) │   │
│ └─────────┴──────────┴──────────────┘     │
│ ┌─────────┬──────────┬──────────────┐     │
│ │ Storage │ Edge     │ Cron Jobs    │     │
│ │ (S3)    │ Functions│ (scheduled)  │     │
│ └─────────┴──────────┴──────────────┘     │
└─────────────────┬───────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────┐
│ External APIs                             │
│ ┌──────────────┬──────────────────┐     │
│ │ OpenAI API   │ Stripe API        │     │
│ │ (GPT-4o-mini │ (Payments)        │     │
│ │  + Whisper)  │                   │     │
│ └──────────────┴──────────────────┘     │
└─────────────────────────────────────────┘
```

---

## Frontend Stack

### React Native + Expo

**Choice**: Expo SDK 52+ with React Native

**Reason**:

- ✅ Single codebase for iOS + Android
- ✅ Expo Router (file-based routing like Next.js)
- ✅ Fast iteration with hot reload
- ✅ EAS Build for production deployments
- ✅ Large ecosystem (npm packages)

**Alternatives Considered**:

- ❌ **Flutter**: Dart language learning curve, smaller ecosystem
- ❌ **Native (Swift/Kotlin)**: 2x development time, need separate teams
- ❌ **Ionic/Capacitor**: WebView performance issues on complex UI

**Validation**:

- Expo is production-ready (used by Microsoft, Amazon, etc.)
- EAS Build supports both app stores
- Community: 3M+ weekly npm downloads

### TypeScript

**Choice**: TypeScript strict mode

**Reason**:

- ✅ Catch bugs at compile time
- ✅ Better IDE autocomplete
- ✅ Easier refactoring
- ✅ Self-documenting code

**Alternatives Considered**:

- ❌ **JavaScript**: Too error-prone for 12-week solo dev
- ❌ **ReScript/ReasonML**: Too niche, small ecosystem

**Validation**:

- TypeScript is industry standard
- Strict mode enforces best practices

### NativeWind (Tailwind CSS for React Native)

**Choice**: NativeWind 4.0

**Reason**:

- ✅ Consistent design system via utility classes
- ✅ Fast prototyping (no separate StyleSheet files)
- ✅ Dark mode support built-in
- ✅ Same API as Tailwind CSS (familiar to web devs)

**Alternatives Considered**:

- ❌ **React Native StyleSheet**: Verbose, no design system
- ❌ **Styled Components**: Runtime overhead, harder to maintain
- ❌ **Tamagui**: Too opinionated, learning curve

**Validation**:

- NativeWind 4.0 stable (released 2024)
- Works with Expo SDK 52+

---

## Backend Stack

### Supabase

**Choice**: Supabase (PostgreSQL + Auth + Realtime + Storage)

**Reason**:

- ✅ PostgreSQL (best open-source RDBMS)
- ✅ Built-in auth (email, OAuth, magic links)
- ✅ Row Level Security (RLS) for data isolation
- ✅ Realtime subscriptions (WebSocket)
- ✅ Free tier: 500MB DB, 2GB bandwidth, 50K monthly active users
- ✅ Local development with Supabase CLI
- ✅ Auto-generated TypeScript types

**Alternatives Considered**:

- ❌ **Firebase**: NoSQL harder for relational data, vendor lock-in
- ❌ **AWS Amplify**: Complex setup, expensive for small scale
- ❌ **Custom Node.js + PostgreSQL**: 2-3 weeks just for auth + API setup

**Validation**:

- Used by 1M+ projects (Y Combinator backed)
- Generous free tier for MVP
- Easy migration path to paid plans

### PostgreSQL (via Supabase)

**Choice**: PostgreSQL 15+

**Reason**:

- ✅ ACID compliance (data integrity)
- ✅ JSONB for flexible data (schedules, completed_hours)
- ✅ Full-text search (for notes search)
- ✅ Array types (tags, suggestions)
- ✅ Mature ecosystem

**Alternatives Considered**:

- ❌ **MongoDB**: Harder to enforce data relationships
- ❌ **MySQL**: Weaker JSON support than PostgreSQL

---

## AI Stack

### OpenAI API

**Choice**: GPT-4o-mini (primary), Whisper (voice)

**Reason**:

- ✅ GPT-4o-mini: Best cost/performance for conversational AI ($0.15/1M input tokens)
- ✅ Whisper: Best speech-to-text accuracy (supports 100+ languages)
- ✅ JSON mode for structured outputs
- ✅ Reliable uptime (99.9% SLA)

**Alternatives Considered**:

- ❌ **GPT-4o**: 10x more expensive, overkill for our use case
- ❌ **Claude 3.5 Sonnet**: No JSON mode, harder to validate responses
- ❌ **Gemini 1.5**: Inconsistent quality for scheduling tasks
- ❌ **Open-source LLMs**: Need own infrastructure, higher latency

**Cost Estimation (per user per month)**:

- Schedule generation: 3 schedules × 1000 tokens = 3K tokens = $0.0005
- Note parsing: 10 notes × 500 tokens = 5K tokens = $0.0008
- Weekly review: 4 reviews × 800 tokens = 3.2K tokens = $0.0005
- **Total AI cost per user**: ~$0.002/month (negligible)
- **At 1000 users**: $2/month AI costs vs $1000+ MRR = 0.2% of revenue

**Validation**:

- OpenAI API stability: 99.9% uptime
- Rate limits: 10K requests/min (enough for 10K users)

### Zod (Schema Validation)

**Choice**: Zod for runtime validation

**Reason**:

- ✅ Validate AI responses before using (prevent crashes)
- ✅ TypeScript-first API
- ✅ Clear error messages
- ✅ Works client and server-side

**Validation**:

- Industry standard for TypeScript validation

---

## Payments Stack

### Stripe

**Choice**: Stripe for subscriptions

**Reason**:

- ✅ Best-in-class payment UX
- ✅ Native React Native SDK
- ✅ Handles subscription logic (billing, dunning, invoices)
- ✅ 99.99% uptime
- ✅ Test mode for development

**Alternatives Considered**:

- ❌ **RevenueCat**: Extra abstraction layer, not needed for simple plans
- ❌ **Paddle**: Higher fees (5% + 2.9% vs Stripe 2.9%)
- ❌ **In-app purchases (Apple/Google)**: 30% commission vs Stripe 2.9%

**Pricing**:

- 2.9% + $0.30 per transaction
- No monthly fees
- Example: $9.99 Pro tier → Stripe takes $0.59 → We get $9.40

**Validation**:

- Used by 90% of SaaS startups
- Supabase has official Stripe integration guide

---

## DevOps Stack

### Version Control & CI/CD

**Choice**: GitHub + GitHub Actions

**Reason**:

- ✅ Free for public/private repos
- ✅ GitHub Actions for CI/CD (free 2000 minutes/month)
- ✅ Integrated with Expo EAS

**Workflows**:

- On push to main:
  1. Run TypeScript type check
  2. Run ESLint
  3. Run tests (if any)
  4. Trigger EAS Build (staging)

### Deployment

**Choice**: Expo EAS (Expo Application Services)

**Reason**:

- ✅ Cloud build service (no Xcode/Android Studio needed)
- ✅ OTA (Over-The-Air) updates for bug fixes
- ✅ Automated app store submissions
- ✅ Free tier: 30 builds/month

**Alternatives Considered**:

- ❌ **Local builds**: Need Mac for iOS, slow
- ❌ **Fastlane**: Complex setup, maintenance burden

**Pricing**:

- Free tier: 30 builds/month (enough for MVP)
- Production plan: $29/month (unlimited builds)

### Monitoring & Analytics

**Choice**: Sentry (errors) + Mixpanel/PostHog (analytics)

**Reason**:

- ✅ Sentry: Best error tracking, free 5K errors/month
- ✅ Mixpanel: Free 100K events/month, good retention analytics
- ✅ PostHog: Open-source alternative, self-hostable

**Validation**:

- Sentry used by 4M+ developers
- Both have React Native SDKs

---

## Development Tools

### Code Editor

**Choice**: Cursor (VSCode fork with AI)

**Reason**:

- ✅ All VSCode extensions work
- ✅ AI-powered code generation (faster MVP)
- ✅ .cursorrules for consistency

### Package Manager

**Choice**: npm (default)

**Reason**:

- ✅ Comes with Node.js
- ✅ Works with Expo out of box

**Alternatives Considered**:

- Yarn/pnpm: Marginal speed gains, not worth migration

### Linting & Formatting

**Choice**: ESLint + Prettier

**Reason**:

- ✅ Industry standard
- ✅ Catches bugs before runtime
- ✅ Enforces code style

---

## Cost Analysis (Monthly)

### Free Tier (0–100 users)

- Supabase: $0 (free tier)
- OpenAI API: $0.20 (100 users × $0.002)
- Stripe: $0 (no revenue yet)
- Expo EAS: $0 (free 30 builds)
- Sentry: $0 (free 5K errors)
- **Total**: ~$0.20/month

### Growth Phase (1000 users, $5K MRR)

- Supabase Pro: $25/month (2GB DB, 50GB bandwidth)
- OpenAI API: $2/month (1000 users × $0.002)
- Stripe fees: $145/month (2.9% of $5K)
- Expo EAS: $29/month (unlimited builds)
- Sentry: $26/month (50K errors)
- Domain: $12/year
- **Total**: ~$227/month (4.5% of MRR)

### Scale Phase (10K users, $50K MRR)

- Supabase Pro: $99/month (8GB DB, 250GB bandwidth)
- OpenAI API: $20/month (10K users × $0.002)
- Stripe fees: $1,450/month (2.9% of $50K)
- Expo EAS: $29/month
- Sentry: $89/month (500K errors)
- **Total**: ~$1,687/month (3.4% of MRR)

**Validation**: Cost structure scales well (3–5% of revenue)

---

## Risk Assessment

### Technical Risks

1. **OpenAI API outage**
   - Mitigation: Cache recent schedules, show manual option
   - Probability: Low (99.9% uptime)

2. **Supabase free tier limits hit early**
   - Mitigation: Monitor usage, upgrade at 80% capacity
   - Probability: Medium (depends on user growth)

3. **React Native performance on low-end Android**
   - Mitigation: Test on budget devices, optimize re-renders
   - Probability: Medium

4. **App store rejection (Apple/Google)**
   - Mitigation: Follow guidelines, have backup web version
   - Probability: Low (if we follow rules)

### Vendor Lock-in Risks

- **Supabase**: Low risk (standard PostgreSQL, easy to migrate)
- **Expo**: Medium risk (can eject to bare React Native)
- **OpenAI**: Medium risk (can switch to Claude/Gemini, prompts portable)
- **Stripe**: Low risk (standard payment API, many alternatives)

---

## Technology Validation Checklist

### Must-Have Capabilities ✅

- [x] Cross-platform mobile (iOS + Android)
- [x] Real-time data sync (Supabase Realtime)
- [x] Offline support (React Query + AsyncStorage)
- [x] Push notifications (Expo Notifications)
- [x] User authentication (Supabase Auth)
- [x] File storage (Supabase Storage for avatars)
- [x] AI integration (OpenAI API)
- [x] Payment processing (Stripe)
- [x] Local development environment (Supabase CLI)
- [x] Type safety (TypeScript)
- [x] Error monitoring (Sentry)

### Nice-to-Have Capabilities (Post-MVP)

- [ ] Web version (Next.js + same Supabase backend)
- [ ] Desktop apps (Electron or Tauri)
- [ ] API for third-party integrations
- [ ] White-label solution for enterprises

---

## Alternative Stacks Considered (and Why Not)

### Stack B: Next.js + Firebase + OpenAI

**Rejected because**:

- Firebase NoSQL harder for relational data (goals → events → notes)
- No native mobile performance (PWA not good enough)
- Firestore expensive at scale (read/write pricing)

### Stack C: Flutter + Supabase + OpenAI

**Rejected because**:

- Dart language learning curve (3–4 weeks)
- Smaller ecosystem than React Native
- Harder to find Flutter developers if scaling team

### Stack D: Full Native (Swift + Kotlin) + Custom Backend

**Rejected because**:

- 2x development time (two codebases)
- Backend setup 3–4 weeks (auth, API, DB, hosting)
- Not feasible for 12-week solo MVP

---

## Final Stack Summary

| Layer | Technology | Why |
|-------|------------|-----|
| **Mobile** | React Native + Expo | Cross-platform, fast iteration |
| **Language** | TypeScript | Type safety, fewer bugs |
| **Styling** | NativeWind | Tailwind for React Native |
| **Backend** | Supabase | PostgreSQL + Auth + Realtime |
| **Database** | PostgreSQL | Best for relational data |
| **AI** | OpenAI (GPT-4o-mini, Whisper) | Best cost/performance |
| **Validation** | Zod | Runtime type safety |
| **Payments** | Stripe | Industry standard |
| **Build/Deploy** | Expo EAS | Cloud builds, OTA updates |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Mixpanel/PostHog | User behavior insights |
| **Version Control** | GitHub + Actions | CI/CD automation |

---

## Proof of Concepts Completed

Document any POCs done during Phase 0–1:

- [x] Expo + TypeScript + NativeWind setup (Phase 0.6) ✅
- [x] Supabase local DB + RLS policies (Phase 1.3) ✅
- [ ] OpenAI GPT-4o-mini schedule generation (TODO: Phase 3.2)
- [ ] Stripe test payment flow (TODO: Phase 7.4)

---

## Next Steps

1. ✅ Phase 0: Foundation complete
2. ✅ Phase 1.1: MVP features prioritized
3. ✅ Phase 1.2: Feature plans created
4. ✅ Phase 1.3: Data model + SQL migration
5. ✅ Phase 1.4: Tech stack validated ← **YOU ARE HERE**
6. ⏭️ **Phase 2**: Design System (design tokens, UI components)
7. ⏭️ **Phase 3**: Backend & AI Engine (Supabase setup, AI wrappers)
8. ⏭️ **Phase 4**: Core Features (PDCA cycle for 5 MVP features)

---

**Deliverables**: Technology choices with rationale, cost analysis, risk assessment, validation that stack supports all MVP requirements. Update this doc when making tech stack changes and explain why.

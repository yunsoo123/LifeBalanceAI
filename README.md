# Mendly

Mendly is a compassionate AI life manager for people who juggle multiple goals with limited planning time. Mend your schedule. Reclaim your day.

Built with React Native (Expo), TypeScript, Supabase, and OpenAI.

---

## Monetization / Ads

- **Network**: Google AdMob (banner ads).
- **Placement**: Single banner fixed **above the tab bar** on all tabs (consistent position; content uses bottom padding so it does not overlap the banner).
- **Policy**: **Pro subscribers see no ads**; only free-tier users see the banner. Implementation uses the existing subscription check (e.g. `useSubscription`) to hide the ad component for Pro users.
- **Setup**: Configure AdMob app IDs (and optional unit IDs) via environment or app config as required by your Expo/AdMob integration. See design doc `docs/02-design/features/ad-monetization.design.md` for implementation details once available.
- **Expo Go**: Banner ads use a native module and do not run in Expo Go; use a development build (e.g. EAS Build) to see the banner.

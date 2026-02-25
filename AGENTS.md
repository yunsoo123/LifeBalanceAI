# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
LifeBalance AI is a React Native + Expo (SDK 54) mobile app with Supabase backend and OpenAI integration. Currently in early development — only the default Expo boilerplate exists in `App.tsx`. See `.cursorrules` for full project conventions.

### Running the app
- **Web mode**: `npm run web` or `npx expo start --web` (runs on port 8081 by default)
- **iOS/Android**: `npm run ios` / `npm run android` (requires simulator/emulator)
- Web dependencies (`react-dom`, `react-native-web`, `@expo/metro-runtime`) are already installed.

### Quality checks
- **TypeScript**: `npx tsc --noEmit` — must pass with zero errors.
- **Lint**: `npm run lint` — runs ESLint on `.ts`/`.tsx` files.
- **Known issue**: `types/database.types.ts` is UTF-16 LE encoded, which causes ESLint to report it as binary. All other files lint cleanly.

### Key gotchas
- `babel.config.js` uses `nativewind/babel` as a Babel **preset** (not plugin). NativeWind v4 returns `{ plugins: [...] }`, which is a preset format. It must be listed in the `presets` array.
- `.env` must be created from `.env.example` before running the app. Expo auto-loads it.
- `@stripe/stripe-react-native` version in `package.json` (0.58.0) is newer than the Expo-recommended version (0.50.3); this warning is non-blocking.

### External services (not needed for basic dev)
- **Supabase**: Local dev via `npx supabase start` (requires Docker). Config in `supabase/config.toml`.
- **OpenAI / Stripe**: Cloud APIs requiring env vars. Not needed for UI development.

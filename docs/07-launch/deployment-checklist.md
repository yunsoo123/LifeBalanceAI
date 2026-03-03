# Mendly 배포 체크리스트

배포 전에 확인할 항목. Pipeline Phase 9(Deployment) 기준.

---

## 1. 빌드·환경

- [ ] `npx tsc --noEmit` 0 errors
- [ ] `npm run lint` 통과
- [ ] `npm test` 통과
- [ ] `.env.local`에 프로덕션용 Supabase URL/키 설정 (또는 EAS Secrets 사용)
- [ ] **API 호스트**: 네이티브 앱(IPA/AAB)은 단독 실행이므로, Schedule/Inbox/Notes/Review용 AI API를 **별도 서버에 배포**하고 `EXPO_PUBLIC_API_URL`을 그 주소로 설정해야 함. (웹만 배포 시 같은 오리진이면 생략 가능)

---

## 2. EAS 설정

- [ ] [expo.dev](https://expo.dev) 로그인 후 `eas init` 실행해 프로젝트 연결
- [ ] `app.json` → `extra.eas.projectId`에 생성된 프로젝트 ID 입력
- [ ] EAS Secrets에 설정 (선택): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `EXPO_PUBLIC_API_URL`(프로덕션 API 주소)

---

## 3. 앱 식별자

- [ ] `app.json` → `ios.bundleIdentifier` (예: `com.mendly.app`)
- [ ] `app.json` → `android.package` (예: `com.mendly.app`)
- [ ] 스토어에 등록할 앱 이름·설명·스크린샷·개인정보처리방침 URL 준비

---

## 4. 인앱 결제 (Pro)

- [ ] App Store Connect: 구독 상품 ID `mendly_pro_monthly` 생성
- [ ] Google Play Console: 구독 상품 ID `mendly_pro_monthly` 생성
- [ ] 실기기에서 구매·복원 테스트 (EAS development/preview 빌드로 확인)

---

## 5. 빌드·제출 명령

```bash
# 개발용 빌드 (내부 테스트)
eas build --profile development --platform ios
eas build --profile development --platform android

# 스토어 제출용 빌드
eas build --profile production --platform all

# 제출 (eas.json의 submit.production에 appleId, ascAppId 등 설정 후)
eas submit --platform ios
eas submit --platform android
```

---

## 6. 웹 배포 (선택)

```bash
npx expo export --platform web
# 출력된 dist/ 또는 web-build/ 를 Vercel, Netlify 등에 배포
```

---

## 참고

- **SETUP.md** §10 배포
- **docs/01-plan/payments-korea.md** 인앱 결제 정책
- **docs/legal/** 개인정보처리방침·이용약관

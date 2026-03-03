# SNS 소셜 회원가입 (Google + Apple) - Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)

---

## Overview

이메일/비밀번호 외에 **Google**과 **Apple**로 회원가입·로그인이 가능하도록 하는 기능이다.  
기존 sign-in / sign-up 화면에 소셜 버튼을 추가하고, Supabase Auth OAuth + Expo 딥링크로 세션을 완료한다.

---

## Scope (v1)

| 제공자 | 포함 여부 | 비고 |
|--------|-----------|------|
| **Google** | ✅ 포함 | Supabase Google provider + OAuth |
| **Apple** | ✅ 포함 | Supabase Apple provider (iOS 앱 제출 시 Apple 로그인 제공 권장/필수 대응) |
| 카카오/네이버 등 | ❌ v1 제외 | 추후 Design에서 확장 가능 |

---

## Success Criteria

- [ ] 로그인 화면에서 "Google로 계속하기" 버튼 탭 시 Google OAuth 진행 후 앱으로 복귀하여 로그인 완료
- [ ] 로그인 화면에서 "Apple로 계속하기" 버튼 탭 시 Apple OAuth 진행 후 앱으로 복귀하여 로그인 완료
- [ ] 회원가입 화면에서도 동일 소셜 버튼으로 가입(첫 로그인 시 자동 계정 생성) 가능
- [ ] 소셜 로그인 실패 시 사용자에게 이해 가능한 에러 메시지 표시
- [ ] 기존 이메일/비밀번호 로그인·회원가입은 그대로 동작

---

## Dependencies

- **Supabase**: Google / Apple provider 설정 완료 (아래 설정법 참고)
- **Expo**: `expo-auth-session`, `expo-web-browser`, `expo-linking` (이미 있을 수 있음)
- **앱 scheme**: `app.json`에 `scheme: "mendly"` 이미 있음 → Redirect URL은 `mendly://**` 형태로 등록

---

## Supabase 설정법

### 1. Redirect URL 등록

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택  
2. **Authentication** → **URL Configuration**  
3. **Redirect URLs**에 다음을 추가:
   - 개발/Expo: `mendly://**` (앱 scheme이 `mendly`이므로)
   - 로컬 웹 테스트 시: `http://localhost:8081/**` 등 필요 시 추가

### 2. Google Provider 설정

1. [Google Cloud Console](https://console.cloud.google.com/) → 프로젝트 선택 또는 생성  
2. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**  
3. Application type: **Web application** (Supabase가 OAuth 서버 역할을 하므로)  
   - **Authorized redirect URIs**에 Supabase 콜백 URL 추가:  
     `https://<PROJECT_REF>.supabase.co/auth/v1/callback`  
     (Dashboard → Settings → API → Project URL 참고)  
4. Client ID / Client Secret 복사  
5. Supabase Dashboard → **Authentication** → **Providers** → **Google**  
   - Enable ON  
   - Client ID, Client Secret 붙여넣기 후 Save  

**Google Scopes**:  
- `.../auth/userinfo.profile`, `.../auth/userinfo.email`, `openid` 는 기본으로 두면 됨 (Supabase 요구사항)

### 3. Apple Provider 설정

1. [Apple Developer](https://developer.apple.com/) → Certificates, Identifiers & Profiles  
2. **Identifiers** → App ID에 **Sign In with Apple** capability 활성화  
3. **Keys** → 새 Key 생성, **Sign In with Apple** 체크 → Key ID, Team ID, Client ID(Service ID), `.p8` 파일 다운로드  
4. **Services IDs**에서 Redirect URL 등록 (Supabase 콜백):  
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`  
5. Supabase Dashboard → **Authentication** → **Providers** → **Apple**  
   - Enable ON  
   - Services ID (= Client ID), Secret 생성(Apple 문서 참고), Key ID, Team ID, Bundle ID, .p8 private key 내용 입력 후 Save  

**참고**: Apple은 비밀키(.p8) **6개월마다 로테이션** 권장 사항이 있음. 운영 시 캘린더에 메모해 두는 것이 좋음.

### 4. (선택) 로컬 개발 시 Supabase 로컬 사용

로컬 Supabase를 쓰는 경우 `supabase/config.toml`에서 Google/Apple 설정하고, Redirect URL은 로컬 Supabase 콜백(`http://127.0.0.1:54321/auth/v1/callback`)으로 맞추면 됨.  
현재 프로젝트는 호스트된 Supabase를 쓰는 것으로 가정.

---

## 구현 시 유의사항

- **딥링크**: Expo에서는 `makeRedirectUri()` 사용 시 scheme이 `mendly`인 앱으로 돌아오도록 설정. Supabase `signInWithOAuth`의 `redirectTo`에 이 URL 전달.
- **세션 복원**: OAuth 후 브라우저가 `mendly://...#access_token=...` 형태로 열면, 앱에서 URL을 파싱해 `supabase.auth.setSession({ access_token, refresh_token })` 호출.
- **Apple 이름**: Apple은 첫 로그인 시에만 이름을 주고, 이후에는 주지 않음. 필요 시 첫 로그인 시 `user.user_metadata`에서 이름을 읽어 `updateUser`로 저장하는 로직을 Design에서 정의할 수 있음.

---

## Next Steps

1. **Design** 작성: `docs/02-design/features/sns-social-signup.design.md`  
   - API: `signInWithOAuth`, `setSession`, `makeRedirectUri` 사용 방식  
   - UI: sign-in / sign-up 카드 내 소셜 버튼 위치·스타일·접근성  
   - 에러 처리·로딩 상태·딥링크 핸들링  
   - (선택) 프로필 보강(이름 등)  
2. Design 승인 후 **Do**: 설계대로 구현  
3. **Check**: gap 분석, **Act**: 수정 후 **Report**

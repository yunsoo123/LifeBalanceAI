# Mendly 설정 가이드

이 가이드는 **비숙련 개발자**도 쉽게 따라할 수 있도록 작성되었습니다.

---

## 1. 필수 도구 설치

### macOS
```bash
# Homebrew 설치 (이미 있으면 생략)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 20 설치
brew install node@20

# Watchman (React Native 권장)
brew install watchman
```

### Windows
1. [Node.js 20 LTS](https://nodejs.org/) 다운로드 후 설치
2. PowerShell에서 확인: `node -v` (v20.x.x 출력되면 OK)

---

## 2. 프로젝트 설정

### 코드 받기
```bash
cd Desktop
git clone https://github.com/[your-username]/SortIt.git
cd SortIt/LifeBalanceAI
```

### 의존성 설치
```bash
npm install
```

---

## 3. Supabase 설정 (API 연결)

Supabase는 별도 백엔드 서버를 둘 필요 없이, **프로젝트 생성 → 테이블 생성 → URL/키를 .env에 넣기**까지 하면 앱에서 인증·DB API가 바로 연결됩니다.

### 3.1 프로젝트 생성
1. [supabase.com](https://supabase.com) 회원가입
2. **New Project** 클릭
3. 프로젝트 이름: `mendly-prod`
4. Database Password 설정 후 **안전한 곳에 저장**
5. Region: **Northeast Asia (Seoul)** 선택
6. **Create new project** 클릭

### 3.2 테이블 생성
1. Supabase 대시보드 → **SQL Editor**
2. `supabase/migrations/20250213000000_initial_schema.sql` 파일 내용을 복사해 붙여넣기
3. **Run** 클릭

### 3.3 API 연결용 키 복사
1. Supabase 대시보드 → **Settings** → **API**
2. **Project URL** 복사 (예: `https://xxxx.supabase.co`) → 앱이 Supabase API 서버 주소로 사용
3. **anon public** 키 복사 → 앱(클라이언트)에서 인증·DB 접근에 사용
4. **service_role** 키 복사 (⚠️ 절대 외부/클라이언트에 노출 금지) → 서버 사이드나 API 라우트에서만 사용

위 URL과 anon 키를 `.env.local`에 넣으면(아래 5.2) 앱의 Supabase **API 연결이 완료**됩니다. 별도로 "API 활성화" 버튼을 누를 필요는 없고, 프로젝트 생성 시 REST API·Auth가 기본 활성화되어 있습니다.

---

## 4. OpenAI API 키

1. [platform.openai.com](https://platform.openai.com) 회원가입
2. 결제 수단 등록 (소량 사용 시 매우 저렴)
3. **API Keys** → **Create new secret key** → 이름 `mendly` → 키 복사 후 안전한 곳에 저장

---

## 5. 환경 변수

### 5.1 `.env.local` 생성
프로젝트 루트(`LifeBalanceAI/`)에 `.env.local` 파일 생성:

**Windows (PowerShell)**:
```powershell
cd C:\Users\[사용자명]\Desktop\SortIt\LifeBalanceAI
notepad .env.local
```

**macOS/Linux**:
```bash
cd ~/Desktop/SortIt/LifeBalanceAI
touch .env.local
nano .env.local
```

### 5.2 내용 입력
아래를 복사한 뒤 **본인 값**으로 수정해 저장:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://여기에_Project_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_키
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_키

# OpenAI
OPENAI_API_KEY=sk-proj-여기에_OpenAI_키

# 환경
EXPO_PUBLIC_APP_ENV=development
```

**결제**: 한국 사용 시 Stripe 미사용. Pro 업그레이드는 앱스토어·플레이스토어 인앱 결제로 연동되어 있습니다 (아래 5.3 참고).

⚠️ `.env.local`은 **절대 Git에 커밋하지 마세요.** (이미 `.gitignore`에 포함됨)

### 5.3 인앱 결제 (Pro 구독) — 앱 전용 출시 시

Pro 구독은 **Apple App Store / Google Play 인앱 결제**로만 제공됩니다.

- **상품 ID**: `mendly_pro_monthly` (코드: `lib/iap.ts`의 `PRO_SUBSCRIPTION_SKU`)
- **스토어 설정**  
  - **App Store Connect**: 앱 → 구독 → 새 구독 그룹/상품 생성, Product ID를 `mendly_pro_monthly`로 설정  
  - **Google Play Console**: 앱 → 수익 창출 → 구독 → 구독 생성, 상품 ID `mendly_pro_monthly`  
- **주의**: 인앱 결제는 **Expo Go에서 동작하지 않습니다**. 개발/테스트 시 **EAS Build** 등으로 개발 빌드를 만들어 실기기에서 테스트하세요.

자세한 정책: `docs/01-plan/payments-korea.md`

---

## 6. 앱 실행

### 웹 (가장 간단)
```bash
npx expo start --web
```
브라우저에서 `http://localhost:8081` 자동 오픈됩니다.

### 실제 기기 (iPhone / Android)
1. 스마트폰에 **Expo Go** 앱 설치 (App Store / Play Store)
2. **PC와 폰을 같은 Wi‑Fi**에 연결
3. 터미널에서 **LifeBalanceAI 폴더**로 이동 후 실행:
   ```bash
   cd LifeBalanceAI
   npx expo start
   ```
4. 터미널에 나온 **QR 코드**를 iPhone이면 카메라로, Android면 Expo Go 앱 내 스캔으로 읽기  
   - 연결 오류가 나면 아래 "Q: iPhone에서 Expo Go 연결이 안 돼요" 참고

### iOS 시뮬레이터 (macOS만)
Xcode 설치 후:
```bash
npx expo run:ios
```

### Android 에뮬레이터 (Windows / Mac — 폰 화면처럼 테스트)
**Windows에서는 iOS 시뮬레이터를 쓸 수 없고**, Android 에뮬레이터나 실기기(Expo Go)로 “폰에서 보는 것처럼” 테스트할 수 있습니다.

1. **Android Studio 설치**  
   - [developer.android.com/studio](https://developer.android.com/studio) 에서 다운로드 후 설치  
   - 설치 시 **Android SDK**, **Android Virtual Device** 옵션 포함되게 선택

2. **가상 기기(AVD) 만들기**  
   - Android Studio 실행 → **More Actions** → **Virtual Device Manager**  
   - **Create Device** → 기기 선택 (예: Pixel 5 또는 Pixel 6) → **Next**  
   - 시스템 이미지 선택 (예: **Tiramisu** API 33) → **Download** 후 선택 → **Next** → **Finish**

3. **에뮬레이터에서 앱 실행**  
   - AVD를 **재생 버튼**으로 한 번 실행해 에뮬레이터 창을 띄워 둔 뒤  
   - 프로젝트 폴더에서:
   ```bash
   cd LifeBalanceAI
   npx expo start
   ```
   - 터미널에서 **`a`** 키 입력 → Android 에뮬레이터에 앱이 설치·실행됨 (폰 틀 안에서 동작)

또는 한 번에:
```bash
npx expo run:android
```
(에뮬레이터가 없으면 자동으로 AVD 선택/생성 안내가 나올 수 있음)

### Windows에서 “폰처럼” 보는 방법 요약
| 방법 | 설명 |
|------|------|
| **Android 에뮬레이터** | 위처럼 Android Studio + AVD 설치 후 `npx expo start` → `a` 또는 `npx expo run:android`. **PC 화면에 폰 틀(에뮬레이터)이 뜨고**, 그 안에서 앱이 실행됨. |
| **실제 Android 폰 + Expo Go** | 폰에 **Expo Go** 설치 → PC와 같은 Wi‑Fi → `npx expo start` 후 QR 코드 스캔. **진짜 폰 화면**에서 테스트. |

※ **expo web**은 브라우저 창이라 폰 레이아웃/사이즈 느낌이 다릅니다. 폰과 비슷하게 보려면 에뮬레이터나 Expo Go를 쓰는 것이 좋습니다.

---

## 7. 테스트 계정 및 샘플 데이터

1. 앱 실행 → **Sign Up** → 이메일/비밀번호 입력
2. 이메일 인증 링크 확인 (Supabase에서 발송)
3. **Inbox** 탭에 텍스트 입력 → Parse → Save
4. **Schedule** 탭에서 **Generate Schedule** 클릭
5. **Calendar** 탭에서 **Import AI** 클릭
6. **Notes** 탭에서 새 노트 생성
7. **Review** 탭에서 **Generate AI Insights** 클릭

---

## 8. 문제 해결

### Q1: `npx expo start` 에러
```bash
npx expo start --clear
# 그래도 안 되면
rm -rf node_modules
npm install
```

### Q1-2: "Cannot pipe to a closed or destroyed stream" (Web 번들 시)
- **원인**: Expo dev server가 Web 번들을 보내는 중에 브라우저 탭이 새로고침·닫히거나 HMR로 요청이 취소되면 나는 오류입니다. **앱 코드 문제가 아니라** dev server 쪽 동작입니다.
- **대응**:
  1. **무시해도 됨**: 번들링이 끝난 뒤에는 앱이 정상 동치하는 경우가 많습니다.
  2. **캐시 초기화 후 재시작**: `npx expo start --clear` 후 브라우저를 한 번 닫고 다시 열어서 접속.
  3. **Web 대신 기기에서 실행**: `npx expo start` 후 QR로 **Expo Go(iOS/Android)** 만 쓰면 이 오류는 보통 나오지 않습니다.
  4. **번들 끝날 때까지 대기**: "Web Bundled ... (1 module)" 이 나온 뒤에만 브라우저에서 새로고침하면 오류가 줄어듭니다.

### Q1-3: "expo-av has been deprecated" 경고
- **의미**: SDK 54부터 `expo-av`가 제거 예정이라, 이후에는 `expo-audio` / `expo-video`로 옮기라는 안내입니다.
- **지금**: 당장 동작에는 문제 없습니다. Inbox 음성 입력에만 사용 중이므로, SDK 54 업그레이드 전에 `expo-audio`로 마이그레이션하면 됩니다.

### Q2: Supabase 연결 실패
- `.env.local` 존재 여부 확인
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` 값 확인
- Supabase 대시보드에서 프로젝트가 **Active** 인지 확인

### Q2-2: 로그인이 안 돼요
- **화면에 나오는 에러 문구** 확인 (이메일/비밀번호 오류, 이메일 미인증, 네트워크 등).
- **이메일 인증**: Supabase 대시보드 → **Authentication** → **Providers** → Email → **Confirm email**가 켜져 있으면, 가입 후 받은 메일의 **인증 링크**를 눌러야 로그인 가능. 테스트 시에는 Confirm email를 끄거나, 반드시 인증 후 로그인.
- **계정 없음**: 로그인이 아니라 **Create account**로 먼저 가입한 뒤, (인증이 필요하면) 메일 인증 후 로그인.
- **Supabase 설정**: `.env.local`의 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`가 대시보드 **Settings → API** 값과 동일한지 확인. 수정 후 앱 재시작.

### Q3: OpenAI API 에러
- `OPENAI_API_KEY`가 `.env.local`에 있는지 확인
- OpenAI 계정에 결제 수단 등록 여부 확인

### Q4-2: Windows에서 `npx expo run:android` 빌드 실패 (Could not reserve enough space for object heap)
에러 메시지에 **"Could not reserve enough space for 2097152KB object heap"** 가 나오면, PC에서 **32비트 Java**를 쓰고 있거나 메모리 부족 때문입니다.

**해결 방법:**

1. **64비트 JDK 사용하기 (권장)**  
   Android Studio를 설치했다면 **Android Studio에 포함된 64비트 JDK**를 쓰도록 합니다.

   - **JAVA_HOME 설정 (Windows)**  
     - **시스템 환경 변수** 열기: `Win + R` → `sysdm.cpl` 입력 → **고급** 탭 → **환경 변수**  
     - **시스템 변수**에서 **새로 만들기** (또는 기존 `JAVA_HOME` 수정)  
       - 변수 이름: `JAVA_HOME`  
       - 변수 값: Android Studio JDK 경로 (아래 중 하나, 설치 경로에 맞게 선택)  
         - `C:\Program Files\Android\Android Studio\jbr`  
         - 또는 `C:\Program Files\Android\Android Studio\jre`  
     - **확인** 후 **새 터미널**을 열고 다시 실행:
       ```bash
       cd LifeBalanceAI
       npx expo run:android
       ```

2. **Gradle 힙 줄이기**  
   프로젝트의 `android/gradle.properties`에서 `org.gradle.jvmargs=-Xmx2048m` 이 이미 **1536m**으로 낮춰져 있습니다. 64비트 JDK로 바꾼 뒤에도 메모리 부족이 나오면 이 값을 **1024m**으로 더 낮혀 보세요.

3. **기존 Gradle 데몬 종료 후 재시도**  
   터미널에서:
   ```bash
   cd LifeBalanceAI\android
   .\gradlew.bat --stop
   cd ..
   npx expo run:android
   ```

### Q4: iPhone에서 Expo Go 연결이 안 돼요 (Unable to connect / 타임아웃)
- **같은 Wi‑Fi 확인**: PC와 iPhone이 같은 공유기에 연결돼 있는지 확인.
- **방화벽**: Windows 방화벽이 Node/Metro 포트(8081 등)를 막고 있을 수 있음.  
  "Node.js JavaScript Runtime" 또는 "개인/공용 네트워크 허용" 체크 후 다시 시도.
- **터널 모드로 실행** (같은 Wi‑Fi인데도 안 될 때):
  ```bash
  cd LifeBalanceAI
  npx expo start --tunnel
  ```
  처음 실행 시 `@expo/ngrok` 설치 여부 물으면 `y` 입력. QR 코드가 다시 나오면 Expo Go에서 스캔.
- **캐시 초기화**: `npx expo start --clear` 후 다시 시도.

※ 이 프로젝트는 **인앱 결제(react-native-iap)** 를 쓰므로 Expo Go에서는 구독/결제만 동작하지 않고, 나머지 기능은 터널로 접속해 테스트 가능합니다.

### Q5: 실기기에서 API 호출 안 됨
PC와 같은 Wi‑Fi에서 실행한 뒤, `.env.local`에 다음 추가 (PC IP는 터미널에 나오는 `exp://` 주소에서 확인):
```bash
EXPO_PUBLIC_API_URL=http://PC의IP:8081
```
앱 완전 종료 후 다시 실행.

### Q6: TypeScript / Lint 확인
```bash
npx tsc --noEmit
npx expo lint
```

### Q7: 테스트 실행
```bash
npm test
```

### 로컬 도구 (선택) — n8n

**n8n**은 워크플로우 자동화 도구입니다. PDCA나 외부 연동(웹훅, 스케줄 등)을 할 때 로컬에서 켜두라고 안내한 적이 있으며, **앱 빌드·배포에는 필수가 아닙니다.** 쓰지 않으면 끄셔도 되고, 필요할 때만 아래처럼 실행하면 됩니다.

- **접속**: Docker 실행 후 브라우저에서 http://localhost:5678
- **데이터**: Windows 기준 `C:\n8n_data`에 저장됨 (컨테이너 재생성해도 유지)

**현재 기록된 설정** (Docker inspect 기준):

| 항목 | 값 |
|------|-----|
| 이미지 | `n8nio/n8n:latest` |
| 컨테이너 이름 | `n8n` |
| 포트 | 5678 |
| 볼륨 | `C:\n8n_data` → `/home/node/.n8n` |
| 재시작 정책 | 없음 (재부팅 시 수동으로 Start 필요) |

**처음 한 번 만들 때 (Windows):**
```powershell
docker run -d --name n8n -p 5678:5678 -v C:\n8n_data:/home/node/.n8n -e N8N_EXECUTE_COMMAND_ENABLED=true n8nio/n8n:latest
```

**이미 컨테이너가 있을 때:**  
Docker Desktop → **Containers** → `n8n` → **Start** 버튼.

**재부팅 후에도 자동으로 켜지게 하려면:**  
기존 컨테이너를 지우고, 위 `docker run`에 `--restart unless-stopped`를 붙여 다시 만들면 됩니다.

---

## 9. 체크리스트

설정이 끝났는지 확인:

- [ ] Node.js 20 설치됨
- [ ] `npm install` 실행됨
- [ ] Supabase 프로젝트 생성됨
- [ ] Supabase 마이그레이션(SQL) 실행됨
- [ ] OpenAI API 키 발급됨
- [ ] `.env.local` 생성 및 값 입력됨
- [ ] `npx expo start --web` 실행됨
- [ ] 회원가입 및 샘플 데이터 생성됨

---

## 10. 배포 (스토어·웹)

앱을 **실기기 빌드**로 만들거나 **스토어에 제출**하려면 아래 순서를 따르세요.

### 10.1 EAS CLI 설치·로그인

```bash
npm install -g eas-cli
eas login
```

### 10.2 EAS 프로젝트 연결

```bash
cd LifeBalanceAI
eas init
```

나온 **Project ID**를 `app.json` → `expo.extra.eas.projectId`에 넣습니다.

### 10.3 빌드 프로필 (eas.json)

- **development**: 개발용, 내부 테스트 (시뮬레이터/APK)
- **preview**: 내부 배포용 (IPA/APK)
- **production**: 스토어 제출용 (iOS App Store / Google Play)

### 10.4 네이티브 앱에서 API 쓰려면

Schedule·Inbox·Notes·Review의 AI 기능은 **서버 API**가 필요합니다.  
개발 시에는 `npx expo start`로 띄운 Metro가 API 역할을 하지만, **실기기 단독 앱(EAS 빌드)** 에서는 API를 **별도 호스팅**해야 합니다.

1. **옵션 A**: Expo/Node 서버를 Vercel·Railway 등에 배포하고, `EXPO_PUBLIC_API_URL`을 그 URL로 설정한 뒤 EAS 빌드.
2. **옵션 B**: 웹만 배포(`npx expo export --platform web` 후 정적 호스팅)하면 같은 오리진에서 API가 동작합니다.

EAS 빌드 시 환경 변수는 **EAS Secrets**에 등록하거나, `eas.json`의 해당 프로필 `env`에 넣을 수 있습니다.

### 10.5 스토어 제출 전 체크

- [ ] **docs/07-launch/deployment-checklist.md** 전체 항목 확인
- [ ] iOS: App Store Connect 앱·스크린샷·개인정보처리방침 URL 등록
- [ ] Android: Google Play Console 앱·스크린샷·개인정보처리방침 URL 등록
- [ ] 인앱 결제 사용 시: App Store Connect / Play Console에 구독 상품 `mendly_pro_monthly` 생성

### 10.6 빌드·제출 명령 예시

```bash
# 프로덕션 빌드 (iOS + Android)
eas build --profile production --platform all

# 스토어 제출 (eas.json의 submit.production 설정 후)
eas submit --platform ios
eas submit --platform android
```

자세한 항목: **docs/07-launch/deployment-checklist.md**

---

**모두 완료했다면 Mendly를 사용할 준비가 된 것입니다.**

추가 문의: 프로젝트 루트의 `README.md` 및 `docs/` 폴더를 참고하세요.

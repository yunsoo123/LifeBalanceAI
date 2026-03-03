# 테스트 → 배포: 지금 할 일 순서

**목표**: 디자인 보면서 테스트 통과시키고, 순서대로 배포까지 진행

---

## 1. 지금 할 일 순서 (테스트 → 배포)

| 순서 | 할 일 | 예상 시간 | 비고 |
|------|--------|-----------|------|
| **1** | **앱 켜서 디자인 확인** | 5분 | 테스트 통과 여부와 무관하게 웹/Expo Go로 UI 확인 가능 |
| **2** | **테스트 오류 해결** | 10~30분 | 아래 "테스트 오류 나올 때" 참고 |
| **3** | **법적 문서 보완** | 5분 | 개인정보처리방침·이용약관에 고객 이메일 추가 |
| **4** | **EAS 빌드 1회 성공** | 30분~1시간 | iOS 또는 Android 설치 파일 만들기 |
| **5** | **스토어 등록비 결제** | 5분 | Apple 연 $99 또는 Google 일회 $25 |
| **6** | **스토어 제출** | 1~2시간 | 스크린샷·설명·개인정보처리방침 URL 등 입력 |
| **7** | **인앱 결제 상품 등록** | 30분 | `mendly_pro_monthly` 등록 후 실기기 테스트 |
| **8** | **(선택) 배포 직전 테스트 목록** | 1~2시간 | `docs/01-plan/test-list-deferred.md` 채우기 |

---

## 2. 디자인 먼저 보고 싶을 때 (테스트 오류와 분리)

**테스트가 실패해도 앱 화면(디자인)은 볼 수 있습니다.**

- **웹으로 보기**  
  ```bash
  cd LifeBalanceAI
  npx expo start --web
  ```  
  브라우저에서 `http://localhost:8081` 열면 UI 확인 가능.

- **실기기(Expo Go)**  
  ```bash
  cd LifeBalanceAI
  npx expo start
  ```  
  QR 스캔 후 폰에서 확인.

단위 테스트(`npm test`)는 **코드/로직 검증**용이고, **화면 렌더링과는 별개**라서, 디자인만 보려면 위처럼 앱만 켜면 됩니다.

---

## 3. 테스트 오류 나올 때

1. **실행 위치**  
   반드시 **LifeBalanceAI 폴더**에서 실행.
   ```bash
   cd C:\Users\yyssp\Desktop\SortIt\LifeBalanceAI
   npm test
   ```

2. **캐시 초기화 후 재실행**
   ```bash
   cd LifeBalanceAI
   npx jest --clearCache
   npm test
   ```

3. **특정 파일만 실행** (어디서 터지나 확인)
   ```bash
   npx jest __tests__/lib/design-system.test.ts
   npx jest __tests__/lib/weekUtils.test.ts
   ```

4. **Node 버전**  
   Node 18 또는 20 LTS 권장. `node -v`로 확인.

5. **에러 메시지 알려주기**  
   터미널에 나온 전체 에러를 복사해서 주시면, 원인 짚어서 수정 방법 적어드릴 수 있음.

---

## 4. Figma / Gemini 로 UI·UX 디자인 바꿀 수 있나?

### Figma
- **가능.**  
  - Figma에서 화면/컴포넌트 디자인 후, 개발 시 **색·간격·타이포**는 `docs/02-design/design-system.md`, `lib/design-system.ts`와 맞추면 됨.  
  - Figma 디자인을 참고해서 컴포넌트(Button, Card, 색상 등) 수정해 나가면 됨.  
  - Cursor에서 "이 Figma 디자인대로 버튼/카드 바꿔줘"처럼 요청하면, design-system 기반으로 코드 수정 가능.

### Gemini
- **가능.**  
  - Gemini에 화면 스크린샷이나 요구사항을 주고 "이런 UI로 바꿔줘" 식으로 요청 → 나온 레이아웃·문구를 참고해서 Cursor에서 `components/ui/`, `app/(tabs)/` 등 실제 코드에 반영하면 됨.  
  - 직접 코드베이스 수정은 Cursor에서 하는 게 좋고, Gemini는 **디자인 아이디어·초안**용으로 쓰기 좋음.

### 이 프로젝트에서 디자인 참고용
- **`docs/02-design/design-system.md`** — 색상, 타이포, 컴포넌트 사용법.  
- **`lib/design-system.ts`** — 실제 색·간격 값.  
  Figma/Gemini로 바꾼 디자인을 적용할 때 이 두 곳과 `components/ui/`를 같이 수정하면 일관됨.

---

## 5. 한 줄 요약

1. **디자인 보기** → `cd LifeBalanceAI` 후 `npx expo start --web` (테스트와 무관).  
2. **테스트** → `LifeBalanceAI`에서 `npm test`, 오류 나오면 위 3번 대로 처리.  
3. **배포** → 테스트 통과 → 법적 문서 보완 → EAS 빌드 → 스토어 등록비·제출 → 인앱 결제 상품 등록.  
4. **UI/UX 바꾸기** → Figma/Gemini로 디자인한 뒤, `design-system.md`·`lib/design-system.ts`·`components/ui/` 기준으로 코드 반영하면 됨.

테스트 에러 메시지가 있으면 그대로 붙여넣어 주시면, 다음 단계(어디 고치면 되는지) 적어드리겠습니다.

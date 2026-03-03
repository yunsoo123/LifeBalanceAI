# 캐시 삭제 후에도 리팩토링이 안 보일 때

## 1. 실행 폴더 확인 (가장 흔한 원인)

앱은 **반드시 `LifeBalanceAI` 폴더 안에서** 실행해야 합니다.

- ❌ `c:\Users\yyssp\Desktop\SortIt` 에서 `npm start` → 잘못된 경로
- ✅ `c:\Users\yyssp\Desktop\SortIt\LifeBalanceAI` 로 이동 후 `npx expo start -c`

Cursor에서 터미널을 열었다면, 현재 경로가 `...\SortIt` 인지 `...\SortIt\LifeBalanceAI` 인지 확인하세요.

```powershell
cd c:\Users\yyssp\Desktop\SortIt\LifeBalanceAI
npx expo start -c
```

---

## 2. 완전 캐시 삭제 후 재실행

아래를 **순서대로** 실행하세요.

```powershell
cd c:\Users\yyssp\Desktop\SortIt\LifeBalanceAI

# 1) Metro/Expo 캐시 폴더 삭제
if (Test-Path .expo) { Remove-Item -Recurse -Force .expo }
if (Test-Path node_modules\.cache) { Remove-Item -Recurse -Force node_modules\.cache }

# 2) 캐시 비우고 Expo 시작
npx expo start -c
```

시작 후 터미널에 **"Cache cleared"** 또는 캐시 비우는 메시지가 나오는지 확인하세요.

---

## 3. 앱에서 번들 다시 불러오기

- **iOS 시뮬레이터**: `Cmd + R` 또는 디바이스 메뉴에서 Reload
- **Android 에뮬레이터**: `R` 두 번 또는 디바이스 메뉴에서 Reload
- **실기기**: 앱 완전 종료 후 다시 열기. 필요하면 앱 삭제 후 재설치

---

## 4. 여전히 이전 화면이면

1. **개발 서버 완전 종료**  
   터미널에서 `Ctrl+C`로 종료한 뒤, 다른 터미널에 `expo` / `node` 프로세스가 남아 있지 않은지 확인하고 모두 종료합니다.

2. **다시 실행**  
   `LifeBalanceAI` 폴더에서:
   ```powershell
   npx expo start -c
   ```

3. **리팩토링 적용 여부 확인**  
   - 프로필 화면: 배경이 **연한 회색(slate)** 이고, 카드가 **둥근 모서리 + 그림자**면 적용된 것입니다.  
   - 이전에는 `LAYOUT.screenBg`(gray-50) + Card 컴포넌트였고, 지금은 `bg-slate-50` + `CARD_CLASS` View입니다.

---

## 5. 코드는 반영됐는지 확인

리팩토링된 코드는 이미 저장되어 있습니다. 예:

- `app/(tabs)/profile.tsx`: `SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950"`
- 그 외 탭/인증 화면도 동일한 배경·카드 스타일 적용

위 1~4를 해도 화면이 안 바뀌면, **실행 중인 앱이 다른 폴더의 프로젝트**이거나 **빌드/번들이 예전 것을 쓰는 경우**일 수 있습니다.  
그때는 “지금 터미널에서 찍은 `cd` 경로”와 “Expo가 열었다고 나오는 프로젝트 이름”을 알려주시면 다음 단계 제안하겠습니다.

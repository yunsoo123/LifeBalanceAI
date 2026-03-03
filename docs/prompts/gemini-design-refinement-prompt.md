# Gemini용 프롬프트: 디자인 투박함 해결 (UI/UX 정제)

아래 블록 전체를 복사해 Gemini에 붙여 넣고, **React Native/Expo 앱의 디자인을 Notion·Todoist 수준으로 정제하기 위한 구체적 개선안**을 요청하세요.

---

## 프롬프트 본문 (복사용)

```
당신은 모바일/웹 앱 UI·UX 전문가입니다. 아래 프로젝트의 **현재 디자인이 투박하다**는 피드백을 해결하기 위해, **구체적이고 실행 가능한 개선 제안**을 해 주세요.

---

### 1. 프로젝트 개요

- **앱 이름**: Mendly (LifeBalance AI)
- **한 줄 설명**: “일정·노트·주간 리뷰를 한곳에서” — 브레인 덤프(Inbox) → AI 일정 생성(Schedule) → 캘린더·노트·주간 리뷰까지 이어지는 생산성 앱
- **타깃 품질**: Notion, Todoist 수준의 **프로덕션급·정제된** 디자인 (메모장/프로토타입 느낌 제거)
- **언어**: 한글 기본, 영어 전환 가능(i18n 적용됨)

---

### 2. 기술 스택 (반드시 준수)

- **플랫폼**: **Expo (React Native)** — iOS, Android, Web 동시 지원
- **스타일링**: **NativeWind v4** (Tailwind CSS for React Native). **Tailwind 클래스명**으로만 스타일 지정 가능 (순수 CSS/SCSS 파일 없음)
- **컴포넌트**: React Native 기본 컴포넌트 (View, Text, TextInput, Pressable, ScrollView, FlatList, Modal 등). **웹 전용 라이브러리(shadcn/ui, Radix 등) 사용 불가**
- **라우팅**: expo-router (파일 기반)
- **상태/백엔드**: React state, Supabase (Auth, DB)

---

### 3. 현재 개발 단계

- **Phase**: MVP 기능 구현 완료(Phase 4~7). 회원가입·로그인·온보딩·Inbox·Schedule·Calendar·Notes·Review·Profile·다크모드·무료 한도·인앱 결제(Pro)까지 구현됨
- **상태**: 기능은 동작하나 **시각적 완성도(디자인 정제)가 부족** — “메모장 같다”, “투박하다”는 피드백 있음
- **목표**: **같은 스택(Expo + NativeWind) 유지**한 채, 컴포넌트·레이아웃·타이포·색·여백·그림자·모션만 조정해 **전문 앱 느낌**을 내기

---

### 4. 현재 디자인 시스템 요약

- **디자인 토큰**: `lib/design-system.ts` — 색(brand.primary #3b82f6), 타이포(Inter), 간격·borderRadius·shadow·animation
- **레이아웃 상수**: `lib/layoutConstants.ts` — 화면 배경(bg-gray-50), 헤더(흰 배경+border+shadow-sm), 페이지 제목(text-2xl font-bold), 입력창(rounded-xl border-2), 섹션 제목(text-lg font-semibold)
- **Tailwind**: `tailwind.config.js` — brand primary/secondary, success/warning/error, fontFamily(sans/mono)
- **주요 UI 컴포넌트** (모두 React Native 기반):
  - **Button**: variant=primary|secondary|ghost|danger|outline, size=sm|md|lg, rounded-xl, primary는 blue-600
  - **Card**: default|elevated|outlined, padding=sm|md|lg, rounded-xl, shadow-sm
  - **Input**: label, rounded-xl, border-2, min-h-[48px]
  - **EmptyState**: 아이콘+제목+설명+CTA
  - **Badge**, **Spinner**, **Avatar** 등
- **화면 구성**: 탭 6개(Inbox, Schedule, Calendar, Notes, Review, Profile). 각 화면 상단 헤더 + 본문(p-6). PC/넓은 화면에서는 Inbox 등 일부에서 max-width 672px 중앙 정렬 적용

---

### 5. 해결하고 싶은 문제 (투박함)

- **전반**: 앱 전체가 **프로토타입/메모장 같다**는 인상 — 여백·타이포·컴포넌트 비율이 덜 정돈됨
- **입력 영역**: 큰 텍스트 입력창이 **박스감이 약하거나** 플레이스홀더만 보이는 것처럼 느껴짐
- **PC/넓은 화면**: 빈 흰 공간이 과하게 넓어 **레이아웃이 넓게 퍼져 보임** (일부 화면만 max-width 적용됨)
- **일관성**: 화면마다 카드·버튼·헤더 스타일이 조금씩 다르게 적용된 부분 있음
- **시각적 위계**: 제목·본문·보조 텍스트·버튼 간 **강조도·크기·색 대비**가 덜 명확함
- **미세한 터치**: 호버/포커스/로딩 시 피드백, 둥근 모서리·그림자·간격의 **숫자(px/rem) 일관성** 부족

---

### 6. 제약 사항

- **새 라이브러리**: UI 컴포넌트용 **새 npm 패키지 추가는 최소화** (가능하면 기존 Button/Card/Input 확장으로 해결)
- **플랫폼**: **React Native 컴포넌트만** 사용. DOM 전용(shadcn, Radix, MUI 등) 사용 불가
- **스타일**: **NativeWind(Tailwind) 클래스** 위주. 인라인 style은 보조적으로만 (예: minHeight, 특수 shadow)
- **접근성**: hitSlop, accessibilityLabel 등은 유지·보강

---

### 7. 요청하는 출력 형식

다음 형식으로 **우선순위를 붙여** 제안해 주세요.

1. **타이포그래피**
   - 페이지 제목 / 섹션 제목 / 본문 / 캡션 권장 크기·굵기·행간 (Tailwind 클래스 또는 design-system 수치)
   - 한글 가독성 고려 (줄간격, 최소 폰트 크기)

2. **간격·비율**
   - 화면 패딩(p-4/p-6 등), 카드 내부 패딩, 버튼·입력창 간격
   - 넓은 화면(640px 이상)에서 **콘텐츠 최대 폭·중앙 정렬** 적용할 화면 목록 및 권장 max-width

3. **입력 컴포넌트**
   - 큰 멀티라인 입력창(브레인 덤프 등): border·배경·minHeight·placeholder 스타일로 “박스”가 명확히 보이게 하는 구체 클래스 제안
   - 일반 Input: 포커스 시 border 색 변경 등 (React Native에서 가능한 범위로)

4. **카드·버튼**
   - Card: 기본/강조용 그림자·테두리 차이, rounded-xl 유지 시 내부 여백 권장값
   - Button: primary/outline 비율, 아이콘+텍스트 정렬, 로딩 시 시각적 피드백

5. **색·대비**
   - 본문 배경(gray-50) vs 카드(white) vs 강조(blue) 대비가 명확한지
   - 다크 모드에서도 동일 원칙 적용할 수 있는 클래스 예시

6. **모션·피드백** (선택)
   - React Native에서 부드럽게 할 수 있는 것: 버튼 누름(opacity/scale), 리스트 아이템 터치, 모달 등
   - react-native-reanimated 사용 가능하다고 가정해도 됨

7. **화면별 우선 적용 순서**
   - Inbox → Schedule → Calendar → Notes → Review → Profile 순으로, 어디부터 손보면 “투박함 해소” 효과가 큰지 1~3개 화면 추천

각 항목마다 **“지금 상태 → 개선 후”** 형태로 Tailwind 클래스 또는 design-system 수치를 구체적으로 적어 주시면, 개발자가 그대로 코드에 반영할 수 있습니다.
```

---

## 사용 방법

1. 위 **프롬프트 본문** 전체(``` 부터 ``` 까지)를 복사합니다.
2. Gemini(또는 사용 중인 AI)에 붙여 넣고 전송합니다.
3. 출력된 제안을 `docs/02-design/` 또는 `docs/03-analysis/` 아래에 저장한 뒤, `lib/design-system.ts`, `lib/layoutConstants.ts`, 각 `components/ui/*`, `app/(tabs)/*.tsx`에 단계적으로 반영합니다.

필요 시 이 파일 경로·스크린샷 링크를 프롬프트 뒤에 추가해 주면 더 구체적인 제안을 받을 수 있습니다.

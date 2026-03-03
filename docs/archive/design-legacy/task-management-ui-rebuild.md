# Task Management App UI/UX Rebuild

Figma Community 검색 기준(**task management app free**)과 프로젝트 디자인 컨셉(v0-pages-and-concept)을 반영한 UI/UX 전면 정리 문서입니다.

**Figma Reference:** [Task management - to-do list app (Community)](https://www.figma.com/design/5iqDimMc4RNt5Ya0h93W0W/Task-management---to-do-list-app--Community-?node-id=0-1)

## 참고한 Figma 커뮤니티 예시

- [Task management - to-do list app](https://www.figma.com/design/5iqDimMc4RNt5Ya0h93W0W/) (primary reference)
- [Task Management App UI Kit - Community](https://www.figma.com/community/file/1213427421954582917)
- [Task Management - A Mobile App UI Kit](https://www.figma.com/community/file/1511353615262415613)

## 적용한 방향

- **Brand primary**: `#6F42C1` (purple) — `lib/design-system.ts` `colors.brand.primary`
- **일관된 배경**: `bg-slate-50` / `dark:bg-zinc-950`
- **카드**: `bg-white` / `dark:bg-zinc-900`, `rounded-2xl`, `p-5`/`p-6`, `shadow-sm` ~ `shadow-lg`, `border border-gray-100`
- **탭 바**: 흰색 배경, 상단 그림자, 활성 탭 `colors.brand.primary` (purple), 라벨 `fontWeight: '600'`
- **헤더**: 섹션 라벨(작은 대문자) + 큰 제목 + 부가 설명 (Schedule, Calendar, Notes, Review, Profile)
- **태스크 카드**: 항목별 왼쪽 강조 테두리(구조화됨 = 초록, 미구조화 = 기본)
- **CTA 버튼**: primary = design-system purple, 비활성 시 `colors.gray[300]`

## 수정된 화면 (전체 리디자인 완료)

| 화면 | 변경 요약 |
|------|-----------|
| **lib/design-system.ts** | Brand primary → purple `#6F42C1` |
| **(tabs)/_layout** | 탭 바 활성 색상 = brand primary (purple) |
| **components/ui/Button** | Primary variant = design-system primary (purple) |
| **sign-in / sign-up** | 로고 배경 = brand primary, 카드 shadow-lg |
| **index (Loading)** | 로고·스피너 = brand primary |
| **onboarding** | CTA·인디케이터 = brand primary |
| **Inbox** | 배경 slate-50, CTA·포커스 보더 = purple |
| **Schedule** | Generate/Save 버튼 = purple, 헤더 스타일 |
| **Calendar** | Add 버튼·선택일·이벤트 점 = purple, 헤더 라벨 |
| **Notes** | 선택 노트/링크 강조 = purple, 헤더 라벨 |
| **Review** | 헤더 라벨 "Weekly report", 카드·Button primary |
| **Profile** | 헤더 라벨 "Account", 카드·Button primary |

## 기술 스택

- React Native (Expo) + NativeWind v4
- `View`, `Text`, `Pressable`, `TextInput`, `ScrollView` 등만 사용 (웹 전용 HTML 미사용)

## 관련 문서

- `docs/design/v0-pages-and-concept.md` — 페이지별 상세 컨셉
- `lib/design-system.ts` — 색상·타이포·간격 토큰

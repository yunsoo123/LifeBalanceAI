# 성공/에러 피드백 통일 (토스트) — Design

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [feedback-toast.plan.md](../../01-plan/features/feedback-toast.plan.md)

---

## Overview

앱 루트에 **ToastProvider**를 두어 어디서든 `useToast()`로 토스트를 띄울 수 있게 하고, Inbox·Calendar의 **성공 메시지**를 Alert 대신 토스트로 표시한다.

---

## 아키텍처

- **기존**: `components/ui/Toast.tsx` — `<Toast visible variant message description onDismiss duration />`, `useToast()` 훅(로컬 state). 훅과 Toast를 **같은 컴포넌트**에서 쓰면 동작하지만, 다른 화면에서 훅만 쓰면 해당 화면에 Toast가 없어 보이지 않음.
- **변경**: **ToastContext**를 만들어 state를 Context에 올리고, **ToastProvider**가 (1) Context value 제공, (2) 단일 `<Toast>` 렌더. 자식은 `useContext(ToastContext)` 또는 **useToast()**가 Context를 읽도록 해서 전역에서 동일한 토스트 인스턴스를 제어.

---

## 구현 방식

### Option A (권장): Context + Provider

1. **ToastContext**: `React.createContext<ToastContextValue | null>(null)`. Value: `{ toast state, showSuccess, showError, showWarning, showInfo, dismissToast }`.
2. **ToastProvider**: `useState`로 toast state 보유, value에 setState 노출, 자식으로 `{children}` + `<Toast visible={...} ... onDismiss={dismiss} />` 렌더. Toast는 **절대 위치**(absolute)이므로 Provider가 `View style={{ flex: 1 }}`로 감싸고 그 안에 Toast를 두면 화면 상단에 겹쳐 표시됨.
3. **useToast()**: `useContext(ToastContext)`를 읽어서 반환. Context가 없으면 no-op 또는 개발용 fallback(console.log).
4. **_layout.tsx**: 기존 Provider 순서 안에 `<ToastProvider>` 추가(ThemeProvider, I18nProvider 등 자식으로). ToastProvider는 ThemedLayout 바깥/안쪽 중 한 곳에 두면 되고, SafeAreaProvider 안이면 됨.

### Option B: 기존 useToast 유지하고 각 탭에서 Toast 렌더

- 각 화면(Inbox, Calendar)에서 `useToast()` + `<Toast ... />`를 렌더. 그러면 해당 화면에서만 토스트가 보임. 다른 화면으로 이동하면 토스트가 사라질 수 있음. **전역 일관성**을 위해 Option A 권장.

---

## 적용 위치 (Alert → Toast)

| 위치 | 기존 (성공 시) | 변경 |
|------|----------------|------|
| **Inbox** `parseAndAddToCalendar` | Alert.alert('캘린더에 추가됨', `캘린더에 ${ids.length}개 일정이 추가되었어요.`) | `showSuccess('캘린더에 추가됨', \`캘린더에 ${ids.length}개 일정이 추가되었어요.\`)` |
| **Inbox** zero-insert 실패 | Alert (유지) | 유지 |
| **Calendar** `saveEditedEvent` 성공 | Alert.alert('Saved', 'Event updated.') | `showSuccess('Saved', 'Event updated.')` |
| **Calendar** `createEvent` 성공 | Alert.alert('Success', 'Event created successfully!') | `showSuccess('Success', 'Event created successfully!')` |
| **Calendar** import 성공 | Alert.alert('Success', `Imported ${importedCount}...`) | `showSuccess('Success', `Imported ${importedCount} activities to calendar!`)` |
| **Calendar** delete 성공 | Alert.alert('Done', 'Event deleted') | `showSuccess('Done', 'Event deleted')` |

로그인 필요, 삭제 확인, 파싱 실패, update 실패 등 **사용자 선택이 필요한 Alert**은 그대로 유지.

---

## 파일 변경

- **신규**: `lib/ToastContext.tsx` (또는 `components/providers/ToastProvider.tsx`) — ToastContext, ToastProvider, useToast export.
- **수정**: `app/_layout.tsx` — ToastProvider로 감싸기.
- **수정**: `app/(tabs)/inbox.tsx` — useToast를 Context에서 import, 성공 시 showSuccess 호출.
- **수정**: `app/(tabs)/calendar.tsx` — useToast를 Context에서 import, 성공 시 showSuccess 호출.

**기존** `components/ui/Toast.tsx`는 그대로 두고, Provider가 이 컴포넌트를 사용. `components/ui/useToast`는 Provider용 useToast로 대체되므로, 기존 훅은 **ToastContext에서 re-export**하거나, Toast.tsx의 useToast는 deprecated로 두고 Context의 useToast만 사용.

---

## 체크리스트

- [ ] ToastProvider가 _layout에 추가되고, 단일 Toast가 렌더됨.
- [ ] Inbox·Calendar에서 useToast(Context)로 showSuccess 호출 시 토스트가 표시됨.
- [ ] 위 표의 성공 5곳에서 Alert 제거 후 showSuccess 적용.
- [ ] 에러/확인용 Alert는 유지.

---

**Next Steps**: Do — ToastContext/Provider 구현, _layout 연동, Inbox·Calendar 성공 메시지 토스트로 교체.

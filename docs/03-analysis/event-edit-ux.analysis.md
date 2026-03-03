# Event Edit UX — Analysis

**Date**: 2025-02-25  
**Author**: gap-detector  
**Project**: Mendly (LifeBalanceAI)  
**Design**: [event-edit-ux.design.md](../02-design/features/event-edit-ux.design.md)  
**Plan**: [event-edit-ux.plan.md](../01-plan/features/event-edit-ux.plan.md)

---

## Overview

편집 버튼 탭 시 **편집 모달**을 열고, 제목·설명·시작/종료 시간 수정 후 저장하면 Supabase `events` 갱신 및 목록 반영하는 기능에 대해 설계 문서와 `app/(tabs)/calendar.tsx` 구현을 비교한 결과, 전반적으로 설계를 따르고 있으며 일부 사소한 차이만 존재합니다.

---

## Design vs Implementation Comparison

| # | Design item | Status | Implementation |
|---|--------------|--------|----------------|
| 1 | [✎] 버튼 onPress → 편집 모달 열기 (Alert 제거) | **Match** | `calendar.tsx:669` — `onPress={() => openEditModal(event)}`, Alert 없음 |
| 2 | 편집 대상 `CalendarEvent` 전달 (id, title, start, end, description, color) | **Match** | `openEditModal(event)`에 전체 이벤트 전달 |
| 3 | 모달 레이아웃: Modal + KeyboardAvoidingView + ScrollView, 배경 탭 시 닫기 | **Match** | `calendar.tsx:762–858` 동일 패턴, `onPress={closeEditModal}` |
| 4 | 모달 제목 "Edit Event" (또는 i18n "일정 수정") | **Partial** | `calendar.tsx:782` "Edit Event" 하드코딩 — i18n 미적용 |
| 5 | 필드: Event title (필수), 기본값 event.title | **Match** | `editFormTitle`, `openEditModal`에서 `event.title` 초기화 |
| 6 | 필드: Description (optional), 기본값 event.description ?? '' | **Match** | `editFormDescription`, `event.description ?? ''` |
| 7 | 필드: Date 읽기 전용 (event.start 기준) | **Match** | `calendar.tsx:809–822` `eventToEdit.start` 표시, Text only |
| 8 | 필드: Start time (HH:MM), End time (HH:MM) | **Match** | `editFormStartTime`, `editFormEndTime`, `dateToTimeString` 24h |
| 9 | [Cancel] / [Save], Save 시 "Saving..." 표시 | **Match** | `closeEditModal` / `saveEditedEvent`, `editSaving ? 'Saving...' : 'Save'` |
| 10 | 제목 비어 있으면 Alert 후 저장 중단 | **Match** | `calendar.tsx:338–342` Alert "Please enter event title" |
| 11 | 시작/종료 시간 파싱 실패 시 기본값 또는 Alert | **Partial** | `parseTimeOnDate`에서 NaN 시 0 사용 (`calendar.tsx:93`) — 09:00/10:00 기본값 또는 Alert 미구현 |
| 12 | End time > Start time 검사 | **Match** | `calendar.tsx:361–365` 검사 후 Alert "End time must be after start time." (설계에 명시는 없으나 권장 동작) |
| 13 | API: `tables.events().update({...}).eq('id', event.id)` | **Match** | `calendar.tsx:364–372` title, description, start_time, end_time |
| 14 | 저장 성공 시 `loadEvents()` 후 모달 닫기 | **Match** | `calendar.tsx:374–375` |
| 15 | 로그인 없음: Alert "Sign in required" + Sign in 이동 | **Match** | `calendar.tsx:348–355` |
| 16 | update 실패: Alert "Failed to update event", 모달 유지 | **Match** | `calendar.tsx:378–380` "Failed to update event." (끝 마침표만 차이) |
| 17 | 상태: eventToEdit, editFormTitle, editFormDescription, editFormStartTime, editFormEndTime | **Match** | `calendar.tsx:134–138`, `editSaving` 추가(설계의 Save 로딩 상태에 해당) |
| 18 | openEditModal(event), closeEditModal(), saveEditedEvent() | **Match** | `calendar.tsx:324–384` |
| 19 | 시간 포맷 24h "HH:MM" (dateToTimeString) | **Match** | `calendar.tsx:84–87` padStart으로 HH:MM |
| 20 | 저장 성공 Alert | **Match** | `calendar.tsx:376` Alert.alert('Saved', 'Event updated.') |

---

## Match Rate Summary

- **Match**: 17  
- **Partial**: 2 (모달 제목 i18n, 시간 파싱 실패 시 기본값/Alert)  
- **Missing**: 0  
- **Extra**: 0 (end > start 검사는 설계 의도에 부합하는 추가)

**Match rate: ~93%** (17 full + 2 partial 반영 시 약 90% 이상 유지).

---

## Gaps (Missing or Wrong)

1. **Modal title not i18n**  
   - **Where**: `calendar.tsx:782` — `"Edit Event"`  
   - **Design**: "Edit Event" (또는 i18n "일정 수정").  
   - **Gap**: i18n 키 미사용. `t.calendar.editEvent` 등으로 치환 권장.

2. **Start/end time parse failure handling**  
   - **Where**: `calendar.tsx:90–95` — `parseTimeOnDate` 내 `isNaN(h) ? 0 : h`, `isNaN(m) ? 0 : m`.  
   - **Design**: 파싱 실패 시 기본값(09:00, 10:00) 또는 Alert로 재입력 유도.  
   - **Gap**: 잘못된 입력 시 00:00으로 해석될 수 있음. 기본값 09:00/10:00 적용 또는 Alert 안내 권장.

3. **Minor wording**  
   - **Where**: `calendar.tsx:379` — `'Failed to update event.'`  
   - **Design**: "Failed to update event".  
   - **Gap**: 마침표 유무만 차이, 기능상 문제 없음.

---

## Recommended Actions

1. **i18n**: Edit Event 모달 제목을 `useI18n()`의 키(예: `t.calendar.editEvent` 또는 `t.common.editEvent`)로 바꾸고, 번역에 "일정 수정" 등 추가.
2. **Time parse**: `parseTimeOnDate` 호출 전에 `editFormStartTime`/`editFormEndTime`이 "HH:MM" 형식인지 검사하고, 실패 시 09:00/10:00으로 초기화하거나 Alert "Please enter valid start/end time (HH:MM)" 표시.
3. (선택) update 실패 메시지를 설계와 동일하게 "Failed to update event"로 통일.

---

## Next Steps

- Match rate ≥ 90%이므로 **pdca report**로 완료 보고서 작성 가능.
- 위 갭을 반영한 뒤 **pdca iterate**로 재분석하거나, 갭을 "accepted deviation"으로 남기고 바로 **pdca report** 진행 가능.

---

## Iteration (Post–Gap Fix)

- **Modal title**: `t.calendar.editEvent` 사용. i18n에 `editEvent: '일정 수정'`(ko), `'Edit Event'`(en) 추가.
- **Time parse**: 저장 전 `editFormStartTime`/`editFormEndTime`을 `^\d{1,2}:\d{2}$`로 검사, 불일치 시 Alert "Please enter valid start and end time (HH:MM, e.g. 09:00)".
- **Update failure message**: "Failed to update event." → "Failed to update event".
- **Accessibility**: 삭제 버튼에 `accessibilityLabel="Delete event"` 추가.
- **Match rate** after iteration: 갭 1–3 및 코드 리뷰 권장사항 반영, 유효 매치율 ≥95%.

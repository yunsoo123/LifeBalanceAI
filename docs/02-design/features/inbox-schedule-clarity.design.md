# Inbox / Schedule 차이점 명확화 및 사용 가이드 — Design

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [inbox-schedule-clarity.plan.md](../../01-plan/features/inbox-schedule-clarity.plan.md)

---

## Overview

Inbox와 Schedule 탭에 **부제(subtitle)** 및 **빈 상태 설명**을 넣어 차이를 명확히 하고, **사용 가이드** 화면을 추가한다.

---

## 1. Inbox 탭

### 1.1 부제 (상단, 제목 아래 또는 플레이스홀더 근처)
- **ko**: "한 줄로 적고 → 구조화·캘린더에 추가"
- **en**: "Type a line → structure & add to calendar"
- **위치**: 기존 헤더/제목 영역에 subtitle로 표시. 없으면 플레이스홀더 위 작은 텍스트.

### 1.2 빈 상태 (이미 emptyTitle/emptyDesc 있음)
- **보강**: emptyDesc가 "한 줄로 메모하고 일정으로 만들 수 있어요" 수준으로 **Inbox 용도**를 언급하는지 확인. 필요 시 i18n만 수정.

### 1.3 i18n 키
- `inbox.subtitle`: 위 부제 문구.

---

## 2. Schedule 탭

### 2.1 부제
- **ko**: "AI와 대화로 주간 일정 설계"
- **en**: "Plan your week with AI conversation"
- **위치**: 상단 제목 아래 또는 채팅 입력 위 안내 문구.

### 2.2 빈 상태
- **보강**: emptyDesc가 "목표나 하고 싶은 일을 적으면 AI가 주간 일정을 만들어요" 수준인지 확인. 필요 시 i18n 수정.

### 2.3 i18n 키
- `schedule.subtitle`: 위 부제 문구.

---

## 3. 사용 가이드 페이지

### 3.1 라우트
- **경로**: `app/guide.tsx` (루트) 또는 `app/(tabs)/guide.tsx` (탭).  
- **진입**: Profile 탭에서 "사용 가이드" 링크, 또는 첫 실행 시 1회 모달/바텀시트.  
- **권장**: **Profile 안에 "사용 가이드" 버튼** → `/(guide)` 또는 `/guide` 라우트로 이동하는 단일 화면.

### 3.2 콘텐츠 구조
- **제목**: "Mendly 사용 가이드" / "How to use Mendly"
- **섹션** (카드 또는 리스트):
  1. **Inbox**: "할 일·메모를 한 줄로 적어 보세요. AI가 일정으로 구조화하고, 원하면 캘린더에 바로 추가할 수 있어요." (ko) / "Write tasks or notes in one line. AI structures them into events—add to calendar in one tap." (en)
  2. **Schedule**: "하고 싶은 일을 말하면 AI가 질문으로 맞춤 주간 일정을 만들어요. 요일·시간을 바꾼 뒤 캘린더에 등록하세요." (ko) / "Tell AI what you want to do; it asks a few questions and builds a weekly plan. Adjust days/times, then add to calendar." (en)
  3. **Calendar**: "주간 타임테이블에서 일정을 보고, 길게 누르면 이동·수정할 수 있어요. + 버튼으로 새 일정 추가." (ko) / "View events on the weekly timetable. Long-press to move or edit. Use + to add new events." (en)
  4. **Notes / Review**: 1문장 요약 each (선택).

### 3.3 UI
- ScrollView + 카드 형태. 각 섹션: 제목(탭 이름) + 본문 1~2문장. i18n.

### 3.4 i18n
- `guide.title`, `guide.inbox`, `guide.schedule`, `guide.calendar`, `guide.notes`, `guide.review` (본문). 또는 `guide.sectionInboxTitle`, `guide.sectionInboxBody` 형태.

---

## 4. 구현 순서

1. i18n: inbox.subtitle, schedule.subtitle, guide.* 키 추가.
2. Inbox: 상단에 부제 표시 (헤더 또는 플레이스홀더 위).
3. Schedule: 상단에 부제 표시.
4. 라우트: `app/guide.tsx` (또는 (tabs) 외부) 생성, 콘텐츠 반영.
5. Profile: "사용 가이드" 버튼 추가 → router.push('/guide').

---

## 5. 체크리스트

- [ ] inbox.subtitle, schedule.subtitle 노출.
- [ ] guide 라우트 및 가이드 페이지 콘텐츠.
- [ ] Profile에서 가이드 진입 가능.

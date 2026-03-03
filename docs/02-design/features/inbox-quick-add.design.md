# Design: Inbox Quick Add (Phase B)

**Plan**: [competitive-roadmap.plan.md](../../01-plan/competitive-roadmap.plan.md)  
**Benchmark**: [benchmark-competitors.md](../benchmark-competitors.md) — Todoist Quick Add·자연어

---

## 목표

- **한 줄 입력 → Enter 또는 버튼 → 즉시 항목 추가**. 기존 "여러 줄 덤프 + 항목 추가"는 유지.
- (1차) Quick Add UI. (2차) 입력 텍스트에서 날짜 키워드 추출 → 항목에 표시.

---

## 1. UI

- **위치**: Inbox ListHeaderComponent **맨 위**. 큰 텍스트 영역보다 위에 배치.
- **구성**: 한 줄 `TextInput` + 오른쪽에 "추가" 버튼(또는 아이콘).  
  - placeholder: "한 줄로 적고 Enter 또는 추가" (i18n: `inbox.quickAddPlaceholder`)
- **동작**:  
  - **Enter** (submit): 현재 한 줄 텍스트를 한 개 Entry로 추가, 입력창 비우기.  
  - **추가 버튼**: 동일.  
  - 빈 문자열이면 무시.
- **큰 입력창**: 기존 유지. "덤프"용 여러 줄 입력 후 "항목 추가"로 한 번에 추가.

---

## 2. 데이터

- **Entry**: 기존 `{ id, text, timestamp, isParsed }` 유지.  
- (2차) `dueDate?: string` (ISO) 추가 시, 자연어에서 파싱한 날짜 저장. 카드에 "내일" 등 표시.

---

## 3. 자연어 날짜 (1차: 간단)

- **키워드**: "내일", "모레", "다음 주 월요일", "오늘" 등.  
- **로직**: `parseNaturalDate(text: string) => { date: Date | null; restText: string }`.  
  - 텍스트에서 키워드 제거한 나머지를 `restText`로, 날짜가 있으면 Entry에 저장(2차에서 필드 추가 후).  
- 1차에서는 **Quick Add만** 구현. 2차에서 Entry.dueDate + 카드 표시.

---

## 4. 성공 기준

- 사용자가 Quick Add 한 줄에 "이메일 보내기" 입력 후 Enter → 항목이 목록에 즉시 추가됨.  
- 기존 큰 입력창 + "항목 추가" 동작 유지.

# Design: Inbox Quick Add (Phase B) - Analysis

**Date**: 2025-02-23  
**Design**: [inbox-quick-add.design.md](../02-design/features/inbox-quick-add.design.md)  
**Project**: Mendly

---

## Overview

Inbox Quick Add 설계(한 줄 입력 → Enter/버튼으로 즉시 항목 추가, 자연어 날짜 파싱)와 현재 구현을 비교한 갭 분석이다. 1차(Quick Add UI)와 2차(Entry.dueDate + 카드 표시) 모두 구현되어 있다.

---

## Gap Analysis

### 1. UI

| 설계 | 구현 | 상태 |
|------|------|------|
| 위치: ListHeaderComponent **맨 위**, 큰 텍스트 영역보다 위 | ScrollView 내 첫 입력 카드 안에 Quick Add 행이 맨 위, 그 아래 큰 TextInput(덤프용) | **Match** |
| 구성: 한 줄 TextInput + 오른쪽 "추가" 버튼(또는 아이콘) | 한 줄 TextInput + 오른쪽 "+" 버튼 (accessibilityLabel: addEntry) | **Match** (아이콘 허용) |
| placeholder: `inbox.quickAddPlaceholder` | `t.inbox.quickAddPlaceholder` 사용 (한/영 "한 줄로 적고 Enter 또는 추가") | **Match** |
| Enter (submit): 한 줄 → 한 Entry 추가, 입력창 비우기 | `onSubmitEditing={addQuickEntry}`, addQuickEntry 후 `setQuickAddLine('')` | **Match** |
| 추가 버튼: 동일 | `onPress={addQuickEntry}`, 동일 로직 | **Match** |
| 빈 문자열이면 무시 | `if (quickAddLine.trim().length === 0) return` | **Match** |
| 큰 입력창 + "항목 추가" 유지 | 기존 rawInput + addEntry 유지 | **Match** |

### 2. Data / Entry

| 설계 | 구현 | 상태 |
|------|------|------|
| Entry: id, text, timestamp, isParsed 유지 | interface Entry 동일 + dueDate?, savedToNote? | **Match** |
| (2차) dueDate?: string (ISO) | Entry.dueDate 추가, parseNaturalDate 결과 저장 | **Match** |
| 카드에 "내일" 등 표시 | formatDueDateShort(entry.dueDate), 뱃지로 표시 | **Match** |

### 3. 자연어 날짜

| 설계 | 구현 | 상태 |
|------|------|------|
| parseNaturalDate(text) => { date, restText } | `lib/parseNaturalDate.ts` export, 한글·영어 패턴 (오늘/내일/모레/다음 주 요일, today/tomorrow/next week 등) | **Match** |
| 1차 Quick Add만 / 2차 dueDate+카드 | 2차까지 구현됨 (dueDate 저장 및 카드 표시) | **Match** |

### 4. API / Conventions

- 설계에 신규 API 없음. 기존 Entry 로컬 상태만 사용.  
- 네이밍: PascalCase 컴포넌트, camelCase 함수, i18n 키 일치.

---

## Match Rate Summary

| 영역 | Match | Missing | 비고 |
|------|-------|---------|------|
| UI (위치·구성·동작) | 7 | 0 | - |
| Data (Entry, dueDate, 카드 표시) | 3 | 0 | - |
| 자연어 (parseNaturalDate, 2차) | 2 | 0 | - |

**Match rate**: **100%**. 설계 대비 구현 완료.

---

## Recommended Actions

- 추가 수정 불필요. 성공 기준 충족: 한 줄 입력 후 Enter/추가 → 항목 즉시 추가, 기존 큰 입력창 동작 유지, 자연어 날짜 표시.

---

## Next Steps

1. **pdca report**: 완료 보고서 작성 권장 (`docs/04-report/features/inbox-quick-add.report.md` 또는 동일 규칙).
2. (선택) 추가 자연어 패턴 확장 시 parseNaturalDate 유지·테스트.

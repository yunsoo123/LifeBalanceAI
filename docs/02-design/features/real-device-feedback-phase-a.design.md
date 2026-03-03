# 실기기 피드백 3차 Phase A (Quick) — Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: [real-device-feedback-round3.plan.md](../../01-plan/features/real-device-feedback-round3.plan.md) § Phase A

---

## Overview

Phase A 항목 3·5·8의 구체 스펙과 구현 순서.

| # | 항목 | 상태 | 조치 |
|---|------|------|------|
| **3** | 일정 추가 시 날짜에 달력 피커 | **이미 구현됨** | 날짜 영역 탭 시 `showAddFormDatePicker`로 월 그리드 모달 노출됨. 선택: 날짜 라벨 옆 힌트 "탭하여 날짜 선택" 추가. |
| **5** | AI 대화 말풍선 간격 | 적용 | Capture > Schedule 채팅 목록 `gap` 16 → 24. |
| **8** | 리뷰 페이지 박스/구분 | 적용 | 리뷰 탭 섹션 제목에 `LAYOUT.sectionTitle` 통일, 카드 간 간격 일관(예: `marginBottom: 24` 유지 또는 `gap` 사용). |

---

## 3. 일정 추가 — 날짜 피커

- **현재**: 새 일정 모달에서 날짜는 ◀ / [날짜 텍스트] / ▶. 날짜 텍스트 영역 탭 시 `setShowAddFormDatePicker(true)`로 **월별 그리드 모달**이 뜨고, 셀 탭으로 날짜 선택 후 모달 닫힘.
- **결론**: 요구사항 충족. (선택) 접근성·발견성 위해 날짜 블록 라벨 아래 보조 텍스트 "탭하여 날짜 선택" 추가.

---

## 5. AI 대화 말풍선 간격

- **파일**: `app/(tabs)/capture/schedule.tsx`
- **위치**: 대화 스레드 `messages.map`을 감싼 `View`의 `style={{ gap: 16 }}`
- **변경**: `gap: 16` → `gap: 24` (말풍선 사이 여백 확대).

---

## 8. 리뷰 페이지 카드/구분

- **파일**: `app/(tabs)/review.tsx`
- **현재**: 요약·목표 vs 실제·이번 주 일정·AI 인사이트가 각각 `borderRadius.xl`, `borderWidth: 1`, `padding: 20`, `marginBottom: 24` 등으로 카드 형태 유지.
- **변경**:
  1. 섹션 제목을 `LAYOUT.sectionTitle` 클래스로 통일(이미 스타일 비슷하면 유지).
  2. 카드 스타일을 한 곳에서 참조하도록 상수 또는 `getSurface`·design-system 사용해 시각 일관성 유지.
  3. (선택) 카드 사이 구분선은 유지하지 않아도 됨(카드 자체가 구분).

---

## Implementation Order

1. **5**: schedule.tsx 대화 목록 `gap` 16 → 24.
2. **8**: review.tsx 섹션 제목 `LAYOUT.sectionTitle` 적용, 카드 스타일 상수화 또는 design-system 일관 적용.
3. **3** (선택): calendar index 새 일정 모달 날짜 블록에 보조 문구 추가(i18n).

---

## Next Steps

Do 완료 후 tsc·lint 실행.

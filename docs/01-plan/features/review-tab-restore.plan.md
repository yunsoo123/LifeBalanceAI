# 리뷰 탭 복원 - Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [review-tab-regression-cause-and-restore.md](../../03-analysis/review-tab-regression-cause-and-restore.md), [review-tab-ui-ux.design.md](../../02-design/features/review-tab-ui-ux.design.md)

---

## Overview

현재 목업 수준으로 퇴화한 리뷰 탭을 design 문서 기준의 **진보된 상태**로 복원한다. design-system·다크모드·i18n·요약 카드·목표 vs 실제·이번 주 일정·할 일·(i) 툴팁·⋮ 메뉴를 적용한다.

---

## Scope

| 블록 | 내용 |
|------|------|
| 테마·i18n | useTheme, getSurface, colors, LAYOUT, useTranslation(t.review.*) |
| 헤더 | 주 선택 ◀ 이번 주 ▶, ⋮ 메뉴(복사, 공유, 내보내기, 인사이트 생성) |
| 요약 카드 | 총 몰입 시간, 계획 달성률(%), (i) 툴팁, 전주 대비, Over Budget 한 줄, ProgressBar |
| 목표 vs 실제 | GoalVsActualBar, 완료한 일정 N/M, 이벤트 완료율 %, 노트 개수(Pressable→노트 탭) |
| 이번 주 일정 | 해당 주 이벤트 리스트, 완료 토글 |
| 이번 주 할 일 | 해당 주 todos 집계(또는 목록) |
| AI 인사이트 | 통합 카드, 인사이트 생성 버튼, 목록 |
| 빈 상태 | 로그아웃 EmptyState, 데이터 없음 CTA |

---

## Success Criteria

- 다크모드 시 design-system 배경/텍스트/카드 색 적용.
- 모든 라벨 i18n 사용.
- 터치 타겟 44dp 이상. 계획 달성률 (i) 터치 시 툴팁 노출.
- tsc·lint 에러 0.

---

## Next Steps

Design 참조 후 Do(구현).

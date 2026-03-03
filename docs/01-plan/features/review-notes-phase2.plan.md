# 리뷰·노트 Phase 2 - Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [Analysis](../../03-analysis/review-notes-current-and-improvements.md) §8 Phase 2

---

## Overview

Phase 2(Minor — 가독성·효율) 적용: 리뷰 탭 이벤트 완료율 표시(R2), 요약 숫자 강조(D4), 노트 탭 목록 카드 정보 구조 점검(D7). 최소 단위로 R2 → D4 → D7 순 구현 후 품질 게이트·갭 분석·리포트까지 수행.

---

## Scope

| # | 항목 | 설명 | 산출물 |
|---|------|------|--------|
| R2 | 이벤트 완료율 % | "완료한 일정 N / M" 옆 "(이벤트 완료율 XX%)" (total_events > 0) | 기존 구현 확인 또는 UI 추가 |
| D4 | 요약 숫자 강조 | 총 몰입 시간·달성률 %를 더 큰 폰트/색으로 한눈에 인지 가능하게 | review.tsx 요약 카드 스타일 |
| D7 | 목록 카드 정보량 | 제목·요약·태그·연결 뱃지·수정일이 한 카드에서 스캔하기 쉽게 정리 | notes.tsx 카드 레이아웃/라벨 |

---

## Success Criteria

- R2: 이벤트 완료율 문구가 N/M 옆에 노출됨 (또는 이미 구현됨으로 확인).
- D4: 요약 카드 내 실제 시간·달성률 %가 보조 텍스트보다 시각적으로 우선 인지됨.
- D7: 노트 목록 카드에서 제목→요약→메타(태그·연결·수정일) 계층이 명확함.
- TypeScript·Lint 에러 0. 분석 문서·완료 리포트 작성됨.

---

## 적용 순서 (최소 단위)

1. **Plan** → 본 문서.
2. **Design** → R2/D4/D7 상세 스펙(데이터·UI·i18n).
3. **Do** → R2 확인 후 D4 수정, D7 수정. 단위별 저장.
4. **Test** → `npx tsc --noEmit`, `npx expo lint`.
5. **Analyze** → design vs 구현 갭 분석 문서.
6. **Iterate** → 갭 있으면 수정 후 재검사.
7. **Report** → 완료 리포트.

---

## Next Steps

Design 문서 작성 후 Do 단계 진행.

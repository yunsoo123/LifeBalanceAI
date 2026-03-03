# Design: 목업 수준 도달 (Phase A) - Analysis

**Date**: 2025-02-23  
**Design**: [design-mockup-level.design.md](../02-design/features/design-mockup-level.design.md)  
**Project**: Mendly

---

## Overview

설계 문서(전 화면 공통·화면별 목적·빈 상태·로딩/에러)와 현재 코드를 비교한 갭 분석이다.  
빈 상태 문구 통일은 완료된 상태이며, 로딩/에러 일관성과 일부 LAYOUT/i18n 적용이 남은 갭이다.

---

## Gap Analysis

### 1. 전 화면 공통

| 설계 규칙 | 현재 상태 | 갭 |
|----------|-----------|-----|
| 배경 `LAYOUT.screenBg` (slate-50 / zinc-950) | Inbox는 `bg-slate-50 dark:bg-zinc-950` 직접 적용. layoutConstants는 `gray-50` 정의. Schedule/Calendar/Notes/Review/Profile은 LAYOUT 미import, 각자 배경 클래스 사용 | **Changed**: 설계는 slate-50, layoutConstants는 gray-50. 화면별로 LAYOUT.screenBg 미사용 |
| 헤더 `LAYOUT.header` / 제목 `LAYOUT.pageTitle` | 대부분 커스텀 클래스. Notes/Review 제목 하드코드 가능성 | **Missing**: LAYOUT.header, pageTitle 일괄 적용. Notes/Review `t.notes.title`, `t.review.title` 사용 권장 |
| 본문 `LAYOUT.contentContainer` / max-width 672px | Schedule, Review, Profile에서 CONTENT_MAX_WIDTH 사용. ScrollView는 contentContainerStyle로 패딩 | **Match**: 본문 폭 제한 적용됨 |
| 로딩: Spinner/Skeleton, "불러오는 중…" 한 줄 | Schedule: Skeleton. Calendar: Spinner + "Loading events...". Review: "Loading statistics..." 텍스트만 | **Missing**: 로딩 문구 i18n 통일(`t.common.loading`), Review에 Spinner 추가 |
| 에러: 인라인 메시지 + 재시도, Alert만 쓰지 말 것 | Schedule만 인라인 에러 카드 + 재시도. Inbox/Calendar/Notes/Review는 대부분 Alert.alert | **Missing**: Calendar/Notes/Review 인라인 에러 + 재시도 |

### 2. 화면별

| 화면 | 목적·메인·빈 상태 | 갭 |
|------|------------------|-----|
| Inbox | 목적·Quick Add·빈 상태 한 문장 가이드 반영됨 | 에러 시 Alert → 인라인 에러 영역 선택 적용 가능 |
| Schedule | 빈 상태·Skeleton·인라인 에러+재시도 충족 | 없음 |
| Calendar | 빈 상태 적용. 로딩 "Loading events..." 하드코드 | 로딩 i18n, 에러 인라인+재시도 |
| Notes | 빈 상태(목록/에디터) 적용 | 에러 인라인+재시도 권장 |
| Review | 빈 상태 적용. weeklySummary 등 반영 | 로딩 Spinner + i18n, 에러 인라인+재시도 |
| Profile | 목적·레이아웃 적용 | 로그아웃 등 Alert 유지 가능 |

### 3. 데이터/API

- 설계에 명시된 API/데이터 모델 변경 없음. 기존 Supabase·로컬 상태 유지.

---

## Match Rate Summary

| 영역 | Match | Missing/Changed | 비고 |
|------|-------|-----------------|------|
| 공통 LAYOUT | 부분 | screenBg 통일(slate vs gray), LAYOUT 미import | 2 |
| 공통 로딩/에러 | 부분 | i18n 로딩, Review Spinner, 인라인 에러 3화면 | 4 |
| 화면별 목적·빈 상태 | 전부 | - | 0 |
| **총 항목** | **~10** | **~6** | - |

**Match rate**: 약 **62%** (완전 일치 항목 기준). 목표 90% 달성을 위해 로딩/에러 일관 적용 및 LAYOUT 통일 권장.

---

## Recommended Actions

1. **Act**: 로딩 문구를 `t.common.loading`으로 통일하고, Review 로딩 시 Spinner 표시.
2. **Act** (중): Calendar/Notes/Review에 인라인 에러 영역 + "다시 불러오기" 버튼 추가.
3. **Act** (선택): Notes/Review 페이지 제목을 i18n 키(`t.notes.title`, `t.review.title`)로 변경.
4. **Act** (선택): 설계의 slate-50과 맞추어 `LAYOUT.screenBg`를 slate-50으로 통일하고, 필요한 화면에 LAYOUT 상수 적용.

---

## Next Steps

1. 위 Act 항목 적용 후 재분석으로 match rate ≥90% 확인.
2. 완료 시 벤치마크 문서에서 "디자인 완성도: 목업 수준" 검증 및 **pdca report**로 완료 보고.

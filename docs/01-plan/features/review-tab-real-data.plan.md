# 리뷰 탭 — 실제 사용자 데이터 반영 및 진척률 정의

**Date**: 2026-02-26  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [weekly-review.plan.md](weekly-review.plan.md), 사용자 스크린샷(총 몰입 시간 / 계획 달성률 / 목표 vs 실제)

---

## Overview

리뷰 탭의 "총 몰입 시간", "계획 달성률", "목표 vs 실제"(App Dev, Studying, Personal Time 등)가 **하드코딩이 아니라 실제 사용자 데이터**에 맞게 표시되도록 하고, **진척률(%)** 계산 방식을 명확히 한다.

---

## 현재 동작 정리

| 상황 | 동작 | 비고 |
|------|------|------|
| **로그아웃** | `loadWeeklyStats()`에서 `!user`이면 **고정값**으로 setStats: planned_hours: 40, actual_hours: 32, achievement_rate: 80, goalVsActual: [] | 데모용 fallback → 사용자 입장에선 "가짜 숫자"로 보일 수 있음 |
| **로그인** | 같은 주의 `schedules`(week_start_date)에서 total_hours, activities_json 조회. 해당 주 `events`에서 실제 시간 합산·활동별 매칭. notes 개수, completed_events 등 집계 후 setStats | **이미 실제 DB 기반**. 단, 해당 주에 스케줄이 없으면 planned_hours=0, activities=[] → goalVsActual은 "계획 없이 한 일"만 표시 |
| **목표 vs 실제** | activities_json의 각 활동명(name)과 **이벤트 제목**을 `eventTitle.includes(name) || name.includes(eventTitle)` 로 매칭해 실제 시간 합산 | 제목이 다르면 0h로 나옴 (예: 활동 "App Dev" vs 이벤트 "앤 개박") |
| **계획 달성률** | `achievement_rate = (actual_hours / planned_hours) * 100` (planned_hours > 0일 때) | 시간 기준만 사용. 이벤트 완료 개수(completed_events/total_events)는 별도 표시 |

---

## 목표

1. **로그아웃 시**: 가짜 숫자(40h, 32h, 80%) 제거 → "로그인하면 주간 리뷰를 볼 수 있어요" 등 **빈 상태 + 로그인 유도**만 표시.
2. **로그인 시**: 현재처럼 Supabase 기반 유지. 필요 시 **활동명–이벤트 매칭** 완화(예: 목표명/별칭 매핑, 또는 키워드 유사도)로 "목표 vs 실제"가 더 잘 채워지게 할 수 있음 (선택).
3. **진척률 % 정의**:
   - **현재 유지**: **시간 기준 달성률** = actual_hours / planned_hours (%). (planned_hours = 0이면 0% 또는 "—" 표시.)
   - **추가 옵션**: **이벤트 완료율** = completed_events / total_events (%) — 이미 "완료한 일정 N / M"으로 표시 중이므로, 필요 시 "달성률" 옆에 "이벤트 완료율"로 라벨만 명시하거나 하나의 지표로 통합할지 결정.

---

## 범위

### In scope

- 로그아웃 시 리뷰 탭에서 **fallback 숫자 제거**, 빈 상태(EmptyState) + 로그인 버튼/문구로 대체.
- 진척률 정의 문서화: 시간 기준 달성률 공식 명시, 이벤트 완료율과의 관계(별도 지표 vs 통합) 결정 및 UI 반영(라벨/툴팁 등).

### Out of scope (본 플랜)

- 활동–이벤트 자동 매칭 개선(별도 플랜으로 진행 가능).
- 새 API 추가(현재 클라이언트에서 schedules + events 직접 조회 유지).

---

## 성공 기준

- 로그아웃 상태에서 리뷰 탭을 열면 **고정값 40/32/80이 보이지 않고**, 빈 상태 + 로그인 유도만 보인다.
- 로그인 상태에서는 기존처럼 **해당 주 schedules·events 기반**으로 총 몰입 시간·계획 달성률·목표 vs 실제가 표시된다.
- 진척률(%)이 **문서와 UI에 동일한 정의**로 쓰인다 (시간 기준 달성률, 필요 시 이벤트 완료율 구분).

---

## 다음 단계

- **Design**: 로그아웃 시 빈 상태 UI, 진척률 라벨/정의를 `docs/02-design/features/review-tab-real-data.design.md`에 정리.
- **Do**: review.tsx에서 `!user` 분기 수정(빈 상태 + 로그인 유도), 필요 시 진척률 라벨 추가.

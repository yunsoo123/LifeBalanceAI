# 광고 배너 수익화 — Plan

**Date**: 2026-02-22  
**Project**: Mendly (LifeBalanceAI)

---

## Overview

앱 내 광고 배너를 도입해 무료 사용자 대상 노출·클릭 수익을 창출한다. 다른 앱들과 비슷한 방식의 배너 자리를 두고, Pro 구독자는 광고를 보지 않도록 한다.

---

## 결정 사항 (에이전트 토의·권장 반영)

| 항목 | 결정 | 근거 |
|------|------|------|
| **배너 위치** | **전역 하단(탭 바 위)** | design-reviewer 검토: 탭 바를 가리지 않고, 모든 탭에서 일관된 위치. 콘텐츠는 하단 패딩/세이프 영역으로 배너와 겹치지 않게 처리. |
| **광고 네트워크** | **Google AdMob** | 문서·정책이 명확하고, Expo/React Native 연동 검증됨. README에 설정 방법 기입. |
| **Pro 사용자** | **광고 미노출** | 구독 가치 유지 및 일반적인 수익화 정책. `useSubscription` 기준으로 배너 컴포넌트 비렌더. |

### 배너 위치 보조 설명

- **Phase 1**: 모든 탭에서 **탭 바 바로 위**에 고정 배너 1개.
- **Phase 2 (선택)**: 이후 데이터상 캘린더/리뷰에서 전환율 저하가 확인되면, 광고 노출을 Inbox·Notes·Profile 탭으로만 제한하는 옵션을 둘 수 있음.

---

## 목표

- 무료 사용자에게만 배너 광고가 노출되어 수익이 발생한다.
- Pro 구독자는 광고를 보지 않는다.
- 배너 위치·노출 정책이 README에 명시되어 운영·온보딩 시 참고 가능하다.

---

## 범위

### In scope

- Google AdMob 배너 1종 연동 (Banner 크기, 단일 광고 단위).
- 배너 컴포넌트: **전역 하단(탭 바 위)** 고정, 모든 탭 공통.
- `useSubscription`(또는 동일한 Pro 판별 로직)으로 Pro일 때 배너 미렌더.
- 로딩/에러 시 레이아웃 깨짐 방지(placeholder 또는 빈 영역).
- **README에 광고 섹션 추가**: 사용 네트워크(AdMob), 배너 위치, Pro 비노출 정책, 필요한 env/설정 요약.

### Out of scope (본 플랜)

- 인터스티셜·리워드 광고.
- AdMob 외 다른 네트워크.
- A/B 테스트·노출 제한(일 사용자당 노출 수 등) — 필요 시 별도 플랜.

---

## 전제 조건

- Expo/React Native 프로젝트, 탭 네비게이션 구조 유지.
- 이미 Pro 구독·`useSubscription` 훅 존재.
- Google AdMob 개발자 계정 및 앱 등록(또는 등록 예정).
- App Store / Play Store 광고 정책 준수(앱 정책에 “광고 포함, 구독 시 제거” 등 명시).

---

## 성공 기준

- 무료 계정으로 실행 시 탭 바 위에 배너가 노출된다.
- Pro 계정으로 실행 시 배너가 보이지 않는다.
- `npx tsc --noEmit`, `npx expo lint` 통과.
- README에 “Monetization / Ads” 섹션이 있고, AdMob·배너 위치·Pro 비노출이 기입되어 있다.

---

## 다음 단계

1. **Design**: `docs/02-design/features/ad-monetization.design.md` 작성 — AdMob 연동 방식, `AdBanner` 컴포넌트·슬롯, 레이아웃(전역 하단), Pro 비노출, 에러/로딩 처리.
2. **Do**: 설계에 따라 구현 후 자가 테스트(tsc, lint).
3. **Check / Act**: 설계 대비 구현 격차 분석 및 수정.
4. **Report**: 완료 리포트 작성.

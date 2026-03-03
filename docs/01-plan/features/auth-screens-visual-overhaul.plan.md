# 인증 화면 비주얼 오버홀 — Plan

**Date**: 2026-02  
**Project**: Mendly (LifeBalanceAI)  
**배경**: 실기기 테스터 피드백 — "기능은 괜찮은데 디자인이 허접해 보인다". 껍데기가 이뻐야 사람들의 마음을 얻을 수 있음. 회원가입·로그인부터 첫인상 개선.

---

## Overview

로그인(sign-in)과 회원가입(sign-up) 화면을 v2 디자인 토큰과 여백·타이포 위주로 전면 개선한다. 기능(이메일/비밀번호 인증)은 유지하고, 시각만 "프리미엄"하게 가져간다.

---

## 목표

- 첫 화면(로그인/회원가입)에서 "정돈된, 신뢰 가는 앱" 인상 전달.
- mendly-ui-overhaul-v2 디자인 언어 준수(colors, typography, spacing, borderRadius).
- 여백·히어로(로고+문구)·카드·입력·버튼·푸터 일관된 톤.

---

## 범위

- **In scope**: sign-in.tsx, sign-up.tsx 비주얼 개편. i18n 보강(가입 관련 메시지).
- **Out of scope**: 온보딩, 탭 내 첫 화면. (추후 동일 톤으로 확장 가능.)

---

## 성공 기준

- [ ] 로그인/회원가입 화면에 72pt 로고, "Mendly" 타이틀, 설명 한 줄, v2 카드·입력·버튼 적용.
- [ ] sign-up 한/영 메시지(i18n) 통일.
- [ ] tsc, expo lint 통과.

---

**Design**: [auth-screens-visual-overhaul.design.md](../../02-design/features/auth-screens-visual-overhaul.design.md)  
**Next**: Do 완료 후 필요 시 pdca analyze → report.

# 캘린더 일정 추가 — 포스트잇 스타일 모달 (접근 B) Design

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [critical-thinking-and-ux-deep.plan.md](../../01-plan/features/critical-thinking-and-ux-deep.plan.md) §1 접근 B

---

## Overview

캘린더 "일정 추가" 모달을 **포스트잇 on A4** 느낌의 큰 카드로 바꿔, 폰트 겹침을 제거하고 작성 영역을 한 덩어리로 인지되게 한다.

---

## UI 스펙

### 컨테이너 (모달 카드)
- **배경**: 반투명 검정 `rgba(0,0,0,0.5)` (기존 유지).
- **카드**: 
  - 배경: 흰색(라이트) / `#18181b`(다크).
  - `maxWidth: 400`, `minHeight: 520`, `width: '90%'`(또는 화면 폭의 90% 상한 400).
  - `borderRadius: 20`, 그림자: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 8 }`, `shadowOpacity: 0.15`, `shadowRadius: 24`, `elevation: 16`.
  - 카드가 화면 중앙에 떠 있도록 (기존 Pressable 중앙 정렬 유지).

### 내부 레이아웃
- **패딩**: 24px (horizontal, top, bottom).
- **필드 간 간격**: 20px (제목 블록 아래 20, 각 블록 사이 20, 버튼 행 위 24).
- **제목("새 일정")**: `fontSize: 20`, `fontWeight: '700'`, `lineHeight: 28`, `marginBottom: 20`.
- **라벨**(제목, 설명, 날짜, 시작 시간): `fontSize: 13`, `fontWeight: '600'`, `lineHeight: 18`, `marginBottom: 8`, 색상 gray-600 / gray-400(dark).
- **입력 영역**(TextInput 또는 읽기 전용 Text): `fontSize: 16`, `lineHeight: 24`, `minHeight: 48`, `paddingVertical: 12`, `paddingHorizontal: 16`, `borderRadius: 12`, border 1px, 배경 gray-50 / zinc-800(dark).
- **버튼 행**: Cancel / 만들기, `minHeight: 48`, `gap: 12`. (기존 유지.)

### 스크롤
- ScrollView `contentContainerStyle`: `paddingHorizontal: 24`, `paddingTop: 24`, `paddingBottom: 32`.
- `minHeight` 제거하거나 520 이상으로 두어 카드가 작은 화면에서도 세로로 넉넉히 스크롤되게 함.
- `keyboardShouldPersistTaps="handled"` 유지.

### 접근성
- 기존 `accessibilityLabel` 유지. 터치 영역 48dp 이상 유지.

---

## 동작
- 기존과 동일: 제목 필수, 날짜는 selectedDay 표시, 시작 시간 HH:MM, createEvent() 호출 후 loadEvents, 모달 닫기.

---

## 체크리스트 (Do)
- [ ] 모달 카드에 고정 maxWidth 400, minHeight 520, shadow·radius 적용.
- [ ] 내부 padding 24, 필드 간 20, 라벨 13/18, 입력 16/24 명시.
- [ ] style로 숫자 지정해 NativeWind만으로 겹치는 경우 방지.

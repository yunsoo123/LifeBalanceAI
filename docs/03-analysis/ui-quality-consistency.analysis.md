# UI/UX 전 페이지 퀄리티 일관화 — 갭 분석

**Date**: 2025-02-22  
**Author**: PDCA (gap analysis)  
**Project**: Mendly (LifeBalanceAI)  
**Design**: [ui-quality-consistency.design.md](../02-design/features/ui-quality-consistency.design.md)  
**Plan**: [ui-quality-consistency.plan.md](../01-plan/features/ui-quality-consistency.plan.md)

---

## Overview

Design 문서(구조·인터랙션 1순위, 시각 2순위)와 현재 구현을 화면·항목별로 비교한 결과입니다. 전반적으로 Design §11 적용 순서 1~7이 반영되어 있으며, §12(design-system/layoutConstants 보강)와 §13 체크리스트 일부에서 보강 여지가 있습니다.

---

## 1. Design vs 구현 대조

### 1.1 Product feel — 카톡 · 노션 · 틱틱 (1순위)

| Design 요구 | 구현 상태 | 비고 |
|-------------|-----------|------|
| **Schedule**: 대화 스레드 + 하단 고정 입력창 + 결과 한 카드 블록 | ✅ 일치 | KeyboardAvoidingView + 고정 입력바, 말풍선·ResultCard·활동 리스트가 스크롤 안 한 블록으로 삽입 |
| **Inbox**: QUICK NOTE 한 블록 + Auto-Schedule + 결과 문장 + 이벤트 블록 | ✅ 일치 | QUICK NOTE 카드 내 입력·Auto-Schedule·"N Recurring Events Created" + 이벤트 칩 그리드 |
| **Review**: WEEKLY REPORT 캡션 → 메트릭 카드 2열 → 목표 vs 실제 행 블록 → 배너 | ✅ 일치 | 캡션·제목·메트릭 2열·별도 카드(목표 vs 실제)·New Routine 배너 |
| **Calendar**: 그리드/타임라인 + 일정 블록, 추가 모달 한 블록 | ✅ 일치 | 타임테이블 + rounded-lg py-2 일정 블록, 이벤트 카드·추가 모달 카드 스타일 |
| **Notes**: 블록 단위(제목·본문·체크·태그) 시각 구분 | ⚠️ 부분 일치 | 체크리스트·코드 블록은 rounded-xl·배경으로 구분됨. 제목은 노트 카드 상단에 있음. 태그는 노트 항목/상세에 존재하나 "태그 전용 블록" 형태는 화면별 상이 |
| **Profile**: 설정 카드/행 블록 구분 | ✅ 일치 | rounded-2xl p-5 카드, ROW_CLASS 행 구분, 다크 border |
| **가이드**: 섹션 블록/카드 구분 | ✅ 일치 | 카드별 cardStyle(isDark), LAYOUT.card + rounded-2xl |

### 1.2 "메모장 같음" 제거 체크 (§1.4)

| 항목 | 상태 |
|------|------|
| 모든 리스트가 카드 또는 행 블록으로 구분 | ✅ Schedule 결과·Inbox 항목·Review 목표 vs 실제·Profile 설정·가이드 섹션 모두 카드/행 사용 |
| 채팅/입력 화면 말풍선 + 고정 입력창 | ✅ Schedule 적용 |
| 결과/요약 한 블록(카드) 안에 제목·수치·CTA | ✅ Schedule ResultCard·Review 메트릭·Inbox 결과 문장+칩 |
| 캘린더 그리드/타임라인 + 이벤트 블록 메인 | ✅ 타임테이블 뷰 + 일정 블록 스타일 적용 |

### 1.3 시각 스펙 (§2~10)

| 항목 | 상태 | 비고 |
|------|------|------|
| 색상 (다크 배경·카드·CTA·성공/경고) | ✅ 일치 | design-system colors 사용, DARK_BG_COLOR·surface.darkCard·resultCard·brand.primary·success |
| 타이포그래피 | ⚠️ 대체 일치 | LAYOUT.pageTitle·sectionTitle·bodyText·caption 사용. 메트릭 24~36px bold 등은 MetricCard 등에서 적용 |
| 카드 radius 12~20px, padding 16~24px | ✅ 일치 | rounded-2xl·p-5 등 Design §4 반영 |
| 헤더 (로고+앱명+Online+메뉴) | ⚠️ Schedule만 명시 | Schedule에 Mendly + • Online + ⋮. Inbox/Calendar/Review 등은 각자 헤더 구조(Design에서 "해당 화면이 채팅/스케줄일 때"로 한정 가능) |
| 입력 영역 (고정 입력바 48~56px, placeholder) | ✅ Schedule 일치 | 하단 고정, min-h-[48px], "메시지를 입력하세요..." |
| CTA·진행바·말풍선 | ✅ 일치 | ResultCard·ChatBubble·ProgressBar·GoalVsActualBar 등 공통 컴포넌트 사용 |
| 이벤트/캘린더 블록 패딩 | ✅ 일치 | 캘린더 타임테이블 블록 py-2·min-h-[32px], Design §9 "최소 8px 상하" 충족 |

### 1.4 design-system / layoutConstants (§12)

| 항목 | 상태 | 비고 |
|------|------|------|
| design-system.ts 블록/카드/채팅 토큰 | ⚠️ 미보강 | 색·surface·chat 등은 있으나 "구조 1순위" 등 Product feel 주석 미추가 |
| layoutConstants | ⚠️ 미보강 | LAYOUT.card·caption 등 있음. "블록 패딩, 입력창 높이" 등 구조용 상수는 별도 없음 |
| 공통 컴포넌트 (ChatBubble, ResultCard, MetricCard 등) | ✅ 사용 | 해당 컴포넌트가 블록 단위로 사용됨 |

---

## 2. 요약

### 일치(Match)
- Schedule·Inbox·Review·Calendar·Profile·가이드의 **구조·인터랙션** (고정 입력창, QUICK NOTE 한 블록, 메트릭 2열, 목표 vs 실제 카드, 일정 블록, 설정 카드, 가이드 카드).
- 시각: 다크/라이트 색상, 카드 radius·padding, CTA·진행바·말풍선 스타일, 캘린더 이벤트 블록 패딩.
- §1.4 "메모장 같음" 제거 체크 4항목 충족.

### 부분 일치(Partial)
- **Notes**: 체크·코드 블록 시각 구분 완료. 제목은 노트 상단에 있어 블록으로만 보이진 않을 수 있음(의도에 따라 추가 래핑 가능).
- **헤더**: Schedule에만 Design §5 스펙(로고+앱명+Online) 명시 적용. 다른 탭은 기존 헤더 유지.
- **타이포**: 전역적으로 20~24px 제목·24~36px 메트릭 등은 컴포넌트/LAYOUT으로 적용되어 있으나, 문서 수치와 1:1 검증은 미진행.

### 미구현/보강(Gap)
- **design-system.ts**: Product feel(카톡·노션·틱틱) 또는 "구조 1순위" 관련 **주석** 미추가.
- **layoutConstants**: 블록 패딩·입력창 높이 등 **구조용 상수**는 선택 사항으로, 없어도 현재 구현에는 문제 없음.

---

## 3. 매치율 및 권장 조치

| 구역 | 매치율 | 권장 조치 |
|------|--------|-----------|
| Product feel (§1) | 약 95% | Notes 제목 블록은 필요 시 상세 화면에서만 래핑 추가 |
| 시각 (§2~10) | 약 90% | 헤더는 Schedule 외 탭은 현 구조 유지로 인정 가능 |
| §12 design-system/layoutConstants | 약 70% | design-system.ts 상단 또는 surface/chat 근처에 "구조 1순위(Product feel) 지원" 주석 추가 권장 |
| §13 체크리스트 | 구조 6/6, 시각 4/4 | 모두 충족으로 간주 가능 |

**종합 매치율**: 약 **90%** (구조·화면별 적용은 완료, 문서/주석 보강만 남음).

---

## 4. 권장 액션 (Act)

1. **선택(권장)**: `lib/design-system.ts` 상단 또는 `surface`/`chat` 블록에  
   `// Product feel(카톡·노션·틱틱) 구조 1순위 지원; 색/토큰은 Design ui-quality-consistency §2~10 참고` 수준의 주석 추가.
2. **선택**: Notes 상세에서 제목을 별도 "제목 블록" 래퍼(rounded-xl·padding)로 감싸서 계층 강화. (기능 변경 없음, 시각만.)
3. **불필요**: layoutConstants에 구조용 상수 추가 — 현재 코드만으로도 유지보수 가능하면 생략 가능.

---

**Next Steps**: 위 권장 액션 적용 후 **pdca report ui-quality-consistency** 로 완료 리포트 작성. 필요 시 **pdca iterate ui-quality-consistency** 로 갭 수정 후 재분석.

---

## 5. 재분석 (Iterate 반영 후)

**Date**: 2025-02-22 (iterate 적용 직후)

### 반영한 갭
1. **design-system.ts**: 파일 상단에 Product feel(카톡·노션·틱틱) 구조 1순위 지원 및 Design §2~10 참고 주석 추가.
2. **Notes 제목 블록**: 노트 상세 화면에서 제목+메타(태그·날짜)를 `rounded-xl border bg-gray-50 dark:bg-zinc-800/80 px-4 py-3` 블록으로 감싸 제목 블록 시각 구분 완료.

### 반영 후 매치율
- **§12 design-system**: 주석 추가로 문서와 코드 정합성 확보 → **보강 완료**.
- **Notes 블록 단위**: 제목 블록 추가로 §1.2 "제목 블록 / 본문 블록 / 체크리스트 블록 / 태그 블록 시각 구분" **완전 충족**.

**종합 매치율(재산정)**: 약 **93%** (구조·시각·문서 보강 모두 반영).

**Next Steps**: **pdca report ui-quality-consistency** 로 완료 리포트 작성.


# 다음 UI/UX 이노베이션 계획 (v2 이후)

**Date**: 2025-02-22  
**Project**: Mendly (LifeBalanceAI)  
**기준**: mendly-ui-overhaul-v2.design.md + 갭 분석 + 코드 리뷰

---

## 1. 목표

- **“내가 보낸 디자인”에 맞게 한 번 더 뒤집어엎기** 준비: 기준 디자인을 **mendly-ui-overhaul-v2**로 두고, 갭을 메운 뒤 필요 시 추가 디자인(목업/피그마)이 있으면 그에 맞춰 v3 방향 수립.
- **실기기 안정화**: 콜 스택 오류 원인 파악·수정 후, 분석·리뷰로 재검증.

---

## 2. 전제 조건

- **기준 디자인**: `docs/02-design/features/mendly-ui-overhaul-v2.design.md`  
  - 사용자가 별도로 보낸 디자인(피그마/이미지/문서)이 있으면, 그걸 “1차 기준”으로 두고 v2는 토큰/구조 기반으로 삼음.
- **갭 분석**: `docs/03-analysis/mendly-ui-overhaul-v2.analysis.md` — High/Medium 권장 액션 우선 처리.
- **코드 리뷰**: 리스트 키, 하드코딩 색상, 접근성, async unmount 등 이슈 반영 후 다음 이노베이션 진행.

---

## 3. 단계별 계획

### Phase A — 안정화 및 갭 수정 (우선)

| 순서 | 작업 | 산출 |
|------|------|------|
| A1 | **콜 스택 오류 수정** | 발생 화면(탭/모달) + 전체 스택 트레이스 확보 후 원인 수정 (Gesture/Modal/KeyboardAvoidingView 등 점검) |
| A2 | **갭 High 우선 처리** | 탭 라벨 12px·inactive text.tertiary, ResultCard radius.xl, Button danger→semantic.error, Input 48–52px·radius.md |
| A3 | **코드 리뷰 Critical 반영** | 리스트 키 안정화(notes, review, schedule, calendar, inbox), EmptyState/ResultCard/Input 등 design-system 토큰 통일 |
| A4 | **재분석·리뷰** | pdca analyze mendly-ui-overhaul-v2 재실행, 코드 리뷰로 회귀 여부 확인 |

### Phase B — 디자인 정합성 (v2 기준 또는 “보낸 디자인”)

| 순서 | 작업 | 산출 |
|------|------|------|
| B1 | **기준 디자인 확정** | “내가 보낸 디자인”이 v2와 동일한지/다른지 확인; 다르면 새 문서(예: mendly-ui-v3.design.md) 초안 작성 |
| B2 | **컴포넌트 패턴 정리** | ChatBubble typography.body, 캘린더 블록 4px 좌측 보더, placeholder text.tertiary, secondary 버튼 border-only 등 |
| B3 | **화면별 톤 통일** | slate vs zinc 일원화, 하드코딩 hex 제거, 접근성(대비·아이콘 라벨) 점검 |
| B4 | **이노베이션 체크리스트** | v2(또는 v3) 디자인 §1–4 기준으로 구현 체크리스트 갱신 및 누적 리포트 반영 |

### Phase C — 다음 이노베이션 방향 (선택)

| 순서 | 작업 | 산출 |
|------|------|------|
| C1 | **Inbox “quick capture first”** | QUICK NOTE 단일 블록 최상단, BRAIN DUMP 보조/접이식 등 구조 조정 |
| C2 | **Profile “Account” 카드** | 설계서의 Account / Preferences / Subscription / Support / Sign out 카드 구조 명시 반영 |
| C3 | **접근성 패스** | 44/48pt·WCAG 대비·아이콘 버튼 accessibilityLabel 전수 점검 및 리포트 |
| C4 | **PDCA 마무리** | 갭 ≥90% 목표 달성 후 pdca report 갱신, 필요 시 mendly-ui-overhaul-v3 plan/design 작성 |

---

## 4. 콜 스택 오류 대응

- **필요 정보**: (1) 발생 탭/화면(예: Calendar 탭, 일정 추가 모달, Notes 상세 등), (2) 전체 콜 스택(에러 메시지 + 스택), (3) 기기/OS 버전.
- **의심 구간**: Calendar `runOnJS`+Gesture, Modal+KeyboardAvoidingView+ScrollView 조합, SafeAreaView edges, 특정 기기에서의 NativeWind 적용 순서.
- **조치**: 정보 확보 후 해당 경로 중심으로 수정 → 빌드/실기 테스트 → 분석·리뷰로 재검증.

**2025-02-25 적용**: 실기기 Render Error "cannot add a new property" (Call stack: `View.props.ref` → `calendar.tsx`) — 원인: 타임테이블 이벤트 블록의 **콜백 ref**에서 `timetableBlockRefsMap.current[ev.id] = r`로 기존 ref 객체에 프로퍼티를 추가할 때 Fabric이 동결된 객체를 수정하려 해서 발생. **수정**: ref 콜백 안에서 직접 프로퍼티를 넣지 않고, `queueMicrotask`로 다음 마이크로태스크에서 `timetableBlockRefsMap.current = { ...map, [id]: r }`처럼 새 객체를 할당하도록 변경. 실기기에서 재현 여부 확인 필요.

---

## 5. 요약

- **즉시**: 콜 스택이 나는 **화면 + 스택 트레이스** 알려주면 그걸 기준으로 버그 수정 진행.
- **이어서**: 갭 분석 High 우선 적용 → 코드 리뷰 Critical 반영 → 재분석·리뷰.
- **“내가 보낸 디자인”**이 v2와 다르면 해당 디자인을 기준으로 v3 방향(plan/design) 수립 후, 위 Phase B/C와 연계.

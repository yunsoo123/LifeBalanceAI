# 캡처·스케줄 통합 + To-Do 리뉴얼 — Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)

---

## Overview

다음 세 가지를 한 번에 다루는 **기능 리뉴얼**이다.

1. **앱이 너무 무겁지 않게** — 탭·화면 수 감소, 불필요한 중복 제거, 성능·번들 고려  
2. **인박스 + 스케줄을 하나로** — 캡처(빠른 입력)와 AI 일정 생성을 한 화면에서; 인박스 탭 제거 방향  
3. **To-Do 추가 + 배치 선택** — 일정/할 일 생성 시 「일정만 / To-Do만 / 둘 다」 선택 가능

---

## 1. 해석 (의도 정리)

| 사용자 요청 | 표면 | 실제 의도 |
|-------------|------|-----------|
| 앱이 무겁지 않았으면 | 번들/체감 속도 | 탭·화면 줄이기, 한 곳에서 캡처·일정까지 처리해 구조 단순화 |
| 인박스/스케줄 합치기 (인박스 삭제 OK) | 두 탭 병합 | **한 탭**에서: 머릿속 덤프 → (선택) AI로 구조화 → 일정/To-Do로 보내기 |
| To-Do 추가, 일정 생성 시 선택 | 할 일 목록 + 유연한 배치 | **생성 시점**에 「일정에만 / To-Do에만 / 둘 다」 선택 가능하게 |

---

## 2. 전제 조건

- 기존 **Calendar**, **Notes**, **Review**, **Profile** 탭은 유지 (범위 밖).
- **Schedule** 탭의 AI 채팅·주간 일정 생성 기능은 유지하되, **진입점**을 “통합 캡처 탭”으로 옮길 수 있음.
- **To-Do**는 새 개념: DB에 저장할 수 있는 “할 일” 엔티티가 필요 (테이블 추가 또는 기존 `goals`/notes 구조 확장 검토).

---

## 3. 현재 구조 (요약)

- **탭**: Inbox → Schedule → Calendar → Notes → Review → Profile (6개)  
- **Inbox**: 빠른 입력(quick-add) + 엔트리 목록, Parse → 노트 저장 / 캘린더 추가 (parse-schedule, auto-schedule API)  
- **Schedule**: AI 채팅으로 주간 스케줄 생성 → 결과 카드 → “캘린더에 추가”  
- **Calendar**: 이벤트 표시·편집, 스케줄 import  
- **DB**: `events`, `schedules`, `notes`, `goals` 등 — 별도 **todos** 테이블은 없음 (notes 내부 `tasks`만 존재)

---

## 4. 목표 구조 (v1 리뉴얼)

### 4.1 탭 구성

- **Before**: Inbox | Schedule | Calendar | Notes | Review | Profile  
- **After**: **Capture** | Calendar | Notes | Review | Profile (5개)  
  - **Capture** = 기존 Inbox + Schedule를 하나로 합친 탭 (이름은 Design에서 확정: “Capture”, “Plan”, “일정” 등)

### 4.2 Capture 탭 (통합)

- **상단**: 빠른 입력 한 줄 (기존 Inbox quick-add 유지) + (선택) “AI로 주간 일정 만들기” 진입 버튼  
- **흐름 A — 빠른 캡처**  
  - 입력 → (선택) Parse → **배치 선택**: 「일정만 / To-Do만 / 둘 다」 → 저장  
- **흐름 B — AI 주간 일정**  
  - 기존 Schedule 탭과 동일: 채팅 → 주간 스케줄 결과 → “캘린더에 추가” 시 **배치 선택** 확장: 「일정만 / To-Do만 / 둘 다」  
- **Inbox 전용 엔트리 목록**은 제거하거나, “최근 캡처” 등 짧은 리스트로 축소 (Design에서 결정)

### 4.3 To-Do

- **저장**: 새 테이블 `todos` (또는 기존 구조 확장) — Design에서 스키마·RLS 정의  
- **표시**: 별도 “To-Do” 탭을 둘지, Calendar/Notes 안에 “할 일” 섹션으로 둘지 Design에서 결정  
- **생성 시 선택**  
  - 일정 생성(캘린더 이벤트 추가) 시: “일정만 / To-Do만 / 둘 다” 중 선택  
  - 동일 UX를 “캡처 → Parse 후 저장” 흐름에도 적용

### 4.4 경량화

- 탭 1개 제거 → 초기 로드·탭 전환 부담 감소  
- Inbox 전용 복잡한 엔트리 목록·버튼 조합 정리 → 코드·번들 축소  
- 새 기능(To-Do)은 필요한 범위만 추가해 “무겁게” 확장하지 않기

---

## 5. Success Criteria

- [ ] 탭이 5개가 되고, Inbox 탭이 사라졌다.  
- [ ] “Capture”(또는 동일 목적의 이름) 탭에서 빠른 입력 + (선택) Parse 후 **일정만 / To-Do만 / 둘 다** 중 선택해 저장할 수 있다.  
- [ ] 동일 탭에서 “AI 주간 일정 만들기”를 시작할 수 있고, 결과에 대해 **일정만 / To-Do만 / 둘 다** 중 선택해 반영할 수 있다.  
- [ ] To-Do 항목이 DB에 저장되고, 사용자가 목록을 보고 완료 처리할 수 있다 (표시 위치는 Design에서 결정).  
- [ ] 기존 Calendar, Notes, Review, Profile 동작이 깨지지 않는다.  
- [ ] (선택) 앱 체감 무게/로딩이 개선되거나 악화되지 않는다.

---

## 6. 리스크·미정 사항

- **To-Do 테이블**: 새로 만들지, `goals` 또는 notes 구조를 확장할지 Design 단계에서 결정.  
- **진입 경로**: 로그인 후 첫 리다이렉트가 현재 `/(tabs)/inbox` → `/(tabs)/capture`(또는 통합 탭 이름)로 변경 필요.  
- **기존 Inbox 데이터**: 세션/로컬만 쓰는지, 서버에 엔트리가 있는지 확인 후 마이그레이션/무시 정책 Design에서 정의.

---

## 7. Next Steps

1. **Design** 작성: `docs/02-design/features/capture-schedule-todo-renewal.design.md`  
   - Capture 탭: 레이아웃, 빠른 입력 + Parse + 배치 선택 UI, AI 주간 일정 진입·결과 카드·배치 선택  
   - To-Do: 데이터 모델(테이블/스키마), RLS, 목록/완료 UI 위치(탭 vs Calendar/Notes 내)  
   - API: parse-schedule / auto-schedule 재사용, To-Do CRUD, “둘 다” 시 일정+To-Do 동시 생성  
   - 경량화: 제거할 Inbox 전용 코드·화면, 리다이렉트 경로 변경  
2. Design 확정 후 **Do**: DB 마이그레이션(필요 시), Capture 탭 구현, To-Do 구현, Inbox 제거·리다이렉트 수정  
3. **Check** → **Act** → **Report**

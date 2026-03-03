# Mendly — Docs Index

**최신화**: 2026-02-22

문서 구조와 PDCA 산출물 위치. **활성 계획**은 아래 "현재 참고 문서"만 보면 됨.

---

## 현재 참고 문서 (활성)

| 문서 | 설명 |
|------|------|
| **01-plan/features/future-improvements.plan.md** | 추후 개선사항 브레인스토밍·우선순위 (미완 항목, UX, 기능, 품질). |
| **01-plan/features/real-device-feedback-round3.plan.md** | 실기기 피드백 3차 — 9건 해석·방안·우선순위. |
| **01-plan/features/calendar-tap-date-shows-timetable.plan.md** | 캘린더 월 그리드 날짜 탭 시 타임테이블 전환 (구현 완료). |
| **02-design/features/todo-categories-due-date-recurrence.design.md** | TO-DO 마감일·카테고리·반복 UI 스펙. |
| **02-design/design-system.md** | 디자인 토큰·컴포넌트 규칙. |
| **07-launch/deployment-checklist.md** | 배포 체크리스트 (있을 경우). |

---

## PDCA (기능 단위)

| 단계 | 경로 | 설명 |
|------|------|------|
| **Plan** | `01-plan/features/*.plan.md` | 목표, 범위, 성공 기준 |
| **Design** | `02-design/features/*.design.md` | 아키텍처, API, 컴포넌트, 에러 처리 |
| **Analysis** | `03-analysis/*.analysis.md`, `*.code-review.md` | 설계 대비 구현 격차, 코드 리뷰 |
| **Report** | `04-report/features/*.report.md` | 완료 리포트 |

- **Templates**: `templates/` — plan, design, analysis, report 템플릿.
- 완료된 기능은 **04-report**만 참고하면 됨. plan/design/analysis는 과거 이력용.

---

## 완료된 기능 (Report만 참고)

| 기능 | Report |
|------|--------|
| event-edit-ux | 04-report/features/event-edit-ux.report.md |
| feedback-toast | 04-report/features/feedback-toast.report.md |
| weekly-review | 04-report/features/weekly-review.report.md |
| calendar-drag-edit | 04-report/features/calendar-drag-edit.report.md |
| notion-style-notes | 04-report/features/notion-style-notes.report.md |
| empty-states-consistency | 04-report/features/empty-states-consistency.report.md |
| mendly-ui-overhaul-v2 | 04-report/features/mendly-ui-overhaul-v2.report.md |
| ui-quality-consistency | 04-report/features/ui-quality-consistency.report.md |
| ux-convenience-p0-p2 | 04-report/features/ux-convenience-p0-p2.report.md |
| calendar-event-ux-and-day-time-fix | 04-report/features/calendar-event-ux-and-day-time-fix.report.md |
| inbox-one-tap-calendar | 04-report/features/inbox-one-tap-calendar.report.md |
| ux-simplify-and-monetization | 04-report/features/ux-simplify-and-monetization.report.md |

---

## 기타

| 구분 | 경로 | 설명 |
|------|------|------|
| **Design system** | `02-design/design-system.md` | 디자인 토큰, 컴포넌트 규칙 |
| **Legal** | `legal/` | 개인정보처리방침, 이용약관 등 |
| **Launch** | `07-launch/deployment-checklist.md` | 배포 체크리스트 |
| **Foundation** | `00-evaluation/`, `01-plan/*.md` (schema, tech-stack 등) | 스키마·용어·기술 스택 |
| **Prompts** | `prompts/` | 디자인/리팩터링용 프롬프트 |

---

## Archive (과거·통합된 문서)

| 폴더 | 내용 |
|------|------|
| **archive/phase-reports/** | Phase 4~7, final-autonomous 보고서 |
| **archive/status/** | 구 05-status 문서 |
| **archive/design-legacy/** | 구 design 레거시 |
| **archive/feedback-rounds/** | 실기기 피드백 1차·2차 계획 (3차·future-improvements로 대체) |

필요 시 참고용으로만 사용.

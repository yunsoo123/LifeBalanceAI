# Design: Schedule 대화형 UI (2단 + 5-Step Q&A)

**Plan**: [schedule-conversational-ui.plan.md](../../01-plan/features/schedule-conversational-ui.plan.md)

---

## 목표

- 목업과 동일: **왼쪽 CORE FEATURE 01 설명**, **오른쪽 채팅 + 현실성 검증 + 결과 카드 + CTA**.
- 멀티턴 대화로 5-Step Q&A 후 일정 생성, 현실성 검증 배지("번아웃 위험 없음") 노출.

---

## 1. UI 구조

### 1.1 레이아웃

- **데스크/태블릿(넓은 폭)**: 좌측 고정 패널(예: 280~320px) + 우측 채팅·결과 영역.
- **모바일(좁은 폭)**: 
  - **Option A**: 왼쪽 패널 접기 버튼(햄버거/제목 탭) → 열면 오버레이 또는 상단 스택.
  - **Option B**: 항상 상단에 CORE FEATURE 01 블록(접을 수 있는 섹션), 아래 채팅·결과.

### 1.2 왼쪽 패널 (LeftPanel)

| 요소 | copy (KO) | copy (EN, optional) |
|------|-----------|----------------------|
| 헤더 | CORE FEATURE 01 | same |
| 제목 | AI 대화형 일정 생성 | AI Conversational Schedule |
| 부제 | Brain Dump to Structured Plan | same |
| 불릿 1 | 나 앱개발이랑 알바하고 싶은데… / 친구에게 말하듯 편하게 이야기하세요. 복잡한 시간 계산은 AI가 처리합니다. | Speak as to a friend; AI handles time math. |
| 불릿 2 | 자연어 & 음성 입력 / Whisper API를 활용한 음성 인식으로, 타이핑 없이 생각나는 대로 말하면 자동 인식됩니다. | Natural language & voice input (Whisper). |
| 불릿 3 | 5-Step 스마트 질의응답 / 모호한 일정은 AI가 역으로 질문하여(Few-shot prompting) 구체적인 계획으로 다듬습니다. | 5-Step smart Q&A; AI refines vague plans. |
| 불릿 4 | 현실성 체크 (Reality Check) / "잠은 언제 자나요?" 총 활동 시간과 수면 시간을 분석해 번아웃을 방지합니다. | Reality check: sleep & activity analysis. |

아이콘: 말풍선, 마이크, 물음표, 저울(밸런스) 등 목업과 유사하게.

### 1.3 오른쪽 패널 (RightPanel)

- **Header**: "Mendly" + 보라 점 + "Online".
- **ChatThread**: `messages[]`를 순서대로 ChatBubble로 렌더. user=보라, assistant=다크 그레이.
- **RealityCheckBadge**: `schedule`이 있고 `schedule.feasible === true` → 녹색 체크 + "번아웃 위험 없음". `feasible === false` → 경고 + "번아웃 위험". 일정 없으면 비표시 또는 회색 "검증 대기".
- **InputCard**: 기존과 동일. placeholder "친구에게 말하듯 입력 · 5단계 Q&A로 현실적인 일정을 만들어요.", 전송 시 `messages`에 user 추가 후 API 호출.
- **ResultCard**: 기존 컴포넌트. `schedule` 있을 때만 표시. 112h/168h, Safe, 여유 시간, "캘린더에 등록하기" CTA.
- **Activity list**: 기존처럼 활동 목록 카드(선택).
- **CTA**: "캘린더에 등록하기" (보라) → 기존 `addToCalendar` 플로우.

---

## 2. 컴포넌트 트리

```
ScheduleScreen
├── (반응형) LeftPanel | 상단 스택
│   ├── CoreFeatureHeader ("CORE FEATURE 01")
│   ├── Title + Subtitle
│   └── FeatureBulletList
│       └── FeatureBullet × 4 (icon + title + body)
├── RightPanel (또는 메인 영역)
│   ├── RightHeader (Mendly, Online)
│   ├── ScrollView (채팅 + 결과)
│   │   ├── ChatThread
│   │   │   └── ChatBubble (user | assistant) × N
│   │   ├── RealityCheckBadge (feasible | risk | none)
│   │   ├── InputCard (TextInput + 전송 버튼)
│   │   ├── ResultCard (schedule 있을 때)
│   │   └── ActivityList (선택)
│   └── CTA "캘린더에 등록하기"
```

- **재사용**: `ChatBubble`, `ResultCard`, 기존 Button/EmptyState.
- **신규**: `LeftPanel`, `RealityCheckBadge`, `ChatThread`(또는 인라인 map).

---

## 3. 데이터·상태

| 상태 | 타입 | 설명 |
|------|------|------|
| messages | `{ role: 'user'|'assistant', content: string }[]` | 대화 기록. user 전송 시 append, API 응답 시 assistant append. |
| schedule | `ScheduleResult \| null` | 최종 일정. API가 `type: 'schedule'` 반환 시 설정. |
| loading | boolean | API 호출 중. |
| error | string | 에러 메시지. |
| leftPanelCollapsed | boolean (optional) | 좁은 화면에서 왼쪽 패널 접힘. |

**메시지 추가 규칙**:

- 사용자 전송 시: `messages.push({ role: 'user', content: input })` 후 API 호출.
- API 응답 `question`: `messages.push({ role: 'assistant', content })`, schedule 유지 또는 null.
- API 응답 `schedule`: `messages.push({ role: 'assistant', content: 안내 문구 })`, `setSchedule(data)`.

---

## 4. API

### 4.1 단일 엔드포인트 (권장)

- **URL**: 기존 `POST /api/schedule/generate` 확장 또는 `POST /api/schedule/chat`.
- **Request body** (Zod 검증):

```ts
{ messages: { role: 'user'|'assistant', content: string }[] }
```

- **Response** (Zod 검증):

```ts
| { type: 'question', content: string }
| { type: 'schedule', data: ScheduleResult }
```

- **ScheduleResult**: 기존과 동일 (`activities`, `totalHours`, `feasible`, `suggestions`).
- **Rate limit**: `type: 'schedule'` 반환 시에만 usage 증가 (일정 생성 1회로 간주).
- **에러**: 400(잘못된 body), 429(한도 초과), 500 → 클라이언트에서 메시지 + 재시도 버튼.

### 4.2 대안: 2단계 엔드포인트

- `POST /api/schedule/clarify`: messages → question만 반환.
- `POST /api/schedule/generate`: messages → schedule 반환.  
→ 구현 복잡도 증가하므로 1단계 우선 권장.

---

## 5. 현실성 검증·결과 카드 copy

| 상황 | copy (KO) | copy (EN) |
|------|-----------|-----------|
| feasible true | 번아웃 위험 없음 | No burnout risk |
| feasible false | 번아웃 위험 | Burnout risk |
| 일정 없음 | (비표시 또는 "검증 대기") | (same) |

ResultCard, CTA 문구는 기존 유지: "스케줄 생성 완료!", "활동 시간 분석 · 현실성 체크 완료", "여유 시간 N시간이 확보되었습니다.", "캘린더에 등록하기".

---

## 6. 에러 처리

- **네트워크/5xx**: 인라인 에러 메시지 + "다시 시도" 버튼. 선택: assistant 스타일 메시지로 "일시적 오류입니다. 잠시 후 다시 시도해 주세요." 추가.
- **400**: "입력이 올바르지 않습니다." 등 짧은 메시지.
- **429**: "요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
- **응답 JSON 불일치**: Zod 실패 시 위와 동일 처리.

---

## 7. 접근성

- 터치 타깃: 최소 44×44pt (iOS), 48×48dp (Android).
- `accessibilityLabel`: 전송 버튼, "캘린더에 등록하기", ResultCard, RealityCheckBadge.
- 포커스 순서: 입력창 → 전송 → (결과 시) CTA.

---

## 8. 적용 순서

1. **API**: 멀티턴 요청/응답 스키마 및 엔드포인트 구현 (Zod, question | schedule).
2. **schedule-generator (lib/ai)**: 대화 기록 받아 질문 또는 일정 반환 로직.
3. **레이아웃**: ScheduleScreen 2단(또는 모바일 스택) + 반응형 분기.
4. **LeftPanel**: CORE FEATURE 01 + 4 bullets, i18n.
5. **상태 + ChatThread + RealityCheckBadge**: messages, schedule, RealityCheckBadge 컴포넌트.
6. **ResultCard + CTAs**: 기존 플로우 유지, "캘린더에 등록하기" 연결.
7. **에러·로딩·접근성**: 메시지, 스피너, accessibilityLabel.

---
**Next Steps**: Do 단계에서 위 순서대로 구현 후, analyze로 설계 대비 구현 비교.

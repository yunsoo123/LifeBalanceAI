# Notion-style Notes — Design

**Date**: 2025-02-25  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [notion-style-notes.plan.md](../../01-plan/features/notion-style-notes.plan.md)

---

## Overview

노트 목록·편집·검색·태그·일정 연결·AI 보강이 구현된 Notes 화면의 현재 스펙을 정리하고, 이번 사이클에서 **성공 피드백 토스트** 및 **주요 라벨 i18n**을 적용한다.

---

## 현재 구현 (as-is)

### 데이터

- **notes** 테이블: id, user_id, title, content, tags (text[]), event_id (FK → events, nullable), created_at, updated_at.
- **Note** (클라이언트): id, title, content, tags, linked_event_ids (event_id를 1개만 저장하므로 길이 0 또는 1), created_at, updated_at.

### UI 구조

- **사이드바**: 제목 "노트", [+ New], 검색 Input, FlatList(노트 카드: 제목, 내용 요약, 태그, 연결 일정 뱃지, 수정일).
- **에디터 영역**: 선택 시 커버 밴드, Last edited, Cancel/Save 또는 Back·Edit·Delete. 편집 시: 제목 Input, 본문 TextInput(멀티라인), Tags Input, Linked Events (+ Link Event → 이벤트 선택 모달). 뷰 모드: 제목, 태그, 연결된 일정, AI 요약(Enhance 버튼), NoteBodyView(문단/체크리스트/코드블록).

### 동작

- **로드**: loadNotes() — user별 notes 최신순.
- **생성**: createNewNote() — insert 후 선택·편집 모드.
- **저장**: saveNote() — update title, content, tags; 성공 시 Alert "Saved" (→ 토스트로 변경).
- **삭제**: deleteNote() → 확인 Alert → performDeleteNote(); 성공 시 Alert "Deleted" (→ 토스트로 변경).
- **일정 연결**: toggleEventLink(eventId) — event_id 단일 갱신; 모달에서 이벤트 선택.
- **AI 보강**: generateAISuggestions() — POST /api/note/enhance, 응답으로 summary/actionItems/improvements 표시.

### NoteBodyView

- 본문 content를 줄 단위로 파싱: 문단(para), 체크(- [ ] / - [x]), 코드블록(```). 표시만 담당.

---

## 이번 사이클 적용

- **성공 토스트**: 저장 성공·삭제 성공 시 Alert 제거 → useToastContext().showSuccess.
- **i18n**: 저장/삭제 성공 문구, (선택) 버튼 라벨(New, Save, Cancel, Edit, Delete, Link Event 등)을 t.notes.* 로 통일. 기존 t.notes 키가 있으면 재사용.

---

## 에러·경계

- 로드/저장/삭제 실패: 기존처럼 Alert 유지.
- 로그인 없음: create 시 Alert + Sign in 이동.

---

## 체크리스트

- [ ] 저장 성공 → showSuccess (Alert 제거).
- [ ] 삭제 성공 → showSuccess (Alert 제거).
- [ ] (선택) 노트 화면 주요 라벨 i18n.

---

**Next Steps**: Do — notes.tsx에 useToastContext 적용, 필요 시 t.notes 확장.

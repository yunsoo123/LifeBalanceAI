# 코드 리뷰 수정 계획 (PDCA)

**날짜**: 2025-02-22  
**프로젝트**: Mendly (LifeBalanceAI)  
**근거**: PDCA code-analyzer 리뷰 결과 (Critical 4건, Warnings 8건)

---

## 1. 우선 수정 (Critical)

| # | 항목 | 조치 | 상태 |
|---|------|------|------|
| 1 | AI 응답 미검증 (insights, enhance API) | insights+api, enhance+api에 Zod 스키마로 파싱·검증, 실패 시 fallback/500 | 적용 |
| 2 | AI 토큰 사용량 미로그 | schedule-generator, note-parser에서 response.usage 로깅 | 적용 |
| 3 | ErrorBoundary 미사용 | _layout.tsx 루트에 ErrorBoundary 래핑 | 적용 |
| 4 | Rate limiting 클라이언트만 | 서버 API에서 한도 적용은 인증·DB 연동 후 별도 작업 권장 (본 계획에서는 문서화만) | 보류 |

---

## 2. 수정 권장 (Warnings)

| # | 항목 | 조치 | 상태 |
|---|------|------|------|
| 5 | key={index} / key={idx} | schedule: activity.name+index; review: insight+idx | ✅ 적용 |
| 6 | Lint 실패 | npm run lint --fix 후 남는 항목 수정 (exhaustive-deps, no-console, no-unused-vars) | ✅ 적용 |
| 7 | review.tsx 타입 단언 (completed) | events Row에 completed 없음 → 타입 가드 사용 | ✅ 적용 |
| 8 | API 요청 바디 Zod 미사용 | generate+api, parse+api 요청 스키마 추가 | ✅ 적용 |
| 9 | note-parser 재시도 없음 | schedule-generator와 동일한 3회 재시도·백오프 추가 | ✅ 적용 |
| 10 | Supabase env 단언 | URL/Key 누락 시 명시적 throw | ✅ 적용 |
| 11 | types/index.ts 없음 | 앱 타입(Schedule, ParsedNote, Database) 재export | ✅ 적용 |

---

## 3. 적용 순서

1. Zod 검증 (insights+api, enhance+api)  
2. 토큰 로깅 (schedule-generator, note-parser)  
3. ErrorBoundary 루트 래핑  
4. 안정 키 (schedule, review)  
5. review 타입 가드  
6. API 요청 Zod (generate, parse)  
7. note-parser 재시도  
8. Supabase env 검사  
9. types/index.ts  
10. Lint --fix 및 잔여 수정  

---

## 4. 비적용·보류

- **Rate limiting 서버**: API 라우트에서 사용자 식별·DB 사용량 조회 후 429 반환은 인증/세션 연동 후 별도 이슈로 진행 권장.
- **인라인 스타일 일괄 제거**: design-system 상수로 대체는 점진적으로 진행 (본 계획 범위 외).

---

**다음 단계**: 수정 적용 후 `npx tsc --noEmit`, `npm run lint` 재실행. 필요 시 pdca analyze 재실행.

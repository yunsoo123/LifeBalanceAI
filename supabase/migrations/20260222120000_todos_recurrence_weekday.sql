-- TO-DO 매주 O 요일 (real-device-feedback-round3 Phase B #2)
-- Design: docs/02-design/features/todo-weekly-weekday.design.md

ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_weekday SMALLINT;
COMMENT ON COLUMN todos.recurrence_weekday IS 'When recurrence=weekly: 0=Mon .. 6=Sun';

-- TO-DO 카테고리·반복 (real-device-feedback-round2)
-- Design: docs/02-design/features/todo-categories-due-date-recurrence.design.md

ALTER TABLE todos ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence TEXT;

CREATE INDEX IF NOT EXISTS idx_todos_user_category ON todos(user_id, category);

COMMENT ON COLUMN todos.category IS 'User-defined category label e.g. 운동, 프로젝트1, 공부';
COMMENT ON COLUMN todos.recurrence IS 'Recurrence: daily, weekly, monthly, or null';

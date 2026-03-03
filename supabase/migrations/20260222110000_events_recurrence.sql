-- Event recurrence (real-device-feedback-round3 §4-2, future-improvements F1)
-- Design: docs/02-design/features/event-recurrence.design.md

ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence TEXT;
COMMENT ON COLUMN events.recurrence IS 'Recurrence: daily, weekly, monthly, or null';

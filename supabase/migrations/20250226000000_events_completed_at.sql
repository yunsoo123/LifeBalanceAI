-- Add completed_at to events for Review "완료" toggle and achievement rate
ALTER TABLE events
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN events.completed_at IS 'When the user marked this event as completed (e.g. from Review). Used for weekly completed_events count.';

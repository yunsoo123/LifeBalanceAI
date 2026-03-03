-- Event achievement percent (real-device-feedback-round3 Phase B #7)
-- Design: docs/02-design/features/achievement-goal-review.design.md

ALTER TABLE events ADD COLUMN IF NOT EXISTS achievement_percent SMALLINT;
COMMENT ON COLUMN events.achievement_percent IS '0-100, user-set achievement for this event';

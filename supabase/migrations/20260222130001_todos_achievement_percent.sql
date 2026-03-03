-- Todo achievement percent (real-device-feedback-round3 Phase B #7)
-- Design: docs/02-design/features/achievement-goal-review.design.md

ALTER TABLE todos ADD COLUMN IF NOT EXISTS achievement_percent SMALLINT;
COMMENT ON COLUMN todos.achievement_percent IS '0-100, user-set achievement for this todo';

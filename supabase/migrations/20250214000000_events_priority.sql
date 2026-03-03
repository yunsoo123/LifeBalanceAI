-- Add priority to events (1=highest, 5=lowest). TickTick-style today ordering.
ALTER TABLE events
ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5);

COMMENT ON COLUMN events.priority IS '1=highest, 5=lowest; used for today list ordering';

CREATE TABLE IF NOT EXISTS uat_feedback (
 id BIGSERIAL PRIMARY KEY,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 category TEXT NOT NULL CHECK (category IN ('usability','bug','route-data','feature','accessibility','other')),
 rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
 comment TEXT NOT NULL CHECK (char_length(comment) BETWEEN 15 AND 2000),
 device TEXT NOT NULL CHECK (device IN ('mobile','desktop','tablet','other')),
 consent BOOLEAN NOT NULL CHECK (consent = true),
 status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','triaged','resolved','closed'))
);
CREATE INDEX IF NOT EXISTS uat_feedback_created_at_idx ON uat_feedback(created_at DESC);

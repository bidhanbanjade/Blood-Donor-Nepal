BEGIN;

CREATE TABLE IF NOT EXISTS donation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_donor_id ON donation_feedback(donor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_donation_id ON donation_feedback(donation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON donation_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON donation_feedback(created_at DESC);

COMMIT;

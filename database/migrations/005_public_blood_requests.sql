BEGIN;

CREATE TABLE IF NOT EXISTS public_blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  blood_type VARCHAR(5) NOT NULL,
  urgency VARCHAR(20) NOT NULL DEFAULT 'high' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  units_needed INTEGER NOT NULL DEFAULT 1 CHECK (units_needed > 0),
  city VARCHAR(100),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_blood_requests_status ON public_blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_public_blood_requests_blood_type ON public_blood_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_public_blood_requests_created_at ON public_blood_requests(created_at DESC);

COMMIT;

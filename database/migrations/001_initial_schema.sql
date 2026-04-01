BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone VARCHAR(30),
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'hospital', 'blood_bank', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blood_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  contact_phone VARCHAR(30),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  blood_type VARCHAR(5) NOT NULL,
  date_of_birth DATE,
  last_donation_date DATE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  city VARCHAR(100),
  is_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_phone VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_bank_id UUID NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
  blood_type VARCHAR(5) NOT NULL,
  units_available INTEGER NOT NULL DEFAULT 0 CHECK (units_available >= 0),
  availability_flag BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blood_bank_id, blood_type)
);

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  blood_bank_id UUID NOT NULL REFERENCES blood_banks(id) ON DELETE RESTRICT,
  blood_type VARCHAR(5) NOT NULL,
  donation_date DATE NOT NULL,
  units_donated INTEGER NOT NULL DEFAULT 1 CHECK (units_donated > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_bank_id UUID REFERENCES blood_banks(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  blood_type VARCHAR(5) NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  radius_km NUMERIC(8,2) NOT NULL DEFAULT 10,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sent', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_blood_banks_city ON blood_banks(city);
CREATE INDEX IF NOT EXISTS idx_blood_banks_lat_lng ON blood_banks(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_donors_blood_type ON donors(blood_type);
CREATE INDEX IF NOT EXISTS idx_donors_lat_lng ON donors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);

CREATE INDEX IF NOT EXISTS idx_inventory_blood_bank ON inventory(blood_bank_id);
CREATE INDEX IF NOT EXISTS idx_inventory_blood_type ON inventory(blood_type);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(availability_flag);

CREATE INDEX IF NOT EXISTS idx_donations_donor_date ON donations(donor_id, donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_blood_bank_date ON donations(blood_bank_id, donation_date DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_status_urgency ON alerts(status, urgency);
CREATE INDEX IF NOT EXISTS idx_alerts_blood_type ON alerts(blood_type);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

COMMIT;

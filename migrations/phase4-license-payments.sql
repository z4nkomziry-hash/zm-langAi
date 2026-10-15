-- Ziman AI Phase 4: server-side license keys and payment requests
-- Apply to the production PostgreSQL database before deploying Phase 4.
CREATE TABLE IF NOT EXISTS user_packages (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_key VARCHAR(32) NOT NULL,
  activated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, package_key)
);
CREATE TABLE IF NOT EXISTS license_keys (
  id SERIAL PRIMARY KEY,
  key_hash CHAR(64) UNIQUE NOT NULL,
  package_key VARCHAR(32) NOT NULL,
  used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  used_at TIMESTAMP,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  package_key VARCHAR(32) NOT NULL,
  method VARCHAR(40) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS payments_status_created_idx ON payments(status, created_at DESC);

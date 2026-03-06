-- ============================================
-- PHASE 3: Email Alerts Database Schema
-- ============================================

-- Alert Subscriptions Table
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  builder_id UUID REFERENCES builders(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, builder_id)
);

-- Add columns to filings_10k for alert tracking
ALTER TABLE filings_10k 
ADD COLUMN IF NOT EXISTS alert_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alert_sent_at TIMESTAMP;

-- Add columns to earnings_calls for alert tracking
ALTER TABLE earnings_calls
ADD COLUMN IF NOT EXISTS alert_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alert_sent_at TIMESTAMP;

-- Index for alert subscriptions
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_builder ON alert_subscriptions(builder_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_email ON alert_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_active ON alert_subscriptions(is_active);

-- Index for unsent filings
CREATE INDEX IF NOT EXISTS idx_filings_unsent ON filings_10k(alert_sent);

-- Index for unsent earnings calls
CREATE INDEX IF NOT EXISTS idx_earnings_unsent ON earnings_calls(alert_sent);

-- RLS Policies for alert_subscriptions
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view their subscriptions" ON alert_subscriptions
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Allow anyone to create subscriptions
CREATE POLICY "Anyone can create subscriptions" ON alert_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Allow users to manage their own subscriptions
CREATE POLICY "Users can manage their subscriptions" ON alert_subscriptions
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Allow deletion of own subscriptions
CREATE POLICY "Users can delete their subscriptions" ON alert_subscriptions
  FOR DELETE
  USING (auth.jwt() ->> 'email' = email);

-- Public read access to subscription status (for admin dashboard)
CREATE POLICY "Admin can view all subscriptions" ON alert_subscriptions
  FOR SELECT
  USING (
    (SELECT auth.jwt() ->> 'email') = 'admin@builder-research.com'
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_subscriptions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS alert_subscriptions_timestamp ON alert_subscriptions;
CREATE TRIGGER alert_subscriptions_timestamp
  BEFORE UPDATE ON alert_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_subscriptions_timestamp();

-- ============================================
-- Grant permissions for service role
-- ============================================

GRANT ALL ON alert_subscriptions TO authenticated;
GRANT ALL ON alert_subscriptions TO service_role;

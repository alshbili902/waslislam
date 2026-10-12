-- ==============================================================================
-- Wasl Islamic (وصل الإسلامية) - OTP Email Verification System
-- One-time password (OTP) verification challenges for subscribers.
-- Replaces verification links completely with 6-digit numeric OTP codes.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.email_verification_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  normalized_email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  resend_count INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and quick query execution
CREATE INDEX IF NOT EXISTS idx_challenges_email ON public.email_verification_challenges(normalized_email);
CREATE INDEX IF NOT EXISTS idx_challenges_subscriber ON public.email_verification_challenges(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_challenges_expires ON public.email_verification_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.email_verification_challenges(normalized_email, expires_at) 
  WHERE verified_at IS NULL AND invalidated_at IS NULL;

-- Row Level Security (RLS)
ALTER TABLE public.email_verification_challenges ENABLE ROW LEVEL SECURITY;

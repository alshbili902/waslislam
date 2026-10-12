-- ==============================================================================
-- Wasl Islamic (وصل الإسلامية) - Hostinger Email Notification System
-- Independent subscriber-based notifications without user accounts.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  categories JSONB NOT NULL DEFAULT '["daily_islamic"]'::jsonb,
  verification_token_hash TEXT,
  verification_token_expires_at TIMESTAMPTZ,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  manage_token TEXT NOT NULL UNIQUE,
  verified_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Delivery logs table for idempotency and delivery tracking
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed')),
  error_message TEXT,
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Operational failure alerts tracking to prevent alert loops
CREATE TABLE IF NOT EXISTS public.system_alert_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and quick lookup
CREATE INDEX IF NOT EXISTS idx_email_subscribers_normalized_email ON public.email_subscribers(normalized_email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON public.email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_unsubscribe_token ON public.email_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_manage_token ON public.email_subscribers(manage_token);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_verification_token_hash ON public.email_subscribers(verification_token_hash);

CREATE INDEX IF NOT EXISTS idx_delivery_logs_idempotency ON public.notification_delivery_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_sent_date ON public.notification_delivery_logs(sent_date);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_subscriber ON public.notification_delivery_logs(subscriber_id);

CREATE INDEX IF NOT EXISTS idx_system_alert_logs_created ON public.system_alert_logs(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alert_logs ENABLE ROW LEVEL SECURITY;

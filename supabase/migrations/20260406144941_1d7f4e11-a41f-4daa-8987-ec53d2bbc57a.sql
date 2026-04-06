-- Add structured address fields + shipping method name to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS street_address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_detail text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method_name text;

-- Shipping rates table (admin-configured)
CREATE TABLE public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping rates are publicly readable"
  ON public.shipping_rates FOR SELECT
  USING (true);

-- Order notifications event log
CREATE TABLE public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications not publicly accessible"
  ON public.order_notifications FOR SELECT
  USING (false);
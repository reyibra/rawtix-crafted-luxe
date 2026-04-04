-- Orders: allow customers to read their own order by order_number (used in confirmation page)
-- Full admin access will be via service role key
CREATE POLICY "Orders are not publicly accessible" ON public.orders FOR SELECT USING (false);

-- Order items follow order access
CREATE POLICY "Order items are not publicly accessible" ON public.order_items FOR SELECT USING (false);

-- Drop and recreate newsletter policy with slightly better check
DROP POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (email IS NOT NULL AND length(email) > 0 AND length(email) < 256);
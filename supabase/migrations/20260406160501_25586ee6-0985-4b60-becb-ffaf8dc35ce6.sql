
-- Security definer function for guest order lookup
CREATE OR REPLACE FUNCTION public.lookup_order(p_order_number text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'order_number', o.order_number,
    'total', o.total,
    'status', o.status,
    'payment_proof_url', o.payment_proof_url,
    'payment_proof_submitted_at', o.payment_proof_submitted_at
  ) INTO result
  FROM orders o
  WHERE o.order_number = p_order_number;
  
  RETURN result;
END;
$$;

-- Security definer function for payment proof submission
CREATE OR REPLACE FUNCTION public.submit_order_payment_proof(p_order_number text, p_proof_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  SELECT id INTO v_order_id FROM orders WHERE order_number = p_order_number;
  
  IF v_order_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE orders
  SET payment_proof_url = p_proof_url,
      payment_proof_submitted_at = now(),
      payment_method = 'transfer_bca'
  WHERE id = v_order_id;
  
  INSERT INTO order_notifications (order_id, event_type, channel, status)
  VALUES (v_order_id, 'payment_proof_submitted', 'email', 'pending');
  
  RETURN true;
END;
$$;

-- Security definer function for full order creation (transactional)
CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_order_number text,
  p_email text,
  p_phone text,
  p_customer_name text,
  p_address text,
  p_city text,
  p_province text,
  p_district text,
  p_postal_code text,
  p_street_address text,
  p_address_detail text,
  p_special_instructions text,
  p_shipping_method_name text,
  p_subtotal int,
  p_shipping_cost int,
  p_total int,
  p_items jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
BEGIN
  INSERT INTO orders (
    order_number, email, phone, customer_name, address, city, province,
    district, postal_code, street_address, address_detail, special_instructions,
    shipping_method_name, subtotal, shipping_cost, total, status
  ) VALUES (
    p_order_number, p_email, p_phone, p_customer_name, p_address, p_city, p_province,
    NULLIF(p_district, ''), p_postal_code, NULLIF(p_street_address, ''), NULLIF(p_address_detail, ''),
    NULLIF(p_special_instructions, ''), NULLIF(p_shipping_method_name, ''),
    p_subtotal, p_shipping_cost, p_total, 'pending'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, variant_id, product_name, size, price, quantity)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      v_item->>'product_name',
      v_item->>'size',
      (v_item->>'price')::int,
      (v_item->>'quantity')::int
    );
  END LOOP;

  INSERT INTO order_notifications (order_id, event_type, channel, status)
  VALUES (v_order_id, 'order_created', 'email', 'pending');

  RETURN json_build_object('id', v_order_id, 'order_number', p_order_number);
END;
$$;

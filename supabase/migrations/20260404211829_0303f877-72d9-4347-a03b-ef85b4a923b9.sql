-- Add payment proof columns to orders
ALTER TABLE public.orders
ADD COLUMN payment_proof_url text,
ADD COLUMN payment_proof_submitted_at timestamptz;

-- Create payment-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true);

-- Allow public uploads to payment-proofs bucket
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

-- Allow public read of payment proofs
CREATE POLICY "Payment proofs are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');
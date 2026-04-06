import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getAnonClient() {
  const url = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  size: z.string().min(1).max(50),
  price: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  image: z.string().max(1000),
});

const orderInputSchema = z.object({
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(8).max(20).regex(/^[\d\s+\-()]+$/),
  customerName: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1).max(1000),
  province: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  district: z.string().trim().max(100).optional().default(""),
  postalCode: z.string().trim().min(3).max(10).regex(/^[\d\-]+$/),
  streetAddress: z.string().trim().max(500).optional().default(""),
  addressDetail: z.string().trim().max(500).optional().default(""),
  specialInstructions: z.string().max(1000).optional().default(""),
  shippingRateId: z.string().uuid().optional(),
  shippingMethodName: z.string().max(100).optional().default(""),
  shippingCost: z.number().int().min(0).optional().default(0),
  items: z.array(cartItemSchema).min(1).max(50),
});

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RX-${ts}${rand}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderInputSchema.parse(input))
  .handler(async ({ data }) => {
    const client = getAnonClient();
    const orderNumber = generateOrderNumber();
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = data.shippingCost ?? 0;
    const total = subtotal + shippingCost;

    const itemsJsonb = data.items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
    }));

    const { data: result, error } = await client.rpc("create_guest_order", {
      p_order_number: orderNumber,
      p_email: data.email,
      p_phone: data.phone,
      p_customer_name: data.customerName,
      p_address: data.address,
      p_city: data.city,
      p_province: data.province,
      p_district: data.district || "",
      p_postal_code: data.postalCode,
      p_street_address: data.streetAddress || "",
      p_address_detail: data.addressDetail || "",
      p_special_instructions: data.specialInstructions || "",
      p_shipping_method_name: data.shippingMethodName || "",
      p_subtotal: subtotal,
      p_shipping_cost: shippingCost,
      p_total: total,
      p_items: itemsJsonb,
    } as any);

    if (error) {
      console.error("Order creation error:", error);
      throw new Error("Gagal membuat pesanan. Silakan coba lagi.");
    }

    const orderResult = result as any;
    return {
      orderNumber: orderResult.order_number || orderNumber,
      orderId: orderResult.id,
      total,
    };
  });

const paymentProofSchema = z.object({
  orderNumber: z.string().min(1).max(50),
  proofUrl: z.string().url().max(2000),
});

export const submitPaymentProof = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => paymentProofSchema.parse(input))
  .handler(async ({ data }) => {
    const client = getAnonClient();

    const { data: success, error } = await client.rpc("submit_order_payment_proof", {
      p_order_number: data.orderNumber,
      p_proof_url: data.proofUrl,
    } as any);

    if (error || !success) {
      console.error("Payment proof error:", error);
      throw new Error("Gagal menyimpan bukti pembayaran. Silakan coba lagi.");
    }

    return { success: true };
  });

const orderNumberSchema = z.object({
  orderNumber: z.string().min(1).max(50),
});

export const getOrderByNumber = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderNumberSchema.parse(input))
  .handler(async ({ data }) => {
    const client = getAnonClient();

    const { data: result, error } = await client.rpc("lookup_order", {
      p_order_number: data.orderNumber,
    } as any);

    if (error || !result) {
      return null;
    }

    return result as any;
  });

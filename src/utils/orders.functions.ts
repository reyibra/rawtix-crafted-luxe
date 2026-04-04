import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(100),
  province: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(3).max(10).regex(/^[\d\-]+$/),
  specialInstructions: z.string().max(1000).optional().default(""),
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
    const orderNumber = generateOrderNumber();
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        email: data.email,
        phone: data.phone,
        customer_name: data.customerName,
        address: data.address,
        city: data.city,
        province: data.province,
        postal_code: data.postalCode,
        special_instructions: data.specialInstructions || null,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      throw new Error("Gagal membuat pesanan. Silakan coba lagi.");
    }

    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Gagal menyimpan item pesanan. Silakan coba lagi.");
    }

    return {
      orderNumber: order.order_number,
      orderId: order.id,
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
    const { data: order, error: findError } = await supabaseAdmin
      .from("orders")
      .select("id, status, payment_proof_url")
      .eq("order_number", data.orderNumber)
      .single();

    if (findError || !order) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_proof_url: data.proofUrl,
        payment_proof_submitted_at: new Date().toISOString(),
        payment_method: "transfer_bca",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Payment proof update error:", updateError);
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
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("order_number, total, status, payment_proof_url, payment_proof_submitted_at")
      .eq("order_number", data.orderNumber)
      .single();

    if (error || !order) {
      return null;
    }

    return order;
  });

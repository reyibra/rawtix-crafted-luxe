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

    // Insert order
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

    // Insert order items
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
      // Cleanup the order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Gagal menyimpan item pesanan. Silakan coba lagi.");
    }

    return {
      orderNumber: order.order_number,
      orderId: order.id,
      total,
    };
  });

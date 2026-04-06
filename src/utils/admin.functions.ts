import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ─── Admin verification helper ───
async function assertAdmin(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");

  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) throw new Error("Forbidden: not an admin");
  return data.user;
}

const tokenSchema = z.object({ token: z.string().min(1) });

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const user = await assertAdmin(data.token);
    return { id: user.id, email: user.email };
  });

// ─── Dashboard stats ───
export const getAdminDashboardStats = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);

    const [orders, products, pendingOrders, proofOrders] = await Promise.all([
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).not("payment_proof_url", "is", null),
    ]);

    const { data: recentOrders } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at, payment_proof_url")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      totalOrders: orders.count ?? 0,
      totalProducts: products.count ?? 0,
      pendingOrders: pendingOrders.count ?? 0,
      proofSubmitted: proofOrders.count ?? 0,
      recentOrders: recentOrders ?? [],
    };
  });

// ─── Orders ───
const ordersFilterSchema = z.object({
  token: z.string().min(1),
  status: z.string().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

export const getAdminOrders = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ordersFilterSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const from = (data.page - 1) * data.perPage;
    const to = from + data.perPage - 1;

    let query = supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_name, email, phone, total, status, created_at, payment_proof_url, payment_proof_submitted_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status as "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled");
    }

    const { data: orders, count, error } = await query;
    if (error) throw new Error("Gagal memuat pesanan");
    return { orders: orders ?? [], total: count ?? 0 };
  });

const orderDetailSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().uuid(),
});

export const getAdminOrderDetail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderDetailSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();

    if (error || !order) throw new Error("Pesanan tidak ditemukan");

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    return { order, items: items ?? [] };
  });

const updateStatusSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().uuid(),
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateStatusSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);

    // Get current order to check previous status
    const { data: currentOrder, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("status")
      .eq("id", data.orderId)
      .single();

    if (fetchErr || !currentOrder) throw new Error("Pesanan tidak ditemukan");

    const prevStatus = currentOrder.status;
    const newStatus = data.status;

    // Update status
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus })
      .eq("id", data.orderId);

    if (error) throw new Error("Gagal mengupdate status");

    // Stock auto-decrement: when status changes TO paid
    if (newStatus === "paid" && prevStatus !== "paid") {
      const { data: orderItems } = await supabaseAdmin
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", data.orderId);

      if (orderItems) {
        for (const item of orderItems) {
          if (!item.variant_id) continue;
          const { data: variant } = await supabaseAdmin
            .from("product_variants")
            .select("stock")
            .eq("id", item.variant_id)
            .single();

          if (variant) {
            const newStock = Math.max(0, variant.stock - item.quantity);
            await supabaseAdmin
              .from("product_variants")
              .update({ stock: newStock })
              .eq("id", item.variant_id);
          }
        }
      }
    }

    // Stock restore: when cancelling from paid/processing/shipped
    if (newStatus === "cancelled" && ["paid", "processing", "shipped"].includes(prevStatus)) {
      const { data: orderItems } = await supabaseAdmin
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", data.orderId);

      if (orderItems) {
        for (const item of orderItems) {
          if (!item.variant_id) continue;
          const { data: variant } = await supabaseAdmin
            .from("product_variants")
            .select("stock")
            .eq("id", item.variant_id)
            .single();

          if (variant) {
            await supabaseAdmin
              .from("product_variants")
              .update({ stock: variant.stock + item.quantity })
              .eq("id", item.variant_id);
          }
        }
      }
    }

    // Log notification
    await supabaseAdmin.from("order_notifications").insert({
      order_id: data.orderId,
      event_type: `status_${newStatus}`,
      channel: "email",
      status: "pending",
    });

    return { success: true };
  });

// ─── Products ───
export const getAdminProducts = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*, categories(name), product_images(id, url, is_primary, sort_order), product_variants(id, size, stock, sku)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw new Error("Gagal memuat produk");
    return { products: products ?? [] };
  });

const productSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional().default(""),
  price: z.number().int().min(0),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.enum(["active", "sold_out", "preorder", "draft"]),
  preorderEstimatedDate: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  variants: z.array(z.object({
    size: z.string().min(1).max(50),
    stock: z.number().int().min(0),
    sku: z.string().max(100).optional(),
  })).default([]),
  imageUrl: z.string().max(2000).optional(),
  imageUrls: z.array(z.object({
    url: z.string().max(2000),
    isPrimary: z.boolean(),
    sortOrder: z.number().int(),
  })).optional(),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        category_id: data.categoryId || null,
        status: data.status,
        preorder_estimated_date: data.preorderEstimatedDate || null,
        featured: data.featured,
        sort_order: data.sortOrder,
      })
      .select("id")
      .single();

    if (error) throw new Error("Gagal membuat produk: " + error.message);

    if (data.variants.length > 0) {
      const variantRows = data.variants.map((v) => ({
        product_id: product.id,
        size: v.size,
        stock: v.stock,
        sku: v.sku || null,
      }));
      await supabaseAdmin.from("product_variants").insert(variantRows);
    }

    // Multiple images support
    if (data.imageUrls && data.imageUrls.length > 0) {
      const imageRows = data.imageUrls.map((img) => ({
        product_id: product.id,
        url: img.url,
        is_primary: img.isPrimary,
        sort_order: img.sortOrder,
      }));
      await supabaseAdmin.from("product_images").insert(imageRows);
    } else if (data.imageUrl) {
      await supabaseAdmin.from("product_images").insert({
        product_id: product.id,
        url: data.imageUrl,
        is_primary: true,
        sort_order: 0,
      });
    }

    return { id: product.id };
  });

const updateProductSchema = z.object({
  token: z.string().min(1),
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional().default(""),
  price: z.number().int().min(0),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.enum(["active", "sold_out", "preorder", "draft"]),
  preorderEstimatedDate: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    size: z.string().min(1).max(50),
    stock: z.number().int().min(0),
    sku: z.string().max(100).optional(),
  })).default([]),
  imageUrl: z.string().max(2000).optional(),
  imageUrls: z.array(z.object({
    id: z.string().uuid().optional(),
    url: z.string().max(2000),
    isPrimary: z.boolean(),
    sortOrder: z.number().int(),
  })).optional(),
});

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateProductSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);

    const { error } = await supabaseAdmin
      .from("products")
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        category_id: data.categoryId || null,
        status: data.status,
        preorder_estimated_date: data.preorderEstimatedDate || null,
        featured: data.featured,
        sort_order: data.sortOrder,
      })
      .eq("id", data.id);

    if (error) throw new Error("Gagal mengupdate produk");

    // Replace variants
    await supabaseAdmin.from("product_variants").delete().eq("product_id", data.id);
    if (data.variants.length > 0) {
      const variantRows = data.variants.map((v) => ({
        product_id: data.id,
        size: v.size,
        stock: v.stock,
        sku: v.sku || null,
      }));
      await supabaseAdmin.from("product_variants").insert(variantRows);
    }

    // Replace images
    if (data.imageUrls && data.imageUrls.length > 0) {
      await supabaseAdmin.from("product_images").delete().eq("product_id", data.id);
      const imageRows = data.imageUrls.map((img) => ({
        product_id: data.id,
        url: img.url,
        is_primary: img.isPrimary,
        sort_order: img.sortOrder,
      }));
      await supabaseAdmin.from("product_images").insert(imageRows);
    } else if (data.imageUrl) {
      const { data: existingImg } = await supabaseAdmin
        .from("product_images")
        .select("id")
        .eq("product_id", data.id)
        .eq("is_primary", true)
        .maybeSingle();

      if (existingImg) {
        await supabaseAdmin
          .from("product_images")
          .update({ url: data.imageUrl })
          .eq("id", existingImg.id);
      } else {
        await supabaseAdmin.from("product_images").insert({
          product_id: data.id,
          url: data.imageUrl,
          is_primary: true,
          sort_order: 0,
        });
      }
    }

    return { success: true };
  });

const deleteProductSchema = z.object({
  token: z.string().min(1),
  id: z.string().uuid(),
});

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteProductSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { error } = await supabaseAdmin
      .from("products")
      .update({ status: "draft" })
      .eq("id", data.id);
    if (error) throw new Error("Gagal menghapus produk");
    return { success: true };
  });

// ─── Categories ───
export const getAdminCategories = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Gagal memuat kategori");
    return { categories: categories ?? [] };
  });

const categorySchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  sortOrder: z.number().int().default(0),
});

export const createCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => categorySchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { data: cat, error } = await supabaseAdmin
      .from("categories")
      .insert({ name: data.name, slug: data.slug, sort_order: data.sortOrder })
      .select("id")
      .single();
    if (error) throw new Error("Gagal membuat kategori: " + error.message);
    return { id: cat.id };
  });

const updateCategorySchema = z.object({
  token: z.string().min(1),
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  sortOrder: z.number().int().default(0),
});

export const updateCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateCategorySchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { error } = await supabaseAdmin
      .from("categories")
      .update({ name: data.name, slug: data.slug, sort_order: data.sortOrder })
      .eq("id", data.id);
    if (error) throw new Error("Gagal mengupdate kategori");
    return { success: true };
  });

const deleteCategorySchema = z.object({
  token: z.string().min(1),
  id: z.string().uuid(),
});

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteCategorySchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    await supabaseAdmin
      .from("products")
      .update({ category_id: null })
      .eq("category_id", data.id);
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error("Gagal menghapus kategori");
    return { success: true };
  });

// ─── Shipping Rates ───
export const getAdminShippingRates = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { data: rates, error } = await supabaseAdmin
      .from("shipping_rates")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Gagal memuat shipping rates");
    return { rates: rates ?? [] };
  });

const shippingRateSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(100),
  price: z.number().int().min(0),
  isDefault: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const createShippingRate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => shippingRateSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    if (data.isDefault) {
      await supabaseAdmin.from("shipping_rates").update({ is_default: false }).eq("is_default", true);
    }
    const { data: rate, error } = await supabaseAdmin
      .from("shipping_rates")
      .insert({ name: data.name, price: data.price, is_default: data.isDefault, active: data.active, sort_order: data.sortOrder })
      .select("id")
      .single();
    if (error) throw new Error("Gagal membuat shipping rate");
    return { id: rate.id };
  });

const updateShippingRateSchema = z.object({
  token: z.string().min(1),
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().int().min(0),
  isDefault: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateShippingRate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateShippingRateSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    if (data.isDefault) {
      await supabaseAdmin.from("shipping_rates").update({ is_default: false }).eq("is_default", true);
    }
    const { error } = await supabaseAdmin
      .from("shipping_rates")
      .update({ name: data.name, price: data.price, is_default: data.isDefault, active: data.active, sort_order: data.sortOrder })
      .eq("id", data.id);
    if (error) throw new Error("Gagal mengupdate shipping rate");
    return { success: true };
  });

const deleteShippingRateSchema = z.object({
  token: z.string().min(1),
  id: z.string().uuid(),
});

export const deleteShippingRate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteShippingRateSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const { error } = await supabaseAdmin
      .from("shipping_rates")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error("Gagal menghapus shipping rate");
    return { success: true };
  });

// ─── Admin Image Management ───
const deleteImageSchema = z.object({
  token: z.string().min(1),
  imageId: z.string().uuid(),
  productId: z.string().uuid(),
});

export const deleteProductImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteImageSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);

    const { data: img } = await supabaseAdmin
      .from("product_images")
      .select("is_primary")
      .eq("id", data.imageId)
      .single();

    await supabaseAdmin.from("product_images").delete().eq("id", data.imageId);

    // If deleted image was primary, set next image as primary
    if (img?.is_primary) {
      const { data: nextImg } = await supabaseAdmin
        .from("product_images")
        .select("id")
        .eq("product_id", data.productId)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextImg) {
        await supabaseAdmin
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", nextImg.id);
      }
    }

    return { success: true };
  });

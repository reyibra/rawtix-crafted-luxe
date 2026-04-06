

# Tahap 4: Admin System — Auth, Dashboard, Order & Product Management

## 3 Aturan Terpenting

1. **Admin auth harus server-validated** — gunakan Supabase Auth + `user_roles` table dengan `has_role()` security definer function. Semua server function admin harus memvalidasi role, bukan hanya client-side redirect.
2. **Semua CRUD admin harus via server functions (`supabaseAdmin`)** — karena RLS existing memblokir INSERT/UPDATE/DELETE untuk semua table. Pattern yang sama seperti `createOrder` sudah ada dan proven.
3. **Public storefront tidak boleh terpengaruh** — admin routes di `/admin/*`, admin server functions di file terpisah, tidak menyentuh komponen public existing.

## Temuan Arsitektur

| Area | Status |
|------|--------|
| Auth system | Tidak ada. Supabase Auth tersedia tapi belum dipakai. |
| Route protection | Tidak ada pathless layout route. Semua routes flat di root. |
| Admin routes | Tidak ada. |
| Orders table | Lengkap, RLS SELECT = false (hanya admin via `supabaseAdmin` bisa baca). |
| Products/categories/variants | Lengkap, RLS SELECT = public readable, no INSERT/UPDATE/DELETE. |
| Storage buckets | `product-images` (public), `payment-proofs` (public). |
| Server functions | `orders.functions.ts` — pattern `supabaseAdmin` sudah proven. |
| Root route | `createRootRouteWithContext<{ queryClient }>` — perlu extend context untuk auth. |

## Rencana Implementasi

### 1. Database Migration: `user_roles` table + `has_role()` function

```sql
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- RLS: hanya admin bisa SELECT user_roles
CREATE POLICY "Admins can read roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

Setelah migration, admin user dibuat manual via Supabase Auth (sign up), lalu INSERT role via insert tool.

### 2. Auth Configuration: Enable email auth, auto-confirm for admin

Karena ini admin-only dan bukan customer auth, gunakan `cloud--configure_auth` untuk enable auto-confirm email agar admin tidak perlu verifikasi email (internal use).

### 3. Admin Auth Server Functions

File: `src/utils/admin.functions.ts`
- `verifyAdmin`: server function yang menerima auth token, validate via `supabaseAdmin` bahwa user punya role `admin`
- Dipakai oleh semua admin server functions sebagai guard

### 4. Admin Login Page

File: `src/routes/admin.login.tsx`
- Route: `/admin/login`
- Email + password form
- Calls `supabase.auth.signInWithEmailAndPassword()`
- On success → redirect to `/admin`
- Dark, minimal UI matching RAWTIX tone tapi terasa "panel internal"

### 5. Admin Layout Route (Protected)

File: `src/routes/admin.tsx`
- Pathless-like layout route for `/admin/*`
- `beforeLoad`: check auth state, redirect to `/admin/login` if not authenticated
- Component: admin sidebar nav + `<Outlet />`
- Navigation: Dashboard, Orders, Products, Categories, Settings
- Logout button

### 6. Admin Dashboard

File: `src/routes/admin.index.tsx`
- Route: `/admin`
- Server function: `getAdminDashboardStats` — returns counts (total orders, pending, payment submitted, total products)
- Simple metric cards
- Recent orders list (5 terbaru)

### 7. Admin Order Management

Files:
- `src/routes/admin.orders.tsx` — order list with status filter tabs
- `src/routes/admin.orders.$id.tsx` — order detail

Server functions in `src/utils/admin.functions.ts`:
- `getAdminOrders`: list orders with optional status filter, pagination
- `getAdminOrderDetail`: single order + order_items
- `updateOrderStatus`: update status (pending → paid → processing → shipped → delivered / cancelled)

Order detail page shows:
- Customer info (name, email, phone, address)
- Order items (product, size, qty, price)
- Payment proof preview (clickable image from `payment_proof_url`)
- Status change buttons: Verify Payment (→ paid), Process (→ processing), Ship (→ shipped), Deliver (→ delivered), Cancel

### 8. Admin Product Management

Files:
- `src/routes/admin.products.tsx` — product list
- `src/routes/admin.products.new.tsx` — create product form
- `src/routes/admin.products.$id.tsx` — edit product

Server functions:
- `getAdminProducts`: all products including drafts
- `createProduct`: insert product + variants + images
- `updateProduct`: update product fields
- `deleteProduct`: delete product (or set draft)
- `uploadProductImage`: upload to `product-images` bucket

Product form fields:
- Name, slug (auto-generate from name), description, price
- Category (dropdown from categories)
- Status: active / sold_out / preorder / draft
- `preorder_estimated_date` (shown if preorder)
- Featured toggle
- Image upload (primary image)
- Variants section: add/remove size + stock rows

### 9. Admin Category Management

File: `src/routes/admin.categories.tsx`
- Inline list with add/edit/delete
- Fields: name, slug, sort_order

Server functions:
- `getAdminCategories`, `createCategory`, `updateCategory`, `deleteCategory`

### 10. Root Route Context Extension

File: `src/routes/__root.tsx` (edit)
- Extend context type with `auth: { isAuthenticated: boolean; user: User | null }`
- Add `onAuthStateChange` listener in root component
- Pass auth state through router context

File: `src/router.tsx` (edit)
- Add auth to context type

### 11. Footer/Contact: No changes needed
Label WhatsApp sudah benar dari Tahap 3.

## File yang Diubah/Dibuat

| File | Aksi |
|------|------|
| Migration SQL | `user_roles` table, `has_role()` function |
| `src/utils/admin.functions.ts` | Baru — semua admin server functions |
| `src/routes/admin.login.tsx` | Baru — admin login page |
| `src/routes/admin.tsx` | Baru — admin layout (protected) |
| `src/routes/admin.index.tsx` | Baru — dashboard |
| `src/routes/admin.orders.tsx` | Baru — order list |
| `src/routes/admin.orders.$id.tsx` | Baru — order detail + status management |
| `src/routes/admin.products.tsx` | Baru — product list |
| `src/routes/admin.products.new.tsx` | Baru — create product |
| `src/routes/admin.products.$id.tsx` | Baru — edit product |
| `src/routes/admin.categories.tsx` | Baru — category management |
| `src/routes/__root.tsx` | Edit — extend context with auth |
| `src/router.tsx` | Edit — add auth to context |

## Database Changes
- Table: `user_roles` (with RLS)
- Enum: `app_role` ('admin')
- Function: `has_role()` (security definer)

## Auth Approach
- Supabase Auth email/password
- `user_roles` table for role validation
- Server-side validation via `has_role()` in every admin server function
- Client-side route guard via `beforeLoad` + auth context
- Auto-confirm email enabled (admin internal use only)

## Yang Sengaja Tidak Dikerjakan
- Customer auth / login
- Midtrans payment gateway
- Shipping engine / cost calculation
- Stock auto-decrement on order
- Notification system
- Multiple product images gallery
- Order export / reporting
- Audit log

## Gap untuk Tahap 5
1. Customer notification (email/WhatsApp saat status berubah)
2. Stock auto-decrement on order creation
3. Shipping cost calculation
4. Multiple product images management
5. SEO metadata per product
6. Deployment hardening + custom domain
7. Performance optimization (image CDN, caching)


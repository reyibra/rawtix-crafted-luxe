# Tahap 5: Public-Readiness Hardening

## 3 Aturan Terpenting

1. **### 1. Fix** `/admin/login` **Blank Screen (CRITICAL)**
  **Root cause:** `admin.login.tsx` **terdaftar sebagai child route dari** `admin.tsx`**, sehingga** `AdminLayoutGuard` **tetap membungkus halaman login. Saat user belum terautentikasi, guard melakukan redirect ke** `/admin/login`**, tetapi karena login page sendiri berada di bawah guard yang sama, halaman login tidak pernah dirender dan hasil akhirnya blank screen.**
  **Final decision: pisahkan login admin dari parent admin layout.**  
  **Gunakan route file standalone:** `src/routes/admin_.login.tsx` **agar path tetap** `/admin/login` **tetapi tidak menjadi child dari** `admin.tsx`**.**  
  **Hapus route lama** `src/routes/admin.login.tsx`**.**
  **Wajib diverifikasi setelah implementasi:**
  **1.** `/admin/login` **terbuka langsung tanpa blank screen**
  **2. form login tampil normal**
  **3. login sukses redirect ke** `/admin`
  **4. salah credential menampilkan error yang jelas**
  **5. route** `/admin/*` **tetap protected**
  **6. logout mengembalikan user ke** `/admin/login`
2. **Semua perubahan checkout/schema harus sinkron end-to-end** — form → Zod validator → DB insert → admin order detail. Satu field yang tidak sinkron = order gagal.
3. **Theme toggle harus berbasis CSS variables yang sudah ada** — project sudah pakai CSS custom properties di `:root`. Tinggal tambah `.light` variant dan toggle class di `<html>`.

## Temuan Arsitektur


| Area                 | Status         | Root Cause / Note                                                                                                                                                                                                                     |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/login` blank | **BUG**        | `admin.login.tsx` = child of `admin.tsx`. AdminLayoutGuard checks auth, user not logged in → `navigate({ to: "/admin/login" })` → renders null → blank. Login page never gets a chance to render because the parent layout blocks it. |
| `/login` 404         | **BUG**        | Route file doesn't exist. No `/login` route defined.                                                                                                                                                                                  |
| Checkout form        | Basic          | Only has: email, phone, name, address (1 field), city, province, postalCode. Missing: kecamatan, street detail, additional detail.                                                                                                    |
| Theme system         | Dark only      | `:root` has dark values only. No `.light` / `.dark` class system. `@custom-variant dark` exists but no light values defined.                                                                                                          |
| Responsive           | Partial        | Most layouts use Tailwind responsive, but no systematic audit.                                                                                                                                                                        |
| Stock decrement      | None           | No trigger or server logic for stock changes.                                                                                                                                                                                         |
| Shipping             | None           | `shipping_cost` column exists (default 0), no calculation logic.                                                                                                                                                                      |
| Multiple images      | Partial        | `product_images` table exists with `sort_order` and `is_primary`. Admin form only handles single image. Product detail shows single image.                                                                                            |
| Notification         | None           | No email provider, no notification infrastructure.                                                                                                                                                                                    |
| Orders schema        | Missing fields | No `district`/`kecamatan`, no `street_address`, no `address_detail`. Single `address` text field.                                                                                                                                     |


## Rencana Implementasi

### 1. Fix `/admin/login` Blank Screen (CRITICAL)

**Root cause:** `admin.login.tsx` uses `createFileRoute("/admin/login")` which makes it a child of the `/admin` layout. The layout's `AdminLayoutGuard` checks `isAuthenticated` and calls `navigate({ to: "/admin/login" })` when false — but since login IS inside the layout, the guard prevents rendering.

**Fix:** Move `admin.login.tsx` to be a **standalone route outside the admin layout**. Create `src/routes/admin_.login.tsx` (note the underscore: `admin_` breaks the parent-child relationship in TanStack Router file-based routing). Delete the old `admin.login.tsx`.

Alternative: Add an exception in `AdminLayoutGuard` to check if the current route is `/admin/login` and skip the guard. But the cleaner approach is `admin_.login.tsx`.

**Wait** — actually in TanStack Router flat routing, `admin.login.tsx` creates route `/admin/login` as a child of `/admin`. The underscore convention `admin_.login.tsx` would create `/admin/login` without being a child of the admin layout.

Let me verify: TanStack Router file-based routing — `admin.login.tsx` = child of `admin.tsx` layout. To make it independent: use `admin_.login.tsx` which creates path `/admin/login` but NOT as a child of `admin` layout.

### 2. Handle `/login` → Redirect to `/admin/login`

Create `src/routes/login.tsx` with a simple redirect to `/admin/login` in `beforeLoad`.

### 3. Upgrade Checkout Form + DB Schema

**Migration:** Add columns to `orders`:

- `district` (text, nullable) — kecamatan
- `street_address` (text, nullable) — nama jalan/gedung/nomor
- `address_detail` (text, nullable) — blok/unit/patokan

Keep existing `address` field as legacy/concatenated fallback.

**Form update:** Add new fields to checkout form, update Zod schema in `orders.functions.ts`, update `createOrder` handler, update admin order detail display.

### 4. Theme Toggle (Black/White)

- Add `.light` CSS variable set in `styles.css` (inverted: white bg, dark text)
- Create `ThemeProvider` context + `useTheme` hook, persist to `localStorage`
- Add toggle class to `<html>` element
- Add toggle button in Header (sun/moon icon, minimal)
- Admin pages: keep dark always OR let theme follow — default: follow theme

### 5. Responsive Hardening

Systematic pass through key components:

- Header: already OK (simple flex)
- Checkout: grid → single column on mobile
- Admin layout: already has mobile nav
- Quick view modal: ensure max-height/scroll on small screens
- Product detail: grid → stack on mobile (already done)
- Footer: check wrapping
- Cart: verify mobile layout

### 6. Stock Auto-Decrement

**Decision: Decrement when admin sets status to `paid`.**

Add logic in `updateOrderStatus` server function:

- When status changes to `paid`: decrement `product_variants.stock` for each order item
- When status changes to `cancelled` (from `paid` or later): restore stock
- Prevent double-decrement by checking previous status
- Storefront: show "Sold Out" when all variant stocks = 0

### 7. Shipping Logic (Admin-Configured Flat Rate)

**Simplest MVP approach:**

- Create `shipping_rates` table: id, name, price, is_default, active
- Admin can configure shipping options
- Checkout shows shipping options, user selects one
- Selected shipping cost added to total

**Simpler alternative:** Single flat rate configurable via a `site_settings` table or just hardcoded initial value that admin can change. Given scope, go with **admin-managed shipping rates table**.

#### Shipping harus end-to-end, bukan hanya tabel rate

Agar shipping benar-benar usable, implementasi wajib mencakup:

1. **Penyimpanan shipping ke order**

   - Tambahkan field yang relevan pada `orders`, minimal:

     - `shipping_rate_id` (nullable)

     - `shipping_method_name`

     - `shipping_cost`

   - Pastikan `shipping_cost` ikut dihitung ke total order final

2. **Checkout integration**

   - Checkout harus menampilkan opsi shipping aktif

   - User wajib memilih salah satu shipping option sebelum submit

   - Total pesanan harus update secara real-time setelah shipping dipilih

3. **Admin management**

   - Tambahkan admin management untuk shipping rates

   - Minimal admin bisa:

     - tambah shipping rate

     - edit name/price/active/default

     - nonaktifkan rate

   - Jika scope ingin dijaga tetap ramping, letakkan di:

     - `Settings > Shipping`

     - atau route admin khusus shipping

4. **Admin order visibility**

   - Detail order di admin harus menampilkan:

     - shipping method yang dipilih

     - shipping cost

     - total akhir termasuk shipping

5. **Fallback rule**

   - Jika belum ada shipping rate aktif, checkout tidak boleh diam-diam memakai 0 tanpa penjelasan

   - Tampilkan state yang jelas atau default shipping rule yang eksplisit

### 8. Multiple Product Images

- Update admin product form to support multiple image uploads
- Product detail page: image gallery with thumbnail navigation
- QuickViewModal: show primary image (no change needed)
- #### Multiple product images harus benar-benar operasional
  Agar fitur ini tidak berhenti di gallery visual saja, implementasi wajib mencakup:
  1. **Admin-side image management**
     - upload banyak gambar
     - hapus gambar
     - ganti gambar
     - pilih gambar utama `is_primary`)
     - atur urutan tampil `sort_order`)
  2. **Storefront behavior**
     - product detail menampilkan gallery + thumbnail navigation
     - product card dan quick option tetap memakai gambar utama
     - jika gambar utama dihapus, sistem harus otomatis menentukan primary image baru yang valid
  3. **Data integrity**
     - setiap product tetap harus memiliki paling tidak 1 gambar valid jika status produk aktif
     - cegah kondisi semua image hilang pada produk aktif tanpa fallback
  4. **UX minimal**
     - preview sebelum simpan
     - loading state saat upload
     - error state bila upload gagal

### 9. Notification Architecture

- No email provider configured, no API keys available
- **Realistic approach:** Create `order_notifications` table to log notification events. Build the data model. Actual sending deferred to when email infrastructure is set up.
- Add admin-visible note that notifications are logged but not yet sent automatically.
- #### Multiple product images harus benar-benar operasional
  Agar fitur ini tidak berhenti di gallery visual saja, implementasi wajib mencakup:
  1. **Admin-side image management**
     - upload banyak gambar
     - hapus gambar
     - ganti gambar
     - pilih gambar utama `is_primary`)
     - atur urutan tampil `sort_order`)
  2. **Storefront behavior**
     - product detail menampilkan gallery + thumbnail navigation
     - product card dan quick option tetap memakai gambar utama
     - jika gambar utama dihapus, sistem harus otomatis menentukan primary image baru yang valid
  3. **Data integrity**
     - setiap product tetap harus memiliki paling tidak 1 gambar valid jika status produk aktif
     - cegah kondisi semua image hilang pada produk aktif tanpa fallback
  4. **UX minimal**
     - preview sebelum simpan
     - loading state saat upload
     - error state bila upload gagal

### 10. Deployment Hardening

- Verify all routes load without errors
- Check env var usage
- Add basic OG meta (already in `__root.tsx`)
- Ensure no credentials leak in client code
- #### Public-readiness checklist wajib
  Sebelum tahap ini dianggap selesai, lakukan verifikasi eksplisit terhadap:
  1. **Route safety**
     - `/`
     - `/shop`
     - `/shop/$category`
     - `/product/$slug`
     - `/cart`
     - `/checkout`
     - `/order-success`
     - `/contact`
     - `/refund-policy`
     - `/privacy-policy`
     - `/terms`
     - `/shipping-policy`
     - `/admin/login`
     - `/admin`
     - `/login`
  2. **Error handling**
     - broken slug → not found yang benar
     - order number invalid → state yang jelas
     - upload gagal → error state yang jelas
     - unauthorized admin access → redirect yang benar
  3. **Security sanity checks**
     - tidak ada credential hardcoded di client
     - tidak ada admin secret bocor ke browser bundle
     - storage path sensitif tidak diekspos sembarangan
     - server functions sensitif tetap server-validated
  4. **Responsive acceptance**
     - mobile kecil
     - mobile besar
     - tablet portrait
     - tablet landscape
     - laptop
     - desktop lebar
     - tidak ada overflow horizontal
     - tidak ada tombol atau input keluar layar
     - tidak ada modal yang terpotong
  5. **Theme acceptance**
     - black mode default
     - white mode konsisten
     - preferensi tersimpan setelah refresh
     - contrast aman di komponen penting
  6. **Operational acceptance**
     - checkout dengan address baru tersimpan benar
     - shipping ikut ke total
     - payment proof tetap jalan
     - stock sync sesuai keputusan
     - admin dapat membaca semua data yang relevan

## File Changes Summary


| File                                   | Action                                                               |
| -------------------------------------- | -------------------------------------------------------------------- |
| `src/routes/admin_.login.tsx`          | **New** — standalone admin login (fixes blank bug)                   |
| `src/routes/admin.login.tsx`           | **Delete**                                                           |
| `src/routes/login.tsx`                 | **New** — redirect to `/admin/login`                                 |
| `src/routes/checkout.tsx`              | **Edit** — expanded address form                                     |
| `src/utils/orders.functions.ts`        | **Edit** — new address fields in schema                              |
| `src/utils/admin.functions.ts`         | **Edit** — stock decrement logic, shipping rates CRUD                |
| `src/styles.css`                       | **Edit** — add `.light` theme variables                              |
| `src/hooks/useTheme.tsx`               | **New** — theme context + toggle                                     |
| `src/routes/__root.tsx`                | **Edit** — wrap with ThemeProvider, add class to `<html>`            |
| `src/components/layout/Header.tsx`     | **Edit** — add theme toggle button                                   |
| `src/routes/product.$slug.tsx`         | **Edit** — image gallery for multiple images                         |
| `src/components/admin/ProductForm.tsx` | **Edit** — multiple image upload                                     |
| `src/routes/admin.orders.$id.tsx`      | **Edit** — show new address fields                                   |
| Migration SQL                          | Add address columns, shipping_rates table, order_notifications table |


| `src/routes/admin.shipping.tsx` atau route admin shipping yang setara | **New/Edit** — shipping rates management UI |

| `src/routes/admin.settings.tsx` | **Edit** — jika shipping diletakkan di settings |

| `src/routes/admin.products.$id.tsx` | **Edit** — multiple image management detail |

| `src/components/product/ProductGallery.tsx` | **New/Edit** — gallery + thumbnail navigation |

| `src/components/checkout/ShippingOptions.tsx` atau komponen setara | **New/Edit** — shipping option selector |

| `src/routes/login.tsx` | **New** — redirect aman ke `/admin/login` |

## Database Changes

1. **Alter `orders**`: add `district`, `street_address`, `address_detail` (all text nullable)
2. **Create `shipping_rates**`: id, name, price (int), is_default (bool), active (bool), sort_order, created_at
3. **Create `order_notifications**`: id, order_id, event_type, channel, status, created_at (foundation for future)
4. **Alter `orders`**: tambahkan field shipping yang diperlukan agar shipping tersimpan end-to-end, minimal:
     - `shipping_rate_id`
     - `shipping_method_name`
     - `shipping_cost` (gunakan kolom existing jika sudah ada dan pastikan dipakai nyata)
5. **Pastikan struktur `product_images`** mendukung:
     - multiple images
     - `is_primary`
     - `sort_order`
     - delete/replace flow yang aman

## Yang Sengaja Tidak Dikerjakan

- Customer auth
- Midtrans payment gateway
- Courier API integration (JNE/JNT/etc)
- Map/geocoding API
- Automated email/WhatsApp sending (no provider configured)
- Admin role management UI

## Keputusan Teknis Utama

1. `**admin_.login.tsx**` (underscore) to break parent layout relationship — cleanest TanStack Router fix
2. **Stock decrement at `paid` status** — safest for manual transfer flow
3. **CSS variable-based theme** — leverages existing architecture, no library needed
4. **Shipping rates table** — admin-configurable, simple but extensible
5. **Notification table as event log** — honest foundation without fake automation
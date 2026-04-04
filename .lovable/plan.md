

# RAWTIX.ID — Tahap 2: Checkout + Legal + Contact

## 3 Aturan Terpenting

1. **Checkout harus end-to-end functional** — form bound to state, server-side order creation with stock validation, cart cleared on success, clear feedback.
2. **Jangan sentuh UI yang sudah bagus** — semua perubahan harus menyatu dengan visual existing (dark, minimal, editorial).
3. **Gunakan arsitektur yang sudah ada** — localStorage cart, Supabase backend, TanStack Start server functions.

## Temuan Arsitektur

- **Cart**: sudah persisten via localStorage — sudah solid, tidak perlu diubah.
- **Orders table**: sudah ada di DB lengkap dengan `order_items`, tapi **tidak ada RLS INSERT policy** — client tidak bisa insert langsung. Solusi: **server function** dengan `supabaseAdmin` untuk bypass RLS + validasi stock.
- **Checkout**: form ada tapi semua input uncontrolled, tidak ada handler, tombol mati.
- **Policy pages**: tidak ada route sama sekali — footer pakai `<span>` bukan `<Link>`.
- **Contact page**: tidak ada.

## Rencana Implementasi

### 1. Server Function: `createOrder` (baru)
File: `src/utils/orders.functions.ts`
- Menerima: cart items + customer data (email, phone, name, address, city, province, postal_code, notes)
- Generate order_number (format: `RX-{timestamp}{random}`)
- Validate input dengan Zod
- Insert ke `orders` + `order_items` via `supabaseAdmin`
- Return order_number + order id

### 2. Checkout Page Rewrite
File: `src/routes/checkout.tsx` (edit existing)
- Bind semua input ke `useState` form state
- Client-side validation (required fields, email format, phone format)
- Inline error messages per field
- Submit handler calls `createOrder` server function
- Loading state on button (disabled + spinner text)
- On success: `clearCart()`, navigate to order confirmation
- On error: toast error message

### 3. Order Confirmation Page (baru)
File: `src/routes/order-success.tsx`
- Route: `/order-success?order=RX-xxxxx`
- Displays: order number, "Pesanan diterima", ringkasan singkat
- CTA: "Kembali Belanja" → `/shop`
- Jika tidak ada order number di URL, redirect ke `/shop`
- Visual: consistent dark RAWTIX tone

### 4. Legal Pages (5 route baru)
Files:
- `src/routes/refund-policy.tsx`
- `src/routes/privacy-policy.tsx`
- `src/routes/terms.tsx`
- `src/routes/shipping-policy.tsx`
- `src/routes/contact.tsx`

Semua menggunakan layout component yang sama (`PolicyLayout`):
- Header + Footer
- Max-width container
- Heading uppercase tracking wide
- Body text `text-sm text-muted-foreground leading-relaxed`
- Konten bahasa Indonesia, profesional, sesuai brand fashion

Contact page: Instagram, TikTok, WhatsApp (+62 857-1963-6329), semua clickable.

### 5. Footer Update
File: `src/components/layout/Footer.tsx` (edit existing)
- Ubah layout jadi 2 kolom (desktop): newsletter kiri, kontak kanan
- Kontak kanan: Instagram, TikTok, WhatsApp — dengan icon + label, clickable
- Ubah `<span>` policy links jadi `<Link>` ke route yang benar
- Mobile: stack vertikal

### 6. Shared Component (baru)
File: `src/components/layout/PolicyLayout.tsx`
- Reusable wrapper: Header, main content area, Footer
- Dipakai oleh semua 5 legal pages

## Database Changes
- **Migration**: Tambah RLS INSERT policy untuk `orders` dan `order_items` agar server function bisa insert. Sebenarnya server function pakai `supabaseAdmin` (bypass RLS), jadi **tidak perlu migration** — cukup server function saja.

## Yang Sengaja Tidak Dikerjakan
- Auth / login
- Admin panel
- Payment gateway integration (Midtrans)
- Shipping cost calculation
- Stock decrement on order (Phase 3)
- Order tracking

## File yang Diubah/Dibuat

| File | Aksi |
|------|------|
| `src/utils/orders.functions.ts` | Baru — server function createOrder |
| `src/routes/checkout.tsx` | Edit — bind form, validation, submit |
| `src/routes/order-success.tsx` | Baru — konfirmasi order |
| `src/routes/refund-policy.tsx` | Baru |
| `src/routes/privacy-policy.tsx` | Baru |
| `src/routes/terms.tsx` | Baru |
| `src/routes/shipping-policy.tsx` | Baru |
| `src/routes/contact.tsx` | Baru |
| `src/components/layout/PolicyLayout.tsx` | Baru — reusable layout |
| `src/components/layout/Footer.tsx` | Edit — 2-col layout, real links, kontak |


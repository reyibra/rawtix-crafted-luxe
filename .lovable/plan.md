

# Tahap 3: Manual Payment Flow + Quick Action + Footer Refinement

## 3 Aturan Terpenting
1. **Card click dan quick action harus benar-benar terpisah** — card navigates, button opens modal. Event propagation harus di-handle dengan benar.
2. **Payment proof flow harus end-to-end** — dari instruksi transfer sampai upload bukti, tersimpan di storage, terhubung ke order yang benar.
3. **Jangan sentuh checkout flow yang sudah hidup** — semua perubahan adalah ekstensi, bukan penggantian.

## Temuan Arsitektur

| Area | Status |
|------|--------|
| ProductCard `onClick` | Seluruh card = buka QuickViewModal. Belum ada navigasi ke detail. |
| QuickViewModal | Sudah ada lengkap: size, qty, add to cart, view full details. |
| Order status enum | `pending, paid, processing, shipped, delivered, cancelled` — tidak ada status khusus payment proof. |
| Orders table | Punya `payment_method` dan `payment_reference` tapi belum ada `payment_proof_url`. |
| Storage | Bucket `product-images` ada. Belum ada bucket untuk payment proofs. |
| Footer contact | Label nomor masih `+62 857-1963-6329` (bukan "WhatsApp"). |
| Order success page | Hanya menampilkan konfirmasi + nomor order. Belum ada instruksi transfer atau upload. |

## Rencana Implementasi

### 1. Database: Tambah kolom payment proof di orders
**Migration:** Tambah 2 kolom ke `orders`:
- `payment_proof_url` (text, nullable) — URL file bukti di storage
- `payment_proof_submitted_at` (timestamptz, nullable)

Tidak perlu ubah enum. Flow: order dibuat dengan status `pending` → user upload bukti → kolom proof terisi → admin nanti bisa verifikasi dan set `paid`.

### 2. Storage: Buat bucket `payment-proofs`
- Bucket public (agar gambar bisa ditampilkan)
- Atau private + signed URL — pilih **public** untuk simplicity MVP

### 3. Server Function: `submitPaymentProof`
File: `src/utils/orders.functions.ts` (extend existing)
- Input: `orderNumber` + file (base64 atau URL setelah client-side upload)
- Validate order exists dan masih `pending`
- Upload file ke `payment-proofs` bucket
- Update `orders.payment_proof_url` + `payment_proof_submitted_at`
- Update `orders.payment_method` = `'transfer_bca'`
- Return success

### 4. Enhance Order Success → Payment Instruction + Upload
File: `src/routes/order-success.tsx` (edit)
- Setelah order berhasil, tampilkan:
  - Nomor pesanan
  - Total yang harus ditransfer
  - **Instruksi transfer BCA (7105332998)**
  - Upload bukti pembayaran (file input, accept image)
  - Submit button
  - Loading/success/error states
- Setelah bukti terkirim: tampilkan konfirmasi "Bukti pembayaran diterima, menunggu verifikasi"
- Perlu juga: route bisa diakses kembali via `/order-success?order=RX-xxx` untuk upload ulang jika belum upload

Server function tambahan: `getOrderByNumber` — fetch order detail (number, total, status, payment_proof_url) agar page bisa menampilkan info yang benar bahkan setelah reload.

### 5. ProductCard: Pisahkan click card vs quick action
File: `src/components/product/ProductCard.tsx` (edit)
- **Card area (keseluruhan):** Navigasi ke `/product/$slug` — ubah dari `<button onClick>` menjadi wrapping dengan `<Link>`
- **Quick action button:** Tombol terpisah di bawah nama/harga, label: **"Pilih Opsi"** — klik buka QuickViewModal via callback
- Button harus `e.stopPropagation()` dan `e.preventDefault()` agar tidak trigger navigasi
- Untuk produk sold out: tombol disabled atau hidden

### 6. Shop pages: Update interaction pattern
Files: `src/routes/shop.tsx` + `src/routes/shop.$category.tsx` (edit)
- ProductCard sekarang punya 2 props: `onQuickView` (buka modal) dan navigasi implicit via Link
- QuickViewModal tetap sama, hanya trigger-nya berubah

### 7. Footer: Label WhatsApp
File: `src/components/layout/Footer.tsx` (edit line 123)
- Ubah `<span>+62 857-1963-6329</span>` → `<span>WhatsApp</span>`

### 8. Homepage index: Update ProductCard usage
File: `src/routes/index.tsx` — jika homepage juga render ProductCard, sesuaikan props.

## File yang Diubah/Dibuat

| File | Aksi |
|------|------|
| `src/components/product/ProductCard.tsx` | Edit — Link wrapper + quick action button |
| `src/components/product/QuickViewModal.tsx` | Tidak berubah |
| `src/routes/shop.tsx` | Edit — update ProductCard props |
| `src/routes/shop.$category.tsx` | Edit — update ProductCard props |
| `src/routes/index.tsx` | Edit — update ProductCard props jika dipakai |
| `src/routes/order-success.tsx` | Edit — tambah instruksi transfer + upload bukti |
| `src/utils/orders.functions.ts` | Edit — tambah `submitPaymentProof` + `getOrderByNumber` |
| `src/components/layout/Footer.tsx` | Edit — label WhatsApp |
| Migration SQL | Tambah `payment_proof_url`, `payment_proof_submitted_at` ke orders |
| Storage bucket | Buat `payment-proofs` |

## Yang Sengaja Tidak Dikerjakan
- Auth / login
- Admin panel (verifikasi bukti pembayaran)
- Midtrans
- Stock decrement
- Shipping cost calculation
- Multiple payment proofs per order

## Keputusan Teknis Utama
1. **Tidak ubah enum order_status** — `pending` cukup, proof upload dilacak via kolom terpisah
2. **Upload via client-side ke Supabase Storage** lalu kirim URL ke server function — lebih simple daripada base64 via server function
3. **Label quick action: "Pilih Opsi"** — natural dalam bahasa Indonesia, premium enough
4. **Bucket payment-proofs: public** — simplicity MVP, admin bisa akses langsung


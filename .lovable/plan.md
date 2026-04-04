

# RAWTIX.ID — E-Commerce Blueprint

---

## STEP 1: 3 ATURAN PALING PENTING

1. **Brand harus terasa di setiap pixel.** Setiap keputusan UI harus melewati filter: "Apakah ini terasa seperti fashion label independen yang crafted, atau seperti toko online biasa?" Jika jawabannya yang kedua, buang.

2. **Flow belanja harus seamless dan bertahap.** Browse → Quick View → Cart → Checkout. Tidak boleh ada friction yang tidak perlu. User harus bisa membeli dalam 4-5 klik maksimal.

3. **MVP harus kecil tapi terasa lengkap.** Lebih baik 6 halaman yang sempurna daripada 15 halaman yang setengah jadi. Fokus pada pengalaman belanja end-to-end yang bisa berjalan, bukan fitur yang banyak tapi tidak terpakai.

---

## STEP 2: ASSUMPTION LOG

| # | Asumsi | Dampak |
|---|--------|--------|
| A1 | Produk rawtix.id memiliki varian ukuran (S/M/L/XL/XXL) dan mungkin warna | Menentukan skema variant |
| A2 | Jumlah produk awal < 30 item | Tidak perlu pagination kompleks di MVP |
| A3 | Payment gateway yang dipakai: Midtrans atau Xendit (konteks Indonesia) | Integrasi payment lokal |
| A4 | Shipping menggunakan integrasi kurir Indonesia (JNE/J&T/SiCepat) atau manual input ongkir | Shipping logic |
| A5 | Belum ada user account / login di MVP — checkout sebagai guest | Menyederhanakan MVP |
| A6 | Admin panel cukup sederhana — dikelola 1-2 orang | Tidak perlu role management kompleks |
| A7 | Bahasa website: Bahasa Indonesia sebagai default, mungkin bilingual nanti | Tidak perlu i18n di MVP |
| A8 | Mata uang: IDR (Rupiah) saja | Tidak perlu currency switching |
| A9 | Preorder memiliki tanggal estimasi pengiriman yang ditampilkan | UX preorder |
| A10 | Tidak ada flash sale atau discount system di MVP | Simplify pricing logic |

---

## STEP 3: EXECUTION PLAN

1. Definisikan arah proyek dan terjemahan brand ke digital
2. Susun arsitektur informasi dan app flow lengkap
3. Rincikan core features MVP vs Phase 2
4. Buat frontend plan dan backend plan yang selaras
5. Tentukan build priority, risiko, dan rekomendasi final

---

## 1. PROJECT DIRECTION

**Ringkasan:** Website e-commerce untuk rawtix.id — brand fashion independen Indonesia yang menjual statement piece dengan karakter crafted, artsy, dan eksklusif. Bukan marketplace. Bukan toko online massal. Ini adalah digital storefront sebuah label.

**Problem:** rawtix.id saat ini hanya beroperasi via Instagram dan link tree. Tidak ada pengalaman belanja yang terkontrol, tidak ada katalog yang browsable, tidak ada checkout yang proper. Brand yang punya karakter kuat ini kehilangan potensi konversi karena friction di proses pembelian.

**Tujuan bisnis:**
- Menyediakan kanal penjualan langsung yang brand-owned
- Meningkatkan konversi dari followers menjadi buyers
- Membangun persepsi brand yang lebih premium dan serius
- Mengontrol pengalaman customer dari browse sampai checkout

**Karakter brand rawtix.id:**
- Gelap, eksklusif, crafted
- Detail-oriented, artsy
- Independent fashion label, bukan fast-fashion
- Statement piece — setiap produk punya cerita
- Monokrom, tenang, kuat

**Posisi brand:** rawtix.id bukan Tokopedia seller. Ini adalah fashion label yang kebetulan menjual online. Website harus terasa seperti masuk ke butik, bukan ke mall.

**User utama:** Laki-laki dan perempuan 20-35 tahun, urban Indonesia, mengapresiasi fashion independen, willing to pay premium, familiar dengan online shopping tapi menghargai pengalaman yang berbeda dari marketplace biasa.

---

## 2. BRAND TRANSLATION

**Visual Tone:** Dark, moody, editorial. Background dominan hitam (#0A0A0A hingga #111111). Teks putih/off-white. Kontras tinggi. Ruang kosong yang disengaja — silence is power.

**Mood:** Seperti masuk ke galeri fashion yang tenang. Produk berbicara sendiri. UI tidak berisik.

**Tipografi:**
- Heading: Sans-serif geometric yang bersih dan tegas — rekomendasi: **Inter** atau **Space Grotesk** dengan letter-spacing yang lebar (uppercase untuk heading utama, mirip cara logo RAWTIX ditampilkan)
- Body: Inter atau system sans-serif, weight regular, size yang comfortable untuk membaca harga dan detail produk

**Penggunaan Warna:**
- Primary: hitam (#0A0A0A) sebagai background
- Text: putih (#F5F5F5) dan off-white (#A0A0A0) untuk secondary text
- Accent: tidak ada warna accent mencolok. Jika perlu, gunakan warm white atau sangat subtle gold hanya untuk hover state
- Destructive/alert: merah gelap muted untuk sold out badge
- Border: white dengan opacity 10-15%

**Prinsip UI Visual:**
1. Produk adalah hero — foto produk harus besar dan berkualitas tinggi
2. Whitespace (atau dalam kasus ini, blackspace) adalah elemen desain
3. Tipografi uppercase dengan tracking lebar untuk label dan navigasi
4. Transisi dan animasi halus — fade in, tidak bouncy
5. Tidak ada shadow, tidak ada gradient mencolok, tidak ada rounded corner berlebihan

**Yang harus dijaga:** Logo RAWTIX sebagai anchor visual di header, konsistensi tone gelap di seluruh halaman, kesederhanaan navigasi, foto produk sebagai focal point.

---

## 3. WEBSITE INFORMATION ARCHITECTURE

```
rawtix.id
├── / (Homepage)
│   ├── Hero section (full-screen editorial image)
│   ├── Featured products grid
│   └── Footer
├── /shop (All Products — default catalog view)
├── /shop/[category] (Filtered by category)
├── /product/[slug] (Product Detail Page)
├── /cart (Cart Page)
├── /checkout (Checkout Page)
└── /about (Brand Story — Phase 2)
```

**Quick View / Choose Options:** Bukan halaman terpisah, melainkan **modal overlay** yang muncul saat user klik produk dari katalog. Dari modal ini user bisa langsung add to cart atau klik ke full product detail.

| Halaman | MVP? | Alasan |
|---------|------|--------|
| Homepage | ✅ | First impression, brand statement |
| Shop / All Products | ✅ | Core browsing experience |
| Category filter | ✅ | Navigasi katalog |
| Product Detail | ✅ | Info lengkap sebelum beli |
| Quick View Modal | ✅ | Shortcut belanja dari katalog |
| Cart | ✅ | Review sebelum checkout |
| Checkout | ✅ | Transaksi |
| Footer | ✅ | Trust signals, newsletter, links |
| About / Brand Story | ❌ Phase 2 | Bagus tapi bukan blocker untuk jualan |
| Search | ❌ Phase 2 | Dengan <30 produk, browsing cukup |
| User Account | ❌ Phase 2 | Guest checkout dulu |

---

## 4. APP FLOW

### Flow Utama: Browse → Purchase

```
[Homepage]
  → User melihat hero image + featured products
  → Klik "SHOP" di header ATAU scroll ke featured products

[Shop Page]
  → Dropdown kategori terbuka (atau halaman katalog penuh)
  → User memilih kategori atau melihat All Products
  → Grid produk tampil: foto, nama, harga, status (sold out/preorder badge)

[Quick View Modal]
  → User klik produk dari grid
  → Modal muncul: foto produk, nama, harga, size selector, quantity, "Add to Cart", "Buy It Now", link ke "View Full Details"
  → User pilih size + quantity → klik "Add to Cart"
  → Modal tertutup, cart icon di header menunjukkan jumlah item

[Product Detail Page] (alternatif dari quick view)
  → Foto besar, deskripsi lengkap, size guide, material info
  → Size + quantity selector
  → "Add to Cart" + "Buy It Now"

[Cart Page]
  → List item: foto, nama, size, quantity (adjustable), harga per item, total
  → Order special instructions (textarea)
  → Estimated total
  → Tombol "Checkout"

[Checkout Page]
  → Contact: email / phone
  → Delivery: nama, alamat lengkap (Indonesia), provinsi, kota, kode pos
  → Shipping method (otomatis atau manual)
  → Payment method
  → Order summary sidebar
  → Tombol "Place Order"

[Order Confirmation]
  → Konfirmasi order berhasil
  → Nomor order
  → Instruksi pembayaran (jika transfer manual) atau konfirmasi payment gateway
```

### Flow Alternatif

**Sold Out:**
- Badge "Sold Out" di grid dan detail
- Size selector disabled
- Tombol berubah menjadi "Sold Out" (disabled) atau "Notify Me" (Phase 2)
- User tetap bisa lihat detail produk

**Preorder:**
- Badge "Pre-Order" di grid
- Estimasi tanggal pengiriman ditampilkan
- Tombol berubah menjadi "Pre-Order" (tetap aktif, masuk cart sebagai preorder item)
- Di cart, item preorder ditandai dengan label dan estimasi kirim

**Browse Only:**
- User bisa browse tanpa hambatan
- Tidak ada login wall
- Newsletter capture di footer sebagai touchpoint

---

## 5. CORE FEATURES

### MVP (Versi 1)

| Fitur | Detail |
|-------|--------|
| Katalog produk | Grid produk dengan foto, nama, harga, status badge |
| Kategori produk | Filter berdasarkan kategori (dari header dropdown + URL) |
| Product detail page | Foto, deskripsi, size, quantity, add to cart |
| Quick view modal | Versi ringkas product detail, muncul dari grid |
| Size selection | Dropdown atau button group per produk |
| Quantity selector | +/- counter |
| Stock status | Ready / Sold Out / Pre-Order — ditampilkan secara visual |
| Cart | Halaman cart dengan edit quantity, remove item, subtotal |
| Checkout | Form guest checkout dengan alamat Indonesia |
| Payment | Integrasi 1 payment gateway (Midtrans recommended) |
| Shipping | Input manual ongkir oleh admin ATAU flat rate per zona |
| Newsletter email capture | Form sederhana di footer |
| Admin: kelola produk | CRUD produk, varian, stok, status |
| Admin: kelola order | Lihat order masuk, update status |

### Phase 2

| Fitur | Detail |
|-------|--------|
| User account & login | Register, login, order history |
| Search | Search bar dengan autocomplete |
| Wishlist | Simpan produk favorit |
| Notify me (sold out) | Email notification saat restock |
| Discount / promo code | Input kode di checkout |
| About / brand story page | Halaman storytelling brand |
| Size guide | Tabel ukuran per produk |
| Multi-image product gallery | Carousel foto per produk |
| Shipping integration | API kurir (RajaOngkir) untuk kalkulasi otomatis |
| Order tracking | Status pengiriman dengan nomor resi |
| Analytics dashboard admin | Sales overview |

---

## 6. FRONTEND PLAN

### Homepage
- **Hero:** Full-viewport image/video background dengan logo RAWTIX di tengah atau editorial shot. Minimal text. Satu CTA subtle: "Shop Now" atau scroll indicator
- **Below fold:** Featured products grid (4-8 produk pilihan). Heading: "LATEST" atau "COLLECTION"
- **Footer:** Newsletter + social + payment icons + policy links

### Header (persistent di semua halaman)
- **Kiri:** Tombol "SHOP" (uppercase, tanpa border, clean) — klik membuka dropdown kategori
- **Tengah:** Logo RAWTIX
- **Kanan:** Icon search (Phase 2, hidden di MVP), icon cart dengan badge jumlah item
- **Behavior:** Fixed di atas, background hitam, semi-transparent saat di hero lalu solid saat scroll

### Dropdown Kategori (dari tombol SHOP)
- Panel full-width yang slide turun dari header
- List kategori: ALL PRODUCTS, [kategori 1], [kategori 2], dst
- Uppercase, spaced, clean — persis seperti referensi Televisi Star
- Klik di luar atau klik lagi SHOP untuk menutup

### Katalog / Shop Page
- Grid 4 kolom (desktop), 2 kolom (mobile)
- Setiap card: foto produk (square ratio, background netral), nama produk (uppercase), harga (IDR format), badge jika sold out / preorder
- Hover effect: subtle zoom pada foto atau opacity shift
- Tidak ada button "Add to Cart" langsung di grid — klik card membuka Quick View

### Quick View Modal
- Overlay gelap + panel putih atau panel gelap (sesuai brand)
- Layout: foto kiri, info kanan
- Info: nama, harga, size selector, quantity, "Add to Cart", "Buy It Now", "View Full Details →"
- Close button (X) di pojok kanan atas
- Klik di luar modal untuk menutup

### Product Detail Page
- Layout 2 kolom: foto besar di kiri (atau gallery Phase 2), info di kanan
- Info: brand label, nama produk (h1, uppercase), harga, shipping note, size selector, quantity, "Add to Cart", "Buy It Now"
- Di bawah: deskripsi produk, material, care instructions
- Related products di bawah

### Cart Page
- Tabel/list: thumbnail, nama, size, harga satuan, quantity (adjustable), total per item, remove button
- Order special instructions textarea
- Estimated total
- "Checkout" button
- "Continue Shopping" link

### Checkout Page
- 2 kolom: form kiri, order summary kanan
- Form: email/phone, nama, alamat (Indonesia-specific: provinsi, kota, kecamatan, kode pos), shipping method, payment method
- Order summary: list item, subtotal, shipping, total

### Footer
- Section 1: "REGISTER" + email input + submit arrow
- Section 2: Social icons (Instagram wajib, lainnya opsional)
- Section 3: Payment method icons
- Section 4: Policy links (refund, privacy, terms, shipping, contact)
- Section 5: © 2026 rawtix.id

### Responsive Behavior
- Desktop first, lalu collapse ke mobile
- Mobile: header tetap, hamburger tidak perlu (SHOP button tetap bisa dipakai), grid jadi 2 kolom, quick view jadi full-screen modal, checkout jadi single column

### Micro-interactions
- Hover pada product card: foto zoom subtle (scale 1.02-1.05)
- Cart badge: number update dengan subtle pulse
- Modal: fade in + slide up
- Page transitions: fade
- Button hover: opacity atau border appear

### Komponen Reusable Utama
1. `ProductCard` — grid item dengan foto, nama, harga, badge
2. `QuickViewModal` — modal pilih opsi produk
3. `SizeSelector` — button group atau dropdown size
4. `QuantitySelector` — +/- counter
5. `CartItem` — row item di cart
6. `Header` — logo, shop button, cart icon
7. `Footer` — newsletter, social, payment, policies
8. `StatusBadge` — sold out / preorder badge
9. `CategoryDropdown` — panel kategori dari header

### Modifikasi dari Referensi
- **Dipertahankan:** Struktur header (shop kiri, logo tengah, icons kanan), dropdown kategori style, grid katalog clean, quick view pattern, cart layout, checkout flow, footer structure
- **Dimodifikasi:** Warna dan tone disesuaikan rawtix.id (mungkin sedikit lebih warm-dark dibanding Televisi Star yang cool-dark), tipografi disesuaikan, badge style untuk preorder (Televisi Star tidak punya ini), logo RAWTIX sebagai anchor

---

## 7. BACKEND PLAN

### Entitas Data & Tabel Database (Supabase/PostgreSQL)

**`products`**
| Field | Type | Note |
|-------|------|------|
| id | uuid PK | |
| name | text | Nama produk |
| slug | text UNIQUE | URL-friendly |
| description | text | Deskripsi lengkap |
| price | integer | Harga dalam Rupiah (tanpa desimal) |
| category_id | uuid FK | |
| status | enum | 'active', 'sold_out', 'preorder', 'draft' |
| preorder_estimated_date | date | Nullable, hanya untuk preorder |
| featured | boolean | Tampil di homepage |
| sort_order | integer | Urutan tampil |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**`categories`**
| Field | Type |
|-------|------|
| id | uuid PK |
| name | text |
| slug | text UNIQUE |
| sort_order | integer |

**`product_images`**
| Field | Type |
|-------|------|
| id | uuid PK |
| product_id | uuid FK |
| url | text |
| alt_text | text |
| is_primary | boolean |
| sort_order | integer |

**`product_variants`**
| Field | Type | Note |
|-------|------|------|
| id | uuid PK | |
| product_id | uuid FK | |
| size | text | S, M, L, XL, XXL |
| stock | integer | 0 = sold out untuk size ini |
| sku | text | Optional |

**`orders`**
| Field | Type |
|-------|------|
| id | uuid PK |
| order_number | text UNIQUE |
| email | text |
| phone | text |
| customer_name | text |
| address | text |
| city | text |
| province | text |
| postal_code | text |
| special_instructions | text |
| subtotal | integer |
| shipping_cost | integer |
| total | integer |
| status | enum: 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled' |
| payment_method | text |
| payment_reference | text |
| shipping_tracking | text |
| created_at | timestamptz |
| updated_at | timestamptz |

**`order_items`**
| Field | Type |
|-------|------|
| id | uuid PK |
| order_id | uuid FK |
| product_id | uuid FK |
| variant_id | uuid FK |
| product_name | text (snapshot) |
| size | text (snapshot) |
| price | integer (snapshot) |
| quantity | integer |

**`newsletter_subscribers`**
| Field | Type |
|-------|------|
| id | uuid PK |
| email | text UNIQUE |
| subscribed_at | timestamptz |

### API Endpoints (Server Functions)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| getProducts | GET | List produk (filter: category, status, featured) |
| getProductBySlug | GET | Detail produk + variants + images |
| getCategories | GET | List kategori |
| createOrder | POST | Buat order baru dari cart data |
| getOrderByNumber | GET | Detail order untuk konfirmasi |
| subscribeNewsletter | POST | Simpan email subscriber |

**Admin endpoints (authenticated):**
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| adminGetProducts | GET | List semua produk termasuk draft |
| adminCreateProduct | POST | Tambah produk baru |
| adminUpdateProduct | PUT | Edit produk |
| adminDeleteProduct | DELETE | Hapus produk |
| adminGetOrders | GET | List semua order |
| adminUpdateOrderStatus | PUT | Update status order |
| adminUploadImage | POST | Upload foto produk |

### Stock & Preorder Logic
- Stock dikelola per variant (size)
- Jika semua variant stock = 0, product status otomatis "sold_out"
- Product dengan status "preorder" tetap bisa dibeli, badge preorder ditampilkan
- Saat order dibuat, stock dikurangi (server-side validation)
- Jika stock habis di tengah checkout, tampilkan error

### Cart Logic
- Cart disimpan di **client-side (localStorage)** — tidak perlu cart table di database untuk MVP
- Saat checkout, cart data dikirim ke server untuk validasi stock dan pembuatan order

---

## 8. ADMIN / CMS REQUIREMENTS

### MVP Admin Panel (halaman terpisah, route `/admin`)

| Fitur | Detail |
|-------|--------|
| Product CRUD | Tambah, edit, hapus produk. Set nama, harga, deskripsi, kategori, status |
| Variant management | Tambah/edit size + stock per produk |
| Image upload | Upload foto produk, set primary image |
| Category management | Tambah/edit/hapus kategori |
| Order list | Tabel semua order, filter by status |
| Order detail | Lihat detail order, update status (pending → paid → processing → shipped) |
| Dashboard sederhana | Jumlah order hari ini, total revenue (Phase 2 bisa lebih detail) |

**Auth admin:** Supabase Auth dengan email/password. Tabel `user_roles` terpisah dengan role 'admin'. RLS policy memastikan hanya admin yang bisa akses admin endpoints.

---

## 9. TECH DECISION FOR LOVABLE

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Frontend | TanStack Start (sudah ter-setup) | Framework yang sudah ada, SSR support, routing built-in |
| Styling | Tailwind CSS v4 (sudah ter-setup) | Utility-first, dark theme mudah, sudah dikonfigurasi |
| Database | Supabase PostgreSQL | Gratis tier cukup untuk MVP, RLS, realtime, storage |
| Auth (admin) | Supabase Auth | Simple email/password untuk admin |
| Storage (gambar) | Supabase Storage | Terintegrasi, mudah upload dari admin panel |
| Payment | **Midtrans** (Snap) | Payment gateway Indonesia paling populer, support QRIS/VA/e-wallet/CC, sandbox untuk testing |
| Shipping | Manual / flat rate | Phase 1 manual input ongkir. Phase 2 integrasi RajaOngkir |
| Cart | localStorage | Cepat, tidak perlu backend, cukup untuk guest checkout |
| State management | React state + context | Cart context global, tidak perlu Redux |
| Admin | Route-based (`/admin/*`) | Bagian dari app yang sama, dilindungi auth + RLS |

**Kenapa Midtrans:** Karena target market Indonesia, Midtrans support semua metode pembayaran lokal (QRIS, GoPay, OVO, Dana, VA BCA/BNI/Mandiri, Alfamart, Indomaret, CC). Snap.js modal-based checkout — user tidak perlu keluar dari website.

---

## 10. BUILD PRIORITY

### Sprint 1: Foundation + Katalog (Minggu 1-2)
1. Setup theme dark (CSS variables, background hitam, teks putih)
2. Buat Header component (logo, SHOP button, cart icon)
3. Buat Footer component
4. Setup Supabase: tabel products, categories, product_variants, product_images
5. Seed data: 5-10 produk dummy dengan kategori
6. Buat halaman Shop (katalog grid) dengan data dari Supabase
7. Buat Category dropdown dari header

**Dependency:** Selesai sebelum lanjut. Ini adalah kerangka utama.

### Sprint 2: Product Detail + Quick View (Minggu 2-3)
1. Buat Product Detail page (`/product/[slug]`)
2. Buat Quick View modal (trigger dari product card)
3. Buat SizeSelector + QuantitySelector components
4. Implementasi status badge (sold out, preorder)
5. Buat Homepage hero + featured products

**Dependency:** Sprint 1 selesai (data produk + layout).

### Sprint 3: Cart + Checkout (Minggu 3-4)
1. Implementasi cart context (localStorage-based)
2. Buat Cart page
3. Buat Checkout page (form + order summary)
4. Setup tabel orders + order_items
5. Server function: createOrder dengan stock validation
6. Order confirmation page

**Dependency:** Sprint 2 selesai (bisa add to cart dari product/quick view).

### Sprint 4: Payment + Admin (Minggu 4-5)
1. Integrasi Midtrans Snap (sandbox dulu)
2. Payment callback handling
3. Admin auth setup (Supabase Auth + user_roles)
4. Admin: product CRUD
5. Admin: order management
6. Admin: image upload ke Supabase Storage

**Dependency:** Sprint 3 selesai (order flow exists).

### Sprint 5: Polish + Launch Prep (Minggu 5-6)
1. Responsive mobile optimization
2. Newsletter subscribe
3. Loading states, error states, empty states
4. SEO meta tags
5. Testing end-to-end flow
6. Switch Midtrans ke production
7. Domain setup

---

## 11. RISK CHECK

| Risiko | Severity | Mitigasi |
|--------|----------|----------|
| Brand mismatch — website tidak terasa seperti rawtix.id | Tinggi | Review visual di setiap sprint. Pastikan dark theme, typography, dan spacing konsisten. Jangan compromise demi kecepatan |
| Checkout Indonesia belum matang | Tinggi | Gunakan Midtrans Snap yang sudah handle UI payment. Jangan build payment form sendiri |
| Stock dan preorder bentrok | Sedang | Logic jelas: stock per variant, status per product. Preorder = status terpisah, bukan stock 0 |
| Foto produk berkualitas rendah merusak kesan premium | Tinggi | Minta rawtix.id siapkan foto produk high-res dengan background konsisten sebelum launch. Ini non-negotiable |
| Referensi terlalu ditiru | Sedang | Fokus pada pola UX, bukan pixel-perfect copy. Sesuaikan typography, spacing, dan detail visual ke karakter rawtix.id |
| Cart di localStorage hilang | Rendah | Acceptable di MVP. Phase 2 bisa sync ke server jika user login |
| Shipping manual tidak scalable | Sedang | Cukup untuk MVP dengan volume rendah. Phase 2 integrasi RajaOngkir |
| Admin panel terlalu sederhana | Rendah | MVP admin cukup CRUD. Upgrade bertahap sesuai kebutuhan operasional |

---

## 12. FINAL RECOMMENDATION

**Bentuk MVP terbaik:** Website 6 halaman (Home, Shop, Product Detail, Cart, Checkout, Confirmation) + Quick View modal + Admin panel sederhana. Guest checkout only. Midtrans payment. Dark, minimal, editorial. Bisa launch dalam 5-6 minggu.

**Wajib dijaga:**
- Tone visual gelap dan premium di setiap halaman tanpa exception
- Flow belanja yang smooth: browse → pick → cart → pay
- Foto produk sebagai hero — bukan UI yang jadi pusat perhatian
- Logo RAWTIX sebagai anchor identity

**Jangan dilakukan:**
- Jangan tambah fitur user account di MVP
- Jangan buat payment form sendiri — pakai Midtrans Snap
- Jangan tambah warna cerah
- Jangan buat navigasi berlapis-lapis
- Jangan launch tanpa foto produk yang layak

**Keputusan terpenting sebelum build:**
1. Konfirmasi kategori produk yang akan dipakai (misal: Tops, Bottoms, Accessories, atau yang lain?)
2. Konfirmasi apakah flat rate shipping cukup untuk MVP atau perlu integrasi kurir dari awal
3. Konfirmasi payment gateway: Midtrans atau alternatif lain?
4. Konfirmasi: apakah foto produk high-res sudah tersedia?
5. Konfirmasi: apakah ada fitur preorder yang aktif dari hari pertama, atau bisa ditambahkan nanti?

---

## STEP 5: ALIGNMENT CHECK

| # | Keputusan Kritis | Rekomendasi Default |
|---|-------------------|---------------------|
| 1 | Kategori produk | Gunakan kategori generik dulu (All Products, Tops, Bottoms, Accessories) — bisa diubah via admin |
| 2 | Shipping method | Flat rate per zona (Jabodetabek / Jawa / Luar Jawa) — paling cepat diimplementasi |
| 3 | Payment gateway | Midtrans Snap — paling lengkap untuk Indonesia |
| 4 | Guest checkout vs user account | Guest checkout only di MVP — mengurangi complexity 40% |
| 5 | Preorder di MVP? | Ya, masukkan — karena rawtix.id sudah menjalankan preorder di Instagram, ini expected behavior |

Semua rekomendasi default di atas sudah diterapkan dalam planning ini. Validasi jika ada yang perlu diubah, tapi planning ini sudah siap dieksekusi apa adanya.


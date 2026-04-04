import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <PolicyLayout title="Kebijakan Pengembalian">
      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Syarat Pengembalian
        </h2>
        <p>
          Kami menerima pengajuan pengembalian atau penukaran produk dalam waktu
          <strong className="text-foreground"> 7 hari</strong> setelah barang diterima, dengan
          ketentuan berikut:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Produk belum pernah dipakai, dicuci, atau diubah</li>
          <li>Tag dan label masih terpasang</li>
          <li>Produk dalam kondisi asli dan lengkap dengan kemasan</li>
          <li>Disertai bukti pembelian (nomor pesanan atau screenshot konfirmasi)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Pengecualian
        </h2>
        <p>Produk berikut tidak dapat dikembalikan atau ditukar:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Produk pre-order atau custom</li>
          <li>Produk yang sudah dipakai atau dicuci</li>
          <li>Produk sale / diskon khusus</li>
        </ul>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Proses Pengembalian
        </h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Hubungi kami melalui WhatsApp atau email dengan nomor pesanan</li>
          <li>Tim kami akan memverifikasi dan memberikan instruksi pengiriman</li>
          <li>Kirim produk ke alamat yang diberikan (ongkir ditanggung pembeli)</li>
          <li>
            Setelah produk diterima dan lolos pemeriksaan, refund akan diproses
            dalam 3–7 hari kerja
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Refund
        </h2>
        <p>
          Refund dilakukan melalui transfer bank ke rekening yang Anda tentukan.
          Ongkos kirim awal tidak termasuk dalam pengembalian dana, kecuali
          kesalahan ada di pihak kami (produk salah atau cacat).
        </p>
      </section>
    </PolicyLayout>
  );
}

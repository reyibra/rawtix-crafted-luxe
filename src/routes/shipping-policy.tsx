import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const Route = createFileRoute("/shipping-policy")({
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Kebijakan Pengiriman">
      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Proses Pesanan
        </h2>
        <p>
          Pesanan akan diproses dalam waktu 1–3 hari kerja setelah pembayaran
          dikonfirmasi. Untuk produk pre-order, estimasi waktu pengiriman akan
          diinformasikan di halaman produk.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Estimasi Pengiriman
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Jabodetabek: 2–4 hari kerja</li>
          <li>Pulau Jawa: 3–5 hari kerja</li>
          <li>Luar Jawa: 5–10 hari kerja</li>
          <li>Indonesia Timur: 7–14 hari kerja</li>
        </ul>
        <p className="mt-2">
          Estimasi di atas dapat bervariasi tergantung kondisi kurir dan lokasi
          tujuan.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Biaya Pengiriman
        </h2>
        <p>
          Biaya pengiriman dihitung berdasarkan berat paket dan lokasi tujuan.
          Detail biaya akan diinformasikan saat proses konfirmasi pesanan.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Keterlambatan Pengiriman
        </h2>
        <p>
          Jika pesanan belum sampai melebihi estimasi waktu, hubungi kami melalui
          WhatsApp. Kami akan membantu melacak paket Anda melalui ekspedisi
          terkait.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Alamat Salah
        </h2>
        <p>
          Pastikan alamat pengiriman yang Anda masukkan sudah benar dan lengkap.
          Kami tidak bertanggung jawab atas keterlambatan atau kegagalan
          pengiriman akibat alamat yang tidak akurat. Biaya pengiriman ulang
          ditanggung oleh pembeli.
        </p>
      </section>
    </PolicyLayout>
  );
}

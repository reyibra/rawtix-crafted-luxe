import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Kebijakan Privasi">
      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Data yang Kami Kumpulkan
        </h2>
        <p>
          Saat Anda melakukan pemesanan di rawtix.id, kami mengumpulkan informasi
          yang diperlukan untuk memproses pesanan Anda:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Nama lengkap</li>
          <li>Alamat email</li>
          <li>Nomor telepon</li>
          <li>Alamat pengiriman</li>
        </ul>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Penggunaan Data
        </h2>
        <p>Data Anda digunakan untuk:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Memproses dan mengirimkan pesanan</li>
          <li>Menghubungi Anda terkait pesanan</li>
          <li>Mengirimkan informasi promo jika Anda berlangganan newsletter</li>
        </ul>
        <p className="mt-2">
          Kami tidak menjual, menyewakan, atau membagikan data pribadi Anda
          kepada pihak ketiga untuk keperluan pemasaran.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Keamanan Data
        </h2>
        <p>
          Kami menggunakan langkah-langkah keamanan standar industri untuk
          melindungi data Anda. Namun, tidak ada metode transmisi data melalui
          internet yang 100% aman, dan kami tidak bisa menjamin keamanan absolut.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Hak Anda
        </h2>
        <p>
          Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda
          yang kami simpan. Hubungi kami melalui WhatsApp atau email untuk
          mengajukan permintaan tersebut.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Cookie
        </h2>
        <p>
          Website kami menggunakan cookie dan penyimpanan lokal untuk menyimpan
          keranjang belanja Anda. Kami tidak menggunakan cookie pelacakan pihak
          ketiga.
        </p>
      </section>
    </PolicyLayout>
  );
}

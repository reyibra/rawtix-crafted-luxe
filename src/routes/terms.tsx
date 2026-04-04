import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/layout/PolicyLayout";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <PolicyLayout title="Syarat & Ketentuan">
      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Umum
        </h2>
        <p>
          Dengan mengakses dan menggunakan website rawtix.id, Anda menyetujui
          syarat dan ketentuan yang berlaku. Jika Anda tidak setuju dengan bagian
          mana pun dari ketentuan ini, harap tidak menggunakan layanan kami.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Pemesanan
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Setiap pesanan yang berhasil disubmit merupakan komitmen pembelian
          </li>
          <li>
            Harga yang tertera sudah final kecuali disebutkan lain
          </li>
          <li>
            Ketersediaan produk dapat berubah sewaktu-waktu tanpa pemberitahuan
          </li>
          <li>
            Kami berhak membatalkan pesanan jika terjadi kesalahan harga atau
            stok
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Pembayaran
        </h2>
        <p>
          Pembayaran dilakukan melalui metode yang tersedia saat checkout. Pesanan
          akan diproses setelah pembayaran dikonfirmasi. Pesanan yang belum
          dibayar dalam waktu 1×24 jam dapat dibatalkan secara otomatis.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Produk
        </h2>
        <p>
          Kami berusaha menampilkan warna dan detail produk seakurat mungkin.
          Namun, warna yang terlihat di layar Anda mungkin sedikit berbeda dari
          produk aslinya. Perbedaan minor pada warna tidak menjadi dasar
          pengembalian.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Perubahan Ketentuan
        </h2>
        <p>
          Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan
          akan berlaku segera setelah dipublikasikan di website. Penggunaan
          berkelanjutan atas layanan kami setelah perubahan berarti Anda menyetujui
          ketentuan yang diperbarui.
        </p>
      </section>
    </PolicyLayout>
  );
}

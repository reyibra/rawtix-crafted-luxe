import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { z } from "zod";

const searchSchema = z.object({
  order: z.string().optional(),
});

export const Route = createFileRoute("/order-success")({
  validateSearch: (search) => searchSchema.parse(search),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { order } = useSearch({ from: "/order-success" });

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-[72px] flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Tidak ada pesanan ditemukan.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block text-xs tracking-[0.2em] uppercase border-b border-foreground pb-1"
            >
              Belanja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-[72px] flex items-center justify-center py-20 px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-12 h-12 mx-auto border border-foreground/30 flex items-center justify-center">
            <span className="text-foreground text-lg">✓</span>
          </div>

          <h1 className="font-heading text-xs tracking-[0.3em] uppercase">
            Pesanan Diterima
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Terima kasih telah berbelanja di RAWTIX. Pesanan Anda sedang kami
            proses. Kami akan menghubungi Anda melalui email atau WhatsApp untuk
            konfirmasi pembayaran.
          </p>

          <div className="border border-border p-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nomor Pesanan</span>
              <span className="font-heading tracking-wide">{order}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-xs tracking-[0.15em] uppercase">
                Menunggu Pembayaran
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Simpan nomor pesanan Anda untuk referensi. Hubungi kami via WhatsApp
            di{" "}
            <a
              href="https://wa.me/6285719636329"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-muted-foreground transition-colors border-b border-foreground/30"
            >
              +62 857-1963-6329
            </a>{" "}
            jika ada pertanyaan.
          </p>

          <Link
            to="/shop"
            className="inline-block px-8 py-3 text-xs tracking-[0.25em] uppercase border border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Lanjut Belanja
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

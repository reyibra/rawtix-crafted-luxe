import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/layout/PolicyLayout";
import { Instagram } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <PolicyLayout title="Kontak">
      <p>
        Ada pertanyaan tentang produk, pesanan, atau kolaborasi? Hubungi kami
        melalui channel berikut. Kami akan merespon dalam 1×24 jam pada hari
        kerja.
      </p>

      <div className="space-y-4 mt-6">
        <a
          href="https://wa.me/6285719636329"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors group"
        >
          <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:border-foreground/50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <span className="text-xs tracking-[0.15em] uppercase block">
              WhatsApp
            </span>
            <span className="text-sm">+62 857-1963-6329</span>
          </div>
        </a>

        <a
          href="https://www.instagram.com/rawtix.id"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors group"
        >
          <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:border-foreground/50 transition-colors">
            <Instagram className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-xs tracking-[0.15em] uppercase block">
              Instagram
            </span>
            <span className="text-sm">@rawtix.id</span>
          </div>
        </a>

        <a
          href="https://www.tiktok.com/@rawtix.official"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors group"
        >
          <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:border-foreground/50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </div>
          <div>
            <span className="text-xs tracking-[0.15em] uppercase block">
              TikTok
            </span>
            <span className="text-sm">@rawtix.official</span>
          </div>
        </a>
      </div>

      <section className="mt-8">
        <h2 className="text-foreground font-heading text-xs tracking-[0.2em] uppercase mb-3">
          Jam Operasional
        </h2>
        <p>
          Senin – Jumat: 09.00 – 17.00 WIB
          <br />
          Sabtu: 09.00 – 14.00 WIB
          <br />
          Minggu & Hari Libur: Tutup
        </p>
      </section>
    </PolicyLayout>
  );
}

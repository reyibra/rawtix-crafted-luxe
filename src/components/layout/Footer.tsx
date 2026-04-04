import { useState } from "react";
import { Instagram, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });
      if (error) {
        if (error.code === "23505") {
          toast.info("Email sudah terdaftar");
        } else {
          throw error;
        }
      } else {
        toast.success("Berhasil berlangganan!");
        setEmail("");
      }
    } catch {
      toast.error("Gagal, coba lagi nanti");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-border mt-20">
      <div className="px-6 md:px-10 py-12 space-y-10">
        {/* Top: Newsletter + Contact */}
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          {/* Newsletter — Left */}
          <div className="max-w-md">
            <h3 className="font-heading text-xs tracking-[0.3em] uppercase mb-4">
              Register
            </h3>
            <form
              onSubmit={handleSubscribe}
              className="flex border-b border-foreground/30"
            >
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-sm py-2 outline-none placeholder:text-muted-foreground"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Contact — Right */}
          <div>
            <h3 className="font-heading text-xs tracking-[0.3em] uppercase mb-4">
              Kontak
            </h3>
            <div className="space-y-2">
              <a
                href="https://www.instagram.com/rawtix.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.tiktok.com/@rawtix.official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
                <span>TikTok</span>
              </a>
              <a
                href="https://wa.me/6285719636329"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Policy Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground tracking-wide uppercase">
          <Link
            to="/refund-policy"
            className="hover:text-foreground transition-colors"
          >
            Refund Policy
          </Link>
          <Link
            to="/privacy-policy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            to="/shipping-policy"
            className="hover:text-foreground transition-colors"
          >
            Shipping Policy
          </Link>
          <Link
            to="/contact"
            className="hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          © 2026 rawtix.id. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

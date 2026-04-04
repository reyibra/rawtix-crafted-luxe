import { useState } from "react";
import { Instagram, ArrowRight } from "lucide-react";
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
        {/* Newsletter */}
        <div className="max-w-md">
          <h3 className="font-heading text-xs tracking-[0.3em] uppercase mb-4">
            Register
          </h3>
          <form onSubmit={handleSubscribe} className="flex border-b border-foreground/30">
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

        {/* Social */}
        <div className="flex gap-4">
          <a
            href="https://instagram.com/rawtix.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            <Instagram className="w-5 h-5" strokeWidth={1.5} />
          </a>
        </div>

        {/* Policy Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground tracking-wide uppercase">
          <span>Refund Policy</span>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Shipping Policy</span>
          <span>Contact</span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          © 2026 rawtix.id. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

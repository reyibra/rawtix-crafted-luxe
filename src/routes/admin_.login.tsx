import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyAdmin } from "@/utils/admin.functions";

export const Route = createFileRoute("/admin_/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      await verifyAdmin({ data: { token: data.session.access_token } });

      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login gagal";
      if (msg.includes("Forbidden") || msg.includes("not an admin")) {
        setError("Akun ini tidak memiliki akses admin.");
        await supabase.auth.signOut();
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold tracking-[0.15em] uppercase text-center text-foreground mb-8">
          RAWTIX ADMIN
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs tracking-wider uppercase text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="admin@rawtix.id"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-muted-foreground mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs tracking-[0.2em] uppercase bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { createFileRoute, Outlet, Link, useNavigate, redirect } from "@tanstack/react-router";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";
import { LayoutDashboard, ShoppingCart, Package, FolderOpen, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayoutWrapper,
});

function AdminLayoutWrapper() {
  return (
    <AdminAuthProvider>
      <AdminLayoutGuard />
    </AdminAuthProvider>
  );
}

const navItems = [
  { to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders" as const, label: "Pesanan", icon: ShoppingCart },
  { to: "/admin/products" as const, label: "Produk", icon: Package },
  { to: "/admin/categories" as const, label: "Kategori", icon: FolderOpen },
];

function AdminLayoutGuard() {
  const { isAuthenticated, isLoading, logout, user } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate({ to: "/admin/login" });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="font-heading text-sm font-bold tracking-[0.2em] uppercase text-foreground">
            RAWTIX
          </Link>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              activeProps={{ className: "!text-foreground !bg-accent" }}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground truncate mb-2">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-3 border-b border-border bg-card">
          <span className="font-heading text-sm font-bold tracking-[0.2em] uppercase text-foreground">RAWTIX</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="md:hidden bg-card border-b border-border p-2 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                activeProps={{ className: "!text-foreground !bg-accent" }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

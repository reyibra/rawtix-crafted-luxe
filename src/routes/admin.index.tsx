import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getAdminDashboardStats } from "@/utils/admin.functions";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, Clock, CreditCard } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { token } = useAdminAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getAdminDashboardStats({ data: { token: token! } }),
    enabled: !!token,
  });

  if (isLoading || !stats) {
    return <div className="text-sm text-muted-foreground">Memuat dashboard...</div>;
  }

  const metrics = [
    { label: "Total Pesanan", value: stats.totalOrders, icon: ShoppingCart },
    { label: "Menunggu Pembayaran", value: stats.pendingOrders, icon: Clock },
    { label: "Bukti Dikirim", value: stats.proofSubmitted, icon: CreditCard },
    { label: "Total Produk", value: stats.totalProducts, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] tracking-wider uppercase text-muted-foreground">{m.label}</span>
            </div>
            <p className="font-heading text-2xl font-bold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground">Pesanan Terbaru</h2>
          <Link to="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Lihat Semua →
          </Link>
        </div>

        <div className="border border-border divide-y divide-border">
          {stats.recentOrders.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Belum ada pesanan.</div>
          ) : (
            stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                to="/admin/orders/$id"
                params={{ id: order.id }}
                className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">Rp {order.total.toLocaleString("id-ID")}</p>
                  <StatusBadge status={order.status} proof={!!order.payment_proof_url} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, proof }: { status: string; proof?: boolean }) {
  const colors: Record<string, string> = {
    pending: proof ? "text-yellow-400" : "text-muted-foreground",
    paid: "text-green-400",
    processing: "text-blue-400",
    shipped: "text-purple-400",
    delivered: "text-green-400",
    cancelled: "text-destructive",
  };

  const labels: Record<string, string> = {
    pending: proof ? "Bukti dikirim" : "Pending",
    paid: "Dibayar",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <span className={`text-[10px] tracking-wider uppercase ${colors[status] ?? "text-muted-foreground"}`}>
      {labels[status] ?? status}
    </span>
  );
}

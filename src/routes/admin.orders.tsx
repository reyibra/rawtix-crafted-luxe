import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getAdminOrders } from "@/utils/admin.functions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

const STATUS_TABS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "delivered", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

function AdminOrdersPage() {
  const { token } = useAdminAuth();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: () => getAdminOrders({ data: { token: token!, status, page, perPage: 20 } }),
    enabled: !!token,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground">Pesanan</h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-3 py-1.5 text-[10px] tracking-wider uppercase transition-colors border ${
              status === tab.value
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Memuat...</div>
      ) : !data || data.orders.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8 border border-border">Tidak ada pesanan.</div>
      ) : (
        <>
          <div className="border border-border divide-y divide-border">
            <div className="hidden md:grid grid-cols-6 gap-2 px-3 py-2 text-[10px] tracking-wider uppercase text-muted-foreground bg-card">
              <span>Order</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Status</span>
              <span>Bukti</span>
              <span>Tanggal</span>
            </div>
            {data.orders.map((order) => (
              <Link
                key={order.id}
                to="/admin/orders/$id"
                params={{ id: order.id }}
                className="grid grid-cols-2 md:grid-cols-6 gap-2 px-3 py-3 hover:bg-accent/50 transition-colors items-center"
              >
                <span className="text-sm font-medium text-foreground">{order.order_number}</span>
                <div>
                  <p className="text-sm text-foreground truncate">{order.customer_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate md:hidden">{order.email}</p>
                </div>
                <span className="text-sm text-foreground">Rp {order.total.toLocaleString("id-ID")}</span>
                <OrderStatusBadge status={order.status} />
                <span className="text-xs">
                  {order.payment_proof_url ? (
                    <span className="text-green-400">✓ Ada</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("id-ID")}
                </span>
              </Link>
            ))}
          </div>

          {data.total > 20 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-xs text-muted-foreground">Hal. {page}</span>
              <button
                disabled={(page * 20) >= data.total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    paid: "bg-green-500/10 text-green-400",
    processing: "bg-blue-500/10 text-blue-400",
    shipped: "bg-purple-500/10 text-purple-400",
    delivered: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] tracking-wider uppercase ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getAdminOrderDetail, updateOrderStatus } from "@/utils/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/orders/$id")({
  component: AdminOrderDetailPage,
});

const STATUS_ACTIONS: { from: string[]; to: string; label: string; color: string }[] = [
  { from: ["pending"], to: "paid", label: "Verifikasi Pembayaran", color: "bg-green-600 hover:bg-green-700" },
  { from: ["paid"], to: "processing", label: "Proses Pesanan", color: "bg-blue-600 hover:bg-blue-700" },
  { from: ["processing"], to: "shipped", label: "Tandai Dikirim", color: "bg-purple-600 hover:bg-purple-700" },
  { from: ["shipped"], to: "delivered", label: "Tandai Selesai", color: "bg-green-600 hover:bg-green-700" },
  { from: ["pending", "paid", "processing"], to: "cancelled", label: "Batalkan", color: "bg-red-600 hover:bg-red-700" },
];

function AdminOrderDetailPage() {
  const { id } = Route.useParams();
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getAdminOrderDetail({ data: { token: token!, orderId: id } }),
    enabled: !!token,
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      updateOrderStatus({ data: { token: token!, orderId: id, status: newStatus as "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setConfirmAction(null);
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Memuat...</div>;
  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Pesanan tidak ditemukan.</p>
        <Link to="/admin/orders" className="text-xs text-foreground hover:underline mt-2 inline-block">← Kembali</Link>
      </div>
    );
  }

  const { order, items } = data;
  const availableActions = STATUS_ACTIONS.filter((a) => a.from.includes(order.status));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/orders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-lg font-bold tracking-wider uppercase text-foreground">
          {order.order_number}
        </h1>
        <span className="px-2 py-0.5 text-[10px] tracking-wider uppercase bg-accent text-accent-foreground">
          {order.status}
        </span>
      </div>

      {/* Status Actions */}
      {availableActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => (
            <div key={action.to}>
              {confirmAction === action.to ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Yakin?</span>
                  <button
                    onClick={() => statusMutation.mutate(action.to)}
                    disabled={statusMutation.isPending}
                    className={`px-3 py-1.5 text-[10px] tracking-wider uppercase text-white ${action.color} disabled:opacity-50`}
                  >
                    Ya
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-3 py-1.5 text-[10px] tracking-wider uppercase text-muted-foreground border border-border hover:text-foreground"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmAction(action.to)}
                  className={`px-3 py-1.5 text-[10px] tracking-wider uppercase text-white ${action.color}`}
                >
                  {action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Customer info */}
        <div className="border border-border p-4 space-y-2">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground mb-3">Customer</h2>
          <InfoRow label="Nama" value={order.customer_name} />
          <InfoRow label="Email" value={order.email} />
          <InfoRow label="Telepon" value={order.phone || "—"} />
          <InfoRow label="Alamat" value={order.address} />
          <InfoRow label="Kota" value={`${order.city}, ${order.province} ${order.postal_code}`} />
          {order.special_instructions && (
            <InfoRow label="Catatan" value={order.special_instructions} />
          )}
        </div>

        {/* Payment info */}
        <div className="border border-border p-4 space-y-2">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground mb-3">Pembayaran</h2>
          <InfoRow label="Metode" value={order.payment_method || "—"} />
          <InfoRow label="Subtotal" value={`Rp ${order.subtotal.toLocaleString("id-ID")}`} />
          <InfoRow label="Ongkir" value={`Rp ${order.shipping_cost.toLocaleString("id-ID")}`} />
          <InfoRow label="Total" value={`Rp ${order.total.toLocaleString("id-ID")}`} />
          <InfoRow
            label="Bukti"
            value={
              order.payment_proof_url ? (
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  Lihat Bukti <ExternalLink className="w-3 h-3" />
                </a>
              ) : "Belum ada"
            }
          />
          {order.payment_proof_submitted_at && (
            <InfoRow label="Dikirim" value={new Date(order.payment_proof_submitted_at).toLocaleString("id-ID")} />
          )}
        </div>
      </div>

      {/* Payment proof preview */}
      {order.payment_proof_url && (
        <div className="border border-border p-4">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground mb-3">Preview Bukti Pembayaran</h2>
          <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
            <img
              src={order.payment_proof_url}
              alt="Bukti pembayaran"
              className="max-h-80 object-contain border border-border"
            />
          </a>
        </div>
      )}

      {/* Order items */}
      <div className="border border-border">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground">Item Pesanan</h2>
        </div>
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-foreground">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
              </div>
              <p className="text-sm text-foreground">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Dibuat: {new Date(order.created_at).toLocaleString("id-ID")}</p>
        <p>Diperbarui: {new Date(order.updated_at).toLocaleString("id-ID")}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm text-foreground break-all">{value}</span>
    </div>
  );
}

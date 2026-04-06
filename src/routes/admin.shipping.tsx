import { createFileRoute } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getAdminShippingRates, createShippingRate, updateShippingRate, deleteShippingRate } from "@/utils/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/shipping")({
  component: AdminShippingPage,
});

function AdminShippingPage() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: 0, isDefault: false, active: true, sortOrder: 0 });
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-shipping"],
    queryFn: () => getAdminShippingRates({ data: { token: token! } }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: () => createShippingRate({ data: { token: token!, ...form } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping"] });
      setForm({ name: "", price: 0, isDefault: false, active: true, sortOrder: 0 });
      setShowAdd(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => updateShippingRate({ data: { token: token!, id, ...form } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShippingRate({ data: { token: token!, id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-shipping"] }),
  });

  const startEdit = (rate: { id: string; name: string; price: number; is_default: boolean; active: boolean; sort_order: number }) => {
    setEditing(rate.id);
    setForm({ name: rate.name, price: rate.price, isDefault: rate.is_default, active: rate.active, sortOrder: rate.sort_order });
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground">Pengiriman</h1>
        <button
          onClick={() => { setShowAdd(true); setForm({ name: "", price: 0, isDefault: false, active: true, sortOrder: 0 }); }}
          className="flex items-center gap-1 px-3 py-1.5 text-[10px] tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="w-3 h-3" /> Tambah
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="border border-border p-4 space-y-3">
          <h2 className="text-xs tracking-wider uppercase text-muted-foreground">Tambah Shipping Rate</h2>
          <ShippingForm form={form} setForm={setForm} />
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.name}
              className="px-4 py-1.5 text-[10px] tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 text-[10px] tracking-wider uppercase text-muted-foreground border border-border hover:text-foreground">
              Batal
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Memuat...</div>
      ) : !data || data.rates.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8 border border-border">Belum ada shipping rate.</div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {data.rates.map((rate) => (
            <div key={rate.id} className="p-4">
              {editing === rate.id ? (
                <div className="space-y-3">
                  <ShippingForm form={form} setForm={setForm} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMutation.mutate(rate.id)}
                      disabled={updateMutation.isPending}
                      className="px-4 py-1.5 text-[10px] tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                    >
                      Update
                    </button>
                    <button onClick={() => setEditing(null)} className="px-4 py-1.5 text-[10px] tracking-wider uppercase text-muted-foreground border border-border">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-medium">{rate.name}</span>
                      {rate.is_default && <span className="text-[9px] bg-accent text-accent-foreground px-1.5 py-0.5 tracking-wider uppercase">Default</span>}
                      {!rate.active && <span className="text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 tracking-wider uppercase">Nonaktif</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">Rp {rate.price.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(rate)} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(rate.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        ⓘ Notifikasi pesanan dicatat secara otomatis. Pengiriman email/WhatsApp otomatis belum aktif — akan diaktifkan setelah provider dikonfigurasi.
      </p>
    </div>
  );
}

function ShippingForm({ form, setForm }: { form: { name: string; price: number; isDefault: boolean; active: boolean; sortOrder: number }; setForm: (f: typeof form) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs tracking-wider uppercase text-muted-foreground mb-1">Nama</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground" />
      </div>
      <div>
        <label className="block text-xs tracking-wider uppercase text-muted-foreground mb-1">Harga (Rp)</label>
        <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground" />
      </div>
      <div className="flex items-center gap-4 col-span-full">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-foreground" />
          Default
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-foreground" />
          Aktif
        </label>
        <div className="flex items-center gap-1">
          <label className="text-xs text-muted-foreground">Urutan:</label>
          <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-16 bg-card border border-border px-2 py-1 text-sm text-foreground" />
        </div>
      </div>
    </div>
  );
}

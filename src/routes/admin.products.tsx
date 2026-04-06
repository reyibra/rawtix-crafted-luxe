import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getAdminProducts, deleteProduct } from "@/utils/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getAdminProducts({ data: { token: token! } }),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { token: token!, id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground">Produk</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah
        </Link>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Memuat...</div>
      ) : !data || data.products.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8 border border-border">Belum ada produk.</div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {data.products.map((product) => {
            const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary);
            const totalStock = product.product_variants?.reduce((sum: number, v: { stock: number }) => sum + v.stock, 0) ?? 0;

            return (
              <div key={product.id} className="flex items-center gap-3 p-3">
                {primaryImage ? (
                  <img src={primaryImage.url} alt={product.name} className="w-12 h-12 object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 bg-card border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                    —
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>Rp {product.price.toLocaleString("id-ID")}</span>
                    <span>·</span>
                    <span className={product.status === "active" ? "text-green-400" : product.status === "sold_out" ? "text-red-400" : "text-yellow-400"}>
                      {product.status}
                    </span>
                    <span>·</span>
                    <span>Stok: {totalStock}</span>
                    {product.categories && <><span>·</span><span>{(product.categories as { name: string }).name}</span></>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to="/admin/products/$id"
                    params={{ id: product.id }}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {deleteId === product.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(product.id)}
                        disabled={deleteMutation.isPending}
                        className="px-2 py-1 text-[10px] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="px-2 py-1 text-[10px] border border-border text-muted-foreground hover:text-foreground"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

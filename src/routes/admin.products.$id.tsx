import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { updateProduct, getAdminProducts, getAdminCategories } from "@/utils/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/products/$id")({
  component: AdminEditProductPage,
});

function AdminEditProductPage() {
  const { id } = Route.useParams();
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getAdminProducts({ data: { token: token! } }),
    enabled: !!token,
  });

  const { data: catData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getAdminCategories({ data: { token: token! } }),
    enabled: !!token,
  });

  const product = productsData?.products?.find((p: { id: string }) => p.id === id);

  const mutation = useMutation({
    mutationFn: (formData: ProductFormData) =>
      updateProduct({
        data: {
          token: token!,
          id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId || null,
          status: formData.status,
          preorderEstimatedDate: formData.preorderEstimatedDate || null,
          featured: formData.featured,
          sortOrder: formData.sortOrder,
          variants: formData.variants,
          imageUrl: formData.imageUrl,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      navigate({ to: "/admin/products" });
    },
  });

  if (loadingProducts) return <div className="text-sm text-muted-foreground">Memuat...</div>;
  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Produk tidak ditemukan.</p>
        <Link to="/admin/products" className="text-xs text-foreground hover:underline mt-2 inline-block">← Kembali</Link>
      </div>
    );
  }

  const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary);

  const initialData: ProductFormData = {
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price: product.price,
    categoryId: product.category_id || "",
    status: product.status,
    preorderEstimatedDate: product.preorder_estimated_date || "",
    featured: product.featured,
    sortOrder: product.sort_order,
    variants: product.product_variants?.map((v: { size: string; stock: number; sku: string | null }) => ({
      size: v.size,
      stock: v.stock,
      sku: v.sku || "",
    })) ?? [],
    imageUrl: primaryImage?.url || "",
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground">Edit Produk</h1>
      </div>
      <ProductForm
        initialData={initialData}
        categories={catData?.categories ?? []}
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
        error={mutation.error?.message}
      />
    </div>
  );
}

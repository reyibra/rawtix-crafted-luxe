import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type ProductWithRelations = Product & {
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

export const Route = createFileRoute("/shop/$category")({
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);

  const { data: categoryData } = useQuery({
    queryKey: ["category", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", category)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!categoryData) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("category_id", categoryData.id)
        .neq("status", "draft")
        .order("sort_order");
      if (error) throw error;
      return data as ProductWithRelations[];
    },
    enabled: !!categoryData,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-[72px] px-6 md:px-10 pb-16">
        <div className="py-10">
          <h1 className="font-heading text-xs tracking-[0.3em] uppercase">
            {categoryData?.name ?? category}
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-secondary animate-pulse" />
                <div className="h-3 bg-secondary animate-pulse w-2/3" />
                <div className="h-3 bg-secondary animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-20 text-center">
            Belum ada produk di kategori ini.
          </p>
        )}
      </main>

      <Footer />

      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

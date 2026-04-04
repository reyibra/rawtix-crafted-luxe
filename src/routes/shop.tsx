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

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

async function fetchAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .neq("status", "draft")
    .order("sort_order");
  if (error) throw error;
  return data as ProductWithRelations[];
}

function ShopPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: fetchAllProducts,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-[72px] px-6 md:px-10 pb-16">
        <div className="py-10">
          <h1 className="font-heading text-xs tracking-[0.3em] uppercase">
            All Products
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
                onQuickView={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-20 text-center">
            Belum ada produk.
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

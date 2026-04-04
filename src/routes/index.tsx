import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/")({
  component: HomePage,
});

async function fetchFeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("featured", true)
    .neq("status", "draft")
    .order("sort_order")
    .limit(8);
  if (error) throw error;
  return data as ProductWithRelations[];
}

function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);

  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: fetchFeaturedProducts,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-background" />
        <div className="relative z-10 text-center">
          <h1 className="font-heading text-3xl md:text-5xl tracking-[0.4em] uppercase font-bold">
            RAWTIX
          </h1>
          <p className="mt-4 text-xs md:text-sm text-muted-foreground tracking-[0.3em] uppercase">
            Independent Fashion Label
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block px-8 py-3 text-xs tracking-[0.25em] uppercase border border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="px-6 md:px-10 py-16">
          <h2 className="font-heading text-xs tracking-[0.3em] uppercase mb-10">
            Latest
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={() => setSelectedProduct(product)}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground/30 hover:border-foreground pb-1"
            >
              View All
            </Link>
          </div>
        </section>
      )}

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

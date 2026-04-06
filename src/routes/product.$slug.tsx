import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { formatPrice } from "@/components/product/ProductCard";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type ProductWithRelations = Product & {
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

export const Route = createFileRoute("/product/$slug")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as ProductWithRelations;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-[72px] px-4 sm:px-6 md:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="aspect-square bg-secondary animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-secondary animate-pulse w-1/2" />
              <div className="h-4 bg-secondary animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-[72px] flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-muted-foreground">Produk tidak ditemukan.</p>
            <Link
              to="/shop"
              className="mt-4 inline-block text-xs tracking-[0.2em] uppercase border-b border-foreground pb-1"
            >
              Kembali ke Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sort images: primary first, then by sort_order
  const sortedImages = [...(product.product_images ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const activeImage = sortedImages[activeImageIndex] ?? sortedImages[0];
  const variants = product.product_variants ?? [];
  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const isSoldOut = product.status === "sold_out";
  const isPreorder = product.status === "preorder";

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariant) {
      toast.error("Pilih ukuran terlebih dahulu");
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      quantity,
      image: activeImage?.url ?? "",
    });
    toast.success("Ditambahkan ke keranjang");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-[72px] px-4 sm:px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-card overflow-hidden">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.alt_text ?? product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                  No Image
                </div>
              )}
            </div>
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 border overflow-hidden transition-colors ${
                      idx === activeImageIndex ? "border-foreground" : "border-border hover:border-foreground/40"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              rawtix.id
            </p>
            <h1 className="font-heading text-lg sm:text-xl tracking-[0.2em] uppercase mt-2">
              {product.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              {formatPrice(product.price)}
            </p>

            {isPreorder && product.preorder_estimated_date && (
              <p className="text-xs text-muted-foreground mt-3 border border-border px-3 py-2 inline-block w-fit">
                Pre-Order — Estimasi kirim{" "}
                {new Date(product.preorder_estimated_date).toLocaleDateString(
                  "id-ID",
                  { month: "long", year: "numeric" }
                )}
              </p>
            )}

            {/* Size */}
            <div className="mt-8">
              <p className="text-xs tracking-[0.2em] uppercase mb-3">Ukuran</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const outOfStock = v.stock <= 0 && !isPreorder;
                  return (
                    <button
                      key={v.id}
                      onClick={() => !outOfStock && setSelectedSize(v.size)}
                      disabled={outOfStock}
                      className={`px-4 py-2 text-xs tracking-wider uppercase border transition-colors ${
                        selectedSize === v.size
                          ? "bg-foreground text-background border-foreground"
                          : outOfStock
                            ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                            : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            {!isSoldOut && (
              <div className="mt-6">
                <p className="text-xs tracking-[0.2em] uppercase mb-3">Jumlah</p>
                <div className="flex items-center border border-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-4 text-sm min-w-[40px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 space-y-3">
              {isSoldOut ? (
                <button
                  disabled
                  className="w-full py-3 text-xs tracking-[0.2em] uppercase bg-muted text-muted-foreground cursor-not-allowed"
                >
                  Sold Out
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 text-xs tracking-[0.2em] uppercase bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  {isPreorder ? "Pre-Order" : "Add to Cart"}
                </button>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-xs tracking-[0.2em] uppercase mb-4">Deskripsi</p>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

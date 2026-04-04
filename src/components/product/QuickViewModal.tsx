import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus } from "lucide-react";
import { formatPrice } from "./ProductCard";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

interface QuickViewModalProps {
  product: Product & {
    product_images: ProductImage[];
    product_variants: ProductVariant[];
  };
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const primaryImage =
    product.product_images?.find((img) => img.is_primary) ??
    product.product_images?.[0];

  const variants = product.product_variants ?? [];
  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const isSoldOut = product.status === "sold_out";
  const isPreorder = product.status === "preorder";

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariant) {
      toast.error("Pilih ukuran terlebih dahulu");
      return;
    }
    if (!isSoldOut && selectedVariant.stock <= 0 && !isPreorder) {
      toast.error("Stok habis untuk ukuran ini");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedSize,
      price: product.price,
      quantity,
      image: primaryImage?.url ?? "",
    });

    toast.success("Ditambahkan ke keranjang");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-card border border-border w-full max-w-3xl pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-foreground hover:text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="aspect-square bg-secondary">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt_text ?? product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                  No Image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h2 className="font-heading text-base tracking-[0.2em] uppercase">
                  {product.name}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {formatPrice(product.price)}
                </p>

                {isPreorder && product.preorder_estimated_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Estimasi kirim:{" "}
                    {new Date(product.preorder_estimated_date).toLocaleDateString(
                      "id-ID",
                      { month: "long", year: "numeric" }
                    )}
                  </p>
                )}

                {/* Size Selector */}
                <div className="mt-6">
                  <p className="text-xs tracking-[0.2em] uppercase mb-3">
                    Ukuran
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const outOfStock =
                        v.stock <= 0 && !isPreorder;
                      return (
                        <button
                          key={v.id}
                          onClick={() =>
                            !outOfStock && setSelectedSize(v.size)
                          }
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
                    <p className="text-xs tracking-[0.2em] uppercase mb-3">
                      Jumlah
                    </p>
                    <div className="flex items-center border border-border w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 text-sm min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

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

                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  onClick={onClose}
                  className="block w-full py-3 text-xs tracking-[0.2em] uppercase text-center border border-border hover:border-foreground transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

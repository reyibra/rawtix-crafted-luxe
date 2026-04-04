import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

interface ProductCardProps {
  product: Product & { product_images: ProductImage[] };
  onClick: () => void;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const primaryImage = product.product_images?.find((img) => img.is_primary)
    ?? product.product_images?.[0];

  return (
    <button
      onClick={onClick}
      className="group text-left w-full focus:outline-none"
    >
      <div className="relative aspect-square overflow-hidden bg-card mb-3">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt_text ?? product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-xs uppercase tracking-widest">
              No Image
            </span>
          </div>
        )}

        {product.status === "sold_out" && (
          <div className="absolute top-3 left-3 bg-destructive/90 text-destructive-foreground px-2 py-1 text-[10px] font-heading tracking-[0.2em] uppercase">
            Sold Out
          </div>
        )}
        {product.status === "preorder" && (
          <div className="absolute top-3 left-3 bg-foreground/90 text-background px-2 py-1 text-[10px] font-heading tracking-[0.2em] uppercase">
            Pre-Order
          </div>
        )}
      </div>

      <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-foreground">
        {product.name}
      </h3>
      <p className="text-xs text-muted-foreground mt-1">
        {formatPrice(product.price)}
      </p>
    </button>
  );
}

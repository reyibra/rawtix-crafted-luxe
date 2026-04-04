import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/components/product/ProductCard";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-[72px] px-6 md:px-10 py-10 max-w-4xl mx-auto">
        <h1 className="font-heading text-xs tracking-[0.3em] uppercase mb-10">
          Keranjang
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">
              Keranjang masih kosong.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block text-xs tracking-[0.2em] uppercase border-b border-foreground pb-1 hover:text-muted-foreground transition-colors"
            >
              Lanjut Belanja
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 pb-6 border-b border-border"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-card flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-heading text-xs tracking-[0.15em] uppercase">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-secondary transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-secondary transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs tracking-[0.2em] uppercase">
                  Subtotal
                </span>
                <span className="font-heading">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Ongkos kirim dihitung saat checkout.
              </p>
              <Link
                to="/checkout"
                className="block w-full py-3 text-xs tracking-[0.2em] uppercase text-center bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Checkout
              </Link>
              <Link
                to="/shop"
                className="block w-full py-3 mt-3 text-xs tracking-[0.2em] uppercase text-center border border-border hover:border-foreground transition-colors"
              >
                Lanjut Belanja
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

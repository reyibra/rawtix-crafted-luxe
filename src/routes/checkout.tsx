import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/components/product/ProductCard";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal } = useCart();
  const shippingCost = 0; // Will be implemented with flat rate
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-[72px] flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Keranjang kosong.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block text-xs tracking-[0.2em] uppercase border-b border-foreground pb-1"
            >
              Belanja dulu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-[72px] px-6 md:px-10 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px] gap-10">
          {/* Form */}
          <div className="space-y-8">
            <h1 className="font-heading text-xs tracking-[0.3em] uppercase">
              Checkout
            </h1>

            {/* Contact */}
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase mb-4">
                Kontak
              </h2>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                />
                <input
                  type="tel"
                  placeholder="Nomor telepon"
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Delivery */}
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase mb-4">
                Alamat Pengiriman
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Alamat"
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Kota"
                    className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Provinsi"
                    className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Kode pos"
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase mb-4">
                Catatan Khusus
              </h2>
              <textarea
                placeholder="Catatan untuk pesanan (opsional)"
                rows={3}
                className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground resize-none"
              />
            </div>

            <button className="w-full py-3 text-xs tracking-[0.2em] uppercase bg-foreground text-background hover:bg-foreground/90 transition-colors">
              Place Order
            </button>
          </div>

          {/* Order Summary */}
          <div className="border border-border p-6 h-fit">
            <h2 className="text-xs tracking-[0.2em] uppercase mb-6">
              Ringkasan Pesanan
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between text-sm"
                >
                  <div>
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      × {item.quantity}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Size: {item.size}
                    </p>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span className="text-muted-foreground text-xs">
                  Dihitung nanti
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-heading">
                <span className="text-xs tracking-[0.2em] uppercase">
                  Total
                </span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

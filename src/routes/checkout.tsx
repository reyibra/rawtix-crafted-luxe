import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/components/product/ProductCard";
import { createOrder } from "@/utils/orders.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

interface ShippingRate {
  id: string;
  name: string;
  price: number;
}

interface FormErrors {
  email?: string;
  phone?: string;
  customerName?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  streetAddress?: string;
  shipping?: string;
}

function validateForm(form: {
  email: string;
  phone: string;
  customerName: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  streetAddress: string;
  selectedShipping: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!form.email.trim()) errors.email = "Email wajib diisi";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Format email tidak valid";

  if (!form.phone.trim()) errors.phone = "Nomor telepon wajib diisi";
  else if (!/^[\d\s+\-()]{8,20}$/.test(form.phone))
    errors.phone = "Format nomor tidak valid";

  if (!form.customerName.trim()) errors.customerName = "Nama wajib diisi";
  if (!form.province.trim()) errors.province = "Provinsi wajib diisi";
  if (!form.city.trim()) errors.city = "Kota wajib diisi";
  if (!form.district.trim()) errors.district = "Kecamatan wajib diisi";
  if (!form.streetAddress.trim()) errors.streetAddress = "Alamat jalan wajib diisi";

  if (!form.postalCode.trim()) errors.postalCode = "Kode pos wajib diisi";
  else if (!/^[\d\-]{3,10}$/.test(form.postalCode))
    errors.postalCode = "Format kode pos tidak valid";

  if (!form.selectedShipping) errors.shipping = "Pilih metode pengiriman";

  return errors;
}

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createOrder);

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    customerName: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    streetAddress: "",
    addressDetail: "",
    specialInstructions: "",
    selectedShipping: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from("shipping_rates")
      .select("id, name, price")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setShippingRates(data);
          const defaultRate = data.find((r: ShippingRate & { is_default?: boolean }) => (r as ShippingRate & { is_default?: boolean }).is_default) || data[0];
          setForm((prev) => ({ ...prev, selectedShipping: defaultRate.id }));
        }
      });
  }, []);

  const selectedRate = shippingRates.find((r) => r.id === form.selectedShipping);
  const shippingCost = selectedRate?.price ?? 0;
  const total = subtotal + shippingCost;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-transparent border ${
      errors[field] ? "border-destructive/60" : "border-border"
    } px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground`;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-[72px] flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Keranjang kosong.</p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setLoading(true);

    try {
      const concatenatedAddress = [
        form.streetAddress,
        form.addressDetail,
        form.district,
        form.city,
        form.province,
        form.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      const result = await createOrderFn({
        data: {
          email: form.email.trim(),
          phone: form.phone.trim(),
          customerName: form.customerName.trim(),
          address: concatenatedAddress,
          province: form.province.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          postalCode: form.postalCode.trim(),
          streetAddress: form.streetAddress.trim(),
          addressDetail: form.addressDetail.trim(),
          specialInstructions: form.specialInstructions.trim(),
          shippingRateId: form.selectedShipping,
          shippingMethodName: selectedRate?.name ?? "",
          shippingCost,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      });

      clearCart();
      navigate({
        to: "/order-success",
        search: { order: result.orderNumber },
      });
    } catch (err) {
      console.error("Order error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Gagal membuat pesanan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-[72px] px-4 sm:px-6 md:px-10 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <h1 className="font-heading text-xs tracking-[0.3em] uppercase">
              Checkout
            </h1>

            {/* Contact */}
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase mb-4">Kontak</h2>
              <div className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass("email")}
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Nomor telepon"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass("phone")}
                  />
                  {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase mb-4">Alamat Pengiriman</h2>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={form.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    className={inputClass("customerName")}
                  />
                  {errors.customerName && <p className="text-destructive text-xs mt-1">{errors.customerName}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Provinsi"
                      value={form.province}
                      onChange={(e) => updateField("province", e.target.value)}
                      className={inputClass("province")}
                    />
                    {errors.province && <p className="text-destructive text-xs mt-1">{errors.province}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Kota / Kabupaten"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={inputClass("city")}
                    />
                    {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Kecamatan"
                      value={form.district}
                      onChange={(e) => updateField("district", e.target.value)}
                      className={inputClass("district")}
                    />
                    {errors.district && <p className="text-destructive text-xs mt-1">{errors.district}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Kode pos"
                      value={form.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      className={inputClass("postalCode")}
                    />
                    {errors.postalCode && <p className="text-destructive text-xs mt-1">{errors.postalCode}</p>}
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Nama jalan / Gedung / Nomor rumah"
                    value={form.streetAddress}
                    onChange={(e) => updateField("streetAddress", e.target.value)}
                    className={inputClass("streetAddress")}
                  />
                  {errors.streetAddress && <p className="text-destructive text-xs mt-1">{errors.streetAddress}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Detail lainnya — blok, unit, patokan (opsional)"
                    value={form.addressDetail}
                    onChange={(e) => updateField("addressDetail", e.target.value)}
                    className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase mb-4">Metode Pengiriman</h2>
              {shippingRates.length === 0 ? (
                <p className="text-sm text-muted-foreground border border-border px-4 py-3">
                  Belum ada opsi pengiriman. Hubungi kami untuk info lebih lanjut.
                </p>
              ) : (
                <div className="space-y-2">
                  {shippingRates.map((rate) => (
                    <label
                      key={rate.id}
                      className={`flex items-center justify-between border px-4 py-3 cursor-pointer transition-colors ${
                        form.selectedShipping === rate.id
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={rate.id}
                          checked={form.selectedShipping === rate.id}
                          onChange={() => updateField("selectedShipping", rate.id)}
                          className="accent-foreground"
                        />
                        <span className="text-sm">{rate.name}</span>
                      </div>
                      <span className="text-sm font-heading">{formatPrice(rate.price)}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.shipping && <p className="text-destructive text-xs mt-1">{errors.shipping}</p>}
            </div>

            {/* Special Instructions */}
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase mb-4">Catatan Khusus</h2>
              <textarea
                placeholder="Catatan untuk pesanan (opsional)"
                rows={3}
                value={form.specialInstructions}
                onChange={(e) => updateField("specialInstructions", e.target.value)}
                className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs tracking-[0.2em] uppercase bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Place Order"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="border border-border p-5 sm:p-6 h-fit">
            <h2 className="text-xs tracking-[0.2em] uppercase mb-6">Ringkasan Pesanan</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <div>
                    <span>{item.name}</span>
                    <span className="text-muted-foreground"> × {item.quantity}</span>
                    <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                  </div>
                  <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
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
                <span>{selectedRate ? formatPrice(shippingCost) : <span className="text-muted-foreground text-xs">—</span>}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-heading">
                <span className="text-xs tracking-[0.2em] uppercase">Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

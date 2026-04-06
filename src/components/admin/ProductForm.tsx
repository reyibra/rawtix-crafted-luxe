import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, Star, GripVertical } from "lucide-react";

interface ImageData {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  status: "active" | "sold_out" | "preorder" | "draft";
  preorderEstimatedDate: string;
  featured: boolean;
  sortOrder: number;
  variants: { size: string; stock: number; sku?: string }[];
  imageUrl?: string;
  imageUrls?: ImageData[];
}

interface Props {
  initialData?: ProductFormData;
  categories: { id: string; name: string }[];
  onSubmit: (data: ProductFormData) => void;
  isSubmitting: boolean;
  error?: string;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductForm({ initialData, categories, onSubmit, isSubmitting, error }: Props) {
  const [form, setForm] = useState<ProductFormData>(
    initialData ?? {
      name: "",
      slug: "",
      description: "",
      price: 0,
      categoryId: "",
      status: "draft",
      preorderEstimatedDate: "",
      featured: false,
      sortOrder: 0,
      variants: [{ size: "M", stock: 0 }],
      imageUrl: "",
      imageUrls: [],
    }
  );
  const [uploading, setUploading] = useState(false);

  const update = useCallback(
    <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const images = form.imageUrls && form.imageUrls.length > 0
    ? form.imageUrls
    : form.imageUrl
      ? [{ url: form.imageUrl, isPrimary: true, sortOrder: 0 }]
      : [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        newImages.push({
          url: urlData.publicUrl,
          isPrimary: newImages.length === 0,
          sortOrder: newImages.length,
        });
      }
    }

    update("imageUrls", newImages);
    update("imageUrl", "");
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    update("imageUrls", newImages.map((img, i) => ({ ...img, sortOrder: i })));
    if (newImages.length === 0) update("imageUrl", "");
  };

  const setPrimary = (idx: number) => {
    const newImages = images.map((img, i) => ({ ...img, isPrimary: i === idx }));
    update("imageUrls", newImages);
  };

  const addVariant = () => {
    update("variants", [...form.variants, { size: "", stock: 0, sku: "" }]);
  };

  const removeVariant = (idx: number) => {
    update("variants", form.variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, key: string, value: string | number) => {
    const newVariants = [...form.variants];
    newVariants[idx] = { ...newVariants[idx], [key]: value };
    update("variants", newVariants);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...form };
    if (images.length > 0) {
      submitData.imageUrls = images;
      submitData.imageUrl = "";
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs p-3">{error}</div>
      )}

      {/* Images */}
      <div className="border border-border p-4">
        <label className="block text-xs tracking-wider uppercase text-muted-foreground mb-2">Gambar Produk</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img.url} alt="Product" className={`w-24 h-24 sm:w-32 sm:h-32 object-cover border ${img.isPrimary ? "border-foreground" : "border-border"}`} />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setPrimary(idx)}
                  className={`p-1 ${img.isPrimary ? "text-yellow-400" : "text-foreground hover:text-yellow-400"}`}
                  title="Set as primary"
                >
                  <Star className="w-4 h-4" fill={img.isPrimary ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1 text-foreground hover:text-destructive"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-[8px] bg-foreground text-background px-1 py-0.5 tracking-wider uppercase">
                  Primary
                </span>
              )}
            </div>
          ))}
          <label className="flex flex-col items-center justify-center w-24 h-24 sm:w-32 sm:h-32 border border-dashed border-border cursor-pointer hover:border-foreground/30 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground mt-1">{uploading ? "Uploading..." : "Upload"}</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        <p className="text-[10px] text-muted-foreground">Klik ★ untuk set gambar utama. Max 5MB per file.</p>
      </div>

      {/* Name + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nama Produk">
          <input
            required
            value={form.name}
            onChange={(e) => {
              update("name", e.target.value);
              if (!initialData) update("slug", slugify(e.target.value));
            }}
            className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground"
          />
        </Field>
        <Field label="Slug">
          <input
            required
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground"
          />
        </Field>
      </div>

      {/* Description */}
      <Field label="Deskripsi">
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground resize-none"
        />
      </Field>

      {/* Price + Category + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Harga (Rp)">
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={(e) => update("price", parseInt(e.target.value) || 0)}
            className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground"
          />
        </Field>
        <Field label="Kategori">
          <select
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground"
          >
            <option value="">Tanpa Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as ProductFormData["status"])}
            className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold_out">Sold Out</option>
            <option value="preorder">Preorder</option>
          </select>
        </Field>
      </div>

      {/* Preorder date */}
      {form.status === "preorder" && (
        <Field label="Estimasi Preorder">
          <input
            type="date"
            value={form.preorderEstimatedDate}
            onChange={(e) => update("preorderEstimatedDate", e.target.value)}
            className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground"
          />
        </Field>
      )}

      {/* Featured + Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Featured">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="accent-foreground"
            />
            <span className="text-sm text-foreground">Tampilkan di homepage</span>
          </label>
        </Field>
        <Field label="Sort Order">
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => update("sortOrder", parseInt(e.target.value) || 0)}
            className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground"
          />
        </Field>
      </div>

      {/* Variants */}
      <div className="border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs tracking-wider uppercase text-muted-foreground">Varian / Ukuran</label>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider uppercase text-muted-foreground border border-border hover:text-foreground"
          >
            <Plus className="w-3 h-3" /> Tambah
          </button>
        </div>

        <div className="space-y-2">
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 items-center">
              <input
                value={v.size}
                onChange={(e) => updateVariant(i, "size", e.target.value)}
                placeholder="Size"
                className="bg-background border border-border px-2 py-1.5 text-sm text-foreground"
              />
              <input
                type="number"
                min={0}
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                placeholder="Stok"
                className="bg-background border border-border px-2 py-1.5 text-sm text-foreground"
              />
              <input
                value={v.sku || ""}
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
                placeholder="SKU (opsional)"
                className="bg-background border border-border px-2 py-1.5 text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="p-1.5 text-muted-foreground hover:text-destructive justify-self-start"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !form.name || !form.slug}
        className="w-full py-2.5 text-xs tracking-[0.2em] uppercase bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Menyimpan..." : initialData ? "Update Produk" : "Buat Produk"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-wider uppercase text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

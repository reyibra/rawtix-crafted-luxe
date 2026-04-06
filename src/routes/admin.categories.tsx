import { createFileRoute } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from "@/utils/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface CategoryForm {
  name: string;
  slug: string;
  sortOrder: number;
}

function AdminCategoriesPage() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>({ name: "", slug: "", sortOrder: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getAdminCategories({ data: { token: token! } }),
    enabled: !!token,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] });

  const createMutation = useMutation({
    mutationFn: () => createCategory({ data: { token: token!, ...form } }),
    onSuccess: () => { invalidate(); setShowAdd(false); setForm({ name: "", slug: "", sortOrder: 0 }); },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateCategory({ data: { token: token!, id: editId!, ...form } }),
    onSuccess: () => { invalidate(); setEditId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { token: token!, id } }),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const startEdit = (cat: { id: string; name: string; slug: string; sort_order: number }) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, sortOrder: cat.sort_order });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground">Kategori</h1>
        {!showAdd && (
          <button
            onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: "", slug: "", sortOrder: 0 }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-wider uppercase bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <CategoryInlineForm
          form={form}
          setForm={setForm}
          onSave={() => createMutation.mutate()}
          onCancel={() => setShowAdd(false)}
          isLoading={createMutation.isPending}
          error={createMutation.error?.message}
        />
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Memuat...</div>
      ) : !data || data.categories.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8 border border-border">Belum ada kategori.</div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {data.categories.map((cat) =>
            editId === cat.id ? (
              <CategoryInlineForm
                key={cat.id}
                form={form}
                setForm={setForm}
                onSave={() => updateMutation.mutate()}
                onCancel={() => setEditId(null)}
                isLoading={updateMutation.isPending}
                error={updateMutation.error?.message}
              />
            ) : (
              <div key={cat.id} className="flex items-center justify-between px-3 py-2.5">
                <div>
                  <p className="text-sm text-foreground">{cat.name}</p>
                  <p className="text-[10px] text-muted-foreground">/{cat.slug} · Order: {cat.sort_order}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(cat)} className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {deleteId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(cat.id)}
                        disabled={deleteMutation.isPending}
                        className="px-2 py-1 text-[10px] bg-red-600 text-white"
                      >
                        Ya
                      </button>
                      <button onClick={() => setDeleteId(null)} className="px-2 py-1 text-[10px] border border-border text-muted-foreground">
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function CategoryInlineForm({
  form,
  setForm,
  onSave,
  onCancel,
  isLoading,
  error,
}: {
  form: CategoryForm;
  setForm: (f: CategoryForm) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
}) {
  return (
    <div className="p-3 bg-card border border-border space-y-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-3 gap-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
          placeholder="Nama"
          className="bg-background border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="slug"
          className="bg-background border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
          placeholder="Order"
          className="bg-background border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={isLoading || !form.name || !form.slug}
          className="flex items-center gap-1 px-3 py-1 text-[10px] tracking-wider uppercase bg-foreground text-background disabled:opacity-50"
        >
          <Check className="w-3 h-3" /> Simpan
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 text-[10px] tracking-wider uppercase text-muted-foreground border border-border"
        >
          <X className="w-3 h-3" /> Batal
        </button>
      </div>
    </div>
  );
}

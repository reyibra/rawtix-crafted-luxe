import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface CategoryDropdownProps {
  open: boolean;
  onClose: () => void;
}

async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export function CategoryDropdown({ open, onClose }: CategoryDropdownProps) {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-[57px] left-0 right-0 z-40 bg-background border-b border-border animate-in slide-in-from-top-2 duration-200">
        <nav className="px-6 py-8 md:px-10">
          <ul className="space-y-4">
            <li>
              <Link
                to="/shop"
                onClick={onClose}
                className="font-heading text-sm tracking-[0.25em] uppercase text-foreground hover:text-muted-foreground transition-colors"
              >
                All Products
              </Link>
            </li>
            {categories?.map((cat) => (
              <li key={cat.id}>
                <Link
                  to="/shop/$category"
                  params={{ category: cat.slug }}
                  onClick={onClose}
                  className="font-heading text-sm tracking-[0.25em] uppercase text-foreground hover:text-muted-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

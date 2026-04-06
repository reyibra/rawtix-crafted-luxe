import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Sun, Moon } from "lucide-react";
import { CategoryDropdown } from "./CategoryDropdown";
import { useCart } from "@/hooks/useCart";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
  const [shopOpen, setShopOpen] = useState(false);
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 md:px-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShopOpen(!shopOpen)}
              className="font-heading text-xs tracking-[0.3em] uppercase text-foreground hover:text-muted-foreground transition-colors"
            >
              Shop
            </button>
            <button
              onClick={toggleTheme}
              className="text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-heading text-base sm:text-lg tracking-[0.35em] uppercase font-bold text-foreground">
              RAWTIX
            </span>
          </Link>

          <Link
            to="/cart"
            className="relative text-foreground hover:text-muted-foreground transition-colors"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-foreground text-background text-[10px] font-medium flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      <CategoryDropdown open={shopOpen} onClose={() => setShopOpen(false)} />
    </>
  );
}

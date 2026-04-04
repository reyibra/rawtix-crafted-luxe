import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PolicyLayoutProps {
  title: string;
  children: ReactNode;
}

export function PolicyLayout({ title, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-[72px] px-6 md:px-10 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-xs tracking-[0.3em] uppercase mb-8">
            {title}
          </h1>
          <div className="prose-rawtix space-y-6 text-sm text-muted-foreground leading-relaxed">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

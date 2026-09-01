import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { DemoBanner } from "@/components/layout/demo-banner";
import { MobileNav } from "@/components/layout/mobile-nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AppShell({ children }: { children: ReactNode }) {
  const isDemo = !isSupabaseConfigured();
  return (
    <div className="min-h-screen bg-canvas">
      {isDemo ? <DemoBanner /> : null}
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
